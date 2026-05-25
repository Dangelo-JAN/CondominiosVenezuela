import admin from "firebase-admin"
import { PushSubscription } from "../models/PushSubscription.model.js"
import { HumanResources } from "../models/HR.model.js"

// ── Inicializar Firebase Admin ──────────────────────────────────────────────
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
        }),
    })
}

// ── Enviar push a un HR específico ─────────────────────────────────────────
// Retorna { success: boolean, response?: object, error?: string, tokensTotal: number }
export const sendPushToHR = async (hrId, title, body, data = {}) => {
    try {
        const subscriptions = await PushSubscription.find({ hr: hrId })

        if (subscriptions.length === 0) {
            return { success: false, error: "No hay suscripciones para este HR", tokensTotal: 0 }
        }

        // CRÍTICO: NO incluir notification (top-level) NI webpush.notification.
        // Ambos causan que el SDK de Firebase en el SW auto-displaye la notificación
        // ANTES de onBackgroundMessage. El FCM service convierte webpush.notification
        // en notification dentro del payload que llega al SW, resultando en DOBLE showNotification.
        // Solo usamos data (el SW lee title/body/data desde ahí) + fcmOptions para el link.
        const message = {
            data: {
                ...data,
                title,
                body,
            },
            webpush: {
                fcmOptions: {
                    link: data.url || "/HR/dashboard/bitacoras",
                },
            },
        }

        const tokens = subscriptions.map((s) => s.token)
        const response = await admin.messaging().sendEachForMulticast({
            tokens,
            ...message,
        })

        console.log(`[FCM] sendPushToHR(${hrId}): success=${response.successCount}, failure=${response.failureCount}, total=${tokens.length}`)

        // Remover tokens inválidos
        if (response.failureCount > 0) {
            const invalidTokens = []
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    const code = resp.error?.code || "unknown"
                    console.warn(`[FCM] Token fallido [${idx}]: ${code}`)
                    if (code === "messaging/invalid-registration-token" ||
                        code === "messaging/registration-token-not-registered") {
                        invalidTokens.push(tokens[idx])
                    }
                }
            })

            if (invalidTokens.length > 0) {
                await PushSubscription.deleteMany({ token: { $in: invalidTokens } })
                console.log(`[FCM] Removed ${invalidTokens.length} invalid tokens for HR ${hrId}`)
            }

            return {
                success: response.successCount > 0,
                response: {
                    successCount: response.successCount,
                    failureCount: response.failureCount,
                },
                tokensTotal: tokens.length,
            }
        }

        return {
            success: true,
            response: {
                successCount: response.successCount,
                failureCount: response.failureCount,
            },
            tokensTotal: tokens.length,
        }
    } catch (error) {
        console.error("[FCM] sendPushToHR error:", error.message, error.stack)
        return { success: false, error: error.message, tokensTotal: 0 }
    }
}

// ── Enviar push a todos los HR de una organización ──────────────────────────
export const sendPushToAll = async (orgId, title, body, data = {}) => {
    try {
        const allHRs = await HumanResources.find({
            organizationID: orgId,
            isactive: true,
            isDeleted: { $ne: true },
        }).select("_id")

        if (allHRs.length === 0) return

        // Enviar en paralelo a todos los HR
        await Promise.allSettled(
            allHRs.map((hr) => sendPushToHR(hr._id, title, body, data))
        )
    } catch (error) {
        console.error("[FCM] sendPushToAll error:", error.message)
    }
}
