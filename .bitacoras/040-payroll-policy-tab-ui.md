# 🛠️ TAREA: Payroll Policy Tab UI Implementation
**ID:** #040 | **Estado:** 🟡 EN CURSO | **Fecha:** 2026-11-05

---

## 🎯 OBJETIVO FINAL
> Implementar la UI completa de la pestaña "Políticas" en la página de Nómina (HR), reemplazando el texto "En desarrollo" por un formulario organizado por 5 secciones que permita visualizar y editar la configuración de nómina venezolana (LOTTT, IVSS, FAOV, INCES, ISLR, RPE, LPPSS, cestaticket, vacaciones, bono vacacional, utilidades, prestaciones sociales, horas extra).

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)
*Usa esto para "despertar" a la IA si el chat se cierra:*

- **Lo último que funcionó:** Plan aprobado por el usuario. Patrón de referencia: SOLO PayrollConceptsTab.jsx (PayrollReceiptsTab.jsx está mal implementado).
- **Dónde se rompió/detuvo:** Inicio de implementación - crear bitácora y rama.
- **Siguiente acción inmediata:** Crear rama desde 037-payroll-venezuelan-module usando @git-branch-formatter, luego iniciar Fase 1.

---

## 📝 CAMBIOS TÉCNICOS CLAVE
- [ ] Crear bitácora #040
- [ ] Crear rama `040-payroll-policy-tab-ui` desde `037-payroll-venezuelan-module`
- [ ] **FASE 1:** Modificar `PayrollPolicyTab.jsx` - carga de datos + 5 tarjetas de sección (read-only)
- [ ] **FASE 2:** Crear `PolicyFormModal.jsx` - modal genérico de edición por sección
- [ ] **FASE 3:** Integración submit - conectar botones Editar → modal → POLICY_UPDATE/COMPANY_UPDATE
- [ ] **FASE 4:** Pulido - tooltips, validaciones, responsive, modo oscuro
- [ ] Build client: 0 errores | Build server: tests passing
- [ ] Commit + PR hacia `037-payroll-venezuelan-module`

---

## ⚠️ NOTAS DE MEMORIA
- *Regla:* **SOLO** usar `PayrollConceptsTab.jsx` como patrón de referencia UI (PayrollReceiptsTab.jsx está mal implementado)
- *Regla:* Acento **blue** (#003DA5) para sección Nómina (design-system/index.md §21)
- *Regla:* Usar `CustomSelect` obligatorio (no `<select>` nativo)
- *Regla:* Modo oscuro con `useIsDark()` + tokens `dark:bg-[rgba(255,255,255,0.04)]`, `dark:border-[rgba(255,255,255,0.12)]`
- *Regla:* STOP obligatorio al final de cada fase con aprobación del usuario
- *Branch:* 040-payroll-policy-tab-ui (desde 037-payroll-venezuelan-module)
- *PR destino:* 037-payroll-venezuelan-module (NO a dev/main)
- *Modelo:* PayrollPolicy (50+ campos) + PayrollCompany (config duplicada parcial)
- *Redux:* policy + companyConfig en PayrollSlice
- *Thunk:* HandlePayrollPolicy (POLICY_GET, POLICY_UPDATE, COMPANY_GET, COMPANY_UPDATE)
- *Endpoints:* /api/v1/payroll/policies + /company