import { PayrollReceipt } from '../models/payroll/PayrollReceipt.model.js'
import { PayrollReceiptLine } from '../models/payroll/PayrollReceiptLine.model.js'
import { PayrollEmployerCost } from '../models/payroll/PayrollEmployerCost.model.js'
import { PayrollNovelty } from '../models/payroll/PayrollNovelty.model.js'
import { Employee } from '../models/Employee.model.js'
import { calculateEmployeeReceipt, PayrollEngine } from '../services/payroll/payroll-engine.js'

export const PayrollReceiptController = {
    // GET /api/v1/payslips
    async getAll(req, res) {
        try {
            const { period, employee, status, page = 1, limit = 20 } = req.query
            const filter = { organizationID: req.ORGID }
            if (period) filter.period = period
            if (employee) filter.employee = employee
            if (status) filter.status = status

            const receipts = await PayrollReceipt.find(filter)
                .populate('employee', 'firstname lastname email department')
                .populate('period', 'name start_date end_date')
                .populate('contract', 'salary_amount salary_currency')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .lean()

            const total = await PayrollReceipt.countDocuments(filter)

            return res.status(200).json({
                success: true,
                message: 'Recibos de nómina recuperados exitosamente',
                data: receipts,
                pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
            })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // GET /api/v1/payslips/:id
    async getById(req, res) {
        try {
            const { id } = req.params
            const receipt = await PayrollReceipt.findOne({ _id: id, organizationID: req.ORGID })
                .populate('employee', 'firstname lastname email department national_id rif')
                .populate('period', 'name start_date end_date payment_date')
                .populate('contract', 'salary_amount salary_currency payment_frequency contract_type')
                .populate('branch', 'name code')
                .lean()

            if (!receipt) {
                return res.status(404).json({ success: false, message: 'Recibo no encontrado' })
            }

            // Obtener líneas del recibo
            const lines = await PayrollReceiptLine.find({ receipt: id, organizationID: req.ORGID })
                .sort({ kind: 1, createdAt: 1 })
                .lean()

            // Obtener costos patronales
            const employerCosts = await PayrollEmployerCost.find({ receipt: id, organizationID: req.ORGID })
                .lean()

            return res.status(200).json({
                success: true,
                message: 'Recibo encontrado',
                data: { ...receipt, lines, employerCosts }
            })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // GET /api/v1/payslips/employee/:employeeId
    async getByEmployee(req, res) {
        try {
            const { employeeId } = req.params
            const { period, status } = req.query

            const filter = { employee: employeeId, organizationID: req.ORGID }
            if (period) filter.period = period
            if (status) filter.status = status

            const receipts = await PayrollReceipt.find(filter)
                .populate('period', 'name start_date end_date payment_date status')
                .sort({ 'period.start_date': -1 })
                .lean()

            return res.status(200).json({
                success: true,
                message: 'Recibos del empleado recuperados',
                data: receipts
            })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // POST /api/v1/payslips/:id/recalculate
    async recalculate(req, res) {
        try {
            const { id } = req.params

            const receipt = await PayrollReceipt.findOne({ _id: id, organizationID: req.ORGID })
                .populate('employee')
                .populate('period')
                .populate('contract')

            if (!receipt) {
                return res.status(404).json({ success: false, message: 'Recibo no encontrado' })
            }

            if (receipt.status === 'PAID' || receipt.status === 'VOIDED') {
                return res.status(400).json({ success: false, message: 'No se puede recalcular un recibo PAGADO o ANULADO' })
            }

            const engine = new PayrollEngine(req.ORGID)
            await engine.initialize()
            const updatedReceipt = await engine.recalculateReceipt(id)

            return res.status(200).json({
                success: true,
                message: 'Recibo recalculado exitosamente',
                data: updatedReceipt
            })
        } catch (error) {
            console.error('[PayrollReceiptController.recalculate] Error:', error)
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // POST /api/v1/payslips/:id/void
    async voidReceipt(req, res) {
        try {
            const { id } = req.params
            const { reason } = req.body

            const receipt = await PayrollReceipt.findOne({ _id: id, organizationID: req.ORGID })
            if (!receipt) {
                return res.status(404).json({ success: false, message: 'Recibo no encontrado' })
            }

            if (receipt.status === 'PAID') {
                return res.status(400).json({ success: false, message: 'No se puede anular un recibo PAGADO' })
            }

            receipt.status = 'VOIDED'
            receipt.calculation_log = {
                ...receipt.calculation_log,
                void_reason: reason,
                voided_at: new Date(),
                voided_by: req.HRID
            }
            await receipt.save()

            return res.status(200).json({ success: true, message: 'Recibo anulado exitosamente', data: receipt })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // GET /api/v1/payslips/:id/export
    async exportReceipt(req, res) {
        try {
            const { id } = req.params
            const { format = 'json' } = req.query

            const receipt = await PayrollReceipt.findOne({ _id: id, organizationID: req.ORGID })
                .populate('employee', 'firstname lastname email department national_id rif bank_name bank_account_number bank_account_type')
                .populate('period', 'name start_date end_date payment_date')
                .populate('contract', 'salary_amount salary_currency payment_frequency contract_type')
                .populate('branch', 'name code address phone')
                .lean()

            if (!receipt) {
                return res.status(404).json({ success: false, message: 'Recibo no encontrado' })
            }

            const lines = await PayrollReceiptLine.find({ receipt: id, organizationID: req.ORGID }).lean()
            const employerCosts = await PayrollEmployerCost.find({ receipt: id, organizationID: req.ORGID }).lean()

            const exportData = { ...receipt, lines, employerCosts }

            if (format === 'pdf') {
                // TODO: Generar PDF
                return res.status(501).json({ success: false, message: 'Exportación PDF no implementada aún' })
            }

            return res.status(200).json({
                success: true,
                message: 'Recibo exportado',
                data: exportData
            })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    }
}

export default PayrollReceiptController