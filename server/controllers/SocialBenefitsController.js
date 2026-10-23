import { SocialBenefitsLedger } from '../models/payroll/SocialBenefitsLedger.model.js'
import { SocialBenefitsSettlement } from '../models/payroll/SocialBenefitsSettlement.model.js'
import { Employee } from '../models/Employee.model.js'
import { LaborContract } from '../models/LaborContract.model.js'
import { PayrollPolicy } from '../models/payroll/PayrollPolicy.model.js'
import { SettlementCalculator } from '../services/payroll/settlement-calculator.js'
import { VacationBalance } from '../models/payroll/VacationBalance.model.js'
import { UtilidadesPayment } from '../models/payroll/UtilidadesPayment.model.js'

export const SocialBenefitsController = {
    // GET /api/v1/social-benefits/ledger
    async getLedger(req, res) {
        try {
            const { employee, contract, entry_type, page = 1, limit = 50 } = req.query
            const filter = { organizationID: req.ORGID }
            if (employee) filter.employee = employee
            if (contract) filter.contract = contract
            if (entry_type) filter.entry_type = entry_type

            const entries = await SocialBenefitsLedger.find(filter)
                .populate('employee', 'firstname lastname department')
                .populate('contract', 'salary_amount salary_currency')
                .sort({ period_start: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .lean()

            const total = await SocialBenefitsLedger.countDocuments(filter)

            return res.status(200).json({
                success: true,
                message: 'Libro de prestaciones recuperado',
                data: entries,
                pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
            })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // GET /api/v1/social-benefits/ledger/employee/:employeeId
    async getLedgerByEmployee(req, res) {
        try {
            const { employeeId } = req.params
            const entries = await SocialBenefitsLedger.find({ employee: employeeId, organizationID: req.ORGID })
                .populate('contract', 'salary_amount salary_currency start_date')
                .sort({ period_start: 1 })
                .lean()

            // Calcular totales
            let totalAccrued = 0
            let totalPaid = 0
            for (const entry of entries) {
                if (entry.entry_type === 'ACCRUAL') totalAccrued += entry.amount_ves
                if (entry.entry_type === 'PAYMENT') totalPaid += entry.amount_ves
            }

            return res.status(200).json({
                success: true,
                message: 'Libro de prestaciones del empleado',
                data: { entries, totals: { accrued: totalAccrued, paid: totalPaid, balance: totalAccrued - totalPaid } }
            })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // POST /api/v1/social-benefits/settlements/calculate
    async calculateSettlement(req, res) {
        try {
            const { contract_id, settlement_date, cause } = req.body

            if (!contract_id || !settlement_date || !cause) {
                return res.status(400).json({ success: false, message: 'Campos requeridos: contract_id, settlement_date, cause' })
            }

            const contract = await LaborContract.findById(contract_id).populate('employee')
            if (!contract) {
                return res.status(404).json({ success: false, message: 'Contrato no encontrado' })
            }

            const policy = await PayrollPolicy.findOne({ organizationID: req.ORGID })
            const calculator = new SettlementCalculator(
                { // SocialBenefitsConfig
                    calculation_base: policy.vacation_salary_basis,
                    include_cestaticket: true,
                    include_commissions: true,
                    include_bonuses: true,
                    include_overtime: true,
                    include_utilidades: true,
                    seniority_cap_years: policy.seniority_cap_years || 30
                },
                policy
            )

            const settlement = await calculator.calculateSettlement({
                contract,
                settlement_date: new Date(settlement_date),
                cause,
                employee: contract.employee
            })

            return res.status(200).json({
                success: true,
                message: 'Liquidación calculada exitosamente',
                data: settlement
            })
        } catch (error) {
            console.error('[SocialBenefitsController.calculateSettlement] Error:', error)
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // POST /api/v1/social-benefits/settlements
    async createSettlement(req, res) {
        try {
            const { contract_id, settlement_date, cause, notes } = req.body

            const contract = await LaborContract.findById(contract_id).populate('employee')
            if (!contract) {
                return res.status(404).json({ success: false, message: 'Contrato no encontrado' })
            }

            const policy = await PayrollPolicy.findOne({ organizationID: req.ORGID })
            const calculator = new SettlementCalculator(
                {
                    calculation_base: policy.vacation_salary_basis,
                    include_cestaticket: true,
                    include_commissions: true,
                    include_bonuses: true,
                    include_overtime: true,
                    include_utilidades: true,
                    seniority_cap_years: policy.seniority_cap_years || 30
                },
                policy
            )

            const { settlement, record } = await calculator.createSettlementRecord({
                contract,
                settlement_date: new Date(settlement_date),
                cause,
                employee: contract.employee,
                calculatedBy: req.HRID
            })

            record.notes = notes || ''
            await record.save()

            return res.status(201).json({
                success: true,
                message: 'Liquidación creada exitosamente',
                data: { settlement, record }
            })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // GET /api/v1/social-benefits/settlements
    async getSettlements(req, res) {
        try {
            const { contract, status, page = 1, limit = 20 } = req.query
            const filter = { organizationID: req.ORGID }
            if (contract) filter.contract = contract
            if (status) filter.status = status

            const settlements = await SocialBenefitsSettlement.find(filter)
                .populate({
                    path: 'contract',
                    populate: { path: 'employee', select: 'firstname lastname department' }
                })
                .populate('approved_by', 'firstname lastname')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .lean()

            const total = await SocialBenefitsSettlement.countDocuments(filter)

            return res.status(200).json({
                success: true,
                message: 'Liquidaciones recuperadas',
                data: settlements,
                pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
            })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // GET /api/v1/social-benefits/settlements/:id
    async getSettlementById(req, res) {
        try {
            const { id } = req.params
            const settlement = await SocialBenefitsSettlement.findOne({ _id: id, organizationID: req.ORGID })
                .populate({
                    path: 'contract',
                    populate: { path: 'employee', select: 'firstname lastname department hire_date national_id' }
                })
                .populate('approved_by', 'firstname lastname')
                .lean()

            if (!settlement) {
                return res.status(404).json({ success: false, message: 'Liquidación no encontrada' })
            }

            return res.status(200).json({ success: true, message: 'Liquidación encontrada', data: settlement })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // POST /api/v1/social-benefits/settlements/:id/approve
    async approveSettlement(req, res) {
        try {
            const { id } = req.params
            const settlement = await SocialBenefitsSettlement.findOne({ _id: id, organizationID: req.ORGID })

            if (!settlement) {
                return res.status(404).json({ success: false, message: 'Liquidación no encontrada' })
            }

            if (settlement.status !== 'DRAFT' && settlement.status !== 'CALCULATED') {
                return res.status(400).json({ success: false, message: 'Solo se pueden aprobar liquidaciones en DRAFT o CALCULATED' })
            }

            settlement.status = 'APPROVED'
            settlement.approved_by = req.HRID
            settlement.approved_at = new Date()
            await settlement.save()

            return res.status(200).json({ success: true, message: 'Liquidación aprobada', data: settlement })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // POST /api/v1/social-benefits/settlements/:id/pay
    async paySettlement(req, res) {
        try {
            const { id } = req.params
            const { payment_date, payment_method, bank_reference } = req.body

            const settlement = await SocialBenefitsSettlement.findOne({ _id: id, organizationID: req.ORGID })

            if (!settlement) {
                return res.status(404).json({ success: false, message: 'Liquidación no encontrada' })
            }

            if (settlement.status !== 'APPROVED') {
                return res.status(400).json({ success: false, message: 'Solo se pueden pagar liquidaciones APROBADAS' })
            }

            settlement.status = 'PAID'
            settlement.paid_at = payment_date ? new Date(payment_date) : new Date()
            settlement.notes = `${settlement.notes}\n[PAGADO: ${payment_method || 'Efectivo'} - Ref: ${bank_reference || 'N/A'}]`
            await settlement.save()

            // Registrar pago en libro
            const contract = await LaborContract.findById(settlement.contract).populate('employee')
            await SocialBenefitsLedger.create({
                employee: contract.employee._id,
                contract: settlement.contract,
                entry_type: 'SETTLEMENT',
                amount_ves: settlement.total_ves,
                days_accrued: settlement.accrued_days,
                daily_salary_ves: settlement.daily_salary_ves,
                period_start: settlement.settlement_date,
                period_end: settlement.settlement_date,
                notes: `Pago liquidación ${settlement.cause}`,
                organizationID: req.ORGID
            })

            return res.status(200).json({ success: true, message: 'Liquidación pagada', data: settlement })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // GET /api/v1/social-benefits/accrual/calculate
    async calculateAccrual(req, res) {
        try {
            const { employee_id, period_start, period_end } = req.query

            if (!employee_id || !period_start || !period_end) {
                return res.status(400).json({ success: false, message: 'Parámetros requeridos: employee_id, period_start, period_end' })
            }

            const employee = await Employee.findById(employee_id)
            if (!employee) {
                return res.status(404).json({ success: false, message: 'Empleado no encontrado' })
            }

            const contract = await LaborContract.findOne({ employee: employee_id, is_active: true })
            if (!contract) {
                return res.status(404).json({ success: false, message: 'Contrato activo no encontrado' })
            }

            const policy = await PayrollPolicy.findOne({ organizationID: req.ORGID })
            const calculator = new SettlementCalculator(
                {
                    calculation_base: policy.vacation_salary_basis,
                    seniority_cap_years: policy.seniority_cap_years || 30
                },
                policy
            )

            const accrual = await calculator.calculateMonthlyAccrual(
                employee,
                new Date(period_start),
                new Date(period_end)
            )

            return res.status(200).json({
                success: true,
                message: 'Acumulación calculada',
                data: accrual
            })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // POST /api/v1/social-benefits/accrual/record
    async recordAccrual(req, res) {
        try {
            const { employee_id, contract_id, period_start, period_end, amount, days_accrued, daily_salary } = req.body

            const employee = await Employee.findById(employee_id)
            if (!employee) {
                return res.status(404).json({ success: false, message: 'Empleado no encontrado' })
            }

            const policy = await PayrollPolicy.findOne({ organizationID: req.ORGID })
            const calculator = new SettlementCalculator(
                { calculation_base: policy.vacation_salary_basis },
                policy
            )

            const entry = await calculator.recordAccrual(
                employee,
                contract_id,
                new Date(period_start),
                new Date(period_end),
                new (require('decimal.js'))(amount),
                days_accrued,
                new (require('decimal.js'))(daily_salary)
            )

            return res.status(201).json({ success: true, message: 'Acumulación registrada', data: entry })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    }
}

export default SocialBenefitsController