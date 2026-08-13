# 🛠️ TAREA: Landing EntryPage estilo Workforce.com (Design System v4)
**ID:** #033 | **Estado:** ✅ COMPLETADO | **Fecha:** 2026-08-10 | **Reapertura:** 2026-08-13 | **Cierre reapertura:** 2026-08-13

---

## 🎯 OBJETIVO FINAL
> Que la landing pública `EntryPage.jsx` tenga la riqueza de secciones de es.workforce.com (features, cómo funciona, testimonios, FAQ, recursos, etc.) manteniendo TODAS las reglas del Design System v4 (paleta 🇻🇪, useIsDark, contrastes, cero indigo/amber/purple) sin romper nada. ✅ CUMPLIDO

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)
- **Lo último que funcionó:** Página completa: hero + 9 secciones + footer (901 líneas), 100% tokens v4. Tarea reabierta 2026-08-13 por bug de persistencia dark/light + 6 ajustes de contenido + 2 correcciones estéticas. Todo resuelto.
- **Dónde se rompió/detuvo:** —
- **Siguiente acción inmediata:** PR #48 hacia `dev`. (N/A — tarea cerrada)

---

## 📝 REAPERTURA 2026-08-13 (cambios adicionales)

### 🔴 FIX: Bug modo claro/oscuro en refresco
- **Causa raíz:** `useIsDark()` inicializaba `isDark` SOLO con `document.documentElement.classList.contains("dark")`. En refresh, la clase se agrega en el `useEffect` de `useTheme` (después del mount), y el `MutationObserver` de `useIsDark` se registra tras esa mutación → `isDark=false` hasta tocar el toggle. **Impacto:** 28 archivos con el bug latente.
- **Fix:** `client/src/hooks/useIsDark.js` — init lee `localStorage("ems-theme")` con fallback `classList`. Commit `96fa3db`.
- **Verificación:** build 0 errores · tests 16/16 · refresco conserva el tema ✓ (validado por usuario)

### 🎨 6 modificaciones de contenido (EntryPage.jsx)
- [x] **M1** Eliminadas cards "Nómina Inteligente" y "Reportes en Tiempo Real" de features → quedan 4, grid `md:grid-cols-2`
- [x] **M2** Textos de "¿Cómo funciona?" en **descripciones** de "Configura" ("Carga Departamentos, Empleados y Horarios.") y "Gestiona" ("Asistencias y avisos en un solo lugar.") — títulos originales intactos (corregido tras revisión del usuario)
- [x] **M3** Sección "Más de 500 condominios" (`confianza`) eliminada + fondos re-alternados (nunca dos bandas contiguas: testimonios/sabias-que/seguridad/recursos/faq/alianzas invertidos)
- [x] **M4** Card "40%" → "menos errores en la gestión de horarios y tareas" (icono `CalendarClock`, texto adaptado a horarios/turnos)
- [x] **M5** Card "Nómina sin errores, paso a paso" eliminada de Recursos → 3 cards, grid `lg:grid-cols-3` + SVG `nomina-sin-errores.svg` borrado
- [x] **M6** FAQ "¿Qué es CondoVE SGC?" → sin "la nómina"
- [x] **M7** CTA "Pruébalo": `pb-16 sm:pb-24` → `py-16 sm:py-24` (espaciado vertical completo; se pegaba a la banda de Recursos)
- [x] **Backup versionado:** `Actualizaciones/EntryPage.jsx` (post-fix dark/light, pre-modificaciones) — carpeta versionada en commit `6cd0f05`
- [x] Builds: client `npm run build` 0 errores · server `npm run test` 16/16 · cero referencias huérfanas
- [x] Usuario confirmó validación visual ✅

---

## 📝 CAMBIOS TÉCNICOS CLAVE (tarea original)
- [x] **F1** Migración acentos legacy: EntryPage + Footer (prop `isDark`) + `useIsDark()` reactivo — commit `310acd3`
- [x] **F2** Features (6 cards + screenshots reales) + "¿Cómo funciona?" (6 pasos) — commit `1d839ce`
- [x] **F3** Trust bar (500+ condominios) + Testimonios (carrusel fade + dots) + "Sabías que…" (2 stats) + Seguridad (4 badges) — commit `0d76b58`
- [x] **F4** 4 portadas SVG de muestra (`assets/ebooks/`) + Recursos + CTA final (banda blue/yellow) + FAQ acordeón + Alianzas — commit `ea1704b`
- [x] **F5** Migración `ContactSalesDialog` (purple→blue/yellow) + contraste badges yellow `#6b5700` (WCAG AA) + auditoría — commit `5e46749`
- [x] Builds obligatorios en cada fase: client `npm run build` 0 errores · server `npm run test` 16/16 ✓
- [x] Verificación final: cero tokens legacy en EntryPage/Footer/ContactSalesDialog (`rg`), sin `document.documentElement`
- [x] Usuario confirmó tarea COMPLETADA
- [x] AUTO-MANTENIMIENTO (Post-Flight): **Sin cambios requeridos** — tarea 100% presentacional en `client/`; sin nuevo stack, rutas, API, convenciones ni tokens reutilizables (se usó ACCENT_MAP existente). Cambio menor de API: Footer acepta prop `isDark` con default (documentado en NOTAS DE MEMORIA). No amerita actualizar archivos de configuración del agente.

---

## ⚠️ NOTAS DE MEMORIA
- *Regla:* Cero tokens legacy (`indigo`, `amber`, `purple`) — solo blue `#003DA5` / yellow `#FCE300`
- *Regla:* `useIsDark()` para render reactivo · `toggleTheme` de `useTheme` solo como escritor del tema
- *Regla:* Footer ahora requiere prop `isDark` (default `false` = light) — API del componente cambiada
- *Regla:* Texto sobre badges yellow claro: `#6b5700` (ratio 5.4:1 WCAG AA)
- *Branch:* `feat/entrypage-workforce-landing-sections`
- *Commits:* `310acd3` → `1d839ce` → `0d76b58` → `ea1704b` → `5e46749` → `3cc2b80` → `96fa3db` (reapertura: fix dark/light + M1-M6) → `6cd0f05` (correcciones estéticas + versionar Actualizaciones) → `303039c` (bitácora)
