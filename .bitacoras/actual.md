# 🛠️ TAREA ACTUAL
**ID:** #033 | **Estado:** 🟡 EN CURSO | **Fecha:** 2026-08-10

---

## 🎯 OBJETIVO FINAL
> Que la landing pública `EntryPage.jsx` tenga la riqueza de secciones de es.workforce.com (features, cómo funciona, testimonios, FAQ, recursos, etc.) manteniendo TODAS las reglas del Design System v4 (paleta 🇻🇪, useIsDark, contrastes, cero indigo/amber/purple) sin romper nada.

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudacion)
*Usa esto para "despertar" a la IA si el chat se cierra:*

- **Lo ultimo que funciono:** F5 COMPLETADA — ContactSalesDialog migrado a v4, contraste badges yellow corregido (WCAG AA), auditoría completa sin tokens legacy. Build client OK + server 16/16 tests. Commit `5e46749` pusheado. **TODAS las fases implementadas.**
- **Donde se rompio/detuvo:** —
- **Siguiente accion inmediata:** SECUENCIA FINAL — Esperar confirmación del usuario de TAREA COMPLETADA → actualizar bitácoras → auto-mantenimiento → PR a dev.

---

## 📝 CAMBIOS TECNICOS CLAVE
- [ ] **F1** Migración acentos legacy (EntryPage + Footer + useIsDark) — PENDIENTE
- [ ] **F2** Features (6) + "¿Cómo funciona?" (6 pasos) — PENDIENTE
- [ ] **F3** Trust bar + Testimonios + "Sabías que…" + Seguridad — PENDIENTE
- [ ] **F4** Recursos (SVGs) + CTA final + FAQ + Alianzas — PENDIENTE
- [ ] **F5** Auditoría + migración ContactSalesDialog + builds finales — PENDIENTE

---

## ⚠️ NOTAS DE MEMORIA
- *Regla:* Cero tokens legacy (indigo/amber/purple) — solo blue #003DA5 / yellow #FCE300
- *Regla:* useIsDark() único método reactivo · sin document.documentElement
- *Branch:* `feat/entrypage-workforce-landing-sections`
- *Commit:* —
