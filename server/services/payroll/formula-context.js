import { Decimal } from 'decimal.js'
import { PayrollPolicy } from '../../models/payroll/PayrollPolicy.model.js'
import { PayrollReceipt } from '../../models/payroll/PayrollReceipt.model.js'
import { AccumulatorEngine } from './accumulator-engine.js'

/**
 * Contexto de Evaluación de Fórmulas - FormulaContext
 * Construye todas las variables permitidas para evaluación de fórmulas dinámicas
 * Basado en la lógica de Nóminix (payroll_core/services/formula_evaluator.py)
 */
export class FormulaContext {
    constructor({
        employee,
        contract,
        period,
        receipt,
        exchangeRate,
        salaryBaseVes,
        novelties,
        attendance,
        policy,
        accumulators
    }) {
        this.employee = employee
        this.contract = contract
        this.period = period
        this.receipt = receipt
        this.exchangeRate = exchangeRate
        this.salaryBaseVes = salaryBaseVes
        this.novelties = novelties || {}
        this.attendance = attendance || {}
        this.policy = policy
        this.accumulators = accumulators || new AccumulatorEngine()
    }

    /**
     * Construye el objeto de variables permitidas para safe_eval
     * Retorna { variableName: Decimal }
     */
    getAllowedVariables() {
        const vars = {}

        // ═══════════════════════════════════════════════════════════════════
        // 1. VARIABLES SALARIALES BASE
        // ═══════════════════════════════════════════════════════════════════
        vars.SALARIO_PERIOD = this._getSalarioPeriod()
        vars.SUELDO_BASE_PERIODO = this._getSueldoBasePeriodo()
        vars.SUELDO_BASE_MENSUAL = this._getSueldoBaseMensual()
        vars.SUELDO_BASE_DIARIO = this._getSueldoBaseDiario()
        vars.SALARIO_DIARIO = this._getSalarioDiario()
        vars.COMPLEMENTO_BASE = this._getComplementoBase()
        vars.COMPLEMENTO_DIARIO = this._getComplementoDiario()
        vars.COMPLEMENTO_TOTAL = this._getComplementoTotal()

        // ═══════════════════════════════════════════════════════════════════
        // 2. VARIABLES DE TIEMPO Y ASISTENCIA
        // ═══════════════════════════════════════════════════════════════════
        const diasTotales = this.period?.days_count || 15
        vars.DIAS_TOTALES = new Decimal(diasTotales)
        vars.DIAS = vars.DIAS_TOTALES
        vars.DIAS_DEDUCIDOS = this._getDiasDeducidos()
        vars.DIAS_EFECTIVOS = vars.DIAS_TOTALES.minus(vars.DIAS_DEDUCIDOS)
        vars.SUELDO_BASE_CANT = vars.DIAS_EFECTIVOS

        vars.DIAS_FERIADO_CANT = new Decimal(this.attendance.holidays_worked || 0)
        vars.DIAS_DESCANSO_CANT = new Decimal(this.attendance.rest_days_worked || 0)
        vars.Domingo_Trabajado_CANT = new Decimal(this.attendance.sundays_worked || 0)
        vars.H_EXTRA_DIURNA = new Decimal(this.attendance.overtime_day_hours || 0)
        vars.H_EXTRA_NOCTURNA = new Decimal(this.attendance.overtime_night_hours || 0)
        vars.BONO_NOCTURNO_CANT = new Decimal(this.attendance.night_bonus_hours || 0)
        vars.REPOSO_33_CANT = new Decimal(this.attendance.reposo_33_days || 0)
        vars.REP_FULL_CANT = new Decimal(this.attendance.reposo_full_days || 0)
        vars.ANTICIPO_VAC_CANT = new Decimal(this._getAnticipoVacDays() || 0)
        vars.ANTICIPO_VAC_COMP_CANT = new Decimal(this._getAnticipoVacCompDays() || 0)
        vars.LUNES = new Decimal(this._countMondaysInPeriod() || 0)

        // Novedades dinámicas (concept_code_CANT)
        for (const [code, amount] of Object.entries(this.novelties)) {
            vars[`${code.toUpperCase()}_CANT`] = new Decimal(amount)
        }

        // ═══════════════════════════════════════════════════════════════════
        // 3. PARÁMETROS DE POLÍTICA (payroll_core_payrollpolicy)
        // ═══════════════════════════════════════════════════════════════════
        if (this.policy) {
            vars.minimum_wage_ves = new Decimal(this.policy.minimum_wage_ves || 130)
            vars.ivss_employee_rate = new Decimal(this.policy.ivss_employee_rate || 4)
            vars.ivss_employer_rate = new Decimal(this.policy.ivss_employer_rate || 9)
            vars.ivss_salary_cap_multiplier = new Decimal(this.policy.ivss_salary_cap_multiplier || 5)
            vars.faov_employee_rate = new Decimal(this.policy.faov_employee_rate || 1)
            vars.faov_employer_rate = new Decimal(this.policy.faov_employer_rate || 2)
            vars.rpe_employee_rate = new Decimal(this.policy.rpe_employee_rate || 0.5)
            vars.rpe_employer_rate = new Decimal(this.policy.rpe_employer_rate || 2)
            vars.lppss_rate = new Decimal(this.policy.lppss_rate || 9)
            vars.imii_usd = new Decimal(this.policy.imii_usd || 130)
            vars.inces_employer_rate = new Decimal(this.policy.inces_employer_rate || 2)
            vars.cestaticket_amount_usd = new Decimal(this.policy.cestaticket_amount_usd || 40)
            vars.ut_value_ves = new Decimal(this.policy.ut_value_ves || 9)
            vars.holiday_payout_factor = new Decimal(this.policy.holiday_payout_factor || 1.5)
            vars.rest_day_payout_factor = new Decimal(this.policy.rest_day_payout_factor || 1.5)
            vars.overtime_day_factor = new Decimal(this.policy.overtime_day_factor || 1.5)
            vars.overtime_night_factor = new Decimal(this.policy.overtime_night_factor || 1.5)
            vars.night_bonus_rate = new Decimal(this.policy.night_bonus_rate || 0.3)
            vars.vacation_days_base = new Decimal(this.policy.vacation_days_base || 15)
            vars.vacation_days_per_year = new Decimal(this.policy.vacation_days_per_year || 1)
            vars.vacation_days_max = new Decimal(this.policy.vacation_days_max || 30)
            vars.vacation_bonus_days_base = new Decimal(this.policy.vacation_bonus_days_base || 15)
            vars.vacation_bonus_days_per_year = new Decimal(this.policy.vacation_bonus_days_per_year || 1)
            vars.vacation_bonus_days_max = new Decimal(this.policy.vacation_bonus_days_max || 30)
            vars.min_service_months = new Decimal(this.policy.min_service_months || 12)
        }

        // ═══════════════════════════════════════════════════════════════════
        // 4. VARIABLES DE CONTRATO
        // ═══════════════════════════════════════════════════════════════════
        if (this.contract) {
            vars.ISLR_PORCENTAJE = new Decimal(this.contract.islr_retention_percentage || 0)
        }

        // Tasas (alias para compatibilidad con fórmulas existentes)
        vars.TASA_IVSS = vars.ivss_employee_rate || new Decimal(4)
        vars.TASA_RPE = vars.rpe_employee_rate || new Decimal(0.5)
        vars.TASA_FAOV = vars.faov_employee_rate || new Decimal(1)
        vars.TASA_PATRONAL_IVSS = vars.ivss_employer_rate || new Decimal(9)
        vars.TASA_PATRONAL_FAOV = vars.faov_employer_rate || new Decimal(2)
        vars.TASA_PATRONAL_RPE = vars.rpe_employer_rate || new Decimal(2)

        // ═══════════════════════════════════════════════════════════════════
        // 5. ACUMULADORES (Bases de Cálculo)
        // ═══════════════════════════════════════════════════════════════════
        for (const baseName of ['FAOV_BASE', 'IVSS_BASE', 'RPE_BASE', 'PRESTACIONES_BASE', 'ISLR_BASE', 'INCES_BASE']) {
            vars[baseName] = this.accumulators.get(baseName)
        }

        // ═══════════════════════════════════════════════════════════════════
        // 6. VALORES FIJOS ÚTILES
        // ═══════════════════════════════════════════════════════════════════
        vars.ZERO = new Decimal(0)
        vars.ONE = new Decimal(1)
        vars.HUNDRED = new Decimal(100)

        return vars
    }

    // ═══════════════════════════════════════════════════════════════════════
    // MÉTODOS PRIVADOS - Cálculo de variables
    // ═══════════════════════════════════════════════════════════════════════

    _getSalarioPeriod() {
        // Salario total del período (quincena/mes) en VES
        if (this.receipt?.salary_base_snapshot && this.exchangeRate) {
            return new Decimal(this.receipt.salary_base_snapshot).times(this.exchangeRate)
        }
        if (this.contract?.salary_amount && this.exchangeRate) {
            return new Decimal(this.contract.salary_amount).times(this.exchangeRate)
        }
        return new Decimal(this.salaryBaseVes || 0)
    }

    _getSueldoBasePeriodo() {
        // Sueldo base del período (sin complementos) - desde snapshot del recibo
        if (this.receipt?.contract_snapshot?.salary_amount && this.exchangeRate) {
            return new Decimal(this.receipt.contract_snapshot.salary_amount).times(this.exchangeRate)
        }
        return this._getSalarioPeriod()
    }

    _getSueldoBaseMensual() {
        // Sueldo base mensual pactado (tabular)
        if (this.contract?.salary_amount && this.exchangeRate) {
            const monthly = new Decimal(this.contract.salary_amount).times(this.exchangeRate)
            if (this.contract.payment_frequency === 'QUINCENAL') {
                return monthly.times(2)
            }
            if (this.contract.payment_frequency === 'SEMANAL') {
                return monthly.times(4.33)
            }
            return monthly
        }
        return new Decimal(0)
    }

    _getSueldoBaseDiario() {
        return this._getSueldoBaseMensual().div(30)
    }

    _getSalarioDiario() {
        // Salario total diario (incluye complemento)
        const salarioMensual = this._getSalarioPeriod()
        const diasPeriodo = this.period?.days_count || 15
        return salarioMensual.div(diasPeriodo)
    }

    _getComplementoBase() {
        // Complemento salarial base del período
        const salarioTotal = this._getSalarioPeriod()
        const sueldoBase = this._getSueldoBasePeriodo()
        return salarioTotal.minus(sueldoBase)
    }

    _getComplementoDiario() {
        return this._getComplementoBase().div(30)
    }

    _getComplementoTotal() {
        // Complemento final (base + bonos sumados) - se acumula en recibo
        return this._getComplementoBase()
    }

    _getDiasDeducidos() {
        // Días de inasistencia/faltas
        return new Decimal(this.attendance.absent_days || 0)
    }

    _getAnticipoVacDays() {
        return this.novelties.ANTICIPO_VAC_CANT || 0
    }

    _getAnticipoVacCompDays() {
        return this.novelties.ANTICIPO_VAC_COMP_CANT || 0
    }

    _countMondaysInPeriod() {
        if (!this.period?.start_date || !this.period?.end_date) return 0
        const start = new Date(this.period.start_date)
        const end = new Date(this.period.end_date)
        let count = 0
        const current = new Date(start)
        while (current <= end) {
            if (current.getUTCDay() === 1) count++ // Lunes = 1 en UTC
            current.setUTCDate(current.getUTCDate() + 1)
        }
        return count
    }

    /**
     * Obtiene política por defecto si no se proveyó
     */
    static async getDefaultPolicy(organizationID) {
        return PayrollPolicy.findOne({ organizationID }).lean()
    }

    /**
     * Crea contexto desde recibo (para recálculo)
     */
    static async fromReceipt(receiptId, organizationID) {
        const receipt = await PayrollReceipt.findById(receiptId).lean()
        if (!receipt) throw new Error('Recibo no encontrado')

        const policy = await this.getDefaultPolicy(organizationID)
        const accumulators = new AccumulatorEngine()

        // Reconstruir acumuladores desde líneas existentes
        // (se haría en payroll-engine al recalcular)

        return new FormulaContext({
            employee: receipt.employee,
            contract: receipt.contract,
            period: receipt.period,
            receipt,
            exchangeRate: receipt.exchange_rate_snapshot,
            salaryBaseVes: receipt.salary_base_snapshot,
            novelties: {},
            attendance: {},
            policy,
            accumulators
        })
    }
}

export default FormulaContext