# Contratos de API - Módulo de Nómina Venezolana

## Base URL
```
/api/v1/payroll
```

## Autenticación
- **HR**: `Authorization: Bearer <HR_JWT>` → `VerifyHRToken` + `PermissionCheck("payroll:*")`
- **Empleado**: `Authorization: Bearer <EMP_JWT>` → `VerifyEmployeeToken`

---

## Períodos de Nómina (`/periods`)

| Método | Endpoint | Auth | Permiso | Descripción |
|--------|----------|------|---------|-------------|
| GET | `/periods` | HR | payroll:read | Lista paginada con filtros |
| GET | `/periods/:id` | HR | payroll:read | Detalle de período |
| POST | `/periods` | HR | payroll:create | Crear período |
| PATCH | `/periods/:id` | HR | payroll:update | Actualizar (solo DRAFT) |
| POST | `/periods/:id/calculate` | HR | payroll:calculate | Calcular nómina completa |
| POST | `/periods/:id/approve` | HR | payroll:approve | Aprobar + generar asiento |
| POST | `/periods/:id/pay` | HR | payroll:pay | Marcar pagado + encolar jobs |
| POST | `/periods/:id/close` | HR | payroll:close | Cerrar período (PAID) |
| DELETE | `/periods/:id` | HR | payroll:delete | Eliminar (cascade) |

### Request/Response: Calculate
```json
// POST /periods/:id/calculate
// Response 200
{
  "success": true,
  "message": "Nómina calculada para 150 empleados",
  "data": [
    {
      "_id": "...",
      "employee": "...",
      "total_income_ves": 1500000,
      "total_deductions_ves": 150000,
      "net_pay_ves": 1350000,
      "status": "CALCULATED"
    }
  ]
}
```

### Request/Response: Approve
```json
// POST /periods/:id/approve
// Response 200
{
  "success": true,
  "message": "Período aprobado y asiento contable generado",
  "data": {
    "periodStatus": "APPROVED",
    "journalDraftId": "..."
  }
}
// Response 400 (desbalanceado)
{
  "success": false,
  "message": "Asiento contable desbalanceado: diferencia 0.50 VES"
}
```

### Request/Response: Pay
```json
// POST /periods/:id/pay
// Response 200
{
  "success": true,
  "message": "Período marcado como pagado. Procesos de exportación y notificación encolados.",
  "data": {
    "periodStatus": "PAID",
    "queuedJobs": {
      "bankExport": { "jobId": "...", "status": "queued" },
      "payslipEmail": { "jobId": "...", "status": "queued" }
    }
  }
}
// Response 200 con warnings
{
  "success": true,
  "message": "Período marcado como pagado. Advertencias: Exportación bancaria: Queue no disponible",
  "data": { ... }
}
```

---

## Recibos de Nómina (`/receipts`)

| Método | Endpoint | Auth | Permiso | Descripción |
|--------|----------|------|---------|-------------|
| GET | `/receipts` | HR | payroll:read | Lista con filtros (período, empleado, status) |
| GET | `/receipts/:id` | HR | payroll:read | Detalle completo + líneas + costos patronales |
| GET | `/receipts/:id/export` | HR | payroll:export | Exportar (format: json|csv) |
| POST | `/receipts/:id/void` | HR | payroll:void | Anular recibo (reverso asiento) |
| GET | `/receipts/me` | Empleado | - | Mis recibos (paginado) |
| GET | `/receipts/:id/export` | Empleado | - | Exportar mi recibo |

### Export Format
```
?format=json  → JSON completo
?format=csv   → CSV con líneas
?format=pdf   → 400 "PDF no disponible. Use csv o json"
```

---

## Conceptos de Nómina (`/concepts`)

| Método | Endpoint | Auth | Permiso | Descripción |
|--------|----------|------|---------|-------------|
| GET | `/concepts` | HR | payroll:read | Lista conceptos (filtro kind) |
| GET | `/concepts/:id` | HR | payroll:read | Detalle + fórmula |
| POST | `/concepts` | HR | payroll:create | Crear concepto (valida fórmula) |
| PATCH | `/concepts/:id` | HR | payroll:update | Actualizar |
| DELETE | `/concepts/:id` | HR | payroll:delete | Eliminar (si no usado) |

### Concept Object
```json
{
  "_id": "...",
  "code": "SUELDO_BASE",
  "name": "Sueldo Base",
  "kind": "INCOME",
  "computation_method": "DYNAMIC_FORMULA",
  "formula": "SALARIO_DIARIO * DIAS_TRABAJADOS",
  "accumulator_bases": ["IVSS_BASE", "FAOV_BASE", "RPE_BASE", "PRESTACIONES_BASE", "ISLR_BASE", "INCES_BASE"],
  "is_active": true,
  "display_order": 1
}
```

---

## Novedades de Nómina (`/novelties`)

| Método | Endpoint | Auth | Permiso | Descripción |
|--------|----------|------|---------|-------------|
| GET | `/novelties` | HR | payroll:read | Lista (filtro período, empleado, tipo) |
| POST | `/novelties` | HR | payroll:create | Crear novedad manual |
| PATCH | `/novelties/:id` | HR | payroll:update | Actualizar (PENDING) |
| POST | `/novelties/:id/apply` | HR | payroll:approve | Aplicar a nómina |
| DELETE | `/novelties/:id` | HR | payroll:delete | Eliminar |

### Tipos de Novedad
- `ANTICIPO_VACACIONAL` - Anticipo de vacaciones
- `ANTICIPO_QUINCENA` - Anticipo de quincena
- `PRESTAMO` - Préstamo
- `DESCUENTO_FALTA` - Descuento por falta
- `OTRO` - Otros

---

## Vacaciones (`/vacations`)

### Saldos
| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/balances` | HR | Saldos paginados (filtro empleado) |
| GET | `/balances/me` | Empleado | Mi saldo actual |

### Solicitudes
| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/requests` | HR | Lista solicitudes (filtro status) |
| GET | `/requests/me` | Empleado | Mis solicitudes |
| POST | `/requests` | Empleado | Crear solicitud |
| POST | `/requests/:id/approve` | HR | Aprobar solicitud |
| POST | `/requests/:id/reject` | HR | Rechazar solicitud |
| POST | `/requests/:id/pay` | HR | Pagar vacaciones → crea Recibo + Novedad |

### Pay Vacation Request
```json
// POST /requests/:id/pay
{ "payment_date": "2026-01-15", "period_id": "..." }
// Response 200
{
  "success": true,
  "message": "Vacaciones pagadas y recibo generado",
  "data": { "receipt": {...}, "advance_novelty_created": true }
}
```

---

## Prestaciones Sociales (`/social-benefits`)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/ledger` | HR | Libro prestaciones (filtro empleado) |
| GET | `/ledger/me` | Empleado | Mi libro prestaciones |
| POST | `/settlements/calculate` | HR | Calcular liquidación (preview) |
| POST | `/settlements` | HR | Crear liquidación |
| GET | `/settlements/:id` | HR | Detalle liquidación |
| POST | `/settlements/:id/approve` | HR | Aprobar liquidación |

---

## Utilidades (`/utilidades`)

### Períodos
| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/periods` | HR | Lista períodos utilidades |
| POST | `/periods` | HR | Crear período (year, net_profit_usd, %) |
| POST | `/periods/:id/calculate` | HR | Calcular distribución |
| POST | `/periods/:id/approve` | HR | Aprobar |
| POST | `/periods/:id/pay` | HR | Pagar → crea Recibos UTILIDADES |

### Pagos
| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/payments` | HR | Lista pagos |
| GET | `/payments/me` | Empleado | Mis pagos utilidades |
| POST | `/payments/:id/pay` | HR | Pago individual → Recibo |

---

## Health Check
```
GET /api/health
// Response 200
{
  "status": "ok",
  "timestamp": "2026-11-03T15:30:00.000Z",
  "services": {
    "mongodb": { "status": "connected", "readyState": 1 },
    "redis": { "status": "connected", "clientStatus": "ready" },
    "queues": { "bank-export": {...}, "payslip-email": {...} },
    "firebase": { "status": "initialized" }
  }
}
// Response 503 si degraded
```

---

## Códigos de Error Comunes

| Código | HTTP | Descripción |
|--------|------|-------------|
| `PERIOD_NOT_FOUND` | 404 | Período no existe |
| `PERIOD_INVALID_STATUS` | 400 | Estado inválido para operación |
| `JOURNAL_UNBALANCED` | 400 | Asiento desbalanceado > 0.01 VES |
| `FORMULA_INVALID` | 400 | Fórmula no válida (validateFormula) |
| `EMPLOYEE_NO_CONTRACT` | 400 | Empleado sin contrato vigente |
| `QUEUE_UNAVAILABLE` | 200 (warning) | Job encolado pero queue no disponible |
| `UNAUTHORIZED` | 401 | Token inválido/ausente |
| `FORBIDDEN` | 403 | Sin permiso payroll:* |

---

## Rate Limits
- **Bull Queue Concurrency**: Configurable via `PAYROLL_WORKER_CONCURRENCY` (default 5)
- **Batch Size**: `PAYROLL_BATCH_SIZE` (default 50 empleados/batch)
- **Export Jobs**: 2 concurrent (bank-export)
- **Email Jobs**: 5 concurrent (payslip-email)

---

*Contratos API v1.0 | 2026-11-03*