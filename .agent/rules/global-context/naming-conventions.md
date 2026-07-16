---
trigger: always_on
---

# 📛 Convenciones de Naming

## Archivos React
- **lowercase** estricto con kebab-case (ej: `dashboardpage.jsx`, `employee-list.jsx`).

## Componentes
- **PascalCase** (ej: `EntryPage`, `NotificationBell`, `ThemedList`).

## Thunks (Redux)
- **Handle + Verbo + Entidad** (ej: `HandleDeleteHREmployees`, `HandleFetchNotifications`).

## Eventos DOM / Funciones utils
- **camelCase** o minúscula concatenada (ej: `toggleTheme`, `formatDate`).

## Rutas (backend)
- **lowercase** con guiones (ej: `/api/v1/push/subscribe`, `/api/v1/employees`).

## Modelos (Mongoose)
- **PascalCase** + `.model.js` (ej: `PushSubscription.model.js`, `Employee.model.js`).
