// routes/wa.webhook.js
import express from "express";

export const waWebhookRouter = express.Router();

// -- VERIFY (Meta calls this once when you save the webhook URL)
waWebhookRouter.get("/", (req, res) => {
    const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
});

// -- RECEIVE (delivery receipts + inbound messages)
waWebhookRouter.post("/", (req, res) => {
    try {
        const body = req.body;

        // WhatsApp events live under entry[].changes[].value
        for (const entry of body?.entry || []) {
            for (const change of entry?.changes || []) {
                if (change.field !== "messages") continue;

                const value = change.value;

                // Delivery receipts: sent, delivered, read, failed, deleted
                for (const st of value?.statuses || []) {
                    console.log("[WA STATUS]", {
                        waMessageId: st.id,               // wamid...
                        status: st.status,                // sent|delivered|read|failed|deleted
                        recipient: st.recipient_id,       // phone E.164 without '+'
                        timestamp: st.timestamp,
                        errors: st.errors,                // if failed
                    });
                }

                // Inbound messages (user replies)
                for (const msg of value?.messages || []) {
                    console.log("[WA INBOUND]", {
                        from: msg.from,                   // sender's phone
                        id: msg.id,                       // wamid...
                        type: msg.type,                   // text|image|...
                        text: msg.text?.body,
                    });
                }
            }
        }

        // ACK ASAP
        res.sendStatus(200);
    } catch (e) {
        console.error("WA webhook error:", e);
        res.sendStatus(200);
    }
});
