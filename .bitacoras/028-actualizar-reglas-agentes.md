# 🛠️ TAREA: Actualizar Reglas Agénticas del Proyecto
**ID:** #028 | **Estado:** ✅ COMPLETADO | **Fecha:** 2026-07-16

---

## 🎯 OBJETIVO FINAL
> Que los agentes del proyecto NUNCA salten pasos, no tomen decisiones ligeras, no cometan errores de planificación/ejecución, y no den tareas por completadas sin aprobación explícita del usuario.

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)
- **Lo último que funcionó:** Todas las 5 fases implementadas y commits realizados
- **Dónde se rompió/detuvo:** N/A — tarea completada sin bloqueos
- **Siguiente acción inmediata:** PR hacia dev

---

## 📝 CAMBIOS TÉCNICOS CLAVE
- [x] **Fase 1: AGENTS.md** — Sección 0 "Reglas Supremas" agregada: PLAN FIRST, STOPS por fase, BUILDS obligatorios, APROBACIÓN explícita, SECUENCIA FINAL
- [x] **Fase 2: checklist-verify.md** — Secciones 0 (PLAN FIRST), 0.5 (STOPS), 4.5 (Builds check), 6.5 (Secuencia final), 8 (Aprobación final)
- [x] **Fase 3: git-workflow.md** — Paso 0.5 (PLAN FIRST), 2.5 (STOP plan), 3.x (fases con builds/commit/stop), 6 (Secuencia final)
- [x] **Fase 4: build.txt** — Instrucciones PLAN FIRST, phase protocol, build gate, approval rule, final sequence
- [x] **Fase 5: review.txt** — Checks de compliance: plan, phases, builds, approvals, final sequence

---

## ⚠️ NOTAS DE MEMORIA
- *Regla:* Ámbito EXENTO — no requería bitácora individual pero se creó para registro histórico
- *Regla:* Secuencia final obligatoria: confirmación → bitácoras → auto-mantenimiento → PR
- *Regla:* builds verificados antes de cada commit (client build + server tests)
- *Branch:* chore/versioning-agent-rules
- *Commits:*
  - `b23c97d` — F1: feat(agents) add Supreme Rules
  - `fe75cef` — F2: feat(checklist) add mandatory plan-first, stops, builds
  - `14d0ceb` — F3: feat(git-workflow) add plan-first, per-phase stops
  - `59b5702` — F4: feat(build-prompt) add plan-first, phase protocol
  - `6305754` — F5: feat(review-prompt) add process compliance checks
