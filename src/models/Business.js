import mongoose, { Schema } from "mongoose";

const BusinessSchema = new Schema({
    name: { type: String, required: true, trim: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    timezone: { type: String, default: "Asia/Kolkata" },
    country: { type: String, trim: true } // e.g. "IN"
}, { timestamps: true });

BusinessSchema.index({ ownerId: 1 });

export const Business = mongoose.models.Business || mongoose.model("Business", BusinessSchema);
