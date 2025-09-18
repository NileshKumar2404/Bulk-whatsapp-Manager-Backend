// src/models/WhatsAppConnection.js
import mongoose, { Schema } from "mongoose";

const WhatsAppConnectionSchema = new Schema({
    businessId: {
        type: Schema.Types.ObjectId,
        ref: "Business",
        required: true,
        unique: true,
        index: true
    },
    provider: { type: String, enum: ["cloud"], default: "cloud" },

    // Meta IDs
    wabaId: { type: String, trim: true, required: true },
    phoneNumberId: { type: String, trim: true, required: true, unique: true, index: true },
    phoneNumber: { type: String, trim: true }, // E.164 for display

    // Store encrypted (AES-GCM). We'll encrypt/decrypt in controller.
    longLivedTokenEnc: { type: String, required: true },

    // Informational (optional)
    qualityRating: { type: String },
    limitTier: { type: Number },

    status: { type: String, enum: ["connected", "paused", "error"], default: "connected" },

    // Used for webhook GET verification
    webhookVerifyToken: { type: String, trim: true, required: true }
}, { timestamps: true });



export const WhatsAppConnection =
    mongoose.models.WhatsAppConnection || mongoose.model("WhatsAppConnection", WhatsAppConnectionSchema);
