import axios from "axios";

export function graphBase() {
    const v = (process.env.META_GRAPH_VERSION || "v20.0").trim();
    return `https://graph.facebook.com/${v}`;
}
export function cleanToken(raw) {
    return String(raw || "").trim().replace(/^Bearer\s+/i, "");
}

/** Send a WhatsApp template message */
export async function sendWATemplate({
    phoneNumberId,       // REQUIRED: string
    accessToken,         // REQUIRED: string
    to,                  // "+91..."
    templateName,        // approved template name
    language = "en_US",
    components = [],     // optional components (header/body/buttons)
}) {
    const pnid = String(phoneNumberId || process.env.WA_PHONE_NUMBER_ID || "").trim();
    const token = cleanToken(accessToken || process.env.WHATSAPP_TOKEN);

    if (!pnid) throw new Error("WA phoneNumberId missing");
    if (!token || token.length < 60) throw new Error("WhatsApp access token missing/malformed");

    const url = `${graphBase()}/${pnid}/messages`;
    const payload = {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
            name: templateName,
            language: { code: language },
            ...(components?.length ? { components } : {}),
        },
    };
    const headers = { Authorization: `Bearer ${token}` };

    try {
        const { data } = await axios.post(url, payload, { headers });
        return data;
    } catch (err) {
        const meta = err?.response?.data || err.message;
        console.error("WA send error", {
            url,
            token_len: token.length,
            token_preview: token.slice(0, 6) + "..." + token.slice(-6),
            meta,
        });
        throw err;
    }
}

/** Build WA template components from a CSV row.
 * Supported columns (case-insensitive):
 *  - header_text  | header_media_url
 *  - body_1, body_2, body_3, ...
 *  - btn_url_1, btn_url_2
 * headerType: "none" | "text" | "media"
 */
export function buildTemplateComponentsFromRow(row, { headerType = "none" } = {}) {
    const read = (k) => row[k] ?? row[k?.toUpperCase()] ?? row[k?.toLowerCase()];
    const components = [];

    // Header
    if (headerType === "text") {
        const ht = read("header_text");
        if (ht) components.push({ type: "header", parameters: [{ type: "text", text: String(ht) }] });
    } else if (headerType === "media") {
        const link = read("header_media_url");
        if (link) components.push({ type: "header", parameters: [{ type: "image", image: { link: String(link) } }] });
    }

    // Body params
    const bodyParams = [];
    for (let i = 1; ; i++) {
        const val = read(`body_${i}`);
        if (val === undefined) break;
        bodyParams.push({ type: "text", text: String(val) });
    }
    if (bodyParams.length) components.push({ type: "body", parameters: bodyParams });

    // URL button dynamic parts
    for (let b = 1; b <= 2; b++) {
        const v = read(`btn_url_${b}`);
        if (v !== undefined) {
            components.push({
                type: "button",
                sub_type: "url",
                index: String(b - 1),
                parameters: [{ type: "text", text: String(v) }],
            });
        }
    }

    return components;
}
