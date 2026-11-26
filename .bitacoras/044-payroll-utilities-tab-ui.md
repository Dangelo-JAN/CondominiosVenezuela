# 🛠️ TAREA: Payroll Utilities Tab UI Implementation
**ID:** #044 | **Estado:** 🟡 EN CURSO | **Fecha:** 2026-11-16

---

## 🎯 OBJETIVO FINAL
Implementar la UI completa de la pestaña **Utilidades** en la página de nómina con 3 sub-tabs funcionales: Períodos | Pagos | Cálculo, reemplazando el placeholder "En desarrollo".

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)

- **Lo último que funcionó:** Fases 1-3 completadas, Fase 4 iniciada. Estructura base con 3 sub-tabs, ThemedList con datos reales via Redux (payrollReducer), filtros funcionales, paginación, dark/light mode, build 0 errores, tests 127 passed. **FASE 2 Y 3 COMPLETADAS:** PeriodFormModal + PeriodDetailModal (CRUD completo + preview), CalculatePreviewModal (tabla distribución + aprobar/pagar). **BUGS CRÍTICOS RESUELTOS:** 
  1. Hooks (`useMemo`) dentro de render helpers → movidos a nivel superior (Bug Prevention #7)
  2. `useHRAuth()` mal usado: `hasPermission` destruido en lugar de `can`; acciones inventadas (`calculate`, `approve`, `pay`) → mapeadas a CRUD válido (`update`) (Bug Prevention #8)
  3. `ChevronLeft/Right` faltantes en import de lucide-react
  4. `ConfirmDialog` variants corregidas a `"info"` (solo existen `danger`, `warning`, `info`)
  5. `useSearchParams` innecesario removido
  6. Import `Clock` agregado
  7. **Backend: `calculated_by` faltante en schema + `description` vs `notes` + `strictPopulate: false`** (Error 500 en populate)
  8. **Race condition Redux** → `utilidadesPeriodsAll` para dropdowns
  9. **Filtros:** `DRAFT` en dropdown + badge visual
  10. **Re-fetch automático** tras create/update
  Rama `044-payroll-utilities-tab-ui` creada desde `037-payroll-venezuelan-module`. PR #60 abierto.

- **Dónde se rompió/detuvo:** Error en deploy Vercel (desarrollo): `Unexpected Application Error! t is not a function` al ingresar a la pestaña Utilidades. **RESUELTO AL 100%** - Causa raíz: `hasPermission` destruido de `useHRAuth()` (no existe, es `undefined`), minificado a `t` en producción. Acciones inventadas (`calculate`, `approve`, `pay`) no existen en `DEFAULT_PERMISSIONS` de `useHRAuth.js`. **Backend Error 500 resuelto:** `calculated_by` faltante en schema + `description` vs `notes` + `strictPopulate: false` en populate.

- **Siguiente acción inmediata:** Continuar con Fase 4: PaymentDetailModal + Pago Individual.

---

## 📝 PLAN PASO A PASO (FASES CON STOPS OBLIGATORIOS)

### FASE 1: Estructura Base + Sub-tabs + Header + Redux Selectors ✅ COMPLETADA
- [x] Reemplazo completo `PayrollUtilitiesTab.jsx` (placeholder → implementación base)
- [x] 3 Sub-tabs: Períodos | Pagos | Cálculo con navegación (patrón PayrollSocialBenefitsTab)
- [x] ThemedList (acento blue) para Períodos y Pagos con datos Redux
- [x] Filtros con CustomSelect (valores iniciales "select" - Bug Prevention #2)
- [x] Redux selectors usando clave correcta `state.payrollReducer` (Bug Prevention #1)
- [x] Hooks order: useCallback/useMemo ANTES de useEffect (Bug Prevention #3)
- [x] Variables/opciones en scope principal ANTES de render functions (Bug Prevention #4)
- [x] Modales preparados sin props inestables en useEffect deps (Bug Prevention #5)
- [x] Validación pura preparada (Bug Prevention #6)
- [x] **Bug Prevention #7:** Hooks (`useMemo`) movidos fuera de render helpers a nivel superior
- [x] **Bug Prevention #8:** `useHRAuth()` corregido: `hasPermission` → `can`, acciones CRUD válidas
- [x] Import `ChevronLeft`, `ChevronRight` agregado a lucide-react
- [x] `ConfirmDialog` variants corregidas a `"info"`
- [x] `useSearchParams` innecesario removido
- [x] Import `Clock` agregado
- [x] Build: `npm run build` → 0 errores
- [x] Tests: Client + Server → 127 passed, 3 skipped
- [x] STOP 1: Aprobación usuario para Fase 2

### FASE 2: Períodos CRUD (PeriodFormModal + PeriodDetailModal) ✅ COMPLETADA
- [x] PeriodFormModal: Crear/editar período (año, utilidad neta, fecha cálculo, deadline, notas)
- [x] PeriodDetailModal: Detalle completo con montos, empleados elegibles, historial
- [x] Validación pura + `useMemo(isFormValid)` + handlers `useCallback`
- [x] Integración con thunks: `PERIODS_CREATE`, `PERIODS_UPDATE`, `PERIODS_GETONE`
- [x] Preview de cálculo inline en modal creación
- [x] Re-fetch automático lista tras create/update
- [x] STOP 2: Aprobación usuario para Fase 3

### FASE 3: Calcular → Preview → Aprobar → Pagar (CalculatePreviewModal) ✅ COMPLETADA
- [x] CalculatePreviewModal: Preview de distribución con montos por empleado
- [x] Flujo: Calcular → Preview (modal) → Aprobar → Pagar
- [x] Integración thunks: `PERIODS_CALCULATE`, `PERIODS_APPROVE`, `PERIODS_PAY`
- [x] Tabla distribución por empleado (días, salario, bruto, ISLR, neto)
- [x] Totales al pie de tabla
- [x] STOP 3: Aprobación usuario para Fase 4

### FASE 4: Pagos Detalle + Pago Individual (PaymentDetailModal) 🔄 EN PROGRESO
- [ ] PaymentDetailModal: Detalle de pago individual por empleado
- [ ] Acción: Marcar como pagado individual (`PAYMENTS_PAY`)
- [ ] STOP 4: Aprobación usuario para Fase 5

### FASE 5: Cálculo Preview Interactivo ⏳ PENDIENTE
- [ ] Simulador de distribución 15% con parámetros ajustables
- [ ] Preview en tiempo real sin persistir
- [ ] STOP 5: Aprobación usuario para Fase 6

### FASE 6: Pulido + Tests Finales + Merge ⏳ PENDIENTE
- [ ] Responsive, dark/light mode, accesibilidad
- [ ] Tests completos
- [ ] Merge a `037-payroll-venezuelan-module`
- [ ] STOP 6: Aprobación final usuario

---

## 📝 CAMBIOS TÉCNICOS CLAVE
- [x] Crear rama `044-payroll-utilities-tab-ui` desde `037-payroll-venezuelan-module`
- [x] Reemplazo completo `PayrollUtilitiesTab.jsx` (placeholder → implementación base)
- [x] 3 Sub-tabs: Períodos | Pagos | Cálculo con navegación
- [x] ThemedList (acento blue) para Períodos y Pagos con datos Redux
- [x] Filtros con CustomSelect (valores iniciales "select" - Bug Prevention #2)
- [x] Redux selectors usando clave correcta `state.payrollReducer` (Bug Prevention #1)
- [x] Hooks order: useCallback/useMemo ANTES de useEffect (Bug Prevention #3)
- [x] Variables/opciones en scope principal ANTES de render functions (Bug Prevention #4)
- [x] Modales preparados sin props inestables en useEffect deps (Bug Prevention #5)
- [x] Validación pura preparada (Bug Prevention #6)
- [x] **Bug Prevention #7:** Hooks (`useMemo`) movidos fuera de render helpers a nivel superior
- [x] **Bug Prevention #8:** `useHRAuth()` corregido: `hasPermission` → `can`, acciones CRUD válidas
- [x] Import `ChevronLeft`, `ChevronRight` agregado a lucide-react
- [x] `ConfirmDialog` variants corregidas a `"info"`
- [x] `useSearchParams` innecesario removido
- [x] Import `Clock` agregado
- [x] **Bug Prevention #4:** `formatCurrency`/`formatDate` a nivel módulo (evita error producción)
- [x] **Race condition Redux:** `utilidadesPeriodsAll` para dropdowns (separado de lista paginada)
- [x] **Re-fetch automático** tras create/update
- [x] **Filtros:** `DRAFT` en dropdown + badge visual + `PERIOD_STATUS_CONFIG`
- [x] **Permisos:** `calculate/approve/pay` → `update` (CRUD válido per HR.model.js)
- [x] Build: `npm run build` → 0 errores
- [x] Tests: Client + Server → 127 passed, 3 skipped
- [x] Fase 2: PeriodFormModal + PeriodDetailModal (CRUD Períodos)
- [x] Fase 3: CalculatePreviewModal (Calcular → Preview → Aprobar → Pagar)
- [ ] Fase 4: PaymentDetailModal + Pago individual
- [ ] Fase 5: Cálculo Preview interactivo
- [ ] Fase 6: Pulido + Tests finales + Merge a 037-payroll-venezuelan-module

---

## ⚠️ NOTAS DE MEMORIA
- **Regla:** Bug Prevention (8 pilares) aplicados estrictamente - ver `.agent/rules/global-context/bug-prevention.md`
- **Regla:** PR hacia `037-payroll-venezuelan-module` (NUNCA a main/dev directamente)
- **Regla:** No marcar COMPLETADO hasta que deploy Vercel funcione sin errores
- **Branch:** `044-payroll-utilities-tab-ui` (desde `037-payroll-venezuelan-module`)
- **Commit:** `1757e7f` (último: fix useHRAuth usage + bug-prevention.md v6)
- **PR:** #60 → `037-payroll-venezuelan-module`
- **Bugs resueltos:** 
  1. Pantalla en blanco (import Clock) - `943f520`
  2. "s is not a function" (render functions regulares) - `aba6525`
  3. ConfirmDialog variants - `4dc4ebf`
  4. "t is not a function" - hooks en render helpers - `64dc702`
  5. "hasPermission is not a function" - useHRAuth() mal usado - `1757e7f`
- **Referencia patrón:** PayrollSocialBenefitsTab.jsx, PayrollVacationsTab.jsx

---

## 📋 HISTORIAL DE FIXES APLICADOS

| # | Error | Causa Raíz | Fix | Commit |
|---|-------|------------|-----|--------|
| 1 | Pantalla en blanco | Falta import `Clock` | Agregar `Clock` a import lucide-react | `943f520` |
| 2 | "s is not a function" | `useSearchParams` + `useCallback` en render functions | Funciones regulares + remover hook innecesario | `aba6525` |
| 3 | "t is not a function" | `ConfirmDialog` variants "primary"/"success" no existen | Cambiar a "info" + restaurar useSearchParams | `4dc4ebf` |
| 4 | "t is not a function" | `useMemo` dentro de `renderPeriodsTab()` y `renderPaymentsTab()` | Mover hooks a nivel superior del componente | `64dc702` |
| 5 | "hasPermission is not a function" / "t is not a function" | `hasPermission` destruido de `useHRAuth()` (no existe); acciones inventadas (`calculate`, `approve`, `pay`) no existen en `DEFAULT_PERMISSIONS` | Cambiar a `can("payroll", "update")` para calculate/approve/pay; `can("payroll", "delete")` para delete; `can("payroll", "create")` para create | `1757e7f` |
| 6 | "formatCurrency is not defined" (producción) | `formatCurrency`/`formatDate` en scope componente → minificación rompe scope | Mover a nivel módulo (export const) - Bug Prevention #4 | `1dc2b65` |
| 7 | Race condition Redux: lista vacía / dropdown vacío | 2 `useEffect` disparan `PERIODS_GETALL` simultáneo mismo key | Nueva key `utilidadesPeriodsAll` para dropdowns (separado de lista paginada) | `1316162` |
| 8 | "No tienes permiso para calculate en payroll" | Rutas usan `PermissionCheck('payroll','calculate')` pero schema solo tiene CRUD | Cambiar a `PermissionCheck('payroll','update')` en 9 rutas | `93d94b9` |
| 9 | "UtilidadesPeriod validation failed: status: DRAFT" | Enum modelo sin `DRAFT`; controlador usa `DRAFT` | Agregar `DRAFT` a enum + default `DRAFT` | `f445974` |
| 10 | DRAFT no visible en filtro/badge | `PERIOD_STATUS_OPTIONS` y `PERIOD_STATUS_CONFIG` sin DRAFT | Agregar DRAFT a opciones + config visual | `47244e7` |
| 11 | Lista no refresca tras crear/editar | `handlePeriodFormSubmit` no re-fetch | `dispatch(PERIODS_GETALL)` post create/update | `6816506` |
| 12 | **Error 500: StrictPopulateError calculated_by** | `calculated_by` en controller/populate pero **no en Schema**; `description` vs `notes` | 1. Agregar `calculated_by` a Schema 2. `description`→`notes` 3. `strictPopulate: false` | `7ad610d` |

---

## 🐛 BUGS RESUELTOS - DETALLE TÉCNICO

### Bug #4: Hooks en Render Helpers (Bug Prevention #7)
**Error:** `t is not a function` en producción minificada
**Causa:** `useMemo` dentro de `renderPeriodsTab()` y `renderPaymentsTab()` - funciones helper condicionales
**Fix:** Mover `useMemo` a nivel superior del componente (sección "Shared memoized values"), declarar `periodOptions` una sola vez, reutilizar en `renderPaymentsTab()`

### Bug #5: useHRAuth() Mal Usado (Bug Prevention #8)
**Error:** `hasPermission is not a function` (dev) / `t is not a function` (prod)
**Causa Raíz:** 
- `useHRAuth()` NO exporta `hasPermission` (retorna `can`, `canCreate`, `canRead`, `canUpdate`, `canDelete`, `role`, `isAdmin`, `isManager`, `isViewer`, `isReady`, `permissions`)
- `hasPermission` = `undefined` → al invocar `hasPermission(...)` crash
- En producción minificada: variable `hasPermission` renombrada a `t` → `"t is not a function"`
- Acciones inventadas `calculate`, `approve`, `pay` NO existen en `DEFAULT_PERMISSIONS[role].payroll` (solo CRUD: create, read, update, delete)

**Fix Aplicado:**
```javascript
// ❌ ANTES
const { hasPermission } = useHRAuth()
hasPermission("payroll", "calculate")
hasPermission("payroll", "approve")  
hasPermission("payroll", "pay")

// ✅ DESPUÉS
const { can } = useHRAuth()
can("payroll", "update")   // calculate, approve, pay → todos mapean a "update"
can("payroll", "delete")   // delete
can("payroll", "create")   // create
```

---

### Bug #6: formatCurrency is not defined (Bug Prevention #4)
**Error:** `formatCurrency is not defined` en producción (Vercel)
**Causa Raíz:** `formatCurrency` y `formatDate` definidas dentro del componente principal → minificación + code splitting mueven funciones a chunks separados → scope perdido en producción
**Fix:** Mover `formatCurrency` y `formatDate` a **nivel de módulo** (export const) fuera del componente, disponible globalmente sin importar code splitting.

---

### Bug #7: Race Condition Redux - Lista Vacía / Dropdown Vacío
**Error:** Lista principal vacía o dropdown de pagos vacío tras refresh
**Causa Raíz:** 2 `useEffect` disparan `PERIODS_GETALL` simultáneo al mismo Redux key `utilidadesPeriods`:
- #1: Lista principal con filtros + paginación
- #2: Dropdown pagos (sin filtros, limit=100)
**Gana el último** → paginación rota o datos incorrectos
**Fix:** Nueva Redux key **`utilidadesPeriodsAll`** para dropdowns (sin paginación, sin filtros). `useEffect` dedicado para `PERIODS_GETALL_FOR_SELECT`. Selector `periodOptions` usa `utilidadesPeriodsAll.data`.

---

### Bug #8: Permisos - "No tienes permiso para calculate en payroll"
**Error:** 403 en 9 rutas de nómina (`calculate`, `approve`, `pay`, `close`, `void`, `recalculate`, `validate-formula`, `simulate`)
**Causa Raíz:** Rutas usan `PermissionCheck('payroll','calculate')` pero `PermissionModuleSchema` solo define CRUD (`create, read, update, delete`). `calculate` no existe → `undefined` → denegado.
**Fix:** Cambiar 9 rutas a `PermissionCheck('payroll','update')` (mapeo CRUD válido per HR.model.js). Frontend ya usaba `can("payroll","update")`.

---

### Bug #9: Enum Status - "DRAFT is not a valid enum value"
**Error:** Mongoose validation failed al crear período
**Causa Raíz:** Modelo enum: `['OPEN','CALCULATING','CALCULATED','APPROVED','PAID','CLOSED']` — **Falta `DRAFT`**. Controlador crea con `status: 'DRAFT'`.
**Fix:** Agregar `'DRAFT'` al enum + cambiar `default: 'DRAFT'`.

---

### Bug #9b: DRAFT Invisible en Filtro y Badge
**Error:** Períodos DRAFT no aparecen en filtro "Borrador" ni tienen badge visual
**Causa:** `PERIOD_STATUS_OPTIONS` y `PERIOD_STATUS_CONFIG` sin entrada DRAFT
**Fix:** Agregar `{ value: "DRAFT", label: "Borrador" }` a opciones + config visual (gris, icono FileText).

---

### Bug #10: Lista No Refresca Tras Crear/Editar
**Error:** Período creado no aparece en lista hasta refresh manual
**Causa:** `handlePeriodFormSubmit` no re-fetch tras `PERIODS_CREATE/UPDATE`
**Fix:** `dispatch(HandleUtilidades({ type: "PERIODS_GETALL", ...buildPeriodParams() }))` post create/update.

---

### Bug #12: **Error 500 StrictPopulateError calculated_by** (CRÍTICO BACKEND)
**Error:** `StrictPopulateError: calculated_by` en `getPeriods` / `getPeriodById` → Deploy Vercel falla
**Causa Raíz Múltiple:**
1. **Schema incompleto:** `calculated_by` usado en controller (`createPeriod`, `populate`) pero **NO existe en Schema** → Mongoose lo ignora en create + crash en populate
2. **Campo equivocado:** `createPeriod` envía `description: description || ''` pero Schema usa `notes` → descripción no se guarda
3. **Sin `strictPopulate: false`:** Documentos legacy sin `calculated_by` rompen `.populate()`

**Fix Aplicado (3 pasos):**
1. **Schema:** Agregar `calculated_by: { type: Schema.Types.ObjectId, ref: 'HumanResources' }` arriba de `approved_by`
2. **Controller createPeriod:** Cambiar `description: description || ''` → `notes: description || ''`
3. **Controller getPeriods/getPeriodById:** Cambiar `.populate('calculated_by', ...)` → `.populate({ path: 'calculated_by', select: 'firstname lastname', strictPopulate: false })` (mismo para `approved_by`)

**Archivos modificados:**
- `server/models/payroll/UtilidadesPeriod.model.js` (+ `calculated_by`, default `DRAFT`)
- `server/controllers/UtilidadesController.js` (`createPeriod`: `notes`, `getPeriods`/`getPeriodById`: `strictPopulate: false`)