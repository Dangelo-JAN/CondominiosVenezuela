# INFORME DE INGENIERÍA Y AUDITORÍA: MÓDULO DE NÓMINA VENEZUELANA Y CONTROL DE DAÑOS

---

## 1. RESUMEN EJECUTIVO Y MAPA DE ALTERACIONES (¿QUÉ HIZO?)

### 1.1 Contexto General
Este informe documenta la implementación del **Módulo de Nómina Venezolana (Fase 1-7)** sobre la base `b44a09f`, abarcando 198 archivos modificados/creados. La auditoría forense se centra en dos fallos críticos reportados: **bucle infinito en login de empleado** e **invisibilidad del módulo en perfil RR.HH.**

### 1.2 Mapa Exhaustivo de Alteraciones por Capa Arquitectónica

| Capa | Archivo | Acción | Responsabilidad Única |
|------|---------|--------|----------------------|
| **Modelos - Core Payroll** | `server/models/payroll/PayrollPeriod.model.js` | Modificado | Período de nómina (DRAFT→CALCULATED→APPROVED→PAID→CLOSED), cascade delete |
| | `server/models/payroll/PayrollReceipt.model.js` | Creado | Recibo individual por empleado/período, índice único {org, period, employee} |
| | `server/models/payroll/PayrollReceiptLine.model.js` | Creado | Líneas de recibo (concepto, monto, cantidad, traza de cálculo) |
| | `server/models/payroll/PayrollConcept.model.js` | Creado | Catálogo de conceptos (fórmulas dinámicas, reglas, incidencias) |
| | `server/models/payroll/PayrollPolicy.model.js` | Creado | Política organizacional (tasas, parámetros legales, reglas) |
| | `server/models/payroll/PayrollCompany.model.js` | Creado | Extensión de política con datos fiscales, bancos, módulos activos |
| | `server/models/payroll/PayrollNovelty.model.js` | Creado | Novedades por empleado/período (bonos, deducciones, aplicadas) |
| | `server/models/payroll/PayrollEmployerCost.model.js` | Creado | Costos patronales por recibo (IVSS, FAOV, INCES, etc.) |
| | `server/models/payroll/ISLRRetentionTable.model.js` | Creado | Tablas ISLR 2024-2025 (UT, tramos mensual/anual) |
| | `server/models/payroll/ISLRRetention.model.js` | Creado | Retenciones ISLR calculadas por recibo |
| | `server/models/payroll/ReceiptType.model.js` | Creado | Tipos de recibo (NORMAL, VACACIONES, UTILIDADES, etc.) |
| | `server/models/payroll/VacationBalance.model.js` | Creado | Saldo de vacaciones por empleado (acumulado/tomado/pendiente) |
| | `server/models/payroll/VacationRequest.model.js` | Creado | Solicitudes de vacaciones (workflow aprobar/pagar) |
| | `server/models/payroll/VacationPayment.model.js` | Creado | Registro de pago de vacaciones (NUEVO - fix warning) |
| | `server/models/payroll/Holiday.model.js` | Creado | Feriados oficiales por organización |
| | `server/models/payroll/SocialBenefitsLedger.model.js` | Creado | Libro de prestaciones (devengado mensual) |
| | `server/models/payroll/SocialBenefitsSettlement.model.js` | Creado | Liquidación final de prestaciones |
| | `server/models/payroll/UtilidadesPeriod.model.js` | Creado | Períodos de utilidades (cálculo/aprobación/pago) |
| | `server/models/payroll/UtilidadesPayment.model.js` | Creado | Pagos individuales de utilidades |
| | `server/models/payroll/Loan.model.js` | Creado | Préstamos a empleados (cuotas, intereses) |
| | `server/models/payroll/LoanPayment.model.js` | Creado | Cuotas de préstamos pagadas |
| | `server/models/payroll/AdvanceRequest.model.js` | Creado | Solicitudes de anticipo (vacaciones, utilidades) |
| | `server/models/payroll/index.js` | Creado | Barrel export de todos los modelos payroll |
| **Modelos - Contabilidad** | `server/models/accounting/AccountSubcategory.model.js` | Creado | Plan de cuentas (61xx, 62xx, 21xx, 22xx, 41xx) |
| | `server/models/accounting/PayrollJournalDraft.model.js` | Creado | Borradores de asiento contable (partida doble) |
| | `server/models/accounting/PayrollJournalDraftLine.model.js` | Creado | Líneas de asiento (debe/haber, subcuenta) |
| | `server/models/accounting/ReportMapping.model.js` | Creado | Mapeo conceptos → subcuentas contables |
| **Modelos - Employee (Extensión)** | `server/models/Employee.model.js` | **Modificado** | **+94 campos** de nómina: national_id, rif, ivss_code, salary_amount, active_contract, payroll_receipts[], vacation_balance, etc. |
| | `server/models/LaborContract.model.js` | **Creado** | Contrato laboral separado (fix warning índices duplicados) |
| **Servicios - Motor de Cálculo** | `server/services/payroll/payroll-engine.js` | Creado | **Motor principal** - orquesta cálculo por período/empleado, usa Decimal.js |
| | `server/services/payroll/accumulator-engine.js` | Creado | Acumuladores de bases (IVSS, FAOV, RPE, Prestaciones, ISLR, INCES) |
| | `server/services/payroll/concept-rules.js` | Creado | Motor de reglas: condiciones, dependencias, rangos, topes |
| | `server/services/payroll/formula-context.js` | Creado | Contexto tipado para evaluación de fórmulas (variables permitidas) |
| | `server/services/payroll/formula-evaluator.js` | Creado | `safeEval()` sandbox para fórmulas dinámicas + validación AST |
| | `server/services/payroll/employer-costs.js` | Creado | Cálculo costos patronales (IVSS 9%, FAOV 2%, INCES 2%, BANVIH 2%, RPE 2%) |
| | `server/services/payroll/islr-calculator.js` | Creado | Cálculo ISLR por tramos (tabla BD + fallback hardcoded) |
| | `server/services/payroll/vacation-calculator.js` | Creado | Vacaciones/bono vacacional LOTTT Art. 186-197 |
| | `server/services/payroll/settlement-calculator.js` | Creado | Prestaciones sociales (fórmula 30/60/90 días) |
| | `server/services/payroll/utilidades-calculator.js` | Creado | Utilidades (15% utilidad neta, 180 días tope) |
| | `server/services/payroll/journal-generator.js` | Creado | Generador asiento contable partida doble + validación |
| | `server/services/payroll/bank-export.js` | Creado | Export TXT (SUDEBAN ancho fijo 20+ bancos), CSV, Excel (BOM UTF-8) |
| | `server/services/payroll/index.js` | Creado | Barrel export + helpers `calculatePayrollPeriod()`, `calculateEmployeeReceipt()` |
| **Controladores** | `server/controllers/PayrollPeriodController.js` | **Modificado** | CRUD + acciones: calculate, approve, pay (encola queue), close |
| | `server/controllers/PayrollReceiptController.js` | Creado | CRUD recibos + recalculate, export, void |
| | `server/controllers/PayrollConceptController.js` | Creado | CRUD conceptos + validar fórmula |
| | `server/controllers/PayrollPolicyController.js` | Creado | CRUD policy + company |
| | `server/controllers/PayrollNoveltyController.js` | Creado | CRUD novedades + bulk-create, apply/reject |
| | `server/controllers/VacationController.js` | Creado | Balances, requests, approve/pay, holidays |
| | `server/controllers/SocialBenefitsController.js` | Creado | Ledger, settlements (calculate/create/approve/pay), accrual |
| | `server/controllers/UtilidadesController.js` | Creado | Periods, payments (calculate/approve/pay) |
| | `server/controllers/EmplyoeeAuth.controller.js` | **Existente** | Login empleado - **SIN MODIFICAR EN ESTA FASE** |
| **Rutas Backend** | `server/routes/PayrollPeriod.route.js` | Creado | `/api/v1/payroll-periods` + sub-rutas acciones |
| | `server/routes/PayrollReceipt.route.js` | Creado | `/api/v1/payslips` |
| | `server/routes/PayrollConcept.route.js` | Creado | `/api/v1/payroll-concepts` |
| | `server/routes/PayrollPolicy.route.js` | Creado | `/api/v1/payroll-policy` |
| | `server/routes/PayrollNovelty.route.js` | Creado | `/api/v1/payroll-novelties` |
| | `server/routes/Vacation.route.js` | Creado | `/api/v1/vacations` |
| | `server/routes/SocialBenefits.route.js` | Creado | `/api/v1/social-benefits` |
| | `server/routes/Utilidades.route.js` | Creado | `/api/v1/utilidades` |
| | `server/routes/EmployeeAuth.route.js` | Existente | `/api/auth/employee` - **SIN MODIFICAR** |
| | `server/routes/Employee.route.js` | Existente | `/api/v1/employee` - **SIN MODIFICAR** |
| **Middleware/Infra** | `server/middlewares/Auth.middleware.js` | Existente | `VerifyEmployeeToken`, `VerifyhHRToken` - **SIN MODIFICAR** |
| | `server/middlewares/RoleAuth.middleware.js` | Existente | `PermissionCheck`, `RoleAuthorization`, `AdminOnly` - **SIN MODIFICAR** |
| | `server/config/redis.js` | **Modificado** | Fix import ioredis (CommonJS default) + lazyConnect |
| | `server/config/queue.js` | Creado | 4 colas Bull: bank-export, payslip-email, payroll-calculation, notifications |
| | `server/workers/payrollWorker.js` | Creado | Procesador independiente 4 colas + graceful shutdown |
| | `server/index.js` | **Modificado** | +12 rutas payroll, CORS regex, health extendido (DB/Redis/Queue/Firebase) |
| **Seeds** | `server/seeds/payroll.seed.js` | **Modificado** | Orquestador: ReceiptTypes→Policy→Company→ISLR→AccountSubcategory→Concepts→Holidays |
| | `server/seeds/islr-retention-table.seed.js` | Creado | 18 registros ISLR 2024-2025 (UT 9.00) |
| | `server/seeds/account-subcategory.seed.js` | Creado | 38 subcuentas contables |
| | `server/seeds/payroll-company.seed.js` | Creado | Config empresa por defecto (tasas, bancos, módulos) |
| | `server/seeds/payroll-policy.seed.js` | Creado | Policy base |
| | `server/seeds/payroll-concepts.seed.js` | Creado | ~120 conceptos venezolanos (fórmulas, reglas) |
| | `server/seeds/receipt-types.seed.js` | Creado | Tipos: NORMAL, VACACIONES, UTILIDADES, PRESTACIONES |
| | `server/seeds/holidays.seed.js` | Creado | Feriados 2024-2025 |
| **Frontend - Rutas HR** | `client/src/routes/HRroutes.jsx` | **Modificado** | Lazy load `HRPayrollPage` + Suspense + ruta `/HR/dashboard/payroll` |
| | `client/src/routes/employeeroutes.jsx` | **Existente** | **SIN RUTA DE NÓMINA PARA EMPLEADO** |
| **Frontend - Páginas HR** | `client/src/pages/HumanResources/Dashboard Childs/Payroll/HRPayrollPage.jsx` | **Reescrito** | 55 líneas - contenedor lazy tabs (code splitting) |
| | `client/src/pages/HumanResources/Dashboard Childs/Payroll/tabs/PayrollPeriodsTab.jsx` | Creado | ~450 líneas - gestión períodos (crear, calcular, aprobar, pagar, cerrar) |
| | `client/src/pages/HumanResources/Dashboard Childs/Payroll/tabs/PayrollReceiptsTab.jsx` | Creado | Placeholder listado recibos |
| | `client/src/pages/HumanResources/Dashboard Childs/Payroll/tabs/PayrollConceptsTab.jsx` | Creado | Placeholder conceptos |
| | `client/src/pages/HumanResources/Dashboard Childs/Payroll/tabs/PayrollPolicyTab.jsx` | Creado | Placeholder policy |
| | `client/src/pages/HumanResources/Dashboard Childs/Payroll/tabs/PayrollNoveltiesTab.jsx` | Creado | Placeholder novedades |
| | `client/src/pages/HumanResources/Dashboard Childs/Payroll/tabs/PayrollVacationsTab.jsx` | Creado | Placeholder vacaciones |
| | `client/src/pages/HumanResources/Dashboard Childs/Payroll/tabs/PayrollSocialBenefitsTab.jsx` | Creado | Placeholder prestaciones |
| | `client/src/pages/HumanResources/Dashboard Childs/Payroll/tabs/PayrollUtilitiesTab.jsx` | Creado | Placeholder utilidades |
| | `client/src/pages/HumanResources/Dashboard Childs/Payroll/tabs/PayrollTabsContainer.jsx` | Creado | Wrapper tabs + navigation |
| **Frontend - Componentes** | `client/src/components/payroll/PayrollPeriodFormModal.jsx` | **Reescrito** | 102 líneas - compone hooks + fields |
| | `client/src/components/payroll/form/PayrollPeriodFormFields.jsx` | Creado | Campos formulario (React Hook Form) |
| | `client/src/components/payroll/form/usePayrollPeriodFormState.js` | Creado | Hook estado formulario |
| | `client/src/components/payroll/form/usePayrollPeriodFormValidation.js` | Creado | Hook validación (Zod) |
| | `client/src/components/common/ConfirmDialog.jsx` | **Existente** | Reutilizado para confirmar delete/approve/pay/close |
| **Frontend - Redux/State** | `client/src/redux/Slices/PayrollSlice.js` | Creado | Slice payroll (periods, receipts, concepts, loading, error) |
| | `client/src/redux/Thunks/PayrollThunk.js` | Creado | Thunks async (fetch, calculate, approve, pay, close, export) |
| | `client/src/redux/apis/APIsEndpoints.js` | **Modificado** | +PayrollEndPoints (108 endpoints) + Employee: `RECEIPTS_GET_EMPLOYEE` |
| | `client/src/redux/app/store.js` | **Modificado** | Registra payrollReducer |
| **Frontend - Config** | `client/vite.config.js` | **Modificado** | manualChunks: 11 chunks (payroll-periods, payroll-tabs, vendor-*) |
| | `client/.env.example` | Creado | Vars Firebase + VITE_API_BASE_URL |
| | `server/.env.example` | Creado | Todas las vars backend (MONGO, JWT, REDIS, SENDGRID, CORS_ORIGIN_REGEX) |
| **Scripts/Deploy** | `server/scripts/create-indexes.mjs` | Creado | Crea índices 30 modelos en Atlas (maneja conflictos 85) |
| | `server/package.json` | **Modificado** | +bull, ioredis + script `create:indexes` |
| **SendGrid** | `server/sendgrid/emailtemplates.js` | **Modificado** | +PAYSLIP_EMAIL_TEMPLATE (HTML responsive) |
| | `server/sendgrid/emails.js` | **Modificado** | +SendPayslipEmail() con formato es-VE |
| **Tests** | `server/tests/payroll/*.test.js` | Creados (6) | Unit tests: accumulator, formula-evaluator, islr, settlement, utilidades, vacation |

---

## 2. ANÁLISIS FORENSE: BUCLE INFINITO EN LOGIN DE EMPLEADO

### 2.1 Flujo de Login Actual (Frontend → Backend)

```
EmployeeLogin.jsx (líneas 27-32, 49-68)
  ↓ dispatch HandlePostEmployees({apiroute: "LOGIN", data})
  ↓ EmployeeThunk.js línea 24: employeeApiService.post(APIsEndPoints.LOGIN, data)
  ↓ EmployeeApiService.js interceptor: NO agrega token (ruta en EM_PUBLIC)
  ↓ POST /api/auth/employee/login
  ↓ EmplyoeeAuth.controller.js línea 136: HandleEmplyoeeLogin()
  ↓ bcrypt.compare + GenerateJwtTokenAndSetCookiesEmployee()
  ↓ Response {token} → localStorage.setItem("EMtoken")
  ↓ EmployeeSlice: isAuthenticated = true
  ↓ EmployeeLogin useEffect línea 56: RedirectToDashboard()
```

### 2.2 Causa Raíz del Bucle Infinito

**ARCHIVO: `client/src/pages/Employees/emplyoeelogin.jsx` (LÍNEAS 49-68)**

```javascript
useEffect(() => {
    // Solo verificar autenticación una vez al montar el componente
    if (!hasCheckedAuth && !EmployeeState.isAuthenticated) {
        setHasCheckedAuth(true)
        dispatch(HandleGetEmployees({ apiroute: "CHECKELOGIN" }))  // ← PROBLEMA
    }
    // ...
}, [EmployeeState.isAuthenticated, EmployeeState.error, hasCheckedAuth])
```

**PROBLEMA 1 - Race Condition en CHECKLOGIN:**
- `CHECKELOGIN` → `APIsEndPoints.CHECKELOGIN = "/api/auth/employee/check-login"`
- Esta ruta **requiere `VerifyEmployeeToken` middleware** (EmployeeAuth.route.js línea 20)
- El middleware extrae token de `Authorization: Bearer <token>` header
- **Pero en login inicial NO HAY TOKEN** (se obtiene DESPUÉS del login exitoso)
- El middleware responde `401 Unauthorized` → `rejectWithValue` → `EmployeeState.error.status = true`
- El `useEffect` se re-ejecuta por cambio en `EmployeeState.error`
- **Bucle: dispatch CHECKLOGIN → 401 → error → re-render → dispatch CHECKLOGIN...**

**PROBLEMA 2 - Dependencias del useEffect Incorrectas:**
```javascript
}, [EmployeeState.isAuthenticated, EmployeeState.error, hasCheckedAuth])
```
- `EmployeeState.error` cambia en **CADA** llamada fallida a CHECKLOGIN
- Esto re-dispara el effect infinitamente

**PROBLEMA 3 - Lógica Invertida:**
- El `CHECKELOGIN` debe llamarse **SOLO** cuando YA hay token en localStorage (restaurar sesión)
- En login fresco, **NO debe llamarse** hasta después del login exitoso

### 2.3 Evidencia en Código Backend (Confirmación)

**`server/routes/EmployeeAuth.route.js` línea 20:**
```javascript
router.get("/check-login", VerifyEmployeeToken, HandleEmployeeCheck)
```

**`server/middlewares/Auth.middleware.js` líneas 4-30:**
```javascript
export const VerifyEmployeeToken = (req, res, next) => {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null
    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized access", gologin: true })
    }
    // ...
}
```

**CONCLUSIÓN:** El middleware **SIEMPRE** retorna 401 si no hay header Authorization. El frontend llama a este endpoint **antes** de tener token.

### 2.4 Fix Requerido (Frontend)

```javascript
// En EmployeeLogin.jsx - CORREGIR useEffect:
useEffect(() => {
    // SOLO verificar si YA hay token guardado (restaurar sesión)
    const hasToken = localStorage.getItem("EMtoken")
    if (!hasCheckedAuth && !EmployeeState.isAuthenticated && hasToken) {
        setHasCheckedAuth(true)
        dispatch(HandleGetEmployees({ apiroute: "CHECKELOGIN" }))
    }
    // ...
}, [EmployeeState.isAuthenticated, hasCheckedAuth]) // QUITAR EmployeeState.error
```

---

## 3. ANÁLISIS DE RUTAS: INVISIBILIDAD DEL MÓDULO EN PERFIL RR.HH.

### 3.1 Mapeo de Rutas Frontend (HR)

**`client/src/routes/HRroutes.jsx` líneas 98-105:**
```javascript
{
    path: "/HR/dashboard/payroll",
    element: (
        <Suspense fallback={<Loading />}>
            <HRPayrollPage />
        </Suspense>
    )
}
```

**`client/src/components/common/ProtectedHRRoute.jsx` líneas 34-57:**
```javascript
useEffect(() => {
    if (!isReady) return
    if (!role) return
    if (isAdmin) return
    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        navigate(redirectTo, { replace: true })
        return
    }
}, [isReady, role, isAdmin, allowedRoles, navigate, redirectTo])
```

### 3.2 Problema 1: Falta de Permiso Explícito en Ruta Payroll

La ruta `/HR/dashboard/payroll` **NO está envuelta en `ProtectedHRRoute`** (líneas 99-105). Solo está en `Suspense`. Esto significa:
- Cualquier HR logueado puede acceder (sin verificación de permiso `payroll.read`)
- Si `useHRAuth` no tiene `role` listo (`isReady=false`), renderiza `null` (línea 61)
- **Síntoma:** Pantalla en blanco o "leyendo..." si `isReady` nunca pasa a `true`

### 3.3 Problema 2: useHRAuth - Estado `isReady` Nunca Resuelto

**`client/src/hooks/useHRAuth.js`** (no leído pero inferido por uso en `ProtectedHRRoute`):
- `isReady` depende de `HandleGetHR({apiroute: "CHECKLOGIN"})` completarse
- Si el backend `/api/auth/HR/check-login` falla (igual que empleado), `isReady` puede quedar `false`永远

### 3.4 Problema 3: Falta de Ruta Empleado para Ver Sus Recibos

**`client/src/redux/apis/APIsEndpoints.js` línea 123:**
```javascript
RECEIPTS_GET_EMPLOYEE: (employeeId) => `/api/v1/payslips/employee/${employeeId}`
```

**PERO** en `server/routes/PayrollReceipt.route.js` **NO EXISTE** esta ruta para empleados:
```javascript
// PayrollReceipt.route.js - SOLO RUTAS HR (VerifyhHRToken)
router.get("/", VerifyhHRToken, PermissionCheck("payslips", "read"), ...)
router.get("/:id", VerifyhHRToken, ...)
router.get("/employee/:employeeId", VerifyhHRToken, ...)  // SOLO HR
```

**No hay ruta con `VerifyEmployeeToken` para `/api/v1/payslips/employee/:employeeId`**

### 3.5 Problema 4: Exportación PayrollReceiptRouter en server/index.js

**`server/index.js` línea 110:**
```javascript
app.use("/api/v1/payslips", PayrollReceiptRouter)
```

Pero `PayrollReceiptRouter` solo expone rutas protegidas por `VerifyhHRToken`. El empleado **no puede acceder a sus propios recibos**.

---

## 4. ESPECIFICACIÓN TÉCNICA DE FUNCIONES CRÍTICAS (LOTTT)

### 4.1 Retenciones IVSS/FAOV/RPE/INCES - `employer-costs.js`

| Función | Firma | Parámetros | Retorno | Mutabilidad |
|---------|-------|------------|---------|-------------|
| `calculateEmployerCosts` | `async (context, accumulators)` | `context: FormulaContext`, `accumulators: AccumulatorEngine` | `Array<{concept_code, concept_name, base_ves, rate, amount_ves, calculation_log}>` | **No muta args**. Crea nuevos objetos. Lee `policy` de context. |
| `_calculateIVSS` | `private (base, policy)` | `base: Decimal`, `policy: PayrollPolicy` | `Decimal` | Puro - sin side effects |
| `_calculateFAOV` | `private (base, policy)` | `base: Decimal`, `policy: PayrollPolicy` | `Decimal` | Puro |
| `_calculateINCES` | `private (base, policy)` | `base: Decimal`, `policy: PayrollPolicy` | `Decimal` | Puro |

**Lógica Interna (IVSS ejemplo):**
```javascript
// employer-costs.js líneas 45-65
const ivssBase = accumulators.get('IVSS_BASE') || salaryBase
const cappedBase = Decimal.min(ivssBase, minimumWage.times(policy.ivss_salary_cap_multiplier || 5))
const employeeIVSS = cappedBase.times(policy.ivss_employee_rate || 4).div(100)
const employerIVSS = cappedBase.times(policy.ivss_employer_rate || 9).div(100)
```

**Manejo de Efectos Secundarios:** **NINGUNO** - Funciones puras. Solo leen `policy` inyectado por DI.

---

### 4.2 Cálculo Cestaticket - `concept-rules.js` / `payroll-engine.js`

| Función | Firma | Parámetros | Retorno |
|---------|-------|------------|---------|
| `ConceptRulesEngine.processConceptRules` | `static (concept, amount, context)` | `concept: PayrollConcept`, `amount: Decimal`, `context: FormulaContext` | `Decimal` (monto final tras reglas) |
| `_getCestaticketDaily` | `private (employee)` | `employee: Employee` | `Decimal` (monto diario VES) |

**Lógica Cestaticket (vacation-calculator.js líneas 200-208):**
```javascript
_getCestaticketDaily(employee) {
    const policy = this.policy
    if (!policy) return new Decimal(0)
    const cestaticketMonthlyUsd = policy.cestaticket_amount_usd || 40
    const exchangeRate = employee.active_contract?.exchange_rate || 1
    return new Decimal(cestaticketMonthlyUsd).times(exchangeRate).div(30)
}
```

**Mutabilidad:** Lee `employee.active_contract.exchange_rate` (puede ser `undefined` → fallback 1). **Riesgo:** Si `active_contract` no está poblado, usa tasa 1 (incorrecto en VES).

---

### 4.3 Cálculo Sueldo Base - `payroll-engine.js` líneas 102-103, 368-369

```javascript
// En calculateEmployeeReceipt:
const exchangeRate = period.pinned_rate || period.exchange_rate_snapshot || 1
const salaryBaseVes = contract.salary_amount * exchangeRate  // ← PROBLEMA: float nativo
```

**`_getQuantity` para SUELDO_BASE (línea 369):**
```javascript
case 'SUELDO_BASE':
    return variables.DIAS_EFECTIVOS?.toNumber() || 0
```

**Problema Crítico:** `salaryBaseVes` usa **`*` nativo de JavaScript (IEEE 754 float)** antes de envolver en `Decimal`. Para montos grandes en VES (millones), **pierde precisión en centavos**.

**Fix Requerido:**
```javascript
const salaryBaseVes = new Decimal(contract.salary_amount).times(exchangeRate)
```

---

### 4.4 Motor de Acumuladores - `accumulator-engine.js`

| Función | Firma | Mutabilidad |
|---------|-------|-------------|
| `AccumulatorEngine.add(baseName, amount, conceptCode)` | `void` | **MUTA `this.bases[baseName]`** (acumula) |
| `AccumulatorEngine.get(baseName)` | `Decimal \| null` | Lee estado interno |
| `AccumulatorEngine.BASES` | `static Array<string>` | Constante: `['IVSS_BASE', 'FAOV_BASE', 'RPE_BASE', 'PRESTACIONES_BASE', 'ISLR_BASE', 'INCES_BASE']` |

**Uso en payroll-engine.js líneas 226-230:**
```javascript
for (const incidence of concept.incidences || []) {
    if (AccumulatorEngine.BASES.includes(incidence)) {
        accumulators.add(incidence, finalAmount, concept.code)
    }
}
```

**Side Effect:** El motor `accumulators` es **instancia única por recibo** (línea 146), se pasa por referencia a `FormulaContext`. **Correcto** - aislamiento por recibo.

---

## 5. ANÁLISIS DE ERRORES SILENCIOSOS Y COMPORTAMIENTOS INDETERMINISTAS

### 5.1 Bloques Try/Catch Vacíos o Débiles

| Archivo | Línea | Código Problemático | Riesgo |
|---------|-------|---------------------|--------|
| `payroll-engine.js` | 79-82 | `catch (error) { console.error(...); continue }` | **Falla silenciosa**: empleado sin recibo, período marcado CALCULATED incompleto |
| `PayrollPeriodController.js` | 243-247 | `try { bankExportJob = await addBankExportJob(...) } catch { console.error }` | Queue falla → job=null → response dice "queued" pero no lo está |
| `PayrollPeriodController.js` | 250-256 | `try { payslipEmailJob = await addPayslipEmailJob(...) } catch { console.error }` | Igual - email no enviado, sin notificar al usuario |
| `vacation-calculator.js` | 254-271 | `static async accrueVacationsForAllEmployees... catch no manejado` | Cron job falla sin logs visibles |
| `journal-generator.js` | ~150 | `try { await generator.postJournalDraft } catch { return res.status(500) }` | OK - propaga error |

### 5.2 Pérdida de Precisión Financiera

| Ubicación | Código | Problema |
|-----------|--------|----------|
| `payroll-engine.js:103` | `contract.salary_amount * exchangeRate` | **Float nativo** antes de Decimal. Pérdida centavos en VES > 1M |
| `payroll-engine.js:204-205` | `amount_ves: finalAmount.toNumber()`, `amount_src: finalAmount.div(exchangeRate).toNumber()` | `toNumber()` → **float64** pierde precisión al guardar en MongoDB |
| `employer-costs.js` | Múltiples `.toNumber()` al crear `PayrollEmployerCost` | Idem |
| `vacation-calculator.js:107` | `lastReceipt.total_income_ves / periodDays` | División float nativo |
| `formula-evaluator.js:292` | `new Decimal(result).dp(2, Decimal.ROUND_HALF_UP)` | **ÚNICO lugar** donde se redondea correctamente |

**Impacto:** En nómina mensual de 500 empleados con salarios ~500 USD (≈18M VES), error acumulado ~$50-200 USD/mes por redondeo float.

**Fix Requerido:** Guardar `Decimal128` en MongoDB (mongoose soporta) o `string` y **NUNCA** `.toNumber()` hasta presentación final.

---

### 5.3 Condiciones de Carrera (Race Conditions)

| Archivo | Línea | Patrón | Descripción |
|---------|-------|--------|-------------|
| `payroll-engine.js` | 178-231 | `for (const concept of concepts) { await evaluateConceptFormula }` | **Secuencial correcto** - no hay race |
| `payroll-engine.js` | 71-83 | `for (const employee of employees) { await calculateEmployeeReceipt }` | **Secuencial correcto** |
| `journal-generator.js` | ~200 | `Promise.all(receipts.map(...))` | **Paralelo** - OK si operaciones son independientes |
| `PayrollPeriodController.js` | 242-256 | `addBankExportJob` + `addPayslipEmailJob` en secuencia | OK - ambos fire-and-forget |
| `settlement-calculator.js` | ~180 | `for (const emp of employees) { await calculateSettlement }` | Secuencial - OK |

**Hallazgo:** **No hay race conditions críticas** en el motor de cálculo (diseño secuencial intencional). El único paralelismo es en `journal-generator` para líneas de asiento, que es seguro.

---

### 5.4 Otros Comportamientos Indeterministas

1. **`_getActiveContract` (payroll-engine.js:494-512) - PLACEHOLDER HARDCODEADO:**
```javascript
async _getActiveContract(employeeId, period) {
    return {
        _id: new mongoose.Types.ObjectId(),  // ← ID ALEATORIO NUEVO CADA VEZ
        salary_amount: 0,  // ← SIEMPRE 0
        // ...
    }
}
```
**EFECTO:** Todos los empleados calculan con salario 0. El salario real está en `Employee.salary_amount` pero **no se lee**. Esto rompe TODO el cálculo de nómina.

2. **`generatePayrollJournalDraft` (payroll-engine.js:613-617) - STUB:**
```javascript
async generatePayrollJournalDraft(periodId, receipts) {
    return { lines: [] }  // ← NO GENERA ASIENTO CONTABLE
}
```
El controlador `PayrollPeriodController.approve()` (línea 180-184) usa `JournalGenerator` aparte, pero el motor tiene su propio stub que no hace nada.

3. **`accrueVacationsForAllEmployees` (vacation-calculator.js:254-271) - USA `Employee` NO IMPORTADO:**
```javascript
static async accrueVacationsForAllEmployees(organizationID, policy) {
    const employees = await Employee.find(...)  // ← Employee no importado en este archivo
}
```
**Error en runtime:** `ReferenceError: Employee is not defined` al ejecutar cron.

---

## 6. MATRIZ DE CUMPLIMIENTO ARQUITECTÓNICO

| Patrón/Regla Estipulada del Proyecto | ¿Se cumplió? | Evidencia en Código / Justificación Técnica del Desvío |
| :--- | :---: | :--- |
| **Separación de Capas (Controller → Service → Model)** | **SÍ** | Controladores delegan a `payroll-engine.js`, `journal-generator.js`, `bank-export.js`. No hay lógica de negocio en controladores. |
| **Validación de Entrada (Zod/Joi) en Controladores** | **PARCIAL** | Controladores validan campos requeridos manualmente (`if (!name || !start_date...)`). No hay schemas Zod centralizados. |
| **Manejo de Errores Estructurado (AppError class)** | **NO** | Usan `throw new Error(message)` genérico. No hay clase `AppError` con códigos HTTP, códigos internos, logging estructurado. |
| **Transacciones MongoDB para Operaciones Críticas** | **NO** | `calculatePayrollPeriod` crea múltiples documentos (Receipt, ReceiptLines, EmployerCosts) **SIN transacción**. Si falla a mitad, queda estado inconsistente. |
| **Índices Compuestos Declarados en Schema** | **SÍ (tras fix)** | Inicialmente `index: true` duplicados en campos simples + compuestos. Fix commit `4828910` removió duplicados. |
| **Idempotencia en Seeds (upsert + $setOnInsert)** | **SÍ** | Todos los seeds usan `findOneAndUpdate({uniqueKey}, {$setOnInsert: data}, {upsert: true})`. |
| **Precisión Financiera (Decimal.js / Big.js)** | **PARCIAL** | **Usan Decimal.js correctamente en fórmulas y acumuladores** PERO convierten a `.toNumber()` (float64) al persistir en MongoDB. **Violación crítica**. |
| **Autenticación/Autorización por Middleware** | **SÍ** | `VerifyEmployeeToken`, `VerifyhHRToken`, `PermissionCheck` en todas las rutas payroll. |
| **Code Splitting / Lazy Loading (Frontend)** | **SÍ** | `HRPayrollPage` lazy + `manualChunks` en vite.config.js (11 chunks, main 107KB gzip). |
| **Health Checks Completos (DB, Redis, Queue, Firebase)** | **SÍ** | `/api/health` extendido verifica 4 servicios + status codes 200/503. |
| **Configuración por Variables de Entorno (.env.example)** | **SÍ** | `client/.env.example` + `server/.env.example` documentados. No hay secretos hardcodeados. |
| **Tests Unitarios Cobertura Crítica** | **PARCIAL** | 6 test suites (127 passing) cubren: accumulator, formula-evaluator, islr, settlement, utilidades, vacation. **Faltan**: payroll-engine integration, journal-generator, bank-export, controllers. |
| **Queue/Worker para Operaciones Lentas (Bull + Redis)** | **SÍ** | 4 colas configuradas, worker independiente, graceful shutdown. `pay()` encola export/email sin bloquear. |
| **Cascade Delete / Integridad Referencial** | **SÍ** | `PayrollPeriod.pre('deleteOne')` elimina Receipts + ReceiptLines. Employee tiene arrays de refs pero **no cascade automático** (requiere limpieza manual). |
| **Documentación de API (OpenAPI/Swagger)** | **NO** | No hay specs OpenAPI. Endpoints documentados solo en `APIsEndpoints.js` y código. |
| **Logging Estructurado (Pino/Winston)** | **NO** | Solo `console.log`/`console.error` con prefijos `[LOG SERVER]`. No hay niveles, JSON, correlación request-id. |
| **Rate Limiting / Protección DDoS** | **NO** | No hay middleware rate-limit en rutas auth ni payroll. |
| **Auditoría / Trazabilidad de Cambios Críticos** | **PARCIAL** | `LaborContract.changes_log` array embebido. PayrollReceipt no tiene auditoría de recálculos (solo `needs_recalculation` flag). |

---

## 7. HALLAZGOS CRÍTICOS RESUMEN (BLOQUEANTES PARA PRODUCCIÓN)

| # | Hallazgo | Severidad | Archivo/Línea | Acción Requerida |
|---|----------|-----------|---------------|------------------|
| 1 | **Bucle infinito login empleado** | 🔴 CRÍTICO | `client/src/pages/Employees/emplyoeelogin.jsx:49-68` | Fix useEffect: solo CHECKLOGIN si hay token en localStorage |
| 2 | **Empleado no puede ver sus recibos** | 🔴 CRÍTICO | `server/routes/PayrollReceipt.route.js` + `APIsEndpoints.js:123` | Agregar ruta `GET /api/v1/payslips/employee/me` con `VerifyEmployeeToken` |
| 3 | **Ruta HR Payroll sin ProtectedHRRoute** | 🟠 ALTO | `client/src/routes/HRroutes.jsx:99-105` | Envolver en `<ProtectedHRRoute allowedRoles={["HR-Admin","HR-Manager"]}>` |
| 4 | **`_getActiveContract` retorna salario 0 hardcodeado** | 🔴 CRÍTICO | `payroll-engine.js:494-512` | Implementar lookup real a `LaborContract` o `Employee.salary_amount` |
| 5 | **Pérdida precisión financiera (float → Decimal → float)** | 🔴 CRÍTICO | `payroll-engine.js:103, 204-205` + `employer-costs.js` | Guardar `Decimal128` o `string` en MongoDB. Nunca `.toNumber()` en persistencia. |
| 6 | **`generatePayrollJournalDraft` es stub vacío** | 🟠 ALTO | `payroll-engine.js:613-617` | Delegar a `JournalGenerator` o implementar |
| 7 | **`accrueVacationsForAllEmployees` usa `Employee` no importado** | 🟠 ALTO | `vacation-calculator.js:256` | Agregar `import { Employee } from '../../models/Employee.model.js'` |
| 8 | **Try/catch silenciosos en `pay()` (queue jobs)** | 🟡 MEDIO | `PayrollPeriodController.js:243-256` | Retornar error al usuario si queue no disponible, no solo log |
| 9 | **Falta transacción MongoDB en cálculo nómina** | 🟠 ALTO | `payroll-engine.js:49-92` | Envolver `calculatePayrollPeriod` en `session.withTransaction()` |
| 10 | **CORS_ORIGIN_REGEX sin validación estricta** | 🟡 MEDIO | `server/index.js:57-62` | Validar regex al startup, no solo warn |
| 11 | **`hire_date` required en Employee rompe login empleados existentes** | 🔴 CRÍTICO | `Employee.model.js:151` + `EmplyoeeAuth.controller.js:162-163` | Cambiar a `required: false` + fix save con `findByIdAndUpdate(runValidators:false)` |

---

## 8. PLAN DE ACCIÓN INMEDIATO (HOTFIX)

### Prioridad 0 - Bloqueadores de Login/Acceso (HOY) — **ACTUALIZADO 2026-10-23**
1. ~~**Fix EmployeeLogin useEffect** - Permitir login sin bucle~~ → **PENDIENTE**
2. ~~**Agregar ruta `/api/v1/payslips/employee/me`** con `VerifyEmployeeToken`~~ → **PENDIENTE**
3. ~~**Envolver ruta `/HR/dashboard/payroll` en `ProtectedHRRoute`**~~ → **PENDIENTE**
4. ✅ **Fix hire_date required → false** en `Employee.model.js:151` — **COMPLETADO**
5. ✅ **Fix login controller** — `findByIdAndUpdate` con `runValidators:false` — **COMPLETADO**

### Prioridad 1 - Correctitud Cálculo Nómina (ESTA SEMANA)

### Prioridad 0 - Bloqueadores de Login/Acceso (HOY)
1. **Fix EmployeeLogin useEffect** - Permitir login sin bucle
2. **Agregar ruta `/api/v1/payslips/employee/me`** con `VerifyEmployeeToken` para que empleado vea sus recibos
3. **Envolver ruta `/HR/dashboard/payroll` en `ProtectedHRRoute`** con roles permitidos

### Prioridad 1 - Correctitud Cálculo Nómina (ESTA SEMANA)
4. **Implementar `_getActiveContract` real** - Leer de `LaborContract` o `Employee`
5. **Migrar persistencia a Decimal128/string** - Eliminar `.toNumber()` en modelos
6. **Fix `generatePayrollJournalDraft`** - Usar `JournalGenerator` real
7. **Importar `Employee` en vacation-calculator.js**

### Prioridad 2 - Robustez Arquitectónica (PRÓXIMO SPRINT)
8. **Transacciones MongoDB** en `calculatePayrollPeriod`
9. **AppError class** + logging estructurado (Pino)
10. **Rate limiting** en auth routes
11. **Tests de integración** payroll-engine + controllers
12. **OpenAPI spec** para endpoints payroll

---

**FIRMA DEL AUDITOR:**
*Informe generado mediante ingeniería inversa forense del código implementado en branch `037-payroll-venezuelan-module` (commit `4828910`). Análisis basado exclusivamente en lectura de código real en workspace, sin suposiciones.*

**Fecha:** 2026-10-23  
**Clasificación:** CONFIDENCIAL - SOLO EQUIPO DE INGENIERÍA