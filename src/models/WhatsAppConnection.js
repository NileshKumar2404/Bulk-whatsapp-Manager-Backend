import mongoose, { Schema } from "mongoose";

const WhatsAppConnectionSchema = new Schema({
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, unique: true, index: true },
    provider: { type: String, enum: ["cloud"], default: "cloud" },

    wabaId: { type: String, trim: true },           // Meta Business Account (WABA)
    phoneNumberId: { type: String, trim: true },    // Cloud API phone number id
    phoneNumber: { type: String, trim: true },      // E.164 human-readable

    longLivedTokenEnc: { type: String, required: true }, // encrypted at rest
    qualityRating: { type: String },                // informational
    limitTier: { type: Number },                    // messaging limit tier

    status: { type: String, enum: ["connected", "paused", "error"], default: "connected" },
    webhookVerifyToken: { type: String, trim: true } // used to verify hub.challenge
}, { timestamps: true });

WhatsAppConnectionSchema.index({ businessId: 1 }, { unique: true });

export const WhatsAppConnection = mongoose.models.WhatsAppConnection
    || mongoose.model("WhatsAppConnection", WhatsAppConnectionSchema);
