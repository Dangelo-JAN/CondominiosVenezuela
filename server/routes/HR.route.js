import express from 'express'
import { HandleAllHR, HandleDeleteHR, HandleHR, HandleUpdateHR, HandleHRMe, HandleUpdateMyProfile } from '../controllers/HR.controller.js'
import { VerifyhHRToken } from '../middlewares/Auth.middleware.js'
import { PermissionCheck } from '../middlewares/RoleAuth.middleware.js'

const router = express.Router()

router.get("/me", VerifyhHRToken, HandleHRMe)
router.patch("/update-me", VerifyhHRToken, HandleUpdateMyProfile)
router.get("/all", VerifyhHRToken, PermissionCheck("hrprofiles", "read"), HandleAllHR)
router.get("/:HRID", VerifyhHRToken, PermissionCheck("hrprofiles", "read"), HandleHR)
router.patch("/update-HR", VerifyhHRToken, PermissionCheck("hrprofiles", "update"), HandleUpdateHR)
router.delete("/delete-HR/:HRID", VerifyhHRToken, PermissionCheck("hrprofiles", "delete"), HandleDeleteHR)

export default router
