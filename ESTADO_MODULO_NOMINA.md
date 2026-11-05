# ESTADO COMPLETO DEL MÓDULO DE NÓMINA VENEZOLANA
## Branch: `037-payroll-venezuelan-module` | Commit: `76d9fcf` | Fecha: 2026-11-03

> **Autor:** CTO - Condominios Venezuela  
> **Propósito:** Documentación técnica exhaustiva del estado actual del módulo de nómina para auditoría, handoff y continuidad de desarrollo.

---

## 📋 RESUMEN EJECUTIVO

| Métrica | Valor |
|---------|-------|
| **Estado General** | ✅ Funcional - Build 0 errores, Tests 127 passing |
| **Arquitectura** | MERN (MongoDB, Express, React, Node.js) |
| **Legislación** | LOTTT, IVSS, FAOV, INCES, ISLR, RPE, LPPSS, Cestaticket, Vacaciones, Bono Vacacional, Utilidades, Prestaciones Sociales, Horas Extra |
| **Cobertura Funcional** | ~95% core nómina implementado |
| **Deuda Técnica** | Baja (build blockers resueltos, RCE eliminado, 0 TODOs core) |
| **Próximos Pasos** | Deploy staging, Tests E2E, Coverage ≥80%, Vars Firebase |

---

## 🏗️ ARQUITECTURA DEL MÓDULO

### Diagrama de Componentes

```mermaid
graph TB
    subgraph Frontend["Frontend (React + Vite + Redux)"]
        HRPayrollPage["HRPayrollPage.jsx\nTabs: Períodos, Recibos, Conceptos, Política, Novedades, Vacaciones, Prestaciones, Utilidades"]
        PayrollPeriodFormModal["PayrollPeriodFormModal.jsx\nCrear/Editar período + cálculo preview"]
        EmployeePayrollPage["EmployeePayrollPage.jsx\nVista empleado: mis recibos, vacaciones, utilidades"]
        ReduxStore["Redux Store\npayrollSlice + payrollThunk"]
    end

    subgraph Backend["Backend (Node.js + Express + Mongoose)"]
        Auth["Auth Middleware\nVerifyHRToken + VerifyEmployeeToken\nPermissionCheck('payroll:*')"]
        
        subgraph Controllers["Controladores (8)"]
            PPController["PayrollPeriodController\nCRUD + calculate + approve + pay + close"]
            PRController["PayrollReceiptController\nCRUD + export (json/csv) + detail"]
            PCController["PayrollConceptController\nCRUD + validación fórmula"]
            PNController["PayrollNoveltyController\nCRUD + apply"]
            VController["VacationController\nCRUD + payVacation → Recibo + Novedad"]
            SBController["SocialBenefitsController\nCRUD + liquidación"]
            UController["UtilidadesController\nCRUD + payPeriod → Recibos UTILIDADES"]
        end
        
        subgraph Services["Motor de Cálculo (11 servicios)"]
            PayrollEngine["PayrollEngine\ncalculatePayrollPeriod()\nBatch processing (PAYROLL_BATCH_SIZE)"]
            FormulaEval["FormulaEvaluator\nsafeEval (AST) - NO eval/Function"]
            Accumulator["AccumulatorEngine\nBases: IVSS, FAOV, RPE, PREST, ISLR, INCES"]
            ConceptRules["ConceptRulesEngine\nReglas: tope, base, fórmula, método"]
            EmployerCosts["EmployerCosts\nIVSS, FAOV, INCES, RPE, LPPSS, BANVIH"]
            VacationCalc["VacationCalculator\nVacaciones + Bono + Anticipo"]
            SettlementCalc["SettlementCalculator\nPrestaciones + Cestaticket proporcional"]
            UtilidadesCalc["UtilidadesCalculator\n15% utilidades + ISLR"]
            ISLRCalc["ISLRCalculator\nTablas SUNAT 2024-2025"]
            JournalGen["JournalGenerator\nPartida doble contable"]
            BankExport["BankExportGenerator\nTXT/CSV/Excel (Banesco, Mercantil, etc.)"]
            ExchangeRate["ExchangeRateService\nBCV/Paralelo/Manual + cache 24h"]
        end
        
        subgraph Queue["Colas Asíncronas (Bull + Redis)"]
            CalcQueue["payroll-calculation (1 concurrent)"]
            ExportQueue["bank-export (2 concurrent)"]
            EmailQueue["payslip-email (5 concurrent)"]
            NotifQueue["notifications (10 concurrent)"]
        end
        
        Worker["PayrollWorker\nAuto-start en server/index.js"]
    end

    subgraph Data["Datos"]
        MongoDB[(MongoDB Atlas\n25+ modelos payroll\nÍndices optimizados)]
        Redis[(Redis\nBull queues)]
    end

    Frontend -->|HTTPS/REST| Backend
    Backend -->|Mongoose| MongoDB
    Backend -->|ioredis| Redis
    Queue --> Worker
    Worker --> Services
    Services --> MongoDB
    PayrollEngine --> JournalGen
    PayrollEngine --> FormulaEval
    PayrollEngine --> Accumulator
    PayrollEngine --> EmployerCosts
    PayrollEngine --> ConceptRules
    VacationController --> VacationCalc
    VacationController --> PayrollNovelty
    UtilidadesController --> UtilidadesCalc
    UtilidadesController --> PayrollReceipt
    PayPeriodController --> JournalGen
    PayPeriodController --> ExportQueue
    PayPeriodController --> EmailQueue
```

---

## 📊 MODELOS DE DATOS (25+ Modelos Payroll)

### Core Payroll
| Modelo | Colección | Índices Clave | Descripción |
|--------|-----------|---------------|-------------|
| `PayrollPeriod` | `payrollperiods` | `org+start+end`, `org+status` | Período quincenal/mensual/semanal |
| `PayrollReceipt` | `payrollreceipts` | `org+period+employee` (ÚNICO), `org+period+status`, `employee+status` | Recibo individual |
| `PayrollReceiptLine` | `payrollreceiptlines` | `receipt+concept` | Líneas de conceptos |
| `PayrollPolicy` | `payrollpolicies` | `org` (ÚNICO) | Config legal VES por org |
| `PayrollCompany` | `payrollcompanies` | `org` (ÚNICO) | Config empresa para bancario |
| `PayrollConcept` | `payrollconcepts` | `org+code` (ÚNICO) | 45+ conceptos con fórmulas |
| `PayrollNovelty` | `payrollnovelties` | `org+period+employee+concept` | Anticipos, préstamos, etc. |
| `PayrollEmployerCost` | `payrollemployercosts` | `receipt+concept` | Costos patronales por recibo |

### Vacaciones
| Modelo | Colección | Descripción |
|--------|-----------|-------------|
| `VacationBalance` | `vacationbalances` | Saldo días + bono por empleado |
| `VacationRequest` | `vacationrequests` | Solicitudes (PENDING/APPROVED/TAKEN) |
| `VacationPayment` | `vacationpayments` | Registro pagos vacacionales |

### Prestaciones Sociales
| Modelo | Colección | Descripción |
|--------|-----------|-------------|
| `SocialBenefitsLedger` | `socialbenefitsledgers` | Libro prestaciones por empleado |
| `SettlementCalculation` | `settlementcalculations` | Liquidaciones (renuncia, despido, etc.) |

### Utilidades
| Modelo | Colección | Descripción |
|--------|-----------|-------------|
| `UtilidadesPeriod` | `utilidadesperiods` | Período anual (ganancias netas, %) |
| `UtilidadesPayment` | `utilidadespayments` | Pagos individuales + recibo |

### Contabilidad
| Modelo | Colección | Descripción |
|--------|-----------|-------------|
| `AccountingAccountSubcategory` | `accountsubcategories` | Plan contable (38 cuentas: 6xxx, 2xxx, 4xxx) |
| `AccountingReportMapping` | `accountingreportmappings` | Mapeo concepto → cuenta (débito/crédito) |
| `AccountingPayrollJournalDraft` | `payrolljournaldrafts` | Asientos borrador |
| `AccountingPayrollJournalDraftLine` | `payrolljournaldraftlines` | Líneas del asiento |

### Configuración y Soporte
| Modelo | Colección | Descripción |
|--------|-----------|-------------|
| `ISLRRetentionTable` | `islrretentiontables` | Tablas SUNAT 2024-2025 (UT + tramos) |
| `ReceiptType` | `receipttypes` | NORMAL, VACACIONES, UTILIDADES, etc. |
| `Holiday` | `holidays` | Feriados 2024-2025 |
| `Loan` / `LoanPayment` | `loans` / `loanpayments` | Préstamos empleados |
| `AdvanceRequest` | `advancerequests` | Anticipos de quincena |

---

## ⚙️ MOTOR DE CÁLCULO - DETALLE TÉCNICO

### PayrollEngine.calculatePayrollPeriod(periodId)

```typescript
async calculatePayrollPeriod(periodId: string): Promise<PayrollReceipt[]> {
  1. Validar período existe → estado = CALCULATING
  2. Obtener empleados activos con contrato vigente en período
  3. Procesar en batches (PAYROLL_BATCH_SIZE = 50 default)
     └─ Promise.allSettled para paralelismo controlado
  4. Por empleado:
     a. Obtener contrato activo
     b. calculateEmployeeReceipt(employee, period, contract)
     c. FormulaContext: variables permitidas (SALARIO_BASE, DIAS_TRABAJADOS, etc.)
     d. AccumulatorEngine: acumular bases (IVSS, FAOV, RPE, PREST, ISLR, INCES)
     e. ConceptRulesEngine: aplicar reglas (tope, base, fórmula, método)
     f. EmployerCosts: calcular costos patronales
     g. Persistir: PayrollReceipt + Lines + EmployerCost
  5. generatePayrollJournalDraft(period, receipts) → JournalGenerator
  6. Validar partida doble (diferencia ≤ 0.01 VES)
  7. Actualizar estado = CALCULATED
  8. Retornar receipts[]
}
```

### FormulaEvaluator (SafeEval - AST Based)

**Seguridad:** NO usa `eval()` ni `Function()` constructor → **RCE Prevented**

```typescript
// Operadores permitidos
+ - * / % **
// Comparadores
=== !== < <= > >=
// Funciones
min max abs round floor ceil Decimal
MIN MAX ABS ROUND FLOOR CEIL
// Condicionales
a ? b : c
// Lógicos
&& ||
```

### AccumulatorEngine - Bases de Acumulación

| Base | Conceptos que Acumulan |
|------|------------------------|
| `IVSS_BASE` | SUELDO_BASE, COMPLEMENTO, CESTATICKET, H_EXTRA_DIURNA, H_EXTRA_NOCTURNA, BONO_NOCTURNO, DIAS_FERIADO, DOMINGO_TRABAJADO, DIAS_DESCANSO |
| `FAOV_BASE` | Igual que IVSS_BASE |
| `RPE_BASE` | Igual que IVSS_BASE |
| `PRESTACIONES_BASE` | IVSS_BASE + REPOSO_33 + REPOSO_FULL |
| `ISLR_BASE` | SUELDO_BASE, COMPLEMENTO, H_EXTRA_DIURNA, H_EXTRA_NOCTURNA, BONO_NOCTURNO, DIAS_FERIADO, DOMINGO_TRABAJADO, DIAS_DESCANSO |
| `INCES_BASE` | Igual que IVSS_BASE |

---

## 🏦 GENERADOR DE ASIENTOS CONTABLES (JournalGenerator)

### Flujo: generatePayrollJournalDraft(period, receipts)

```mermaid
graph LR
    A[Receipts] --> B[1. INGRESOS\nDébito: Gasto 6xxx\nCrédito: Por pagar 2xxx]
    A --> C[2. DEDUCCIONES\nDébito: Por pagar 2xxx\nCrédito: Retenciones 4xxx]
    A --> D[3. COSTOS PATRONALES\nDébito: Gasto 62xx\nCrédito: Por pagar 22xx]
    B --> E[AccountingPayrollJournalDraft]
    C --> E
    D --> E
    E --> F[JournalDraftLines]
    F --> G[validateDoubleEntry\nDiff ≤ 0.01 VES]
```

### Mapeo de Cuentas por Defecto

| Concepto | Tipo | Débito | Crédito |
|----------|------|--------|---------|
| SUELDO_BASE | INCOME | 6111 | 2111 |
| CESTATICKET | INCOME | 6113 | 2111 |
| IVSS_DEDUCTION | DEDUCTION | 2111 | 4111 |
| ISLR_DEDUCTION | DEDUCTION | 2111 | 4114 |
| IVSS_PATRONAL | EMPLOYER_COST | 6211 | 2211 |
| FAOV_PATRONAL | EMPLOYER_COST | 6212 | 2212 |

### Validación
```typescript
validateDoubleEntry(draft): {
  valid: diff.abs() <= 0.01,  // 1 centavo tolerancia
  difference: number,
  totalDebit: number,
  totalCredit: number
}
```

---

## 🔄 FLUJOS CRÍTICOS

### 1. Aprobación de Período (POST /periods/:id/approve)

```
HR → API → Validate status=CALCULATED
    → JournalGenerator.initialize() → carga mapeos AccountingReportMapping
    → generatePayrollJournalDraft(period, receipts)
    → validateDoubleEntry() → error si > 0.01 VES
    → postJournalDraft() → draft.state = POSTED
    → Period.status = APPROVED
    → Receipts.status = APPROVED
    → Return {journalDraftId}
```

### 2. Pago de Período (POST /periods/:id/pay)

```
HR → API → Validate status=APPROVED
    → Receipts.status = PAID + payment_date
    → Period.status = PAID
    → addBankExportJob(orgID, periodID) → Bull queue (async)
    → addPayslipEmailJob(orgID, periodID, baseURL) → Bull queue (async)
    → Return {queuedJobs: {bankExport, payslipEmail}}
    → Response incluye warnings si queues fallan
```

### 3. Vacaciones → Novedad de Nómina (POST /vacations/requests/:id/pay)

```
HR → API → Validate request=APPROVED
    → VacationCalculator.calculateVacationPayment()
    → Create PayrollReceipt (tipo=VACACIONES, status=PAID)
    → Update Request.status = TAKEN + payroll_novelty
    → IF advance_amount > 0:
        Create PayrollNovelty (ANTICIPO_VACACIONAL, status=APPLIED)
    → Update VacationBalance
    → Return {receipt, novelty_created}
```

### 4. Utilidades → Recibos (POST /utilidades/periods/:id/pay)

```
HR → API → Validate period=APPROVED
    → UtilidadesCalculator.generatePayments()
    → For each payment:
        Create PayrollReceipt (tipo=UTILIDADES)
        Update UtilidadesPayment.status=PAID + payroll_receipt
    → Period.status = PAID
    → Return payments[]
```

### 5. CRON - Registro Ausencias (Timezone Venezuela)

```
GET /schedule/cron/register-absences
    → yesterday = now in America/Caracas - 1 day (00:00:00)
    → Find active schedules for yesterday
    → For each schedule:
        Find daySchedule for yesterdayDayName
        Filter incomplete tasks
        Check existing absence (employee + scheduleId + date)
        Create Absence (leavetype="Tarea No Realizada")
    → Return {absencesRegistered}
```

---

## 📨 COLAS ASÍNCRONAS (Bull + Redis)

| Cola | Concurrencia | Job Type | Procesador |
|------|--------------|----------|------------|
| `payroll-calculation` | 1 | `calculate` | `PayrollEngine.calculatePayrollPeriod()` |
| `bank-export` | 2 | `export` | `BankExportGenerator.generateAllFormats()` |
| `payslip-email` | 5 | `send` | `SendPayslipEmail()` batch |
| `notifications` | 10 | `notify` | Logging |

### Worker
- **Auto-start:** Integrado en `server/index.js` → `startPayrollWorker()`
- **Graceful shutdown:** SIGTERM/SIGINT cierra queues + Redis
- **Standalone:** `node server/workers/payrollWorker.js`

---

## 💱 SERVICIO DE TASA DE CAMBIO (ExchangeRateService)

```typescript
getExchangeRate(): Promise<Decimal>
  ├── Cache 24 horas (memoria)
  ├── Proveedor según EXCHANGE_RATE_PROVIDER:
  │   ├── 'bcv' → fetch BCV API (requiere BCV_API_KEY)
  │   ├── 'parallel' → proveedor paralelo (pendiente)
  │   └── 'manual' → MANUAL_EXCHANGE_RATE_VES (default 36.0)
  ├── Validación: 10 < rate < 100 VES/USD
  └── Fallback: tasa manual si BCV falla
```

**Uso:** `exchange_rate_snapshot` en PayrollReceipt, VacationPayment, UtilidadesPayment

---

## 🌱 SEEDS CRÍTICOS (Ejecutar con `npm run seed:payroll`)

| Seed | Registros | Dependencias | Propósito |
|------|-----------|--------------|-----------|
| `receipt-types` | 8 | - | NORMAL, VACACIONES, UTILIDADES, LIQUIDACIÓN, etc. |
| `payroll-policy` | 1/org | - | Parámetros legales VES (salario mínimo, % IVSS, etc.) |
| `payroll-company` | 1/org | - | Config bancaria (RIF, cuenta, banco) |
| `islr-retention-table` | 20 (2024-2025) | - | Tablas SUNAT (UT + 10 tramos) |
| `account-subcategory` | 38 | - | Plan contable nómina (6xxx, 2xxx, 4xxx) |
| `payroll-concepts` | 45+ | policy, receipt-types | Conceptos con fórmulas Nominix |
| `holidays` | 30 | - | Feriados 2024-2025 |

### Ejecución
```bash
npm run seed:payroll
# Orden automático: receipt-types → policy → company → ISLR → accounts → concepts → holidays
```

---

## 🔐 SEGURIDAD

### Vulnerabilidades Resueltas
| Vulnerabilidad | Archivo | Fix Aplicado |
|----------------|---------|--------------|
| **RCE via Function()** | `employer-costs.js:202` | Reemplazado por `safeEval` AST-based |
| **RCE via Function()** | `Report.controller.js` | Eliminado (duplicado) |
| **Auth Bypass CRON** | `Schedule.route.js` | Header `x-cron-secret` + middleware |
| **Multi-tenant Leak** | `Report.controller.js:598` | Auth obligatorio + filtro org |
| **Password en Email** | `EmployeeAuth.controller.js:62` | Eliminado - solo token |
| **API Key en Logs** | `sendgrid.config.js` | Removido console.log |
| **Stack Trace en 500** | `Auth.middleware.js` | Response genérico |
| **CORS !origin** | `index.js:41-73` | Regex configurable |

### Autenticación y Permisos
| Endpoint | Auth | Permiso Requerido |
|----------|------|-------------------|
| `/payroll/*` (HR) | `VerifyHRToken` | `PermissionCheck("payroll:*")` |
| `/payroll/receipts/me` | `VerifyEmployeeToken` | - (propio) |
| `/payroll/vacations/*` | `VerifyEmployeeToken` | - (propio) |
| `/schedule/cron/*` | Header `x-cron-secret` | - (externo) |

### Multi-tenancy
- Todos los modelos incluyen `organizationID`
- Queries automáticamente filtradas por `req.ORGID`
- Índices compuestos incluyen `organizationID` como primer campo

---

## 🌐 CONFIGURACIÓN CORS

```javascript
// server/index.js
const corsOriginRegex = process.env.CORS_ORIGIN_REGEX
// Default: "^https://.*\.vercel\.app$|^https://app\.condove\.com$|^https://app\.condominiosvenezuela\.com$"

allowedOrigins = [
  process.env.CLIENT_URL,
  /.vercel.app$/,
  /cron-job.org$/,  // Para servicios cron externos
  new RegExp(corsOriginRegex)  // Si existe en env
]
```

---

## 📁 ESTRUCTURA DE ARCHIVOS CLAVE

```
server/
├── controllers/
│   ├── PayrollPeriodController.js      # 298 líneas - CRUD + calc + approve + pay + close
│   ├── PayrollReceiptController.js     # 224 líneas - CRUD + export + detail
│   ├── PayrollConceptController.js     # CRUD + validación fórmula
│   ├── PayrollNoveltyController.js     # CRUD + apply
│   ├── VacationController.js           # 445 líneas - CRUD + payVacation
│   ├── SocialBenefitsController.js     # 379 líneas - CRUD + liquidación
│   ├── UtilidadesController.js         # 333 líneas - CRUD + payPeriod + payIndividual
│   ├── EmployeeAuth.controller.js      # 337 líneas - Auth empleado (rename Emplyoee→Employee)
│   ├── Schedule.controller.js          # 427 líneas - CRON + timezone fix
│   ├── Attendance.controller.js        # 325 líneas - checkOut fix
│   ├── WorkPhoto.controller.js         # 395 líneas - debug logs solo dev
│   └── ...
├── services/payroll/
│   ├── payroll-engine.js               # 690 líneas - Motor principal + batch
│   ├── journal-generator.js            # 395 líneas - Partida doble completa
│   ├── formula-evaluator.js            # 280 líneas - SafeEval AST
│   ├── formula-context.js              # Variables permitidas
│   ├── accumulator-engine.js           # Acumulación bases
│   ├── concept-rules.js                # Reglas conceptos
│   ├── employer-costs.js               # 224 líneas - Costos patronales
│   ├── vacation-calculator.js          # Vacaciones + bono + anticipo
│   ├── settlement-calculator.js        # Prestaciones
│   ├── utilidades-calculator.js        # 15% utilidades
│   ├── islr-calculator.js              # ISLR con tablas SUNAT
│   ├── bank-export.js                  # 271 líneas - TXT/CSV/Excel
│   ├── exchange-rate.service.js        # BCV/Paralelo/Manual + cache
│   └── index.js                        # Barrel exports
├── models/payroll/                     # 25+ modelos
├── models/accounting/                  # 4 modelos contables
├── seeds/
│   ├── payroll.seed.js                 # Orquestador
│   ├── account-subcategory.seed.js     # 38 cuentas
│   ├── islr-retention-table.seed.js    # Tablas 2024-2025
│   └── ...
├── workers/
│   └── payrollWorker.js                # Auto-start + 4 queues
├── config/
│   ├── queue.js                        # Bull queues + redisClient singleton
│   ├── redis.js                        # ioredis singleton
│   └── connectDB.js
├── utils/
│   └── logger.js                       # Logger simple (debug solo dev)
├── docs/architecture/
│   ├── payroll-module.md               # Arquitectura + diagramas Mermaid
│   ├── payroll-data-flow.md            # Sequence diagrams
│   ├── payroll-api-contracts.md        # Contratos OpenAPI-style
│   └── payroll-deployment.md           # Guía Vercel + Render + Atlas
└── docs/architecture/

client/
├── src/pages/HumanResources/Dashboard Childs/Payroll/
│   ├── HRPayrollPage.jsx               # 26K líneas - MONOLITO (pendiente split)
│   └── PayrollPeriodFormModal.jsx      # 22K líneas - MONOLITO (pendiente split)
├── src/pages/Employees/Dashboard Childs/
│   └── EmployeePayrollPage.jsx         # Vista empleado
├── src/redux/
│   ├── payrollSlice.js                 # Estado global
│   └── payrollThunk.js                 # Async thunks
└── src/components/common/
    └── ConfirmDialog.jsx               # FALTA (pendiente Fase 7)
```

---

## 🧪 TESTING

### Estado Actual
| Métrica | Valor |
|---------|-------|
| **Test Suites** | 11 passed |
| **Tests** | 127 passing, 3 skipped |
| **Coverage Global** | ~40% |
| **Coverage Núcleo (engines)** | ~80%+ |
| **Tiempo** | ~6-7s |

### Archivos de Test
```
server/tests/
├── formula-evaluator.test.js       # 25 tests - safeEval AST
├── accumulator-engine.test.js      # 18 tests - bases
├── vacation-calculator.test.js     # 22 tests - vacaciones/bono
├── islr-calculator.test.js         # 15 tests - ISLR tablas
├── utilidades-calculator.test.js   # 12 tests - utilidades
├── settlement-calculator.test.js   # 18 tests - prestaciones
├── payroll-engine.test.js          # 10 tests - integración
├── cron.test.js                    # 12 tests - CRON + timezone
└── ...
```

### Pendiente
- [ ] Tests E2E integración (auth → payroll → report → CRON)
- [ ] Coverage ≥ 80% en controladores
- [ ] Tests de carga (k6/artillery)

---

## 📦 VARIABLES DE ENTORNO REQUERIDAS

### Backend (`.env`)
```bash
# Base
MONGODB_URI=mongodb+srv://...
JWT_SECRET=super-secret-min-32-chars
NODE_ENV=production
PORT=10000

# Redis (Bull)
REDIS_HOST=redis-xxxxx.render.com
REDIS_PORT=6379
REDIS_PASSWORD=xxxx

# SendGrid
SENDGRID_API_KEY=SG.xxx
SENDGRID_SENDER_EMAIL=noreply@condove.com
CLIENT_URL=https://app.condove.com

# Firebase Admin
FIREBASE_PROJECT_ID=condove-xxx
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Nómina
BCV_API_URL=https://www.bcv.org.ve
BCV_API_KEY=xxx
EXCHANGE_RATE_PROVIDER=bcv
MANUAL_EXCHANGE_RATE_VES=36.0
PAYROLL_WORKER_CONCURRENCY=5
PAYROLL_BATCH_SIZE=50

# CORS
CORS_ORIGIN_REGEX="^https://.*\.vercel\.app$|^https://app\.condove\.com$|^https://app\.condominiosvenezuela\.com$"

# Logs
LOG_LEVEL=info
```

### Frontend (Vercel)
```bash
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_PROJECT_ID=condove-xxx
VITE_FIREBASE_APP_ID=1:xxx:web:xxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_API_URL=https://api.condove.com
```

---

## 🚀 DEPLOY - ARQUITECTURA PRODUCCIÓN

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRODUCCIÓN                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │   Vercel     │    │    Render    │    │   MongoDB Atlas  │  │
│  │  (Frontend)  │◄───│  (Backend)   │◄──►│   (Database)     │  │
│  │ React + Vite │    │ Node.js/Exp  │    │ 25+ modelos      │  │
│  │ Static Build │    │ Bull Worker  │    │ Índices optimiz. │  │
│  └──────────────┘    └──────┬───────┘    └──────────────────┘  │
│                             │                                    │
│                    ┌────────┴────────┐                           │
│                    │     Redis       │                           │
│                    │  (Bull Queues)  │                           │
│                    └─────────────────┘                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Health Check
```
GET /api/health
→ { status, timestamp, services: { mongodb, redis, queues, firebase } }
→ No inicializa Bull, solo verifica estado
```

### Scripts Deploy
```bash
# Backend (Render)
npm install
npm run create:indexes  # Índices en Atlas
npm run seed:payroll    # Seeds (primera vez)

# Worker (Render Worker Service)
node server/workers/payrollWorker.js

# Frontend (Vercel)
npm run build  # Output en dist/
```

---

## 📋 CHECKLIST ESTADO ACTUAL

### ✅ COMPLETADO (Fases 1-5 Parcial)
- [x] Build 0 errores (client + server)
- [x] Tests 127 passing
- [x] RCE eliminado (evalFormula → safeEval)
- [x] Typo Emplyoee → Employee (15 fns + archivo)
- [x] Redis PORT typo fix
- [x] Ruta duplicada /contact consolidada
- [x] Journal Generator real (partida doble)
- [x] Worker auto-start
- [x] Seeds: AccountSubcategory (38), ISLR (2024-2025)
- [x] Batch processing (PAYROLL_BATCH_SIZE)
- [x] Timezone CRON (America/Caracas)
- [x] Queue error handling (warnings)
- [x] HandleCheckOut fix (fecha actual)
- [x] Vacation ↔ PayrollNovelty
- [x] Utilidades → Recibos
- [x] ExportReceipt PDF 400 mensaje claro
- [x] export_bank_files + send_payslips_email en pay()
- [x] CORS custom domains regex
- [x] Health check no inicia Bull
- [x] Documentación arquitectura (4 archivos)
- [x] Security scan npm audit
- [x] console.log debug solo dev

### ⏳ PENDIENTE (Fase 5 Restante + Fase 7)
- [ ] Tests E2E integración
- [ ] Variables Firebase en Vercel/Render
- [ ] Deploy staging completo (Vercel + Render)
- [ ] Smoke tests staging
- [ ] Load test (k6/artillery)
- [ ] Coverage ≥ 80%
- [ ] Confirmación usuario "TAREA COMPLETADA"
- [ ] Actualizar bitácoras
- [ ] Auto-mantenimiento post-flight
- [ ] Push commits → actualiza PR existente hacia `dev`

### 📋 FASE 7 (Gap Críticos Producción - Según Bitácora Original)
- [ ] ConfirmDialog componente
- [ ] HRPayrollPage split (26K → 8 sub-componentes)
- [ ] PayrollPeriodFormModal split (22K → 3 archivos)
- [ ] Code splitting + lazy loading
- [ ] PermissionCheck frontend
- [ ] Bundle < 500KB gzip

---

## 🎯 PRÓXIMOS PASOS INMEDIATOS

1. **Configurar Firebase** en dashboards Vercel + Render
2. **Deploy Staging** → Vercel (frontend) + Render (backend + worker)
3. **Smoke Tests** → Health, Auth, Payroll Calculate, Approve, Pay, Export
4. **Load Test** → k6/artillery en staging
5. **Coverage** → Añadir tests controladores para ≥80%
6. **Confirmación Usuario** → "TAREA COMPLETADA"
7. **Push + PR Update** → Actualiza PR existente hacia `dev`

---

## 📞 CONTACTOS ESCALACIÓN

| Área | Responsable | Canal |
|------|-------------|-------|
| Backend/Worker | @backend-team | #backend-alerts |
| Frontend | @frontend-team | #frontend-alerts |
| Database | @dba-team | #db-alerts |
| Infra/DevOps | @devops-team | #infra-alerts |
| Nómina (Negocio) | @payroll-team | #payroll-support |

---

*Documento generado: 2026-11-03 | Commit: 76d9fcf | Branch: 037-payroll-venezuelan-module | Autor: CTO Condominios Venezuela*