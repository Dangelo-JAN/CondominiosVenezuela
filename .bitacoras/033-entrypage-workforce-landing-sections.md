# 🛠️ TAREA: Landing EntryPage estilo Workforce.com (Design System v4)
**ID:** #033 | **Estado:** 🟡 EN CURSO | **Fecha:** 2026-08-10

---

## 🎯 OBJETIVO FINAL
> Que la landing pública `EntryPage.jsx` tenga la riqueza de secciones de es.workforce.com (features, cómo funciona, testimonios, FAQ, recursos, etc.) manteniendo TODAS las reglas del Design System v4 (paleta 🇻🇪, useIsDark, contrastes, cero indigo/amber/purple) sin romper nada.

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)
- **Lo último que funcionó:** Plan aprobado por el usuario. Rama `feat/entrypage-workforce-landing-sections` creada desde `dev` y pusheada.
- **Dónde se rompió/detuvo:** —
- **Siguiente acción inmediata:** Fase 1 — Migrar acentos legacy (purple/indigo/amber → blue/yellow) en EntryPage + Footer + reactividad `useIsDark()`.

---

## 📝 CAMBIOS TÉCNICOS CLAVE
- [x] **F1** Migración de acentos legacy: EntryPage + Footer (prop `isDark`) + `useIsDark()` reactivo — COMPLETADO
- [x] **F2** Secciones Features (6) + "¿Cómo funciona?" (6 pasos) — COMPLETADO (commit `1d839ce`)
- [ ] **F3** Trust bar + Testimonios + "Sabías que…" + Seguridad/Certificaciones — PENDIENTE
- [ ] **F4** Recursos/Ebooks (SVGs de muestra) + CTA final + FAQ acordeón + Alianzas — PENDIENTE
- [ ] **F5** Auditoría responsive + dark/light + migración `ContactSalesDialog` + builds finales — PENDIENTE
- [ ] Builds obligatorios antes de cada commit (client build + server test) — PENDIENTE

---

## ⚠️ NOTAS DE MEMORIA
- *Regla:* Cero tokens legacy (`indigo`, `amber`, `purple`) — solo blue `#003DA5` / yellow `#FCE300`
- *Regla:* Dark mode fondos ≥ `0.04`, bordes ≥ `0.10`, separadores perceptibles
- *Regla:* `useIsDark()` único método reactivo permitido · sin `document.documentElement`
- *Regla:* Borde siempre más oscuro/perceptible que el fondo
- *Branch:* `feat/entrypage-workforce-landing-sections`
- *Commit:* —
