# 🛠️ TAREA: Fix Scrolling y Cabecera de Tabla en Páginas HR
**ID:** #030 | **Estado:** ✅ COMPLETADO | **Fecha:** 2026-07-21 | **Cierre:** 2026-07-21

---

## 🎯 OBJETIVO FINAL
> Que las páginas de empleados y bitácoras en el perfil HR muestren todo su contenido con scrolling correcto y que la cabecera de la tabla de bitácoras no colapse.

---

## 📝 CAMBIOS TÉCNICOS CLAVE
- [x] Plan aprobado por usuario
- [x] Rama creada y pusheada (`fix/hr-scrolling-table-header` desde `dev`)
- [x] Fix ListDesigns.jsx — ThemedListWrapper → `flex-shrink-0` (header no colapsa)
- [x] **Fix ListDesigns.jsx — ThemedListContainer → `flex-1 min-h-0 overflow-y-auto`** (CAUSA RAÍZ)
- [x] Fix ListDesigns.jsx — ListContainer → mismo fix para backward compatibility
- [x] Fix employeespage.jsx — Page root sin overflow-y-auto + table wrapper `min-h-0`
- [x] Fix hrbitacoraspage.jsx — Page root sin overflow-y-auto + table wrapper `min-h-0`
- [x] Build verification (npm run build) — 0 errores
- [x] Regla de Root Cause Analysis agregada a AGENTS.md, development-invariants.md, global-context/index.md, checklist-verify.md
- [x] Commit + Push (commits: `7f28a5f` → `a10f846` → `8a71707`)

---

## 🔍 ROOT CAUSE ANALYSIS (Post-Mortem)

### Causa Raíz
`ThemedListContainer` tenía `overflow-hidden` y crecía libremente para encajar todo su contenido. El `overflow-auto` del wrapper padre nunca se activaba porque el container nunca se desbordaba.

### Cadena de Nodos
`DashboardLayout → Outlet → PageRoot → TableWrapper → ThemedListWrapper (flex-shrink-0) → ThemedListContainer (overflow-hidden)`

### Fix Correcto
`ThemedListContainer` necesitaba `flex-1 min-h-0 overflow-y-auto` para llenar el espacio restante después del header y scrollear internamente.

### Lección Aprendida
El fix estaba 2 niveles más abajo del que se observaba el síntoma. Se intentó 3 veces antes de mapear la cadena completa. Esto generó la regla ⚜️ 0.7 (Root Cause Analysis Obligatorio).

---

## ⚠️ NOTAS DE MEMORIA
- *Regla:* Responsive debe mantenerse en todos los breakpoints
- *Regla:* Nada debe romperse en otras páginas que usan DashboardLayout
- *Branch:* `fix/hr-scrolling-table-header`
- *Commits:* `7f28a5f` → `a10f846` → `8a71707`
- *Regla nueva:* ⚜️ 0.7 Root Cause Analysis Obligatorio (nacida de esta tarea)
