# 🛠️ TAREA: Payroll Utilities Tab UI Implementation
**ID:** #044 | **Estado:** 🟡 EN CURSO | **Fecha:** 2026-11-16

---

## 🎯 OBJETIVO FINAL
Implementar la UI completa de la pestaña **Utilidades** en la página de nómina con 3 sub-tabs funcionales: Períodos | Pagos | Cálculo, reemplazando el placeholder "En desarrollo".

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)

- **Lo último que funcionó:** Fase 1 completada - Estructura base con 3 sub-tabs, ThemedList con datos reales via Redux (payrollReducer), filtros funcionales, paginación, dark/light mode, build 0 errores, tests 127 passed. **BUGS CRÍTICOS RESUELTOS:** 
  1. Hooks (`useMemo`) dentro de render helpers → movidos a nivel superior (Bug Prevention #7)
  2. `useHRAuth()` mal usado: `hasPermission` destruido en lugar de `can`; acciones inventadas (`calculate`, `approve`, `pay`) → mapeadas a CRUD válido (`update`) (Bug Prevention #8)
  3. `ChevronLeft/Right` faltantes en import de lucide-react
  4. `ConfirmDialog` variants corregidas a `"info"` (solo existen `danger`, `warning`, `info`)
  5. `useSearchParams` innecesario removido
  5. Import `Clock` agregado
  Rama `044-payroll-utilities-tab-ui` creada desde `037-payroll-venezuelan-module`. PR #60 abierto.

- **Dónde se rompió/detuvo:** Error en deploy Vercel (desarrollo): `Unexpected Application Error! t is not a function` al ingresar a la pestaña Utilidades. **RESUELTO AL 100%** - Causa raíz: `hasPermission` destruido de `useHRAuth()` (no existe, es `undefined`), minificado a `t` en producción. Acciones inventadas (`calculate`, `approve`, `pay`) no existen en `DEFAULT_PERMISSIONS` de `useHRAuth.js`.

- **Siguiente acción inmediata:** Continuar con Fase 2: PeriodFormModal + PeriodDetailModal (CRUD Períodos).

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

### FASE 2: Períodos CRUD (PeriodFormModal + PeriodDetailModal) ⏳ PENDIENTE
- [ ] PeriodFormModal: Crear/editar período (año, utilidad neta, fecha cálculo, deadline, notas)
- [ ] PeriodDetailModal: Detalle completo con montos, empleados elegibles, historial
- [ ] Validación pura + `useMemo(isFormValid)` + handlers `useCallback`
- [ ] Integración con thunks: `PERIODS_CREATE`, `PERIODS_UPDATE`, `PERIODS_GETONE`
- [ ] STOP 2: Aprobación usuario para Fase 3

### FASE 3: Calcular → Preview → Aprobar → Pagar (CalculatePreviewModal) ⏳ PENDIENTE
- [ ] CalculatePreviewModal: Preview de distribución con montos por empleado
- [ ] Flujo: Calcular → Preview (modal) → Aprobar → Pagar
- [ ] Integración thunks: `PERIODS_CALCULATE`, `PERIODS_APPROVE`, `PERIODS_PAY`
- [ ] STOP 3: Aprobación usuario para Fase 4

### FASE 4: Pagos Detalle + Pago Individual (PaymentDetailModal) ⏳ PENDIENTE
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
- [x] Build: `npm run build` → 0 errores
- [x] Tests: Client + Server → 127 passed, 3 skipped
- [ ] Fase 2: PeriodFormModal + PeriodDetailModal (CRUD Períodos)
- [ ] Fase 3: CalculatePreviewModal (Calcular → Preview → Aprobar → Pagar)
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