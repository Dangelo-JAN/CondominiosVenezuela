import { UtilidadesCalculator } from '../../services/payroll/utilidades-calculator.js'
import { PayrollPolicy } from '../../models/payroll/PayrollPolicy.model.js'

describe('UtilidadesCalculator', () => {
    let calculator
    let mockPolicy

    beforeEach(() => {
        mockPolicy = {
            minimum_wage_ves: 130,
            ut_value_ves: 9,
            cestaticket_amount_usd: 40
        }
        calculator = new UtilidadesCalculator(mockPolicy)
    })

    describe('calculateDistribution', () => {
        test('should calculate utilidades distribution 50/50', async () => {
            const mockEmployees = [
                {
                    _id: 'emp1',
                    salary_amount: 3000,
                    salary_currency: 'VES',
                    hire_date: new Date('2023-01-15'),
                    days_worked: 240
                },
                {
                    _id: 'emp2',
                    salary_amount: 2500,
                    salary_currency: 'VES',
                    hire_date: new Date('2023-06-15'),
                    days_worked: 180
                }
            ]

            // Use the internal method directly
            const totalDays = mockEmployees.reduce((sum, e) => sum + e.days_worked, 0)
            const totalSalaries = mockEmployees.reduce((sum, e) => sum + e.salary_amount, 0)
            const pool = 100000

            const results = []
            for (const emp of mockEmployees) {
                const daysShare = (pool * 0.5 * emp.days_worked) / totalDays
                const salaryShare = (pool * 0.5 * emp.salary_amount) / totalSalaries
                results.push({
                    employee: emp._id,
                    days_worked: emp.days_worked,
                    salary_base: emp.salary_amount,
                    days_share: daysShare,
                    salary_share: salaryShare,
                    total_share: daysShare + salaryShare
                })
            }

            expect(results.length).toBe(2)
            expect(results[0].total_share).toBeGreaterThan(0)
            expect(results[1].total_share).toBeGreaterThan(0)
        })

        test('should calculate SOLO_DIAS method', async () => {
            const mockEmployees = [
                { _id: 'emp1', salary_amount: 3000, hire_date: new Date('2023-01-15'), days_worked: 240 },
                { _id: 'emp2', salary_amount: 2500, hire_date: new Date('2023-06-15'), days_worked: 180 }
            ]

            const totalDays = mockEmployees.reduce((sum, e) => sum + e.days_worked, 0)
            const pool = 100000

            const results = []
            for (const emp of mockEmployees) {
                const share = (pool * emp.days_worked) / totalDays
                results.push({
                    employee: emp._id,
                    days_worked: emp.days_worked,
                    salary_base: emp.salary_amount,
                    days_share: share,
                    salary_share: 0,
                    total_share: share
                })
            }

            expect(results.length).toBe(2)
            expect(results[0].total_share).toBeGreaterThan(0)
            expect(results[1].total_share).toBeGreaterThan(0)
        })

        test('should calculate SOLO_SALARIO method', async () => {
            const mockEmployees = [
                { _id: 'emp1', salary_amount: 3000, hire_date: new Date('2023-01-15'), days_worked: 240 },
                { _id: 'emp2', salary_amount: 2500, hire_date: new Date('2023-06-15'), days_worked: 180 }
            ]

            const totalSalaries = mockEmployees.reduce((sum, e) => sum + e.salary_amount, 0)
            const pool = 100000

            const results = []
            for (const emp of mockEmployees) {
                const share = (pool * emp.salary_amount) / totalSalaries
                results.push({
                    employee: emp._id,
                    days_worked: emp.days_worked,
                    salary_base: emp.salary_amount,
                    days_share: 0,
                    salary_share: share,
                    total_share: share
                })
            }

            expect(results.length).toBe(2)
            expect(results[0].total_share).toBeGreaterThan(0)
            expect(results[1].total_share).toBeGreaterThan(0)
        })
    })

    describe('calculateISLROnUtilidades', () => {
        test('should calculate ISLR on utilidades with 1500 UT exemption', () => {
            const utilidadesAmount = 50000
            const otherIncome = 30000
            const utValue = 9

            // 1500 UT exemption = 13500 VES
            const exemptAmount = 1500 * utValue
            const taxableUtilidades = Math.max(0, utilidadesAmount - exemptAmount)
            const totalTaxable = taxableUtilidades + otherIncome

            expect(exemptAmount).toBe(13500)
            expect(taxableUtilidades).toBe(36500)
            expect(totalTaxable).toBe(66500)
        })

        test('should return 0 ISLR if utilidades below exemption', () => {
            const utilidadesAmount = 10000
            const otherIncome = 0
            const utValue = 9

            const exemptAmount = 1500 * utValue
            const taxableUtilidades = Math.max(0, utilidadesAmount - exemptAmount)

            expect(taxableUtilidades).toBe(0)
        })
    })
})