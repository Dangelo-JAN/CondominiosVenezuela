# PLAN FINALIZACIÓN NÓMINA VENEZOLANA — PASO A PASO PARA COMPLETAR TAREA #037

**Fecha:** 2026-10-23  
**Basado en:** `.bitacoras/037-payroll-venezuelan-module.md` + `INFORME_NOMINA.md` + `VERIFICACION_INFORME_NOMINA.md`  
**Regla suprema:** PLAN FIRST — Este plan DEBE ser aprobado antes de escribir UNA sola línea de código.

---

## 🎯 OBJETIVO

Llevar el módulo de nómina venezolana a **PRODUCCIÓN REAL** resolviendo:
1. Lo pendiente en la bitácora (7.5.5 Deploy staging test)
2. **TODOS los hallazgos CRÍTICOS y ALTOS** del informe de auditoría forense confirmados en `VERIFICACION_INFORME_NOMINA.md` que **NO están en la bitácora**

---

## 📋 MAPEO DE GAPS: BITÁCORA vs AUDITORÍA FORENSE

| Hallazgo Crítico (Auditoría) | ¿En Bitácora Fase 7? | Acción Requerida |
|-----------------------------|---------------------|------------------|
| 1. Empleado no ve sus recibos (falta ruta `VerifyEmployeeToken`) | ❌ NO | **NUEVA: 7.6.1** |
| 2. Ruta `/HR/dashboard/payroll` sin `ProtectedHRRoute` | ❌ NO | **NUEVA: 7.6.2** |
| 3. `_getActiveContract` retorna salario 0 hardcodeado | ❌ NO | **NUEVA: 7.6.3** |
| 4. Pérdida precisión financiera (`.toNumber()` en persistencia) | ❌ NO | **NUEVA: 7.6.4** |
| 5. `generatePayrollJournalDraft` es stub vacío | ❌ NO | **NUEVA: 7.6.5** |
| 6. `accrueVacationsForAllEmployees` usa `Employee` no importado | ❌ NO | **NUEVA: 7.6.6** |
| 7. Falta transacción MongoDB en `calculatePayrollPeriod` | ❌ NO | **NUEVA: 7.6.7** |
| 8. `evalFormula` usa `Function()` constructor (eval inseguro) | ❌ NO | **NUEVA: 7.6.8** |
| 9. `_getAttendanceSummary` retorna datos hardcodeados (ceros) | ❌ NO | **NUEVA: 7.6.9** |
| 10. `VacationBalance.organizationID` usa `employeeId` (bug copy-paste) | ❌ NO | **NUEVA: 7.6.10** |
| 11. `PayrollReceiptLine.amount_src` usa exchange rate del período | ❌ NO | **NUEVA: 7.6.11** |
| 12. `formula-evaluator._decimalizeVariables` convierte Decimal→Number antes de eval | ❌ NO | **NUEVA: 7.6.12** |
| 13. Try/catch silenciosos en `pay()` — mejorar notificación | Parcial (7.1.3/7.1.4) | **MEJORAR: 7.6.13** |
| 14. CORS_ORIGIN_REGEX sin validación estricta al startup | ❌ NO | **NUEVA: 7.6.14** |
| 15. Índices compuestos — verificar creación en Atlas | 7.5.4 ✅ | Verificar 7.5.4 completo |
| 16. **7.5.5 Deploy staging test** | ❌ PENDIENTE | **EXISTENTE: 7.5.5** |

---

## 🚦 FASE 7.6: HOTFIXES CRÍTICOS DE AUDITORÍA (NUEVA — Bloqueadores para Producción)

> **Orden de ejecución obligatorio:** Los items 1-3 son **PRIORIDAD 0 (HOY)** — bloquean login/acceso/cálculo.  
> Items 4-12 son **PRIORIDAD 1 (ESTA SEMANA)** — correctitud financiera y funcional.  
> Items 13-14 son **PRIORIDAD 2 (PRÓXIMO SPRINT)** — robustez.

### 7.6.1 — Agregar Ruta Empleado: `GET /api/v1/payslips/employee/me`
- **Archivos:** `server/routes/PayrollReceipt.route.js`, `server/controllers/PayrollReceiptController.js`
- **Acción:** Crear endpoint con `VerifyEmployeeToken` que retorne recibos del empleado autenticado
- **Validación:** Frontend `RECEIPTS_GET_EMPLOYEE` ya apunta a `/api/v1/payslips/employee/${employeeId}` → cambiar a `/me` o agregar ambas
- **Esfuerzo:** 15 min

### 7.6.2 — Envolver Ruta HR Payroll en `ProtectedHRRoute`
- **Archivo:** `client/src/routes/HRroutes.jsx` (líneas 98-105)
- **Acción:** Cambiar `<Suspense><HRPayrollPage /></Suspense>` por `<ProtectedHRRoute allowedRoles={["HR-Admin","HR-Manager"]}><Suspense><HRPayrollPage /></Suspense></ProtectedHRRoute>`
- **Validación:** Comparar con ruta `hr-profiles` (líneas 79-85) que SÍ usa `ProtectedHRRoute`
- **Esfuerzo:** 2 min

### 7.6.3 — Implementar `_getActiveContract` Real
- **Archivo:** `server/services/payroll/payroll-engine.js` (líneas 494-512)
- **Acción:** Reemplazar stub hardcodeado por lookup real:
  1. Buscar `LaborContract` activo para `employeeId` donde `start_date <= period.end_date` y (`end_date` null o `>= period.start_date`)
  2. Fallback: `Employee.salary_amount` + `Employee.active_contract` (campos embebidos)
  3. Retornar objeto con `salary_amount`, `salary_currency`, `payment_frequency`, `includes_cestaticket`, `exchange_rate` del contrato
- **Validación:** Cálculo nómina debe usar salario real, no 0
- **Esfuerzo:** 30 min

### 7.6.4 — Migrar Persistencia a Decimal128 / String (Eliminar `.toNumber()`)
- **Archivos:** 
  - `server/models/payroll/PayrollReceipt.model.js` (total_income_ves, total_deductions_ves, total_employer_cost_ves, net_pay_ves)
  - `server/models/payroll/PayrollReceiptLine.model.js` (amount_ves, amount_src)
  - `server/models/payroll/PayrollEmployerCost.model.js` (amount_ves)
  - `server/models/payroll/VacationPayment.model.js` (daily_salary_ves, total_amount_ves)
  - `server/services/payroll/payroll-engine.js` (líneas 103, 204-205, 255-258)
  - `server/services/payroll/employer-costs.js` (múltiples líneas)
  - `server/services/payroll/vacation-calculator.js` (líneas 107, 238, 245)
- **Acción:** Cambiar tipo Mongoose de `Number` a `mongoose.Schema.Types.Decimal128` (preferido) o `String`. En servicios: **NUNCA** `.toNumber()` al persistir — guardar `Decimal128.fromString(finalAmount.toFixed(2))` o `finalAmount.toString()`. Solo `.toNumber()` en **capa de presentación** (API response, PDF, Excel).
- **Validación:** Tests unitarios existentes deben pasar (ajustar assertions). Verificar precisión en VES > 1M.
- **Esfuerzo:** 4-6h (cambio transversal)

### 7.6.5 — Fix `generatePayrollJournalDraft` → Delegar a `JournalGenerator`
- **Archivo:** `server/services/payroll/payroll-engine.js` (líneas 613-617)
- **Acción:** 
```javascript
async generatePayrollJournalDraft(periodId, receipts) {
    const { JournalGenerator } = await import('./journal-generator.js')
    const generator = new JournalGenerator(this.organizationID)
    await generator.initialize()
    const period = await PayrollPeriod.findById(periodId).lean()
    return await generator.generatePayrollJournalDraft(period, receipts)
}
```
- **Validación:** `PayrollPeriodController.approve()` ya usa `JournalGenerator` directo — este fix unifica API del motor.
- **Esfuerzo:** 15 min

### 7.6.6 — Importar `Employee` en `vacation-calculator.js`
- **Archivo:** `server/services/payroll/vacation-calculator.js` (líneas 1-5)
- **Acción:** Agregar `import { Employee } from '../../models/Employee.model.js'`
- **Validación:** Cron job `accrueVacationsForAllEmployees` no debe lanzar `ReferenceError`
- **Esfuerzo:** 1 min

### 7.6.7 — Transacción MongoDB en `calculatePayrollPeriod`
- **Archivo:** `server/services/payroll/payroll-engine.js` (líneas 49-92)
- **Acción:** Envolver toda la secuencia en `session.withTransaction()`:
  1. `const session = await mongoose.startSession()`
  2. `await session.withTransaction(async () => { ... toda la lógica actual ... })`
  3. Todas las operaciones `create`, `findByIdAndUpdate`, `findOneAndUpdate` deben recibir `{ session }`
  4. Si falla → rollback automático, período NO queda en `CALCULATING` ni `CALCULATED` parcial
- **Validación:** Simular fallo a mitad (kill -9) → verificar estado consistente
- **Esfuerzo:** 2h

### 7.6.8 — Fix `evalFormula` en `employer-costs.js` (Reemplazar `Function()` constructor)
- **Archivo:** `server/services/payroll/employer-costs.js` (líneas 202-212)
- **Acción:** Usar `FormulaEvaluator.safeEval()` existente (ya valida AST, sandbox) en lugar de `Function('return ' + expr)()`
- **Código actual peligroso:**
```javascript
return Function('"use strict"; return (' + expr + ')')()
```
- **Fix:** 
```javascript
import { FormulaEvaluator } from './formula-evaluator.js'
return FormulaEvaluator.safeEval(expr, variables)
```
- **Validación:** Tests de employer-costs deben pasar. No inyección de código posible.
- **Esfuerzo:** 30 min

### 7.6.9 — Implementar `_getAttendanceSummary` Real (No Hardcodeados)
- **Archivo:** `server/services/payroll/payroll-engine.js` (líneas 554-607)
- **Acción:** Calcular realmente desde `attendance.attendancelog`:
  - `holidays_worked`: días feriado con registro de entrada
  - `rest_days_worked`: días descanso semanal trabajados
  - `sundays_worked`: domingos trabajados
  - `reposo_33_days` / `reposo_full_days`: según LOTTT Art. 187
  - `overtime_day_hours` / `overtime_night_hours`: ya tiene lógica simplificada, completar
- **Validación:** Recibos de nómina reflejan horas extra, trabajo en feriado, reposo compensado
- **Esfuerzo:** 2-3h

### 7.6.10 — Fix `VacationBalance.organizationID` Bug Copy-Paste
- **Archivo:** `server/services/payroll/vacation-calculator.js` (línea 239)
- **Acción:** Cambiar `organizationID: employeeId` por `organizationID: employee.organizationID` (obtener del employee poblado)
- **Validación:** `VacationBalance` se crea con `organizationID` correcto
- **Esfuerzo:** 2 min

### 7.6.11 — Fix `PayrollReceiptLine.amount_src` Exchange Rate por Concepto
- **Archivo:** `server/services/payroll/payroll-engine.js` (línea 205)
- **Acción:** 
  1. Agregar campo `currency_code` a `PayrollReceiptLine` (modelo + línea)
  2. En cálculo: si concepto es `USD` (cestaticket, salario base USD), `amount_src = finalAmount`; si `VES`, `amount_src = finalAmount / exchangeRate`
  3. Guardar `currency_code` por línea
- **Validación:** Cestaticket en USD se guarda correctamente, no convertido erróneamente
- **Esfuerzo:** 1h

### 7.6.12 — Fix `formula-evaluator._decimalizeVariables` (No Convertir Decimal→Number)
- **Archivo:** `server/services/payroll/formula-evaluator.js` (líneas 312-336 aprox)
- **Acción:** Modificar `_decimalizeVariables` para **mantener `Decimal` instances** en el objeto de variables. El `safeEval` debe operar con `Decimal` nativamente (ya lo hace internamente). Eliminar `.toNumber()`.
- **Validación:** Tests `formula-evaluator.test.js` deben pasar. Precisión mantenida en evaluación de fórmulas.
- **Esfuerzo:** 30 min

### 7.6.13 — Mejorar Manejo Errores Queue en `pay()` (Try/Catch Silenciosos)
- **Archivo:** `server/controllers/PayrollPeriodController.js` (líneas 242-256)
- **Acción:** 
  - Si queue falla, retornar `202 Accepted` con `warning: "Exportación/email encolado falló — reintentar manualmente"` en lugar de `200 OK` con status failed en JSON
  - Agregar endpoint `POST /api/v1/payroll-periods/:id/retry-jobs` para reintentar export/email
  - Log estructurado con `requestId` para trazabilidad
- **Validación:** Usuario sabe si procesos async fallaron; puede reintentar.
- **Esfuerzo:** 1h

### 7.6.14 — Validación Estricta `CORS_ORIGIN_REGEX` al Startup
- **Archivo:** `server/index.js` (líneas 48-63)
- **Acción:** Cambiar `console.warn` por validación que lanza `Error` y `process.exit(1)` si regex inválido:
```javascript
if (corsOriginRegex) {
    try {
        new RegExp(corsOriginRegex)
        allowedOrigins.push(new RegExp(corsOriginRegex))
    } catch (e) {
        console.error('[CORS] FATAL: CORS_ORIGIN_REGEX inválido:', corsOriginRegex)
        process.exit(1)
    }
}
```
- **Validación:** Deploy falla rápido si variable mal configurada.
- **Esfuerzo:** 5 min

---

## ✅ FASE 7.5.5: DEPLOY STAGING TEST (Pendiente en Bitácora Original)

### 7.5.5 — Test Deploy Staging Completo (Vercel + Render)
- **Acción:** 
  1. Push a rama `037-payroll-venezuelan-module` → CI/CD dispara deploy a staging
  2. Verificar en Vercel (client): build exitoso, variables Firebase configuradas, rutas HR accesibles
  3. Verificar en Render (server): build exitoso, MongoDB Atlas conectado, Redis conectado, queues funcionando
  4. Test E2E manual: Login HR → Payroll → Crear período → Calcular → Aprobar → Pagar → Cerrar
  5. Test E2E empleado: Login empleado → Ver sus recibos (ruta 7.6.1)
  6. Verificar health check `/api/health` retorna 200 con DB/Redis/Queue/Firebase OK
- **Criterio de éxito:** Todo funcional en staging sin errores en consola ni logs
- **Esfuerzo:** 2h

---

## 🔄 SECUENCIA DE EJECUCIÓN OBLIGATORIA

```
┌─────────────────────────────────────────────────────────────────┐
│ PRIORIDAD 0 (HOY) — Bloqueadores Login/Acceso/Cálculo          │
├─────────────────────────────────────────────────────────────────┤
│ 7.6.1  Ruta empleado /me                                        │
│ 7.6.2  ProtectedHRRoute en payroll                              │
│ 7.6.3  _getActiveContract real                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ PRIORIDAD 1 (ESTA SEMANA) — Correctitud Financiera/Funcional   │
├─────────────────────────────────────────────────────────────────┤
│ 7.6.4  Decimal128 / String persistencia (transversal)           │
│ 7.6.5  generatePayrollJournalDraft → JournalGenerator           │
│ 7.6.6  Import Employee en vacation-calculator                   │
│ 7.6.7  Transacción MongoDB calculatePayrollPeriod               │
│ 7.6.8  evalFormula → FormulaEvaluator.safeEval                  │
│ 7.6.9  _getAttendanceSummary real                               │
│ 7.6.10 VacationBalance.organizationID fix                       │
│ 7.6.11 PayrollReceiptLine.amount_src por currency               │
│ 7.6.12 formula-evaluator _decimalizeVariables fix               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ PRIORIDAD 2 (PRÓXIMO SPRINT) — Robustez                         │
├─────────────────────────────────────────────────────────────────┤
│ 7.6.13 Mejorar try/catch pay() + endpoint retry                 │
│ 7.6.14 CORS_ORIGIN_REGEX validación estricta                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ CIERRE TAREA #037                                               │
├─────────────────────────────────────────────────────────────────┤
│ 7.5.5  Deploy staging test completo                             │
│ Verificación final: build client 0 errores, test server pass   │
│ Actualizar bitácoras (index.md + actual.md)                     │
│ Auto-mantenimiento (self-maintenance.md)                        │
│ CREAR PR HACIA dev (nunca a main)                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 CHECKLIST DE VALIDACIÓN POR ITEM (Definition of Done)

Cada item de la fase 7.6 DEBE cumplir **TODOS** antes de marcar `[x]`:

| Criterio | Descripción |
|----------|-------------|
| ✅ **Código implementado** | Cambios aplicados en archivos correctos |
| ✅ **Build client** | `cd client && npm run build` → **0 errores** |
| ✅ **Tests server** | `cd server && npm run test` → **Todas las suites pasan** (existentes + nuevos si aplica) |
| ✅ **Verificación manual** | Funcionalidad probada en local (login HR, login empleado, cálculo nómina) |
| ✅ **Sin regresiones** | Features existentes (Phases 1-6) siguen funcionando |
| ✅ **Bitácora actualizada** | `actual.md` check `[x]` + `PUNTO DE CONTROL` actualizado |

---

## ⚠️ REGLAS NO NEGOCIABLES (Recordatorio AGENTS.md)

1. **PLAN FIRST** — Este plan debe ser APROBADO EXPLÍCITAMENTE antes de código
2. **STOP OBLIGATORIO POR FASE** — Cada sub-fase (7.6.1 a 7.6.14, 7.5.5) termina en STOP: mostrar resumen → esperar aprobación
3. **BUILDS OBLIGATORIOS** — Antes de CUALQUIER commit: `client: npm run build (0 errores)` + `server: npm run test (todas pasan)`
4. **NO NUEVO PR** — Trabajar sobre rama `037-payroll-venezuelan-module` y PR existente hacia `dev`
5. **ROOT CAUSE** — Cada fix ataca causa raíz (ver mapeo en auditoría), no síntomas
6. **BITÁCORA VIVA** — Actualizar `.bitacoras/actual.md` en tiempo real tras cada hito

---

## 📝 PRÓXIMO PASO REQUERIDO

**ESPERANDO APROBACIÓN EXPLÍCITA DEL USUARIO** para iniciar **Fase 7.6.1** (Ruta empleado `/me`).

> Responder "APROBADO 7.6.1" para comenzar, o indicar modificaciones al plan.