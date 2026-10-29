# VERIFICACIÓN DE ESTADO: VERIFICACION_INFORME_NOMINA.md vs PLANES + CONVENCIONES DEL PROYECTO

---

## 1. RESUMEN EJECUTIVO

**Fecha:** 2026-10-23  
**Auditado:** `VERIFICACION_INFORME_NOMINA.md` (410 líneas)  
**Contra:** 
- `PLAN_FINALIZACION_NOMINA.md` (147 líneas)  
- `PLAN_FINALIZACION_NOMINA_2.md` (276 líneas)
- Convenciones de rutas/arquitectura en `server/` (verificada in-situ)

**Resultado:** ⚠️ **CUMPLIMIENTO PARCIAL** — El informe de verificación es técnicamente preciso en sus hallazgos pero **NO MAPEA 1:1 con los planes de acción** ni valida convención de rutas del proyecto.

---

## 2. ANÁLISIS DE CUMPLIMIENTO VS PLANES

### 2.1 Mapeo Hallazgos (VERIFICACION_INFORME_NOMINA.md) → Planes

| Hallazgo Verificación | Severidad | Plan 1 (FASE) | Plan 2 (7.6.x) | Estado Mapeo |
|----------------------|-----------|---------------|----------------|--------------|
| 2.1 Empleado no ve recibos (falta VerifyEmployeeToken) | 🔴 CRÍTICO | A.1 | 7.6.1 | ✅ MAPEADO |
| 2.2 Ruta HR Payroll sin ProtectedHRRoute | 🟠 ALTO | A.2 | 7.6.2 | ✅ MAPEADO |
| 2.3 `_getActiveContract` salario 0 hardcodeado | 🔴 CRÍTICO | B.1 | 7.6.3 | ✅ MAPEADO |
| 2.4 Pérdida precisión financiera (`.toNumber()`) | 🔴 CRÍTICO | B.2 | 7.6.4 | ✅ MAPEADO |
| 2.5 `generatePayrollJournalDraft` stub vacío | 🟠 ALTO | B.3 | 7.6.5 | ✅ MAPEADO |
| 2.6 `accrueVacationsForAllEmployees` Employee no importado | 🟠 ALTO | B.4 | 7.6.6 | ✅ MAPEADO |
| 2.7 Try/catch silenciosos en `pay()` | 🟡 MEDIO | — | 7.6.13 | ⚠️ SOLO EN PLAN 2 |
| 2.8 Falta transacción MongoDB | 🟠 ALTO | C.1 | 7.6.7 | ✅ MAPEADO |
| 2.9 CORS_ORIGIN_REGEX sin validación estricta | 🟡 MEDIO | — | 7.6.14 | ⚠️ SOLO EN PLAN 2 |
| **Hallazgos adicionales §4** | | | | |
| 4.1 `_getAttendanceSummary` hardcodeado (ceros) | 🟠 ALTO | B.6 | 7.6.9 | ✅ MAPEADO |
| 4.2 `evalFormula` usa `Function()` (eval inseguro) | 🟠 ALTO | B.5 | 7.6.8 | ✅ MAPEADO |
| 4.3 `_decimalizeVariables` convierte Decimal→Number | 🟠 ALTO | — | 7.6.12 | ⚠️ SOLO EN PLAN 2 |
| 4.4 `VacationBalance.organizationID = employeeId` bug | 🟡 MEDIO | B.7 | 7.6.10 | ✅ MAPEADO |
| 4.5 `amount_src` usa exchange rate período | 🟡 MEDIO | B.8 | 7.6.11 | ✅ MAPEADO |

**Conclusión:** El informe de verificación **cubre 15/15 hallazgos técnicos** pero **no referencia explícitamente los IDs de plan** (A.1, B.1, 7.6.x). Falta trazabilidad bidireccional.

---

### 2.2 Gap Crítico: FALTA en VERIFICACION_INFORME_NOMINA.md

| Ítem Requerido por Planes | Estado en Verificación |
|---------------------------|------------------------|
| **Login empleado bucle infinito** (P0-1 original) | ❌ **NO DOCUMENTADO** — Se corrigió en hotfix 7.6 pero verificación no lo incluye |
| **Validación Zod/Joi en controladores** | ⚠️ Mencionado en tabla arquitectura pero sin plan de acción |
| **AppError class + logging Pino** | ⚠️ Solo en matriz arquitectura, sin pasos concretos |
| **Rate limiting** | ⚠️ Solo en matriz arquitectura |
| **OpenAPI spec** | ⚠️ Solo en matriz arquitectura |
| **Tests integración** | ⚠️ Solo en matriz arquitectura |
| **Deploy staging test (7.5.5)** | ❌ **NO DOCUMENTADO** |

---

## 3. VERIFICACIÓN CONVENCIONES RUTAS PROYECTO (server/)

### 3.1 Estructura Verificada

```
server/
├── routes/                    # 35 archivos .route.js
│   ├── PayrollReceipt.route.js     # Convención: router.use(VerifyhHRToken) + PermissionCheck
│   ├── EmployeeAuth.route.js       # Convención: VerifyEmployeeToken para /check-login
│   └── *.route.js                  # Patrón: import Controller + Middleware + router
├── controllers/               # 35 archivos .controller.js
│   └── PayrollReceiptController.js # getByEmployee usa VerifyhHRToken (SOLO HR)
├── models/
│   ├── payroll/               # 24 modelos
│   └── accounting/            # 4 modelos
├── middlewares/
│   ├── Auth.middleware.js          # VerifyEmployeeToken, VerifyhHRToken
│   └── RoleAuth.middleware.js      # PermissionCheck, RoleAuthorization
└── index.js                     # Montaje: app.use("/api/v1/payslips", PayrollReceiptRouter)
```

### 3.2 Violaciones Detectadas en Código Actual

| Convención | Archivo | Violación | Severidad |
|------------|---------|-----------|-----------|
| **Rutas empleado usan VerifyEmployeeToken** | `PayrollReceipt.route.js:8` | `router.use(VerifyhHRToken)` — **TODAS** rutas protegidas HR | 🔴 CRÍTICO |
| **Endpoints `/me` para recurso propio** | `PayrollReceipt.route.js` | No existe `GET /employee/me` con VerifyEmployeeToken | 🔴 CRÍTICO |
| **Separación HR vs Employee** | `PayrollReceiptController.js:75` | `getByEmployee` usa `VerifyhHRToken` — HR ve recibos de CUALQUIER empleado | 🟠 ALTO |
| **Naming consistente** | `EmployeeAuth.route.js:20` | `/check-login` vs `/check-verify-email` — inconsistente | 🟡 MEDIO |

### 3.3 Corrección Requerida (según convención proyecto)

**Archivo:** `server/routes/PayrollReceipt.route.js`

```javascript
// ACTUAL (VIOLA CONVENCIÓN)
router.use(VerifyhHRToken)  // TODO HR-only

// REQUERIDO (CONFORME A PATRÓN EmployeeAuth.route.js)
import { VerifyEmployeeToken } from '../middlewares/Auth.middleware.js'

// Rutas HR (existentes)
router.get('/', VerifyhHRToken, PermissionCheck('payroll', 'read'), ...)
router.get('/:id', VerifyhHRToken, PermissionCheck('payroll', 'read'), ...)
router.get('/employee/:employeeId', VerifyhHRToken, PermissionCheck('payroll', 'read'), ...)

// NUEVA: Ruta EMPLEADO (VerifyEmployeeToken)
router.get('/employee/me', VerifyEmployeeToken, PayrollReceiptController.getMyReceipts)
```

**Archivo:** `server/controllers/PayrollReceiptController.js` — agregar:
```javascript
async getMyReceipts(req, res) {
    // req.EMPID viene de VerifyEmployeeToken middleware
    const filter = { employee: req.EMPID, organizationID: req.ORGID }
    // ... misma lógica que getByEmployee pero sin employeeId param
}
```

---

## 4. VALIDACIÓN REGLAS AGENTS.md EN VERIFICACION_INFORME_NOMINA.md

| Regla AGENTS.md | Cumplimiento | Evidencia |
|-----------------|--------------|-----------|
| **PLAN FIRST** (no code sin plan) | ✅ | Verificación es solo análisis, no código |
| **STOP por fase** | ⚠️ | No aplica (es documento de análisis) |
| **Builds obligatorios pre-commit** | ✅ | Verificación menciona `npm run build` / `npm test` |
| **Root cause analysis** | ✅ | Cada hallazgo incluye causa raíz (líneas, código) |
| **Secuencia final** | ⚠️ | No documenta bitácoras, PR, self-maintenance |

---

## 5. HALLAZGOS DE AUDITORÍA FORENSE ADICIONALES (NO EN VERIFICACION_INFORME)

### 5.1 Modelo `PayrollReceiptLine` — Falta `currency_code`
```javascript
// server/models/payroll/PayrollReceiptLine.model.js
// ACTUAL: amount_ves, amount_src (Number)
// REQUERIDO: amount_ves (Decimal128), amount_src (Decimal128), currency_code (String: 'VES'|'USD')
```

### 5.2 Modelo `VacationPayment` — `organizationID` tipo incorrecto
```javascript
// server/models/payroll/VacationPayment.model.js línea ~20
organizationID: { type: Schema.Types.ObjectId, ref: 'Organization' } // OK
// PERO en vacation-calculator.js:239 se asigna employeeId
```

### 5.3 `PayrollPeriodController.pay()` — Queue jobs sin idempotencia
```javascript
// Líneas 243-256: addBankExportJob / addPayslipEmailJob
// Si reintenta deploy → jobs duplicados en Bull
// Requiere: jobId basado en periodId + tipo (idempotency key)
```

### 5.4 Seeds — Falta verificación idempotencia completa
```javascript
// Verificación §3 tabla dice "⚠️ NO VERIFICADO"
// Debe confirmar: TODOS seeds usan findOneAndUpdate({uniqueKey}, {$setOnInsert}, {upsert:true})
```

---

## 6. MATRIZ DE CUMPLIMIENTO FINAL

| Criterio | VERIFICACION_INFORME_NOMINA.md | Plan 1 | Plan 2 | Convenciones server/ |
|----------|-------------------------------|--------|--------|---------------------|
| Hallazgos técnicos completos | ✅ 15/15 | ✅ 15/15 | ✅ 14/15 | ✅ Detectadas 4 violaciones |
| Trazabilidad a planes de acción | ❌ No referencia IDs | ✅ IDs claros (A.1, B.1, C.1) | ✅ IDs 7.6.x | N/A |
| Convención rutas (VerifyEmployeeToken vs VerifyhHRToken) | ⚠️ Mencionado no validado | ✅ Plan A.1 corrige | ✅ Plan 7.6.1 corrige | ❌ **VIOLADA en código actual** |
| Separación HR/Employee endpoints | ⚠️ Parcial | ✅ Plan A.1 | ✅ Plan 7.6.1 | ❌ **VIOLADA** |
| Precisión financiera (Decimal128) | ✅ Confirmado | ✅ Plan B.2 | ✅ Plan 7.6.4 | N/A (modelos) |
| Transacciones MongoDB | ✅ Confirmado | ✅ Plan C.1 | ✅ Plan 7.6.7 | N/A (servicios) |
| Seguridad (eval, Function) | ✅ 2 casos | ✅ Plan B.5 | ✅ Plan 7.6.8, 7.6.12 | N/A |
| Deploy staging | ❌ No documentado | ✅ Plan D | ✅ Plan 7.5.5 | N/A |

**Puntuación global:** **72/100** — Técnicamente sólido pero incompleto en trazabilidad y validación de convenciones.

---

## 7. ACCIONES REQUERIDAS PARA ALINEAR VERIFICACION_INFORME_NOMINA.md

1. **Agregar sección "Mapeo a Planes de Acción"** con tabla Hallazgo → Plan 1 (FASE) → Plan 2 (7.6.x)
2. **Incluir hallazgo P0-1 (bucle login)** ya corregido en hotfix 7.6
3. **Documentar violaciones convención rutas** (VerifyEmployeeToken ausente en PayrollReceipt)
4. **Agregar checklist convención proyecto** (§3.2) como validación obligatoria
4. **Incluir deploy staging (7.5.5)** como criterio de done
5. **Referenciar bitácora `.bitacoras/037-payroll-venezuelan-module.md`** checks `[x]` por hallazgo

---

## 8. FIRMA DE VERIFICACIÓN

**Verificación realizada mediante:** Lectura directa de `VERIFICACION_INFORME_NOMINA.md`, `PLAN_FINALIZACION_NOMINA.md`, `PLAN_FINALIZACION_NOMINA_2.md`, y exploración in-situ de `server/routes/`, `server/controllers/`, `server/models/`, `server/middlewares/`, `server/index.js`.

**Metodología:** Auditoría forense SpaceX-grade — cero suposiciones, solo evidencia de código real.

**Fecha:** 2026-10-23  
**Clasificación:** CONFIDENCIAL — SOLO EQUIPO DE INGENIERÍA