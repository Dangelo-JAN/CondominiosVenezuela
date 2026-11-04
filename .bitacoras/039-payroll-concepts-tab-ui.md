# 🛠️ TAREA: Payroll Concepts Tab UI
**ID:** #039 | **Estado:** 🟡 EN CURSO | **Fecha:** 2026-11-04

---

## 🎯 OBJETIVO FINAL
> Implementar la UI completa de la pestaña "Conceptos" de nómina (CRUD: listado con filtros, búsqueda, paginación, modal crear/editar con validación de fórmula, tipos de recibo), reemplazando el placeholder "En desarrollo".

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)
*Usa esto para "despertar" a la IA si el chat se cierra:*

- **Lo último que funcionó:** Análisis de código base completado (PayrollPeriodsTab, PayrollReceiptsTab, PayrollThunk, PayrollSlice, PayrollConcept model/controller, seeds). Plan técnico definido.
- **Dónde se rompió/detuvo:** Pendiente aprobación del plan con fases y STOPs obligatorios.
- **Siguiente acción inmediata:** Presentar plan por fases con STOPs y obtener aprobación para iniciar Fase 1.

---

## 📝 CAMBIOS TÉCNICOS CLAVE
- [x] **Fase 1:** Estructura base + ThemedList + Filtros (Kind, Active, Search) + Paginación ✅ **STOP APROBADO**
- [x] **Fase 2:** Modal Crear/Editar Concepto (ConceptFormModal) con todos los campos del modelo ✅ **STOP APROBADO**
- [x] **Fase 3:** Validación de fórmula en tiempo real + Carga de Receipt Types + Acciones CRUD completas (incluido en Fase 2) ✅
- [x] **Fase 4:** Builds verificados ✅ | Commit `e5a48d7` ✅ | Push ✅ 
- [x] **Fix crítico 1:** Reordenadas rutas en `Payroll.route.js` - específicas antes que `:id` (fix "Cast to ObjectId failed")
- [x] **Fix crítico 2:** Reescrito `ConceptFormModal.jsx` - early return temprano, estructura tipo `PayrollPeriodFormModal`, animaciones (fix modal no aparece)
- [x] **Fix crítico 3 (auth):** Permissions no retornadas en HRLogin/HandleAcceptInvitation + fallback cliente a DEFAULT_PERMISSIONS[role]
  - `HRAuth.controller.js`: HandleHRLogin agrega `permissions: HR.permissions.toObject()`
  - `HRProfiles.controller.js`: HandleAcceptInvitation agrega `permissions: hr.permissions.toObject()`
  - `useHRAuth.js`: fallback a `DEFAULT_PERMISSIONS[role]` si permissions undefined
  - Fix: botones Payroll (create/read) ahora visibles para HR-Manager
- [ ] **Fase 5:** Commit fixes + Push + PR + Post-flight

---

## ⚠️ NOTAS DE MEMORIA
- *Regla:* Acento **blue** (#003DA5) para sección Nómina (design-system/index.md §21)
- *Regla:* Usar `CustomSelect` obligatorio (no `<select>` nativo)
- *Regla:* Modo oscuro con `useIsDark()` + tokens `dark:bg-[rgba(255,255,255,0.04)]`, `dark:border-[rgba(255,255,255,0.12)]`
- *Regla:* Conceptos `is_system: true` no editables/eliminables (backend + UI disabled)
- *Regla:* STOP obligatorio al final de cada fase con aprobación del usuario
- *Branch:* feature/039-payroll-concepts-tab-ui (desde 037-payroll-venezuelan-module)
- *Base PR:* 037-payroll-venezuelan-module (NO dev, NO main)