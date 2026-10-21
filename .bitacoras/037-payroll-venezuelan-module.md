# 🛠️ TAREA: Módulo Nómina Venezolana Completa
**ID:** #037 | **Estado:** 🟡 EN CURSO | **Fecha:** 2026-10-21

---

## 🎯 OBJETIVO FINAL
> Implementar motor de nómina completo compatible con legislación venezolana (LOTTT, IVSS, FAOV, INCES, ISLR, RPE, LPPSS, cestaticket, vacaciones, bono vacacional, utilidades, prestaciones sociales, horas extra) integrado en la arquitectura MERN existente.

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)
*Usa esto para "despertar" a la IA si el chat se cierra:*

- **Lo último que funcionó:** Análisis completo de arquitectura existente y referencia Nominix (237 tablas, 50+ fórmulas). Plan técnico presentado y aprobado.
- **Dónde se rompió/detuvo:** Inicio de Fase 1 - Esquemas de BD (Modelos Mongoose)
- **Siguiente acción inmediata:** Crear rama git y comenzar Fase 1: 12+ nuevos modelos + extensiones a Employee/Organization + seed inicial

---

## 📝 CAMBIOS TÉCNICOS CLAVE
- [x] **Fase 1**: Modelos Mongoose (PayrollConcept, PayrollPolicy, PayrollPeriod, PayrollReceipt, PayrollReceiptLine, PayrollEmployerCost, PayrollNovelty, VacationBalance, VacationRequest, SocialBenefitsLedger, SocialBenefitsSettlement, UtilidadesPeriod, UtilidadesPayment, PayrollCompany, PayrollImportBatch, ReceiptType, Loan, LoanPayment, AdvanceRequest, Holiday + extensiones Employee/Organization) - COMPLETADO
- [ ] **Fase 2**: Motor de cálculo (formula-evaluator, formula-context, accumulator-engine, payroll-engine, concept-rules, vacation-calculator, settlement-calculator, utilidades-calculator, islr-calculator, journal-generator)
- [ ] **Fase 3**: Controladores y Rutas (PayrollPeriod, PayrollReceipt, PayrollConcept, PayrollPolicy, PayrollNovelty, Vacation, SocialBenefits, Utilidades)
- [ ] **Fase 4**: Frontend Redux + Páginas HR (Payroll, Vacaciones, Prestaciones, Utilidades)
- [ ] **Fase 5**: Seed inicial (PayrollPolicy por defecto + catálogo 40+ conceptos)
- [ ] **Fase 6**: Tests unitarios (fórmulas, acumuladores, vacaciones, liquidaciones, utilidades, ISLR)
- [ ] Builds: client `npm run build` 0 errores + server `npm run test` todas pasan
- [ ] Bitácoras actualizadas

---

## ⚠️ NOTAS DE MEMORIA
- *Rama git:* `037-payroll-venezuelan-module` (por confirmar con nomenclatura)
- *Referencia:* Fórmulas y lógica en `/home/dangelojan/BSA/nominix/` (FORMULAS_NOMINIX.md, FUNCIONES_LOGICA_NEGOCIO_NOMINIX.md, LOGICA_NOMINIX.md)
- *Arquitectura:* Replicar patrones existentes (Employee.model.js, Salary.controller.js, Report.controller.js)
- *Design System:* Acento `blue` (#003DA5) para sección Nóminas (ver design-system/index.md §21)
- *Separación MERN:* client/ y server/ dominios separados, Fullstack Integrity obligatorio
