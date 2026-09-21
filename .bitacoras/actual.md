# 🛠️ TAREA ACTUAL

**ID:** #036 | **Estado:** ✅ COMPLETADO | **Fecha:** 2026-09-21

---

## 🎯 OBJETIVO FINAL
> Reemplazar `first-seed.mjs` para que genere datos relativos a `new Date()` (hoy/semana actual/mes actual) en lugar de JSONs con fechas congeladas; modo `--force` para refrescar la DB local sin destruir la cuenta HR/org; integra generación de reportes semanales idempotente.

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)
*Usa esto para "despertar" a la IA si el chat se cierra:*

- **Lo último que funcionó:** Seed dinámica completada y validada en deploy local (2026-09-21): datos frescos W39, 24 logs asistencia HOY, 24 schedules activos, snapshots W34-W38, login OK, complete-task OK. Commit `4e15744` pusheado
- **Dónde se rompió/detuvo:** —
- **Siguiente acción inmediata:** PR hacia dev + merge (base dev, NUNCA main). Deploy local cerrado (puertos libres, mongo detenido, DB preservada)

---

## 📝 CAMBIOS TECNICOS CLAVE
- [x] Fase 1: Rama `035-dynamic-seed` + bitácora creadas; `first-seed.mjs` reescrito (dinámico, `--force`, identidades embebidas, PRNG determinista)
- [x] Fase 2: Eliminados `server/seed-data/*.json` (ya no referenciados)
- [x] Fase 3: Docs al día (package.json script seed, MASTER-INIT.md, local-deploy.md, AGENTS.md línea 56)
- [x] Fase 4: `--force` aplicado; datos frescos verificados vs HOY; deploy local validado
- [x] Fix #1: back-reference `employee.attendance → attendance._id`
- [x] Fix #2: `_id` reales en subdocs de schedules en `first-seed.mjs` y `seed-reports.mjs` (fix HandleCompleteTask 404)
- [x] Builds: 61 tests server PASS + client build 0 errores
- [x] Bitácoras actualizadas (036-dynamic-seed, index.md, actual.md)
- [x] Commit `4e15744` pusheado a `origin/035-dynamic-seed`

---

## ⚠️ NOTAS DE MEMORIA
- *Rama git:* `035-dynamic-seed` (la bitácora se renombró a #036, la rama NO)
- *Contrato datos:* los controllers buscan subdocs por `_id` → todo inserto de schedules DEBE persistir `_id` en días/tareas (modelo Mongoose o `new ObjectId()`; driver crudo NO)
- *Contrato datos:* `Employee.attendance` debe apuntar al doc de attendances o my-attendance devuelve vacío
- *Modo --force:* borra solo las 10 colecciones generadas; preserva organizations + humanresources
- *Estado:* Tarea #036 ✅ COMPLETADO el 21/09/2026