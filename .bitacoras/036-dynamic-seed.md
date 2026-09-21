# 🛠️ TAREA: seed-dinámica (reemplaza first-seed.mjs)

**ID:** #036 | **Estado:** ✅ COMPLETADO | **Fecha:** 2026-09-21 (validado en deploy local)

---

## 🎯 OBJETIVO FINAL
> Reemplazar `first-seed.mjs` para que genere datos relativos a `new Date()` (hoy/semana actual/mes actual) en lugar de JSONs con fechas congeladas; incluye modo `--force` para refrescar la DB local sin destruir la cuenta HR/org. Integra generación de reportes semanales (5 snapshots recientes W34-W38) idempotentes.

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)
*Usa esto para "despertar" a la IA si el chat se cierra:*

- **Lo último que funcionó:** Seed dinámico completado + validado en deploy local (2026-09-21): datos frescos W39 (2026-09-21→27), 24 logs asistencia HOY, 24 schedules activos, snapshots W34-W38, login HR/empleado OK, reportes OK. 2 bugs corregidos durante validación (back-reference `employee.attendance` + `_id` de subdocs en schedules)
- **Dónde se rompió/detuvo:** —
- **Siguiente acción inmediata:** — (tarea cerrada). Commit `4e15744` pusheado a `035-dynamic-seed`; PR hacia dev + merge pendientes

---

## 📝 CAMBIOS TÉCNICOS CLAVE
- [x] Fase 1: Rama + bitácora creadas (branca git: `035-dynamic-seed`)
- [x] Fase 1: Reescribir `server/first-seed.mjs` con generación dinámica (modo `--force`, IDs embebidas, fechas UTC relativas a hoy, PRNG determinista mulberry32)
- [x] Fase 2: Eliminar `server/seed-data/org-hr-depts-emps.json` y `collections-data.json` (ya no referenciados)
- [x] Fase 3: Actualizar `package.json` (script seed), `MASTER-INIT.md` (refs actualizadas), `local-deploy.md` (tabla --force), `AGENTS.md` (línea 56 — ahora rechaza sin --force)
- [x] Fase 4: Aplicar `--force` y validar en deploy local (asistencia de HOY, schedules W39 activos, login, reporte actual WEEK_START, snapshots W34-W38, build client + 61 tests server)
- [x] **Fix #1 (validación):** back-reference `employee.attendance → attendance._id` en el seed (sin ella `HandleGetMyAttendance` devolvía `[]`)
- [x] **Fix #2 (validación):** `_id` reales en subdocs de schedules (días + tareas) en `first-seed.mjs` y `seed-reports.mjs` — sin ellos `HandleCompleteTask` fallaba 404 (Mongoose fabrica `_id` efímeros en cada hidratación que nunca existen en disco)
- [x] Subtarea #038 integrada: `server/seed-reports.mjs` importado encadenado al final de `first-seed.mjs`; 5 snapshots (W34-W38) regenerados en cada corrida; idempotente

---

## ⚠️ NOTAS DE MEMORIA
- *ID:* #036 (antes #035) — renombrado por reordenamiento de tareas; la **rama git sigue siendo `035-dynamic-seed`**
- *Script:* `server/first-seed.mjs` — dinámico (fechas relativas a `new Date()`; ventana generada: semana ISO actual W39 + 2 semanas cerradas + bitácoras/fotos ayer-hoy + 10 días hábiles asistencia INCL. hoy + duedates futuros)
- *Colecciones seeds:* 10 generadas dinámicamente (departments, employees, schedules, bitacoras, workphotos, leaves, salaries, attendances, notices, applicants) + snapshots semanales. Sin: Absences, Notifications, Balance, CorporateCalendar (decisión usuario — probar via cron `register-absences` y endpoints externos)
- *Modo `--force`:* borra SOLO las 10 colecciones generadas y regenera con fechas de hoy; preserva `organizations` + `humanresources`. Sin flag aborta si employees>0. Idempotente
- *Contrato datos (causa raíz #2):* los controllers de la app buscan subdocs por `_id` (ej. `schedule.schedule.id(dayID)`). **Todo inserto de schedules debe persistir `_id` en días/tareas** (solo el modelo Mongoose o `new ObjectId()` lo garantizan; driver crudo NO)
- *Contrato datos (back-ref):* `Employee.attendance` debe apuntar al doc de `attendances` o `HandleGetMyAttendance` devuelve lista vacía
- *Subtarea #038 (seed-reportes-semanales):* integrada y dinámica — snapshots W34-W38 (relativos a la semana actual −1..−5), idempotentes por índice {orgID, isoYear, weekNumber}
- *Referencias actualizadas:* MASTER-INIT.md §7/§8, local-deploy.md §2.4/§3, AGENTS.md línea 56
- *Git:* PR hacia dev al final (NUNCA a main). Branch: `035-dynamic-seed`

---

## ✅ CIERRE DE FASES
| Fase | Estado | Comentario |
|:---:|:---:|:---|
| **Fase 1** | ✅ | Rama + bitácora creadas; first-seed.mjs reescrito (dinámico) |
| **Fase 2** | ✅ | JSONs eliminados; scripts actualizados |
| **Fase 3** | ✅ | Docs (package.json, MASTER-INIT, local-deploy, AGENTS) al día |
| **Fase 4** | ✅ | `--force` aplicado en deploy local; validación completa; 2 fixes aplicados; builds OK (61 tests + client build 0 errores) |

(Fin de la tabla de cierre de fases)

---

## 📌 ANEXO: Integración subtarea #038 (seed-reportes-semanales)
> Generar reportes semanales "viejos" (hasta 5) en la DB de desarrollo para verificar que el mecanismo de snapshots de `closePreviousWeekSnapshot` se ejecuta correctamente.
> - 5 snapshots (W34-W38, relativos a la semana actual) creados con contenido demostrable
> - Re-ejecución idempotente confirmada (no duplica)
> - Reutiliza helpers de `reportWindow.util.js` (`mondayOfUTCWeek`, `addUTCDays`, `getISOWeek`)
> - Schedules históricos con `_id` reales en subdocs (fix #2)