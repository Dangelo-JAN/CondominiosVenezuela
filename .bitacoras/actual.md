# 🛠️ TAREA ACTUAL
**ID:** #033 | **Estado:** 🟡 EN CURSO | **Fecha:** 2026-08-13

---

## 🎯 OBJETIVO FINAL
Reapertura de #033 (Landing EntryPage v4) para:
1. ✅ Fix bug modo claro/oscuro en refresco (causa raíz: `useIsDark` no leía `localStorage`; fix aplicado en `client/src/hooks/useIsDark.js`)
2. ✅ Backup de `EntryPage.jsx` en `Actualizaciones/` (post-fix, pre-modificaciones)
3. 🔄 Aplicar 6 modificaciones de contenido/estructura en `EntryPage.jsx`

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudacion)
*Usa esto para "despertar" a la IA si el chat se cierra:*

- **Lo ultimo que funciono:** Fix dark/light en `useIsDark.js` (init lee `localStorage` con fallback DOM) — build OK. Backup creado en `Actualizaciones/EntryPage.jsx`. Bitácora #033 reabierta.
- **Donde se rompio/detuvo:** — (en curso, sin bloqueos)
- **Siguiente accion inmediata:** Aplicar las 6 modificaciones en `EntryPage.jsx`:
  1. Eliminar cards "Nómina Inteligente" y "Reportes en Tiempo Real" de features (grid → 2x2)
  2. Cómo funciona: "Configura" → "Carga Departamentos, Empleados y Horarios"; "Gestiona" → "Asistencias y avisos en un solo lugar"
  3. Eliminar sección `confianza` + re-alternar colores de secciones contiguas
  4. Card "40%" de Sabías que → texto sobre errores en gestión de horarios/tareas
  5. Recursos: eliminar card "Nómina sin errores, paso a paso" (grid → 3 cols) + borrar SVG huérfano
  6. FAQ "¿Qué es CondoVE SGC?" → quitar "la nómina, "

---

## 📝 CAMBIOS TECNICOS CLAVE
- [x] Fix `useIsDark.js`: init lee `localStorage("ems-theme")` con fallback `classList` (causa raíz del bug de refresco)
- [x] Backup `Actualizaciones/EntryPage.jsx` (sin commitear — respaldo local)
- [ ] M1: features sin Nómina Inteligente/Reportes + grid 2x2
- [ ] M2: títulos Cómo funciona
- [ ] M3: eliminar confianza + alternar fondos
- [ ] M4: card 40% horarios/tareas
- [ ] M5: Recursos 3 cards + limpiar SVG
- [ ] M6: FAQ texto
- [ ] Build client OK + commit + push + PR #48

---

## ⚠️ NOTAS DE MEMORIA
- *Regla:* PLAN FIRST / STOPS por fase / builds antes de commit / PR → dev (nunca main)
- *Branch:* `feat/entrypage-workforce-landing-sections` (PR #48 abierto)
- *Commit:* último `42223c5` (7 commits previos de la tarea original)
