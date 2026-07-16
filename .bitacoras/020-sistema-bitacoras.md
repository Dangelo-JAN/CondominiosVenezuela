# 🛠️ TAREA: Sistema de Bitácoras + Notificaciones In-App
**ID:** #020 | **Estado:** ✅ COMPLETADO | **Fecha:** 2026-05-24

---

## 🎯 OBJETIVO FINAL
> Que los empleados puedan crear bitácoras (novedades) con título, contenido e imágenes, y que los coordinadores HR reciban notificaciones in-app cuando se cree una nueva.

---

## 🚦 RESUMEN FINAL

- **PR:** https://github.com/Dangelo-JAN/CondominiosVenezuela/pull/21
- **Branch:** `feat/add-bitacoras-and-notifications-system`
- **Rama base:** `dev`
- **Commits:** `c3524b7` · `34dc540` · `52414e8` · `4a3d6b4` · `0e46a03` (5 commits)
- **Fases:** ✅ F1 Backend · ✅ F2 Redux · ✅ F3 HR Page · ✅ F4 Employee Page · ✅ F5 Notifications UI
- **Build final:** 2707 modules, 0 errores
- **PR status:** 🚀 Creado — pendiente de review y merge (NO MERGEAR)

---

## 📋 PLAN DE FASES

| Fase | Descripción | Archivos | Status |
|------|-------------|----------|--------|
| F1 | Backend: Modelos + APIs + Integración | 9 archivos | ✅ COMPLETADO |
| F2 | Frontend: Redux (Thunks + Slices + Store) | 7 archivos | ✅ COMPLETADO |
| F3 | Frontend: Página HR (listar/gestionar) | 3 archivos | ✅ COMPLETADO |
| F4 | Frontend: Página Empleado (crear/editar) | 3 archivos | ✅ COMPLETADO |
| F5 | Frontend: Notificaciones In-App UI | 2 archivos | ✅ COMPLETADO |

---

## 📝 CAMBIOS TÉCNICOS CLAVE — DETALLE COMPLETO

### FASE 1 — Backend ✅ (Commit: c3524b7)

| Archivo | Acción | Líneas clave | Descripción |
|---------|--------|-------------|-------------|
| `server/models/Bitacora.model.js` | ✅ Creado | 36 | Schema: title (String req), content (String req), images ([String], max 5), employee (ObjectId ref Employee), isDeleted, deletedAt, organizationID, timestamps |
| `server/middlewares/BitacoraUpload.middleware.js` | ✅ Creado | 26 | Multer memoryStorage + fileFilter (solo imágenes) + límites (10MB, 5 archivos). Exporta `uploadBitacoraMiddleware` como instancia multer |
| `server/controllers/Bitacora.controller.js` | ✅ Creado | 307 | 5 handlers: `HandleCreateBitacora`(crea + auto-notifica a HRs), `HandleUpdateBitacora`(solo autor, maneja imágenes), `HandleGetMyBitacoras`, `HandleGetAllBitacoras`(con filtros query), `HandleGetBitacoraById`, `HandleDeleteBitacora`(soft-delete). Helpers: `uploadImagesToCloudinary`, `deleteImagesFromCloudinary`, `notifyAllHRs` |
| `server/routes/Bitacora.route.js` | ✅ Creado | 42 | EMP: POST /create (VerifyEmployeeToken + upload.array), PATCH /update/:id, GET /my-bitacoras. HR: GET /all, GET /:id, DELETE /delete/:id (VerifyhHRToken + PermissionCheck("bitacoras")) |
| `server/models/Notification.model.js` | ✅ Creado | 45 | Schema: recipient (ObjectId ref HumanResources), type (enum: bitacora_created), title, message, relatedTo (ObjectId polimórfico con refPath "onModel"), onModel ("Bitacora"), isRead (bool), isDeleted, deletedAt, organizationID, timestamps. Índices: {recipient,isRead,isDeleted}, {recipient,createdAt} |
| `server/controllers/Notification.controller.js` | ✅ Creado | 105 | 4 handlers: `HandleGetMyNotifications`(limit 50, sort createdAt DESC), `HandleGetUnreadCount`(countDocuments), `HandleMarkAsRead`(findOneAndUpdate), `HandleMarkAllAsRead`(updateMany) |
| `server/routes/Notification.route.js` | ✅ Creado | 20 | 4 rutas HR: GET /my-notifications, GET /unread-count, PATCH /read/:id, PATCH /read-all |
| `server/index.js` | ✏️ Editado | +2 líneas | Import + registro de `BitacoraRouter` y `NotificationRouter` |
| `server/models/HR.model.js` | ✏️ Editado | +4 líneas | Permiso `bitacoras` agregado a `PermissionsSchema` (línea 24), y a `DEFAULT_PERMISSIONS` para HR-Admin (read+delete), HR-Manager (read+delete), HR-Viewer (read-only) |

### FASE 2 — Frontend Redux ✅ (Commit: 34dc540)

| Archivo | Acción | Líneas | Descripción |
|---------|--------|--------|-------------|
| `client/src/redux/apis/APIsEndpoints.js` | ✏️ Editado | +24 | Nuevos grupos: `HRBitacorasEndPoints` (CREATE, UPDATE, GET_MY, GET_ALL, GET_BY_ID, DELETE) y `HRNotificationsEndPoints` (GET_MY, UNREAD_COUNT, MARK_READ, MARK_ALL_READ) |
| `client/src/redux/Thunks/HRBitacorasThunk.js` | ✅ Creado | 91 | 5 thunks: `HandleCreateBitacora`(employeeApiService.post + multipart/form-data), `HandleUpdateBitacora`(employeeApiService.patch + multipart), `HandleGetMyBitacoras`, `HandleGetAllBitacoras`(hrApiService.get + params), `HandleDeleteBitacoraByHR`(hrApiService.delete) |
| `client/src/redux/Thunks/HRNotificationsThunk.js` | ✅ Creado | 72 | 4 thunks: `HandleGetMyNotifications`, `HandleGetUnreadNotificationCount`, `HandleMarkNotificationRead`, `HandleMarkAllNotificationsRead` |
| `client/src/redux/Slices/HRBitacorasSlice.js` | ✅ Creado | 35 | Slice con `data`, `isLoading`, `success: false`(booleano — evita bug #B04), `message`, `error`. ExtraReducers vincula 5 thunks al `HRBitacorasAsyncReducer` |
| `client/src/redux/Slices/HRNotificationsSlice.js` | ✅ Creado | 35 | Slice con `notifications`, `unreadCount: 0`, `isLoading`, `success`, `error`. ExtraReducers vincula 4 thunks al `HRNotificationsAsyncReducer` |
| `client/src/redux/AsyncReducers/asyncreducer.js` | ✏️ Editado | +108 | Dos nuevos reducers: `HRBitacorasAsyncReducer`(maneja get/create/update/delete con thunkName) y `HRNotificationsAsyncReducer`(maneja get/unreadCount/markRead/markAllRead) |
| `client/src/redux/app/store.js` | ✏️ Editado | +3 | Import + registro de `HRBitacorasReducer` y `HRNotificationsReducer` |

### FASE 3 — Frontend HR Page ✅ (Commit: 52414e8)

| Archivo | Acción | Líneas | Descripción |
|---------|--------|--------|-------------|
| `client/src/pages/HumanResources/Dashboard Childs/hrbitacoraspage.jsx` | ✅ Creado | 378 | Página completa: Header con badge acento yellow + contador, Divider yellow, 3 filtros (empleado select, búsqueda textual, rango fechas), ThemedListWrapper/HeadingBar/Container con accent="yellow", filas con hover:-translate-y-0.5, modal detalle (título, contenido, galería imágenes), modal confirmación eliminación, empty state, loading state |
| `client/src/routes/HRroutes.jsx` | ✏️ Editado | +5 | Import `HRBitacorasPage` + ruta `/HR/dashboard/bitacoras` en children |
| `client/src/components/ui/HRsidebar.jsx` | ✏️ Editado | +1 | Item `{ label: "Bitácoras", path: "/HR/dashboard/bitacoras", icon: "/assets/HR-Dashboard/notice.png" }` |

---

### FASE 4 — Frontend Employee Page ✅ (Commit: 4a3d6b4)

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `client/src/pages/Employees/Dashboard Childs/bitacoraspage.jsx` | ✅ Creado | Página empleado: listado en cards con hover:-translate-y-1, modal crear/editar con FormData+upload imágenes, modal detalle con galería, acento yellow |
| `client/src/routes/employeeroutes.jsx` | ✏️ Editado | Ruta `/auth/employee/employee-dashboard/bitacoras` |
| `client/src/components/ui/EmployeeSidebar.jsx` | ✏️ Editado | Item "Bitácoras" en navegación |

---

### FASE 5 — Frontend Notifications In-App UI ✅ (Commit: 0e46a03)

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `client/src/components/common/NotificationBell.jsx` | ✅ Creado | Bell icon con badge rojo + dropdown de notificaciones (4 estados: loading, empty, data, error) + polling 30s + marcar leídas |
| `client/src/components/common/DashboardLayout.jsx` | ✏️ Editado | `<NotificationBell />` agregado en top bar (junto al theme toggle) |
| `client/src/pages/Employees/employeedashboard.jsx` | ✅ Sin cambios | Ya usa `DashboardLayout`, hereda el bell automáticamente (self-hide si no hay HRtoken) |

---

## 📊 ESTRUCTURA COMPLETA DEL SISTEMA (AL DÍA)

```
server/
├── models/
│   ├── Bitacora.model.js          ✅ title, content, images[], employee, soft-delete
│   ├── Notification.model.js      ✅ recipient, type, relatedTo polimórfico, isRead
│   └── HR.model.js                ✅ Permiso "bitacoras" agregado
├── controllers/
│   ├── Bitacora.controller.js     ✅ 6 handlers + auto-notify + Cloudinary upload
│   └── Notification.controller.js ✅ 4 handlers
├── routes/
│   ├── Bitacora.route.js          ✅ 6 rutas (employee + HR)
│   └── Notification.route.js      ✅ 4 rutas (solo HR)
├── middlewares/
│   └── BitacoraUpload.middleware.js ✅ Multer + Cloudinary
└── index.js                       ✅ Rutas registradas

client/src/redux/
├── apis/APIsEndpoints.js          ✅ HRBitacorasEndPoints + HRNotificationsEndPoints
├── Thunks/
│   ├── HRBitacorasThunk.js        ✅ 5 thunks (create/update/getMy/getAll/delete)
│   └── HRNotificationsThunk.js    ✅ 4 thunks (get/unreadCount/markRead/markAllRead)
├── Slices/
│   ├── HRBitacorasSlice.js        ✅ success: boolean (evita bug #B04)
│   └── HRNotificationsSlice.js    ✅ unreadCount tracking
├── AsyncReducers/asyncreducer.js  ✅ 2 nuevos reducers
└── app/store.js                   ✅ Reducers registrados

client/src/
├── pages/HumanResources/Dashboard Childs/
│   └── hrbitacoraspage.jsx        ✅ Página HR completa
├── routes/HRroutes.jsx            ✅ Ruta /HR/dashboard/bitacoras
└── components/ui/HRsidebar.jsx    ✅ Item "Bitácoras"
```

---

## ⚠️ NOTAS DE MEMORIA (IMPORTANTES PARA REANUDAR)

### Reglas de diseño obligatorias
- `useIsDark()` en vez de `useTheme()` — prohibido usar useTheme (violación V06, V07)
- Acento Yellow #FCE300 para Bitácoras (decisión del usuario)
- Archivos React en lowercase estricto (regla global-context.md #8)
- Micro-interacciones `hover:-translate-y-1` (regla global-context.md #7)
- CommonStateHandler para formularios (regla global-context.md #9)
- Prohibido usar `<select>` nativo — usar CustomSelect/SelectField
- Prohibido gray-100/200/300 como separadores
- Prohibido acentos legacy (indigo/amber/purple)

### Reglas técnicas
- `{ success, message, data }` consistente en respuestas API
- `action.payload.data` en todos los reducers (NO action.payload directo — evita bug #B03)
- `success` debe ser booleano en slices (NO objeto — evita bug #B04)
- Soft-delete con isDeleted / deletedAt en modelos
- PermissionCheck con módulo "bitacoras" (no "notices" ni otro — evita bug #B05)
- `return` en todas las respuestas del controlador (evita bug #B06)
- Scoping por `organizationID` en todas las queries

### Datos del proyecto
- **Branch:** `feat/add-bitacoras-and-notifications-system` (desde `dev`)
- **URL remota:** `origin/feat/add-bitacoras-and-notifications-system`
- **Commits:** `c3524b7` (F1 Backend) · `34dc540` (F2 Redux) · `52414e8` (F3 HR Page) · `4a3d6b4` (F4 Employee Page) · `0e46a03` (F5 Notifications UI)
- **PR:** https://github.com/Dangelo-JAN/CondominiosVenezuela/pull/21 — pendiente de review/merge (NO mergear)
- **Auditoría V4:** No repetir bugs B01-B09, violaciones V01-V26, mejoras M01-M06

### Decisiones del usuario
- ✅ **Notificación:** In-App (no email)
- ✅ **Permisos empleado:** Crear + Editar (sin eliminar)
- ✅ **Campos:** Título + Contenido + Imágenes (vía Cloudinary)
- ✅ **Acento:** Yellow (#FCE300)
- ✅ **Plan aprobado:** 5 fases con stops de validación

*(No hay próximas acciones — tarea completada)*

---

*Actualizado: 2026-05-24*
*Tarea #020 ✅ FINALIZADA — PR #21 pendiente de merge*
