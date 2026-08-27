# 🛠️ TAREA ACTUAL
**ID:** #035 (reapertura) | **Estado:** 🟡 EN CURSO — Fase 1 completada ✅; STOP 1 aprobado; subtarea #038 (seed reportes) en curso | **Fecha:** 2026-08-27

---

## 🎯 OBJETIVO FINAL
> Tres mejoras al sistema de reportes diarios/semanales HR y Empleados:
> 1. **R1:** El reporte diario muestra SOLO lo realizado (actividades no completadas no aparecen, pero sí se guardan).
> 2. **R2:** El reporte semanal SÍ muestra TODO (completadas y pendientes).
> 3. **R3:** Interactividad: links desde los totales del dashboard hacia páginas filtradas + modales de detalle al clickear actividades específicas.

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)
*Usa esto para "despertar" a la IA si el chat se cierra:*

- **Lo último que funcionó:**
  - **FASE 1 #035 COMPLETADA ✅** (commit `7179b8d`): backend de tareas pendientes en semanal (R2). `WeeklyReportSnapshot` enum `task_pending` + `tasksPending` en totals; `collectRawActivities` agrega tareas incompletas ancladas al `startdate` del horario; `includePendingTasks` false en diario (R1) / true en semanal (R2) y snapshot. 55 tests PASS + client build 0 errores. **STOP 1 aprobado por CTO.**
  - **SUBTAREA #038:** DB de dev poblada, `SNAPSHOTS=0` confirmado. Creado `server/seed-reports.mjs` (idempotente) que inserta data semilla histórica en 5 semanas (W30-W34) y dispara `closePreviousWeekSnapshot` real. Ejecutado: **5 snapshots creados con contenido** (incluyen `tasksPending:1` cada uno; W33/W34 con data real). Re-ejecución idempotente (no duplica). Integrado en `first-seed.mjs` al final.
- **Dónde se rompió/detuvo:** N/A. Fase 2 de #035 (filtros server-side) pendiente. Subtarea #038 lista para commit.
- **Siguiente acción inmediata:** Commit + push de la subtarea #038 (seed-reports.mjs + first-seed.mjs) → STOP para aprobación del CTO → luego continuar **Fase 2** de #035 (filtros server-side por fecha en `HandleGetAllWorkPhotos`/`HandleGetMyWorkPhotos`/`HandleGetMyBitacoras`).

---

## 📝 ANÁLISIS TÉCNICO COMPLETADO

### Hallazgos clave del análisis (archivos leídos):

**R1 (diario = solo realizado): YA FUNCIONA**
- `Report.controller.js:L61-83` — La query de tasks usa `completedAt: { $ne: null, $gte: start, $lte: end }` → solo tareas completadas aparecen en la ventana diaria
- Bitácoras, fotos y asistencia son inherentemente "realizados" (son registros creados/logueados)
- No hay cambio server necesario para R1. Solo verificación.

**R2 (semanal = todo): YA FUNCIONA**
- `buildCurrentReportPayload()` llama `buildLiveReport()` con la ventana semanal (lunes→ahora)
- TasksCompleted query filtra por `completedAt` en la ventana → incluye todas las completadas en la semana
- Las tareas NO completadas no tienen `completedAt` → no aparecen en NINGÚN reporte actual
- ⚠️ **Pendiente de decisión del CTO:** ¿"mostrar TODO" incluye tareas NO completadas? Si sí, se necesita modificar la query semanal para incluir tasks sin `completedAt`.

**R3 (interactividad): NO EXISTE — hay que implementar**
- `ActivityRow` es solo display, sin onClick ni cursor-pointer
- `TotalChip` no tiene navegación asociada
- No existen modales de detalle para actividades en el contexto de reportes
- Las páginas destino (bitácoras, horarios, fotos) NO soportan filtrado por query params actualmente
- Los modales existentes están inline en cada página (no son componentes reutilizables)

### Archivos analizados (imports/exports/connection map):

**Server:**
| Archivo | Función |
|---|---|
| `server/controllers/Report.controller.js` (553 líneas) | buildLiveReport, buildCurrentReportPayload, closePreviousWeekSnapshot, 6 HTTP handlers |
| `server/routes/Report.route.js` (34 líneas) | 6 rutas: /current, /history, /history/:isoYear/:weekNumber, /my-report, /my-history, /cron/close-week |
| `server/utils/reportWindow.util.js` (170 líneas) | getReportWindow (matriz temporal Lun→Dom), REPORT_MODES |
| `server/models/WeeklyReportSnapshot.model.js` (79 líneas) | Snapshot schema con employeesResumen, byDepartment, totals |
| `server/tests/report.test.js` (188 líneas) | Tests de utilidades puras |
| `server/tests/reportController.test.js` (308 líneas) | Tests integración: 55/55 PASS |

**Client:**
| Archivo | Función |
|---|---|
| `client/src/components/common/Dashboard/ReportComponents.jsx` (302 líneas) | YELLOW tokens, ActivityRow, ReportTotalsBar, TotalChip, EmployeeActivityGroup, ReportCompactCard |
| `client/src/pages/HR/HRReportPage.jsx` (350 líneas) | Página HR: diario + semanal + histórico + SnapshotDetailModal |
| `client/src/pages/Employee/EmployeeReportsPage.jsx` (201 líneas) | Página empleado: mi histórico + MyWeekDetailModal |
| `client/src/redux/Thunks/ReportThunk.js` (73 líneas) | 5 thunks: current, history, byWeek, myReport, myHistory |
| `client/src/redux/Slices/ReportSlice.js` (36 líneas) | Estado: currentReport, history, selectedSnapshot, myHistory |
| `client/src/redux/APIs/APIsEndpoints.js` (105 líneas) | ReportEndPoints con 5 endpoints |
| `client/src/pages/Dashboard/DashboardPage.jsx` (109 líneas) | ReportCompactCard embebido bajo KPIs |
| `client/src/pages/Employees/Dashboard Childs/EmployeeHomePage.jsx` (491 líneas) | Home empleado con sección de reporte diario |

**Modales existentes (reuso potencial):**
| Tipo | Archivo | Componente | ¿Exportado? |
|---|---|---|---|
| Bitácora HR | `hrbitacoraspage.jsx` | Inline (L305-397) | ❌ |
| Bitácora Empleado | `bitacoraspage.jsx` | Inline (L542-637) | ❌ |
| Foto HR | `HRWorkPhotosPage.jsx` | PhotoModal (L40-115) | ❌ |
| Foto Empleado | `EmployeeWorkPhotosPage.jsx` | PhotoModal (L39-84) | ❌ |
| Tarea | Ninguno | NO EXISTE modal | — |
| Asistencia | Ninguno | NO EXISTE modal | — |
| ThemedModal | `ThemedModal.jsx` | Radix Dialog reutilizable | ✅ (solo usado por Requests) |

**Rutas existentes:**
| HR | Empleado |
|---|---|
| `/HR/dashboard/bitacoras` | `/auth/employee/employee-dashboard/bitacoras` |
| `/HR/dashboard/work-photos` | `/auth/employee/employee-dashboard/photos` |
| `/HR/dashboard/schedules` | `/auth/employee/employee-dashboard/schedule` |
| `/HR/dashboard/reports` | `/auth/employee/employee-dashboard/reports` |

---

## 📋 PLAN DE IMPLEMENTACIÓN — 9 FASES

### ✅ Fase 0 — Análisis (COMPLETADA)
- [x] Leer todos los archivos del sistema de reportes (server + client)
- [x] Mapear dependencias cruzadas
- [x] Identificar modales existentes y patrones
- [x] Verificar que R1 y R2 ya funcionan server-side
- [x] Crear plan de 9 fases

### ⏳ Fase 1 — Filtros server-side para navegación
**Archivos:** `Report.controller.js`, `Report.route.js`
**Decisión:** Opción A (recomendada) — NO tocar server. Filtrado client-side con query params.
**Alternativa NO elegida:** Opción B — crear endpoints filtrados (`GET /api/v1/bitacora?from=&to=&emp=`)
**Justificación:** Data volume diario es bajo. Las páginas destino ya cargan todos los datos; se filtran al montar.

### ⏳ Fase 2 — Componentes modales de detalle
**Archivo nuevo:** `client/src/components/reports/ReportActivityModals.jsx`
**Contenido:** 4 modales reutilizables:

| Modal | Props | Datos del reporte | Fetch adicional |
|---|---|---|---|
| `BitacoraDetailModal` | `{ activity, employeeName, onClose }` | refId, title, description(300chars), images, videos, date | Lazy: `GET /api/v1/bitacora/:id` para contenido completo si "ver más" |
| `TaskDetailModal` | `{ activity, employeeName, onClose }` | refId, title, dayName, starttime, endtime | Lazy: buscar en schedule del empleado |
| `PhotoDetailModal` | `{ activity, employeeName, onClose }` | photourl, description, workdate | No necesita fetch — todos los datos en activity |
| `AttendanceDetailModal` | `{ activity, employeeName, onClose }` | checkin, checkout, durationMinutes, logstatus | No necesita fetch — todos los datos en activity.meta |

**Patrón visual:** `fixed inset-0 z-50 bg-black/50` + click-outside-to-close (mismo patrón que SnapshotDetailModal existente).

### ⏳ Fase 3 — Interactividad en ReportComponents.jsx
**Archivo:** `client/src/components/common/Dashboard/ReportComponents.jsx`
**Cambios:**
1. `TotalChip` → acepta `onClick` prop, se vuelve clickeable con hover effect
2. `ReportTotalsBar` → acepta `onChipClick(type)` callback, lo pasa a cada TotalChip
3. `ActivityRow` → `cursor-pointer`, hover effect, `onClick` llama callback con la activity
4. `EmployeeActivityGroup` → acepta `onActivityClick(activity)` y lo pasa a ActivityRow

### ⏳ Fase 4 — Integración en HRReportPage.jsx
**Archivo:** `client/src/pages/HumanResources/Dashboard Childs/HRReportPage.jsx`
**Cambios:**
- Estado: `const [activeModal, setActiveModal] = useState(null)`
- `ReportTotalsBar` diario → chips navegan a:
  - Bitácoras: `/HR/dashboard/bitacoras?from={dailyWindow.start}&to={dailyWindow.end}`
  - Tareas: `/HR/dashboard/schedules?day={dailyWindow.label}`
  - Fotos: `/HR/dashboard/work-photos?from=...&to=...`
  - Entradas: (Asistencia no tiene página funcional — por definir)
- `ActivityRow` → click abre el modal correspondiente según `activity.type`
- `EmployeeActivityGroup` → pasa `onActivityClick` hacia abajo

### ⏳ Fase 5 — Integración en ReportCompactCard (Dashboard)
**Archivo:** `ReportComponents.jsx` (`ReportCompactCard`)
- Chips del dashboard card → mismos destinos que Fase 4
- ActivityRow del card → abre modal inline

### ⏳ Fase 6 — Filtros en páginas destino
**Archivos:**
- `hrbitacoraspage.jsx` — lee `?from=&to=&emp=` de URL, filtra `createdBitacora` por rango de fechas
- `bitacoraspage.jsx` (empleado) — mismo patrón
- `HRWorkPhotosPage.jsx` — lee `?from=&to=&emp=`, filtra por `workdate`
- `EmployeeWorkPhotosPage.jsx` — mismo patrón

**Cada página:** mostrar indicador "Filtro activo: {rango}" + botón "✕ Limpiar filtro" que borra query params.

### ⏳ Fase 7 — EmployeeHomePage.jsx
**Archivo:** `client/src/pages/Employees/Dashboard Childs/EmployeeHomePage.jsx`
- Mismos cambios que Fase 4 pero para vista de empleado
- Chips del reporte diario navegan a páginas del empleado con filtros
- ActivityRow abre modales

### ⏳ Fase 8 — EmployeeReportsPage.jsx
**Archivo:** `client/src/pages/Employees/Dashboard Childs/EmployeeReportsPage.jsx`
- Agregar modales de detalle en el histórico del empleado
- MyWeekDetailModal: hacer clickeables las activities dentro de él

### ⏳ Fase 9 — Tests y Build
- Server: verificar `npm run test` → 55/55 PASS
- Client: `npm run build` → 0 errores
- Verificar que daily sigue excluyendo tareas sin completar

---

## ❓ 4 PREGUNTAS PENDIENTES DE DECISIÓN DEL CTO

### P1: Filtrado — Opción A vs Opción B
| Opción | Descripción | Pros | Contras |
|---|---|---|---|
| **A (recomendada)** | Filtrado client-side con query params (`?from=...&to=...`) | Simple, sin cambios server, data volume bajo | Carga inicial trae todo, filtra después |
| B | Crear endpoints filtrados en server | Más limpio, solo carga lo que se necesita | Más trabajo, requiere nuevos endpoints + tests |

**Recomendación del agente: Opción A**

### P2: Modales — Fetch vs Mostrar del reporte
| Opción | Descripción | Pros | Contras |
|---|---|---|---|
| **Híbrida (recomendada)** | Mostrar datos del reporte + fetch lazy si usuario expande "ver más" | Rápido (instant open), datos completos disponibles | Más lógica de loading en modal |
| Solo reporte | Modal muestra solo lo que trae el reporte (300 chars de bitácora) | Más simple | Contenido truncado, incompleto |
| Solo fetch | Siempre fetch completo al abrir modal | Datos siempre completos | Latencia al abrir, loading state |

**Recomendación del agente: Híbrida (mostrar + lazy load)**

### P3: Alcance de interactividad
| Opción | Descripción |
|---|---|
| Solo diario | Interactividad solo en sección diaria del reporte |
| **Ambos (recomendada)** | Diario + semanal + snapshot histórico |

**Recomendación del agente: Ambos** — la sección semanal (Vie–Dom) y los snapshots históricos también muestran activities que deberían ser clickeables.

### P4: Modales — Nuevos vs Extraer existentes
| Opción | Descripción | Pros | Contras |
|---|---|---|---|
| **Nuevos (recomendada)** | Crear `ReportActivityModals.jsx` con modales dedicados | Sin riesgo de regresión en páginas existentes, más limpio | Duplicación parcial de UI |
| Extraer | Sacar modales de `hrbitacoraspage.jsx` etc. como componentes reutilizables | DRY, una sola fuente de verdad | Riesgo de romper páginas existentes, más refactor |

**Recomendación del agente: Nuevos en `ReportActivityModals.jsx`**

---

## 🔧 NOTAS TÉCNICAS

### Data flow del reporte (para referencia del agente):
```
API /report/current → buildCurrentReportPayload() → buildLiveReport()
  → collectRawActivities() → { bitacoras, tasksCompleted, workPhotos, attendanceLogs }
  → normalizar a perEmployee Map → sortActivities() → aggregate totals + byDepartment
  → return { mode, daily, weekly, banner, dailyWindow, weeklyWindow }
```

### Activity object shape (lo que llega al frontend):
```js
{
  type: "bitacora" | "task_completed" | "work_photo" | "attendance",
  refId: ObjectId | null,        // ID del documento original
  title: string,
  description: string | null,    // primeros 300 chars (bitácora) o null
  date: Date,
  meta: {
    // bitacora: { images: number, videos: number }
    // task: { dayName: string, starttime: string, endtime: string }
    // photo: { photourl: string }
    // attendance: { checkout: Date, durationMinutes: number, logstatus: string }
  }
}
```

### Credenciales de prueba:
- HR-Admin: `admin@test.local` / `Password123`
- Empleados: `{nombre}.{apellido}{N}@test.local` / `Empleado123`

### Branch: `feat/weekly-reports`
### PR: #50 (→ dev)

---

## ⚠️ NOTAS DE MEMORIA
- *Regla:* Deploy local oficial documentado en `MASTER-INIT.md`. Para REABRIR servicios usar SIEMPRE §14: `docker start mongo-local` (NUNCA `docker run` de nuevo) + `npm run server` + `npm run dev`.
- *Regla:* Credenciales locales vigentes: `admin@test.local` / `Password123` (HR-Admin, Org Demo); empleados `Empleado123`. Dataset semilla persistente mientras NO se borre `mongo-local`.
- *Hallazgo:* R1 y R2 YA funcionan server-side. El trabajo real es R3 (interactividad en UI).
- *Pendiente CTO:* Las 4 preguntas del plan (P1-P4) necesitan decisión antes de implementar. Si no responde, asumir recomendaciones del agente (A, Híbrida, Ambos, Nuevos).
- *Bug pendiente trackeable:* `nodemon` usado por script pero no declarado en `server/package.json` → candidato a tarea futura.
- *Branch:* `feat/weekly-reports` (PR #50 → dev)
- *Último commit:* `108d8c5`
