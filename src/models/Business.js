import mongoose, { Schema } from "mongoose";

const BusinessSchema = new Schema(
    {
        businessName: { type: String, required: true, trim: true },
        phoneNo: { type: String, trim: true },
        whatsappNo: { type: String, trim: true },
        description: { type: String, trim: true },
        ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        category: { type: String, trim: true },
        timezone: { type: String, default: "Asia/Kolkata" },
        country: { type: String, trim: true },

        // WhatsApp Cloud API config
        waEnabled: { type: Boolean, default: false },
        waPhoneNumberId: { type: String, trim: true },  // REQUIRED when waEnabled=true
        waDefaultLanguage: { type: String, default: "en_US" },
        waAccessToken: { type: String, select: false }, // keep hidden by default
    },
    { timestamps: true }
);

BusinessSchema.pre("save", function (next) {
    if (this.waAccessToken) {
        this.waAccessToken = this.waAccessToken.trim().replace(/^Bearer\s+/i, "");
    }
    if (this.waPhoneNumberId) this.waPhoneNumberId = this.waPhoneNumberId.trim();
    next();
});

export const Business = mongoose.models.Business || mongoose.model("Business", BusinessSchema);
