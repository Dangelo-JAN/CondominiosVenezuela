# 🤖 CRON-JOBS — Guía de Configuración

## Arquitectura

El sistema NO usa una librería de cron in-process (como `node-cron` o `bull`).
En su lugar, utiliza un modelo de **webhook externo** mediante el servicio
gratuito [cron-job.org](https://cron-job.org).

```
cron-job.org                     Servidor Express                    MongoDB
    │                                   │                              │
    │  GET /api/v1/schedule/            │                              │
    │  cron/close-expired ─────────────►│                              │
    │  [diario 00:00 UTC]               │  └ updateMany(...) ────────►│
    │                                   │                              │
    │  GET /api/v1/schedule/            │                              │
    │  cron/register-absences ─────────►│                              │
    │  [diario 02:00 UTC]               │  └ Absence.create(...) ────►│
    │                                   │                              │
    │  GET /api/v1/report/              │                              │
    │  cron/close-week ────────────────►│                              │
    │  [lunes 07:00 UTC]                │  └ WeeklyReportSnapshot ───►│
    │                                   │     upsert (idempotente)     │
```

## Endpoints CRON

| Endpoint | Método | Propósito | Frecuencia sugerida |
|----------|--------|-----------|---------------------|
| `/api/v1/schedule/cron/close-expired` | GET | Cierra horarios cuya fecha de fin ya venció (status → `closed`) | Diario 00:00 UTC |
| `/api/v1/schedule/cron/register-absences` | GET | Registra ausencias para empleados con tareas del día anterior sin completar | Diario 02:00 UTC |
| `/api/v1/report/cron/close-week` | GET | Genera el snapshot inmutable del reporte semanal anterior para TODAS las organizaciones | Lunes 07:00 UTC (= 03:00 AM Caracas) |

### Detalle de cada endpoint

#### `close-expired`
- Busca schedules con `status: "active"` y `enddate` anterior a la fecha actual.
- Actualiza su estado a `"closed"` y registra `closedAt` con la fecha/hora actual.
- Retorna `{ modifiedCount }` con la cantidad de horarios cerrados.
- Es **idempotente**: ejecutarlo múltiples veces no tiene efecto secundario.

#### `register-absences`
- Busca schedules activos que cubrían el día de ayer.
- Por cada schedule, revisa las tareas del día correspondiente.
- Si hay tareas incompletas, crea un registro en la colección `Absence` con `leavetype: "Tarea No Realizada"`.
- **No duplica ausencias**: verifica que no exista ya una ausencia con el mismo `employee` + `scheduleId` + fecha + tipo.
- Retorna `{ absencesRegistered }` con la cantidad de ausencias nuevas creadas.

#### `close-week` (reportes semanales)
- Cierra la **última semana completada** (Lunes 00:00 → Domingo 23:59:59.999 UTC) para cada organización con empleados.
- Genera un documento inmutable en `WeeklyReportSnapshot` con: totales globales, desglose por departamento y resumen serializado por empleado (bitácoras, tareas completadas, fotos, asistencia).
- **Idempotente**: índice único `{organizationID, isoYear, weekNumber}` + upsert — re-ejecutar no duplica.
- Multi-tenant: procesa todas las organizaciones; un error en una no detiene a las demás.
- La semana en curso se calcula SIEMPRE en vivo (`GET /api/v1/report/current`); los snapshots solo alimentan el histórico de semanas cerradas.
- Ventana de gracia: actividades registradas sábado/domingo quedan incluidas porque el cierre ocurre el lunes siguiente.

## Configuración en cron-job.org

1. **Crear cuenta** en [cron-job.org](https://cron-job.org) (gratuito).
2. **Crear un nuevo cron job** para cada endpoint:

### Job 1: Cerrar horarios vencidos

| Campo | Valor |
|-------|-------|
| URL | `https://[tu-servidor]/api/v1/schedule/cron/close-expired` |
| Method | `GET` |
| Frequency | `Daily` a las `00:00` UTC |
| Timeout | 30 segundos (suficiente) |

### Job 2: Registrar ausencias diarias

| Campo | Valor |
|-------|-------|
| URL | `https://[tu-servidor]/api/v1/schedule/cron/register-absences` |
| Method | `GET` |
| Frequency | `Daily` a las `02:00` UTC |
| Timeout | 60 segundos (puede procesar varios schedules) |

### Job 3: Cierre semanal de reportes

| Campo | Valor |
|-------|-------|
| URL | `https://[tu-servidor]/api/v1/report/cron/close-week` |
| Method | `GET` |
| Frequency | `Weekly` — lunes a las `07:00` UTC (= 03:00 AM hora Venezuela) |
| Timeout | 120 segundos (procesa todas las organizaciones) |

> **Nota:** La frecuencia debe respetar el orden — primero cerrar horarios vencidos
> (00:00) y luego registrar ausencias (02:00). El cierre semanal de reportes es
> independiente y corre los lunes.

## Seguridad

- Los endpoints cron **NO requieren autenticación**.
- El servidor permite el origen `cron-job.org` mediante CORS (ver `server/index.js`).
- No se necesita API Key ni token compartido.
- Si se requiere mayor seguridad, se puede implementar un header secreto compartido
  verificado por un middleware en estos endpoints.

## Verificación y monitoreo

Revisar los logs del servidor para entradas con el prefijo `[CRON]`:

```
[CRON] close-expired INICIADO — 2026-06-08T00:00:00.000Z
[CRON] close-expired FINALIZADO — 3 horarios cerrados — 2026-06-08T00:00:01.000Z
[CRON] register-absences INICIADO — 2026-06-08T02:00:00.000Z — ayer: Domingo
[CRON] register-absences FINALIZADO — 5 ausencias registradas — 2026-06-08T02:00:02.000Z
```

Errores se loguean con el prefijo `[CRON] ERROR` e incluyen stack trace.

## Health check

El servidor expone un endpoint de health check que cron-job.org puede usar
para verificar disponibilidad:

```
GET /api/health
→ { status: "ok" }
```

## Mantenimiento

- Si cambia la URL del servidor, actualizar los jobs en cron-job.org.
- Los endpoints son **GET** intencionalmente (cron-job.org solo soporta GET/POST
  simple en el plan gratuito).
- No hay riesgo de efectos secundarios por ejecución múltiple (idempotencia).

## Notas técnicas

- Los handlers están en `server/controllers/Schedule.controller.js`.
- Las rutas están definidas en `server/routes/Schedule.route.js` (líneas 34-35).
- El modelo `Schedule` está en `server/models/Schedule.model.js`.
- El modelo `Absence` está en `server/models/Absence.model.js`.
- Tests en `server/tests/cron.test.js` (10 tests).
- Handler del cierre semanal: `HandleCronCloseAllWeeks` en `server/controllers/Report.controller.js`.
- Ruta: `server/routes/Report.route.js`. Modelo snapshot: `server/models/WeeklyReportSnapshot.model.js`.
- Lógica de ventanas temporales (UTC): `server/utils/reportWindow.util.js`.
- Tests del reporte: `server/tests/report.test.js` y `server/tests/reportController.test.js`.
