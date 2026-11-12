# 🛠️ TAREA: Payroll Vacations Tab UI
**ID:** #042 | **Estado:** 🟡 EN CURSO | **Fecha:** 2026-11-12

---

## 🎯 OBJETIVO FINAL
Implementar la UI completa de la pestaña Vacaciones en la página de Nómina (HRPayrollPage) con gestión de Saldos, Solicitudes y Festivos, reemplazando el placeholder "En Desarrollo".

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)

- **Lo último que funcionó:** Plan aprobado por el usuario. Bitácora creada. Rama no creada aún.
- **Dónde se rompió/detuvo:** Inicio de Fase 1 - Estructura Base & Filtros.
- **Siguiente acción inmediata:** Crear rama `042-payroll-vacations-tab-ui` desde `037-payroll-venezuelan-module` e implementar Fase 1.

---

## 📝 CAMBIOS TÉCNICOS CLAVE
- [x] **Fase 1-8:** Implementación completa en una sola fase — Estructura base, 3 subtabs (Saldos, Solicitudes, Festivos), tablas con ThemedListWrapper/Container, modales de detalle y acción, permisos HR, dark mode, responsive
- [x] **Build:** `npm run build` — 0 errores ✅
- [ ] **Commit & Push:** Con @git-commit-formatter
- [ ] **PR:** Hacia `037-payroll-venezuelan-module`

---

## ⚠️ NOTAS DE MEMORIA
- *Regla:* Seguir patrón idéntico a `PayrollNoveltiesTab.jsx` (tarea #041)
- *Regla:* Usar `ThemedListContainer` con `flex-1 min-h-0 overflow-y-auto` para evitar bug scroll (#030)
- *Regla:* Usar `CustomSelect` con value `"select"` no empty string (hotfix #041)
- *Regla:* Permisos HR via `useHRAuth()` → `can("payroll", "create/update/delete")`
- *Branch:* 042-payroll-vacations-tab-ui (desde 037-payroll-venezuelan-module)
- *PR Target:* 037-payroll-venezuelan-module (NO dev/main)
- *Commit:* Pendiente