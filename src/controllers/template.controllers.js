import { Template } from "../models/Template.js";
import { createMetaTemplate, getTemplatesFromMeta, assertTemplateApproved, listAllTemplates, listTemplatesPage } from "../controllers/service/meta.service.js";

/** Create a template at Meta (Graph). Does not save locally. */
export const createTemplateAtMeta = async (req, res) => {
    try {
        const { name, category, language, components } = req.body;
        if (!name || !category || !language) {
            return res.status(400).json({ ok: false, message: "name, category, language are required" });
        }
        const data = await createMetaTemplate({ name, category, language, components });
        return res.status(201).json({ ok: true, meta: data });
    } catch (e) {
        const status = e.response?.status || 400;
        return res.status(status).json({ ok: false, message: e.response?.data?.error?.message || e.message, details: e.response?.data });
    }
};

/** List templates from Meta */
export const listMetaTemplates = async (req, res) => {
    try {
        const rows = await getTemplatesFromMeta({ name: req.query.name });
        res.json({ ok: true, data: rows });
    } catch (e) {
        res.status(400).json({ ok: false, message: e.message });
    }
};

/** Verify template (exists+approved) then save it locally for this user */
export const saveVerifiedTemplate = async (req, res) => {
    try {
        const userId = req.user._id;
        const { waName, language, category, displayName } = req.body;
        if (!waName || !language || !category) return res.status(400).json({ ok: false, message: "waName, language, category required" });

        const meta = await assertTemplateApproved(waName, language);  // throws if not good
        const tpl = await Template.findOneAndUpdate(
            { userId, waName, language },
            { $set: { category: category.toLowerCase(), components: meta.components || [], displayName } },
            { new: true, upsert: true }
        );
        res.status(201).json(tpl);
    } catch (e) {
        res.status(e.status || 400).json({ ok: false, message: e.message });
    }
};

/** List local templates (your DB) */
export const listLocalTemplates = async (req, res) => {
    const docs = await Template.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(docs);
};

export const listMetaTemplatesPaged = async (req, res) => {
    try {
        const { after, limit } = req.query;
        const page = await listTemplatesPage({ after, limit: Number(limit) || 100 });
        res.json({ ok: true, ...page });
    } catch (e) {
        res.status(400).json({ ok: false, message: e.response?.data?.error?.message || e.message, details: e.response?.data });
    }
};

export const listMetaTemplatesAll = async (_req, res) => {
    try {
        const rows = await listAllTemplates();
        res.json({ ok: true, count: rows.length, data: rows });
    } catch (e) {
        res.status(400).json({ ok: false, message: e.response?.data?.error?.message || e.message, details: e.response?.data });
    }
};
