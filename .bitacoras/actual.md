# 🛠️ TAREA ACTUAL

**ID:** #040 | **Estado:** 🟡 EN CURSO | **Fecha:** 2026-11-05

---

## 🎯 OBJETIVO FINAL
> Implementar la UI completa de la pestaña "Políticas" en la página de Nómina (HR), reemplazando el texto "En desarrollo" por un formulario organizado por 5 secciones que permita visualizar y editar la configuración de nómina venezolana (LOTTT, IVSS, FAOV, INCES, ISLR, RPE, LPPSS, cestaticket, vacaciones, bono vacacional, utilidades, prestaciones sociales, horas extra).

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)
*Usa esto para "despertar" a la IA si el chat se cierra:*

- **Lo último que funcionó:** Plan aprobado por el usuario. Patrón de referencia: SOLO PayrollConceptsTab.jsx (PayrollReceiptsTab.jsx está mal implementado). Rama creada: 040-payroll-policy-tab-ui desde 037-payroll-venezuelan-module.
- **Dónde se rompió/detuvo:** Inicio de implementación - Fase 1 pendiente.
- **Siguiente acción inmediata:** Iniciar Fase 1 - Modificar PayrollPolicyTab.jsx para cargar policy + companyConfig y renderizar 5 tarjetas de sección (read-only).

---

## ✅ FASE 1 COMPLETADA - Estructura Base y Carga de Datos (STOP ✅)
- [x] F1-01: Modificar `PayrollPolicyTab.jsx` - usar `useSelector` para `policy` + `companyConfig`
- [x] F1-02: Dispatch `HandlePayrollPolicy` (POLICY_GET + COMPANY_GET) en `useEffect`
- [x] F1-03: Renderizar skeleton/loading state
- [x] F1-04: Renderizar 5 tarjetas de sección (read-only initially) con valores actuales
- [x] F1-05: Header con título "Políticas de Nómina" + botón "Guardar Todo" (disabled hasta cambios)
- **Gate Fase 1:** ✅ Client build 0 errores, Server tests 127 passing
- **STOP 1:** Builds verificados

---

## ⬜ FASE 2 - Modal de Edición Genérico (PENDIENTE)
- [ ] F2-01: Crear `PolicyFormModal.jsx` en `client/src/components/payroll/`
- [ ] F2-02: Props: `open`, `onClose`, `section`, `fields`, `initialData`, `onSubmit`, `isSubmitting`
- [ ] F2-03: Campo dinámico según tipo: number, select (enum), boolean, text
- [ ] F2-04: Validación: required, min/max, enum values
- [ ] F2-05: Tooltips/ayuda en cada campo (legislación venezolana)
- **STOP 2:** Verificar modal abre/renderiza campos + build client ✅ → Esperar aprobación

---

## ⬜ FASE 3 - Integración y Submit (PENDIENTE)
- [ ] F3-01: Conectar botones "Editar" de cada tarjeta → abrir modal con campos de esa sección
- [ ] F3-02: Implementar `handleSubmit` → dispatch `POLICY_UPDATE` o `COMPANY_UPDATE` según sección
- [ ] F3-03: Manejo de errores + toast de éxito
- [ ] F3-04: Actualizar Redux state tras éxito (optimistic o reload)
- [ ] F3-05: Botón "Guardar Todo" en header para batch update (opcional)
- **STOP 3:** Verificar edición completa de todas las secciones + build client ✅ → Esperar aprobación

---

## ⬜ FASE 4 - Pulido y Validaciones (PENDIENTE)
- [ ] F4-01: Formato de números (VES/USD/%), step apropiado por campo
- [ ] F4-02: Validación cruzada (ej. vacation_days_max ≥ vacation_days_base)
- [ ] F4-03: Responsive: grid 2/3/4 cols según breakpoint
- [ ] F4-04: Accesibilidad: labels, aria-describedby, focus visible
- [ ] F4-05: Consistencia visual con PayrollConceptsTab.jsx (ThemedListWrapper, CustomSelect, etc.)
- **STOP 4:** Verificar UX completa + build client ✅ + tests server ✅ → Esperar aprobación

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
- *Secciones:* 1) Tasas Legales (16 campos) 2) Factores Pago (6) 3) Vacaciones (14) 4) Split Salarial (2) 5) Config. General (11)