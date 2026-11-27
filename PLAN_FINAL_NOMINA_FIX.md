# PLAN FINAL DE ARREGLO — MÓDULO DE NÓMINA VENEZOLANA
## Branch: `037-payroll-venezuelan-module` | Basado en REPORTE_SERVER_3.md + Estado Actual (actual.md)

> **FECHA:** 2026-11-03  
> **PRINCIPIO:** Tolerancia cero — Diagnóstico absoluto antes de cualquier fix  
> **REGLA SUPREMA (AGENTS.md §0.1):** PLAN FIRST — Este plan DEBE ser aprobado explícitamente ANTES de escribir código  
> **REGLA SUPREMA (AGENTS.md §0.2):** STOPS POR FASE — Cada fase termina con STOP, resumen, builds 0 errores, aprobación  
> **REGLA SUPREMA (AGENTS.md §0.3):** BUILDS OBLIGATORIOS — `npm run build` (client) + `npm run test` (server) = 0 errores ANTES de cada commit  
> **REGLA SUPREMA (AGENTS.md §0.7):** ROOT CAUSE ANALYSIS OBLIGATORIO — Mapeo cadena completa antes de cualquier fix  

---

## 🎯 ESTRATEGIA GLOBAL: PRIORIDAD ABSOLUTA AL MÓDULO DE NÓMINA

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  PRIORIDAD 1 (FASES 0-5): TODO LO REFERENTE AL MÓDULO DE NÓMINA                │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │  • Build blockers del módulo nómina (queue, journal, worker, models)       │  │
│  │  • Integración nómina ↔ base (controllers, services, routes, middleware)   │  │
│  │  • Vulnerabilidades RCE/Auth Bypass en nómina (evalFormula, CRON público)  │  │
│  │  • Lógica/placeholders core nómina (journal, PDF, tasas, timezone, queues) │  │
│  │  • Variables de entorno nómina (BCV, exchange rate, worker concurrency)    │  │
│  │  • Arquitectura nómina (circular deps, queue DRY, health check, lazy load) │  │
│  │  • Gaps Fase 7 BACKEND nómina (export bancario, emails, seeds, índices)    │  │
│  │  • Gaps Fase 7 FRONTEND nómina (ConfirmDialog, monolitos, code splitting)  │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                   │
│  PRIORIDAD 2 (FASE 6): LO DEMÁS — DEJAR DE ÚLTIMO (según instrucción explícita)  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │  • Cron jobs (Schedule.route.js, Report.controller.js CRON endpoints)      │  │
│  │  • Rename Emplyoee → Employee (15 funciones + imports)                     │  │
│  │  • Sendgrid (config, emails, API key exposure)                             │  │
│  │  • Workphoto (EXIF validation, Cloudinary upload)                          │  │
│  │  • Auth (middleware error exposure, CORS, token handling)                  │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 FASE 0 — CONGELAMIENTO, BASELINE Y MAPEO DE CADENA (Día 0) — **NO ESCRIBIR CÓDIGO**

### 0.1 Objetivo
Establecer baseline inmutable, mapear cadena completa de dependencias del módulo nómina, documentar estado actual.

### 0.2 Qué, Cómo, Dónde

| Paso | Qué | Cómo | Dónde (Archivo/Ruta) | Validación (Gate) |
|------|-----|------|----------------------|-------------------|
| 0.1 | Crear rama de trabajo desde `037-payroll-venezuelan-module` | `git checkout -b fix/payroll-foundation 037-payroll-venezuelan-module` | Terminal | Rama creada |
| 0.2 | Build baseline server | `cd server && npm run build 2>&1 | tee build-baseline.log` | `server/` | 4+ errores documentados |
| 0.3 | Test baseline server | `cd server && npm run test 2>&1 | tee test-baseline.log` | `server/` | Tests fallando documentados |
| 0.4 | Build baseline client | `cd client && npm run build 2>&1 | tee client-build-baseline.log` | `client/` | 0 errores (debe pasar) |
| 0.5 | **MAPEO CADENA COMPLETA NÓMINA** — Root Cause Analysis obligatorio | Documentar TODOS los nodos: Modelos → Servicios → Controladores → Rutas → Middleware → Queues → Worker → Health → Seeds → Frontend (Redux, Pages, Components) | `PLAN_FINAL_NOMINA_FIX.md` (sección anexo) | Diagrama de dependencias completo |
| 0.6 | Verificar grep crítico | `grep -r "Emplyoee" server/`, `grep -r "process\.REDIS_PORT" server/`, `grep -r "Function(" server/services/payroll/` | Terminal | 15+ Emplyoee, 1 REDIS_PORT, 2 Function() |
| 0.7 | Actualizar bitácora actual.md | Marcar Fase 0 completada, agregar mapeo de cadena | `.bitacoras/actual.md` | Checks actualizados |

### 0.3 Mapeo de Cadena Completa (Root Cause Analysis - AGENTS.md §0.7)

```
CADENA DE DEPENDENCIAS MÓDULO NÓMINA (Nuevo → Base)

┌──────────────────────────────────────────────────────────────────────────────────┐
│  MODELOS (25+ modelos payroll)                                                   │
│  ├─ PayrollPeriod.model.js ──► pre('deleteOne') dynamic imports (ARCH-001)      │
│  ├─ PayrollReceipt.model.js ──► índice único (employee, period) FALTANTE       │
│  ├─ PayrollReceiptLine.model.js ──► referenciado en pre delete                 │
│  ├─ PayrollPolicy.model.js ──► config central nómina                           │
│  ├─ PayrollConcept.model.js ──► 45+ conceptos con fórmulas                     │
│  ├─ PayrollNovelty.model.js ──► novedades (vacaciones, utilidades, etc.)       │
│  ├─ VacationPolicy/VacationBalance ──► cálculo vacaciones/bono                 │
│  ├─ SocialBenefitPolicy/SocialBenefitBalance ──► prestaciones                  │
│  ├─ SettlementPolicy/SettlementCalculation ──► liquidación                     │
│  ├─ ISLRRetentionTable ──► tablas SUNAT (SEED FALTANTE 7.2.1)                  │
│  ├─ AccountSubcategory ──► cuentas contables (SEED FALTANTE 7.2.2)             │
│  └─ EmployerCostConfig ──► costos patronales (IVSS, FAOV, INCES, RPE, LPPSS)   │
│                                                                                  │
│  SERVICIOS (15+ servicios en server/services/payroll/)                          │
│  ├─ formula-evaluator.js ──► acorn AST, safeEval (REEMPLAZA Function RCE)     │
│  ├─ formula-context.js ──► contexto variables fórmulas                         │
│  ├─ accumulator-engine.js ──► acumulación conceptos                            │
│  ├─ concept-rules.js ──► reglas de conceptos                                   │
│  ├─ payroll-engine.js ──► orquestador principal, generatePayrollJournalDraft  │
│  ├─ employer-costs.js ──► evalFormula RCE (SEC-001) → MIGRAR a safeEval       │
│  ├─ vacation-calculator.js ──► exchange_rate_snapshot HARDCODED (LOG-003)     │
│  ├─ settlement-calculator.js ──► liquidación                                   │
│  ├─ utilidades-calculator.js ──► utilidades                                    │
│  ├─ islr-calculator.js ──► ISLR (requiere ISLRRetentionTable seed)            │
│  ├─ journal-generator.js ──► PLACEHOLDER generatePayrollJournalDraft (INT-001)│
│  ├─ bank-export-service.js ──► NUEVO (export bancario 7.1.1)                  │
│  ├─ payslip-email-service.js ──► NUEVO (envío boletas 7.1.2)                  │
│  └─ index.js (barrel) ──► ARCH-005: sin lazy loading, carga todos los modelos │
│                                                                                  │
│  CONTROLADORES (8 controladores nómina)                                         │
│  ├─ PayrollPeriodController.js ──► approve() missing await (INT-002)          │
│  │   └─ pay() queue error handling silencioso (LOG-004, INC-007)               │
│  ├─ PayrollReceiptController.js ──► exportReceipt PDF 501 (INT-007, LOG-007)  │
│  ├─ PayrollConceptController.js ──► CRUD conceptos                             │
│  ├─ PayrollNoveltyController.js ──► novedades                                  │
│  ├─ VacationController.js ──► exchange_rate_snapshot=1 (LOG-003)              │
│  │   └─ TODO PayrollNovelty integration (INC-004)                              │
│  ├─ SocialBenefitsController.js ──► require decimal inline (P3-5)             │
│  ├─ UtilidadesController.js ──► TODO recibos nómina (INC-005)                 │
│  └─ Attendance/Schedule controllers ──► req.HRid undefined (LOG-001, LOG-002) │
│                                                                                  │
│  RUTAS (8 rutas + montaje en index.js)                                          │
│  ├─ payrollPeriod.routes.js ──► /api/v1/payroll/periods                        │
│  ├─ payrollReceipt.routes.js ──► /api/v1/payroll/receipts                      │
│  ├─ payrollConcept.routes.js ──► /api/v1/payroll/concepts                      │
│  ├─ payrollNovelty.routes.js ──► /api/v1/payroll/novelties                     │
│  ├─ vacation.routes.js ──► /api/v1/payroll/vacations                           │
│  ├─ socialBenefits.routes.js ──► /api/v1/payroll/social-benefits               │
│  ├─ utilidades.routes.js ──► /api/v1/payroll/utilidades                        │
│  └─ index.js ──► monta routers + health check importa payrollQueues (ARCH-003) │
│                                                                                  │
│  MIDDLEWARE → AUTH (Base existente - afecta nómina)                             │
│  ├─ Auth.middleware.js ──► VerifyHRToken, PermissionCheck('payroll:*')        │
│  ├─ 500 expone error stack (SEC-007) — DEFER A FASE 6                         │
│  └─ CORS origin function permite !origin (SEC-008) — DEFER A FASE 6           │
│                                                                                  │
│  COLAS + WORKER (Integración crítica)                                           │
│  ├─ queue.js ──► BR-001: process.REDIS_PORT typo                               │
│  │   └─ ARCH-002: viola DRY, redefine host/port/password × 4 queues           │
│  │   └─ INT-005: debería usar redisClient singleton de redis.js               │
│  ├─ redis.js ──► singleton Redis client (fuente de verdad)                    │
│  ├─ payrollWorker.js ──► INT-004: NO auto-start, proceso separado requerido  │
│  │   └─ ARCH-004: lifecycle fragmentado vs servidor principal                 │
│  └─ Bull queues: payroll-calculate, payroll-export, payroll-email, payroll-report │
│                                                                                  │
│  HEALTH CHECK                                                                    │
│  └─ index.js health check ──► ARCH-003: importa payrollQueues → inicia Bull   │
│                                                                                  │
│  SEEDS (Datos obligatorios para funcionamiento)                                 │
│  ├─ payroll.seed.js ──► orquestador                                            │
│  ├─ payroll-policy.seed.js, payroll-company.seed.js, receipt-types.seed.js    │
│  ├─ payroll-concepts.seed.js ──► 45+ conceptos Nominix                        │
│  ├─ holidays.seed.js ──► 2024-2025                                             │
│  ├─ ISLRRetentionTable.seed.js ──► FALTANTE 7.2.1 (requerido ISLRCalculator)  │
│  └─ account-subcategory.seed.js ──► FALTANTE 7.2.2 (requerido JournalGenerator)│
│                                                                                  │
│  FRONTEND (Client - Redux + Pages + Components)                                 │
│  ├─ payrollSlice.js ──► estado global nómina                                   │
│  ├─ payrollThunk.js ──► async thunks                                           │
│  ├─ HRPayrollPage.jsx ──► MONOLITO 26,202 líneas (7.4.1)                      │
│  ├─ PayrollPeriodFormModal.jsx ──► MONOLITO 21,970 líneas (7.4.2)             │
│  ├─ ConfirmDialog.jsx ──► FALTANTE 7.3.1 (comprometido Fase 4)                │
│  ├─ usePermissions.js ──► FALTANTE 7.3.3 (PermissionCheck frontend)           │
│  ├─ HRroutes.jsx ──► lazy loading payroll (7.4.3)                             │
│  └─ vite.config.js ──► manualChunks payroll (7.4.4)                           │
│                                                                                  │
│  VARIABLES DE ENTORNO (server/.env.example)                                     │
│  ├─ BCV_API_URL ──► FALTANTE (ENV-002)                                         │
│  ├─ BCV_API_KEY ──► FALTANTE (ENV-002)                                         │
│  ├─ EXCHANGE_RATE_PROVIDER ──► FALTANTE (ENV-002)                             │
│  ├─ PAYROLL_WORKER_CONCURRENCY ──► FALTANTE (ENV-002)                         │
│  ├─ SENDGRID_SENDER_EMAIL vs SENDGRID_FROM_EMAIL ──► ENV-001 huérfana         │
│  └─ FIREBASE_PRIVATE_KEY escaping ──► ENV-003                                 │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 FASE 1 — FUNDAMENTOS BLOQUEANTES BUILD NÓMINA (Día 1-2) — **PARALELIZABLE INTERNAMENTE**

> **GATE FASE 1:** `npm run build` (server) → **0 errores**, `npm run test` → **100% pass**

### 1.1 Qué, Cómo, Dónde — Tabla Detallada

| ID | Prioridad | Qué (Fix) | Cómo (Implementación) | Dónde (Archivo:Línea) | Validación |
|----|-----------|-----------|----------------------|----------------------|------------|
| **F1-01** | **P0** | Fix typo `process.REDIS_PORT` → `process.env.REDIS_PORT` | Cambiar `parseInt(process.REDIS_PORT) \|\| 6379` por `parseInt(process.env.REDIS_PORT) \|\| 6379` | `server/config/queue.js:53` | `npm run build` pasa queue.js |
| **F1-02** | **P0** | Fix typo `Emplyoee` → `Employee` en **TODOS** archivos (15+ funciones) | 1. Renombrar 15 funciones en controller<br>2. Actualizar exports<br>3. Actualizar imports en route | `server/controllers/EmplyoeeAuth.controller.js` (líneas 1-337)<br>`server/routes/EmployeeAuth.route.js:3,7` | `grep -r Emplyoee server/` = 0 |
| **F1-03** | **P0** | Eliminar ruta duplicada `/api/v1/contact` — consolidar | 1. Identificar cuál router mantiene (ContactSales vs ContactGeneral)<br>2. Eliminar mount duplicado en index.js<br>3. Fusionar lógica si necesario | `server/index.js:96-97`<br>`server/routes/ContactSales.route.js`<br>`server/routes/ContactGeneral.route.js` | `curl /api/v1/contact` responde 1 router |
| **F1-04** | **P0** | **ELIMINAR `evalFormula` RCE** — Reemplazar por `safeEval` importado de `formula-evaluator` | 1. Importar `safeEval` desde `../services/payroll/formula-evaluator`<br>2. Reemplazar `Function('"use strict"; return (' + expr + ')')()` por `safeEval(expr, context)`<br>3. Eliminar duplicado en Report.controller.js | `server/services/payroll/employer-costs.js:202-212`<br>`server/controllers/Report.controller.js:202-212` | `grep -r "Function(" server/services/payroll/` = 0 |
| **F1-05** | **P0** | Fix `req.HRid` undefined en token empleado — usar `req.EMPID` | 1. Verificar token payload estructura<br>2. Cambiar `req.HRid \|\| employeeID` por `req.EMPID \|\| employeeID`<br>3. Mismo fix en Schedule.controller | `server/controllers/Attendance.controller.js:247`<br>`server/controllers/Schedule.controller.js:401` | `Absence.createdBy` = ObjectId válido en tests |
| **F1-06** | **P1** | Unificar config Redis en queues — usar `redisClient` singleton | 1. Importar `redisClient` desde `./redis.js`<br>2. Eliminar `host`, `port`, `password` duplicados en cada queue<br>3. Usar `redisClient.options` o connection string | `server/config/queue.js:14-55`<br>`server/config/redis.js` | 1 fuente de verdad, 0 duplicaciones |
| **F1-07** | **P1** | Health check: NO inicializar Bull — solo check status | 1. Remover import `payrollQueues` de health check<br>2. Health check verifica `redisClient.status` y `mongoose.connection.readyState`<br>3. NO side effects | `server/index.js:125-155` | Health check < 100ms, no inicializa Bull |
| **F1-08** | **P1** | Añadir variables de entorno nómina a `.env.example` | Agregar: `BCV_API_URL`, `BCV_API_KEY`, `EXCHANGE_RATE_PROVIDER`, `PAYROLL_WORKER_CONCURRENCY`, `SENDGRID_SENDER_EMAIL` (unificar) | `server/.env.example` | Variables documentadas, sin huérfanas |
| **F1-09** | **P1** | Fix `exchange_rate_snapshot: 1` hardcodeado en VacationController | 1. Crear servicio `exchange-rate.service.js` que use BCV API o manual<br>2. Inyectar en VacationController<br>3. Fallback a tasa manual configurable | `server/controllers/VacationController.js:240`<br>Nuevo: `server/services/exchange-rate.service.js` | Tasa ≠ 1 en cálculos, tests pasan |

### 1.2 Root Cause Analysis por Item Crítico (AGENTS.md §0.7)

| Item | Cadena Afectada | Causa Raíz | Hipótesis Fix | Validación No Regresión |
|------|-----------------|------------|---------------|------------------------|
| **F1-01** | queue.js → Bull queues → payrollWorker → pay() jobs | Typo `process.REDIS_PORT` (falta `.env`) → `parseInt(undefined)` = `NaN` → Bull conecta a puerto inválido | Agregar `.env` → puerto correcto desde env | Queue conecta, jobs procesan, health check OK |
| **F1-02** | EmplyoeeAuth.controller → EmployeeAuth.route → index.js → server start | Typo sistemático `Emplyoee` vs `Employee` en 15 exports/imports | Renombrar TODO consistentemente a `Employee` | Build pasa, rutas auth employee funcionan |
| **F1-04** | employer-costs.js → payroll-engine → calculatePayrollPeriod → approve() | `Function()` constructor = RCE si formula controlada por usuario (payroll concept formula) | Migrar a `safeEval` (AST-based, sandboxed) de formula-evaluator | 0 `Function()` en código, fórmulas evalúan igual |
| **F1-06** | queue.js × 4 queues → redis.js singleton → staging/prod config drift | Cada queue redefine host/port/password → 12 duplicaciones → inconsistencias | Centralizar en `redisClient` singleton, queues usan connection string | 1 config, 0 drift, staging=prod |

---

## 📋 FASE 2 — INTEGRACIÓN CORE MÓDULO NÓMINA (Día 3-5)

> **GATE FASE 2:** `npm run build` → 0 errores, `npm run test` → all pass, **integración nómina funcional**

### 2.1 Qué, Cómo, Dónde

| ID | Prioridad | Qué (Fix) | Cómo (Implementación) | Dónde (Archivo:Línea) | Validación |
|----|-----------|-----------|----------------------|----------------------|------------|
| **F2-01** | **P0** | Implementar `generatePayrollJournalDraft` REAL (partida doble) | 1. Usar `AccountSubcategory` seeds (cuentas contables)<br>2. Generar líneas débito/crédito balanceadas<br>3. Validar `validateDoubleEntry` = true<br>4. Retornar `{ lines: [...], totalDebit, totalCredit, balanced: true }` | `server/services/payroll/journal-generator.js:613-617`<br>`server/services/payroll/payroll-engine.js:613-617` | Test: `validateDoubleEntry` = true, asiento balanceado ±0.01 VES |
| **F2-02** | **P0** | Fix `PayrollPeriodController.approve()` — await `generator.initialize()` | 1. Hacer `await generator.initialize()` ANTES de `generatePayrollJournalDraft`<br>2. Try/catch con error específico si falla inicialización<br>3. Transacción MongoDB para atomicidad | `server/controllers/PayrollPeriodController.js:180-193` | Test integración: approve → journal válido, sin race condition |
| **F2-03** | **P0** | Fix `PayrollPeriod.pre('deleteOne')` — eliminar dynamic imports | 1. Mover imports al top del archivo (static imports)<br>2. Usar `mongoose.model('PayrollReceipt')` si circular<br>3. Eliminar `import()` dinámico<br>4. Verificar orden de carga modelos en `payroll/index.js` | `server/models/payroll/PayrollPeriod.model.js:72-85` | Delete período no crashea, cascade delete funciona |
| **F2-04** | **P0** | Añadir índice único `(employee, period)` en PayrollReceipt | 1. Agregar `index({ employee: 1, period: 1 }, { unique: true })`<br>2. Verificar que no hay duplicados existentes<br>3. Migración si necesario | `server/models/payroll/PayrollReceipt.model.js` | Índice creado, duplicados rechazados |
| **F2-05** | **P0** | Añadir middleware cascade delete en PayrollPeriod | 1. `pre('deleteOne')` elimina `PayrollReceipt` y `PayrollReceiptLine` asociados<br>2. Usar `deleteMany` con `period: this._id`<br>3. Transacción para atomicidad | `server/models/payroll/PayrollPeriod.model.js` (nuevo middleware) | Delete período → receipts/lines eliminados, sin huérfanos |
| **F2-06** | **P1** | Integrar worker auto-start O documentar proceso separado | **OPCIÓN A (Recomendada):** Integrar en `index.js` lifecycle<br>1. Importar `startWorker` de `payrollWorker.js`<br>2. Llamar en `server.start()` después de DB connect<br>3. Graceful shutdown en `SIGTERM`<br>**OPCIÓN B:** Documentar `npm run worker` separado | `server/workers/payrollWorker.js`<br>`server/index.js` | `npm run worker` arranca y procesa jobs, health check worker OK |
| **F2-07** | **P1** | Fix `exportReceipt` PDF — implementar o quitar opción | 1. Si implementar: usar `pdfkit` o `puppeteer` para generar PDF<br>2. Si quitar: retornar 400 con mensaje claro "PDF no soportado, use CSV/Excel"<br>3. Actualizar documentación API | `server/controllers/PayrollReceiptController.js:208-211` | PDF válido descargable O 400 mensaje claro |
| **F2-08** | **P1** | Implementar `export_bank_files()` en PayrollPeriodController | 1. Nuevo service `bank-export-service.js`<br>2. Generar formato bancario venezolano (txt/csv según banco)<br>3. Incluir: cédula, nombre, monto, cuenta, tipo cuenta<br>4. Subir a Cloudinary/Storage, retornar URL | `server/controllers/PayrollPeriodController.js:239` (TODO)<br>Nuevo: `server/services/payroll/bank-export-service.js` | Archivo bancario válido, formato correcto por banco |
| **F2-09** | **P1** | Implementar `send_payslips_email()` con template | 1. Nuevo service `payslip-email-service.js`<br>2. Template SendGrid con boleta adjunta (PDF/HTML)<br>3. Batch envío con rate limiting<br>4. Queue job `payroll-email` para async | `server/controllers/PayrollPeriodController.js:239` (TODO)<br>Nuevo: `server/services/payroll/payslip-email-service.js`<br>`server/sendgrid/emails.js` | Emails enviados, boletas adjuntas, logs tracking |
| **F2-10** | **P1** | Configurar Bull/Redis queue para jobs async | 1. `npm install bull ioredis` (si no están)<br>2. Configurar queues en `queue.js` unificadas (F1-06)<br>3. Definir processors en `payrollWorker.js`<br>4. Concurrencia desde `PAYROLL_WORKER_CONCURRENCY` | `server/config/queue.js`<br>`server/workers/payrollWorker.js`<br>`server/package.json` | Jobs encolados, procesados, retry/failed handling |

### 2.2 Root Cause Analysis Items Críticos Fase 2

| Item | Cadena Afectada | Causa Raíz | Hipótesis Fix | Validación No Regresión |
|------|-----------------|------------|---------------|------------------------|
| **F2-01** | journal-generator → payroll-engine → approve() → contabilidad | Placeholder hardcoded `{ lines: [] }` — nunca se implementó partida doble | Implementar usando `AccountSubcategory` seeds, generar líneas según conceptos (haberes/deducciones) | Asiento balanceado, cuentas contables válidas, audit trail |
| **F2-03** | PayrollPeriod.model → PayrollReceipt → PayrollReceiptLine | Dynamic `import()` en middleware mongoose = riesgo circular, crash si modelos no cargados | Static imports al top + `mongoose.model()` fallback | Delete período limpio, sin crashes, cascade funciona |
| **F2-06** | payrollWorker → Bull queues → pay() → export/email | Worker creado pero NO integrado en lifecycle servidor | Integrar en `index.js` startup + graceful shutdown | Jobs procesan automáticamente, no proceso manual |

---

## 📋 FASE 3 — FUNCIONALIDADES CORE COMPLETAS NÓMINA (Día 6-9)

> **GATE FASE 3:** Flujos nómina/vacaciones/utilidades **100% operativos sin TODOs ni placeholders**

### 3.1 Qué, Cómo, Dónde

| ID | Prioridad | Qué (Fix) | Cómo (Implementación) | Dónde (Archivo:Línea) | Validación |
|----|-----------|-----------|----------------------|----------------------|------------|
| **F3-01** | **P0** | Completar Vacation ↔ PayrollNovelty (anticipo vacacional) | 1. En `VacationController.approve()` crear `PayrollNovelty` tipo `vacation_advance`<br>2. Vincular `novelty.vacation = vacation._id`<br>3. Monto = `vacation.amount * percentage`<br>4. Incluir en próximo período nómina | `server/controllers/VacationController.js:164,264` | Novedad creada al aprobar vacaciones, aparece en nómina |
| **F3-02** | **P0** | Completar Utilidades → Recibos de nómina | 1. En `UtilidadesController.pay()` crear `PayrollReceipt` por empleado<br>2. Concepto `utilidades` con monto calculado<br>3. Marcar período como `utilidades_paid: true` | `server/controllers/UtilidadesController.js:180` | Recibos creados al pagar utilidades, conciliación OK |
| **F3-03** | **P0** | Tasa de cambio real en vacaciones (BCV API o manual) | 1. Usar `exchange-rate.service.js` (F1-09)<br>2. En `VacationController` obtener tasa al momento de cálculo<br>3. Guardar `exchange_rate_snapshot` real en novelty/receipt | `server/controllers/VacationController.js:240`<br>`server/services/exchange-rate.service.js` | Tasa ≠ 1, snapshot guardado, histórico auditable |
| **F3-04** | **P1** | Zona horaria en CRON `register-absences` | 1. Obtener `organization.timezone` o `employee.timezone`<br>2. Usar `moment-timezone` o `luxon` para `yesterday` local<br>3. NO usar UTC hardcoded | `server/controllers/Schedule.controller.js:346-420` | Ausencias en fecha local correcta, tests multi-tz |
| **F3-05** | **P1** | Queue error handling: no silenciar fallos en `pay()` | 1. Remover try/catch silencioso en `addBankExportJob`/`addPayslipEmailJob`<br>2. Capturar error, loggear, notificar usuario (toast/email)<br>3. Retornar estado jobs en response | `server/controllers/PayrollPeriodController.js:243-256` | Usuario notificado si job falla, no "pagado" falso |
| **F3-06** | **P1** | Fix `HandleCheckOut` crea ausencias por tareas de **ayer** al hacer checkout **hoy** | 1. Lógica invertida: checkout hoy → revisar tareas de HOY, no ayer<br>2. Usar `startOfDay()` fecha actual<br>3. Crear ausencia si no hay check-in HOY | `server/controllers/Attendance.controller.js:221-252` | Ausencias en fecha correcta (hoy), no ayer |
| **F3-07** | **P1** | Seeds faltantes: `ISLRRetentionTable` + `AccountSubcategory` | 1. Crear `islr-retention-table.seed.js` con tablas SUNAT 2024-2025<br>2. Crear `account-subcategory.seed.js` con plan contable nómina<br>3. Integrar en `payroll.seed.js` orquestador<br>4. Verificar idempotencia (upsert) | `server/seeds/islr-retention-table.seed.js`<br>`server/seeds/account-subcategory.seed.js`<br>`server/seeds/payroll.seed.js` | Seeds ejecutan sin duplicados, datos correctos |
| **F3-08** | **P1** | PayrollEngine batch processing — paralelizar cálculo empleados | 1. Usar `Promise.allSettled` con chunks de 50 empleados<br>2. Configurable via `PAYROLL_BATCH_SIZE` env<br>3. Progress tracking via Redis/eventos<br>4. Evitar timeout orgs >500 empleados | `server/services/payroll/payroll-engine.js:calculatePayrollPeriod` | Org 1000 empleados < 60s, sin timeout, progress visible |

---

## 📋 FASE 4 — FRONTEND NÓMINA: CONFIRMDIALOG, MONOLITOS, CODE SPLITTING (Día 10-13)

> **GATE FASE 4:** Bundle payroll < 500KB gzip, 0 monolitos > 2000 líneas, ConfirmDialog funcional, PermissionCheck frontend

### 4.1 Qué, Cómo, Dónde

| ID | Prioridad | Qué (Fix) | Cómo (Implementación) | Dónde (Archivo:Línea) | Validación |
|----|-----------|-----------|----------------------|----------------------|------------|
| **F4-01** | **P0** | Crear `ConfirmDialog.jsx` reutilizable (Radix Dialog) | 1. Componente genérico: title, message, variant (danger/warning/info), onConfirm, onCancel<br>2. Accesible: focus trap, ESC close, ARIA labels<br>3. Design System v4: acento `blue` (#003DA5) para nómina<br>4. Export desde `components/common/ConfirmDialog.jsx` | `client/src/components/common/ConfirmDialog.jsx` (NUEVO) | Componente renderiza, accesible, themable |
| **F4-02** | **P0** | Integrar ConfirmDialog en HRPayrollPage (delete, void, approve, pay, close) | 1. Importar `ConfirmDialog` en `HRPayrollPage.jsx`<br>2. Reemplazar `window.confirm` por `ConfirmDialog`<br>3. Acciones críticas: delete período, void receipt, approve, pay, close | `client/src/pages/HumanResources/Dashboard Childs/Payroll/HRPayrollPage.jsx` | Dialogs aparecen, acciones confirman, UX consistente |
| **F4-03** | **P0** | Añadir PermissionCheck frontend (hook `usePermissions`) | 1. Crear `usePermissions.js` hook que lea `user.permissions` de Redux/auth<br>2. Retornar `can(permission)` boolean<br>3. Usar en `HRPayrollPage` para condicional render botones<br>4. Permisos: `payroll:read`, `payroll:write`, `payroll:approve`, `payroll:pay`, `payroll:delete` | `client/src/hooks/usePermissions.js` (NUEVO)<br>`client/src/pages/HumanResources/Dashboard Childs/Payroll/HRPayrollPage.jsx` | Botones ocultos/mostrados según rol, sin errores consola |
| **F4-04** | **P1** | Split `HRPayrollPage.jsx` → 8 sub-componentes + contenedor | 1. Crear carpeta `client/src/pages/HumanResources/Dashboard Childs/Payroll/components/`<br>2. Sub-componentes: `PeriodsTab`, `ReceiptsTab`, `ConceptsTab`, `PolicyTab`, `NoveltiesTab`, `VacationsTab`, `SocialBenefitsTab`, `UtilidadesTab`<br>3. Contenedor `HRPayrollPage` maneja estado compartido, tabs<br>4. Cada sub-componente < 2000 líneas | `client/src/pages/HumanResources/Dashboard Childs/Payroll/components/` (NUEVOS)<br>`client/src/pages/HumanResources/Dashboard Childs/Payroll/HRPayrollPage.jsx` (REFACTOR) | 8 archivos < 2000 líneas cada uno, funcionalidad idéntica |
| **F4-05** | **P1** | Split `PayrollPeriodFormModal.jsx` → Form + Validation + Preview | 1. `PayrollPeriodForm.jsx` — solo formulario<br>2. `PayrollPeriodValidation.js` — lógica validación (Zod/Yup)<br>3. `PayrollPeriodPreview.jsx` — vista previa cálculos<br>4. Modal contenedor orquesta los 3 | `client/src/components/payroll/PayrollPeriodForm.jsx` (NUEVO)<br>`client/src/components/payroll/PayrollPeriodValidation.js` (NUEVO)<br>`client/src/components/payroll/PayrollPeriodPreview.jsx` (NUEVO)<br>`client/src/components/payroll/PayrollPeriodFormModal.jsx` (REFACTOR) | 3 archivos separados, modal funcional, validación reutilizable |
| **F4-06** | **P1** | Implementar `React.lazy()` + `Suspense` en `HRroutes.jsx` para payroll | 1. `const HRPayrollPage = React.lazy(() => import('./Payroll/HRPayrollPage'))`<br>2. Wrap en `<Suspense fallback={<PayrollSkeleton />}`<br>3. Skeleton component para loading | `client/src/routes/HRroutes.jsx`<br>`client/src/components/common/PayrollSkeleton.jsx` (NUEVO) | Lazy load funciona, skeleton visible, sin errores |
| **F4-07** | **P1** | Configurar `manualChunks` en `vite.config.js` para payroll | 1. `manualChunks: { payroll: ['../pages/HumanResources/Dashboard Childs/Payroll'] }`<br>2. Verificar chunk `payroll-[hash].js` generado<br>3. Bundle principal reducido | `client/vite.config.js` | Chunk payroll separado, main bundle < 500KB gzip |
| **F4-08** | **P1** | Verificar bundle < 500KB gzip tras splitting | 1. `npm run build`<br>2. Analizar `dist/assets/*.js` tamaños<br>3. `gzip-size` en chunk payroll | `npm run build` | Bundle payroll < 500KB gzip, total < 2MB |

---

## 📋 FASE 5 — ARQUITECTURA, OBSERVABILIDAD, TESTS, DEPLOY INFRA NÓMINA (Día 14-17)

> **GATE FASE 5:** Coverage ≥ 80% nómina, 0 `console.log` prod, 0 TODOs nómina, 0 `eval/Function`, docs completas, deploy staging OK

### 5.1 Qué, Cómo, Dónde

| ID | Prioridad | Qué (Fix) | Cómo (Implementación) | Dónde (Archivo:Línea) | Validación |
|----|-----------|-----------|----------------------|----------------------|------------|
| **F5-01** | **P0** | Tests de integración E2E: auth → payroll → report → CRON | 1. Crear `server/tests/integration/payroll.e2e.test.js`<br>2. Flujos: create period → calculate → approve → pay → export → email<br>3. Multi-tenant isolation test<br>4. Permisos HR vs Employee<br>5. Cleanup BD entre tests | `server/tests/integration/payroll.e2e.test.js` (NUEVO) | 5 flujos críticos cubiertos, 100% pass |
| **F5-02** | **P1** | Lazy loading en `server/services/payroll/index.js` | 1. Cambiar barrel export a lazy getters<br>2. `get PayrollPeriod() { return require('./models/payroll/PayrollPeriod.model') }`<br>3. Import individual no carga todos los 25 modelos | `server/services/payroll/index.js` | Import modelo individual → memoria/tiempo reducido |
| **F5-03** | **P1** | Índices MongoDB faltantes en modelos nómina | 1. Revisar cada modelo `.index()` definidos<br>2. Agregar faltantes: `PayrollReceipt(employee,period)`, `PayrollNovelty(employee,period,type)`, `PayrollPeriod(organization,status)`<br>3. Script creación índices Atlas | Modelos respectivos<br>`server/scripts/create-indexes.js` (NUEVO) | `.explain()` usa índice, queries < 50ms |
| **F5-04** | **P1** | Eliminar `console.log` debug masivo en WorkPhoto.controller.js | 1. Reemplazar por `logger.debug()` (winston/pino)<br>2. Solo logs estructurados en prod<br>3. Nivel configurable via `LOG_LEVEL` | `server/controllers/WorkPhoto.controller.js:55-103` | 0 `console.log` en prod, logs estructurados |
| **F5-05** | **P1** | `require('decimal.js')` inline → import en SocialBenefitsController | 1. `import Decimal from 'decimal-js'` al top<br>2. Eliminar `require` inline en línea 345 | `server/controllers/SocialBenefitsController.js:345` | ESLint clean, import estándar |
| **F5-06** | **P1** | Documentación arquitectura nómina en `/docs/architecture/` | 1. `payroll-module.md`: diagramas Mermaid, contratos interfaz<br>2. `payroll-data-flow.md`: flujo datos empleado→recibo→contabilidad<br>3. `payroll-api-contracts.md`: OpenAPI spec endpoints<br>4. `payroll-deployment.md`: vars, queues, workers, seeds | `/docs/architecture/payroll-module.md` (NUEVO)<br>`/docs/architecture/payroll-data-flow.md` (NUEVO)<br>`/docs/architecture/payroll-api-contracts.md` (NUEVO)<br>`/docs/architecture/payroll-deployment.md` (NUEVO) | Docs completas, diagramas renderizables |
| **F5-07** | **P0** | Variables Firebase producción en Vercel/Render | 1. Documentar `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`<br>2. Configurar en dashboards Vercel (client) + Render (server)<br>3. Verificar push notifications funcionan | `.env.production`<br>Dashboards Vercel/Render | Push notifications operativas en staging |
| **F5-08** | **P0** | CORS custom domains + Vercel | 1. Actualizar regex `allowedOrigins` para incluir `app.condominiosvenezuela.com`<br>2. Mantener `/.vercel.app$/` para preview deployments<br>3. Array de dominios permitidos desde env | `server/index.js:48-52` | Dominios custom + Vercel funcionan, sin errores CORS |
| **F5-09** | **P0** | Health check extendido: DB + Queue + Redis | 1. `/api/health` verifica: `mongoose.readyState`, `redisClient.status`, `bull queues status`<br>2. Retornar `{ status, checks: { db, redis, queues } }`<br>3. Timeout 5s, no side effects | `server/index.js` `/api/health` | Health check completo, < 500ms, sin iniciar Bull |
| **F5-10** | **P0** | Verificar indexes creation en MongoDB Atlas (script) | 1. Script `create-indexes.js` ejecuta `createIndexes()` todos los modelos nómina<br>2. Ejecutar en deploy pipeline (Render build hook)<br>3. Log índice creado/ya existe | `server/scripts/create-indexes.js` | Índices creados en Atlas, queries optimizadas |
| **F5-11** | **P0** | Test deploy staging completo (Vercel + Render) | 1. Push a rama → auto-deploy staging<br>2. Smoke tests: auth, payroll calculate, approve, pay, export, email<br>3. Verificar logs, métricas, alertas | Staging environment | Deploy staging verde, smoke tests pasan |

---

## 📋 FASE 6 — VALIDACIÓN FINAL Y PR (Día 18)

> **GATE FASE 6:** TODO VERDE → PR hacia `dev` (NUNCA a `main`)

### 6.1 Secuencia Final Obligatoria (AGENTS.md §0.5)

| Paso | Acción | Validación Automatizada |
|------|--------|------------------------|
| 6.1 | `npm run build` en `server/` → **0 errores** | ✅ CI gate |
| 6.2 | `npm run test` en `server/` → **todas las suites pasan** | ✅ CI gate |
| 6.3 | `npm run build` en `client/` → **0 errores**, bundle < 500KB gzip payroll | ✅ CI gate |
| 6.4 | Tests de integración E2E (5 flujos críticos nómina) | ✅ CI gate |
| 6.5 | Security scan: `npm audit`, Snyk, OWASP ZAP → **0 críticos/altos** | ✅ CI gate |
| 6.6 | Load test: health, auth, payroll calculate, report → **p95 < 200ms** | ✅ CI gate |
| 6.7 | Deploy a **staging** — smoke tests completos | ✅ Manual QA |
| 6.8 | **Esperar confirmación explícita usuario: "TAREA COMPLETADA"** | ⏳ Usuario |
| 6.9 | Actualizar bitácoras (`index.md` + `actual.md` + `037-payroll-venezuelan-module.md`) | ✅ Documentación |
| 6.10 | Auto-mantenimiento post-flight (`.agent/rules/global-context/self-maintenance.md`) | ✅ Limpieza |
| 6.11 | **Crear PR hacia `dev`** (NUNCA a `main`) | ✅ Git workflow |

---

## 📋 FASE 7 — LO DEMÁS (DEJAR DE ÚLTIMO SEGÚN INSTRUCCIÓN EXPLÍCITA)

> **ESTOS ITEMS SE ABORDAN SOLO DESPUÉS DE QUE FASES 0-6 ESTÉN 100% COMPLETAS Y APROBADAS**

### 7.1 Qué, Cómo, Dónde — Items Diferidos

| Item | Qué | Por Qué Se Difería | Cómo (Resumen) | Dónde |
|------|-----|-------------------|----------------|-------|
| **Cron Jobs** | Endpoints CRON públicos (`/cron/close-expired`, `/cron/register-absences`), `HandleCronCloseAllWeeks` sin auth | No son core nómina; son schedulers base que afectan nómina pero se arreglan separadamente | 1. Header secret validation `x-cron-secret`<br>2. Middleware `verifyCronSecret`<br>3. `HandleCronCloseAllWeeks` → auth + multi-tenant filter by org | `server/routes/Schedule.route.js:34-35`<br>`server/controllers/Report.controller.js:598-628`<br>`server/middlewares/verifyCronSecret.js` (NUEVO) |
| **Rename Emplyoee → Employee** | 15 funciones typo en `EmplyoeeAuth.controller.js` + imports en `EmployeeAuth.route.js` | **YA ARREGLADO EN FASE 1 (F1-02)** — incluido aquí por completitud pero YA HECHO | Ver F1-02 | `server/controllers/EmplyoeeAuth.controller.js`<br>`server/routes/EmployeeAuth.route.js` |
| **Sendgrid** | Config, emails, API key exposure en logs, sender email unverified | Infra email, no core nómina; se arregla tras nómina estable | 1. Remover `console.log` API key<br>2. Unificar `SENDGRID_SENDER_EMAIL`<br>3. Verificar dominio en SendGrid prod<br>4. Templates boletas nómina (F2-09) | `server/sendgrid/sendgrid.config.js:6-8`<br>`server/sendgrid/emails.js`<br>`server/.env.example` |
| **Workphoto** | EXIF validation rechaza fotos válidas (WhatsApp, screenshots), Cloudinary upload | Feature asistencia, no nómina; UX fix separado | 1. EXIF opcional, no bloqueante<br>2. Fallback a timestamp archivo<br>3. Validar MIME type, no EXIF | `server/controllers/WorkPhoto.controller.js:141-147`<br>`server/services/cloudinary.service.js` |
| **Auth** | Middleware 500 expone stack, CORS `!origin` permite sin origin, token handling | Seguridad transversal, se hardeniza tras nómina funcional | 1. 500 response genérico `{ error: 'Internal server error' }`<br>2. CORS: array dominios permitidos desde env<br>3. Token refresh, rotation, blacklist | `server/middlewares/Auth.middleware.js:28,62`<br>`server/index.js:41-73`<br>`server/services/token.service.js` |

---

## 🛡️ MATRIZ DE RIESGO RESIDUAL POST-FIX (Específico Nómina)

| Componente | Riesgo Residual | Probabilidad | Impacto | Mitigación Post-Deploy |
|------------|-----------------|--------------|---------|------------------------|
| **Payroll Engine** | Fórmulas complejas sin tests regresión numérica | Media | Crítico | Property-based tests con `fast-check` (10k iteraciones) |
| **Journal Generator** | Partida doble desbalanceada por redondeo | Baja | Crítico | Tolerancia 0.01 VES + alerta Slack si > 0.01 |
| **FCM Push** | Throttling en orgs > 500 HR | Alta | Alto | Exponential backoff + dead letter queue en Bull |
| **BCV API** | Caída / datos desactualizados tasa cambio | Media | Alto | Fallback a tasa manual + alerta + cache 24h |
| **Worker Process** | Crash sin restart automático | Media | Alto | PM2 / systemd + health check endpoint `/api/worker/health` |
| **Cloudinary** | Límites API en subida masiva boletas | Media | Medio | Rate limiter local + retry con backoff |
| **Multi-tenant** | Aislamiento datos en queries sin `organizationID` | Media | Crítico | Middleware global inyecta `req.ORGID` obligatorio |

---

## ✅ CRITERIOS DE ACEPTACIÓN GLOBALES (Definition of Done)

### Por Fase (Gate Obligatorio)
- [ ] **Fase 0:** Baseline documentado, mapeo cadena completo, bitácora actualizada
- [ ] **Fase 1:** `npm run build` (server) = 0 errores, `npm run test` = 100% pass
- [ ] **Fase 2:** Integración nómina funcional: approve → journal válido, worker procesa, export/email OK
- [ ] **Fase 3:** 0 TODOs en controladores/servicios nómina, flujos vacaciones/utilidades completos
- [ ] **Fase 4:** Bundle payroll < 500KB gzip, 0 monolitos > 2000 líneas, ConfirmDialog + PermissionCheck frontend
- [ ] **Fase 5:** Coverage ≥ 80% nómina, docs arquitectura completas, deploy staging verde
- [ ] **Fase 6:** Todo verde, confirmación usuario, bitácoras actualizadas, PR hacia `dev`

### No Negociables (Reglas AGENTS.md)
- [ ] **NUNCA** commit sin `npm run build` (client) 0 errores + `npm run test` (server) all pass
- [ ] **NUNCA** avance a siguiente fase sin STOP + aprobación explícita usuario
- [ ] **NUNCA** PR directo a `main` — SIEMPRE `rama` → `dev`
- [ ] **NUNCA** código sin Root Cause Analysis (mapeo cadena + hipótesis fundamentada)
- [ ] **NUNCA** fix iterativo sin mapear cadena completa primero

---

## 📝 ANEXO: COMANDOS DE VERIFICACIÓN RÁPIDA

```bash
# Build & Test Server
cd server && npm run build && npm run test

# Build Client
cd client && npm run build

# Grep críticos (deben ser 0 tras Fase 1)
grep -r "Emplyoee" server/
grep -r "process\.REDIS_PORT" server/
grep -r "Function(" server/services/payroll/
grep -r "console\.log" server/controllers/ | grep -v test
grep -r "TODO" server/services/payroll/ server/controllers/*Payroll* server/controllers/*Vacation* server/controllers/*Utilidades*

# Verificar bundle payroll
cd client && npm run build && gzip-size dist/assets/payroll-*.js

# Health check
curl -s http://localhost:3000/api/health | jq .

# Worker health
curl -s http://localhost:3000/api/worker/health | jq .
```

---

## 📌 NOTAS FINALES

1. **Este plan es inmutable una vez aprobado.** Cambios requieren nuevo plan + aprobación.
2. **Cada fase = 1 commit mínimo** (puede ser múltiples commits atómicos dentro de la fase).
3. **Bitácora viva:** Actualizar `.bitacoras/actual.md` tras cada hito (checks `[x]`, `## 🚦 PUNTO DE CONTROL`).
4. **PR existente:** Se mantiene el PR hacia `dev` ya creado (no se borra, no se crea nuevo).
5. **Rama de trabajo:** **TRABAJO DIRECTO EN `037-payroll-venezuelan-module`** (sin crear rama nueva, por instrucción explícita del usuario).
6. **No se crea PR nuevo** — el PR hacia `dev` ya existe y se mantiene.

---

**PLAN CREADO POR:** CTO — Condominios Venezuela  
**FECHA:** 2026-11-03  
**ESTADO:** ⏳ PENDIENTE APROBACIÓN EXPLÍCITA DEL USUARIO  
**PRÓXIMO PASO:** Aprobación → Inicio Fase 0