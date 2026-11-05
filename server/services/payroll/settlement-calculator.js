import { Decimal } from 'decimal.js'
import { PayrollPolicy } from '../../models/payroll/PayrollPolicy.model.js'
import { PayrollReceipt } from '../../models/payroll/PayrollReceipt.model.js'
import { VacationBalance } from '../../models/payroll/VacationBalance.model.js'
import { VacationRequest } from '../../models/payroll/VacationRequest.model.js'
import { SocialBenefitsLedger } from '../../models/payroll/SocialBenefitsLedger.model.js'
import { UtilidadesPayment } from '../../models/payroll/UtilidadesPayment.model.js'
import { VacationCalculator } from './vacation-calculator.js'

/**
 * Calculador de Prestaciones Sociales (Liquidaciones) - SettlementCalculator
 * Basado en la lógica de Nóminix (social_benefits/services/settlement_calculator.py)
 * LOTTT Art. 108-120, Ley de Prestaciones Sociales
 */

export class SettlementCalculator {
    constructor(config, policy) {
        this.config = config // SocialBenefitsConfig
        this.policy = policy // PayrollPolicy
        this.vacationCalculator = new VacationCalculator(policy)
    }

    /**
     * Calcula salario diario para prestaciones según base configurada
     * @param {Object} employee - Documento Employee
     * @param {Date} settlementDate - Fecha de liquidación
     * @returns {Promise<Decimal>} Salario diario
     */
    async calculateDailySalaryForBenefits(employee, settlementDate = new Date()) {
        const base = this.config?.calculation_base || 'LAST_SALARY'

        switch (base) {
            case 'LAST_SALARY':
                return this._getLastSalaryDaily(employee)
            case 'AVERAGE_3M':
                return this._getAverageSalaryDaily(employee, 3, settlementDate)
            case 'AVERAGE_6M':
                return this._getAverageSalaryDaily(employee, 6, settlementDate)
            case 'BEST_YEAR':
                return this._getBestYearSalaryDaily(employee, settlementDate)
            default:
                return this._getLastSalaryDaily(employee)
        }
    }

    async _getLastSalaryDaily(employee) {
        const lastReceipt = await PayrollReceipt.findOne({
            employee: employee._id,
            status: { $in: ['APPROVED', 'PAID'] }
        }).sort({ 'period.end_date': -1 }).lean()

        if (lastReceipt) {
            const periodDays = lastReceipt.period?.days_count || 15
            return new Decimal(lastReceipt.total_income_ves).div(periodDays)
        }

        if (employee.salary_amount) {
            return new Decimal(employee.salary_amount).div(30)
        }

        return new Decimal(0)
    }

    async _getAverageSalaryDaily(employee, months, settlementDate) {
        const receipts = await PayrollReceipt.find({
            employee: employee._id,
            status: { $in: ['APPROVED', 'PAID'] },
            'period.end_date': { $lte: settlementDate }
        }).sort({ 'period.end_date': -1 }).limit(months).lean()

        if (receipts.length === 0) {
            return this._getLastSalaryDaily(employee)
        }

        const total = receipts.reduce((sum, r) => sum + (r.total_income_ves || 0), 0)
        const avgPeriodIncome = total / receipts.length
        const periodDays = receipts[0].period?.days_count || 15

        return new Decimal(avgPeriodIncome).div(periodDays)
    }

    async _getBestYearSalaryDaily(employee, settlementDate) {
        const oneYearAgo = new Date(settlementDate)
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

        const receipts = await PayrollReceipt.find({
            employee: employee._id,
            status: { $in: ['APPROVED', 'PAID'] },
            'period.end_date': { $gte: oneYearAgo, $lte: settlementDate }
        }).lean()

        if (receipts.length === 0) {
            return this._getLastSalaryDaily(employee)
        }

        let maxDaily = new Decimal(0)
        for (const r of receipts) {
            const periodDays = r.period?.days_count || 15
            const daily = new Decimal(r.total_income_ves || 0).div(periodDays)
            if (daily.gt(maxDaily)) maxDaily = daily
        }

        return maxDaily
    }

    /**
     * Calcula liquidación completa
     * @param {Object} params - { contract, settlementDate, cause, employee }
     * @returns {Promise<Object>} Detalle de liquidación
     */
    async calculateSettlement({ contract, settlementDate = new Date(), cause = 'RESIGNATION', employee }) {
        const dailySalary = await this.calculateDailySalaryForBenefits(employee, settlementDate)
        const hireDate = contract.start_date || employee.hire_date

        if (!hireDate) {
            throw new Error('Fecha de ingreso requerida para calcular liquidación')
        }

        // Años de servicio
        const yearsService = (settlementDate - new Date(hireDate)) / (365.25 * 24 * 60 * 60 * 1000)

        // Días de antigüedad (30 días por año, tope configurado)
        const seniorityCapYears = this.config?.seniority_cap_years || 30
        const seniorityDays = Math.min(Math.floor(yearsService * 30), seniorityCapYears * 30)
        const seniorityAmount = dailySalary.times(seniorityDays)

        // Vacaciones pendientes
        const balance = await VacationBalance.findOne({ employee: employee._id }).lean()
        const pendingVacationDays = balance?.pending_days || 0
        const vacationAmount = dailySalary.times(pendingVacationDays)

        // Bono vacacional pendiente
        const bonusDays = this.vacationCalculator.calculateBonoVacacionalDays(employee.hire_date, settlementDate)
        const takenBonusDays = balance?.taken_bonus_days || 0
        const pendingBonusDays = Math.max(0, bonusDays - takenBonusDays)
        const bonusAmount = dailySalary.times(pendingBonusDays)

        // Cestaticket proporcional
        let cestaticketAmount = new Decimal(0)
        if (this.config?.include_cestaticket) {
            const cestaticketMonthly = (this.policy?.cestaticket_amount_usd || 40) * (employee.active_contract?.exchange_rate || 1)
            const cestaticketDaily = new Decimal(cestaticketMonthly).div(30)
            const daysWorkedLastMonth = this._getDaysWorkedInMonth(employee, settlementDate.getMonth(), settlementDate.getFullYear())
            cestaticketAmount = cestaticketDaily.times(daysWorkedLastMonth)
        }

        // Comisiones (si config.include_commissions)
        let commissionsAmount = new Decimal(0)
        if (this.config?.include_commissions) {
            commissionsAmount = await this._getPendingCommissions(employee, settlementDate)
        }

        // Bonos (si config.include_bonuses)
        let bonusesAmount = new Decimal(0)
        if (this.config?.include_bonuses) {
            bonusesAmount = await this._getPendingBonuses(employee, settlementDate)
        }

        // Horas extra (si config.include_overtime)
        let overtimeAmount = new Decimal(0)
        if (this.config?.include_overtime) {
            overtimeAmount = await this._getPendingOvertime(employee, settlementDate)
        }

        // Utilidades pendientes (si config.include_utilidades)
        let utilitiesAmount = new Decimal(0)
        if (this.config?.include_utilidades) {
            utilitiesAmount = await this._getPendingUtilities(employee, settlementDate)
        }

        // Total
        const total = seniorityAmount
            .plus(vacationAmount)
            .plus(bonusAmount)
            .plus(cestaticketAmount)
            .plus(commissionsAmount)
            .plus(bonusesAmount)
            .plus(overtimeAmount)
            .plus(utilitiesAmount)

        return {
            dailySalary: dailySalary.dp(2, Decimal.ROUND_HALF_UP),
            yearsService: Math.floor(yearsService * 100) / 100,
            seniorityDays,
            seniorityAmount: seniorityAmount.dp(2, Decimal.ROUND_HALF_UP),
            pendingVacationDays,
            vacationAmount: vacationAmount.dp(2, Decimal.ROUND_HALF_UP),
            bonusDays: pendingBonusDays,
            bonusAmount: bonusAmount.dp(2, Decimal.ROUND_HALF_UP),
            cestaticketAmount: cestaticketAmount.dp(2, Decimal.ROUND_HALF_UP),
            commissionsAmount: commissionsAmount.dp(2, Decimal.ROUND_HALF_UP),
            bonusesAmount: bonusesAmount.dp(2, Decimal.ROUND_HALF_UP),
            overtimeAmount: overtimeAmount.dp(2, Decimal.ROUND_HALF_UP),
            utilitiesAmount: utilitiesAmount.dp(2, Decimal.ROUND_HALF_UP),
            total: total.dp(2, Decimal.ROUND_HALF_UP),
            cause,
            settlementDate
        }
    }

    /**
     * Genera registro de liquidación en BD
     */
    async createSettlementRecord({ contract, settlementDate, cause, employee, calculatedBy }) {
        const settlement = await this.calculateSettlement({ contract, settlementDate, cause, employee })

        const record = await SocialBenefitsSettlement.create({
            contract: contract._id,
            settlement_date: settlementDate,
            cause,
            daily_salary_ves: settlement.dailySalary.toNumber(),
            accrued_days: settlement.seniorityDays,
            pending_days: settlement.pendingVacationDays,
            seniority_amount: settlement.seniorityAmount.toNumber(),
            vacation_amount: settlement.vacationAmount.toNumber(),
            bonus_amount: settlement.bonusAmount.toNumber(),
            cestaticket_amount: settlement.cestaticketAmount.toNumber(),
            // commissions, bonuses, overtime, utilities se pueden agregar al modelo
            total_ves: settlement.total.toNumber(),
            status: 'DRAFT',
            organizationID: employee.organizationID
        })

        return { settlement, record }
    }

    /**
     * Calcula acumulación mensual de prestaciones (para contabilidad)
     * @param {Object} employee
     * @param {Date} periodStart
     * @param {Date} periodEnd
     * @returns {Promise<Object>} { amount, daysAccrued, dailySalary }
     */
    async calculateMonthlyAccrual(employee, periodStart, periodEnd) {
        const dailySalary = await this.calculateDailySalaryForBenefits(employee, periodEnd)
        const daysInPeriod = Math.ceil((periodEnd - periodStart) / (24 * 60 * 60 * 1000)) + 1
        const daysAccrued = Math.min(daysInPeriod, 30) // Máx 30 días/mes

        const amount = dailySalary.times(daysAccrued)

        return {
            amount: amount.dp(2, Decimal.ROUND_HALF_UP),
            daysAccrued,
            dailySalary: dailySalary.dp(2, Decimal.ROUND_HALF_UP),
            periodStart,
            periodEnd
        }
    }

    /**
     * Registra acumulación en libro de prestaciones
     */
    async recordAccrual(employee, contract, periodStart, periodEnd, amount, daysAccrued, dailySalary) {
        return SocialBenefitsLedger.create({
            employee: employee._id,
            contract: contract._id,
            entry_type: 'ACCRUAL',
            amount_ves: amount.toNumber(),
            days_accrued: daysAccrued,
            daily_salary_ves: dailySalary.toNumber(),
            period_start: periodStart,
            period_end: periodEnd,
            organizationID: employee.organizationID
        })
    }

    /**
     * Obtiene días trabajados en un mes específico
     */
    _getDaysWorkedInMonth(employee, month, year) {
        // Placeholder - en producción usar biometrics_attendanceperiodsummary
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        return daysInMonth
    }

    /**
     * Obtiene comisiones pendientes
     */
    async _getPendingCommissions(employee, settlementDate) {
        // Placeholder - implementar con nomina_variable
        return new Decimal(0)
    }

    /**
     * Obtiene bonos pendientes
     */
    async _getPendingBonuses(employee, settlementDate) {
        // Placeholder
        return new Decimal(0)
    }

    /**
     * Obtiene horas extra pendientes
     */
    async _getPendingOvertime(employee, settlementDate) {
        // Placeholder
        return new Decimal(0)
    }

    /**
     * Obtiene utilidades pendientes
     */
    async _getPendingUtilities(employee, settlementDate) {
        const pending = await UtilidadesPayment.findOne({
            employee: employee._id,
            status: 'PENDING'
        }).sort({ 'period.year': -1 }).lean()

        if (pending) {
            return new Decimal(pending.net_amount_ves || 0)
        }
        return new Decimal(0)
    }
}

/**
 * Calcula liquidación (función helper)
 */
export async function calculateSettlement(contract, settlementDate, cause, config, policy, employee) {
    const calculator = new SettlementCalculator(config, policy)
    return calculator.calculateSettlement({ contract, settlementDate, cause, employee })
}

/**
 * Calcula antigüedad (función helper)
 */
export function calculateSeniority(hireDate, settlementDate, capYears = 30) {
    const years = (settlementDate - new Date(hireDate)) / (365.25 * 24 * 60 * 60 * 1000)
    const days = Math.min(Math.floor(years * 30), capYears * 30)
    return { years: Math.floor(years * 100) / 100, days }
}

/**
 * Calcula vacaciones pendientes (función helper)
 */
export async function calculatePendingVacations(employee, policy, settlementDate) {
    const balance = await VacationBalance.findOne({ employee: employee._id }).lean()
    return balance?.pending_days || 0
}

/**
 * Calcula cestaticket proporcional (función helper)
 */
export async function calculateCestaticketProportional(employee, policy, settlementDate, config) {
    if (!config?.include_cestaticket) return new Decimal(0)

    const cestaticketMonthly = (policy?.cestaticket_amount_usd || 40) * (employee.active_contract?.exchange_rate || 1)
    const cestaticketDaily = new Decimal(cestaticketMonthly).div(30)
    const daysInMonth = new Date(settlementDate.getFullYear(), settlementDate.getMonth() + 1, 0).getDate()
    // Simplificado: asumir mes completo trabajado
    return cestaticketDaily.times(daysInMonth)
}

export default SettlementCalculator