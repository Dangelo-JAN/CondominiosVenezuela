import express from "express"
import {
    HandleSaveSubscription,
    HandleRemoveSubscription,
    HandleSendTestPush,
} from "../controllers/PushNotification.controller.js"
import { VerifyhHRToken } from "../middlewares/Auth.middleware.js"

const router = express.Router()

// ============ RUTAS HR (protegidas) ============
// Guardar suscripción push
router.post("/subscribe", VerifyhHRToken, HandleSaveSubscription)
// Eliminar suscripción push
router.delete("/unsubscribe/:token", VerifyhHRToken, HandleRemoveSubscription)
// Enviar push de prueba
router.post("/test", VerifyhHRToken, HandleSendTestPush)

export default router
