# PLAN DE FINALIZACIÓN MÓDULO NÓMINA VENEZOLANA — TAREA #037

---

## 1. CONTEXTO Y OBJETIVO

**Rama:** `037-payroll-venezuelan-module` (PR hacia `dev` existente, no se crea nuevo)  
**Estado actual:** Fase 7 iniciada — 7.1 a 7.5 mayormente completados, 7.5.5 pendiente, hotfixes 7.6 aplicados  
**Objetivo:** Llevar el módulo a **PRODUCCIÓN REAL** resolviendo TODOS los gaps críticos identificados en auditoría forense (INFORME_NOMINA.md + VERIFICACION_INFORME_NOMINA.md).

**Reglas obligatorias (AGENTS.md):**
- Build `client`: `npm run build` → 0 errores
- Build `server`: `npm run test` → todas las suites pasan
- Cada fase termina en STOP → aprobación explícita del usuario
- Commits atómicos, mensaje convencional, push a `037-payroll-venezuelan-module`
- NUNCA trabajar directo en `main` ni `dev`

---

## 2. MAPA DE TRABAJO RESTANTE (CONSOLIDADO DE AMBOS INFORMES)

| # | Hallazgo | Severidad | Archivo/Línea | Estado |
|---|----------|-----------|---------------|--------|
| **P0-1** | Empleado no ve sus recibos (falta ruta `VerifyEmployeeToken`) | 🔴 CRÍTICO | `server/routes/PayrollReceipt.route.js` + `APIsEndpoints.js:123` | ⬜ PENDIENTE |
| **P0-2** | Ruta HR Payroll sin `ProtectedHRRoute` | 🟠 ALTO | `client/src/routes/HRroutes.jsx:99-105` | ⬜ PENDIENTE |
| **P1-1** | `_getActiveContract` retorna salario 0 hardcodeado | 🔴 CRÍTICO | `payroll-engine.js:494-512` | ⬜ PENDIENTE |
| **P1-2** | Pérdida precisión financiera (`.toNumber()` en persistencia) | 🔴 CRÍTICO | Múltiples: `payroll-engine.js`, `employer-costs.js`, `vacation-calculator.js` | ⬜ PENDIENTE |
| **P1-3** | `generatePayrollJournalDraft` es stub vacío | 🟠 ALTO | `payroll-engine.js:613-617` | ⬜ PENDIENTE |
| **P1-4** | `accrueVacationsForAllEmployees` usa `Employee` no importado | 🟠 ALTO | `vacation-calculator.js:256` | ⬜ PENDIENTE |
| **P1-5** | `evalFormula` usa `Function()` constructor (eval inseguro) | 🟠 ALTO | `employer-costs.js:202-212` | ⬜ PENDIENTE |
| **P1-6** | `_getAttendanceSummary` retorna ceros hardcodeados | 🟠 ALTO | `payroll-engine.js:554-607` | ⬜ PENDIENTE |
| **P1-7** | `VacationBalance.organizationID = employeeId` (bug copy-paste) | 🟡 MEDIO | `vacation-calculator.js:239` | ⬜ PENDIENTE |
| **P1-8** | `PayrollReceiptLine.amount_src` usa exchange rate del período | 🟡 MEDIO | `payroll-engine.js:205` | ⬜ PENDIENTE |
| **P2-1** | Falta transacción MongoDB en `calculatePayrollPeriod` | 🟠 ALTO | `payroll-engine.js:49-92` | ⬜ PENDIENTE |
| **P2-2** | AppError class + logging estructurado (Pino) | 🟡 MEDIO | Arquitectura transversal | ⬜ PENDIENTE |
| **P2-3** | Rate limiting en auth routes | 🟡 MEDIO | `server/index.js` + middlewares | ⬜ PENDIENTE |
| **P2-4** | Tests integración payroll-engine + controllers | 🟡 MEDIO | `server/tests/payroll/` | ⬜ PENDIENTE |
| **P2-5** | OpenAPI spec para endpoints payroll | 🟡 MEDIO | Documentación | ⬜ PENDIENTE |
| **P2-6** | Deploy staging test (7.5.5) | 🟢 BAJO | Vercel + Render | ⬜ PENDIENTE |

---

## 3. PLAN POR FASES (SECUENCIAL, CON STOPS)

### FASE A: BLOQUEADORES LOGIN/ACCESO (PRIORIDAD 0) — **HOY**

| Paso | Acción | Archivos | Validación |
|------|--------|----------|------------|
| A.1 | Agregar ruta `GET /api/v1/payslips/employee/me` protegida con `VerifyEmployeeToken` en `PayrollReceiptController.getMyReceipts` | `server/routes/PayrollReceipt.route.js`, `server/controllers/PayrollReceiptController.js` | `curl` con token empleado devuelve 200 + recibos |
| A.2 | Envolver ruta `/HR/dashboard/payroll` en `ProtectedHRRoute` con `allowedRoles={["HR-Admin","HR-Manager"]}` | `client/src/routes/HRroutes.jsx` | HR-Viewer ve redirect; HR-Admin/Manager accede; `npm run build` OK |

**STOP A** → Usuario valida: login empleado funciona, ve sus recibos, HR accede a nómina con permisos.

---

### FASE B: CORRECTITUD CÁLCULO NÓMINA (PRIORIDAD 1) — **ESTA SEMANA**

| Paso | Acción | Archivos | Validación |
|------|--------|----------|------------|
| B.1 | Implementar `_getActiveContract` real: buscar `LaborContract` activo (`is_active=true`, fechas vigentes) → fallback `Employee.salary_amount` + datos contractuales | `server/services/payroll/payroll-engine.js:494-512` | Cálculo nómina usa salario real; tests unitarios pasan |
| B.2 | Migrar persistencia a `Decimal128` (mongoose) o `string`: eliminar **TODOS** los `.toNumber()` al guardar montos; solo `toNumber()` en presentación final (API response) | Modelos: `PayrollReceiptLine`, `PayrollEmployerCost`, `VacationBalance`, `PayrollReceipt` + servicios: `payroll-engine.js`, `employer-costs.js`, `vacation-calculator.js`, `settlement-calculator.js`, `utilidades-calculator.js`, `islr-calculator.js` | `npm run test` payroll: 66 passing; montos en BD son `Decimal128`/`string` |
| B.3 | Fix `generatePayrollJournalDraft`: delegar a `JournalGenerator` (ya implementado en controller approve) y eliminar stub | `server/services/payroll/payroll-engine.js:613-617` | `approve` genera asiento correcto; validación double-entry pasa |
| B.4 | Importar `Employee` en `vacation-calculator.js` línea 1-5 | `server/services/payroll/vacation-calculator.js` | Cron `accrueVacationsForAllEmployees` ejecuta sin ReferenceError |
| B.5 | Reemplazar `evalFormula` (`Function()` constructor) por evaluador seguro (reutilizar `safeEval` de `formula-evaluator.js`) | `server/services/payroll/employer-costs.js:202-212` | No hay `Function()` en código; tests pasan |
| B.6 | Implementar `_getAttendanceSummary` real: calcular `holidays_worked`, `rest_days_worked`, `sundays_worked`, `reposo_33_days`, `reposo_full_days` desde `Attendance` logs | `server/services/payroll/payroll-engine.js:554-607` | Conceptos dependientes (horas extra, feriados, dominigos) calculan correctamente |
| B.7 | Fix `VacationBalance.organizationID`: usar `employee.organizationID` (no `employeeId`) | `server/services/payroll/vacation-calculator.js:239` | Balance creado con orgID correcto |
| B.8 | Fix `PayrollReceiptLine.amount_src`: agregar `currency_code` por línea; si concepto en USD, no dividir por exchange rate del período | `server/services/payroll/payroll-engine.js:205`, modelo `PayrollReceiptLine.model.js` | Cestaticket y conceptos USD guardan amount_src correcto |

**STOP B** → Usuario valida: cálculo nómina produce montos correctos (validar contra caso conocido), precisión centavos preservada, journal draft genera asiento, tests pasan.

---

### FASE C: ROBUSTEZ ARQUITECTÓNICA (PRIORIDAD 2) — **PRÓXIMO SPRINT**

| Paso | Acción | Archivos | Validación |
|------|--------|----------|------------|
| C.1 | Envolver `calculatePayrollPeriod` en `session.withTransaction()`: atomicidad receipt + lines + employerCosts + employee.push | `server/services/payroll/payroll-engine.js:49-92` | Fallo a mitad → rollback completo; período no queda `CALCULATING` |
| C.2 | Crear `AppError` class (códigos HTTP, códigos internos, metadata) + migrar todos los `throw new Error()` | `server/utils/AppError.js`, controladores, servicios | Errores estructurados; logs con request-id |
| C.3 | Integrar Pino logger (JSON, niveles, request-id correlation) reemplazar `console.log/error` | `server/config/logger.js`, `server/index.js`, controladores | `docker logs` → JSON parsable; correlation-id en requests |
| C.4 | Rate limiting: `express-rate-limit` en `/api/auth/*` (login, signup, check-login) + `/api/v1/payroll-*` | `server/middlewares/rateLimit.js`, `server/index.js` | 10 req/min login; 100 req/min payroll; 429 response |
| C.5 | Tests integración: `payroll-engine.test.js` (calculate→approve→pay→close), controllers tests | `server/tests/payroll/payroll-engine.test.js`, `server/tests/controllers/` | `npm test` → suites nuevas passing; coverage >80% payroll |
| C.6 | OpenAPI 3.0 spec: generar `swagger.yaml` desde rutas + JSDoc; servir en `/api/docs` | `server/docs/swagger.yaml`, `swagger-ui-express` | `/api/docs` muestra spec completa payroll |

**STOP C** → Usuario valida: transacciones atómicas, errores trazables, rate limiting activo, docs OpenAPI accesibles, coverage >80%.

---

### FASE D: DEPLOY STAGING + VALIDACIÓN FINAL (7.5.5) — **CIERRE**

| Paso | Acción | Validación |
|------|--------|------------|
| D.1 | Push rama → Render (backend) + Vercel (frontend) con vars de entorno actualizadas | Health check `/api/health` → 200 OK (DB, Redis, Queues, Firebase) |
| D.2 | Ejecutar seed idempotente en staging: `npm run seed:payroll` | Datos base cargados sin duplicados |
| D.3 | Prueba E2E manual: HR crea período → calcula → aprueba → paga → cierra; Empleado login → ve recibo | Flujo completo sin errores 500; montos correctos en VES |
| D.4 | Verificar CORS: frontend Vercel llama backend Render sin errores | Network tab → 200 en login, check-login, payroll endpoints |
| D.5 | Merge a `dev` via PR existente (no crear nuevo) | CI/CD pasa; `dev` deploy OK |

**STOP D (FINAL)** → Usuario aprueba: módulo en staging funcional → merge a `dev`.

---

## 4. REGLAS DE EJECUCIÓN OBLIGATORIAS

1. **Una fase a la vez** — No iniciar B sin STOP A aprobado.
2. **Build antes de commit** — `npm run build` (client) + `npm test` (server/payroll) **0 errores**.
3. **Commits atómicos** — Un commit por paso lógico (A.1, A.2, A.3, B.1…).
4. **Bitácora viva** — Actualizar `.bitacoras/037-payroll-venezuelan-module.md` checks `[x]` tras cada paso completado.
5. **Auto-mantenimiento post-fase** — Ejecutar `self-maintenance.md` si hay cambios arquitectónicos (nuevos patrones, archivos, configs).
6. **Nunca asumir** — Leer código real antes de modificar; `grep`/`read` obligatorio.

---

## 5. CRITERIOS DE "DONE" GLOBAL (PARA CERRAR TAREA #037)

- [ ] Login empleado sin bucle infinito (P0-1)
- [ ] Empleado ve sus recibos vía API propia (P0-2)
- [ ] HR accede a nómina con permisos (P0-3)
- [ ] Cálculo nómina usa salario real + precisión centavos (P1-1, P1-2)
- [ ] Journal draft genera asiento contable válido (P1-3)
- [ ] Cron jobs ejecutan sin errores (P1-4, P1-6)
- [ ] No código inseguro (`Function()`, eval) (P1-5)
- [ ] Bugs menores datos corregidos (P1-7, P1-8)
- [ ] Transacciones atómicas en cálculo (P2-1)
- [ ] Errores estructurados + logging JSON (P2-2)
- [ ] Rate limiting activo (P2-3)
- [ ] Tests integración + coverage >80% (P2-4)
- [ ] OpenAPI spec publicada (P2-5)
- [ ] Staging deploy validado E2E (P2-6 / 7.5.5)
- [ ] Bitácora #037 actualizada 100% `[x]`
- [ ] Merge a `dev` via PR existente

---

## 6. ORDEN DE EJECUCIÓN RECOMENDADO (CRONOGRAMA)

| Día | Fase | Entregable |
|-----|------|------------|
| 1 | A | Login/Acceso funcionando en staging |
| 2-3 | B | Cálculo nómina correcto + tests passing |
| 4-5 | C | Arquitectura robusta + docs |
| 6 | D | Staging E2E + merge a `dev` |

---

**FIRMA DEL PLAN**  
Generado 2026-10-23 basado en auditoría forense completa (INFORME_NOMINA.md + VERIFICACION_INFORME_NOMINA.md).  
Cumple reglas AGENTS.md, arquitectura MERN del proyecto, Design System, Git Workflow.