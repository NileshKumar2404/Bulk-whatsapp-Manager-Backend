import express from 'express'
import { verifyUser } from '../middleware/authMiddleware.js'
import { createBusiness, deleteMyBusiness, getMyBusiness, listBusinesses_admin, transferOwnerShip_admin, updateMyBusiness } from '../controllers/business/business.js'

const router = express.Router()

router.route("/create-business").post(verifyUser, createBusiness)
router.route("/get-my-business").get(verifyUser, getMyBusiness)
router.route("/update-business/:businessId").patch(verifyUser, updateMyBusiness)
router.route("/delete-business/:businessId").delete(verifyUser, deleteMyBusiness)
router.route("/list-business").get(verifyUser, listBusinesses_admin)
router.route("/transfer-ownership/:businessId").get(verifyUser, transferOwnerShip_admin)

export default router