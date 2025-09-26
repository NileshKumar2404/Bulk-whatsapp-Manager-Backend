import axios from "axios";

const GRAPH = `https://graph.facebook.com/${process.env.META_GRAPH_VERSION}`;

/** List templates from Meta, optionally filtered by name */
export async function getTemplatesFromMeta({ name, limit = 50 } = {}) {
    const params = {
        access_token: process.env.WHATSAPP_TOKEN,
        fields: "name,language,status,category,components",
        limit
    };
    if (name) params.name = name;

    const url = `${GRAPH}/${process.env.WABA_ID}/message_templates`;
    const { data } = await axios.get(url, { params });
    return data.data || [];
}

/** Create a template at Meta (returns created template meta or ‘submitted’) */
export async function createMetaTemplate({ name, category, language, components }) {
    const url = `${GRAPH}/${process.env.WABA_ID}/message_templates`;
    // Meta expects UPPERCASE for component.type and BUTTONS nesting
    const normalized = (components || []).map(c => ({
        ...c,
        type: String(c.type || "").toUpperCase(),
        // if buttons present, ensure each button.type etc are correct (QUICK_REPLY/URL)
    }));

    const payload = {
        name,
        category: String(category || "").toUpperCase(), // MARKETING/UTILITY/AUTHENTICATION
        language,
        components: normalized
    };

    const { data } = await axios.post(url, payload, {
        headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` }
    });
    return data; // { id, status, ... } or success true
}

/** Ensure template exists in given language and is APPROVED; returns the matching row */
export async function assertTemplateApproved(name, language) {
    const rows = await getTemplatesFromMeta({ name });
    if (!rows.length) {
        const e = new Error(`Template "${name}" does not exist on your WABA`);
        e.status = 400;
        throw e;
    }
    const match = rows.find(r => r.name === name && r.language === language);
    if (!match) {
        const langs = rows.filter(r => r.name === name)
            .map(r => `${r.language}:${r.status}`)
            .join(", ");
        const e = new Error(`"${name}" missing language "${language}". Available: ${langs || "none"}`);
        e.status = 400;
        throw e;
    }
    if (match.status !== "APPROVED") {
        const e = new Error(`"${name}" (${language}) not APPROVED yet (status=${match.status})`);
        e.status = 400;
        throw e;
    }
    return match;
}
