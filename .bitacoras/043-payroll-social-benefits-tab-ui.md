# 🛠️ TAREA: Payroll Social Benefits Tab UI
**ID:** #043 | **Estado:** 🟡 EN CURSO (REABIERTA) | **Fecha:** 2026-11-12

---

## 🎯 OBJETIVO FINAL
Implementar la UI completa de la pestaña "Prestaciones Sociales" en HRPayrollPage con 3 subtabs (Libro, Liquidaciones, Devengado) siguiendo el patrón de PayrollVacationsTab, reemplazando el placeholder "En Desarrollo".

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)
*Usa esto para "despertar" a la IA si el chat se cierra:*

- **Lo último que funcionó:** Tarea marcada como COMPLETADA (PR #59), pero **NO lo está**. Bugs detectados:
  1. Infinite re-renders al click "Nuevo Devengado" (prop `employees` local state `useState([])` inestable)
  2. Falta header principal (título, descripción, refresh) como en tabs períodos/conceptos/políticas
- **Dónde se rompió/detuvo:** Reabierta para fixear bugs críticos
- **Siguiente acción inmediata:** Fase 1 - Reemplazar `employees` local state por Redux selector (`employeeReducer`)

---

## 📝 CAMBIOS TÉCNICOS CLAVE
- [x] **Fase 1 (Original):** Estructura base `PayrollSocialBenefitsTab.jsx` con 3 subtabs internos, tabs navigation, loading/empty states
- [x] **Fase 2 (Original):** Subtab Libro (Ledger) - Lista paginada, filtros (empleado, entry_type), modal detalle entrada (LedgerDetailModal)
- [x] **Fase 3 (Original):** Subtab Liquidaciones (Settlements) - CRUD completo, modal detalle con historial (SettlementDetailModal), modal formulario calcular/crear/editar (SettlementFormModal), acciones aprobar/pagar/rechazar
- [x] **Fase 4 (Original):** Subtab Devengado (Accrual) - Formulario calcular/registrar (AccrualFormModal), preview cálculo, lista devengados recientes filtrada del ledger
- [x] **Fase 5 (Original):** Integración completa, responsive, dark mode, build 0 errores, commit, PR #59 hacia 037-payroll-venezuelan-module
- [ ] **Fix Fase 1:** Reemplazar `employees` local state (`useState([])`) por Redux selector `useSelector(state => state.employeeReducer.employees)`
- [ ] **Fix Fase 2:** Agregar header principal (título, descripción, botón refresh) antes del sub-tabs bar — patrón `PayrollVacationsTab`
- [ ] **Fix Fase 3:** Verificar/fixear todos `CustomSelect` usan `"select"` (no `""`) — consistencia Radix
- [ ] **Fix Fase 4:** Build + test manual (click "Nuevo Devengado" sin infinite loop)
- [ ] **Commit & Push:** Con @git-commit-formatter
- [ ] **PR Update:** Actualizar PR #59 o crear nuevo hacia `037-payroll-venezuelan-module`

---

## 📋 PLAN DE FIX (Aprobado)

| Fase | Acción | Archivos |
|------|--------|----------|
| **Fix 1** | Reemplazar `employees` local state por Redux selector (`employeeReducer`) | `PayrollSocialBenefitsTab.jsx` |
| **Fix 2** | Agregar header principal (título, descripción, refresh) antes del sub-tabs bar | `PayrollSocialBenefitsTab.jsx` |
| **Fix 3** | Verificar/fixear todos `CustomSelect` usan `"select"` (no `""`) | `PayrollSocialBenefitsTab.jsx` |
| **Fix 4** | Build + test manual | — |

---

## ⚠️ NOTAS DE MEMORIA
- *Regla:* PR OBLIGATORIO hacia `037-payroll-venezuelan-module` (rama padre), NUNCA a `dev` ni `main` ✅ CUMPLIDA (PR #59)
- *Regla:* Design System v4 - Acento `blue` (#003DA5) para Nóminas/Prestaciones ✅
- *Regla:* Usar `ThemedListWrapper`, `ThemedHeadingBar`, `ThemedListContainer` con `accent="blue"` ✅
- *Regla:* Usar `CustomSelect` con `accentColor="blue"`, `useIsDark()` para tema ✅
- *Regla:* Patrón exacto de `PayrollVacationsTab.jsx` (sub-componentes internos, modales animados) ✅
- *Bug Root Cause:* `employees = useState([])` local → nueva referencia cada render → `useEffect` en modales con `[open, employees]` → infinite loop (Regla #5 bug-prevention.md)
- *Fix Pattern:* Usar Redux selector como en `VacationsTab`: `const { data: employees } = useSelector(state => state.employeeReducer.employees)`
- *Branch:* 043-payroll-social-benefits-tab-ui (desde 037-payroll-venezuelan-module) ✅
- *Commit:* 6b99e76, 93f3fac (fix Redux state key) ✅
- *PR:* #59 hacia 037-payroll-venezuelan-module (existente, actualizar)
- *Thunk:* `HandleSocialBenefits` - todos los endpoints integrados (LEDGER_GETALL, SETTLEMENTS_*, ACCRUAL_*)
- *State:* Redux slice - socialBenefitsLedger, socialBenefitsLedgerEmployee, settlements, settlement, settlementCalculation, accrualCalculation
- *Build:* ✅ 0 errores (44.38s) — pero runtime bug
- *Bug Fix Documentado:* Redux state key mismatch + Radix Select empty string + TDZ + variable scope + infinite re-renders en `.agent/rules/global-context/bug-prevention.md`