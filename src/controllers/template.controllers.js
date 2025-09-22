import { Template } from "../models/Template.js";

export const addTemplate = async (req, res) => {
    const userId = req.user._id;
    const { waName, language = "en_US", category, components = [], displayName } = req.body;
    if (!waName || !category) return res.status(400).json({ error: "waName and category are required" });

    try {
        const tpl = await Template.create({ userId, waName, language, category, components, displayName });
        res.status(201).json(tpl);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
};

export const listTemplates = async (req, res) => {
    const userId = req.user._id;
    const docs = await Template.find({ userId }).sort({ createdAt: -1 });
    res.json(docs);
};
