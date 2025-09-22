import express from "express";
import { addTemplate, listTemplates } from "../controllers/template.controllers.js";
import { verifyUser } from "../middleware/authMiddleware.js";

export const templateRouter = express.Router();
templateRouter.post("/", verifyUser, addTemplate);
templateRouter.get("/", verifyUser, listTemplates);
