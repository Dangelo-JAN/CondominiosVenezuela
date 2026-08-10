# 🛠️ TAREA ACTUAL
**ID:** #033 | **Estado:** 🟡 EN CURSO | **Fecha:** 2026-08-10

---

## 🎯 OBJETIVO FINAL
> Que la landing pública `EntryPage.jsx` tenga la riqueza de secciones de es.workforce.com (features, cómo funciona, testimonios, FAQ, recursos, etc.) manteniendo TODAS las reglas del Design System v4 (paleta 🇻🇪, useIsDark, contrastes, cero indigo/amber/purple) sin romper nada.

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudacion)
*Usa esto para "despertar" a la IA si el chat se cierra:*

- **Lo ultimo que funciono:** F3 COMPLETADA — Trust bar (500+ condominios) + Testimonios (carrusel fade + dots) + "Sabías que…" (2 stats) + Seguridad (4 badges). Build client OK + server 16/16 tests. Commit `0d76b58` pusheado.
- **Donde se rompio/detuvo:** —
- **Siguiente accion inmediata:** F4 — Recursos (SVGs de muestra) + CTA final + FAQ acordeón + Alianzas. ESPERAR aprobación del usuario (STOP F3).

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
