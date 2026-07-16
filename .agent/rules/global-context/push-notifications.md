---
trigger: always_on
---

# 🔔 Push Notifications (FCM + Web Push)

## Visión General
Sistema de notificaciones push nativas mediante Firebase Cloud Messaging (FCM). Cuando un empleado crea una bitácora, los coordinadores HR reciben una notificación push incluso con la app cerrada.

## Reglas Invariantes

### 1. Payload: 100% Data-Only
- **PROHIBIDO** incluir `notification` o `webpush.notification` en el payload FCM.
- El Service Worker es el **único** responsable de llamar `showNotification()`.
- title/body se leen exclusivamente de `payload.data`.

### 2. Service Worker Scope
- **Firebase SW →** scope `/firebase-cloud-messaging-push-scope` (NO `/`).
- **SW convencional** → scope `/` para caching (`sw.js`).
- Ambos coexisten sin conflicto de scope.

### 3. SW Generado Dinámicamente
- `client/public/firebase-messaging-sw.js` es **generado** por `scripts/generate-firebase-sw.mjs` en prebuild/predev.
- **NO editar manualmente** — está en `.gitignore`.
- Usa versión **exacta** de CDN desde `node_modules/firebase/package.json` (sin wildcard).

### 4. Hook usePushNotifications
- Dos instancias coordinadas: `DashboardLayout` (init) + `NotificationBell` (UI).
- Token FCM persiste en `localStorage` con key `fcm_token`.
- `getFCMToken()` retorna `{ token, error }` — manejar ambos.

### 5. Envío desde Bitácora
- `Bitacora.controller.js` → `notifyAllHRs()` → `sendPushToAll()` en `fcm.service.js`.
- Limpieza automática de tokens FCM inválidos (tokens stale).

### 6. Limitaciones Conocidas
- ❌ **iOS Safari**: No soportado (Apple no soporta Web Push sin add-to-homescreen).
- ❌ **Edge Desktop+Mobile**: Pospuesto por tracking-prevention.
- ❌ **Firefox Desktop**: Push no llega (Mozilla Autopush).

## Archivos Clave
| Propósito | Archivo |
|-----------|---------|
| Config Firebase + getFCMToken | `client/src/services/firebase.js` |
| Hook push (subscribe/unsubscribe) | `client/src/hooks/usePushNotifications.js` |
| UI campana + push status | `client/src/components/common/NotificationBell.jsx` |
| Service Worker (generado) | `client/public/firebase-messaging-sw.js` (gitignored) |
| Generador del SW | `client/scripts/generate-firebase-sw.mjs` |
| Controller push backend | `server/controllers/PushNotification.controller.js` |
| FCM service backend | `server/services/fcm.service.js` |
| Envío desde bitácora | `server/controllers/Bitacora.controller.js` |

## Fuente Canónica
Bitácora completa: `.bitacoras/021-push-notifications.md`
