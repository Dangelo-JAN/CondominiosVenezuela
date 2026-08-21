# 🛠️ TAREA ACTUAL
**ID:** #035 | **Estado:** 🟡 EN CURSO | **Fecha:** 2026-08-21

---

## 🎯 OBJETIVO FINAL
> Implementar reportes diarios (Mar–Vie = día anterior, Lun vacío) y semanales preliminares (Vie–Dom en vivo) con snapshot inmutable por cron los lunes 03:00 AM Caracas, visibles en dashboard HR (card + página) y home de empleados (filtrado por departamento).

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)
*Usa esto para "despertar" a la IA si el chat se cierra:*

- **Lo último que funcionó:** Plan aprobado; rama `feat/weekly-reports` creada desde `dev`; bitácora `035-hr-employee-reports.md` creada.
- **Dónde se rompió/detuvo:** N/A — inicio Fase 1.
- **Siguiente acción inmediata:** `completedAt` en TaskSchema + `reportWindow.util.js` + tests.

---

## 📝 CAMBIOS TÉCNICOS CLAVE
- [ ] F1: TaskSchema.completedAt + HandleCompleteTask + reportWindow.util.js + tests
- [ ] F2: WeeklyReportSnapshot model + Report controller/routes + cron docs
- [ ] F3: Client ReportThunk + ReportSlice + endpoints
- [ ] F4: HR card dashboard + HRReportPage + sidebar
- [ ] F5: EmployeeHomePage sección reporte (depto)
- [ ] F6: Builds + PR → dev

---

## ⚠️ NOTAS DE MEMORIA
- *Regla:* Zona horaria = UTC (convención existente de la app). Cron lunes 07:00 UTC.
- *Branch:* `feat/weekly-reports`
- *Commit:* (pendiente)
