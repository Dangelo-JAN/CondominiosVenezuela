# 🛠️ TAREA: Módulo Nómina Venezolana Completa
**ID:** #037 | **Estado:** 🟡 EN CURSO | **Fecha:** 2026-10-21 (reabierta 2026-10-22)

---

## 🎯 OBJETIVO FINAL
> Implementar motor de nómina completo compatible con legislación venezolana (LOTTT, IVSS, FAOV, INCES, ISLR, RPE, LPPSS, cestaticket, vacaciones, bono vacacional, utilidades, prestaciones sociales, horas extra) integrado en la arquitectura MERN existente.
> **Objetivo extendido:** Llevar el módulo a **PRODUCCIÓN REAL** (no solo build local) resolviendo gaps críticos de deploy, infraestructura y deuda técnica.

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)
*Usa esto para "despertar" a la IA si el chat se cierra:*

- **Lo último que funcionó:** Fase 6 completada - Tests unitarios implementados para todo el motor de cálculo (FormulaEvaluator, AccumulatorEngine, VacationCalculator, ISLRCalculator, UtilidadesCalculator, SettlementCalculator). 127 tests passing, 3 skipped. Client build 0 errores. Commit `3347feb` pusheado. PR hacia dev creado.
- **Dónde se rompió/detuvo:** **AUDITORÍA EXHAUSTIVA (2026-10-22) REVELÓ GAPS CRÍTICOS PARA PRODUCCIÓN** — el módulo compila y testea local pero NO está listo para deploy real.
- **Siguiente acción inmediata:** Ejecutar **Fase 7: Producción - Gaps Críticos** (ver plan abajo). PR hacia dev YA EXISTE y se mantiene (no se borra, no se crea nuevo).

---

## 📝 CAMBIOS TÉCNICOS CLAVE (Estado real verificado 2026-10-22)

### ✅ COMPLETADO Y VERIFICADO (Fases 1-6)
- [x] **Fase 1**: Modelos Mongoose (22 modelos payroll + 4 accounting + extensiones Employee/Organization) - **30 archivos, completos**
- [x] **Fase 2**: Motor de cálculo (11 servicios: formula-evaluator, formula-context, accumulator-engine, concept-rules, payroll-engine, employer-costs, vacation-calculator, settlement-calculator, utilidades-calculator, islr-calculator, journal-generator) - **~135K líneas, completos**
- [x] **Fase 3**: Controladores y Rutas (8 controladores, 8 rutas con middleware VerifyHRToken + PermissionCheck) - **Completos**
- [x] **Fase 4**: Frontend Redux + Páginas HR (PayrollSlice, PayrollThunk, APIsEndpoints, HRPayrollPage, PayrollPeriodFormModal) - **Completos** ⚠️ **FALTA ConfirmDialog**
- [x] **Fase 5**: Seed inicial (PayrollPolicy, PayrollCompany, ReceiptTypes, 45+ PayrollConcepts con fórmulas Nominix, Holidays 2024-2025, script npm run seed:payroll) - **Completos** ⚠️ **FALTA ISLR tables + AccountSubcategory seeds**
- [x] **Fase 6**: Tests unitarios (6 archivos: formula-evaluator, accumulator-engine, vacation-calculator, islr-calculator, utilidades-calculator, settlement-calculator) - **127 passing, 3 skipped**

### ❌ GAPS CRÍTICOS IDENTIFICADOS EN AUDITORÍA (Nueva Fase 7)

#### 7.1 GAPS DE INTEGRACIÓN BACKEND-FRONTEND (Críticos para producción)
- [ ] **ConfirmDialog** — Mencionado en bitácora Fase 4 como entregable. **NO EXISTE** en `src/components/payroll/` ni `src/components/common/`
- [ ] **Exportación bancaria** — TODO en `PayrollPeriodController.pay()` línea 239: `// TODO: Lanzar export_bank_files y send_payslips_email (Celery tasks)`
- [ ] **Envío de boletas por email** — Mismo TODO, no implementado
- [ ] **Celery/Queue workers** — Referenciado en TODO, no hay workers ni configuración de cola

#### 7.2 GAPS DE MODELOS / DATOS
- [ ] **Índice único compuesto** en `PayrollReceipt`: `(employee, period)` para evitar duplicados — **PENDIENTE VERIFICAR/IMPLEMENTAR**
- [ ] **Cascading deletes** — No hay middleware `pre('deleteOne')` para limpiar receipts/lines al borrar período
- [ ] **Seed ISLRRetentionTable** — Tablas SUNAT anuales requeridas por `ISLRCalculator`, **no existe seed**
- [ ] **Seed AccountSubcategory** — Cuentas contables para `JournalGenerator.generatePayrollJournalDraft()`, **no existe seed**

#### 7.3 GAPS DE SERVICIOS / LÓGICA DE NEGOCIO
- [ ] **PayrollEngine batch processing** — `calculatePayrollPeriod()` itera empleados secuencialmente, **sin batch/parallel processing**, riesgo timeout en orgs grandes (>500 empleados)
- [ ] **Verificar fix VacationCalculator** — Bitácora línea 27: `baseDays + additionalYears` aplicado, **confirmar que está en código actual**
- [ ] **JournalGenerator validación cuentas** — Requiere `AccountSubcategory` existentes, sin seed falla en approve

#### 7.4 GAPS DE FRONTEND (Deuda técnica severa + funcional)
- [ ] **ConfirmDialog componente** — **FALTA COMPLETO** (comprometido en bitácora)
- [ ] **HRPayrollPage.jsx refactor** — **26,202 líneas monolito** → split en sub-componentes por tab (Periods, Receipts, Concepts, Policy, Novelties, Vacations, SocialBenefits, Utilidades)
- [ ] **PayrollPeriodFormModal.jsx refactor** — **21,970 líneas monolito** → separar lógica de negocio de UI
- [ ] **Code splitting / Lazy loading** — Bundle `index-BCSCtGMN.js` = **1.86 MB (513 KB gzip)** → `React.lazy()` + `Suspense` en rutas payroll
- [ ] **PermissionCheck frontend** — Solo backend tiene permisos, UI no valida roles antes de renderizar acciones

#### 7.5 GAPS DE DEPLOY / INFRAESTRUCTURA (Por qué "deploys están rotos")
- [ ] **Variables Firebase producción** — `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID` **FALTANTES** en Vercel/Render → Push notifications rotas
- [ ] **CORS custom domains** — `allowedOrigins` en `server/index.js` solo regex `/.vercel.app$/` → **Falla en dominios propios** (ej. `app.condominiosvenezuela.com`)
- [ ] **Seed idempotencia garantizada** — Verificar `payroll.seed.js` usa `upsert` correctamente para no duplicar en re-deploy
- [ ] **MongoDB Atlas indexes** — Verificar que índices se crean en deploy (no solo local)
- [ ] **Health check completo** — `/api/health` existe pero **no verifica DB connection ni queues**

---

## 📋 PLAN FASE 7: PRODUCCIÓN - GAPS CRÍTICOS

### Sub-fase 7.1: Completar Funcionalidades Faltantes (Backend)
| # | Acción | Archivo(s) | Estimado |
|---|--------|------------|----------|
| 7.1.1 | Implementar `export_bank_files()` en PayrollPeriodController | `PayrollPeriodController.js`, nuevo service | 4h |
| 7.1.2 | Implementar `send_payslips_email()` con template | `PayrollPeriodController.js`, `sendgrid/emailtemplates.js` | 3h |
| 7.1.3 | Configurar Bull/Redis queue para jobs async | `server/config/queue.js`, `package.json` | 3h |
| 7.1.4 | Crear worker procesador queue | `server/workers/payrollWorker.js` | 3h |
| 7.1.5 | Añadir índice único `(employee, period)` en PayrollReceipt | `PayrollReceipt.model.js` | 0.5h |
| 7.1.6 | Añadir middleware cascade delete en PayrollPeriod | `PayrollPeriod.model.js` | 1h |

### Sub-fase 7.2: Seeds Faltantes (Datos)
| # | Acción | Archivo(s) | Estimado |
|---|--------|------------|----------|
| 7.2.1 | Crear `islr-retention-table.seed.js` con tablas SUNAT 2024-2025 | `server/seeds/islr-retention-table.seed.js` | 2h |
| 7.2.2 | Crear `account-subcategory.seed.js` con cuentas contables nómina | `server/seeds/account-subcategory.seed.js` | 2h |
| 7.2.3 | Integrar seeds nuevos en `payroll.seed.js` orquestador | `payroll.seed.js` | 0.5h |
| 7.2.4 | Verificar idempotencia (upsert) en todos los seeds | Todos los `*.seed.js` | 1h |

### Sub-fase 7.3: ConfirmDialog + UI Crítica (Frontend)
| # | Acción | Archivo(s) | Estimado |
|---|--------|------------|----------|
| 7.3.1 | Crear `ConfirmDialog.jsx` reutilizable (Radix Dialog) | `src/components/common/ConfirmDialog.jsx` | 2h |
| 7.3.2 | Integrar ConfirmDialog en HRPayrollPage (delete, void, approve, pay, close) | `HRPayrollPage.jsx` | 2h |
| 7.3.3 | Añadir PermissionCheck frontend (hook `usePermissions`) | `src/hooks/usePermissions.js`, `HRPayrollPage.jsx` | 3h |

### Sub-fase 7.4: Refactor Monolitos + Code Splitting (Frontend)
| # | Acción | Archivo(s) | Estimado |
|---|--------|------------|----------|
| 7.4.1 | Split `HRPayrollPage.jsx` → 8 sub-componentes (uno por tab) + contenedor | `src/pages/HumanResources/Dashboard Childs/Payroll/` | 8h |
| 7.4.2 | Split `PayrollPeriodFormModal.jsx` → Form + Validation + Preview separados | `src/components/payroll/` | 6h |
| 7.4.3 | Implementar `React.lazy()` + `Suspense` en `HRroutes.jsx` para payroll | `HRroutes.jsx`, `HRPayrollPage.jsx` | 2h |
| 7.4.4 | Configurar `manualChunks` en `vite.config.js` para payroll | `vite.config.js` | 1h |
| 7.4.5 | Verificar bundle < 500KB gzip tras splitting | `npm run build` | 1h |

### Sub-fase 7.5: Deploy / Infraestructura (Producción Real)
| # | Acción | Archivo(s) | Estimado |
|---|--------|------------|----------|
| 7.5.1 | Documentar y configurar vars Firebase en Vercel/Render | `.env.production`, dashboard Vercel/Render | 1h |
| 7.5.2 | Actualizar CORS regex para dominios custom + Vercel | `server/index.js` línea 48-52 | 0.5h |
| 7.5.3 | Health check extendido: DB + Queue + Redis | `server/index.js` `/api/health` | 1h |
| 7.5.4 | Verificar indexes creation en MongoDB Atlas (script) | `server/scripts/create-indexes.js` | 1h |
| 7.5.5 | Test deploy staging completo (Vercel + Render) | — | 2h |

---

## ⚠️ NOTAS DE MEMORIA
- *Rama git:* `037-payroll-venezuelan-module` (PR hacia dev YA EXISTE, no se toca)
- *Referencia:* Fórmulas y lógica en `/home/dangelojan/BSA/nominix/` (FORMULAS_NOMINIX.md, FUNCIONES_LOGICA_NEGOCIO_NOMINIX.md, LOGICA_NOMINIX.md)
- *Arquitectura:* Replicar patrones existentes (Employee.model.js, Salary.controller.js, Report.controller.js)
- *Design System:* Acento `blue` (#003DA5) para sección Nóminas (ver design-system/index.md §21)
- *Separación MERN:* client/ y server/ dominios separados, Fullstack Integrity obligatorio
- **Regla:** NO SE CREA NUEVO PR, NO SE BORRA PR EXISTENTE. Se trabaja sobre la misma rama y PR.

---

## 📊 PROGRESO FASE 7 (Actualización en tiempo real)

### 7.1 Backend Funcionalidades
- [x] 7.1.1 Export bancario
- [x] 7.1.2 Email boletas
- [x] 7.1.3 Queue config
- [x] 7.1.4 Worker
- [x] 7.1.5 Índice único
- [x] 7.1.6 Cascade delete

### 7.2 Seeds
- [x] 7.2.1 ISLR tables seed
- [x] 7.2.2 AccountSubcategory seed
- [x] 7.2.3 Integración orquestador
- [x] 7.2.4 Idempotencia verificada

### 7.3 UI Crítica
- [x] 7.3.1 ConfirmDialog.jsx (existe, reutilizable)
- [x] 7.3.2 ConfirmDialog integrado en HRPayrollPage (delete, approve, pay, close)
- [x] 7.3.3 PermissionCheck frontend (hook `usePermissions` + `useHRAuth.can()` integrado en botones)

### 7.4 Refactor + Code Splitting
- [x] 7.4.1 Split HRPayrollPage (8 tabs) → PayrollTabsContainer + 8 lazy-loaded tabs
- [x] 7.4.2 Split PayrollPeriodFormModal → FormFields + useFormState + useFormValidation hooks
- [x] 7.4.3 Lazy loading rutas (HRroutes.jsx: lazy() + Suspense)
- [x] 7.4.4 manualChunks vite (vite.config.js: payroll-periods, payroll-tabs, vendor chunks)
- [x] 7.4.5 Bundle < 500KB verificado (main: 107KB gzip, max chunk: 118KB gzip)

### 7.5 Deploy/Infra
- [x] 7.5.1 Firebase vars prod (documentado en .env.example client/server)
- [x] 7.5.2 CORS custom domains (server/index.js: CORS_ORIGIN_REGEX env)
- [x] 7.5.3 Health check extendido (DB + Redis + Queues + Firebase)
- [x] 7.5.4 Indexes Atlas script (server/scripts/create-indexes.mjs)
- [ ] 7.5.5 Deploy staging test

### 7.6 Hotfixes Críticos (2026-10-23)
- [x] **Fix hire_date required → false** en Employee.model.js (permite login empleados existentes sin hire_date)
- [x] **Fix login controller** — usar findByIdAndUpdate con runValidators: false (evita validación completa al actualizar lastlogin)
- [x] Validación: hire_date sigue siendo crítico para nómina (vacaciones, prestaciones, utilidades) — fuente de verdad: LaborContract.hire_date

---

**Última actualización:** 2026-10-23 — Hotfixes aplicados para login empleado en producción. Fase 7 continúa.