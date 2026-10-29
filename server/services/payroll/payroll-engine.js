import { Decimal } from 'decimal.js'
import mongoose from 'mongoose'
import { PayrollConcept } from '../../models/payroll/PayrollConcept.model.js'
import { PayrollPeriod } from '../../models/payroll/PayrollPeriod.model.js'
import { PayrollReceipt } from '../../models/payroll/PayrollReceipt.model.js'
import { PayrollReceiptLine } from '../../models/payroll/PayrollReceiptLine.model.js'
import { PayrollEmployerCost } from '../../models/payroll/PayrollEmployerCost.model.js'
import { PayrollNovelty } from '../../models/payroll/PayrollNovelty.model.js'
import { PayrollPolicy } from '../../models/payroll/PayrollPolicy.model.js'
import { Employee } from '../../models/Employee.model.js'
import { Attendance } from '../../models/Attendance.model.js'
import { Leave } from '../../models/Leave.model.js'
import { Loan } from '../../models/payroll/Loan.model.js'
import { LoanPayment } from '../../models/payroll/LoanPayment.model.js'
import { AdvanceRequest } from '../../models/payroll/AdvanceRequest.model.js'
import { FormulaContext } from './formula-context.js'
import { AccumulatorEngine } from './accumulator-engine.js'
import { ConceptRulesEngine } from './concept-rules.js'
import { safeEval, validateFormula } from './formula-evaluator.js'
import { calculateEmployerCosts } from './employer-costs.js'

/**
 * Motor Principal de Nómina - PayrollEngine
 * Orquesta el cálculo completo de nómina por período y por empleado
 * Basado en la lógica de Nóminix (payroll_core/services/payroll_engine.py)
 */
export class PayrollEngine {
    constructor(organizationID) {
        this.organizationID = organizationID
        this.policy = null
    }

    /**
     * Inicializa el motor cargando la política de la organización
     */
    async initialize() {
        this.policy = await PayrollPolicy.findOne({ organizationID: this.organizationID }).lean()
        if (!this.policy) {
            throw new Error(`No existe PayrollPolicy para organización ${this.organizationID}`)
        }
        return this
    }

    /**
     * Calcula nómina completa para un período
     * @param {string|ObjectId} periodId
     * @returns {Promise<Array<PayrollReceipt>>}
     */
    async calculatePayrollPeriod(periodId) {
        const period = await PayrollPeriod.findById(periodId).lean()
        if (!period) {
            throw new Error(`Período ${periodId} no encontrado`)
        }

        // Actualizar estado a CALCULATING
        await PayrollPeriod.findByIdAndUpdate(periodId, { status: 'CALCULATING' })

        // Obtener empleados activos con contrato vigente
        const employees = await Employee.find({
            organizationID: this.organizationID,
            isactive: true,
            hire_date: { $lte: period.end_date },
            $or: [
                { termination_date: null },
                { termination_date: { $gte: period.start_date } }
            ]
        }).lean()

        const receipts = []

        for (const employee of employees) {
            // Obtener contrato activo
            const contract = await this._getActiveContract(employee._id, period)
            if (!contract) continue

            try {
                const receipt = await this.calculateEmployeeReceipt(employee, period, contract)
                receipts.push(receipt)
            } catch (error) {
                console.error(`Error calculando recibo para empleado ${employee._id}:`, error)
                // Continuar con otros empleados
            }
        }

        // Generar borrador de asiento contable
        await this.generatePayrollJournalDraft(periodId, receipts)

        // Actualizar estado a CALCULATED
        await PayrollPeriod.findByIdAndUpdate(periodId, { status: 'CALCULATED' })

        return receipts
    }

    /**
     * Calcula recibo individual para un empleado
     * @param {Object} employee - Documento Employee
     * @param {Object} period - Documento PayrollPeriod
     * @param {Object} contract - Documento LaborContract
     * @returns {Promise<PayrollReceipt>}
     */
    async calculateEmployeeReceipt(employee, period, contract) {
        const exchangeRate = period.pinned_rate || period.exchange_rate_snapshot || 1
        const salaryBaseVes = contract.salary_amount * exchangeRate

        // Crear o actualizar recibo
        let receipt = await PayrollReceipt.findOne({
            employee: employee._id,
            period: period._id,
            organizationID: this.organizationID
        })

        const contractSnapshot = this._buildContractSnapshot(contract, exchangeRate)

        if (!receipt) {
            receipt = await PayrollReceipt.create({
                employee: employee._id,
                period: period._id,
                contract: contract._id,
                branch: contract.branch,
                contract_snapshot: contractSnapshot,
                salary_base_snapshot: contract.salary_amount,
                exchange_rate_snapshot: exchangeRate,
                currency_code: 'VES',
                status: 'DRAFT',
                organizationID: this.organizationID
            })
        } else {
            // Actualizar snapshot y resetear
            receipt.contract_snapshot = contractSnapshot
            receipt.salary_base_snapshot = contract.salary_amount
            receipt.exchange_rate_snapshot = exchangeRate
            receipt.status = 'DRAFT'
            receipt.total_income_ves = 0
            receipt.total_deductions_ves = 0
            receipt.total_employer_cost_ves = 0
            receipt.net_pay_ves = 0
            receipt.needs_recalculation = false
            await receipt.save()

            // Eliminar líneas existentes
            await PayrollReceiptLine.deleteMany({ receipt: receipt._id })
            await PayrollEmployerCost.deleteMany({ receipt: receipt._id })
        }

        // Motor de acumuladores
        const accumulators = new AccumulatorEngine()

        // Obtener novedades del período
        const novelties = await this._getNovelties(employee._id, period._id)

        // Obtener resumen de asistencia
        const attendance = await this._getAttendanceSummary(employee._id, period)

        // Crear contexto de evaluación
        const context = new FormulaContext({
            employee,
            contract,
            period,
            receipt,
            exchangeRate,
            salaryBaseVes,
            novelties,
            attendance,
            policy: this.policy,
            accumulators
        })

        // Obtener conceptos activos ordenados
        const concepts = await PayrollConcept.find({
            organizationID: this.organizationID,
            active: true
        }).sort({ receipt_order: 1 }).lean()

        let totalIncome = new Decimal(0)
        let totalDeductions = new Decimal(0)

        // Procesar cada concepto en orden
        for (const concept of concepts) {
            // Verificar si el concepto aplica
            if (!this._conceptApplies(concept, receipt, context)) {
                continue
            }

            // Evaluar fórmula
            const amount = await this.evaluateConceptFormula(concept, context)

            // Aplicar reglas del concepto
            const finalAmount = ConceptRulesEngine.processConceptRules(concept, amount, context)

            if (finalAmount.isZero() && !concept.show_even_if_zero) {
                continue
            }

            // Obtener cantidad y porcentaje
            const quantity = this._getQuantity(concept, context)
            const percentage = this._getPercentage(concept, context)

            // Crear línea de recibo
            const line = await PayrollReceiptLine.create({
                receipt: receipt._id,
                concept_code: concept.code,
                concept_name: concept.name,
                kind: concept.kind,
                amount_ves: finalAmount.toNumber(),
                amount_src: finalAmount.div(exchangeRate).toNumber(),
                quantity,
                unit: concept.unit_label,
                percentage,
                tipo_recibo: concept.tipo_recibo,
                calculation_log: this._buildCalculationLog(concept, context, finalAmount),
                calculation_trace: this._buildCalculationTrace(concept, context, finalAmount),
                is_salary_incidence: concept.is_salary_incidence,
                exchange_rate: exchangeRate,
                branch: contract.branch,
                organizationID: this.organizationID
            })

            // Acumular totales
            if (concept.kind === 'INCOME') {
                totalIncome = totalIncome.plus(finalAmount)
            } else if (concept.kind === 'DEDUCTION') {
                totalDeductions = totalDeductions.plus(finalAmount)
            }

            // Actualizar acumuladores según incidences
            for (const incidence of concept.incidences || []) {
                if (AccumulatorEngine.BASES.includes(incidence)) {
                    accumulators.add(incidence, finalAmount, concept.code)
                }
            }
        }

        // Calcular costos patronales
        const employerCosts = await calculateEmployerCosts(context, accumulators)

        let totalEmployerCost = new Decimal(0)
        for (const cost of employerCosts) {
            await PayrollEmployerCost.create({
                receipt: receipt._id,
                concept_code: cost.concept_code,
                concept_name: cost.concept_name,
                base_ves: cost.base_ves,
                rate: cost.rate,
                amount_ves: cost.amount_ves,
                calculation_log: cost.calculation_log,
                organizationID: this.organizationID
            })
            totalEmployerCost = totalEmployerCost.plus(cost.amount_ves)
        }

        // Calcular neto
        const netPay = totalIncome.minus(totalDeductions)

        // Actualizar recibo con totales
        receipt.total_income_ves = totalIncome.toNumber()
        receipt.total_deductions_ves = totalDeductions.toNumber()
        receipt.total_employer_cost_ves = totalEmployerCost.toNumber()
        receipt.net_pay_ves = netPay.toNumber()
        receipt.status = 'CALCULATED'
        await receipt.save()

        // Agregar recibo a empleado
        if (!employee.payroll_receipts?.includes(receipt._id)) {
            await Employee.findByIdAndUpdate(employee._id, {
                $push: { payroll_receipts: receipt._id }
            })
        }

        return receipt
    }

    /**
     * Evalúa la fórmula de un concepto
     */
    async evaluateConceptFormula(concept, context) {
        const variables = context.getAllowedVariables()

        switch (concept.computation_method) {
            case 'FIXED_AMOUNT':
                return new Decimal(concept.value || 0)

            case 'PERCENTAGE_OF_BASIC':
                const base = variables.SALARIO_PERIOD || new Decimal(0)
                return base.times(concept.value || 0).div(100)

            case 'DYNAMIC_FORMULA':
                if (!concept.formula) {
                    return new Decimal(0)
                }
                try {
                    const result = safeEval(concept.formula, this._decimalizeVariables(variables))
                    return new Decimal(result).dp(2, Decimal.ROUND_HALF_UP)
                } catch (error) {
                    console.error(`Error evaluando fórmula ${concept.code}: ${concept.formula}`, error)
                    return new Decimal(0)
                }

            case 'TABLE':
                return this._applyRateTable(concept, context)

            case 'EXTERNAL_API':
                return this._callExternalCalculation(concept, context)

            default:
                return new Decimal(0)
        }
    }

    /**
     * Convierte variables a objeto plano para safeEval
     */
    _decimalizeVariables(variables) {
        const result = {}
        for (const [key, value] of Object.entries(variables)) {
            if (value instanceof Decimal) {
                result[key] = value.toNumber()
            } else {
                result[key] = value
            }
        }
        return result
    }

    /**
     * Verifica si un concepto aplica para este recibo
     */
    _conceptApplies(concept, receipt, context) {
        // Sistema: siempre aplica si está activo
        if (concept.is_system) return true

        // Tipo de recibo
        if (concept.tipo_recibo && receipt.tipo_recibo !== concept.tipo_recibo) {
            return false
        }

        // Verificar condiciones y dependencias
        return ConceptRulesEngine.evaluateConditions(concept, context) &&
               ConceptRulesEngine.checkDependencies(concept, context)
    }

    /**
     * Obtiene cantidad para la línea
     */
    _getQuantity(concept, context) {
        const variables = context.getAllowedVariables()

        switch (concept.code) {
            case 'H_EXTRA_DIURNA':
                return variables.H_EXTRA_DIURNA?.toNumber() || 0
            case 'H_EXTRA_NOCTURNA':
                return variables.H_EXTRA_NOCTURNA?.toNumber() || 0
            case 'BONO_NOCTURNO':
                return variables.BONO_NOCTURNO_CANT?.toNumber() || 0
            case 'DIAS_FERIADO':
                return variables.DIAS_FERIADO_CANT?.toNumber() || 0
            case 'DOMINGO_TRABAJADO':
                return variables.Domingo_Trabajado_CANT?.toNumber() || 0
            case 'DIAS_DESCANSO':
                return variables.DIAS_DESCANSO_CANT?.toNumber() || 0
            case 'REPOSO_33':
                return variables.REPOSO_33_CANT?.toNumber() || 0
            case 'REP_FULL':
                return variables.REP_FULL_CANT?.toNumber() || 0
            case 'ANTICIPO_VAC':
                return variables.ANTICIPO_VAC_CANT?.toNumber() || 0
            case 'ANTICIPO_VAC_COMP':
                return variables.ANTICIPO_VAC_COMP_CANT?.toNumber() || 0
            case 'SUELDO_BASE':
                return variables.DIAS_EFECTIVOS?.toNumber() || 0
            default:
                return 1
        }
    }

    /**
     * Obtiene porcentaje para la línea
     */
    _getPercentage(concept, context) {
        if (concept.computation_method === 'PERCENTAGE_OF_BASIC') {
            return concept.value || 0
        }
        return 0
    }

    /**
     * Construye log de cálculo (JSONB)
     */
    _buildCalculationLog(concept, context, amount) {
        const variables = context.getAllowedVariables()

        return {
            trace: this._buildCalculationTrace(concept, context, amount),
            formula: concept.formula || concept.computation_method,
            variables: Object.fromEntries(
                Object.entries(variables)
                    .filter(([k]) => this._isRelevantVariable(k, concept))
                    .map(([k, v]) => [k, {
                        value: v instanceof Decimal ? v.toNumber() : v,
                        category: this._getVariableCategory(k),
                        description: this._getVariableDescription(k)
                    }])
            )
        }
    }

    /**
     * Construye traza legible
     */
    _buildCalculationTrace(concept, context, amount) {
        const variables = context.getAllowedVariables()

        if (concept.computation_method === 'FIXED_AMOUNT') {
            return `Monto fijo: ${amount.toFixed(2)}`
        }

        if (concept.computation_method === 'PERCENTAGE_OF_BASIC') {
            const base = variables.SALARIO_PERIOD?.toNumber() || 0
            return `${base.toFixed(2)} × ${concept.value}% = ${amount.toFixed(2)}`
        }

        if (concept.computation_method === 'DYNAMIC_FORMULA') {
            let trace = concept.formula
            for (const [key, value] of Object.entries(variables)) {
                if (trace.includes(key)) {
                    const numValue = value instanceof Decimal ? value.toNumber() : value
                    trace = trace.replace(new RegExp(key, 'g'), numValue.toFixed(2))
                }
            }
            return `${trace} = ${amount.toFixed(2)}`
        }

        return `Calculado: ${amount.toFixed(2)}`
    }

    _isRelevantVariable(key, concept) {
        const relevant = [
            'SALARIO_PERIOD', 'SUELDO_BASE_PERIODO', 'SUELDO_BASE_DIARIO',
            'SALARIO_DIARIO', 'COMPLEMENTO_BASE', 'COMPLEMENTO_DIARIO',
            'DIAS_TOTALES', 'DIAS_EFECTIVOS', 'DIAS_DEDUCIDOS',
            'H_EXTRA_DIURNA', 'H_EXTRA_NOCTURNA', 'BONO_NOCTURNO_CANT',
            'DIAS_FERIADO_CANT', 'DOMINGO_TRABAJADO_CANT', 'DIAS_DESCANSO_CANT',
            'REPOSO_33_CANT', 'REP_FULL_CANT', 'LUNES',
            'FAOV_BASE', 'IVSS_BASE', 'RPE_BASE', 'PRESTACIONES_BASE', 'ISLR_BASE', 'INCES_BASE'
        ]
        return relevant.includes(key) || concept.formula?.includes(key)
    }

    _getVariableCategory(key) {
        if (['SALARIO_PERIOD', 'SUELDO_BASE_PERIODO', 'SUELDO_BASE_MENSUAL', 'SUELDO_BASE_DIARIO', 'SALARIO_DIARIO', 'COMPLEMENTO_BASE', 'COMPLEMENTO_DIARIO', 'COMPLEMENTO_TOTAL'].includes(key)) {
            return 'Salario'
        }
        if (['DIAS_TOTALES', 'DIAS', 'DIAS_DEDUCIDOS', 'DIAS_EFECTIVOS', 'SUELDO_BASE_CANT', 'DIAS_FERIADO_CANT', 'DIAS_DESCANSO_CANT', 'DOMINGO_TRABAJADO_CANT', 'H_EXTRA_DIURNA', 'H_EXTRA_NOCTURNA', 'BONO_NOCTURNO_CANT', 'REPOSO_33_CANT', 'REP_FULL_CANT', 'ANTICIPO_VAC_CANT', 'ANTICIPO_VAC_COMP_CANT', 'LUNES'].includes(key)) {
            return 'Tiempos'
        }
        if (['FAOV_BASE', 'IVSS_BASE', 'RPE_BASE', 'PRESTACIONES_BASE', 'ISLR_BASE', 'INCES_BASE'].includes(key)) {
            return 'Acumuladores'
        }
        return 'Otros'
    }

    _getVariableDescription(key) {
        const descriptions = {
            SALARIO_PERIOD: 'Salario total del período en VES',
            SUELDO_BASE_PERIODO: 'Sueldo base del período en VES',
            SUELDO_BASE_DIARIO: 'Sueldo base diario',
            SALARIO_DIARIO: 'Salario total diario',
            COMPLEMENTO_BASE: 'Complemento salarial base',
            COMPLEMENTO_DIARIO: 'Complemento diario',
            DIAS_TOTALES: 'Días totales del período',
            DIAS_EFECTIVOS: 'Días trabajados efectivos',
            DIAS_DEDUCIDOS: 'Días de inasistencia',
            H_EXTRA_DIURNA: 'Horas extras diurnas',
            H_EXTRA_NOCTURNA: 'Horas extras nocturnas',
            BONO_NOCTURNO_CANT: 'Horas bono nocturno',
            DIAS_FERIADO_CANT: 'Días feriados trabajados',
            DOMINGO_TRABAJADO_CANT: 'Domingos trabajados',
            DIAS_DESCANSO_CANT: 'Días descanso trabajados',
            REPOSO_33_CANT: 'Días reposo 33%',
            REP_FULL_CANT: 'Días reposo 100%',
            LUNES: 'Lunes en el período',
            FAOV_BASE: 'Base FAOV',
            IVSS_BASE: 'Base IVSS',
            RPE_BASE: 'Base RPE',
            PRESTACIONES_BASE: 'Base Prestaciones',
            ISLR_BASE: 'Base ISLR',
            INCES_BASE: 'Base INCES'
        }
        return descriptions[key] || key
    }

    /**
     * Obtiene contrato activo del empleado para el período
     */
    async _getActiveContract(employeeId, period) {
        // Buscar en el modelo LaborContract si existe, sino usar datos del employee
        // Por ahora usamos los datos embebidos en Employee
        return {
            _id: new mongoose.Types.ObjectId(),
            employee: employeeId,
            salary_amount: 0, // Se tomará del employee
            salary_currency: 'USD',
            payment_frequency: 'QUINCENAL',
            start_date: period.start_date,
            end_date: null,
            is_active: true,
            includes_cestaticket: true,
            islr_retention_percentage: 0,
            branch: null,
            department: null,
            job_position: null
        }
    }

    /**
     * Construye snapshot del contrato
     */
    _buildContractSnapshot(contract, exchangeRate) {
        return {
            salary_amount: contract.salary_amount,
            salary_currency: contract.salary_currency,
            payment_frequency: contract.payment_frequency,
            contract_type: contract.contract_type,
            includes_cestaticket: contract.includes_cestaticket,
            islr_retention_percentage: contract.islr_retention_percentage,
            exchange_rate: exchangeRate,
            branch: contract.branch,
            department: contract.department,
            job_position: contract.job_position,
            start_date: contract.start_date,
            end_date: contract.end_date
        }
    }

    /**
     * Obtiene novedades del período para un empleado
     */
    async _getNovelties(employeeId, periodId) {
        const novelties = await PayrollNovelty.find({
            employee: employeeId,
            period: periodId,
            status: 'APPLIED'
        }).lean()

        const result = {}
        for (const n of novelties) {
            result[n.concept_code] = n.amount
        }
        return result
    }

    /**
     * Obtiene resumen de asistencia del período
     */
    async _getAttendanceSummary(employeeId, period) {
        const attendance = await Attendance.findOne({
            employee: employeeId,
            organizationID: this.organizationID
        }).lean()

        if (!attendance) {
            return {
                holidays_worked: 0,
                rest_days_worked: 0,
                sundays_worked: 0,
                overtime_day_hours: 0,
                overtime_night_hours: 0,
                night_bonus_hours: 0,
                reposo_33_days: 0,
                reposo_full_days: 0,
                absent_days: 0
            }
        }

        // Filtrar logs del período
        const logs = attendance.attendancelog.filter(log => {
            const logDate = new Date(log.logdate)
            return logDate >= period.start_date && logDate <= period.end_date
        })

        // Calcular métricas (simplificado - en producción usar biometrics_attendanceperiodsummary)
        let holidays_worked = 0
        let rest_days_worked = 0
        let sundays_worked = 0
        let overtime_day_hours = 0
        let overtime_night_hours = 0
        let night_bonus_hours = 0
        let absent_days = 0

        for (const log of logs) {
            if (log.logstatus === 'Absent') absent_days++
            if (log.duration && log.duration > 480) { // > 8 horas
                overtime_day_hours += (log.duration - 480) / 60
            }
        }

        // En producción: usar biometrics_attendanceperiodsummary
        return {
            holidays_worked,
            rest_days_worked,
            sundays_worked,
            overtime_day_hours,
            overtime_night_hours,
            night_bonus_hours,
            reposo_33_days: 0,
            reposo_full_days: 0,
            absent_days
        }
    }

    /**
     * Genera borrador de asiento contable
     */
    async generatePayrollJournalDraft(periodId, receipts) {
        // Implementación delegada a journal-generator.js
        // Por ahora placeholder
        return { lines: [] }
    }

    /**
     * Aplica tabla de tarifas (para nómina variable)
     */
    _applyRateTable(concept, context) {
        // Placeholder para nómina variable
        return new Decimal(0)
    }

    /**
     * Llama cálculo externo
     */
    _callExternalCalculation(concept, context) {
        // Placeholder para API externa
        return new Decimal(0)
    }

    /**
     * Recalcula un recibo individual
     */
    async recalculateReceipt(receiptId) {
        const receipt = await PayrollReceipt.findById(receiptId)
            .populate('employee')
            .populate('period')
            .populate('contract')

        if (!receipt) {
            throw new Error('Recibo no encontrado')
        }

        receipt.needs_recalculation = true
        await receipt.save()

        return this.calculateEmployeeReceipt(receipt.employee, receipt.period, receipt.contract)
    }
}

/**
 * Función helper para calcular período completo
 */
export async function calculatePayrollPeriod(organizationID, periodId) {
    const engine = new PayrollEngine(organizationID)
    await engine.initialize()
    return engine.calculatePayrollPeriod(periodId)
}

/**
 * Función helper para calcular recibo individual
 */
export async function calculateEmployeeReceipt(organizationID, employee, period, contract) {
    const engine = new PayrollEngine(organizationID)
    await engine.initialize()
    return engine.calculateEmployeeReceipt(employee, period, contract)
}

export default PayrollEngine