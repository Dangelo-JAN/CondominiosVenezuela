# 🛠️ TAREA ACTUAL

**ID:** #043 | **Estado:** 🟡 EN CURSO | **Fecha:** 2026-11-12

---

## 🎯 OBJETIVO FINAL
> Implementar la UI completa de la pestaña "Prestaciones Sociales" en HRPayrollPage con 3 subtabs (Libro, Liquidaciones, Devengado) siguiendo el patrón de PayrollVacationsTab, reemplazando el placeholder "En Desarrollo".

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)
*Usa esto para "despertar" a la IA si el chat se cierra:*

- **Lo último que funcionó:** Plan aprobado por usuario. Bitácora creada. Listo para crear rama e iniciar Fase 1.
- **Dónde se rompió/detuvo:** No aplica (inicio de tarea).
- **Siguiente acción inmediata:** Crear rama `043-payroll-social-benefits-tab-ui` desde `037-payroll-venezuelan-module` e iniciar Fase 1 (estructura base con 3 subtabs).

---

## 📝 CAMBIOS TÉCNICOS CLAVE
- [ ] **Fase 1:** Estructura base `PayrollSocialBenefitsTab.jsx` con 3 subtabs internos, tabs navigation, loading/empty states
- [ ] **Fase 2:** Subtab Libro (Ledger) - Lista paginada, filtros, modal detalle entrada
- [ ] **Fase 3:** Subtab Liquidaciones (Settlements) - CRUD completo, modal detalle con historial, modal formulario, acciones aprobar/pagar/rechazar
- [ ] **Fase 4:** Subtab Devengado (Accrual) - Formulario calcular/registrar, preview cálculo, lista registros
- [ ] **Fase 5:** Integración completa, responsive, dark mode, build 0 errores, commit, PR hacia 037-payroll-venezuelan-module

---

## ⚠️ NOTAS DE MEMORIA
- *Regla:* PR OBLIGATORIO hacia `037-payroll-venezuelan-module` (rama padre), NUNCA a `dev` ni `main`
- *Regla:* Design System v4 - Acento `blue` (#003DA5) para Nóminas/Prestaciones
- *Regla:* Usar `ThemedListWrapper`, `ThemedHeadingBar`, `ThemedListContainer` con `accent="blue"`
- *Regla:* Usar `CustomSelect` con `accentColor="blue"`, `useIsDark()` para tema
- *Regla:* Patrón exacto de `PayrollVacationsTab.jsx` (sub-componentes internos, modales animados)
- *Branch:* 043-payroll-social-benefits-tab-ui (desde 037-payroll-venezuelan-module) ✅ CREADA Y PUSHEADA
- *Commit:* Pendiente
- *Thunk:* `HandleSocialBenefits` ya tiene todos los endpoints necesarios
- *State:* Redux slice ya tiene `socialBenefitsLedger`, `settlements`, `settlementCalculation`, `accrualCalculation`