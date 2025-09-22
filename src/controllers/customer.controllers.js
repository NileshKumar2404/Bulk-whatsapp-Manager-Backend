import { Customer } from "../models/Customer.js";

export const addCustomer = async (req, res) => {
    const userId = req.user._id; // from your auth middleware
    const { name, phoneE164, tags, consentAt } = req.body;

    if (!phoneE164 || !/^\+\d{8,15}$/.test(phoneE164)) {
        return res.status(400).json({ error: "phoneE164 must be in E.164 format like +91xxxxxxxxxx" });
    }

    try {
        const doc = await Customer.findOneAndUpdate(
            { userId, phoneE164 },
            { $set: { name, tags: tags || [], consentAt: consentAt || new Date() } },
            { new: true, upsert: true }
        );
        res.status(201).json(doc);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
};

export const listCustomers = async (req, res) => {
    const userId = req.user._id;
    const { tag } = req.query;
    const q = { userId };
    if (tag) q.tags = tag;
    const docs = await Customer.find(q).sort({ createdAt: -1 }).limit(200);
    res.json(docs);
};
