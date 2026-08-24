# 🛠️ TAREA: Master-Init — Guía Oficial Deploy Local
**ID:** #036 | **Estado:** ✅ COMPLETADO | **Fecha:** 2026-08-24

---

## 🎯 OBJETIVO FINAL
> Que un desarrollador junior clone el repo y levante el entorno local completo (backend + frontend + BD) sin errores al primer intento, usando exclusivamente `MASTER-INITI.md`.

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)
*Usa esto para "despertar" a la IA si el chat se cierra:*

- **Lo último que funcionó:** Iteración 2 del CTO aplicada — renombrado a `MASTER-INIT.md` y pivoteado a Opción A nativa + Mongo local Docker por defecto (Vía 3). Commit `f8d68b5` pusheado.
- **Dónde se rompió/detuvo:** STOP final — esperando confirmación del CTO de tarea COMPLETADA.
- **Siguiente acción inmediata:** Tras confirmación → cierre de bitácora + auto-mantenimiento + verificar PR a dev (los commits viajan en el PR ya abierto de esta rama).

---

## 📝 CAMBIOS TÉCNICOS CLAVE
- [x] Plan presentado y aprobado (excepción Fase 0 documentada)
- [x] Bitácora creada ANTES de escribir cualquier archivo
- [x] `MASTER-INITI.md` creado en raíz (solo para humanos, sin referencias agénticas)
- [x] Builds verificados: client `✓ built` 0 errores + server `55/55 tests PASS`
- [x] Commit `9325c2d` + push en `feat/weekly-reports`
- [x] **Iteración CTO:** renombrado a `MASTER-INIT.md` + pivote a Opción A nativa con Mongo local Docker (Vía 3) como BD por defecto
- [x] Builds re-verificados post-iteración (server 55/55 PASS, client ✓ built) → Commit `f8d68b5` + push

---

## ⚠️ NOTAS DE MEMORIA
- *Regla:* Archivo SOLO para desarrolladores humanos — PROHIBIDO referenciar `.agent/`, `.bitacoras/`, `AGENTS.md` o reglas de agentes dentro del documento.
- *Regla:* PROHIBIDO incluir credenciales reales — solo nombres de variables y placeholders `<...>`.
- *Regla:* Enfoque aprobado por CTO (iteración 2): Opción A nativa + Mongo local en Docker (`mongo-local`, URI `mongodb://localhost:27017/condove_local`). Atlas queda como excepción avanzada solo-lectura.
- *Hallazgo técnico:* signup HR devuelve `verificationcode` en la respuesta → verificación de email no depende de SendGrid en local.
- *Excepción Git:* Rama `feat/weekly-reports` autorizada por el CTO para esta tarea docs (no nace de dev).
- *Branch:* `feat/weekly-reports`
- *Commit:* `f8d68b5` — docs(master-init): rename guide and pivot to native execution with local docker mongodb
