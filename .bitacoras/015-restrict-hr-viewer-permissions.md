# 🛠️ TAREA: Restringir Permisos HR-Viewer
**ID:** #015 | **Estado:** ✅ COMPLETADO | **Fecha:** 2026-05-12 → 2026-06-07

---

## 🎯 OBJETIVO FINAL
> Restringir el acceso y funcionalidades del perfil **HR-Viewer** en el panel HR, ocultando páginas, botones de crear, editar, eliminar, aprobar y rechazar. Los perfiles HR-Admin y HR-Manager deben permanecer intactos.

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)

- **Lo último que funcionó:** PR #26 mergeado a dev
- **Dónde se detuvo:** N/A — tarea completada
- **Siguiente acción inmediata:** N/A

---

## 📝 CAMBIOS TÉCNICOS CLAVE

### FASE 1-3: Bugfixes de infraestructura (Sidebar + Auth)
- [x] **Bug #1 — GET_HR_ME con método incorrecto**: Llamado con `HandlePostHumanResources` (POST) pero la ruta es GET → cambiado a `HandleGetHumanResources` en `HRprotectedroutes.jsx` (commit `fff79e1`)
- [x] **Bug #2 — Reducer pisaba `role`/`permissions`**: `HRcodeavailable` hacía `state.data = action.payload` machacando todo → cambiado a merge `{...state.data, ...action.payload}` en `asyncreducer.js` (commit `fff79e1`)
- [x] **Bug #3 — `isReady` faltante**: `ProtectedHRRoute` usaba `isReady` del hook pero no existía en el return → agregado a `useHRAuth.js` (commit `c04694b`)
- [x] **Bug #4 — Sidebar render sin datos**: Renderizaba contenido antes de tener rol → agregado guard `if (!role) return null` en `HRsidebar.jsx` (commit `c04694b`)

### FASE 4: Ocultar botones CREAR para HR-Viewer
- [x] `employeespage.jsx` — `AddEmployeesDialogBox` envuelto en `{!isHRViewer && ...}`
- [x] `departmentpage.jsx` — `CreateDepartmentDialogBox` envuelto en `{!isHRViewer && ...}`
- [x] `HRSchedulePage.jsx` — Botón "Nuevo horario" envuelto en `{!isHRViewer && ...}`
- [x] `HRRequestspage.jsx` — Botón "Nueva Solicitud" envuelto en `{!isHRViewer && ...}`
- [x] Commit: `730fbf2` ✅

### FASE 5: Ocultar botones EDITAR/ELIMINAR/APROBAR/RECHAZAR para HR-Viewer
- [x] `ListDesigns.jsx` — Nueva prop `hideDelete` en `ListItems`
- [x] `employeespage.jsx` — `hideDelete={isHRViewer}` pasado a `ListItems`, ocultando `DeleteEmployeeDialogBox`
- [x] `departmentTabs.jsx` — Dropdown "Ajustes" (Actualizar/Eliminar) condicional por rol
- [x] `HRSchedulePage.jsx` — `ScheduleCard` recibe `isViewer`; acciones de Copy/Edit/Delete/Toggle ocultas
- [x] `HRRequestspage.jsx` — Edit/Delete en tabla + Edit/Delete/Approve/Reject en modal detalle ocultos para Viewer
- [x] Commit: `303b78e` ✅

### Bugfix extra: Dialog import faltante
- [x] `HRRequestspage.jsx` — `RequestDetailsDialog` usaba `Dialog.Root`, `Dialog.Portal`, etc. SIN importar `Dialog` → agregado `import * as Dialog from "@radix-ui/react-dialog"`. El modal nunca funcionó desde su creación por este error.
- [x] Commit: `9dd2d77` ✅

---

## 📂 ARCHIVOS MODIFICADOS

| Archivo | Cambio |
|---------|--------|
| `client/src/routes/HRprotectedroutes.jsx` | Fix método HTTP GET_HR_ME |
| `client/src/redux/AsyncReducers/asyncreducer.js` | Fix merge en HRcodeavailable |
| `client/src/hooks/useHRAuth.js` | Agregado `isReady` al return |
| `client/src/components/ui/HRsidebar.jsx` | Guard `if (!role) return null` |
| `client/src/components/common/ListDesigns.jsx` | Prop `hideDelete` en ListItems |
| `client/src/pages/HumanResources/Dashboard Childs/employeespage.jsx` | CREATE/EDIT/DELETE condicionales por rol |
| `client/src/pages/HumanResources/Dashboard Childs/departmentpage.jsx` | CREATE/EDIT/DELETE condicionales por rol |
| `client/src/pages/HumanResources/Dashboard Childs/HRSchedulePage.jsx` | CREATE/EDIT/DELETE condicionales por rol |
| `client/src/pages/HumanResources/Dashboard Childs/HRRequestspage.jsx` | CREATE/EDIT/DELETE/APPROVE/REJECT condicionales + fix Dialog import |

---

## ⚠️ NOTAS DE MEMORIA

- **Regla:** Leer `role` directamente desde `HRReducer.data.role` vía `useSelector` — sin capas de abstracción innecesarias
- **Regla:** Usar `isViewer` de `useHRAuth` como fuente única para condicionales de UI por rol
- **Regla:** No modificar backend para ocultamiento de botones — solo frontend condicional
- **Regla:** `RequestDetailsDialog` usa sintaxis namespace (`Dialog.Root`, `Dialog.Portal`) por lo que necesita `import * as Dialog from "@radix-ui/react-dialog"` — NO el wrapper local `@/components/ui/dialog`
- **Branch:** `feat/restrict-hr-viewer-permissions`
- **PR:** [#26](https://github.com/Dangelo-JAN/CondominiosVenezuela/pull/26) — mergeado a `dev` el 2026-06-07

---

*Actualizado: 2026-06-07*
*✅ COMPLETADO — PR #26 mergeado a dev*
