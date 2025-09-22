import axios from "axios";
const base = `https://graph.facebook.com/${process.env.META_GRAPH_VERSION}`;

export async function sendTemplateMessage({ to, templateName, language = "en_US", components = [] }) {
    const url = `${base}/${process.env.WA_PHONE_NUMBER_ID}/messages`;
    return axios.post(
        url,
        {
            messaging_product: "whatsapp",
            to,
            type: "template",
            template: { name: templateName, language: { code: language }, components }
        },
        { headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` } }
    );
}
