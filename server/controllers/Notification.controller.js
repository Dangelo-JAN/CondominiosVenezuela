import { Notification } from "../models/Notification.model.js"


// ── Obtener notificaciones del HR logueado ─────────────────────────────────
export const HandleGetMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            recipient: req.HRid,
            organizationID: req.ORGID,
            isDeleted: false
        })
            .sort({ createdAt: -1 })
            .limit(50)

        // Headers anti-caché
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate')
        res.set('Pragma', 'no-cache')
        res.set('Expires', '0')

        return res.status(200).json({
            success: true,
            message: "Notificaciones recuperadas exitosamente",
            data: notifications
        })

    } catch (error) {
        console.error("[ERROR] HandleGetMyNotifications:", error.message)
        return res.status(500).json({ success: false, message: error.message })
    }
}

// ── Obtener conteo de notificaciones no leídas ─────────────────────────────
export const HandleGetUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            recipient: req.HRid,
            organizationID: req.ORGID,
            isRead: false,
            isDeleted: false
        })

        return res.status(200).json({
            success: true,
            message: "Conteo obtenido exitosamente",
            data: { unreadCount: count }
        })

    } catch (error) {
        console.error("[ERROR] HandleGetUnreadCount:", error.message)
        return res.status(500).json({ success: false, message: error.message })
    }
}

// ── Marcar una notificación como leída ─────────────────────────────────────
export const HandleMarkAsRead = async (req, res) => {
    try {
        const { id } = req.params

        const notification = await Notification.findOneAndUpdate(
            {
                _id: id,
                recipient: req.HRid,
                organizationID: req.ORGID,
                isDeleted: false
            },
            { isRead: true },
            { new: true }
        )

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notificación no encontrada" })
        }

        return res.status(200).json({
            success: true,
            message: "Notificación marcada como leída",
            data: notification
        })

    } catch (error) {
        console.error("[ERROR] HandleMarkAsRead:", error.message)
        return res.status(500).json({ success: false, message: error.message })
    }
}

// ── Marcar todas las notificaciones como leídas ────────────────────────────
export const HandleMarkAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            {
                recipient: req.HRid,
                organizationID: req.ORGID,
                isRead: false,
                isDeleted: false
            },
            { isRead: true }
        )

        return res.status(200).json({
            success: true,
            message: "Todas las notificaciones marcadas como leídas"
        })

    } catch (error) {
        console.error("[ERROR] HandleMarkAllAsRead:", error.message)
        return res.status(500).json({ success: false, message: error.message })
    }
}
