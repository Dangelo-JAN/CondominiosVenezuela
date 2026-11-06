# 🛠️ TAREA: Payroll Policy Tab UI Implementation
**ID:** #040 | **Estado:** 🟡 EN CURSO | **Fecha:** 2026-11-05 (reabierta 2026-11-06)

---

## 🎯 OBJETIVO FINAL
> Implementar la UI completa de la pestaña "Políticas" en la página de Nómina (HR), reemplazando el texto "En desarrollo" por un formulario organizado por 5 secciones que permita visualizar y editar la configuración de nómina venezolana (LOTTT, IVSS, FAOV, INCES, ISLR, RPE, LPPSS, cestaticket, vacaciones, bono vacacional, utilidades, prestaciones sociales, horas extra).
> **Extendido:** Corregir bug crítico: lazy-creation de PayrollCompany con datos inválidos (rif/email vacíos) → integrar RIF en Organization + crear PayrollCompany válida en HR Signup (transacción atómica).

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)
*Usa esto para "despertar" a la IA si el chat se cierra:*

- **Lo último que funcionó:** FASE 1, 2 y 3 completadas. UI completa + Fix React #300 + Organization RIF + Migración Atlas + HR Signup atómico + Controller getCompanyConfig 404 fix. Builds ✅ Tests ✅.
- **Dónde se rompió/detuvo:** FASE 4 pendiente - UI PayrollPolicyTab manejo 404 COMPANY_NOT_CONFIGURED.
- **Siguiente acción inmediata:** Implementar FASE 4 (UI manejo 404 → estado "Configuración pendiente" + CTA setup).

---

## 📝 CAMBIOS TÉCNICOS CLAVE (PLAN EXTENDIDO)
- [x] UI completa: 5 secciones, 49 campos, inline edit, validaciones, dark mode
- [x] Fix React Error #300 (native select styled)
- [x] Build client: 0 errores | Build server: 127 tests passing
- [x] **EXTENSIÓN BUG FIX F1:** RIF en Organization.model.js (alphanumeric, sparse unique, sanitizeRif) + parentOrganizationID + organizationType
- [x] **EXTENSIÓN BUG FIX F1:** Migración producción: Org `6a0cac2d63fe9b9c98e59a54` → `rif=J314188305` (Atlas verificado)
- [x] **EXTENSIÓN BUG FIX F2:** HR Signup → Transacción atómica Organization + PayrollCompany (rif=org.rif, email=org.email)
- [x] **EXTENSIÓN BUG FIX F3:** Controller getCompanyConfig: eliminar lazy-creation → 404 COMPANY_NOT_CONFIGURED
- [ ] **EXTENSIÓN BUG FIX F4:** UI PayrollPolicyTab: manejar 404 → estado "Configuración pendiente" + CTA setup
- [ ] Commit + PR hacia `037-payroll-venezuelan-module` (PR #56 existe)

---

## ✅ FUNCIONALIDADES IMPLEMENTADAS (UI - COMPLETADO)

### 5 Secciones Configurables (49 campos totales):
1. **Tasas Legales** (16 campos): IVSS, FAOV, RPE, LPSSS, INCES, Cestaticket, UT, IMII, Salario Mínimo, Tasa Cambio
2. **Factores de Pago** (5 campos): Festivos, descanso, horas extra diurna/nocturna, bono nocturno
3. **Vacaciones** (14 campos): Días base/año/máx, bono vacacional, antigüedad, modo acumulación, base salarial, cestaticket
4. **Split Salarial** (2 campos): Modo (MIXTO/BASE_COMPLEMENT/TOTAL_BASE), % base
5. **Configuración General** (12 campos): Días descanso, tope antigüedad, inclusiones en prestaciones (7 booleanos)

### Características UX:
- Edición inline por sección (botón Editar → inputs en contexto)
- Botón "Guardar Todo" para batch update
- Validación cruzada: vacation_days_max ≥ base, split_percentage 1-99% en MIXTO
- Formato números: currency (VES/USD), percentage (%), factor (x), integer
- Tooltips con contexto legislación venezolana en cada campo
- Accesibilidad: aria-labels, aria-describedby, aria-invalid, focus-visible, role=alert
- Responsive: grid 1/2/3 cols, sticky "Guardar Todo" bar
- Dark/Light mode: tokens design system v4 (blue accent #003DA5)

---

## 🐛 BUG CRÍTICO IDENTIFICADO (Post-Deploy)

### Causa Raíz:
```
Controller getCompanyConfig (línea 83-141):
  → No encuentra PayrollCompany
  → Intenta crear con: rif: '', email: '' (strings vacíos)
  → Mongoose validation FAIL: rif/email required
  → Error 500 → UI muestra "Error cargando políticas"
```

### Solución Arquitectural (Plan Extendido):

| Fase | Acción | Archivos |
|------|--------|----------|
| **F1** | Organization.model.js: agregar `rif` (alphanumeric, sparse unique, sanitizeRif setter) + `parentOrganizationID` + `organizationType` | Organization.model.js |
| **F1** | Migración producción: Org `6a0cac2e63fe9b9c98e59a56` → `rif=J314188305` | migrate-organization-rif.mjs (Atlas) |
| **F2** | HR Signup: transacción atómica Org + PayrollCompany (rif=org.rif, email=org.email) | HRSignupController |
| **F3** | getCompanyConfig: eliminar .create() inválido → 404 COMPANY_NOT_CONFIGURED | PayrollPolicyController |
| **F4** | PayrollPolicyTab: manejar 404 → UI "Configuración pendiente" + CTA setup | PayrollPolicyTab.jsx |

---

## ⚠️ NOTAS DE MEMORIA
- *Regla:* **SOLO** usar `PayrollConceptsTab.jsx` como patrón UI
- *Regla:* Acento **blue** (#003DA5) para Nómina
- *Regla:* Fix aplicado: native select styled (Radix Select v2 incompatible SSR condicional)
- *Regla:* RIF en BD = Solo `[A-Z0-9]` (ej: `J314188305`) - NUNCA guiones
- *Regla:* Transacción atómica Org + PayrollCompany o rollback total
- *Regla:* Controller NUNCA crea datos inválidos - 404 explícito
- *Regla:* Signup valida RIF - Requerido para HR/Administradora
- *Regla:* Org producción `6a0cac2e63fe9b9c98e59a56` → `J314188305` EN ATLAS
- *Branch:* 040-payroll-policy-tab-ui (trabajo en rama actual)
- *PR:* #56 hacia 037-payroll-venezuelan-module (ya creado)
- *Modelo:* PayrollCompany 1:1 Organization (no User) - multi-HR comparten misma company