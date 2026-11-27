# 🛠️ TAREA: Payroll Policy Tab UI Implementation
**ID:** #040 | **Estado:** ✅ COMPLETADO | **Fecha:** 2026-11-09

---

## 🎯 OBJETIVO FINAL
> Implementar la UI completa de la pestaña "Políticas" en la página de Nómina (HR), reemplazando el texto "En desarrollo" por un formulario organizado por 5 secciones que permita visualizar y editar la configuración de nómina venezolana (LOTTT, IVSS, FAOV, INCES, ISLR, RPE, LPPSS, cestaticket, vacaciones, bono vacacional, utilidades, prestaciones sociales, horas extra).
> **Extendido:** Corregir bug crítico: lazy-creation de PayrollCompany con datos inválidos (rif/email vacíos) → integrar RIF en Organization + crear PayrollCompany válida en HR Signup (transacción atómica).
> **BUG RESUELTO:** React Error #300 en producción Vercel - "Element type is invalid" / "Rendered fewer/more hooks than expected" + Race condition UI flash.

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)
*Usa esto para "despertar" a la IA si el chat se cierra:*

- **Lo último que funcionó:** Task completada. Fixes aplicados y validados en local. Stack completo levantado (MongoDB, Redis, Backend, Frontend). Tab Políticas carga sin errores, sin flash de UI, sin React Error #300.
- **Dónde se rompió/detuvo:** Error #300 "Element type is invalid" / "Rendered fewer/more hooks than expected" en Vercel al navegar a /payroll/policy + comportamiento intermitente (flash UI completa → error).
- **Siguiente acción inmediata:** Task cerrada. PR #56 listo para merge a `037-payroll-venezuelan-module`.

---

## 📝 CAMBIOS TÉCNICOS CLAVE (PLAN EXTENDIDO)
- [x] UI completa: 5 secciones, 49 campos, inline edit, validaciones, dark mode
- [x] Fix React Error #300 (native select styled) - **RESUELTO**
- [x] Build client: 0 errores | Build server: tests passing
- [x] **EXTENSIÓN BUG FIX F1:** RIF en Organization.model.js (alphanumeric, sparse unique, sanitizeRif) + parentOrganizationID + organizationType
- [x] **EXTENSIÓN BUG FIX F1:** Migración producción: Org `6a0cac2d63fe9b9c98e59a54` → `rif=J314188305` (Atlas verificado)
- [x] **EXTENSIÓN BUG FIX F2:** HR Signup → Transacción atómica Organization + PayrollCompany (rif=org.rif, email=org.email)
- [x] **EXTENSIÓN BUG FIX F3:** Controller getCompanyConfig: eliminar lazy-creation → 404 COMPANY_NOT_CONFIGURED
- [x] **EXTENSIÓN BUG FIX F4:** UI PayrollPolicyTab: manejar 404 → estado "Configuración pendiente" + CTA setup
- [x] **FASE D1-D2:** Debug React Error #300 - **COMPLETADO**
- [x] **FASE D3:** Race condition eliminada con `bothResolved` gate en renderState
- [x] Commit + PR hacia `037-payroll-venezuelan-module` (PR #56 actualizado con commits `743d116`, `4107406`, `e7de632`)

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

### Causa Raíz Original:
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

## 🔴 FASE D: DEBUG REACT ERROR #300 EN PRODUCCIÓN VERCEL (FASE D1-D3 ✅ COMPLETADO)

### 🔍 CAUSA RAÍZ IDENTIFICADA Y CORREGIDA

**Error #300 = "Element type is invalid" / "Rendered fewer/more hooks than expected"**

**Causa raíz dual:**
1. **`StyledSelect`** usaba `useIsDark()` internamente pero se renderizaba **condicionalmente** (solo en modo edición) → violación Rules of Hooks
2. **`PayrollPolicyTab`** tenía **3 early returns** antes de hooks finales (`useCallback` para `handleCreateCompany`) → hooks llamados en diferente orden entre renders

**Fix aplicado (commit `743d116`):**
- `StyledSelect`: elimina `useIsDark()` interno, recibe `isDark` como prop desde padre
- `PayrollPolicyTab`: reemplaza early returns por `renderState` + IIFE `switch` → todos los hooks llamados incondicionalmente al inicio
- Fixes adicionales runtime: `PayrollCompany` creada via PUT, permisos `payroll.update: true` en BD

---

### 📋 PLAN DE DEBUG - ESTADO FINAL

---

#### **FASE D1: Análisis Stack Trace y Aislamiento (STOP 1) ✅**
- [x] D1.1: Stack trace analizado → apunta a `payroll-tabs-*` chunk
- [x] D1.2: Componente identificado: `StyledSelect` + early returns en `PayrollPolicyTab`
- [x] D1.3: Imports verificados, `normalizeValue` OK
- [x] D1.4: Lazy loading OK (no es la causa)
- [x] D1.5: `PayrollTabsContainer` OK (renderTabContent correcto)
- **STOP 1:** ✅ Commit `743d116` con hallazgos + push.

#### **FASE D2: Reproducción Local y Source Map Analysis (STOP 2) ✅**
- [x] D2.1: Source Maps habilitados en build local (vite.config.js `sourcemap: true`)
- [x] D2.2: Build local analizado → chunk `payroll-tabs-D9z9Aq6P.js` 97.75 kB
- [x] D2.3: Causa raíz confirmada: hooks condicionales + early returns
- [x] D2.4: Test manual `/payroll/policy` en local → **SIN ERRORES**
- [x] D2.5: `StyledSelect` verificado: recibe `isDark` prop, no hook interno
- **STOP 2:** ✅ Fix aplicado y validado localmente.

#### **FASE D3: Race Condition UI Flash + Validación en Producción (STOP 3) ✅**
- [x] D3.1: Fix React hooks aplicado (commit `743d116`)
- [x] D3.2: Build + deploy a Vercel preview (auto al push)
- [x] D3.3: **HALLAZGO:** Comportamiento intermitente = PayrollCompany NO existe en Atlas remoto (flujo correcto F3/F4)
- [x] D3.4: **RACE CONDITION CORREGIDA** (commit `e7de632` + `4107406`):
  - `PayrollSlice`: pending reducer usa `action.meta.arg.type` (`POLICY*`/`COMPANY*`) → `loading=true` sincrónico
  - `PayrollPolicyTab`: `renderState` espera `bothResolved = policyResolved && companyResolved` antes de renderizar **cualquier** UI
  - Elimina flash de UI completa y "a veces sí / a veces no"
- **STOP 3:** ✅ Resuelto. Build pasa, push completado.

---

#### **FASE D4: Validación Final y Cierre (STOP 4) ✅**
- [x] D4.1: Build de producción: 0 errores (`npm run build` ✅)
- [x] D4.2: Test local completo: login → nómina → pestaña políticas → navegar tabs → **SIN ERRORES, SIN FLASH**
- [x] D4.3: Ausencia Error #300 en consola confirmada
- [x] D4.4: Bitácora actualizada con resolución final
- [x] D4.5: PR #56 actualizado con 3 commits de fix, listo para merge a `037-payroll-venezuelan-module`
- **STOP 4:** ✅ **TAREA COMPLETADA** — Confirmación usuario recibida.

---

## 📦 COMMITS EN PR #56 (Historial Final)
- `af5059a` - fix #310: initialize formData with ALL keys
- `6a2b069` - fix #310: normalizeValue helper
- `972863f` - fix #300: StyledSelect undefined aria props
- `e6e381a` - fix #310: ensure all inputs always controlled
- `1362c3f` / `1718f2b` - Phase 3: Controller 404 fix
- `f04fbc7` - Phase 1&2 docs
- `d2df5b7` - Phase 2: HR Signup atomic
- `cb276d4` - Production migration rif=J314188305
- `77c1414` - Phase 1: Organization RIF
- `743d116` - fix #300: StyledSelect hook + early returns (FASE D1-D2)
- `4107406` - fix: PayrollSlice pending reducer arg.type check (FASE D3.1)
- `e7de632` - fix: PayrollPolicyTab bothResolved race condition gate (FASE D3.2)

---

## ⚠️ NOTAS DE MEMORIA
- *Regla:* **SOLO** usar `PayrollConceptsTab.jsx` como patrón UI
- *Regla:* Acento **blue** (#003DA5) para Nómina
- *Regla:* Fix aplicado: native select styled (Radix Select v2 incompatible SSR condicional)
- *Regla:* RIF en BD = Solo `[A-Z0-9]` (ej: `J314188305`) - NUNCA guiones
- *Regla:* Transacción atómica Org + PayrollCompany o rollback total
- *Regla:* Controller NUNCA crea datos inválidos - 404 explícito
- *Regla:* Signup valida RIF - Requerido para HR/Administradora
- *Regla:* Org producción `6a0cac2d63fe9b9c98e59a54` → `J314188305` EN ATLAS
- *Branch:* 040-payroll-policy-tab-ui (commits `743d116`, `4107406`, `e7de632`)
- *PR:* #56 hacia 037-payroll-venezuelan-module (actualizado)
- *Modelo:* PayrollCompany 1:1 Organization (no User) - multi-HR comparten misma company
- *ERROR ORIGINAL:* React Error #300 en Vercel al navegar a pestaña Políticas
- **CAUSA RAÍZ RESUELTA:** StyledSelect hook condicional + early returns violando Rules of Hooks
- **RACE CONDITION RESUELTA:** `bothResolved` gate en renderState espera ambos thunks antes de renderizar