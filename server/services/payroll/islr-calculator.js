import { Decimal } from 'decimal.js'
import { PayrollPolicy } from '../../models/payroll/PayrollPolicy.model.js'
import { ISLRRetention } from '../../models/payroll/ISLRRetention.model.js'
import { ISLRRetentionTable } from '../../models/payroll/ISLRRetentionTable.model.js'
import { PayrollPeriod } from '../../models/payroll/PayrollPeriod.model.js'
import { PayrollReceipt } from '../../models/payroll/PayrollReceipt.model.js'

/**
 * Calculador de ISLR Progresivo - ISLRCalculator
 * Basado en la lógica de Nóminix (payroll_core/services/islr_calculator.py)
 * Ley ISLR - Tabla progresiva por UT, retención mensual acumulada
 */

export class ISLRCalculator {
    constructor(policy) {
        this.policy = policy
    }

    /**
     * Calcula retención ISLR mensual para un empleado
     * @param {Object} params - { employee, period, taxableIncome }
     * @returns {Promise<Object>} { monthlyRetention, accumulatedIncome, accumulatedRetention }
     */
    async calculateMonthlyISLR({ employee, period, taxableIncome }) {
        const year = period.end_date.getFullYear()
        const month = period.end_date.getMonth() + 1

        // Obtener retenciones anteriores del año
        const prevRetentions = await ISLRRetention.find({
            employee: employee._id,
            year,
            month: { $lt: month }
        }).lean()

        const prevRetention = prevRetentions.reduce((sum, r) => sum + (r.retention_amount_ves || 0), 0)
        const prevIncome = prevRetentions.reduce((sum, r) => sum + (r.taxable_income_ves || 0), 0)

        const accumulatedIncome = new Decimal(prevIncome).plus(taxableIncome)

        // Obtener tabla ISLR del año
        const table = await this._getIslrTable(year)
        if (!table || table.length === 0) {
            return {
                monthlyRetention: new Decimal(0),
                accumulatedRetention: new Decimal(0),
                accumulatedIncome,
                rateApplied: 0,
                utValueUsed: this.policy?.ut_value_ves || 9
            }
        }

        const ut = this.policy?.ut_value_ves || 9
        let accumulatedRetention = new Decimal(0)

        for (const row of table) {
            const fromVes = new Decimal(row.income_from_ut || 0).times(ut)
            const toVes = row.income_to_ut ? new Decimal(row.income_to_ut).times(ut) : null

            if (accumulatedIncome.lte(fromVes)) break

            let taxableInTranche = accumulatedIncome.minus(fromVes)
            if (toVes) {
                taxableInTranche = Decimal.min(taxableInTranche, toVes.minus(fromVes))
            }

            if (taxableInTranche.gt(0)) {
                const rate = new Decimal(row.rate || 0).div(100)
                accumulatedRetention = accumulatedRetention.plus(taxableInTranche.times(rate))
                accumulatedRetention = accumulatedRetention.plus(
                    new Decimal(row.subtrahend || 0).times(ut).times(rate)
                )
            }
        }

        const monthlyRetention = Decimal.max(new Decimal(0), accumulatedRetention.minus(prevRetention))

        return {
            monthlyRetention: monthlyRetention.dp(2, Decimal.ROUND_HALF_UP),
            accumulatedRetention: accumulatedRetention.dp(2, Decimal.ROUND_HALF_UP),
            accumulatedIncome: accumulatedIncome.dp(2, Decimal.ROUND_HALF_UP),
            rateApplied: this._getEffectiveRate(accumulatedIncome, table, ut),
            utValueUsed: ut
        }
    }

    /**
     * Obtiene tasa efectiva para el ingreso acumulado
     */
    _getEffectiveRate(accumulatedIncome, table, ut) {
        for (const row of table) {
            const fromVes = new Decimal(row.income_from_ut || 0).times(ut)
            const toVes = row.income_to_ut ? new Decimal(row.income_to_ut).times(ut) : null

            if (accumulatedIncome.gte(fromVes) && (!toVes || accumulatedIncome.lte(toVes))) {
                return row.rate || 0
            }
        }
        return table[table.length - 1]?.rate || 0
    }

    /**
     * Obtiene tabla ISLR del año desde BD
     */
    async _getIslrTable(year) {
        // Consultar tabla desde base de datos
        const table = await ISLRRetentionTable.find(
            { year, is_active: true },
            { income_from_ut: 1, income_to_ut: 1, rate: 1, subtrahend: 1, ut_value: 1 }
        ).sort({ income_from_ut: 1 }).lean()

        if (!table || table.length === 0) {
            console.warn(`[ISLRCalculator] No ISLR table found for year ${year}, using default`)
            return getDefaultISLRTable()
        }

        return table.map(row => ({
            income_from_ut: row.income_from_ut,
            income_to_ut: row.income_to_ut,
            rate: row.rate,
            subtrahend: row.subtrahend
        }))
    }

    /**
     * Guarda retención calculada
     */
    async saveRetention({ employee, year, month, taxableIncome, retentionAmount, accumulatedIncome, accumulatedRetention, rateApplied, utValueUsed }) {
        return ISLRRetention.create({
            employee: employee._id,
            year,
            month,
            taxable_income_ves: taxableIncome,
            retention_amount_ves: retentionAmount,
            accumulated_income_ves: accumulatedIncome,
            accumulated_retention_ves: accumulatedRetention,
            rate_applied: rateApplied,
            ut_value_used: utValueUsed
        })
    }

    /**
     * Calcula retención ISLR para un período completo (todos los empleados)
     */
    async calculatePeriodISLR(period, receipts) {
        const results = []

        for (const receipt of receipts) {
            // Base gravable = ISLR_BASE del recibo
            const taxableIncome = receipt.islr_base || 0

            if (taxableIncome > 0) {
                const calculation = await this.calculateMonthlyISLR({
                    employee: receipt.employee,
                    period,
                    taxableIncome
                })

                await this.saveRetention({
                    employee: receipt.employee,
                    year: period.end_date.getFullYear(),
                    month: period.end_date.getMonth() + 1,
                    taxableIncome,
                    retentionAmount: calculation.monthlyRetention.toNumber(),
                    accumulatedIncome: calculation.accumulatedIncome.toNumber(),
                    accumulatedRetention: calculation.accumulatedRetention.toNumber(),
                    rateApplied: calculation.rateApplied,
                    utValueUsed: calculation.utValueUsed
                })

                results.push({
                    employee: receipt.employee,
                    receipt: receipt._id,
                    ...calculation
                })
            }
        }

        return results
    }

    /**
     * Recalcula ISLR para un empleado desde el inicio del año
     */
    async recalculateYearISLR(employee, year) {
        const periods = await PayrollPeriod.find({
            organizationID: employee.organizationID,
            end_date: {
                $gte: new Date(year, 0, 1),
                $lte: new Date(year, 11, 31, 23, 59, 59)
            },
            status: { $in: ['APPROVED', 'PAID'] }
        }).sort({ end_date: 1 }).lean()

        // Eliminar retenciones existentes del año
        await ISLRRetention.deleteMany({ employee: employee._id, year })

        const results = []

        for (const period of periods) {
            const receipt = await PayrollReceipt.findOne({
                employee: employee._id,
                period: period._id,
                status: { $in: ['APPROVED', 'PAID'] }
            }).lean()

            if (receipt && receipt.islr_base > 0) {
                const calculation = await this.calculateMonthlyISLR({
                    employee,
                    period,
                    taxableIncome: receipt.islr_base
                })

                await this.saveRetention({
                    employee,
                    year,
                    month: period.end_date.getMonth() + 1,
                    taxableIncome: receipt.islr_base,
                    retentionAmount: calculation.monthlyRetention.toNumber(),
                    accumulatedIncome: calculation.accumulatedIncome.toNumber(),
                    accumulatedRetention: calculation.accumulatedRetention.toNumber(),
                    rateApplied: calculation.rateApplied,
                    utValueUsed: calculation.utValueUsed
                })

                results.push({
                    period: period._id,
                    ...calculation
                })
            }
        }

        return results
    }
}

/**
 * Calcula ISLR mensual (función helper)
 */
export async function calculateISLRMonthly(employee, period, taxableIncome, policy) {
    const calculator = new ISLRCalculator(policy)
    return calculator.calculateMonthlyISLR({ employee, period, taxableIncome })
}

/**
 * Calcula retención ISLR acumulada (función helper)
 */
export function calculateAccumulatedISLR(accumulatedIncome, table, utValue) {
    let retention = new Decimal(0)

    for (const row of table) {
        const fromVes = new Decimal(row.income_from_ut || 0).times(utValue)
        const toVes = row.income_to_ut ? new Decimal(row.income_to_ut).times(utValue) : null

        if (accumulatedIncome.lte(fromVes)) break

        let taxableInTranche = accumulatedIncome.minus(fromVes)
        if (toVes) {
            taxableInTranche = Decimal.min(taxableInTranche, toVes.minus(fromVes))
        }

        if (taxableInTranche.gt(0)) {
            const rate = new Decimal(row.rate || 0).div(100)
            retention = retention.plus(taxableInTranche.times(rate))
            retention = retention.plus(new Decimal(row.subtrahend || 0).times(utValue).times(rate))
        }
    }

    return retention.dp(2, Decimal.ROUND_HALF_UP)
}

/**
 * Obtiene tabla ISLR por defecto (fallback)
 */
export function getDefaultISLRTable() {
    return [
        { income_from_ut: 0, income_to_ut: 1000, rate: 0, subtrahend: 0 },
        { income_from_ut: 1000, income_to_ut: 1500, rate: 6, subtrahend: 60 },
        { income_from_ut: 1500, income_to_ut: 2000, rate: 9, subtrahend: 105 },
        { income_from_ut: 2000, income_to_ut: 2500, rate: 12, subtrahend: 150 },
        { income_from_ut: 2500, income_to_ut: 3000, rate: 16, subtrahend: 250 },
        { income_from_ut: 3000, income_to_ut: 4000, rate: 20, subtrahend: 370 },
        { income_from_ut: 4000, income_to_ut: 6000, rate: 24, subtrahend: 530 },
        { income_from_ut: 6000, income_to_ut: 10000, rate: 28, subtrahend: 770 },
        { income_from_ut: 10000, income_to_ut: null, rate: 34, subtrahend: 1370 }
    ]
}

export default ISLRCalculator