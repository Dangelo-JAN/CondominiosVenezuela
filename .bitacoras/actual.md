# 🛠️ TAREA ACTUAL
**ID:** #034 | **Estado:** 🟡 EN CURSO | **Fecha:** 2026-08-18

---

## 🎯 OBJETIVO FINAL
> Extraer el navbar de EntryPage.jsx a un componente reutilizable `PublicNavbar.jsx` en `components/common/`, crear PWA Context para compartir estado PWA, y eliminar el stat "+10K Usuarios activos" del Hero section.

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)
*Usa esto para "despertar" a la IA si el chat se cierra:*

- **Lo último que funcionó:** PublicNavbar.jsx extraído y funcionando. PWA Context creado.
- **Dónde se rompió/detuvo:** Fase 1 completada — commit + push pendiente.
- **Siguiente acción inmediata:** Commit Fase 1 → STOP → esperar aprobación.

---

## 📝 CAMBIOS TÉCNICOS CLAVE
- [x] Crear `client/src/contexts/PWAContext.jsx` — Fase 1
- [ ] Modificar `client/src/components/common/PublicNavbar.jsx` — Fase 2
- [ ] Modificar `client/src/pages/Employees/EntryPage.jsx` — Fase 3
- [ ] Wire-up `PWAProvider` en `client/src/App.jsx` — Fase 4
- [ ] Build verification final — Fase 5

---

## ⚠️ NOTAS DE MEMORIA
- *Regla:* El navbar es 100% self-contained — consume PWA Context.
- *Regla:* NO cambiar ni estilo ni funcionalidad del navbar.
- *Regla:* Solo eliminar "+10K Usuarios activos". Mantener Uptime y Soporte 24/7.
- *Regla:* PWAContext se comparte entre PublicNavbar y hero banner de EntryPage.
- *Branch:* feat/public-navbar-component
- *Commit:* pendiente
