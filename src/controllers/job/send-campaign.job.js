import { agenda } from "./agenda.js";

import { Customer } from "../../models/Customer.js";
import { Template } from "../../models/Template.js";
import { MessageLog } from "../../models/MessageLog.js";
import { sendTemplateMessage } from "../service/whatsapp.service.js";
import { Campaign } from "../../models/Campaign.js";

agenda.define("send-campaign", async (job) => {
    const { campaignId } = job.attrs.data;
    const campaign = await Campaign.findById(campaignId);
    if (!campaign || campaign.status !== "scheduled") return;

    campaign.status = "running";
    await campaign.save();

    const tpl = await Template.findById(campaign.templateId);
    if (!tpl) {
        campaign.status = "failed";
        await campaign.save();
        return;
    }

    const q = { userId: campaign.userId };
    if (campaign.filters?.tags?.length) q.tags = { $in: campaign.filters.tags };

    const cursor = Customer.find(q).cursor();
    let total = 0, sent = 0, failed = 0;

    for await (const cust of cursor) {
        total++;
        try {
            // idempotency: ensure one log per campaign-customer
            await MessageLog.updateOne(
                { campaignId, customerId: cust._id },
                { $setOnInsert: { to: cust.phoneE164, status: "queued" } },
                { upsert: true }
            );

            const resp = await sendTemplateMessage({
                to: cust.phoneE164,
                templateName: tpl.waName,
                language: tpl.language,
                components: tpl.components
            });

            const waMessageId = resp?.data?.messages?.[0]?.id;
            await MessageLog.updateOne(
                { campaignId, customerId: cust._id },
                { $set: { waMessageId, status: "sent" } }
            );
            sent++;
        } catch (e) {
            await MessageLog.updateOne(
                { campaignId, customerId: cust._id },
                { $set: { status: "failed", error: e.response?.data || String(e) } }
            );
            failed++;
        }

        // gentle throttle to protect WABA health
        await new Promise((r) => setTimeout(r, 150));
    }

    campaign.status = "done";
    campaign.stats = { ...campaign.stats, total, sent, failed };
    await campaign.save();
});

// Helper to schedule a job
export async function scheduleCampaign(campaign) {
    await agenda.start();
    await agenda.schedule(new Date(campaign.scheduledAt), "send-campaign", { campaignId: campaign._id });
}
