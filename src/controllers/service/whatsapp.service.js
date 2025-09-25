import axios from "axios";

const GRAPH = `https://graph.facebook.com/${process.env.META_GRAPH_VERSION}`;

// Basic E.164 sanity check
function isE164(phone) {
    return typeof phone === "string" && /^\+\d{8,15}$/.test(phone);
}

// Normalize payload: set default language, ensure components is array
function buildTemplatePayload({ to, templateName, language = "en_US", components = [] }) {
    return {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
            name: templateName,
            language: { code: language },
            ...(Array.isArray(components) && components.length ? { components } : {})
        }
    };
}

/**
 * Sends a template message via WhatsApp Cloud API.
 * Throws an Error with .status and .data if Meta returns non-2xx.
 */
export async function sendTemplateMessage({ to, templateName, language, components }) {
    if (!process.env.WA_PHONE_NUMBER_ID) throw new Error("WA_PHONE_NUMBER_ID not set");
    if (!process.env.WHATSAPP_TOKEN) throw new Error("WHATSAPP_TOKEN not set");

    if (!isE164(to)) {
        const err = new Error("Recipient must be in E.164 format, e.g. +91XXXXXXXXXX");
        err.status = 400;
        throw err;
    }
    if (!templateName) {
        const err = new Error("templateName is required (must match approved template exactly)");
        err.status = 400;
        throw err;
    }

    const url = `${GRAPH}/${process.env.WA_PHONE_NUMBER_ID}/messages`;
    const payload = buildTemplatePayload({ to, templateName, language, components });

    try {
        const r = await axios.post(url, payload, {
            headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` }
        });
        return r.data; // { messages: [ { id: ... } ] }
    } catch (e) {
        // Attach HTTP status/data to the error so the route can branch on it
        const out = new Error("Meta API error");
        out.status = e.response?.status || 500;
        out.data = e.response?.data;

        // Optionally log the raw error for server debugging
        console.error("[WA SEND ERROR]", {
            status: e.response?.status,
            data: e.response?.data,
        });

        throw out;
    }
}
