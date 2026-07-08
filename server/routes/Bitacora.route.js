import express from 'express'
import {
    HandleCreateBitacora,
    HandleUpdateBitacora,
    HandleGetMyBitacoras,
    HandleGetAllBitacoras,
    HandleGetBitacoraById,
    HandleDeleteBitacora
} from '../controllers/Bitacora.controller.js'
import { VerifyEmployeeToken, VerifyhHRToken } from '../middlewares/Auth.middleware.js'
import { PermissionCheck } from '../middlewares/RoleAuth.middleware.js'
import { uploadBitacoraMiddleware } from '../middlewares/BitacoraUpload.middleware.js'

const router = express.Router()

// ============ RUTAS EMPLEADO ============
// Crear bitácora (empleado autenticado) — con upload de imágenes y videos
router.post("/create", VerifyEmployeeToken, uploadBitacoraMiddleware, HandleCreateBitacora)
// Actualizar bitácora propia
router.patch("/update/:id", VerifyEmployeeToken, uploadBitacoraMiddleware, HandleUpdateBitacora)
// Obtener mis bitácoras
router.get("/my-bitacoras", VerifyEmployeeToken, HandleGetMyBitacoras)

// ============ RUTAS HR ============
// Obtener todas las bitácoras
router.get("/all", VerifyhHRToken, PermissionCheck("bitacoras", "read"), HandleGetAllBitacoras)
// Obtener bitácora por ID
router.get("/:id", VerifyhHRToken, PermissionCheck("bitacoras", "read"), HandleGetBitacoraById)
// Eliminar bitácora (soft-delete)
router.delete("/delete/:id", VerifyhHRToken, PermissionCheck("bitacoras", "delete"), HandleDeleteBitacora)

export default router
