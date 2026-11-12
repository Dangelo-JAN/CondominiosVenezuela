# 🛠️ TAREA ACTUAL

**ID:** #043 | **Estado:** 🟡 EN CURSO (REABIERTA) | **Fecha:** 2026-11-12

---

## 🎯 OBJETIVO FINAL
Fixear bugs críticos en PayrollSocialBenefitsTab: infinite re-renders al click "Nuevo Devengado" + falta header principal estilo tabs períodos/conceptos/políticas.

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)

- **Lo último que funcionó:** Tarea marcada COMPLETADA incorrectamente. Bugs detectados en runtime.
- **Dónde se rompió/detuvo:** Reabierta. Inicio Fix Fase 1 - Reemplazar `employees` local state por Redux selector.
- **Siguiente acción inmediata:** Editar `PayrollSocialBenefitsTab.jsx` línea 1073: cambiar `const [employees, setEmployees] = useState([])` por Redux selector.

---

## 📝 CAMBIOS TÉCNICOS CLAVE
- [ ] **Fix Fase 1:** Reemplazar `employees` local state por Redux selector `useSelector(state => state.employeeReducer.employees)`
- [ ] **Fix Fase 2:** Agregar header principal (título, descripción, botón refresh) antes del sub-tabs bar
- [ ] **Fix Fase 3:** Verificar/fixear todos `CustomSelect` usan `"select"` (no `""`)
- [ ] **Fix Fase 4:** Build + test manual (click "Nuevo Devengado" sin infinite loop)
- [ ] **Commit & Push:** Con @git-commit-formatter
- [ ] **PR Update:** Actualizar PR #59 hacia `037-payroll-venezuelan-module`

---

## ⚠️ NOTAS DE MEMORIA
- *Regla:* Bug Root Cause: `employees = useState([])` local → nueva referencia cada render → `useEffect` en modales con `[open, employees]` → infinite loop (Regla #5 bug-prevention.md)
- *Fix Pattern:* Usar Redux selector como en `VacationsTab`: `const { data: employees } = useSelector(state => state.employeeReducer.employees)`
- *Branch:* 043-payroll-social-benefits-tab-ui (desde 037-payroll-venezuelan-module)
- *PR:* #59 existente hacia 037-payroll-venezuelan-module