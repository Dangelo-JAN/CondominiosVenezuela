# 🛠️ TAREA: Fix Scrolling y Cabecera de Tabla en Páginas HR
**ID:** #030 | **Estado:** 🟡 EN CURSO | **Fecha:** 2026-07-21

---

## 🎯 OBJETIVO FINAL
> Que las páginas de empleados y bitácoras en el perfil HR muestren todo su contenido con scrolling correcto y que la cabecera de la tabla de bitácoras no colapse.

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)
- **Lo último que funcionó:** Plan aprobado por el usuario. Rama `fix/hr-scrolling-table-header` creada desde `dev`.
- **Dónde se rompió/detuvo:** Iniciando implementación de FASE 2 (DashboardLayout).
- **Siguiente acción inmediata:** Modificar `DashboardLayout.jsx` línea 83.

---

## 📝 CAMBIOS TÉCNICOS CLAVE
- [x] Plan aprobado por usuario
- [x] Rama creada y pusheada
- [ ] Fix DashboardLayout.jsx — Outlet wrapper → flex column
- [ ] Fix employeespage.jsx — Page root + table wrapper flex chain
- [ ] Fix hrbitacoraspage.jsx — Page root + table wrapper flex chain
- [ ] Fix ListDesigns.jsx — ThemedListWrapper → flex-shrink-0
- [ ] Build verification (npm run build)
- [ ] Commit + Push

---

## ⚠️ NOTAS DE MEMORIA
- *Regla:* Responsive debe mantenerse en todos los breakpoints
- *Regla:* Nada debe romperse en otras páginas que usan DashboardLayout
- *Branch:* fix/hr-scrolling-table-header
- *Commit:* pendiente
