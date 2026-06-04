import { useState, useEffect, useCallback, useRef } from "react"
import { getFCMToken, isPushSupported, initMessaging } from "../services/firebase.js"
import { hrApiService } from "../redux/apis/HRApiService.js"
import { HRNotificationsEndPoints } from "../redux/apis/APIsEndpoints.js"

/**
 * Hook para gestionar notificaciones push FCM.
 *
 * - Verifica soporte del navegador + Firebase Messaging
 * - Registra el service worker de Firebase Messaging
 * - Solicita permiso y obtiene el token FCM
 * - Envía/elimina el token al backend
 *
 * @param {boolean} enabled - Si el hook debe activarse (ej: cuando hay HRtoken)
 */
export const usePushNotifications = (enabled = false) => {
    const [permission, setPermission] = useState(Notification.permission || "default")
    const [token, setToken] = useState(null)
    const [isSubscribing, setIsSubscribing] = useState(false)
    const [error, setError] = useState(null)
    const [supported, setSupported] = useState(null) // null = no verificado
    const registrationRef = useRef(null)

    // ── Verificar soporte al montar ──────────────────────────────────────────
    useEffect(() => {
        isPushSupported().then(setSupported).catch(() => setSupported(false))
    }, [])

    // ── Registrar Service Worker de Firebase ─────────────────────────────────
    const registerSW = useCallback(async () => {
        try {
            const sup = await isPushSupported()
            if (!sup) return null

            // Importante: NO usar scope "/" (entra en conflicto con sw.js de caching).
            // Firebase SDK internamente usa "/firebase-cloud-messaging-push-scope".
            const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
                scope: "/firebase-cloud-messaging-push-scope",
            })
            // Esperar a que el SW esté activo antes de continuar
            await navigator.serviceWorker.ready
            registrationRef.current = registration
            return registration
        } catch (err) {
            return null
        }
    }, [])

    // ── Suscribirse a push ───────────────────────────────────────────────────
    const subscribe = useCallback(async () => {
        const sup = await isPushSupported()
        if (!sup) {
            setError("Este navegador no soporta notificaciones push")
            return null
        }

        setIsSubscribing(true)
        setError(null)

        try {
            // Inicializar Firebase Messaging (verifica soporte internamente)
            const msg = await initMessaging()
            if (!msg) {
                setError("Firebase Messaging no está disponible en este navegador. Prueba con Chrome o Edge.")
                setPermission(Notification.permission)
                return null
            }

            // Registrar SW
            if (!registrationRef.current) {
                await registerSW()
            }

            // Obtener token FCM — ahora retorna { token, error }
            // Pasar la registration explícitamente para que getToken() la use
            const result = await getFCMToken(registrationRef.current)

            if (result.error) {
                // Errores específicos de permiso
                if (result.error === "PERMISSION_DENIED") {
                    setError(null) // No mostrar error rojo, el estado "denied" se maneja en UI
                    setPermission("denied")
                    return null
                }
                if (result.error === "PERMISSION_DEFAULT") {
                    setError("Debes permitir las notificaciones en el cuadro de diálogo del navegador")
                    setPermission("default")
                    return null
                }
                // Error real de Firebase
                setError(result.error)
                setPermission(Notification.permission)
                return null
            }

            // Token obtenido exitosamente
            const fcmToken = result.token
            if (!fcmToken) {
                setError("Error inesperado: token vacío")
                return null
            }

            // Enviar token al backend
            await hrApiService.post(HRNotificationsEndPoints.SUBSCRIBE, {
                token: fcmToken,
                platform: "web",
                userAgent: navigator.userAgent,
            })

            setToken(fcmToken)
            setPermission("granted")
            setError(null)
            return fcmToken
        } catch (err) {
            setError(err.response?.data?.message || "Error al activar notificaciones")
            return null
        } finally {
            setIsSubscribing(false)
        }
    }, [registerSW])

    // ── Cancelar suscripción ─────────────────────────────────────────────────
    const unsubscribe = useCallback(async () => {
        if (!token) return

        try {
            await hrApiService.delete(HRNotificationsEndPoints.UNSUBSCRIBE(token))
            setToken(null)
            setPermission("default")
            setError(null)
        } catch (err) {
            // Error silencioso — no bloquear la UI
        }
    }, [token])

    // ── Inicializar al montar (si enabled) ───────────────────────────────────
    useEffect(() => {
        if (!enabled) return

        const init = async () => {
            // Verificar soporte
            const sup = await isPushSupported()
            setSupported(sup)
            if (!sup) return

            // Inicializar Firebase Messaging
            await initMessaging()

            // Registrar SW
            await registerSW()

            // Verificar si ya hay un token guardado (reinicio de página)
            const savedToken = localStorage.getItem("fcm_token")
            const savedPermission = Notification.permission

            setPermission(savedPermission)

            if (savedToken && savedPermission === "granted") {
                setToken(savedToken)
                // Re-verificar que el token siga siendo válido en el backend
                try {
                    await hrApiService.post(HRNotificationsEndPoints.SUBSCRIBE, {
                        token: savedToken,
                        platform: "web",
                        userAgent: navigator.userAgent,
                    })
                } catch {
                    // Si falla, el usuario necesitará re-suscribirse
                    localStorage.removeItem("fcm_token")
                    setToken(null)
                }
            }
        }

        init()
    }, [enabled, registerSW])

    // ── Persistir token en localStorage ──────────────────────────────────────
    useEffect(() => {
        if (token) {
            localStorage.setItem("fcm_token", token)
        } else {
            localStorage.removeItem("fcm_token")
        }
    }, [token])

    return {
        permission,      // "granted" | "denied" | "default"
        token,           // string | null
        isSubscribing,   // boolean
        error,           // string | null  ← AHORA muestra el error REAL de Firebase
        subscribe,       // () => Promise<string|null>
        unsubscribe,     // () => Promise<void>
        isSupported: supported, // boolean | null (null = no verificado aún)
    }
}
