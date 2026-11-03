# 🛠️ TAREA: Payroll Receipts Tab UI Implementation
**ID:** #038 | **Estado:** 🟡 EN CURSO | **Fecha:** 2026-11-03

---

## 🎯 OBJETIVO FINAL
> Refactorizar y completar la pestaña "Recibos" (PayrollReceiptsTab) para paridad visual/funcional total con PayrollPeriodsTab usando Design System v4 (CustomSelect, ThemedListWrapper/Container, tokens blue, useIsDark).

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)

- **Lo último que funcionó:** Fase 1 completada. Filtros migrados a CustomSelect (acento blue), período poblado desde store, tipo recibo agregado, paginación funcional. Builds: client ✅ 0 errores, server ✅ 127 passing.
- **Dónde se rompió/detuvo:** Inicio de Fase 2 - Migración tabla a ThemedListWrapper/Container
- **Siguiente acción inmediata:** Implementar Fase 2 - Reemplazar tabla HTML por ThemedListWrapper + ThemedHeadingBar + ThemedListContainer con layout responsive grid-cols-9

---

## 📝 CAMBIOS TÉCNICOS CLAVE

- [x] **FASE 1:** Refactor Filtros + Integración Store (CustomSelect, filtro período desde store, tokens blue) — **COMPLETADA**
- [ ] **FASE 2:** Migración a ThemedListWrapper/Container (tabla → themed components, layout responsive)
- [ ] **FASE 3:** Badges Estado + Tipos + Acciones Contextuales (status config, permisos, botones acción)
- [ ] **FASE 4:** Modal Detalle Enriquecido + Export (header, tabla conceptos, totales, export JSON/CSV)
- [ ] **FASE 5:** Empty State + Loading + Paginación + Pulido (estados consistentes, responsive)
- [ ] **FASE 6:** Validación Final + Bitácora + PR (builds, auto-mantenimiento, PR a 037-payroll-venezuelan-module)

---

### 📋 RESUMEN FASE 1 (COMPLETADA)
✅ Reemplazados `<select>` nativos por `CustomSelect` con acento `blue` (Design System v4)
✅ Filtro **Período** poblado dinámicamente desde `payrollReducer.periods.data` via `useSelector`
✅ Agregado filtro **Tipo Recibo** (NORMAL, VACATION, UTILIDADES, SOCIAL_BENEFITS, SETTLEMENT)
✅ Inputs de búsqueda y empleado migrados a tokens Design System (bordes, fondos, focus rings blue)
✅ Estados de carga (Loader2), error y empty state consistentes
✅ Paginación con patrón ChevronDown + "Página X de Y"
✅ **Builds verificados:** Client `npm run build` = 0 errores | Server `npm run test` = 127 passing

---

## ⚠️ NOTAS DE MEMORIA

- **Regla:** Design System v4 - Prohibido `<select>` nativo, usar `CustomSelect` (acento blue para nómina)
- **Regla:** Tokens obligatorios - `useIsDark()` para estilos dinámicos, bordes `rgba(0,61,165,0.15)` light / `rgba(0,61,165,0.35)` dark
- **Regla:** ThemedListWrapper + ThemedHeadingBar + ThemedListContainer para listas tabulares
- **Regla:** Permisos via `useHRAuth()` → `can('payroll', 'read'|'calculate'|'void')`
- **Branch:** feat/038-payroll-receipts-tab-ui (desde 037-payroll-venezuelan-module)
- **PR Base:** 037-payroll-venezuelan-module (NO dev ni main)
- **Builds obligatorios:** client `npm run build` = 0 errores | server `npm run test` = all passing
- **STOPs obligatorios:** Cada fase termina con STOP → builds → commit → aprobación explícita