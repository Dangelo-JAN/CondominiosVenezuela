# 🛠️ TAREA: Payroll Social Benefits Tab UI
**ID:** #043 | **Estado:** 🟡 EN CURSO (REABIERTA - FIX ADICIONAL) | **Fecha:** 2026-11-12

---

## 🎯 OBJETIVO FINAL
Implementar la UI completa de la pestaña "Prestaciones Sociales" en HRPayrollPage con 3 subtabs (Libro, Liquidaciones, Devengado) siguiendo el patrón de PayrollVacationsTab, reemplazando el placeholder "En Desarrollo".

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)
*Usa esto para "despertar" a la IA si el chat se cierra:*

- **Lo último que funcionó:** Build 0 errores. Commit ac37c19 - fix: stabilize employees Redux selector reference.
- **Dónde se rompió/detuvo:** Infinite re-renders persistía porque el Redux selector `state.employeeReducer?.data || []` creaba nueva referencia `[]` cada render cuando data es null.
- **Siguiente acción inmediata:** Verificar fix en deploy, actualizar PR #59.

---

## 📝 CAMBIOS TÉCNICOS CLAVE
- [x] **Fase 1 (Original):** Estructura base `PayrollSocialBenefitsTab.jsx` con 3 subtabs internos, tabs navigation, loading/empty states
- [x] **Fase 2 (Original):** Subtab Libro (Ledger) - Lista paginada, filtros (empleado, entry_type), modal detalle entrada (LedgerDetailModal)
- [x] **Fase 3 (Original):** Subtab Liquidaciones (Settlements) - CRUD completo, modal detalle con historial (SettlementDetailModal), modal formulario calcular/crear/editar (SettlementFormModal), acciones aprobar/pagar/rechazar
- [x] **Fase 4 (Original):** Subtab Devengado (Accrual) - Formulario calcular/registrar (AccrualFormModal), preview cálculo, lista devengados recientes filtrada del ledger
- [x] **Fase 5 (Original):** Integración completa, responsive, dark mode, build 0 errores, commit, PR #59 hacia 037-payroll-venezuelan-module
- [x] **Fix Fase 1:** Reemplazar `employees` local state (`useState([])`) por Redux selector
- [x] **Fix Fase 2:** Agregar header principal (título, descripción, botón refresh) antes del sub-tabs bar — patrón `PayrollVacationsTab`
- [x] **Fix Fase 3:** Verificar todos `CustomSelect` usan `"select"` (no `""`) — consistencia Radix Select
- [x] **Fix Fase 4 (CRÍTICO):** Estabilizar referencia `employees` con `useMemo` — **fixea infinite re-renders definitivo** (Regla #5 bug-prevention.md)
- [x] **Build + Test:** 0 errores
- [x] **Commit & Push:** `ac37c19` — fix: stabilize employees Redux selector reference
- [ ] **PR Update:** Actualizar PR #59 hacia `037-payroll-venezuelan-module`

---

## 🐛 BUGS CRÍTICOS FIXEADOS (Documentados en `.agent/rules/global-context/bug-prevention.md`)

| Bug | Causa Raíz | Fix Aplicado | Regla |
|-----|------------|--------------|-------|
| **Infinite Re-renders v1** | `employees = useState([])` local → nueva referencia cada render | Redux selector | #5 |
| **Infinite Re-renders v2 (ROOT CAUSE)** | Redux selector `state.employeeReducer?.data \|\| []` crea **nueva `[]` cada render** cuando data es null | `useMemo(() => rawEmployees \|\| [], [rawEmployees])` para estabilizar referencia | #5 |
| **Falta Header Principal** | No seguía patrón tabs períodos/conceptos/políticas | Agregado header con título, descripción, refresh button | Consistencia UI |
| **Radix Select Empty String** | Verificado: todos usan `"select"` | Ya correcto | #2 |

---

## ⚠️ NOTAS DE MEMORIA
- *Regla:* PR OBLIGATORIO hacia `037-payroll-venezuelan-module` (rama padre), NUNCA a `dev` ni `main` ✅ CUMPLIDA (PR #59)
- *Regla:* Design System v4 - Acento `blue` (#003DA5) para Nóminas/Prestaciones ✅
- *Regla:* Usar `ThemedListWrapper`, `ThemedHeadingBar`, `ThemedListContainer` con `accent="blue"` ✅
- *Regla:* Usar `CustomSelect` con `accentColor="blue"`, `useIsDark()` para tema ✅
- *Regla:* Patrón exacto de `PayrollVacationsTab.jsx` (sub-componentes internos, modales animados) ✅
- *Bug Root Cause Final:* **Redux selector con `|| []` crea nueva referencia cada render** — **Regla #5 bug-prevention.md**: "Verificar que `useEffect` en modales NO tengan en deps props que sean nuevos objetos/arrays cada render del padre (usa Redux selectors o quita de deps)" — **El Redux selector DEBE devolver referencia estable**
- *Branch:* 043-payroll-social-benefits-tab-ui (desde 037-payroll-venezuelan-module) ✅
- *Commits:* 6b99e76 (feat), 93f3fac (fix Redux key), 35d35a6 (fix infinite re-renders v1 + header), ac37c19 (fix infinite re-renders v2 - root cause)
- *PR:* #59 hacia 037-payroll-venezuelan-module ✅ (actualizar con fixes)
- *Thunk:* `HandleSocialBenefits` - todos los endpoints integrados (LEDGER_GETALL, SETTLEMENTS_*, ACCRUAL_*)
- *State:* Redux slice - socialBenefitsLedger, socialBenefitsLedgerEmployee, settlements, settlement, settlementCalculation, accrualCalculation
- *Build:* ✅ 0 errores (25.09s)