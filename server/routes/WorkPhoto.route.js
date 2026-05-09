import express from 'express'
import {
    HandleUploadWorkPhoto,
    HandleGetMyWorkPhotos,
    HandleDeleteMyWorkPhoto,
    HandleGetAllWorkPhotos,
    HandleGetEmployeeWorkPhotos,
    HandleReviewWorkPhoto,
    HandleDeleteWorkPhoto
} from '../controllers/WorkPhoto.controller.js'
import {
    VerifyEmployeeToken,
    VerifyhHRToken
} from '../middlewares/Auth.middleware.js'
import { PermissionCheck } from '../middlewares/RoleAuth.middleware.js'
import { uploadWorkPhotoMiddleware } from '../middlewares/WorkPhotoUpload.middleware.js'

const router = express.Router()

// ── Rutas Employee ────────────────────────────────────────────────────────
// Multer procesa el multipart/form-data, luego VerifyEmployeeToken decodifica el token
router.post("/upload", uploadWorkPhotoMiddleware.single("photo"), VerifyEmployeeToken, HandleUploadWorkPhoto)
router.get("/my-photos", VerifyEmployeeToken, HandleGetMyWorkPhotos)
router.delete("/delete/:photoID", VerifyEmployeeToken, HandleDeleteMyWorkPhoto)

// ── Rutas HR ──────────────────────────────────────────────────────────────
router.get("/all", VerifyhHRToken, PermissionCheck("photos", "read"), HandleGetAllWorkPhotos)
router.get("/employee/:employeeID", VerifyhHRToken, PermissionCheck("photos", "read"), HandleGetEmployeeWorkPhotos)
router.patch("/review", VerifyhHRToken, PermissionCheck("photos", "update"), HandleReviewWorkPhoto)
router.delete("/hr-delete/:photoID", VerifyhHRToken, PermissionCheck("photos", "delete"), HandleDeleteWorkPhoto)

export default router
