---
trigger: list_files
---

# 📊 Sistema de Reportes de Actividad (#035)

Reglas invariantes del módulo de reportes diarios/semanales (bitácoras, tareas completadas, fotos de trabajo, asistencia).

## 1. Zona Horaria = UTC (NO negociable)
- Todas las ventanas de reporte se calculan en **UTC** con `toISOString()` (convención existente: `Attendance.controller.js`).
- **PROHIBIDO** usar `America/Caracas` para ventanas de reporte. La hora local solo se usa en labels de UI.

## 2. Matriz Temporal (`server/utils/reportWindow.util.js`)
Fuente única de verdad: `getReportWindow(now)` — función pura con `now` inyectable.

| Día | Modo | Sección diaria | Sección semanal |
|-----|------|----------------|-----------------|
| Lunes | `WEEK_START` | null (estado vacío explícito) | null |
| Mar–Jue | `DAILY` | día anterior UTC (día completo) | null |
| Viernes | `WEEKLY_LIVE` | día anterior | Lun 00:00 → ahora + banner `preliminary` |
| Sáb–Dom | `WEEKLY_LIVE` | HOY (en vivo) | Lun 00:00 → ahora + banner `preliminary` |

## 3. Snapshots Inmutables
- Cron **lunes 07:00 UTC (03:00 AM Caracas)** cierra la semana anterior para TODAS las organizaciones (multi-tenant): `GET /api/v1/report/cron/close-week` sin auth (patrón cron-job.org existente).
- Upsert idempotente vía índice único `{organizationID, isoYear, weekNumber}`.
- Las actividades se **serializan por valor** dentro del snapshot: editar/borrar la fuente original NO altera semanas cerradas.
- Semanas pasadas se leen SOLO desde snapshots, nunca recalculadas.

## 4. Aislamiento y Privacidad (empleado)
- Reporte vigente empleado: filtro server-side por `employee.department`; sin departamento → solo sus propias actividades.
- "Mis Reportes" (`GET /my-history`): el scope se resuelve **desde el token** (`req.EMPID`), nunca con parámetros del cliente.
- `buildMyWeeklyHistory` extrae únicamente la entrada del empleado autenticado — **PROHIBIDO** retornar `employeesResumen` o `byDepartment` completos a un empleado.
- HR requiere `PermissionCheck("bitacoras", "read")` (decisión #035: no crear módulo de permisos nuevo).

## 5. Arquitectura
- Lógica pura exportada para testing (`buildLiveReport`, `buildCurrentReportPayload`, `closePreviousWeekSnapshot`, `buildMyWeeklyHistory`) con HTTP handlers como wrappers finos.
- Tareas completadas requieren `completedAt` en TaskSchema (agregación sobre array anidado `schedule.tasks`).
