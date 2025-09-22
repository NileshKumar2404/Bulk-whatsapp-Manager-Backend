import mongoose, { Schema } from "mongoose";

const campaignSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },
        templateId: { type: Schema.Types.ObjectId, ref: "Template", required: true },
        filters: { tags: [String] }, // simple audience filter: by tags
        scheduledAt: { type: Date, required: true },
        status: { type: String, enum: ["scheduled", "running", "done", "failed", "cancelled"], default: "scheduled", index: true },
        stats: {
            total: { type: Number, default: 0 },
            sent: { type: Number, default: 0 },
            delivered: { type: Number, default: 0 },
            read: { type: Number, default: 0 },
            failed: { type: Number, default: 0 },
        }
    },
    { timestamps: true }
);

export const Campaign = mongoose.model("Campaign", campaignSchema);
