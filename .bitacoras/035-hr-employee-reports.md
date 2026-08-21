# 🛠️ TAREA: Reportes Diarios y Semanales HR/Empleados
**ID:** #035 | **Estado:** ✅ COMPLETADO | **Fecha:** 2026-08-21

---

## 🎯 OBJETIVO FINAL
> Que HR y empleados vean un reporte de actividades (bitácoras, tareas completadas, fotos, asistencia) con lógica temporal: Lun=sección vacía, Mar–Vie=día anterior, Vie–Dom=resumen semanal preliminar en vivo, y snapshot inmutable generado por cron los lunes 03:00 AM (Caracas); empleados solo ven su departamento.

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)
*Usa esto para "despertar" a la IA si el chat se cierra:*

- **Lo último que funcionó:** Tarea COMPLETADA por el usuario. Commits: `6d9f17b` (F1), `865efc7` (F2), `05efa03` (F3), `9d28f77` (F4), `8765f02` (F5), `a2f2575` (F5.5 server), `a563ce3` (F5.5 client). 55/55 tests server + build client 0 errores.
- **Dónde se rompió/detuvo:** N/A — tarea finalizada; bitácoras actualizadas.
- **Siguiente acción inmediata:** PR hacia `dev` (NUNCA main).

---

## 📝 CAMBIOS TÉCNICOS CLAVE
### Fase 1 — Server base ✅
- [x] `Schedule.model.js`: campo `completedAt: { type: Date, default: null }` en TaskSchema
- [x] `Schedule.controller.js`: `HandleCompleteTask` setea/borra `completedAt`
- [x] Crear `server/utils/reportWindow.util.js` (función pura `getReportWindow`, UTC)
- [x] Crear `server/tests/report.test.js` — 20 tests, matriz 7 días + ISO week → **42/42 suites OK**

### Fase 2 — Server API ✅
- [x] Modelo `WeeklyReportSnapshot.model.js` (índice único org+isoYear+weekNumber, upsert idempotente)
- [x] Controller `Report.controller.js` — funciones puras (`buildLiveReport`, `buildCurrentReportPayload`, `closePreviousWeekSnapshot`) + handlers HTTP (current/my-report/history/by-week/cron)
- [x] Routes `Report.route.js` + registro en `server/index.js` (`/api/v1/report`)
- [x] Índices de rendimiento: Bitacora(org+createdAt), WorkPhoto(org+workdate), Attendance(org+employee)
- [x] Actualizar `server/docs/cron-setup.md` (Job 3: lunes 07:00 UTC = 03:00 Caracas)
- [x] Tests integración `reportController.test.js` → **51/51 suites OK**

### Fase 3 — Client data ✅
- [x] `APIsEndpoints.js`: `ReportEndPoints`
- [x] `ReportThunk.js` (4 thunks: current/my-report/history/by-week)
- [x] `ReportAsyncReducer` en `asyncreducer.js` + `ReportSlice.js`
- [x] Registro `reportreducer` en `store.js` → **build client 0 errores**

### Fase 4 — Client HR ✅
- [x] `ReportComponents.jsx` — badge de modo, filas de actividad, grupos por empleado, totales, estados vacíos, banner preliminar, `ReportCompactCard`
- [x] Card insertada en `dashboardpage.jsx` (bajo KPIs, antes de Analíticas)
- [x] Página `HRReportPage.jsx` (semana actual daily+weekly + histórico snapshots con modal detalle)
- [x] Ruta `/HR/dashboard/reports` en `HRroutes.jsx`
- [x] Entrada "Reportes" en `HRsidebar.jsx` → **build client 0 errores**

### Fase 5 — Client Empleado ✅
- [x] Sección de reporte departamental en `EmployeeHomePage.jsx` (usa `HandleGetMyReport`)
- [x] Reutiliza `ReportComponents.jsx`: badge de modo, totales, grupos por empleado, estados vacíos, banner preliminar
- [x] Lunes → estado explícito "La semana está iniciando"; Mar–Jue → día anterior; Vie–Dom → resumen semanal preliminar
- [x] Filtro por departamento aplicado server-side (req #4) → **build client 0 errores** (filtro por departamento)

### Fase 5.5 — Mis Reportes (Empleado) ✅
- [x] `buildMyWeeklyHistory` — extrae SOLO la entrada del empleado autenticado de cada snapshot (privacidad: nunca retorna `employeesResumen` ni `byDepartment`)
- [x] Ruta `GET /api/v1/report/my-history` con `VerifyEmployeeToken` (scope por `req.EMPID`, sin params de cliente)
- [x] 4 tests de aislamiento: solo actividades propias, semanas vacías, orden desc, multi-tenant → **55/55 server ✅**
- [x] Thunk `HandleGetMyReportHistory` + estado `myHistory` en `reportreducer`
- [x] Página `EmployeeReportsPage.jsx` (lista de semanas cerradas + modal detalle propio, datos ya en listado)
- [x] Ruta `/auth/employee/employee-dashboard/reports` + sidebar "Mis Reportes" → **build client 0 errores**

### Fase 6 — Cierre
- [ ] Builds (client build + server test) + revisión + PR → dev

---

## ⚠️ NOTAS DE MEMORIA
- *Regla:* Zona horaria del reporte = **UTC** (la que YA usa la app: `Attendance.controller.js` usa `toISOString()` para logdate). NO usar America/Caracas para ventanas.
- *Regla:* Cron snapshot: lunes 07:00 UTC (= 03:00 AM Caracas). Endpoint GET sin auth siguiendo patrón `/api/v1/schedule/cron/*`.
- *Regla:* Lunes → modo `WEEK_START` (sección diaria vacía explícita). Vie–Dom → `WEEKLY_LIVE` con banner preliminar. Semanas pasadas → leer SOLO snapshots 🔒.
- *Regla:* Empleados: filtro por `employee.department`. HR: toda la organización.
- *Regla:* "Mis Reportes" (empleado): aislamiento server-side — `buildMyWeeklyHistory` extrae solo `employeesResumen.find(e => e.employee == req.EMPID)`; el empleado jamás recibe datos de otros.
- *Hallazgo:* TaskSchema NO tenía `completedAt` — tareas históricas sin fecha se excluyen de ventanas.
- *Permisos:* HR usa `PermissionCheck("bitacoras", "read")` (decisión: no crear módulo nuevo).
- *Branch:* `feat/weekly-reports`
- *Commit:* (pendiente)
