# 🗺️ MAPA DE BITÁCORAS

## ⚠️ IMPORTANTE - LEE ESTO PRIMERO
**Antes de continuar con cualquier tarea, DEBES leer `.bitacoras/actual.md` para obtener el contexto actual del proyecto.**

---

## 🚩 ESTADO ACTUAL
- **Tarea activa:** 🟡 #035 (reapertura) — Reportes: interactividad y filtros
- **Última completada:** #037 — Master-Init v3: Sección Reapertura de Servicios ✅ (24/08/2026)
- **Branch actual:** `feat/weekly-reports` (PR #50 abierto → dev)
- **Deploy pendiente:** Vercel + Render desde `main`
- **Archivo de referencia rápida:** `actual.md`

---

## 📂 HISTORIAL DE TAREAS
- [x] [[001-Update-HRCards]] - ✅ FINALIZADO el 06/04/2026
- [x] [[002-Fix-HRModals-Dropdowns]] - ✅ FINALIZADO el 08/04/2026
- [x] [[003-Fix-HRApproveRejectButtons]] - ✅ COMPLETADO el 13/04/2026
- [x] [[004-Refactor-HRWorkPhotosPage]] - ✅ COMPLETADO el 15/04/2026
- [x] [[005-Fix-EmployeeLeaves-AuthVar]] - ✅ COMPLETADO el 17/04/2026 (PR #127)
- [x] [[006-create-themed-modal-component]] - ✅ COMPLETADO el 18/04/2026 (PR #129)
- [x] [[007-create-employee-absences-page]] - ✅ COMPLETADO el 18/04/2026 (PR #131)
- [x] [[008-add-employee-email-invitation]] - ✅ COMPLETADO el 19/04/2026 (PR #133)
- [x] [[009-fix-employee-session-issues]] - ✅ COMPLETADO el 19/04/2026 (PR #135)
- [x] [[010-update-schedule-functionality]] - ✅ COMPLETADO el 20/04/2026 (PR #137)
- [x] [[011-migrate-colors-palette]] - ✅ COMPLETADO el 28/04/2026 (PR #1)
- [x] [[012-rename-ems-to-condove-sgc]] - ✅ COMPLETADO el 04/05/2026 (PR #3)
- [x] [[013-fix-modal-empleados-coordinadores]] - ✅ COMPLETADO el 07/05/2026 (PR #5)
- [x] [[014-add-exif-metadata-workphotos]] - ✅ COMPLETADO el 08/05/2026 (PR #7)
- [x] [[015-restrict-hr-viewer-permissions]] - ✅ COMPLETADO (PR #26 → dev, mergeado 2026-06-07)
- [x] [[016-update-logo-and-user-greeting]] - ✅ COMPLETADO el 14/05/2026 (PR #9)
- [x] [[017-fix-employee-checkbox-department]] - ✅ COMPLETADO el 18/05/2026 (PR #13)
- [x] [[018-fix-employee-single-department]] - ✅ COMPLETADO el 18/05/2026 (PR #15)
- [x] [[019-add-hr-cargo-system]] - ✅ COMPLETADO el 20/05/2026 (PR #19)
- [x] [[020-sistema-bitacoras]] - ✅ COMPLETADO el 24/05/2026 (PR #21)
- [x] [[021-push-notifications]] - ✅ COMPLETADO el 31/05/2026 (PR #24 → dev, PR #25 → main, mergeados)
- [x] [[022-fix-department-uniqueness-per-org]] - ✅ COMPLETADO el 07/06/2026
- [x] [[023-fix-editor-paragraph-spacing]] - ✅ COMPLETADO el 08/06/2026
- [x] [[024-employee-home-department-description]] - ✅ COMPLETADO el 08/06/2026
- [x] [[025-cron-jobs-correction]] - ✅ COMPLETADO el 08/06/2026 (PR #32 → dev, mergeado)
- [x] [[026-unify-dropdown-styles]] - ✅ COMPLETADO el 16/06/2026 (dev directo)
- [x] [[027-videos-en-bitacoras]] - ✅ COMPLETADO el 10/07/2026
- [x] [[028-actualizar-reglas-agentes]] - ✅ COMPLETADO el 16/07/2026
- [x] [[029-correccion-reglas-agentes]] - ✅ COMPLETADO el 21/07/2026
- [x] [[030-fix-hr-scrolling-table-header]] - ✅ COMPLETADO el 21/07/2026
- [x] [[031-hr-profile-page]] - ✅ COMPLETADO el 27/07/2026
- [x] [[032-master-agent-initialization-prompt]] - ✅ COMPLETADO el 28/07/2026
- [x] [[033-entrypage-workforce-landing-sections]] - ✅ COMPLETADO el 10/08/2026 (reapertura 13/08/2026: fix dark/light + ajustes contenido, cerrado)
- [x] [[034-public-navbar-component]] - ✅ COMPLETADO el 19/08/2026 (PR #49 → dev, pendiente merge)
- [x] [[035-hr-employee-reports]] - ✅ COMPLETADO el 21/08/2026 → 🟡 REAPERTA 24/08/2026 (interactividad + filtros, plan en actual.md)
- [x] [[036-master-initi-local-setup]] - ✅ COMPLETADO el 24/08/2026 (commits 9325c2d + f8d68b5 en feat/weekly-reports → PR #50)
- [x] [[037-master-init-reopen-section]] - ✅ COMPLETADO el 24/08/2026 (commit b287874 en feat/weekly-reports → PR #50)
- [x] [[038-seed-reportes-semanales]] - ✅ COMPLETADO el 27/08/2026 (seed-reports.mjs + first-seed, commit f9a088d en feat/weekly-reports, subtarea de #035)

---

## 🛠️ REGLAS DE ORO (DE CUMPLIMIENTO OBLIGATORIO)

### 📋 PLANTILLA DE BITÁCORA (OBLIGATORIO SEGUIR)
> Todas las bitácoras DEBEN seguir la estructura definida en `00-plantilla.md`

**Ver plantilla completa:** [.bitacoras/00-plantilla.md](./00-plantilla.md)

**Ver ejemplo aplicado:** [[001-Update-HRCards]]

---

### 📖 Documentación Obligatoria (LEER SIEMPRE)
> Estas son tus fuentes de verdad - NO NEGOCIABLE

1. **AGENTS.md** - Configuración del agente y reglas fundamentales
2. **.agent/rules/global-context/global-context.md** - Reglas globales del proyecto (Tech Stack, Arquitectura, Calidad)

### 🖼️ Design System
- **.agent/rules/design-system/index.md** - Tokens, colores, opacidades, componentes
- **Regla:** Usar hook `useIsDark()` para estilos dinámicos
- **Regla:** Fondo mínimo oscuro = `0.05`, Borde mínimo oscuro = `0.12`

### 🔧 Git Workflow (CUMPLIMIENTO OBLIGATORIO)
- **.agent/workflows/git-workflow.md** - Flujo de trabajo completo
- **Regla:** NUNCA hacer cambios directos en `main` o `dev`
- **Regla:** SIEMPRE sincronizar con main y dev antes de crear rama
- **Regla:** Usar @git-branch-formatter para nombres de ramas
- **Regla:** Usar @git-commit-formatter para mensajes de commit
- **Regla:** NUNCA PR directamente a main - PRIMERO a dev

### 📋 Checklist de Verificación
- **.agent/checklist-verify.md** - Checklist obligatorio antes de cada tarea

### 🗂️ Prompts del Sistema
- **.opencode/prompts/build.txt** - Instrucciones para el agente build
- **.opencode/prompts/review.txt** - Instrucciones para el agente review

---

## 📊 FLUJO DE TRABAJO RECOMENDADO

```
1.  **TRIAGE INICIAL:** Determinar el ámbito de la tarea.
    *   **¿Es EXENTA?** (Cambios en `.gitignore`, configuraciones de IA como `.agent/`, `.opencode/` o archivos locales temporales).
        *   👉 **Acción:** Presentar Plan de Acción breve -> Obtener aprobación -> Ejecutar. (Fin del flujo).
    *   **¿Es TRACKEABLE?** (Código fuente en `client/` o `server/`, assets, DB o config de prod).
        *   👉 **Acción:** Continuar al paso 2.

2.  **INMERSIÓN DE CONTEXTO:**
    *   LEER `.bitacoras/index.md` (este archivo).
    *   LEER `.bitacoras/actual.md` para entender el estado de la misión.
    *   Consultar `.agent/rules/global-context/global-context.md` y `.agent/rules/design-system/index.md` para asegurar cumplimiento técnico y visual.

3.  **PREPARACIÓN DE ENTORNO (Git):**
    *   Sincronizar con `main` y `dev`.
    *   Crear rama desde `dev` usando `@git-branch-formatter`.

4.  **PLANIFICACIÓN Y EJECUCIÓN:**
    *   Presentar Plan de Acción detallado.
    *   Ejecutar **PRE-FLIGHT CHECK** antes de escribir código.
    *   Implementar cambios siguiendo los estándares de naming y arquitectura (Sección 8 y 9 de Global Context).

5.  **FINALIZACIÓN Y REGISTRO:**
    *   Realizar Commit usando `@git-commit-formatter`.
    *   Subir rama (Push) y preparar PR hacia `dev` (NUNCA a `main`).
    *   Actualizar `.bitacoras/actual.md` y crear/actualizar la bitácora correspondiente según `00-plantilla.md`.
```

---

*Actualizado: 2026-08-24*
*Tarea #037 ✅ COMPLETADA — MASTER-INIT.md §14: reapertura diaria de servicios + protocolo no interactivo para agentes IA*
