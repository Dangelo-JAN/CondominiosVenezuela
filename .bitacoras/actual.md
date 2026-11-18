# 🛠️ TAREA ACTUAL

**ID:** #044-payroll-utilities-tab-ui | **Estado:** 🟡 EN CURSO | **Fecha:** 2026-11-16

---

## 🎯 OBJETIVO FINAL
Implementar la UI completa de la pestaña **Utilidades** en la página de nómina con 3 sub-tabs funcionales: Períodos | Pagos | Cálculo, reemplazando el placeholder "En desarrollo".

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)

- **Lo último que funcionó:** Fase 1 COMPLETADA - Estructura base con 3 sub-tabs, ThemedList con datos reales via Redux (payrollReducer), filtros funcionales, paginación, dark/light mode, build 0 errores, tests 127 passed. **BUGS CRÍTICOS RESUELTOS AL 100%:**
  1. Hooks (`useMemo`) dentro de render helpers → movidos a nivel superior (Bug Prevention #7)
  2. `useHRAuth()` mal usado: `hasPermission` destruido en lugar de `can`; acciones inventadas (`calculate`, `approve`, `pay`) → mapeadas a CRUD válido (`update`) (Bug Prevention #8)
  3. `ChevronLeft/Right` faltantes en import de lucide-react
  4. `ConfirmDialog` variants corregidas a `"info"` (solo existen `danger`, `warning`, `info`)
  5. `useSearchParams` innecesario removido
  6. Import `Clock` agregado
  Rama `044-payroll-utilities-tab-ui` creada desde `037-payroll-venezuelan-module`. PR #60 abierto.

- **Dónde se rompió/detuvo:** ~~Error en deploy Vercel~~ **RESUELTO**. Causa raíz del error `t is not a function`: `hasPermission` destruido de `useHRAuth()` (no existe, es `undefined`), minificado a `t` en producción. Acciones inventadas (`calculate`, `approve`, `pay`) no existen en `DEFAULT_PERMISSIONS` de `useHRAuth.js`.

- **Siguiente acción inmediata:** Continuar con Fase 2: PeriodFormModal + PeriodDetailModal (CRUD Períodos).

---

## 📝 CAMBIOS TÉCNICOS CLAVE
- [x] Crear rama `044-payroll-utilities-tab-ui` desde `037-payroll-venezuelan-module`
- [x] Reemplazo completo `PayrollUtilitiesTab.jsx` (placeholder → implementación base)
- [x] 3 Sub-tabs: Períodos | Pagos | Cálculo con navegación
- [x] ThemedList (acento blue) para Períodos y Pagos con datos Redux
- [x] Filtros con CustomSelect (valores iniciales "select" - Bug Prevention #2)
- [x] Redux selectors usando clave correcta `state.payrollReducer` (Bug Prevention #1)
- [x] Hooks order: useCallback/useMemo ANTES de useEffect (Bug Prevention #3)
- [x] Variables/opciones en scope principal ANTES de render functions (Bug Prevention #4)
- [x] Modales preparados sin props inestables en useEffect deps (Bug Prevention #5)
- [x] Validación pura preparada (Bug Prevention #6)
- [x] **Bug Prevention #7:** Hooks (`useMemo`) movidos fuera de render helpers a nivel superior
- [x] **Bug Prevention #8:** `useHRAuth()` corregido: `hasPermission` → `can`, acciones CRUD válidas
- [x] Import `ChevronLeft`, `ChevronRight` agregado a lucide-react
- [x] `ConfirmDialog` variants corregidas a `"info"`
- [x] `useSearchParams` innecesario removido
- [x] Import `Clock` agregado
- [x] Build: `npm run build` → 0 errores
- [x] Tests: Client + Server → 127 passed, 3 skipped
- [ ] Fase 2: PeriodFormModal + PeriodDetailModal (CRUD Períodos)
- [ ] Fase 3: CalculatePreviewModal (Calcular → Preview → Aprobar → Pagar)
- [ ] Fase 4: PaymentDetailModal + Pago individual
- [ ] Fase 5: Cálculo Preview interactivo
- [ ] Fase 6: Pulido + Tests finales + Merge a 037-payroll-venezuelan-module

---

## ⚠️ NOTAS DE MEMORIA
- **Regla:** Bug Prevention (8 pilares) aplicados estrictamente - ver `.agent/rules/global-context/bug-prevention.md`
- **Regla:** PR hacia `037-payroll-venezuelan-module` (NUNCA a main/dev directamente)
- **Regla:** No marcar COMPLETADO hasta que deploy Vercel funcione sin errores
- **Branch:** `044-payroll-utilities-tab-ui` (desde `037-payroll-venezuelan-module`)
- **Commit:** `1757e7f` (último: fix useHRAuth usage + bug-prevention.md v6)
- **PR:** #60 → `037-payroll-venezuelan-module`
- **Bugs resueltos:**
  1. Pantalla en blanco (import Clock) - `943f520`
  2. "s is not a function" (render functions regulares) - `aba6525`
  3. ConfirmDialog variants - `4dc4ebf`
  4. "t is not a function" - hooks en render helpers - `64dc702`
  5. "hasPermission is not a function" - useHRAuth() mal usado - `1757e7f`
- **Referencia patrón:** PayrollSocialBenefitsTab.jsx, PayrollVacationsTab.jsx