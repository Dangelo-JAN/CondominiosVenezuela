# 🛠️ TAREA: Reportes Diarios y Semanales HR/Empleados
**ID:** #035 | **Estado:** 🟡 EN CURSO | **Fecha:** 2026-08-21

---

## 🎯 OBJETIVO FINAL
> Que HR y empleados vean un reporte de actividades (bitácoras, tareas completadas, fotos, asistencia) con lógica temporal: Lun=sección vacía, Mar–Vie=día anterior, Vie–Dom=resumen semanal preliminar en vivo, y snapshot inmutable generado por cron los lunes 03:00 AM (Caracas); empleados solo ven su departamento.

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)
*Usa esto para "despertar" a la IA si el chat se cierra:*

- **Lo último que funcionó:** Plan aprobado por el usuario; rama `feat/weekly-reports` creada desde `dev`; bitácora inicializada.
- **Dónde se rompió/detuvo:** N/A — inicio de Fase 1.
- **Siguiente acción inmediata:** Fase 1: agregar `completedAt` a TaskSchema + update `HandleCompleteTask` + crear `server/utils/reportWindow.util.js` + tests Jest.

---

## 📝 CAMBIOS TÉCNICOS CLAVE
### Fase 1 — Server base
- [ ] `Schedule.model.js`: campo `completedAt: { type: Date, default: null }` en TaskSchema
- [ ] `Schedule.controller.js`: `HandleCompleteTask` setea/borra `completedAt`
- [ ] Crear `server/utils/reportWindow.util.js` (función pura `getReportWindow`, UTC)
- [ ] Crear `server/tests/report.test.js` (matriz 7 días, fronteras semana, ISO week)

### Fase 2 — Server API
- [ ] Modelo `WeeklyReportSnapshot.model.js` (índice único org+year+weekNumber, upsert idempotente)
- [ ] Controller `Report.controller.js` (current HR / my-report empleado / history / cron close-week)
- [ ] Routes `Report.route.js` + registro en `server/index.js`
- [ ] Actualizar `server/docs/cron-setup.md` (job lunes 07:00 UTC = 03:00 Caracas)

### Fase 3 — Client data
- [ ] `APIsEndpoints.js`: `ReportEndPoints`
- [ ] `ReportThunk.js` + `ReportSlice.js` + registro en `store.js`

### Fase 4 — Client HR
- [ ] Card reporte en `dashboardpage.jsx`
- [ ] Página `HRReportPage.jsx` + ruta `/HR/dashboard/reports` + entrada sidebar

### Fase 5 — Client Empleado
- [ ] Sección reporte en `EmployeeHomePage.jsx` (filtro por departamento)

### Fase 6 — Cierre
- [ ] Builds (client build + server test) + revisión + PR → dev

---

## ⚠️ NOTAS DE MEMORIA
- *Regla:* Zona horaria del reporte = **UTC** (la que YA usa la app: `Attendance.controller.js` usa `toISOString()` para logdate). NO usar America/Caracas para ventanas.
- *Regla:* Cron snapshot: lunes 07:00 UTC (= 03:00 AM Caracas). Endpoint GET sin auth siguiendo patrón `/api/v1/schedule/cron/*`.
- *Regla:* Lunes → modo `WEEK_START` (sección diaria vacía explícita). Vie–Dom → `WEEKLY_LIVE` con banner preliminar. Semanas pasadas → leer SOLO snapshots 🔒.
- *Regla:* Empleados: filtro por `employee.department`. HR: toda la organización.
- *Hallazgo:* TaskSchema NO tenía `completedAt` — tareas históricas sin fecha se excluyen de ventanas.
- *Permisos:* HR usa `PermissionCheck("bitacoras", "read")` (decisión: no crear módulo nuevo).
- *Branch:* `feat/weekly-reports`
- *Commit:* (pendiente)
