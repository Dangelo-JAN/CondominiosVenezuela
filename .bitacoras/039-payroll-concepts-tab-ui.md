# 🛠️ TAREA: Payroll Concepts Tab UI
**ID:** #039 | **Estado:** 🟡 EN CURSO | **Fecha:** 2026-11-04

---

## 🎯 OBJETIVO FINAL
> Implementar la UI completa de la pestaña "Conceptos" de nómina (CRUD: listado con filtros, búsqueda, paginación, modal crear/editar con validación de fórmula, tipos de recibo), reemplazando el placeholder "En desarrollo".

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)
*Usa esto para "despertar" a la IA si el chat se cierra:*

- **Lo último que funcionó:** 
  - PayrollConceptsTab UI completa (listado, filtros, paginación, ThemedList blue)
  - ConceptFormModal CRUD completo (todos los campos, validación fórmula, Receipt Types, incidencias, flags)
  - Fixes: rutas orden correcto, modal rendering, auth permissions en login/accept-invitation, fallback useHRAuth, isReady gate removido
  - Builds: Client 0 errores, Server 127 tests passing
  - Commit actual: `1b4f1eb` en rama `feature/039-payroll-concepts-tab-ui`

- **Dónde se rompió/detuvo (BUGS ACTUALES):**
  1. **Botón "Nuevo Concepto" NO aparece** (local + cloud): `can("payroll", "create")` retorna `false` para HR-Manager. Posible causa: `checkHR` no se dispara al cargar la app → Redux tiene `role` pero `permissions: undefined` → fallback `DEFAULT_PERMISSIONS[role]` no se evalúa correctamente.
  2. **Pantalla en blanco + error al click "Nuevo Concepto" (solo local):** Error en ConceptFormModal al abrir. Pendiente ver consola para error exacto (posible: `receiptTypes` undefined en `.map()`, thunk failure, hidratación).

- **Siguiente acción inmediata (mañana):**
  1. Verificar en Redux DevTools: `HRReducer.data.permissions` existe?
  2. Agregar `dispatch(HandleHRCheck())` en App init o ProtectedHRRoute para poblar permissions
  3. Revisar consola error local al abrir modal
  4. Verificar `receiptTypes` prop en ConceptFormModal (puede ser undefined)

---

## 📝 CAMBIOS TÉCNICOS CLAVE
- [x] **Fase 1:** Estructura base + ThemedList + Filtros (Kind, Active, Search) + Paginación ✅ **STOP APROBADO**
- [x] **Fase 2:** Modal Crear/Editar Concepto (ConceptFormModal) con todos los campos del modelo ✅ **STOP APROBADO**
- [x] **Fase 3:** Validación de fórmula en tiempo real + Carga de Receipt Types + Acciones CRUD completas (incluido en Fase 2) ✅
- [x] **Fase 4:** Builds verificados ✅ | Commit `e5a48d7` ✅ | Push ✅ 
- [x] **Fix crítico 1:** Reordenadas rutas en `Payroll.route.js` - específicas antes que `:id` (fix "Cast to ObjectId failed")
- [x] **Fix crítico 2:** Reescrito `ConceptFormModal.jsx` - early return temprano, estructura tipo `PayrollPeriodFormModal`, animaciones (fix modal no aparece)
- [x] **Fix crítico 3 (auth):** Permissions no retornadas en HRLogin/HandleAcceptInvitation + fallback cliente a DEFAULT_PERMISSIONS[role]
  - `HRAuth.controller.js`: HandleHRLogin agrega `permissions: HR.permissions.toObject()`
  - `HRProfiles.controller.js`: HandleAcceptInvitation agrega `permissions: hr.permissions.toObject()`
  - `useHRAuth.js`: fallback a `DEFAULT_PERMISSIONS[role]` si permissions undefined
  - Fix: botones Payroll (create/read) ahora visibles para HR-Manager
- [x] **Fix crítico 4 (UI gate):** Removido `isReady &&` de botones create/delete en PayrollConceptsTab
  - Patrón alineado con employees page: `can()` directo (con fallback de role en useHRAuth)
  - Fix: botones visibles para HR-Manager sin esperar isReady
- [ ] **Bug 1:** Botón "Nuevo Concepto" NO aparece (local + cloud) — `can("payroll", "create")` false para HR-Manager
- [ ] **Bug 2:** Pantalla en blanco + error al click "Nuevo Concepto" (local) — error en ConceptFormModal
- [ ] **Fase 5:** Commit fixes + Push + PR + Post-flight

---

## ⚠️ NOTAS DE MEMORIA
- *Regla:* Acento **blue** (#003DA5) para sección Nómina (design-system/index.md §21)
- *Regla:* Usar `CustomSelect` obligatorio (no `<select>` nativo)
- *Regla:* Modo oscuro con `useIsDark()` + tokens `dark:bg-[rgba(255,255,255,0.04)]`, `dark:border-[rgba(255,255,255,0.12)]`
- *Regla:* Conceptos `is_system: true` no editables/eliminables (backend + UI disabled)
- *Regla:* STOP obligatorio al final de cada fase con aprobación del usuario
- *Branch:* feature/039-payroll-concepts-tab-ui (desde 037-payroll-venezuelan-module)
- *Base PR:* 037-payroll-venezuelan-module (NO dev, NO main)