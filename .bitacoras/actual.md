# 🛠️ TAREA ACTUAL
**ID:** #033 | **Estado:** 🟡 EN CURSO | **Fecha:** 2026-08-10

---

## 🎯 OBJETIVO FINAL
> Que la landing pública `EntryPage.jsx` tenga la riqueza de secciones de es.workforce.com (features, cómo funciona, testimonios, FAQ, recursos, etc.) manteniendo TODAS las reglas del Design System v4 (paleta 🇻🇪, useIsDark, contrastes, cero indigo/amber/purple) sin romper nada.

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudacion)
*Usa esto para "despertar" a la IA si el chat se cierra:*

- **Lo ultimo que funciono:** F4 COMPLETADA — 4 SVGs de muestra + Recursos + CTA final (banda blue/yellow) + FAQ acordeón + Alianzas. Build client OK + server 16/16 tests. Commit `ea1704b` pusheado.
- **Donde se rompio/detuvo:** —
- **Siguiente accion inmediata:** F5 — Auditoría responsive/dark + migración `ContactSalesDialog` + builds finales. ESPERAR aprobación del usuario (STOP F4).

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
