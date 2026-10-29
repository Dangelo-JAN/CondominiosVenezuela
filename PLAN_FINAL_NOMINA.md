# PLAN FINAL DE FINALIZACIÓN MÓDULO NÓMINA VENEZOLANA — TAREA #037

---

## 1. CONTEXTO Y OBJETIVO

**Rama:** `037-payroll-venezuelan-module` (PR hacia `dev` existente, **no se crea nuevo**)  
**Estado actual:** Fase 7 en curso — 7.1 a 7.5 mayormente completados, 7.5.5 pendiente, hotfixes 7.6 aplicados (hire_date, login controller)  
**Objetivo:** Llevar el módulo a **PRODUCCIÓN REAL** resolviendo **TODOS** los gaps críticos identificados en auditoría forense.

**Fuentes consolidadas:**
- `PLAN_FINALIZACION_NOMINA.md` — Fases A-D secuenciales con STOPs
- `PLAN_FINALIZACION_NOMINA_2.md` — 7.6.1 a 7.6.14 + 7.5.5 con checklist DoD
- `INFORME_NOMINA.md` — 11 hallazgos críticos bloqueantes (Tabla 6)
- `VERIFICACION_INFORME_NOMINA.md` — Confirmación 100% código real + 5 hallazgos adicionales
- `VERIFICACION_ESTADO_NOMINA.md` — 4 violaciones convención rutas, trazabilidad faltante, puntuación 72/100

---

## 2. REGLAS OBLIGATORIAS (AGENTS.md + Bitácora)

| Regla | Descripción |
|-------|-------------|
| **PLAN FIRST** | Este plan DEBE ser aprobado explícitamente antes de escribir código |
| **STOP POR FASE** | Cada sub-fase termina en STOP: mostrar resumen → esperar aprobación |
| **BUILDS OBLIGATORIOS** | Antes de CADA commit: `client: npm run build (0 errores)` + `server: npm test (todas pasan)` |
| **NO NUEVO PR** | Trabajar sobre rama `037-payroll-venezuelan-module` y PR existente hacia `dev` |
| **ROOT CAUSE** | Cada fix ataca causa raíz (ver mapeo auditoría), no síntomas |
| **BITÁCORA VIVA** | Actualizar `.bitacoras/037-payroll-venezuelan-module.md` checks `[x]` en tiempo real |
| **AUTO-MANTENIMIENTO** | Post-fase: ejecutar `self-maintenance.md` si hay cambios arquitectónicos |
| **NUNCA ASUMIR** | Leer código real antes de modificar; `grep`/`read` obligatorio |

---

## 3. MAPA CONSOLIDADO DE TRABAJO (16 ITEMS)

| ID | Hallazgo | Severidad | Fuente | Plan Ref | Archivo Principal |
|----|----------|-----------|--------|----------|-------------------|
| **H01** | Empleado no ve recibos (falta `VerifyEmployeeToken` /me) | 🔴 CRÍTICO | Inf, Ver, Est | A.1 / 7.6.1 | `PayrollReceipt.route.js` |
| **H02** | Ruta HR Payroll sin `ProtectedHRRoute` | 🟠 ALTO | Inf, Ver, Est | A.2 / 7.6.2 | `HRroutes.jsx` |
| **H03** | `_getActiveContract` retorna salario 0 hardcodeado | 🔴 CRÍTICO | Inf, Ver, Est | B.1 / 7.6.3 | `payroll-engine.js:494` |
| **H04** | Pérdida precisión financiera (`.toNumber()` en persistencia) | 🔴 CRÍTICO | Inf, Ver, Est | B.2 / 7.6.4 | Modelos + 6 servicios |
| **H05** | `generatePayrollJournalDraft` stub vacío | 🟠 ALTO | Inf, Ver, Est | B.3 / 7.6.5 | `payroll-engine.js:613` |
| **H06** | `accrueVacationsForAllEmployees` usa `Employee` no importado | 🟠 ALTO | Inf, Ver, Est | B.4 / 7.6.6 | `vacation-calculator.js` |
| **H07** | Falta transacción MongoDB en `calculatePayrollPeriod` | 🟠 ALTO | Inf, Ver, Est | C.1 / 7.6.7 | `payroll-engine.js:49` |
| **H08** | `evalFormula` usa `Function()` constructor (eval inseguro) | 🟠 ALTO | Inf, Ver, Est | B.5 / 7.6.8 | `employer-costs.js:202` |
| **H09** | `_getAttendanceSummary` retorna ceros hardcodeados | 🟠 ALTO | Inf, Ver, Est | B.6 / 7.6.9 | `payroll-engine.js:554` |
| **H10** | `VacationBalance.organizationID = employeeId` (bug copy-paste) | 🟡 MEDIO | Inf, Ver, Est | B.7 / 7.6.10 | `vacation-calculator.js:239` |
| **H11** | `PayrollReceiptLine.amount_src` usa exchange rate período | 🟡 MEDIO | Inf, Ver, Est | B.8 / 7.6.11 | `payroll-engine.js:205` + modelo |
| **H12** | `_decimalizeVariables` convierte Decimal→Number antes eval | 🟠 ALTO | Ver, Est | — / 7.6.12 | `formula-evaluator.js` |
| **H13** | Try/catch silenciosos en `pay()` — mejorar notificación | 🟡 MEDIO | Inf, Ver, Est | — / 7.6.13 | `PayrollPeriodController.js:242` |
| **H14** | CORS_ORIGIN_REGEX sin validación estricta al startup | 🟡 MEDIO | Inf, Ver, Est | — / 7.6.14 | `server/index.js:48` |
| **H15** | **Violación convención rutas**: `router.use(VerifyhHRToken)` en TODO | 🔴 CRÍTICO | Est | A.1 / 7.6.1 | `PayrollReceipt.route.js:8` |
| **H16** | Deploy staging test (7.5.5) | 🟢 BAJO | Bit, Plan | D / 7.5.5 | Vercel + Render |

> **Leyenda:** Inf=`INFORME_NOMINA.md`, Ver=`VERIFICACION_INFORME_NOMINA.md`, Est=`VERIFICACION_ESTADO_NOMINA.md`, Bit=`.bitacoras/037...`

---

## 4. PLAN DE EJECUCIÓN SECUENCIAL (4 FASES CON STOPS)

### FASE A: BLOQUEADORES LOGIN/ACCESO/CONVENCIÓN (PRIORIDAD 0) — **HOY**

| Paso | Acción | Archivos | Validación (DoD) |
|------|--------|----------|-------------------|
| **A.1** | **Corregir convención rutas**: Separar rutas HR vs Employee en `PayrollReceipt.route.js`<br>• Quitar `router.use(VerifyhHRToken)` global<br>• Rutas HR: `VerifyhHRToken` + `PermissionCheck`<br>• Nueva ruta Employee: `GET /employee/me` con `VerifyEmployeeToken` | `server/routes/PayrollReceipt.route.js`<br>`server/controllers/PayrollReceiptController.js` (agregar `getMyReceipts`) | `curl -H "Authorization: Bearer <EMtoken>" /api/v1/payslips/employee/me` → 200 + recibos propios |
| **A.2** | Frontend: cambiar `RECEIPTS_GET_EMPLOYEE` a `/employee/me` | `client/src/redux/apis/APIsEndpoints.js:123` | Build client 0 errores |
| **A.3** | Envolver `/HR/dashboard/payroll` en `ProtectedHRRoute allowedRoles={["HR-Admin","HR-Manager"]}` | `client/src/routes/HRroutes.jsx:98` | HR-Viewer ve redirect; HR-Admin accede; `npm run build` OK |

**STOP A** → Usuario valida: login empleado funciona, ve sus recibos vía `/me`, HR accede a nómina con permisos.

---

### FASE B: CORRECTITUD CÁLCULO NÓMINA (PRIORIDAD 1) — **ESTA SEMANA**

| Paso | Acción | Archivos | Validación (DoD) |
|------|--------|----------|-------------------|
| **B.1** | Implementar `_getActiveContract` real:<br>1. Buscar `LaborContract` activo (`is_active=true`, fechas vigentes)<br>2. Fallback: `Employee.salary_amount` + `active_contract`<br>3. Retornar objeto completo con `salary_amount`, `currency`, `frequency`, `includes_cestaticket` | `server/services/payroll/payroll-engine.js:494-512` | Cálculo usa salario real ≠ 0; tests unitarios pasan |
| **B.2** | **Migrar persistencia a Decimal128** (eliminar TODOS `.toNumber()` al guardar):<br>• Modelos: `PayrollReceipt` (4 campos), `PayrollReceiptLine` (2), `PayrollEmployerCost` (1), `VacationPayment` (2)<br>• Servicios: `payroll-engine.js`, `employer-costs.js`, `vacation-calculator.js`, `settlement-calculator.js`, `utilidades-calculator.js`, `islr-calculator.js`<br>• Solo `.toNumber()` en **capa presentación** (API response) | 4 modelos + 6 servicios | `npm test` payroll: 66 passing; BD guarda `Decimal128`; precisión centavos VES > 1M |
| **B.3** | Fix `generatePayrollJournalDraft`: delegar a `JournalGenerator` y eliminar stub | `server/services/payroll/payroll-engine.js:613-617` | `approve` genera asiento; validación double-entry pasa |
| **B.4** | Importar `Employee` en `vacation-calculator.js` | `vacation-calculator.js:1-5` | Cron `accrueVacationsForAllEmployees` sin `ReferenceError` |
| **B.5** | Reemplazar `evalFormula` (`Function()`) por `FormulaEvaluator.safeEval()` | `server/services/payroll/employer-costs.js:202-212` | No hay `Function()` en código; tests pasan |
| **B.6** | Implementar `_getAttendanceSummary` real desde `attendance.attendancelog`:<br>`holidays_worked`, `rest_days_worked`, `sundays_worked`, `reposo_33_days`, `reposo_full_days`, `overtime_*` | `server/services/payroll/payroll-engine.js:554-607` | Conceptos dependientes (horas extra, feriados, dominigos) calculan |
| **B.7** | Fix `VacationBalance.organizationID = employee.organizationID` | `vacation-calculator.js:239` | Balance creado con orgID correcto |
| **B.8** | Fix `PayrollReceiptLine.amount_src` por concepto:<br>1. Agregar `currency_code` ('VES'\|'USD') al modelo<br>2. Si USD → `amount_src = finalAmount`; si VES → `finalAmount / exchangeRate` | `payroll-engine.js:205`<br>`PayrollReceiptLine.model.js` | Cestaticket USD guarda correcto |

**STOP B** → Usuario valida: cálculo nómina montos correctos (caso conocido), precisión centavos, journal draft genera asiento, tests 66 passing.

---

### FASE C: ROBUSTEZ ARQUITECTÓNICA (PRIORIDAD 2) — **PRÓXIMO SPRINT**

| Paso | Acción | Archivos | Validación (DoD) |
|------|--------|----------|-------------------|
| **C.1** | Transacción MongoDB en `calculatePayrollPeriod`: `session.withTransaction()` envolviendo receipt + lines + employerCosts + employee.push | `payroll-engine.js:49-92` | Fallo a mitad → rollback; período no queda `CALCULATING` |
| **C.2** | Crear `AppError` class (HTTP codes, internal codes, metadata) + migrar `throw new Error()` | `server/utils/AppError.js`, controladores, servicios | Errores estructurados; logs con request-id |
| **C.3** | Integrar Pino logger (JSON, niveles, request-id correlation) | `server/config/logger.js`, `server/index.js`, controladores | `docker logs` → JSON parsable; correlation-id |
| **C.4** | Rate limiting: `express-rate-limit` en `/api/auth/*` (10 req/min) + `/api/v1/payroll-*` (100 req/min) | `server/middlewares/rateLimit.js`, `server/index.js` | 429 response correcto |
| **C.5** | Tests integración: `payroll-engine.test.js` (calculate→approve→pay→close) + controllers tests | `server/tests/payroll/`, `server/tests/controllers/` | Coverage >80% payroll; suites nuevas passing |
| **C.6** | OpenAPI 3.0 spec: `swagger.yaml` + `swagger-ui-express` en `/api/docs` | `server/docs/swagger.yaml` | `/api/docs` muestra spec completa payroll |
| **C.7** | Fix `_decimalizeVariables`: mantener `Decimal` instances, no convertir a Number | `formula-evaluator.js` | Tests `formula-evaluator.test.js` pasan; precisión mantenida |

**STOP C** → Usuario valida: transacciones atómicas, errores trazables, rate limiting, docs OpenAPI, coverage >80%.

---

### FASE D: DEPLOY STAGING + CIERRE (7.5.5) — **FINAL**

| Paso | Acción | Validación (DoD) |
|------|--------|-------------------|
| **D.1** | Push rama → Render (backend) + Vercel (frontend) con vars actualizadas | `/api/health` → 200 OK (DB, Redis, Queues, Firebase) |
| **D.2** | Seed idempotente en staging: `npm run seed:payroll` | Datos base sin duplicados |
| **D.3** | E2E manual: HR crea período → calcula → aprueba → paga → cierra; Empleado login → ve recibos | Flujo completo sin 500; montos VES correctos |
| **D.4** | Verificar CORS: frontend Vercel llama backend Render sin errores | Network tab → 200 en login, check-login, payroll |
| **D.5** | Merge a `dev` via PR existente (no crear nuevo) | CI/CD pasa; `dev` deploy OK |
| **D.6** | Actualizar bitácoras (`index.md` + `actual.md`) + auto-mantenimiento | Checks `[x]` 100%; `self-maintenance.md` ejecutado |

**STOP D (FINAL)** → Usuario aprueba: módulo en staging funcional → merge a `dev`.

---

## 5. CRITERIOS GLOBALES "DONE" (TAREA #037 CERRADA)

- [ ] H01: Empleado ve recibos vía `/me` con `VerifyEmployeeToken`
- [ ] H02: HR accede nómina con `ProtectedHRRoute` + permisos
- [ ] H03: Cálculo usa salario real (`_getActiveContract` funcional)
- [ ] H04: Precisión centavos preservada (Decimal128, sin `.toNumber()` persistencia)
- [ ] H05: Journal draft genera asiento válido (double-entry)
- [ ] H06: Cron jobs sin `ReferenceError` (Employee importado)
- [ ] H07: Transacciones atómicas en cálculo
- [ ] H08: Sin código inseguro (`Function()`, `eval`)
- [ ] H09: Attendance summary real (no ceros)
- [ ] H10: VacationBalance orgID correcto
- [ ] H11: amount_src por currency_code correcto
- [ ] H12: `_decimalizeVariables` mantiene Decimal
- [ ] H13: Queue errors notifican + endpoint retry
- [ ] H14: CORS regex valida estricta al startup (exit 1)
- [ ] H15: Convención rutas respetada (HR vs Employee separados)
- [ ] H16: Staging E2E válido + merge a `dev` via PR existente
- [ ] Bitácora `#037` 100% `[x]` + `actual.md` limpio

---

## 6. CRONOGRAMA ESTIMADO

| Día | Fase | Entregable |
|-----|------|------------|
| 1 | A | Login/Acceso/Convención funcionando |
| 2-3 | B | Cálculo nómina correcto + tests 66 passing |
| 4-5 | C | Arquitectura robusta + docs OpenAPI |
| 6 | D | Staging E2E + merge a `dev` |

---

## 7. APROBACIÓN REQUERIDA

> **Este plan DEBE ser aprobado explícitamente** antes de iniciar Fase A.1.

Responder **"APROBADO FASE A"** para comenzar, o indicar modificaciones.

---

**FIRMA DEL PLAN**  
Generado 2026-10-23 consolidando 5 fuentes de auditoría forense.  
Cumple AGENTS.md, arquitectura MERN, Design System, Git Workflow, Bitácora #037.