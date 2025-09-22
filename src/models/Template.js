import mongoose, { Schema } from "mongoose";

const templateSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },
        waName: { type: String, required: true }, // exact template name in WhatsApp Manager
        language: { type: String, default: "en_US" },
        category: { type: String, enum: ["marketing", "utility", "authentication"], required: true },
        components: { type: Array, default: [] }, // WhatsApp components payload (body/header/buttons vars)
        displayName: { type: String }, // friendly label for dashboard
    },
    { timestamps: true }
);

templateSchema.index({ userId: 1, waName: 1 }, { unique: true });

export const Template = mongoose.model("Template", templateSchema);
