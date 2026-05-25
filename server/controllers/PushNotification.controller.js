import { PushSubscription } from "../models/PushSubscription.model.js"
import { sendPushToHR } from "../services/fcm.service.js"

// ── Guardar o actualizar suscripción push ──────────────────────────────────
export const HandleSaveSubscription = async (req, res) => {
    try {
        const { token, platform, userAgent } = req.body

        if (!token || !token.trim()) {
            return res.status(400).json({ success: false, message: "El token es requerido" })
        }

        // Upsert: si ya existe el mismo token para este HR, actualiza platform/userAgent
        const subscription = await PushSubscription.findOneAndUpdate(
            { hr: req.HRid, token: token.trim() },
            {
                hr: req.HRid,
                token: token.trim(),
                platform: platform || "web",
                userAgent: userAgent || "",
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        )

        return res.status(200).json({
            success: true,
            message: "Suscripción guardada exitosamente",
            data: subscription,
        })
    } catch (error) {
        console.error("[ERROR] HandleSaveSubscription:", error.message)
        return res.status(500).json({ success: false, message: error.message })
    }
}

// ── Eliminar suscripción push (unsubscribe) ─────────────────────────────────
export const HandleRemoveSubscription = async (req, res) => {
    try {
        const { token } = req.params

        if (!token) {
            return res.status(400).json({ success: false, message: "El token es requerido" })
        }

        const result = await PushSubscription.findOneAndDelete({
            hr: req.HRid,
            token,
        })

        if (!result) {
            return res.status(404).json({ success: false, message: "Suscripción no encontrada" })
        }

        return res.status(200).json({
            success: true,
            message: "Suscripción eliminada exitosamente",
        })
    } catch (error) {
        console.error("[ERROR] HandleRemoveSubscription:", error.message)
        return res.status(500).json({ success: false, message: error.message })
    }
}

// ── Enviar push de prueba ──────────────────────────────────────────────────
export const HandleSendTestPush = async (req, res) => {
    try {
        const result = await sendPushToHR(
            req.HRid,
            "Notificacion de prueba",
            "Tus notificaciones push funcionan correctamente!",
            { type: "test" }
        )

        // result = { success, response?, error?, tokensTotal }
        if (!result || result.tokensTotal === 0) {
            return res.status(200).json({
                success: false,
                message: "No hay dispositivos suscritos para recibir push. Activa las notificaciones primero.",
                data: result,
            })
        }

        if (result.success) {
            return res.status(200).json({
                success: true,
                message: `Push enviado: ${result.response?.successCount || 0} exitoso(s), ${result.response?.failureCount || 0} fallo(s)`,
                data: result,
            })
        }

        return res.status(200).json({
            success: false,
            message: result.error || "El push se envio pero con errores en todos los tokens",
            data: result,
        })
    } catch (error) {
        console.error("[ERROR] HandleSendTestPush:", error.message)
        return res.status(500).json({ success: false, message: error.message })
    }
}
