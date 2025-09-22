import { Campaign } from "../models/Campaign.js";
import { scheduleCampaign } from "../controllers/job/send-campaign.job.js";

export const createCampaign = async (req, res) => {
    const userId = req.user._id;
    const { templateId, scheduledAt, filters } = req.body;
    if (!templateId || !scheduledAt) return res.status(400).json({ error: "templateId and scheduledAt are required" });

    const campaign = await Campaign.create({
        userId, templateId, scheduledAt, filters: filters || { tags: [] }, status: "scheduled"
    });

    await scheduleCampaign(campaign);
    res.status(201).json(campaign);
};

export const listCampaigns = async (req, res) => {
    const userId = req.user._id;
    const docs = await Campaign.find({ userId }).populate("templateId").sort({ createdAt: -1 });
    res.json(docs);
};
