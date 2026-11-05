import { Decimal } from 'decimal.js'
import { PayrollPolicy } from '../../models/payroll/PayrollPolicy.model.js'
import { PayrollReceipt } from '../../models/payroll/PayrollReceipt.model.js'
import { VacationBalance } from '../../models/payroll/VacationBalance.model.js'
import { VacationRequest } from '../../models/payroll/VacationRequest.model.js'

/**
 * Calculador de Vacaciones y Bono Vacacional - VacationCalculator
 * Basado en la lógica de Nóminix (vacations/services/vacation_calculator.py)
 * LOTTT Art. 186-197, LOPCYMAT
 */

export class VacationCalculator {
    constructor(policy) {
        this.policy = policy
    }

    /**
     * Calcula días de vacaciones por año de servicio
     * @param {Date} hireDate - Fecha de ingreso
     * @param {Date} referenceDate - Fecha de referencia (default: hoy)
     * @returns {number} Días de vacaciones
     */
    calculateVacationDays(hireDate, referenceDate = new Date()) {
        if (!hireDate) return 0

        const hire = new Date(hireDate)
        const ref = new Date(referenceDate)

        const years = (ref - hire) / (365.25 * 24 * 60 * 60 * 1000)
        const fullYears = Math.floor(years)

        // Mínimo 12 meses para tener derecho
        const minServiceMonths = this.policy?.min_service_months || 12
        if (fullYears < minServiceMonths / 12) return 0

        const baseDays = this.policy?.vacation_days_base || 15
        const perYear = this.policy?.vacation_days_per_year || 1
        const maxDays = this.policy?.vacation_days_max || 30

        // Primer año (fullYears >= 1) = baseDays, +1 por cada año adicional
        const additionalYears = Math.max(0, fullYears - 1)
        const days = baseDays + Math.min(additionalYears, maxDays - baseDays) * perYear
        return Math.min(days, maxDays)
    }

    /**
     * Calcula días de bono vacacional
     * @param {Date} hireDate - Fecha de ingreso
     * @param {Date} referenceDate - Fecha de referencia
     * @returns {number} Días de bono vacacional
     */
    calculateBonoVacacionalDays(hireDate, referenceDate = new Date()) {
        if (!hireDate) return 0

        const hire = new Date(hireDate)
        const ref = new Date(referenceDate)

        const years = (ref - hire) / (365.25 * 24 * 60 * 60 * 1000)
        const fullYears = Math.floor(years)

        const minServiceMonths = this.policy?.min_service_months || 12
        if (fullYears < minServiceMonths / 12) return 0

        const baseDays = this.policy?.vacation_bonus_days_base || 15
        const perYear = this.policy?.vacation_bonus_days_per_year || 1
        const maxDays = this.policy?.vacation_bonus_days_max || 30

        // Primer año (fullYears >= 1) = baseDays, +1 por cada año adicional
        const additionalYears = Math.max(0, fullYears - 1)
        const days = baseDays + Math.min(additionalYears, maxDays - baseDays) * perYear
        return Math.min(days, maxDays)
    }

    /**
     * Calcula salario vacacional diario según base de cálculo
     * @param {Object} employee - Documento Employee
     * @param {string} calculationBase - LAST_SALARY, AVERAGE_3M, AVERAGE_6M, BEST_YEAR
     * @returns {Promise<Decimal>} Salario vacacional diario
     */
    async calculateVacationSalaryDaily(employee, calculationBase = null) {
        const base = calculationBase || this.policy?.vacation_salary_basis || 'LAST_SALARY'

        switch (base) {
            case 'LAST_SALARY':
                return this._getLastSalaryDaily(employee)
            case 'AVERAGE_3M':
                return this._getAverageSalaryDaily(employee, 3)
            case 'AVERAGE_6M':
                return this._getAverageSalaryDaily(employee, 6)
            case 'BEST_YEAR':
                return this._getBestYearSalaryDaily(employee)
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
            // Salario total diario del último recibo
            const periodDays = lastReceipt.period?.days_count || 15
            return new Decimal(lastReceipt.total_income_ves).div(periodDays)
        }

        // Fallback: salario del contrato
        if (employee.salary_amount) {
            return new Decimal(employee.salary_amount).div(30)
        }

        return new Decimal(0)
    }

    async _getAverageSalaryDaily(employee, months) {
        const receipts = await PayrollReceipt.find({
            employee: employee._id,
            status: { $in: ['APPROVED', 'PAID'] }
        }).sort({ 'period.end_date': -1 }).limit(months).lean()

        if (receipts.length === 0) {
            return this._getLastSalaryDaily(employee)
        }

        const total = receipts.reduce((sum, r) => sum + (r.total_income_ves || 0), 0)
        const avgPeriodIncome = total / receipts.length
        const periodDays = receipts[0].period?.days_count || 15

        return new Decimal(avgPeriodIncome).div(periodDays)
    }

    async _getBestYearSalaryDaily(employee) {
        const oneYearAgo = new Date()
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

        const receipts = await PayrollReceipt.find({
            employee: employee._id,
            status: { $in: ['APPROVED', 'PAID'] },
            'period.end_date': { $gte: oneYearAgo }
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
     * Calcula pago completo de vacaciones
     * @param {Object} params - { employee, daysEnjoyed, bonusDays, calculationBase, includeCestaticket }
     * @returns {Promise<Object>} { salarioVacacional, bonoVacacional, cestaticketVacacional, total }
     */
    async calculateVacationPayment({
        employee,
        daysEnjoyed,
        bonusDays = null,
        calculationBase = null,
        includeCestaticket = true
    }) {
        const dailySalary = await this.calculateVacationSalaryDaily(employee, calculationBase)

        // Si no se especifican días de bono, calcular según antigüedad
        if (bonusDays === null) {
            bonusDays = this.calculateBonoVacacionalDays(employee.hire_date)
        }

        const cestaticketDaily = includeCestaticket
            ? this._getCestaticketDaily(employee)
            : new Decimal(0)

        const salarioVacacional = dailySalary.times(daysEnjoyed)
        const bonoVacacional = dailySalary.times(bonusDays)
        const cestaticketVacacional = cestaticketDaily.times(daysEnjoyed)

        const total = salarioVacacional.plus(bonoVacacional).plus(cestaticketVacacional)

        return {
            salarioVacacional: salarioVacacional.dp(2, Decimal.ROUND_HALF_UP),
            bonoVacacional: bonoVacacional.dp(2, Decimal.ROUND_HALF_UP),
            cestaticketVacacional: cestaticketVacacional.dp(2, Decimal.ROUND_HALF_UP),
            total: total.dp(2, Decimal.ROUND_HALF_UP),
            dailySalary: dailySalary.dp(2, Decimal.ROUND_HALF_UP),
            daysEnjoyed,
            bonusDays,
            cestaticketDaily: cestaticketDaily.dp(2, Decimal.ROUND_HALF_UP)
        }
    }

    _getCestaticketDaily(employee) {
        const policy = this.policy
        if (!policy) return new Decimal(0)

        const cestaticketMonthlyUsd = policy.cestaticket_amount_usd || 40
        const exchangeRate = employee.active_contract?.exchange_rate || 1

        return new Decimal(cestaticketMonthlyUsd).times(exchangeRate).div(30)
    }

    /**
     * Genera recibo de vacaciones (tipo VACACIONES)
     */
    async generateVacationReceipt(employee, vacationRequest, paymentCalculation) {
        // Placeholder - implementar cuando se tenga PayrollReceipt tipo VACACIONES
        return {
            employee: employee._id,
            vacationRequest: vacationRequest._id,
            ...paymentCalculation,
            type: 'VACACIONES'
        }
    }

    /**
     * Actualiza saldo de vacaciones
     */
    async updateVacationBalance(employeeId, daysTaken, periodStart, periodEnd, dailySalary) {
        let balance = await VacationBalance.findOne({ employee: employeeId })

        if (!balance) {
            balance = await VacationBalance.create({
                employee: employeeId,
                accrued_days: 0,
                taken_days: 0,
                pending_days: 0,
                expired_days: 0,
                current_period_start: periodStart,
                current_period_end: periodEnd,
                daily_salary_ves: dailySalary.toNumber(),
                organizationID: employeeId // TODO: obtener orgID
            })
        }

        balance.taken_days += daysTaken
        balance.pending_days = Math.max(0, balance.pending_days - daysTaken)
        balance.daily_salary_ves = dailySalary.toNumber()

        await balance.save()
        return balance
    }

    /**
     * Procesa acumulación de vacaciones (cron job mensual/anual)
     */
    static async accrueVacationsForAllEmployees(organizationID, policy) {
        const calculator = new VacationCalculator(policy)
        const employees = await Employee.find({ organizationID, isactive: true }).lean()

        for (const emp of employees) {
            const days = calculator.calculateVacationDays(emp.hire_date)
            if (days > 0) {
                await VacationBalance.findOneAndUpdate(
                    { employee: emp._id },
                    {
                        $inc: { accrued_days: days, pending_days: days },
                        $set: { current_period_end: new Date() }
                    },
                    { upsert: true, new: true }
                )
            }
        }
    }
}

/**
 * Calcula días de vacaciones (función helper)
 */
export async function calculateVacationDays(employee, policy, referenceDate) {
    const calculator = new VacationCalculator(policy)
    return calculator.calculateVacationDays(employee.hire_date, referenceDate)
}

/**
 * Calcula días de bono vacacional (función helper)
 */
export async function calculateBonoVacacionalDays(employee, policy, referenceDate) {
    const calculator = new VacationCalculator(policy)
    return calculator.calculateBonoVacacionalDays(employee.hire_date, referenceDate)
}

/**
 * Calcula salario vacacional diario (función helper)
 */
export async function calculateVacationSalaryDaily(employee, policy, calculationBase) {
    const calculator = new VacationCalculator(policy)
    return calculator.calculateVacationSalaryDaily(employee, calculationBase)
}

export default VacationCalculator