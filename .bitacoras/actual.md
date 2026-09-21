# 🛠️ TAREA ACTUAL

**ID:** #036 | **Estado:** 🟡 EN CURSO | **Fecha:** 2026-09-21

---

> Seed dinámica implementada y validada en deploy local. Pendiente: commit y PR hacia dev.

---

## 🎯 OBJETIVO FINAL
> Reemplazar `first-seed.mjs` para que genere datos relativos a `new Date()` (hoy/semana actual/mes actual) en lugar de JSONs con fechas congeladas; modo `--force` para refrescar la DB local sin destruir la cuenta HR/org; integra generación de reportes semanales idempotentes.

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)
*Usa esto para "despertar" a la IA si el chat se cierra:*

- **Lo último que funcionó:** Seed dinámica completada + validada en deploy local (2026-09-21): datos frescos W39 (2026-09-21→27), 24 logs asistencia HOY, 24 schedules activos W39, snapshots W34-W38, login HR/empleado OK, complete-task OK (marcar/desmarcar tarea)
- **Dónde se rompió/detuvo:** —
- **Siguiente acción inmediata:** Commit #036 + PR hacia dev (base dev, NUNCA main)

---

## 📝 CAMBIOS TECNICOS CLAVE
- [x] Fase 1: Rama `035-dynamic-seed` + bitácora creadas
- [x] Fase 1: Reescribir `server/first-seed.mjs` dinámico (modo `--force`, identidades embebidas 24 emp/6 deptos, fechas UTC relativas a hoy, PRNG determinista)
- [x] Fase 2: Eliminar `server/seed-data/org-hr-depts-emps.json` y `collections-data.json`
- [x] Fase 3: Docs al día (package.json script seed, MASTER-INIT.md, local-deploy.md, AGENTS.md línea 56)
- [x] Fase 4: `node server/first-seed.mjs --force` ejecutado; datos frescos verificados vs HOY
- [x] Fix #1: back-reference `employee.attendance → attendance._id` 
- [x] Fix #2: `_id` reales en subdocs de schedules (días/tareas) en `first-seed.mjs` y `seed-reports.mjs` — sin ellos `HandleCompleteTask` fallaba 404 (ids efímeros de Mongoose)
- [x] Deploy local verificado: health OK, logins OK, asistencia HOY OK, complete-task OK, dashboard HR OK
- [x] Build server: npm run test — 61 passed / 5 suites
- [x] Build client: npm run build — 0 errores
- [ ] Commit + PR hacia dev

- **Lo ultimo que funciono:** complete-task con perfil Rosa Romero (marcar/desmarcar tarea de HOY)
- **Donde se rompio/detuvo:** —
- **Siguiente accion inmediata:** commit y PR (esperando aprobación de usuario)

## ⚠️ NOTAS DE MEMORIA
- *Rama git:* `035-dynamic-seed` (la bitácora se renombró a #036, la rama NO)
- *Contrato datos:* controllers buscan subdocs por `_id` → todo inserto de schedules DEBE persistir `_id` en días/tareas
- *Contrato datos:* `Employee.attendance` debe apuntar al doc de attendances o my-attendance devuelve lista vacía
- *Modo --force:* borra solo las 10 colecciones generadas; preserva organizations + humanresources
- *Estado:* Tarea #036 EN CURSO — pendiente commit/PR aprobado por usuario