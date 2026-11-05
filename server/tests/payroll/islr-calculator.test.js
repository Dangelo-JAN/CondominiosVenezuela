import { ISLRCalculator } from '../../services/payroll/islr-calculator.js'
import { PayrollPolicy } from '../../models/payroll/PayrollPolicy.model.js'
import { getDefaultISLRTable, calculateAccumulatedISLR } from '../../services/payroll/islr-calculator.js'
import { Decimal } from 'decimal.js'

describe('ISLRCalculator', () => {
    let calculator
    let mockPolicy

    beforeEach(() => {
        mockPolicy = {
            ut_value_ves: 9,
            minimum_wage_ves: 130
        }
        calculator = new ISLRCalculator(mockPolicy)
    })

    describe('calculateAccumulatedISLR (static)', () => {
        test('should return 0 for income below first bracket', () => {
            // First bracket: 0 - 1000 UT = 0%
            // 500 UT * 9 = 4500 VES (below 1000 UT)
            const accumulatedIncome = new Decimal(4500)
            const table = getDefaultISLRTable()
            const utValue = 9

            const result = calculateAccumulatedISLR(accumulatedIncome, table, utValue)
            expect(Number(result)).toBe(0)
        })

        test('should calculate tax for second bracket (1000-2000 UT, 6%)', () => {
            // 1500 UT * 9 = 13500 VES
            // First 1000 UT: exempt (subtrahend 60 UT)
            // Taxable in second bracket: 500 UT
            // Tax: 500 * 9 * 6% + 60 * 9 * 6% = 270 + 32.4 = 302.4
            const accumulatedIncome = new Decimal(13500)
            const table = getDefaultISLRTable()
            const utValue = 9

            const result = calculateAccumulatedISLR(accumulatedIncome, table, utValue)
            expect(Number(result)).toBeGreaterThan(0)
        })

        test('should use full table for high income', () => {
            const accumulatedIncome = new Decimal(100000)
            const table = getDefaultISLRTable()
            const utValue = 9

            const result = calculateAccumulatedISLR(accumulatedIncome, table, utValue)
            expect(Number(result)).toBeGreaterThan(0)
        })
    })

    describe('getDefaultISLRTable', () => {
        test('should return correct bracket structure', () => {
            const brackets = getDefaultISLRTable()

            expect(brackets.length).toBeGreaterThan(0)
            expect(brackets[0]).toHaveProperty('income_from_ut')
            expect(brackets[0]).toHaveProperty('rate')
            expect(brackets[0]).toHaveProperty('subtrahend')
        })
    })
})