import { initializeApp } from "firebase/app"
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging"

// ── Configuración de Firebase ──────────────────────────────────────────────
// messagingSenderId se extrae del appId (formato: "1:<PROJECT_NUMBER>:<platform>:<hash>")
const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID || ""
const APP_ID = import.meta.env.VITE_FIREBASE_APP_ID || ""
const MESSAGING_SENDER_ID = APP_ID.split(":")[1] || ""

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: `${PROJECT_ID}.firebaseapp.com`,
    projectId: PROJECT_ID,
    appId: APP_ID,
    messagingSenderId: MESSAGING_SENDER_ID,
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)

// No inicializar messaging hasta que se verifique soporte
let messaging = null

// VAPID Key
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY

// ── Inicializar messaging (solo si es soportado) ────────────────────────────
const initMessaging = async () => {
    if (messaging) return messaging
    if (await isSupported()) {
        messaging = getMessaging(app)
        return messaging
    }
    return null
}

// ── Obtener token FCM ───────────────────────────────────────────────────────
// Retorna { token: string|null, error: string|null }
// @param {ServiceWorkerRegistration|null} swRegistration - Registration a usar (evita que Firebase SDK cree una propia)
export const getFCMToken = async (swRegistration = null) => {
    try {
        // Verificar soporte de Firebase Messaging
        const fcmSupported = await isSupported()
        if (!fcmSupported) {
            return { token: null, error: "Este navegador no soporta Firebase Cloud Messaging" }
        }

        // Asegurar que messaging esté inicializado
        const msg = await initMessaging()
        if (!msg) {
            return { token: null, error: "No se pudo inicializar Firebase Messaging" }
        }

        // Solicitar permiso de notificación del navegador
        let permission
        try {
            permission = await Notification.requestPermission()
        } catch (permError) {
            return { token: null, error: `Error al solicitar permiso: ${permError.message}` }
        }

        if (permission === "denied") {
            return { token: null, error: "PERMISSION_DENIED" }
        }
        if (permission === "default") {
            return { token: null, error: "PERMISSION_DEFAULT" }
        }
        // permission === "granted"

        // Intentar obtener el token FCM
        try {
            const tokenOptions = { vapidKey: VAPID_KEY }
            // Si tenemos una registration explícita, pasarla para evitar que Firebase SDK
            // registre el SW en un scope diferente o conflicto con sw.js
            if (swRegistration) {
                tokenOptions.serviceWorkerRegistration = swRegistration
            }
            const currentToken = await getToken(msg, tokenOptions)

            if (currentToken) {
                return { token: currentToken, error: null }
            } else {
                return { token: null, error: "Firebase devolvió un token vacío. Verifica la configuración del proyecto Firebase (Cloud Messaging habilitado? VAPID key generada?)" }
            }
        } catch (tokenError) {
            const errMsg = tokenError?.code || tokenError?.message || "Error desconocido"
            return { token: null, error: `Firebase error: ${errMsg}` }
        }
    } catch (error) {
        return { token: null, error: `Error crítico: ${error.message}` }
    }
}

// ── Escuchar mensajes en foreground (cuando la app está visible) ────────────
export const onMessageListener = () =>
    new Promise((resolve) => {
        if (!messaging) {
            resolve(null)
            return
        }
        onMessage(messaging, (payload) => {
            resolve(payload)
        })
    })

// ── Verificar si el navegador soporta notificaciones + FCM ──────────────────
export const isPushSupported = async () => {
    const basic = "Notification" in window && "serviceWorker" in navigator && "PushManager" in window
    if (!basic) return false
    return isSupported()
}

export { messaging, initMessaging }
