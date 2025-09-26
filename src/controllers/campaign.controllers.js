import { Campaign } from "../models/Campaign.js";
import { Template } from "../models/Template.js";
import { scheduleCampaign } from "../controllers/job/send-campaign.job.js";

export const createCampaign = async (req, res) => {
    try {
        const userId = req.user._id;
        const { templateId, scheduledAt, filters } = req.body;

        if (!templateId || !scheduledAt) return res.status(400).json({ ok: false, message: "templateId and scheduledAt required" });

        const tpl = await Template.findOne({ _id: templateId, userId });
        if (!tpl) return res.status(400).json({ ok: false, message: "Template not found for user" });

        const when = new Date(scheduledAt);
        if (isNaN(when.getTime()) || when < new Date(Date.now() + 30 * 1000)) {
            return res.status(400).json({ ok: false, message: "scheduledAt must be valid and at least 30s in future" });
        }

        const campaign = await Campaign.create({
            userId, templateId, scheduledAt: when, filters: filters || { tags: [] }, status: "scheduled"
        });

        await scheduleCampaign(campaign);
        res.status(201).json(campaign);
    } catch (e) {
        res.status(400).json({ ok: false, message: e.message });
    }
};

export const listCampaigns = async (req, res) => {
    const docs = await Campaign.find({ userId: req.user._id }).populate("templateId").sort({ createdAt: -1 });
    res.json(docs);
};
