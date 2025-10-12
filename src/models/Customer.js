// models/Customer.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';      // <-- add this

const customerSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },
        businessId: { type: Schema.Types.ObjectId, ref: "Business", index: true, required: true },
        name: { type: String, trim: true },
        phoneE164: { type: String, required: true, index: true }, // +9198...
        tags: [{ type: String, trim: true }],
        consentAt: { type: Date }, // store opt-in moment
    },
    { timestamps: true }
);


export { Customer };
