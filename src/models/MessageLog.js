import mongoose, { Schema } from "mongoose";

const logSchema = new Schema(
    {
        campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", index: true },
        customerId: { type: Schema.Types.ObjectId, ref: "Customer", index: true },
        to: { type: String, required: true },  // phone
        waMessageId: { type: String, index: true },
        status: { type: String, enum: ["queued", "sent", "delivered", "read", "failed"], index: true },
        error: {}, // store raw error for debugging
    },
    { timestamps: true }
);

// idempotency: avoid duplicate logs for same campaign-customer
logSchema.index({ campaignId: 1, customerId: 1 }, { unique: true });

export const MessageLog = mongoose.model("MessageLog", logSchema);
