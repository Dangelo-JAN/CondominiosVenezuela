import { Decimal } from 'decimal.js'
import { PayrollPolicy } from '../../models/payroll/PayrollPolicy.model.js'
import { PayrollReceipt } from '../../models/payroll/PayrollReceipt.model.js'
import { UtilidadesPeriod } from '../../models/payroll/UtilidadesPeriod.model.js'
import { UtilidadesPayment } from '../../models/payroll/UtilidadesPayment.model.js'
import { Employee } from '../../models/Employee.model.js'

/**
 * Calculador de Utilidades (Reparto 15% Utilidades Netas) - UtilidadesCalculator
 * Basado en la lógica de Nóminix (utilidades/services/utilidades_calculator.py)
 * LOTTT Art. 146-154
 */

export class UtilidadesCalculator {
    constructor(policy, utilidadesConfig) {
        this.policy = policy
        this.config = utilidadesConfig // UtilidadesPolicyConfig
    }

    /**
     * Calcula utilidades para un período anual
     * @param {Object} params - { period, netProfitVes, company }
     * @returns {Promise<Object>} Resultados por empleado
     */
    async calculateUtilidades({ period, netProfitVes, company }) {
        const distributable = new Decimal(netProfitVes).times(0.15) // 15% obligatorio

        // Obtener empleados elegibles
        const employees = await this._getEligibleEmployees(company._id, period.year)

        // Calcular totales para distribución
        let totalDays = 0
        let totalSalary = new Decimal(0)
        const employeeData = {}

        for (const emp of employees) {
            const days = await this._getDaysWorkedInYear(emp, period.year)
            const salary = await this._getAverageSalaryForUtilidades(emp, period.year)

            employeeData[emp._id.toString()] = { days, salary, employee: emp }
            totalDays += days
            totalSalary = totalSalary.plus(salary)
        }

        // Método de distribución
        const method = this.config?.distribution_method || 'MIXED_50_50'
        let byDays, bySalary

        if (method === 'MIXED_50_50') {
            byDays = distributable.times(0.5)
            bySalary = distributable.times(0.5)
        } else if (method === 'DAYS_ONLY') {
            byDays = distributable
            bySalary = new Decimal(0)
        } else if (method === 'SALARY_ONLY') {
            byDays = new Decimal(0)
            bySalary = distributable
        } else {
            byDays = distributable.times(0.5)
            bySalary = distributable.times(0.5)
        }

        // Calcular por empleado
        const results = {}
        for (const [empId, data] of Object.entries(employeeData)) {
            let amount = new Decimal(0)

            if (totalDays > 0 && byDays.gt(0)) {
                amount = amount.plus(byDays.times(new Decimal(data.days)).div(totalDays))
            }

            if (totalSalary.gt(0) && bySalary.gt(0)) {
                amount = amount.plus(bySalary.times(data.salary).div(totalSalary))
            }

            // Retención ISLR sobre utilidades
            const islr = await this._calculateIslrOnUtilidades(amount, period.year, data.employee)
            const net = amount.minus(islr)

            results[empId] = {
                employee: data.employee,
                daysWorked: data.days,
                averageSalary: data.salary,
                grossAmount: amount.dp(2, Decimal.ROUND_HALF_UP),
                islrRetention: islr.dp(2, Decimal.ROUND_HALF_UP),
                netAmount: net.dp(2, Decimal.ROUND_HALF_UP)
            }
        }

        return {
            period: period._id,
            year: period.year,
            netProfitVes,
            distributableAmount: distributable.dp(2, Decimal.ROUND_HALF_UP),
            totalEmployees: employees.length,
            totalDaysWorked: totalDays,
            totalSalaryBase: totalSalary,
            dailyRate: totalDays > 0 ? byDays.div(totalDays).dp(2, Decimal.ROUND_HALF_UP) : new Decimal(0),
            distributionMethod: method,
            results
        }
    }

    /**
     * Obtiene empleados elegibles para utilidades
     */
    async _getEligibleEmployees(companyId, year) {
        const startOfYear = new Date(year, 0, 1)
        const endOfYear = new Date(year, 11, 31, 23, 59, 59)

        return Employee.find({
            organizationID: companyId,
            isactive: true,
            hire_date: { $lte: endOfYear },
            exclude_from_billing: { $ne: true },
            $or: [
                { termination_date: null },
                { termination_date: { $gte: startOfYear } }
            ]
        }).lean()
    }

    /**
     * Calcula días trabajados en el año
     */
    async _getDaysWorkedInYear(employee, year) {
        const startOfYear = new Date(year, 0, 1)
        const endOfYear = new Date(year, 11, 31, 23, 59, 59)

        const hireDate = new Date(employee.hire_date)
        const effectiveStart = hireDate > startOfYear ? hireDate : startOfYear

        const terminationDate = employee.termination_date ? new Date(employee.termination_date) : endOfYear
        const effectiveEnd = terminationDate < endOfYear ? terminationDate : endOfYear

        if (effectiveStart > effectiveEnd) return 0

        const diffTime = effectiveEnd - effectiveStart
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

        return diffDays
    }

    /**
     * Obtiene salario promedio para utilidades
     */
    async _getAverageSalaryForUtilidades(employee, year) {
        const receipts = await PayrollReceipt.find({
            employee: employee._id,
            status: { $in: ['APPROVED', 'PAID'] },
            'period.end_date': {
                $gte: new Date(year, 0, 1),
                $lte: new Date(year, 11, 31, 23, 59, 59)
            }
        }).lean()

        if (receipts.length === 0) {
            // Fallback: salario contractual
            return new Decimal(employee.salary_amount || 0)
        }

        const total = receipts.reduce((sum, r) => sum + (r.total_income_ves || 0), 0)
        return new Decimal(total).div(receipts.length)
    }

    /**
     * Calcula retención ISLR sobre utilidades
     * Usa tabla progresiva ISLR del año
     */
    async _calculateIslrOnUtilidades(amount, year, employee) {
        const utValue = this.policy?.ut_value_ves || 9

        // Obtener tabla ISLR del año
        const table = await this._getIslrTable(year)
        if (!table || table.length === 0) {
            return new Decimal(0)
        }

        // Retención ISLR sobre utilidades se calcula como ingreso adicional
        // Simplificado: aplicar tasa marginal correspondiente
        let retention = new Decimal(0)
        let remaining = amount

        for (const row of table) {
            const fromUt = new Decimal(row.income_from_ut || 0)
            const toUt = row.income_to_ut ? new Decimal(row.income_to_ut) : null
            const fromVes = fromUt.times(utValue)
            const toVes = toUt ? toUt.times(utValue) : null

            if (remaining.lte(0)) break

            let taxableInTranche = remaining
            if (toVes) {
                const maxInTranche = toVes.minus(fromVes)
                taxableInTranche = Decimal.min(taxableInTranche, maxInTranche)
            }

            if (taxableInTranche.gt(0)) {
                retention = retention.plus(taxableInTranche.times(new Decimal(row.rate || 0).div(100)))
                retention = retention.plus(new Decimal(row.subtrahend || 0).times(utValue).times(new Decimal(row.rate || 0).div(100)))
            }

            remaining = remaining.minus(taxableInTranche)
        }

        return retention.dp(2, Decimal.ROUND_HALF_UP)
    }

    /**
     * Obtiene tabla ISLR del año
     */
    async _getIslrTable(year) {
        // En producción: consultar payroll_core_islrretentiontable
        // Por ahora tabla por defecto 2024-2025
        return [
            { income_from_ut: 0, income_to_ut: 1000, rate: 0, subtrahend: 0 },
            { income_from_ut: 1000, income_to_ut: 2000, rate: 6, subtrahend: 60 },
            { income_from_ut: 2000, income_to_ut: 3000, rate: 9, subtrahend: 120 },
            { income_from_ut: 3000, income_to_ut: 4000, rate: 12, subtrahend: 210 },
            { income_from_ut: 4000, income_to_ut: 5000, rate: 16, subtrahend: 370 },
            { income_from_ut: 5000, income_to_ut: 6000, rate: 20, subtrahend: 570 },
            { income_from_ut: 6000, income_to_ut: null, rate: 24, subtrahend: 810 }
        ]
    }

    /**
     * Genera pagos de utilidades en BD
     */
    async generateUtilidadesPayments(period, results) {
        const payments = []

        for (const [empId, data] of Object.entries(results)) {
            const payment = await UtilidadesPayment.create({
                employee: empId,
                period: period._id,
                days_worked: data.daysWorked,
                daily_rate_ves: data.averageSalary.toNumber(),
                gross_amount_ves: data.grossAmount.toNumber(),
                islr_retention_ves: data.islrRetention.toNumber(),
                net_amount_ves: data.netAmount.toNumber(),
                status: 'PENDING',
                organizationID: period.organizationID
            })
            payments.push(payment)
        }

        return payments
    }

    /**
     * Aprueba y cierra período de utilidades
     */
    async approveUtilidadesPeriod(periodId, approvedBy) {
        const period = await UtilidadesPeriod.findByIdAndUpdate(periodId, {
            status: 'APPROVED',
            approved_by: approvedBy,
            approved_at: new Date()
        }, { new: true })

        return period
    }

    /**
     * Marca pagos como pagados
     */
    async markPaymentsPaid(periodId, paymentDate, paymentMethod) {
        return UtilidadesPayment.updateMany(
            { period: periodId, status: 'PENDING' },
            {
                status: 'PAID',
                payment_date: paymentDate,
                payment_method: paymentMethod
            }
        )
    }
}

/**
 * Calcula utilidades (función helper)
 */
export async function calculateUtilidades(period, netProfitVes, policy, config) {
    const calculator = new UtilidadesCalculator(policy, config)
    return calculator.calculateUtilidades({ period, netProfitVes, company: { _id: period.organizationID } })
}

/**
 * Distribuye 15% (función helper)
 */
export function distribute15Percent(distributable, employeesData, method = 'MIXED_50_50') {
    const byDays = method === 'DAYS_ONLY' ? distributable : distributable.times(0.5)
    const bySalary = method === 'SALARY_ONLY' ? distributable : distributable.times(0.5)

    const totalDays = employeesData.reduce((sum, e) => sum + e.days, 0)
    const totalSalary = employeesData.reduce((sum, e) => sum.plus(e.salary), new Decimal(0))

    return employeesData.map(e => {
        let amount = new Decimal(0)
        if (totalDays > 0) amount = amount.plus(byDays.times(e.days).div(totalDays))
        if (totalSalary.gt(0)) amount = amount.plus(bySalary.times(e.salary).div(totalSalary))
        return amount
    })
}

/**
 * Calcula ISLR sobre utilidades (función helper)
 */
export async function calculateIslrOnUtilidades(amount, year, policy) {
    // Placeholder - usar método de la clase
    return new Decimal(0)
}

export default UtilidadesCalculator