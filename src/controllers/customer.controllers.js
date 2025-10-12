import XLSX from "xlsx";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { Customer } from "../models/Customer.js";
import { Business } from "../models/Business.js";
import { sendWATemplate, buildTemplateComponentsFromRow } from "./wa/wa.js";

function toE164(phoneRaw, defaultCountry = "IN") {
    if (!phoneRaw) return null;
    const pn = parsePhoneNumberFromString(String(phoneRaw), defaultCountry);
    return pn?.isValid() ? pn.number : null;
}

export const addCustomer = async (req, res) => {
    const userId = req.user._id;
    const { name, businessId, phoneE164, tags, consentAt } = req.body;

    if (!phoneE164 || !/^\+\d{8,15}$/.test(phoneE164)) {
        return res.status(400).json({ error: "phoneE164 must be E.164 like +91xxxxxxxxxx" });
    }
    if (!businessId) return res.status(400).json({ error: "businessId is required" });

    try {
        const doc = await Customer.findOneAndUpdate(
            { userId, businessId, phoneE164 },
            { $set: { name, tags: tags || [], consentAt: consentAt || new Date() } },
            { new: true, upsert: true }
        );
        res.status(201).json(doc);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
};

export const listCustomers = async (req, res) => {
    const userId = req.user._id;
    const { tag, businessId } = req.query;
    const q = { userId };
    if (tag) q.tags = tag;
    const docs = await Customer.find(q).sort({ createdAt: -1 }).limit(200);
    res.json(docs);
};

/**
 * Upload CSV/XLSX:
 *  Required form-data:
 *   - file: File (key EXACTLY "file")
 *   - businessId: ObjectId
 *  Optional:
 *   - defaultCountry: "IN"
 *   - send: "true" | "false" (default "true")
 *   - templateName: required if send=true
 *   - templateLanguage: default "en_US"
 *   - headerType: "none" | "text" | "media"
 */
export const importCustomers = async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            businessId,
            defaultCountry = "IN",
            send = "true",
            templateName,
            templateLanguage = "en_US",
            headerType = "none",
        } = req.body;

        if (!businessId) return res.status(400).json({ ok: false, message: "businessId required" });
        if (!req.file) return res.status(400).json({ ok: false, message: "file required (form-data key: file)" });

        // Fetch business with token (select: false)
        const biz = await Business.findById(businessId).select("+waAccessToken").lean();
        if (!biz) return res.status(404).json({ ok: false, message: "business not found" });
        if (!biz.waEnabled) return res.status(400).json({ ok: false, message: "WhatsApp not enabled for this business" });

        // Parse sheet
        const wb = XLSX.read(req.file.buffer, { type: "buffer" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

        let imported = 0, skipped = 0;
        const total = rows.length;
        const results = [];

        for (const row of rows) {
            const entries = Object.fromEntries(Object.entries(row).map(([k, v]) => [String(k).trim(), v]));
            const name = entries.name || entries.Name || entries.customer || entries.Customer || "";

            const phoneRaw =
                entries.phone || entries.Phone || entries.mobile || entries.Mobile ||
                entries["phone no"] || entries["Phone No"] || entries["Phone Number"] || entries["phone number"];

            const phoneE164 = toE164(phoneRaw, defaultCountry);
            if (!phoneE164) {
                skipped++;
                results.push({ phoneRaw, status: "skipped", reason: "invalid phone" });
                continue;
            }

            // Upsert contact
            await Customer.updateOne(
                { userId, businessId, phoneE164 },
                { $set: { name: name || undefined, userId, businessId, consentAt: new Date() } },
                { upsert: true }
            );
            imported++;

            // Send message?
            if (String(send) === "true" && templateName) {
                try {
                    const components = buildTemplateComponentsFromRow(entries, { headerType });
                    const data = await sendWATemplate({
                        phoneNumberId: biz.waPhoneNumberId || process.env.WA_PHONE_NUMBER_ID,
                        accessToken: biz.waAccessToken || process.env.WHATSAPP_TOKEN,
                        to: phoneE164,
                        templateName,
                        language: templateLanguage,
                        components,
                    });
                    results.push({ phone: phoneE164, status: "sent", waId: data?.messages?.[0]?.id || null });
                } catch (err) {
                    results.push({ phone: phoneE164, status: "send_failed", error: err?.response?.data || err.message });
                }
            } else {
                results.push({ phone: phoneE164, status: "imported_only" });
            }
        }

        return res.json({ ok: true, total, imported, skipped, results });
    } catch (e) {
        console.error("import error:", e?.response?.data || e);
        res.status(500).json({ ok: false, message: e.message });
    }
};