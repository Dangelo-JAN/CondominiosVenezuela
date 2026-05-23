import express from 'express'
import {
    HandleGetMyNotifications,
    HandleGetUnreadCount,
    HandleMarkAsRead,
    HandleMarkAllAsRead
} from '../controllers/Notification.controller.js'
import { VerifyhHRToken } from '../middlewares/Auth.middleware.js'

const router = express.Router()

// ============ RUTAS HR ============
// Obtener notificaciones del HR logueado
router.get("/my-notifications", VerifyhHRToken, HandleGetMyNotifications)
// Obtener conteo de no leídas
router.get("/unread-count", VerifyhHRToken, HandleGetUnreadCount)
// Marcar una notificación como leída
router.patch("/read/:id", VerifyhHRToken, HandleMarkAsRead)
// Marcar todas como leídas
router.patch("/read-all", VerifyhHRToken, HandleMarkAllAsRead)

export default router
