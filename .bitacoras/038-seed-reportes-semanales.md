# 🛠️ TAREA: Seed de reportes semanales + verificación de snapshots
**ID:** #038 (subtarea de #035) | **Estado:** 🟡 EN CURSO | **Fecha:** 2026-08-27

---

## 🎯 OBJETIVO FINAL
> Generar reportes semanales "viejos" (hasta 5) en la DB de desarrollo para verificar que el mecanismo de snapshots de `closePreviousWeekSnapshot` se ejecuta correctamente, y actualizar `server/first-seed.mjs` para que el resto del equipo obtenga data + snapshots reproducibles al seedear.

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)
- **Lo último que funcionó:** Fase 1 de #035 completada (tasksPending en semanal, 55 tests PASS). Diagnóstico de DB ejecutado: poblada, SNAPSHOTS=0.
- **Dónde se detuvo:** Plan aprobado por CTO (injectar data semilla + snapshots; first-seed genera datos+snapshots). Anclaje de semanas verificado: W30–W34 (lun 20 jul → dom 23 ago 2026).
- **Siguiente acción inmediata:** Crear `server/seed-reports.mjs` (conexión mongoose + insertar data semilla + disparar `closePreviousWeekSnapshot` por semana), integrarlo en `first-seed.mjs` y validar.

---

## 📝 CAMBIOS TÉCNICOS CLAVE
- [ ] Diseñar `server/seed-reports.mjs` (data semilla + generación de snapshots idempotente)
- [ ] Integrar generación de snapshots en `server/first-seed.mjs`
- [ ] Data semilla en 5 semanas para contenido demostrable
- [ ] Validación: 55 tests server PASS + build client 0 errores + SNAPSHOTS=5 con contenido
- [ ] Commit + push (branch `feat/weekly-reports`) + STOP aprobación

---

## ⚠️ NOTAS DE MEMORIA
- *Regla:* Regla 0.8 — diagnóstico de DB obligatorio antes de seed; NO ejecutar first-seed sobre DB poblada (duplicaría).
- *Regla:* Regla 0.3 — builds obligatorios antes de cada commit (server test + client build).
- *Regla:* Regla 0.4 — aprobación explícita antes de completar cada fase.
- *Diseño:* snapshots se generan con `closePreviousWeekSnapshot({orgID, now})` reutilizando la lógica real (no lógica paralela).
- *Diseño:* idempotencia garantizada por índice único `{organizationID, isoYear, weekNumber}`.
- *Anclaje:* semanas W30–W34 (lun 20 jul → dom 23 ago 2026), determinístico (fechas fijas ISO).
- *Branch:* `feat/weekly-reports`
- *Commit:* pendiente
