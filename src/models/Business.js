import mongoose, { Schema } from "mongoose";

const BusinessSchema = new Schema({
    businessName: { type: String, required: true, trim: true },
    phoneNo: { type: String, trim: true },
    whatsappNo: { type: String, trim: true },
    description: {type: String, trim: true},
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    category: { type: String, trim: true }, // e.g. "restaurant"
    timezone: { type: String, default: "Asia/Kolkata" },
    country: { type: String, trim: true } // e.g. "IN"
}, { timestamps: true });


export const Business = mongoose.models.Business || mongoose.model("Business", BusinessSchema);
