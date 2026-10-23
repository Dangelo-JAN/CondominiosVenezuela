import { SettlementCalculator } from '../../services/payroll/settlement-calculator.js'
import { PayrollPolicy } from '../../models/payroll/PayrollPolicy.model.js'
import { Types } from 'mongoose'
import { Decimal } from 'decimal.js'
import { jest } from '@jest/globals'
import { VacationBalance } from '../../models/payroll/VacationBalance.model.js'
import { SocialBenefitsLedger } from '../../models/payroll/SocialBenefitsLedger.model.js'

describe('SettlementCalculator', () => {
    let calculator
    let mockConfig
    let mockPolicy

    beforeEach(() => {
        mockConfig = {
            calculation_base: 'LAST_SALARY',
            include_cestaticket: true,
            include_commissions: true,
            include_bonuses: true,
            include_overtime: true,
            include_utilidades: true,
            seniority_cap_years: 30
        }
        mockPolicy = {
            vacation_days_base: 15,
            vacation_days_per_year: 1,
            vacation_days_max: 30,
            vacation_bonus_days_base: 15,
            vacation_bonus_days_per_year: 1,
            vacation_bonus_days_max: 30,
            cestaticket_pay_on_vacation: true,
            minimum_wage_ves: 130,
            ut_value_ves: 9
        }
        calculator = new SettlementCalculator(mockConfig, mockPolicy)
    })

    describe('calculateMonthlyAccrual', () => {
        test('should calculate monthly prestaciones accrual', async () => {
            const employee = {
                _id: new Types.ObjectId(),
                salary_amount: 3000,
                salary_currency: 'VES',
                includes_cestaticket: true,
                hire_date: new Date('2023-01-15')
            }
            const contract = {
                salary_amount: 3000,
                salary_currency: 'VES'
            }

            const periodStart = new Date('2024-01-01')
            const periodEnd = new Date('2024-01-31')

            // Mock calculateDailySalaryForBenefits directly to avoid DB calls
            calculator.calculateDailySalaryForBenefits = jest.fn().mockResolvedValue(new Decimal(100))

            const accrual = await calculator.calculateMonthlyAccrual(employee, periodStart, periodEnd)

            expect(accrual.daysAccrued).toBe(30) // 31 days in Jan, capped at 30
            expect(accrual.dailySalary).toBeDefined()
            expect(accrual.amount).toBeDefined()
            expect(accrual.periodStart).toEqual(periodStart)
            expect(accrual.periodEnd).toEqual(periodEnd)
        })

        test('should cap days at 30 for longer periods', async () => {
            const employee = {
                _id: new Types.ObjectId(),
                salary_amount: 10000,
                salary_currency: 'VES',
                includes_cestaticket: true,
                hire_date: new Date('1990-01-15') // 34 years
            }
            const contract = { salary_amount: 10000 }

            const periodStart = new Date('2024-01-01')
            const periodEnd = new Date('2024-01-31')

            // Mock calculateDailySalaryForBenefits directly to avoid DB calls
            calculator.calculateDailySalaryForBenefits = jest.fn().mockResolvedValue(new Decimal(333.33))

            const accrual = await calculator.calculateMonthlyAccrual(employee, periodStart, periodEnd)

            // Days in period (Jan 1-31 = 31 days) capped at 30
            expect(accrual.daysAccrued).toBe(30)
        })
    })

    describe('calculateSettlement', () => {
        test.skip('should calculate full settlement for justified dismissal', async () => {
            const employeeId = new Types.ObjectId()
            const contract = {
                _id: new Types.ObjectId(),
                employee: { _id: employeeId },
                salary_amount: 3000,
                salary_currency: 'VES',
                start_date: new Date('2020-01-15')
            }
            const employee = {
                _id: employeeId,
                salary_amount: 3000,
                salary_currency: 'VES',
                includes_cestaticket: true,
                hire_date: new Date('2020-01-15')
            }

            // Mock ALL internal methods to avoid DB calls
            calculator.calculateDailySalaryForBenefits = jest.fn().mockResolvedValue(new Decimal(100))
            calculator.vacationCalculator.calculateVacationDays = jest.fn().mockReturnValue(15)
            calculator.vacationCalculator.calculateBonoVacacionalDays = jest.fn().mockReturnValue(15)
            
            // Mock VacationBalance.findOne().lean() to return null (no pending days)
            jest.spyOn(VacationBalance, 'findOne').mockReturnValue({
                lean: jest.fn().mockResolvedValue(null)
            })

            const settlement = await calculator.calculateSettlement({
                contract,
                settlement_date: new Date('2024-01-15'),
                cause: 'JUSTIFIED_DISMISSAL',
                employee
            })

            expect(settlement.antiguedadAños).toBe(4)
            expect(settlement.prestacionesAntiguedad.toNumber()).toBeGreaterThan(0)
            expect(settlement.vacacionesPendientes.toNumber()).toBeGreaterThanOrEqual(0)
            expect(settlement.bonoVacacionalPendiente.toNumber()).toBeGreaterThanOrEqual(0)
            expect(settlement.cestaticketProporcional.toNumber()).toBeGreaterThan(0)
            expect(settlement.utilidadesProporcionales.toNumber()).toBeGreaterThanOrEqual(0)
            expect(settlement.total.toNumber()).toBeGreaterThan(0)
        }, 10000)

        test.skip('should include indemnización for unjustified dismissal', async () => {
            const employeeId = new Types.ObjectId()
            const contract = {
                _id: new Types.ObjectId(),
                employee: { _id: employeeId },
                salary_amount: 3000,
                salary_currency: 'VES',
                start_date: new Date('2020-01-15')
            }
            const employee = {
                _id: employeeId,
                salary_amount: 3000,
                salary_currency: 'VES',
                includes_cestaticket: true,
                hire_date: new Date('2020-01-15')
            }

            // Mock ALL internal methods to avoid DB calls
            calculator.calculateDailySalaryForBenefits = jest.fn().mockResolvedValue(new Decimal(100))
            calculator.vacationCalculator.calculateVacationDays = jest.fn().mockReturnValue(15)
            calculator.vacationCalculator.calculateBonoVacacionalDays = jest.fn().mockReturnValue(15)
            
            // Mock VacationBalance.findOne().lean() to return null (no pending days)
            jest.spyOn(VacationBalance, 'findOne').mockReturnValue({
                lean: jest.fn().mockResolvedValue(null)
            })

            const settlement = await calculator.calculateSettlement({
                contract,
                settlement_date: new Date('2024-01-15'),
                cause: 'UNJUSTIFIED_DISMISSAL',
                employee
            })

            expect(settlement.indemnizacion.toNumber()).toBeGreaterThan(0)
        }, 10000)

        test.skip('should not include indemnización for resignation', async () => {
            const employeeId = new Types.ObjectId()
            const contract = {
                _id: new Types.ObjectId(),
                employee: { _id: employeeId },
                salary_amount: 3000,
                salary_currency: 'VES',
                start_date: new Date('2020-01-15')
            }
            const employee = {
                _id: employeeId,
                salary_amount: 3000,
                salary_currency: 'VES',
                includes_cestaticket: true,
                hire_date: new Date('2020-01-15')
            }

            // Mock ALL internal methods to avoid DB calls
            calculator.calculateDailySalaryForBenefits = jest.fn().mockResolvedValue(new Decimal(100))
            calculator.vacationCalculator.calculateVacationDays = jest.fn().mockReturnValue(15)
            calculator.vacationCalculator.calculateBonoVacacionalDays = jest.fn().mockReturnValue(15)
            
            // Mock VacationBalance.findOne().lean() to return null (no pending days)
            jest.spyOn(VacationBalance, 'findOne').mockReturnValue({
                lean: jest.fn().mockResolvedValue(null)
            })

            const settlement = await calculator.calculateSettlement({
                contract,
                settlement_date: new Date('2024-01-15'),
                cause: 'RESIGNATION',
                employee
            })

            expect(settlement.indemnizacion.toNumber()).toBe(0)
        }, 10000)
    })

    describe('recordAccrual', () => {
        test('should record accrual entry', async () => {
            const employee = {
                _id: new Types.ObjectId(),
                salary_amount: 3000,
                salary_currency: 'VES'
            }

            // Mock SocialBenefitsLedger.create
            jest.spyOn(SocialBenefitsLedger, 'create').mockResolvedValue({
                employee: employee._id,
                entry_type: 'ACCRUAL',
                amount_ves: 250,
                days_accrued: 2.5,
                daily_salary_ves: 100,
                period_start: new Date('2024-01-01'),
                period_end: new Date('2024-01-31'),
                organizationID: undefined
            })

            const entry = await calculator.recordAccrual(
                employee,
                new Types.ObjectId(),
                new Date('2024-01-01'),
                new Date('2024-01-31'),
                new Decimal(250), // amount as Decimal
                2.5, // days
                new Decimal(100) // daily salary as Decimal
            )

            expect(entry.employee).toBeDefined()
            expect(entry.entry_type).toBe('ACCRUAL')
            expect(entry.amount_ves).toBe(250)
            expect(entry.days_accrued).toBe(2.5)
        })
    })
})