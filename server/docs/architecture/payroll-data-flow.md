# Flujo de Datos - Módulo de Nómina

## Flujo Principal: Cálculo de Nómina por Período

```mermaid
sequenceDiagram
    actor HR as HR User
    participant API as Payroll API
    participant Engine as PayrollEngine
    participant Formula as FormulaEvaluator
    participant Accum as AccumulatorEngine
    participant Rules as ConceptRulesEngine
    participant EMCost as EmployerCosts
    participant Journal as JournalGenerator
    participant Queue as Bull Queue
    participant DB as MongoDB

    HR->>API: POST /payroll-periods/:id/calculate
    API->>Engine: calculatePayrollPeriod(periodId)
    Engine->>DB: Find active employees + contracts
    Engine->>Engine: Batch loop (PAYROLL_BATCH_SIZE)
    loop For each employee in batch
        Engine->>Engine: calculateEmployeeReceipt()
        Engine->>Formula: safeEval(formula, vars)
        Formula-->>Engine: Decimal result
        Engine->>Accum: accumulate(base, amount, kind)
        Accum-->>Engine: updated accumulators
        Engine->>Rules: applyRules(concept, context)
        Rules-->>Engine: {amount, quantity, kind}
        Engine->>EMCost: calculateEmployerCosts(context, accum)
        EMCost-->>Engine: employer costs array
        Engine->>DB: Create PayrollReceipt + Lines + EmployerCost
    end
    Engine->>Journal: generatePayrollJournalDraft(period, receipts)
    Journal->>DB: Create JournalDraft + Lines
    Journal-->>Engine: {draft, validation}
    Engine->>DB: Update Period.status = CALCULATED
    Engine-->>API: receipts[]
    API-->>HR: 200 OK + receipts
```

## Flujo: Aprobación de Período

```mermaid
sequenceDiagram
    actor HR as HR User
    participant API as Payroll API
    participant Journal as JournalGenerator
    participant DB as MongoDB

    HR->>API: POST /payroll-periods/:id/approve
    API->>DB: Find Period (status=CALCULATED)
    API->>Journal: initialize()
    Journal->>DB: Find AccountingReportMapping
    Journal-->>API: initialized
    API->>DB: Find receipts for period
    API->>Journal: generatePayrollJournalDraft(period, receipts)
    Journal->>Journal: Build lines (INCOME, DEDUCTION, EMPLOYER_COST)
    Journal->>DB: Create JournalDraft + Lines
    Journal->>Journal: validateDoubleEntry(draft)
    alt Valid
        API->>Journal: postJournalDraft(draftId, HRID)
        Journal->>DB: Update draft.state = POSTED
        API->>DB: Period.status = APPROVED
        API->>DB: Receipts.status = APPROVED
        API-->>HR: 200 OK + journalDraftId
    else Invalid
        API-->>HR: 400 Error "Asiento desbalanceado"
    end
```

## Flujo: Pago de Período

```mermaid
sequenceDiagram
    actor HR as HR User
    participant API as Payroll API
    participant Queue as Bull Queue
    participant Worker as PayrollWorker
    participant BankExport as BankExportGenerator
    participant Email as SendPayslipEmail
    participant DB as MongoDB

    HR->>API: POST /payroll-periods/:id/pay
    API->>DB: Validate Period.status = APPROVED
    API->>DB: Update Receipts.status = PAID + payment_date
    API->>DB: Update Period.status = PAID
    API->>Queue: addBankExportJob(orgID, periodID)
    API->>Queue: addPayslipEmailJob(orgID, periodID, baseURL)
    API-->>HR: 200 OK + {bankExport, payslipEmail} job status

    par Async Processing
        Worker->>Queue: process bank-export
        Worker->>BankExport: generateAllFormats(periodID)
        BankExport->>DB: Find receipts (status=PAID) + employees
        BankExport->>BankExport: generateTXT() + generateCSV() + generateExcel()
        BankExport->>FS: Save files in exports/bank/{orgID}/
        BankExport-->>Worker: {txt, csv, excel, summary}
        Worker->>DB: Log export completed
    and
        Worker->>Queue: process payslip-email
        Worker->>DB: Find paid receipts + employees
        loop For each employee
            Worker->>Email: SendPayslipEmail(email, name, period, date, income, deductions, net, URL)
        end
        Worker->>DB: Log emails sent/failed
    end
```

## Flujo: Vacaciones → Novedad de Nómina

```mermaid
sequenceDiagram
    actor HR as HR User
    participant API as Vacation API
    participant Calc as VacationCalculator
    participant Novelty as PayrollNovelty
    participant Receipt as PayrollReceipt
    participant DB as MongoDB

    HR->>API: POST /vacations/requests/:id/pay {period_id}
    API->>DB: Find VacationRequest (status=APPROVED)
    API->>Calc: calculateVacationPayment({employee, days, base, cestaticket})
    Calc-->>API: {total, dailySalary, advance_amount}
    API->>DB: Create PayrollReceipt (tipo_recibo=VACACIONES, status=PAID)
    API->>DB: Update Request.status = TAKEN, payroll_novelty = receiptId
    alt advance_amount > 0
        API->>Novelty: Create PayrollNovelty
        Novelty->>DB: concept=ANTICIPO_VACACIONAL, status=APPLIED
        Novelty-->>API: novelty created
    end
    API->>DB: Update VacationBalance (dias_disfrutados, saldo)
    API-->>HR: 200 OK + receipt
```

## Flujo: Utilidades → Recibos de Nómina

```mermaid
sequenceDiagram
    actor HR as HR User
    participant API as Utilidades API
    participant Calc as UtilidadesCalculator
    participant Receipt as PayrollReceipt
    participant Payment as UtilidadesPayment
    participant DB as MongoDB

    HR->>API: POST /utilidades/periods/:id/pay
    API->>DB: Find UtilidadesPeriod (status=APPROVED)
    API->>Calc: generatePayments(periodId, date, exchange_rate)
    Calc-->>API: {payments: [{employee, total_ves, islr_ves, net_ves, ...}]}
    API->>DB: Update Period.status = PAID
    loop For each payment
        API->>Receipt: Create PayrollReceipt (tipo_recibo=UTILIDADES)
        Receipt->>DB: receipt created
        API->>Payment: Update UtilidadesPayment.status=PAID + payroll_receipt
    end
    API-->>HR: 200 OK + payments[]
```

## Flujo: CRON - Registro de Ausencias (Timezone Venezuela)

```mermaid
sequenceDiagram
    participant Cron as cron-job.org / Scheduler
    participant API as Schedule API
    participant DB as MongoDB

    Cron->>API: GET /api/v1/schedule/cron/register-absences
    API->>API: yesterday = now in America/Caracas - 1 day (00:00:00)
    API->>DB: Find active schedules for yesterday
    loop For each schedule
        API->>API: Find daySchedule for yesterdayDayName
        API->>API: Filter incomplete tasks
        alt Has incomplete tasks
            API->>DB: Check existing absence (employee + scheduleId + date)
            alt Not exists
                API->>DB: Create Absence (leavetype="Tarea No Realizada")
                API-->>Cron: count++
            end
        end
    end
    API-->>Cron: 200 OK + {absencesRegistered}
```

## Variables de Contexto en Fórmulas (FormulaContext)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `SALARIO_BASE` | Salario base mensual VES | 13000 |
| `SALARIO_DIARIO` | Salario diario (base/30) | 433.33 |
| `SALARIO_HORA` | Salario por hora | 54.17 |
| `DIAS_TRABAJADOS` | Días laborados en período | 15 |
| `H_EXTRA_DIURNA` | Horas extra diurnas | 4 |
| `H_EXTRA_NOCTURNA` | Horas extra nocturnas | 2 |
| `CESTATICKET` | Valor cestaticket del día | 40 |
| `LUNES` | Lunes en período | 2 |
| `DOMINGOS` | Domingos trabajados | 1 |
| `FERIADOS` | Feriados trabajados | 0 |
| `REPOSO_33` | Días reposo 3/3 | 0 |
| `REPOSO_FULL` | Días reposo total | 0 |
| `AUSENCIAS` | Días de ausencia | 1 |

## Reglas de Acumulación (AccumulatorEngine)

| Base | Conceptos que Acumulan |
|------|------------------------|
| `IVSS_BASE` | SUELDO_BASE, COMPLEMENTO, CESTATICKET, H_EXTRA_DIURNA, H_EXTRA_NOCTURNA, BONO_NOCTURNO, DIAS_FERIADO, DOMINGO_TRABAJADO, DIAS_DESCANSO |
| `FAOV_BASE` | Igual que IVSS_BASE |
| `RPE_BASE` | Igual que IVSS_BASE |
| `PRESTACIONES_BASE` | SUELDO_BASE, COMPLEMENTO, CESTATICKET, H_EXTRA_DIURNA, H_EXTRA_NOCTURNA, BONO_NOCTURNO, DIAS_FERIADO, DOMINGO_TRABAJADO, DIAS_DESCANSO, REPOSO_33, REPOSO_FULL |
| `ISLR_BASE` | SUELDO_BASE, COMPLEMENTO, H_EXTRA_DIURNA, H_EXTRA_NOCTURNA, BONO_NOCTURNO, DIAS_FERIADO, DOMINGO_TRABAJADO, DIAS_DESCANSO |
| `INCES_BASE` | Igual que IVSS_BASE |

---

*Documentación de flujo de datos v1.0 | 2026-11-03*