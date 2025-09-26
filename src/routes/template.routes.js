import express from "express";
import { verifyUser } from "../middleware/authMiddleware.js";
import {
    createTemplateAtMeta,
    listMetaTemplates,
    saveVerifiedTemplate,
    listLocalTemplates,
    listMetaTemplatesAll
} from "../controllers/template.controllers.js";

export const templateRouter = express.Router();

// Meta operations
templateRouter.post("/meta", verifyUser, createTemplateAtMeta);
templateRouter.get("/meta", verifyUser, listMetaTemplates);

// Local (DB) operations
templateRouter.post("/", verifyUser, saveVerifiedTemplate); // verify @ Meta then save
templateRouter.get("/", verifyUser, listLocalTemplates);
templateRouter.get("/meta/all", verifyUser, listMetaTemplatesAll);
