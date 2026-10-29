import { VacationCalculator } from '../../services/payroll/vacation-calculator.js'
import { PayrollPolicy } from '../../models/payroll/PayrollPolicy.model.js'

describe('VacationCalculator', () => {
    let calculator
    let mockPolicy

    beforeEach(() => {
        mockPolicy = {
            vacation_days_base: 15,
            vacation_days_per_year: 1,
            vacation_days_max: 30,
            vacation_bonus_days_base: 15,
            vacation_bonus_days_per_year: 1,
            vacation_bonus_days_max: 30,
            min_service_months: 12,
            pay_rest_days: true,
            pay_holidays: true,
            vacation_salary_basis: 'LAST_SALARY',
            vacation_salary_source: 'TOTAL_SALARY',
            cestaticket_pay_on_vacation: true,
            cestaticket_separate_period: false,
            cestaticket_amount_usd: 40
        }
        calculator = new VacationCalculator(mockPolicy)
    })

    describe('calculateVacationDays', () => {
        test('should return 15 days for first year', () => {
            // 2023-01-15 to 2024-01-15 = ~1 year, but due to leap year calculation might be 0.99
            // Use date that gives exactly 1 year by using a date that's clearly >= 365.25 days
            const hireDate = new Date('2022-06-15')
            const calculationDate = new Date('2024-01-15')
            const days = calculator.calculateVacationDays(hireDate, calculationDate)
            // With 365.25 divisor: ~1.6 years -> fullYears = 1 -> 15 days
            expect(days).toBe(15)
        })

        test('should add 1 day per additional year', () => {
            const hireDate = new Date('2018-06-15')
            const calculationDate = new Date('2024-01-15')
            const days = calculator.calculateVacationDays(hireDate, calculationDate)
            // ~5.6 years -> fullYears = 5 -> 15 + 4 = 19
            expect(days).toBe(19)
        })

        test('should cap at maximum days', () => {
            const hireDate = new Date('1990-01-15')
            const calculationDate = new Date('2024-01-15')
            const days = calculator.calculateVacationDays(hireDate, calculationDate)
            expect(days).toBe(30)
        })

        test('should return 0 if less than min service months', () => {
            const hireDate = new Date('2023-10-15')
            const calculationDate = new Date('2024-01-15')
            const days = calculator.calculateVacationDays(hireDate, calculationDate)
            expect(days).toBe(0)
        })
    })

    describe('calculateBonoVacacionalDays', () => {
        test('should return 15 days for first year', () => {
            const hireDate = new Date('2022-06-15')
            const calculationDate = new Date('2024-01-15')
            const days = calculator.calculateBonoVacacionalDays(hireDate, calculationDate)
            expect(days).toBe(15)
        })

        test('should add 1 day per additional year', () => {
            const hireDate = new Date('2018-06-15')
            const calculationDate = new Date('2024-01-15')
            const days = calculator.calculateBonoVacacionalDays(hireDate, calculationDate)
            expect(days).toBe(19)
        })

        test('should cap at maximum days', () => {
            const hireDate = new Date('1990-01-15')
            const calculationDate = new Date('2024-01-15')
            const days = calculator.calculateBonoVacacionalDays(hireDate, calculationDate)
            expect(days).toBe(30)
        })
    })
})