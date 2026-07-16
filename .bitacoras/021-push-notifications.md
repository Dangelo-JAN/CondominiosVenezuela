# 🛠️ TAREA: Push Notifications FCM + Web Push
**ID:** #021 | **Estado:** ✅ COMPLETADO | **Fecha:** 2026-05-31

---

## 🎯 OBJETIVO FINAL
> Que los coordinadores HR reciban notificaciones push nativas (FCM) en sus dispositivos cuando un empleado cree una bitácora, apareciendo en la pantalla de bloqueo, barra de estado o notification tray incluso cuando la app no está abierta.

---

## 🚦 RESUMEN FINAL

- **PR #24:** https://github.com/Dangelo-JAN/CondominiosVenezuela/pull/24 — `feat/push-notifications-fcm` → `dev` (✅ MERGED)
- **PR #25:** https://github.com/Dangelo-JAN/CondominiosVenezuela/pull/25 — `dev` → `main` (✅ MERGED)
- **Branch final:** `main`
- **Commits:** 12 commits squaseados + rebase completado → commit único en `main`: `d55cdfb`
- **Fases:** ✅ F1 Backend · ✅ F2 FCM SDK + SW · ✅ F3 UI integración · ✅ Bugfixes · ✅ Duplicate fix · ✅ Dropdown responsive
- **Build final:** 0 errores
- **`.gitignore`:** `client/public/firebase-messaging-sw.js` agregado al root `.gitignore` (generado por prebuild script)
- **Deploy:** Pendiente desde `main` a Vercel + Render

---

## 📋 PLAN DE FASES

| Fase | Descripción | Archivos | Status |
|------|-------------|----------|--------|
| F1 | Backend: PushSubscription Model + API + FCM Service | 6 archivos | ✅ COMPLETADO |
| F2 | Frontend: FCM SDK + Service Worker + Hook | 4 archivos | ✅ COMPLETADO |
| F3 | Frontend: Integración UI + Toggle modal desde campana | 2 archivos | ✅ COMPLETADO |
| F4 | Bugfixes (4 bugs: messagingSenderId, SW dinámico, errores reales, CDN version) | 5 archivos | ✅ COMPLETADO |
| F5 | Debugging SW + Error propagation + Test feedback | 3 archivos | ✅ COMPLETADO |
| F6 | Scope fix: Firebase SW `/` → `/firebase-cloud-messaging-push-scope` | 2 archivos | ✅ COMPLETADO |
| F7 | Console.log cleanup + Duplicate fix (2 capas: `notification` + `webpush.notification`) | 2 archivos | ✅ COMPLETADO |
| F8 | Dropdown responsive en móvil | 1 archivo | ✅ COMPLETADO |

---

## 📝 CAMBIOS TÉCNICOS CLAVE — DETALLE COMPLETO

### FASE 1 — Backend: PushSubscription Model + API + FCM Service (Commits: 3c44d99, 2861ae7)

| Archivo | Acción | Detalle técnico |
|---------|--------|-----------------|
| `server/models/PushSubscription.model.js` | ✅ Creado | Schema: hr (ref HumanResources, req), token (String req), platform (enum: web/android/ios, default: web), userAgent (String), timestamps. Index compuesto único `{ hr: 1, token: 1 }`. Index `{ hr: 1 }` para populate |
| `server/services/fcm.service.js` | ✅ Creado | Inicializa `firebase-admin` con `credential.cert({ projectId, clientEmail, privateKey })`. `sendPushToHR(hrId, title, body, data)`: busca PushSubscriptions del HR, envía multicast, limpia tokens inválidos. `sendPushToAll(orgId, title, body, data)`: busca HRs activos de la org, envía en paralelo con `Promise.allSettled`. Nunca lanza error. Retorna `{ success, response?, error?, tokensTotal }` |
| `server/controllers/PushNotification.controller.js` | ✅ Creado | `HandleSaveSubscription`: upsert. `HandleRemoveSubscription`: findOneAndDelete. `HandleSendTestPush`: llama a sendPushToHR con datos de prueba, retorna real FCM success/failure counts |
| `server/routes/PushNotification.route.js` | ✅ Creado | POST /subscribe (VerifyhHRToken), DELETE /unsubscribe/:token (VerifyhHRToken), POST /test (VerifyhHRToken) |
| `server/controllers/Bitacora.controller.js` | ✏️ Modificado | `notifyAllHRs()`: después de Notification.insertMany(), llama a `sendPushToAll(orgID, pushTitle, pushBody, { type, bitacoraId, url })` |
| `server/index.js` | ✏️ Modificado | Import + app.use("/api/v1/push", PushNotificationRouter) |

### FASE 2 — Frontend: FCM SDK + Service Worker + Hook (Commits: 1fb417a, 7f57f04, 1351a28, 5f558aa, 81f98e2, c82c572)

| Archivo | Acción | Detalle técnico |
|---------|--------|-----------------|
| `client/src/services/firebase.js` | ✅ Creado | Firebase App init con env vars. `initMessaging()`: verifica isSupported() antes de getMessaging(). `getFCMToken()`: retorna `{ token, error }` con errores específicos. `onMessageListener()`: Promise wrapper. `isPushSupported()`: async, combina browser check + isSupported() |
| `client/src/hooks/usePushNotifications.js` | ✅ Creado | Hook completo: permission, token, isSubscribing, error, supported. registerSW() → subscribe() → POST backend. unsubscribe() → DELETE. Init al montar si enabled=true |
| `client/scripts/generate-firebase-sw.mjs` | ✅ Creado | Lee env vars + node_modules/firebase/package.json para CDN version exacta. Genera firebase-messaging-sw.js en prebuild/predev |
| `client/public/firebase-messaging-sw.js` | ⚡ GENERADO (gitignored) | SW con skipWaiting(), clients.claim(), onBackgroundMessage(), raw push event listener. Scope: /firebase-cloud-messaging-push-scope |
| `client/src/redux/apis/APIsEndpoints.js` | ✏️ Modificado | +SUBSCRIBE, UNSUBSCRIBE(token), TEST_PUSH |
| `client/package.json` | ✏️ Modificado | +firebase dependency. +predev y prebuild scripts |

### FASE 3 — Frontend: Integración UI + Notifications (Commits: 83dd38a, 2861ae7, c82c572, 4f744d1)

| Archivo | Acción | Detalle técnico |
|---------|--------|-----------------|
| `client/src/components/common/DashboardLayout.jsx` | ✏️ Modificado | +NotificationBell en top bar. +usePushNotifications(hasHRToken) para HR |
| `client/src/components/common/NotificationBell.jsx` | ✏️ Modificado | Bell icon con badge rojo + dropdown (loading/empty/data/error) + polling 30s + marcar leídas. Push status bar con modal inline (activar/desactivar/probar). Foreground listener con onMessageListener() → refresh + toast. Push denegado muestra hint. **Responsive:** mobile usa `fixed` centrado, desktop `absolute right-0` |

### FASE 4-8 — Bugfixes y mejoras (Commits: 7f57f04, 1351a28, 5f558aa, 2861ae7, 81f98e2, c82c572, 6586faf, a3dbdbb, 4f744d1)

#### Bug 1: `messagingSenderId` incorrecto
- **Síntoma:** getToken() devuelve null, error genérico
- **Causa:** VAPID key no tiene colons, split(":")[0] devuelve cadena completa
- **Fix:** Derivar de `VITE_FIREBASE_APP_ID.split(":")[1]`

#### Bug 2: SW con config hardcodeada
- **Síntoma:** SW no se actualiza entre entornos
- **Causa:** public/firebase-messaging-sw.js no pasa por Vite
- **Fix:** Script generate-firebase-sw.mjs que lee env y genera SW con valores correctos

#### Bug 3: Mensajes de error genéricos
- **Síntoma:** No se podía diagnosticar error real de Firebase
- **Fix:** getFCMToken() retorna { token, error }, distingue PERMISSION_DENIED vs PERMISSION_DEFAULT

#### Bug 4: CDN version mismatch
- **Síntoma:** TypeError en SW por URL con wildcard 11.x
- **Fix:** Leer versión exacta desde node_modules/firebase/package.json

#### Bug 5 (Fase 6): Scope conflict
- **Síntoma:** firebase-messaging-sw.js y sw.js competían por scope `/`
- **Fix:** Firebase SW scope cambiado a `/firebase-cloud-messaging-push-scope`
- **Fix adicional:** Pasar serviceWorkerRegistration explícito a getToken()

#### Bug 6 (Fase 7): Notificación duplicada — 2 capas
- **Capa 1 (commit 6586faf):** `notification` top-level en payload → SDK auto-display antes de onBackgroundMessage
- **Capa 2 (commit a3dbdbb):** `webpush.notification` es reconstruido por FCM como `payload.notification` en el SW
- **Fix definitivo:** Payload 100% data-only + webpush.fcmOptions. SW lee title/body de payload.data. onBackgroundMessage es único caller de showNotification()
- **Verificado:** grep cero referencias a notification/webpush en payload y SW

#### Mejora (Fase 8): Dropdown responsive
- **Problema:** Dropdown se cortaba en móvil por absolute right-0
- **Fix:** Mobile (< sm): fixed left-4 right-4 top-24. Desktop (sm+): absolute right-0. max-h adaptativo (60vh vs 320px)

---

## 🐛 HISTORIAL DE BUGS

| Bug | Síntoma | Causa | Fix | Commit |
|-----|---------|-------|-----|--------|
| 1 | getToken() null | messagingSenderId mal derivado | AppID.split(":")[1] | 7f57f04 |
| 2 | SW no se actualiza | Config hardcodeada | Script generador dinámico | 7f57f04 |
| 3 | Error genérico | Firebase errors atrapados sin exponer | { token, error } return | 1351a28 |
| 4 | TypeError en SW | CDN wildcard 11.x no resuelve | Versión exacta desde node_modules | 5f558aa |
| 5 | Push no llega | Scope conflict entre SWs | Scope /firebase-cloud-messaging-push-scope | 81f98e2 |
| 6a | Notif duplicada | notification top-level auto-display | Eliminar notification del payload | 6586faf |
| 6b | Notif duplicada (persiste) | webpush.notification reconstruido | Eliminar webpush.notification, data-only | a3dbdbb |
| 7 | Dropdown cortado en móvil | absolute right-0 overflow | fixed centrado en mobile | 4f744d1 |

---

## 📦 LISTA COMPLETA DE COMMITS

| # | Hash | Mensaje | Fecha |
|---|------|---------|-------|
| 1 | `3c44d99` | feat(backend): add push notification subscription model and FCM service | 25/05 |
| 2 | `1fb417a` | feat(frontend): add firebase messaging service worker and push notification hook | 25/05 |
| 3 | `83dd38a` | feat(ui): integrate push notifications into dashboard layout and bell component | 25/05 |
| 4 | `7f57f04` | fix(frontend): correct messagingSenderId and generate SW dynamically from env vars | 25/05 |
| 5 | `1351a28` | fix(frontend): add detailed error logging to FCM token acquisition | 25/05 |
| 6 | `5f558aa` | fix(frontend): resolve firebase SW CDN version mismatch | 25/05 |
| 7 | `2861ae7` | fix(push): add SW debugging, fix error swallowing, and improve test feedback | 26/05 |
| 8 | `81f98e2` | fix(push): change Firebase SW scope from / to /firebase-cloud-messaging-push-scope | 26/05 |
| 9 | `c82c572` | cleanup(push): remove all console.log debug statements before PR | 27/05 |
| 10 | `6586faf` | fix(push): prevent duplicate notifications by removing top-level notification field | 27/05 |
| 11 | `a3dbdbb` | fix(push): eliminate duplicate notification at the root — remove webpush.notification too | 30/05 |
| 12 | `4f744d1` | fix(ui): make notification dropdown fully visible on mobile | 31/05 |

---

## 📊 ESTRUCTURA COMPLETA DEL SISTEMA

```
server/
├── models/
│   ├── PushSubscription.model.js     ✅ hr, token, platform, userAgent, timestamps
│   └── Notification.model.js         ✅ (existente)
├── services/
│   └── fcm.service.js                ✅ firebase-admin init + sendPushToHR/All + cleanup tokens
├── controllers/
│   ├── PushNotification.controller.js ✅ subscribe/unsubscribe/test
│   ├── Notification.controller.js     ✅ (existente)
│   └── Bitacora.controller.js         ✏️ notifyAllHRs + FCM push
├── routes/
│   ├── PushNotification.route.js      ✅ POST /subscribe, DELETE /unsubscribe/:token, POST /test
│   └── Notification.route.js          ✅ (existente)
└── index.js                           ✏️ +PushNotificationRouter

client/src/
├── services/
│   └── firebase.js                   ✅ Init, getFCMToken→{token,error}, onMessageListener, isPushSupported
├── hooks/
│   └── usePushNotifications.js       ✅ registerSW, subscribe, unsubscribe, localStorage, estados
├── components/common/
│   ├── DashboardLayout.jsx           ✏️ +NotificationBell + usePushNotifications para HR
│   └── NotificationBell.jsx          ✏️ dropdown notifs + push status + responsive mobile
├── redux/apis/
│   └── APIsEndpoints.js              ✏️ +SUBSCRIBE, UNSUBSCRIBE, TEST_PUSH
├── scripts/
│   └── generate-firebase-sw.mjs      ✅ Lee env vars, genera SW con CDN exacta
└── public/
    ├── sw.js                          ✅ (existente — caching, scope /)
    └── firebase-messaging-sw.js       ⚡ GENERADO (gitignored, scope /firebase-cloud-messaging-push-scope)

server/.env:
├── FIREBASE_PROJECT_ID
├── FIREBASE_CLIENT_EMAIL
└── FIREBASE_PRIVATE_KEY

client/.env:
├── VITE_FIREBASE_API_KEY
├── VITE_FIREBASE_PROJECT_ID
├── VITE_FIREBASE_APP_ID
└── VITE_FIREBASE_VAPID_KEY
```

---

## ⚠️ NOTAS DE MEMORIA (IMPORTANTES PARA REANUDAR)

### 🧠 Decisiones de diseño
- `useIsDark()` en vez de `useTheme()` — estilos dinámicos
- Sin soporte iOS Safari (solo FCM Web Push) — Apple no soporta Web Push sin add-to-homescreen
- Modal toggle push desde la campana, no desde HRProfilesPage
- Token FCM persiste en localStorage con key `fcm_token`
- Dos instancias de usePushNotifications: DashboardLayout (init) + NotificationBell (UI)
- Edge Desktop+Mobile pospuesto (tracking-prevention)
- Firefox Desktop pospuesto (Mozilla Autopush no recibe pushes)

### 🔧 Reglas técnicas críticas
- `importScripts` en SW debe usar URL exacta (no wildcard) — ej: `12.13.0`, NO `11.x`
- `getFCMToken()` retorna `{ token, error }` — manejar ambos en el hook
- `prebuild` y `predev` ejecutan `scripts/generate-firebase-sw.mjs`
- El SW generado está en `.gitignore` — se genera en cada build
- Payload FCM: 100% data-only (NO notification, NO webpush.notification)
- SW lee title/body desde payload.data
- Scope Firebase SW: `/firebase-cloud-messaging-push-scope` (NO `/`)
- Pasar serviceWorkerRegistration explícito a getToken()
- Server-side console.error se mantienen (logs de producción)

### 🏗️ Build & Deploy
- Cliente: `npm run build` (prebuild → generate SW → vite build) — 2720+ modules, 0 errors
- Servidor: `node --check server/index.js` — syntax OK
- Proyecto Firebase: `condove-sgc`
- Frontend URL: `https://condominios-venezuela-k3dbs0lcq-dangelo-jans-projects.vercel.app`
- Backend URL: `https://condominiocia.onrender.com`

### 📂 Archivos clave
| Propósito | Archivo |
|-----------|---------|
| Config Firebase + getFCMToken | `client/src/services/firebase.js` |
| Hook de push (subscribe/unsubscribe) | `client/src/hooks/usePushNotifications.js` |
| UI campana + push status | `client/src/components/common/NotificationBell.jsx` |
| Service Worker (generado) | `client/public/firebase-messaging-sw.js` |
| Generador del SW | `client/scripts/generate-firebase-sw.mjs` |
| Controller push backend | `server/controllers/PushNotification.controller.js` |
| FCM service backend (data-only payload) | `server/services/fcm.service.js` |
| Envío desde bitácora | `server/controllers/Bitacora.controller.js` (notifyAllHRs) |
| Endpoints frontend | `client/src/redux/apis/APIsEndpoints.js` |

### 🔮 Pendiente para producción
1. ✅ Merge PR #24 → `dev` (completado)
2. ✅ Merge PR #25 → `main` (completado)
3. ⬆️ Deploy `main` a Vercel + Render (pendiente)
4. ✅ Verificar que push NO se duplique en Chrome (pendiente de deploy)
5. ❌ Edge Desktop+Mobile: diagnosticar (pospuesto)
6. ❌ Firefox Desktop: push no llega (Mozilla Autopush)
7. 🧪 Prueba E2E: crear bitácora como Employee → push llega a HR

*(Tarea completada — pendiente deploy a producción desde `main`)*

---

*Actualizado: 2026-05-31*
*Tarea #021 ✅ COMPLETADA — PRs #24 y #25 mergeados, pendiente deploy a producción*
