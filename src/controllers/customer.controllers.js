// controllers/customer.controllers.js
import { Customer } from "../models/Customer.js";
import { Business } from "../models/Business.js";
import { Op } from 'sequelize';

export const addCustomer = async (req, res) => {
    const userId = req.user.id; // from your auth middleware
    const { name, phoneE164, tags, consentAt, businessId } = req.body;

    if (!phoneE164 || !/^\+\d{8,15}$/.test(phoneE164)) {
        return res.status(400).json({ error: "phoneE164 must be in E.164 format like +91xxxxxxxxxx" });
    }
    if (!businessId) return res.status(400).json({ error: "businessId is required" });

    if (!businessId) {
        return res.status(400).json({ error: "businessId is required" });
    }

    try {
        // Verify that the business belongs to the user
        const business = await Business.findOne({
            where: { id: businessId, ownerId: userId }
        });

        if (!business) {
            return res.status(404).json({ error: "Business not found or you don't have permission to add customers to this business" });
        }

        const [doc, created] = await Customer.findOrCreate({
            where: { businessId, phoneE164 },
            defaults: { userId, name, tags: tags || [], consentAt: consentAt || new Date() }
        });

        if (!created) {
            // Update existing customer
            doc.name = name || doc.name;
            doc.tags = tags || doc.tags;
            doc.consentAt = consentAt || doc.consentAt;
            await doc.save();
        }

        res.status(201).json(doc);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
};

export const listCustomers = async (req, res) => {
    const userId = req.user.id;
    const { tag, businessId } = req.query;
    
    let q = { userId };
    
    // If businessId is provided, filter by business
    if (businessId) {
        // Verify that the business belongs to the user
        const business = await Business.findOne({
            where: { id: businessId, ownerId: userId }
        });
        
        if (!business) {
            return res.status(404).json({ error: "Business not found or you don't have permission to view customers for this business" });
        }
        
        q.businessId = businessId;
    }
    
    if (tag) q.tags = { [Op.contains]: [tag] };
    
    const docs = await Customer.findAll({
        where: q,
        include: [{
            model: Business,
            as: 'business',
            attributes: ['id', 'businessName', 'category']
        }],
        order: [['createdAt', 'DESC']],
        limit: 200
    });
    res.json(docs);
};

export const updateCustomer = async (req, res) => {
    const userId = req.user.id;
    const customerId = req.params.id;
    const { name, phoneE164, tags, businessId } = req.body;

    if (!phoneE164 || !/^\+\d{8,15}$/.test(phoneE164)) {
        return res.status(400).json({ error: "phoneE164 must be in E.164 format like +91xxxxxxxxxx" });
    }

    try {
        const customer = await Customer.findOne({
            where: { id: customerId, userId },
            include: [{
                model: Business,
                as: 'business',
                attributes: ['id', 'businessName']
            }]
        });

        if (!customer) {
            return res.status(404).json({ error: "Customer not found" });
        }

        // If businessId is provided, verify the business belongs to the user
        if (businessId && businessId !== customer.businessId) {
            const business = await Business.findOne({
                where: { id: businessId, ownerId: userId }
            });
            
            if (!business) {
                return res.status(404).json({ error: "Business not found or you don't have permission to move customer to this business" });
            }
        }

        await customer.update({
            name: name || customer.name,
            phoneE164: phoneE164,
            tags: tags || customer.tags,
            businessId: businessId || customer.businessId
        });

        res.json(customer);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
};

export const deleteCustomer = async (req, res) => {
    const userId = req.user.id;
    const customerId = req.params.id;

    try {
        const customer = await Customer.findOne({
            where: { id: customerId, userId },
            include: [{
                model: Business,
                as: 'business',
                attributes: ['id', 'businessName']
            }]
        });

        if (!customer) {
            return res.status(404).json({ error: "Customer not found" });
        }

        await customer.destroy();
        res.json({ message: "Customer deleted successfully" });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
};