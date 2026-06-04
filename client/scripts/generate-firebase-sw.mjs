#!/usr/bin/env node

/**
 * generate-firebase-sw.mjs
 * ──────────────────────────────────────────────────────────────────
 * Genera client/public/firebase-messaging-sw.js con la
 * configuración de Firebase obtenida de las variables de entorno.
 *
 * Prioridad:
 *   1. process.env.VITE_FIREBASE_*  (Vercel / CI)
 *   2. .env file en client/         (desarrollo local)
 *
 * El Service Worker necesita la config hardcodeada porque los
 * archivos en public/ NO son procesados por Vite y no tienen
 * acceso a import.meta.env.
 * ──────────────────────────────────────────────────────────────────
 */

import { readFileSync, writeFileSync, existsSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const CLIENT_DIR = resolve(__dirname, "..")
const PUBLIC_DIR = resolve(CLIENT_DIR, "public")
const ENV_FILE = resolve(CLIENT_DIR, ".env")
const SW_OUTPUT = resolve(PUBLIC_DIR, "firebase-messaging-sw.js")
const FIREBASE_PKG = resolve(CLIENT_DIR, "node_modules/firebase/package.json")

// ── Obtener versión de Firebase instalada ───────────────────────────────────
function getFirebaseVersion() {
    try {
        const pkg = JSON.parse(readFileSync(FIREBASE_PKG, "utf-8"))
        const version = pkg.version || ""
        // Usar solo major.minor.patch (ej: "12.13.0")
        return version
    } catch {
        console.warn("[generate-firebase-sw] ⚠️ No se pudo leer la versión de Firebase, usando fallback '12.13.0'")
        return "12.13.0"
    }
}

// ── Leer variables de entorno ──────────────────────────────────────────────
function loadEnv() {
    // Opción 1: process.env (Vercel / CI)
    const env = { ...process.env }

    // Opción 2: fallback a .env file (desarrollo local)
    if (!env.VITE_FIREBASE_API_KEY && existsSync(ENV_FILE)) {
        const content = readFileSync(ENV_FILE, "utf-8")
        for (const line of content.split("\n")) {
            const trimmed = line.trim()
            if (!trimmed || trimmed.startsWith("#")) continue
            const eqIdx = trimmed.indexOf("=")
            if (eqIdx === -1) continue
            let key = trimmed.slice(0, eqIdx).trim()
            let value = trimmed.slice(eqIdx + 1).trim()
            // Remover comillas envolventes
            if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1)
            }
            env[key] = value
        }
    }

    return env
}

// ── Extraer messagingSenderId del appId ────────────────────────────────────
function extractSenderId(appId) {
    if (!appId) return ""
    // Formato: "1:<PROJECT_NUMBER>:<platform>:<hash>"
    return appId.split(":")[1] || ""
}

// ── Generar contenido del SW ───────────────────────────────────────────────
function buildSwContent(apiKey, projectId, appId, messagingSenderId, fbVersion) {
    // Usar JSON.stringify para escapar strings correctamente
    const j = (s) => JSON.stringify(s || "")

    // Escapar backticks para el template literal de Node.js
    // Las variables que contienen `` se escapan con $
    const esc = (str) => str

    return `// ─────────────────────────────────────────────────────────────────────────────
// Firebase Messaging Service Worker
// ⚠️ GENERADO AUTOMÁTICAMENTE — No editar manualmente
// ─────────────────────────────────────────────────────────────────────────────

self.addEventListener("install", (event) => {
    self.skipWaiting()
})

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim())
})

// ── CDN imports ─────────────────────────────────────────────────────────────
importScripts("https://www.gstatic.com/firebasejs/${fbVersion}/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/${fbVersion}/firebase-messaging-compat.js")

firebase.initializeApp({
    apiKey: ${j(apiKey)},
    authDomain: ${j(projectId ? `${projectId}.firebaseapp.com` : "")},
    projectId: ${j(projectId)},
    appId: ${j(appId)},
    messagingSenderId: ${j(messagingSenderId)},
})

const messaging = firebase.messaging()

// ── Manejar notificaciones en background ────────────────────────────────────
messaging.onBackgroundMessage((payload) => {
    try {
        const data = payload.data || {}
        const title = data.title || "CondoVE SGC"
        const body = data.body || "Tienes una nueva notificación"
        const bitacoraId = data.bitacoraId || null

        const notificationOptions = {
            body: body,
            icon: "/icons/icon-192x192.png",
            badge: "/icons/icon-72x72.png",
            vibrate: [200, 100, 200],
            tag: bitacoraId || "condove-general",
            data: {
                url: bitacoraId
                    ? \`/HR/dashboard/bitacoras?id=\${bitacoraId}\`
                    : "/HR/dashboard/bitacoras",
                bitacoraId: bitacoraId,
            },
            actions: [
                {
                    action: "view",
                    title: "Ver bitacora",
                },
            ],
            requireInteraction: true,
            silent: false,
        }

        self.registration.showNotification(title, notificationOptions)
    } catch (err) {
        // Error silencioso — no romper el SW
    }
})

// ── Manejar click en la notificacion ────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
    event.notification.close()

    const url = event.notification.data?.url || "/HR/dashboard/bitacoras"

    event.waitUntil(
        clients
            .matchAll({ type: "window", includeUncontrolled: true })
            .then((windowClients) => {
                for (const client of windowClients) {
                    if (client.url.includes(self.location.origin) && "focus" in client) {
                        client.focus()
                        client.navigate(url)
                        return
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(url)
                }
            })
    )
})
`
}

// ── Main ───────────────────────────────────────────────────────────────────
function main() {
    const env = loadEnv()

    const apiKey = env.VITE_FIREBASE_API_KEY
    const projectId = env.VITE_FIREBASE_PROJECT_ID
    const appId = env.VITE_FIREBASE_APP_ID
    const messagingSenderId = extractSenderId(appId)

    // Validar que todas las variables existen
    const missing = []
    if (!apiKey) missing.push("VITE_FIREBASE_API_KEY")
    if (!projectId) missing.push("VITE_FIREBASE_PROJECT_ID")
    if (!appId) missing.push("VITE_FIREBASE_APP_ID")
    if (!messagingSenderId) missing.push("messagingSenderId (no pudo derivarse de VITE_FIREBASE_APP_ID)")

    if (missing.length > 0) {
        console.warn(
            `[generate-firebase-sw] ⚠️ Variables faltantes: ${missing.join(", ")}. ` +
            "El Service Worker se generará igual, pero el push no funcionará hasta que estén configuradas."
        )
    }

    const fbVersion = getFirebaseVersion()
    const swContent = buildSwContent(apiKey, projectId, appId, messagingSenderId, fbVersion)

    writeFileSync(SW_OUTPUT, swContent, "utf-8")
    console.log(`[generate-firebase-sw] ✅ SW generado: ${SW_OUTPUT}`)
    console.log(`[generate-firebase-sw]    firebase CDN version: ${fbVersion}`)
    console.log(`[generate-firebase-sw]    projectId: ${projectId || "⚠️ FALTANTE"}`)
    console.log(`[generate-firebase-sw]    messagingSenderId: ${messagingSenderId || "⚠️ FALTANTE"}`)
}

main()
