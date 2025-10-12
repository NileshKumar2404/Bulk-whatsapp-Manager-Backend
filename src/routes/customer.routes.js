import express from "express";
import { addCustomer, importCustomers, listCustomers } from "../controllers/customer.controllers.js";
import { verifyUser } from "../middleware/authMiddleware.js";
import { parseSingleFile, upload } from "../middleware/upload.middleware.js";


export const customerRouter = express.Router();

customerRouter.post("/", verifyUser, addCustomer);
customerRouter.get("/", verifyUser, listCustomers);
customerRouter.post(
    "/upload",
    verifyUser,
    parseSingleFile,          // form-data key: file
    importCustomers
);
