import mongoose, { Schema } from "mongoose";

const customerSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },
        name: { type: String, trim: true },
        phoneE164: { type: String, required: true, index: true }, // +9198...
        tags: [{ type: String, trim: true }],
        consentAt: { type: Date }, // store opt-in moment
    },
    { timestamps: true }
);

customerSchema.index({ userId: 1, phoneE164: 1 }, { unique: true });

export const Customer = mongoose.model("Customer", customerSchema);
