import mongoose, { Schema } from "mongoose";

const MembershipSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    role: { type: String, enum: ["owner", "admin", "member"], default: "owner" }
}, { timestamps: true });

MembershipSchema.index({ userId: 1, businessId: 1 }, { unique: true });

export const Membership = mongoose.models.Membership || mongoose.model("Membership", MembershipSchema);
