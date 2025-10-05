// controllers/campaign.controllers.js
import { Campaign } from "../models/Campaign.js";
import { Template } from "../models/Template.js";
import { Business } from "../models/Business.js";
import { Customer } from "../models/Customer.js";
import { MessageLog } from "../models/MessageLog.js";
import { scheduleCampaign } from "../controllers/job/send-campaign.job.js";
import { sendTemplateMessage } from "../controllers/service/whatsapp.service.js";

export const createCampaign = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, businessId, templateId, customerIds, scheduleType, scheduledAt, description } = req.body;

        // Validation
        if (!name || !businessId || !templateId || !customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
            return res.status(400).json({ ok: false, message: "name, businessId, templateId, and customerIds are required" });
        }

        // Verify business ownership
        const business = await Business.findOne({ where: { id: businessId, ownerId: userId } });
        if (!business) {
            return res.status(400).json({ ok: false, message: "Business not found or not owned by user" });
        }

        // Verify template ownership
        const template = await Template.findOne({ where: { id: templateId, userId } });
        if (!template) {
            return res.status(400).json({ ok: false, message: "Template not found or not owned by user" });
        }

        // Verify customers belong to the business
        const customers = await Customer.findAll({ 
            where: { 
                id: customerIds, 
                businessId: businessId,
                userId: userId 
            } 
        });
        
        if (customers.length !== customerIds.length) {
            return res.status(400).json({ ok: false, message: "Some customers not found or don't belong to the selected business" });
        }

        // Handle scheduling
        let finalScheduledAt = null;
        let status = "draft";

        if (scheduleType === "scheduled") {
            if (!scheduledAt) {
                return res.status(400).json({ ok: false, message: "scheduledAt is required for scheduled campaigns" });
            }
            
            const when = new Date(scheduledAt);
            if (isNaN(when.getTime()) || when < new Date(Date.now() + 30 * 1000)) {
                return res.status(400).json({ ok: false, message: "scheduledAt must be valid and at least 30s in future" });
            }
            finalScheduledAt = when;
            status = "scheduled";
        } else if (scheduleType === "immediate") {
            finalScheduledAt = new Date();
            status = "running";
        }

        // Create campaign
        const campaign = await Campaign.create({
            userId,
            name,
            businessId,
            templateId,
            customerIds: JSON.stringify(customerIds),
            scheduledAt: finalScheduledAt,
            description: description || null,
            status: status,
            recipientCount: customerIds.length
        });

        // Schedule the campaign if needed
        if (status === "scheduled") {
            await scheduleCampaign(campaign);
        } else if (status === "running") {
            // For immediate campaigns, you might want to start processing right away
            // This would depend on your job processing implementation
        }

        res.status(201).json(campaign);
    } catch (e) {
        console.error('Error creating campaign:', e);
        res.status(400).json({ ok: false, message: e.message });
    }
};

export const listCampaigns = async (req, res) => {
    try {
        const docs = await Campaign.findAll({
            where: { userId: req.user.id },
            include: [
                { model: Template, as: 'template' },
                { model: Business, as: 'business' }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(docs);
    } catch (e) {
        console.error('Error listing campaigns:', e);
        res.status(400).json({ ok: false, message: e.message });
    }
};

export const getCampaignById = async (req, res) => {
    try {
        const { id } = req.params;
        const campaign = await Campaign.findOne({
            where: { id, userId: req.user.id },
            include: [
                { model: Template, as: 'template' },
                { model: Business, as: 'business' }
            ]
        });

        if (!campaign) {
            return res.status(404).json({ ok: false, message: "Campaign not found" });
        }

        res.json(campaign);
    } catch (e) {
        console.error('Error getting campaign:', e);
        res.status(400).json({ ok: false, message: e.message });
    }
};

export const updateCampaign = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { name, businessId, templateId, customerIds, scheduleType, scheduledAt, description } = req.body;

        // Find campaign
        const campaign = await Campaign.findOne({ where: { id, userId } });
        if (!campaign) {
            return res.status(404).json({ ok: false, message: "Campaign not found" });
        }

        // Validation
        if (!name || !businessId || !templateId || !customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
            return res.status(400).json({ ok: false, message: "name, businessId, templateId, and customerIds are required" });
        }

        // Verify business ownership
        const business = await Business.findOne({ where: { id: businessId, ownerId: userId } });
        if (!business) {
            return res.status(400).json({ ok: false, message: "Business not found or not owned by user" });
        }

        // Verify template ownership
        const template = await Template.findOne({ where: { id: templateId, userId } });
        if (!template) {
            return res.status(400).json({ ok: false, message: "Template not found or not owned by user" });
        }

        // Verify customers belong to the business
        const customers = await Customer.findAll({ 
            where: { 
                id: customerIds, 
                businessId: businessId,
                userId: userId 
            } 
        });
        
        if (customers.length !== customerIds.length) {
            return res.status(400).json({ ok: false, message: "Some customers not found or don't belong to the selected business" });
        }

        // Handle scheduling
        let finalScheduledAt = campaign.scheduledAt;
        let status = campaign.status;

        if (scheduleType === "scheduled") {
            if (!scheduledAt) {
                return res.status(400).json({ ok: false, message: "scheduledAt is required for scheduled campaigns" });
            }
            
            const when = new Date(scheduledAt);
            if (isNaN(when.getTime()) || when < new Date(Date.now() + 30 * 1000)) {
                return res.status(400).json({ ok: false, message: "scheduledAt must be valid and at least 30s in future" });
            }
            finalScheduledAt = when;
            status = "scheduled";
        } else if (scheduleType === "immediate") {
            finalScheduledAt = new Date();
            status = "running";
        }

        // Update campaign
        await campaign.update({
            name,
            businessId,
            templateId,
            customerIds: JSON.stringify(customerIds),
            scheduledAt: finalScheduledAt,
            description: description || null,
            status: status,
            recipientCount: customerIds.length
        });

        // Reschedule if needed
        if (status === "scheduled") {
            await scheduleCampaign(campaign);
        }

        res.json(campaign);
    } catch (e) {
        console.error('Error updating campaign:', e);
        res.status(400).json({ ok: false, message: e.message });
    }
};

export const deleteCampaign = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const campaign = await Campaign.findOne({ where: { id, userId } });
        if (!campaign) {
            return res.status(404).json({ ok: false, message: "Campaign not found" });
        }

        await campaign.destroy();
        res.json({ ok: true, message: "Campaign deleted successfully" });
    } catch (e) {
        console.error('Error deleting campaign:', e);
        res.status(400).json({ ok: false, message: e.message });
    }
};

// Send campaign immediately
export const sendCampaign = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Find campaign
        const campaign = await Campaign.findOne({ 
            where: { id, userId },
            include: [
                { model: Template, as: 'template' },
                { model: Business, as: 'business' }
            ]
        });

        if (!campaign) {
            return res.status(404).json({ ok: false, message: "Campaign not found" });
        }

        // Allow sending any campaign regardless of status

        // Get customers for this campaign
        const customerIds = JSON.parse(campaign.customerIds);
        const customers = await Customer.findAll({
            where: {
                id: customerIds,
                businessId: campaign.businessId,
                userId: userId
            }
        });

        if (customers.length === 0) {
            return res.status(400).json({ ok: false, message: "No customers found for this campaign" });
        }

        // Update campaign status to running
        await campaign.update({ status: 'running' });

        let total = 0, sent = 0, failed = 0;

        // Send messages to each customer
        for (const customer of customers) {
            total++;
            try {
                // Create message log
                const [log, created] = await MessageLog.findOrCreate({
                    where: { campaignId: campaign.id, customerId: customer.id },
                    defaults: { to: customer.phoneE164, status: "queued" }
                });

                if (!created) {
                    await log.update({ status: "queued" });
                }

                // Send WhatsApp message
                const response = await sendTemplateMessage({
                    to: customer.phoneE164,
                    templateName: campaign.template.waName,
                    language: campaign.template.language,
                    components: campaign.template.components || []
                });

                const waMessageId = response?.messages?.[0]?.id;
                await log.update({ waMessageId, status: "sent" });
                sent++;

                // Add delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 150));

            } catch (error) {
                console.error(`Error sending message to ${customer.phoneE164}:`, error);
                
                // Update message log with error
                await MessageLog.update(
                    { status: "failed", error: error.data || error.message },
                    { where: { campaignId: campaign.id, customerId: customer.id } }
                );
                failed++;
            }
        }

        // Update campaign stats and status
        await campaign.update({
            status: 'completed',
            stats: {
                total,
                sent,
                failed,
                delivered: 0,
                read: 0
            }
        });

        res.json({ 
            ok: true, 
            message: "Campaign sent successfully", 
            stats: { total, sent, failed }
        });

    } catch (error) {
        console.error('Error sending campaign:', error);
        res.status(500).json({ ok: false, message: error.message });
    }
};