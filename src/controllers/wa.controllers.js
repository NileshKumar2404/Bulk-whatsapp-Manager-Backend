import { MessageLog } from "../models/MessageLog.js";

export const verifyWebhook = (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode === "subscribe" && token === process.env.WEBHOOK_VERIFY_TOKEN) {
        return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
};

export const receiveWebhook = async (req, res) => {
    try {
        const entry = req.body?.entry?.[0];
        const value = entry?.changes?.[0]?.value;

        // statuses (sent, delivered, read, failed)
        const statuses = value?.statuses;
        if (Array.isArray(statuses)) {
            for (const s of statuses) {
                // s.id is the waMessageId
                await MessageLog.findOneAndUpdate(
                    { waMessageId: s.id },
                    { $set: { status: s.status } },
                    { new: true }
                );
                // Optional: also roll-up Campaign.stats based on counts if you need realtime updates
            }
        }

        // inbound messages (optional): value.messages

        res.sendStatus(200);
    } catch (e) {
        console.error("webhook error:", e);
        res.sendStatus(200);
    }
};
