import express from "express";
import { createCampaign, listCampaigns } from "../controllers/campaign.controllers.js";

import { verifyUser } from "../middleware/authMiddleware.js";

export const campaignRouter = express.Router();
campaignRouter.post("/", verifyUser, createCampaign);
campaignRouter.get("/", verifyUser, listCampaigns);
