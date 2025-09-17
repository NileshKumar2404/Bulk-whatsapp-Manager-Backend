import mongoose, { Schema } from "mongoose";

const ConsentSchema = new Schema({
    status: { type: String, enum: ["opted_in", "opted_out", "unknown"], default: "opted_in" },
    source: { type: String, trim: true },           // website_form / csv_upload / offline / user_reply_stop etc.
    timestamp: { type: Date }
}, { _id: false });

const ContactSchema = new Schema({
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    waNumber: {
        type: String, required: true, trim: true, // E.164 (e.g., +919876543210)
        match: [/^\+[1-9]\d{6,14}$/, "waNumber must be E.164 format"]
    },
    name: { type: String, trim: true },
    tags: { type: [String], index: true, default: [] },
    fields: { type: Schema.Types.Mixed },           // custom fields map
    consent: { type: ConsentSchema, default: () => ({ status: "opted_in" }) },
    status: { type: String, enum: ["active", "bounced", "blocked"], default: "active" }
}, { timestamps: true });

ContactSchema.index({ businessId: 1, waNumber: 1 }, { unique: true });

export const Contact = mongoose.models.Contact || mongoose.model("Contact", ContactSchema);
