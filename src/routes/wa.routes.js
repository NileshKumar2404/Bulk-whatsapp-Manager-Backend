import express from 'express';
import { verifyOwner } from '../middleware/authMiddleware.js';

import {
    getEmbeddedSignupConfig,
    embeddedSignupCallback,
    manualConnect,
    getConnection,
    sendTestTemplateMessage
} from "../controllers/wa/controller.wa.js";
import { verifyWebhook, handleWebhook } from "../controllers/wa/webhook.wa.js";

const router = express.Router();

// Owner/admin-only endpoints
router.get("/connect/config", verifyOwner, getEmbeddedSignupConfig);
router.post("/connect/callback", verifyOwner, embeddedSignupCallback);
router.post("/connect/manual", verifyOwner, manualConnect);

router.get("/connection", verifyOwner, getConnection);
router.post("/send/test", verifyOwner, sendTestTemplateMessage);

// Public webhooks
router.get("/webhooks", verifyWebhook);
router.post("/webhooks", express.json({ type: "*/*" }), handleWebhook);

export default router;
