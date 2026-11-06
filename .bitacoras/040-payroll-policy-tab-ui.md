# 🛠️ TAREA: Payroll Policy Tab UI Implementation
**ID:** #040 | **Estado:** 🟡 EN CURSO | **Fecha:** 2026-11-05 (reabierta 2026-11-06)

---

## 🎯 OBJETIVO FINAL
> Implementar la UI completa de la pestaña "Políticas" en la página de Nómina (HR), reemplazando el texto "En desarrollo" por un formulario organizado por 5 secciones que permita visualizar y editar la configuración de nómina venezolana (LOTTT, IVSS, FAOV, INCES, ISLR, RPE, LPPSS, cestaticket, vacaciones, bono vacacional, utilidades, prestaciones sociales, horas extra).
> **Extendido:** Corregir bug crítico: lazy-creation de PayrollCompany con datos inválidos (rif/email vacíos) → integrar RIF en Organization + crear PayrollCompany válida en HR Signup (transacción atómica).
> **BUG ACTUAL:** React Error #300 en producción Vercel - "Element type is invalid"

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)
*Usa esto para "despertar" a la IA si el chat se cierra:*

- **Lo último que funcionó:** Builds locales OK, tests passing. Error #300 persiste en Vercel production.
- **Dónde se rompió/detuvo:** Error #300 en Vercel al navegar a pestaña Políticas. Build local OK.
- **Siguiente acción inmediata:** Iniciar Fase D1 - Análisis stack trace Error #300.

---

## 📝 CAMBIOS TÉCNICOS CLAVE (PLAN EXTENDIDO)
- [x] UI completa: 5 secciones, 49 campos, inline edit, validaciones, dark mode
- [x] Fix React Error #300 (native select styled) - **PERO ERROR PERSISTE EN VERCEL**
- [x] Build client: 0 errores | Build server: 127 tests passing
- [x] **EXTENSIÓN BUG FIX F1:** RIF en Organization.model.js (alphanumeric, sparse unique, sanitizeRif) + parentOrganizationID + organizationType
- [x] **EXTENSIÓN BUG FIX F1:** Migración producción: Org `6a0cac2d63fe9b9c98e59a54` → `rif=J314188305` (Atlas verificado)
- [x] **EXTENSIÓN BUG FIX F2:** HR Signup → Transacción atómica Organization + PayrollCompany (rif=org.rif, email=org.email)
- [x] **EXTENSIÓN BUG FIX F3:** Controller getCompanyConfig: eliminar lazy-creation → 404 COMPANY_NOT_CONFIGURED
- [x] **EXTENSIÓN BUG FIX F4:** UI PayrollPolicyTab: manejar 404 → estado "Configuración pendiente" + CTA setup
- [ ] **FASE D1-D4:** Debug React Error #300 en producción Vercel
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

## 🔴 FASE D: DEBUG REACT ERROR #300 EN PRODUCCIÓN VERCEL (EN CURSO)

### 🔍 ANÁLISIS PRELIMINAR DEL ERROR #300

**Error #300 = "Element type is invalid"**
- Ocurre cuando React recibe un tipo de elemento inválido (null, undefined, número, etc.) en lugar de un componente válido
- Stack trace apunta a `vendor-react-DNXgf9I9.js` → componente en `payroll-tabs-*`
- **Posibles causas en PayrollPolicyTab:**
  1. `StyledSelect` pasando props inválidos a `<select>` nativo (aria-describedby={undefined})
  2. Componente condicional que retorna `null`/`undefined` en lugar de JSX
  3. Import dinámico (`lazy`) fallando en Vercel
  4. Componente hijo importado que no existe o exporta mal
  5. `normalizeValue` o `INITIAL_FORM_DATA` causando tipo inválido

### 📋 PLAN DE DEBUG PASO A PASO (FASE D)

---

#### **FASE D1: Análisis Stack Trace y Aislamiento (STOP OBLIGATORIO 1)**
- [ ] D1.1: Obtener stack trace completo en Vercel (Source Maps habilitados)
- [ ] D1.2: Identificar componente exacto que lanza Error #300 (payroll-tabs-* chunk)
- [ ] D1.3: Verificar imports en PayrollPolicyTab.jsx (StyledSelect, normalizeValue, etc.)
- [ ] D1.4: Revisar HRPayrollPage.jsx - lazy loading de PayrollPolicyTab
- [ ] D1.5: Revisar PayrollTabsContainer.jsx - renderTabContent
- **STOP 1:** Commit con hallazgos + push. Esperar aprobación para continuar.

#### **FASE D2: Reproducción Local y Source Map Analysis (STOP OBLIGATORIO 2)**
- [ ] D2.1: Habilitar Source Maps en build de Vercel (vercel.json)
- [ ] D2.2: Build local con `npm run build` y analizar chunk `payroll-tabs-*`
- [ ] D2.3: Buscar componente que retorna tipo inválido en `payroll-tabs-*.js`
- [ ] D2.4: Test manual navegando a `/payroll/policy` en local
- [ ] D2.5: Verificar que `StyledSelect` no pasa props undefined a `<select>`
- **STOP 2:** Commit con fix candidato + push. Esperar aprobación.

#### **FASE D3: Fix y Validación en Producción (STOP OBLIGATORIO 3)**
- [ ] D3.1: Aplicar fix identificado (ej: StyledSelect props, lazy loading, etc.)
- [ ] D3.2: Build + deploy a Vercel preview
- [ ] D3.3: Test navegación a `/payroll/policy` en preview
- [ ] D3.4: Verificar navegación entre tabs (periods → policy → concepts → policy)
- **STOP 3:** Commit con fix validado + push. Esperar aprobación.

#### **FASE D4: Validación Final y Cierre (STOP OBLIGATORIO 4)**
- [ ] D4.1: Deploy a producción Vercel
- [ ] D4.2: Test completo flujo: login → nómina → pestaña políticas → navegar tabs
- [ ] D4.3: Verificar ausencia Error #300 en consola
- [ ] D4.4: Actualizar bitácora con resolución final
- [ ] D4.5: PR listo para merge a `037-payroll-venezuelan-module`
- **STOP 4:** Confirmación usuario "TAREA COMPLETADA".

---

## 📦 COMMITS EN PR #56 (Historial)
- `af5059a` - fix #310: initialize formData with ALL keys
- `6a2b069` - fix #310: normalizeValue helper
- `972863f` - fix #300: StyledSelect undefined aria props
- `e6e381a` - fix #310: ensure all inputs always controlled
- `1362c3f` / `1718f2b` - Phase 3: Controller 404 fix
- `f04fbc7` - Phase 1&2 docs
- `d2df5b7` - Phase 2: HR Signup atomic
- `cb276d4` - Production migration rif=J314188305
- `77c1414` - Phase 1: Organization RIF

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
- *Branch:* 040-payroll-policy-tab-ui (trabajo en rama actual)
- *PR:* #56 hacia 037-payroll-venezuelan-module (ya creado)
- *Modelo:* PayrollCompany 1:1 Organization (no User) - multi-HR comparten misma company
- *ERROR ACTUAL:* React Error #300 en Vercel al navegar a pestaña Políticas