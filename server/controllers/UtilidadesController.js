import { UtilidadesPeriod } from '../models/payroll/UtilidadesPeriod.model.js'
import { UtilidadesPayment } from '../models/payroll/UtilidadesPayment.model.js'
import { PayrollReceipt } from '../models/payroll/PayrollReceipt.model.js'
import { Employee } from '../models/Employee.model.js'
import { LaborContract } from '../models/LaborContract.model.js'
import { PayrollPolicy } from '../models/payroll/PayrollPolicy.model.js'
import { UtilidadesCalculator } from '../services/payroll/utilidades-calculator.js'

export const UtilidadesController = {
    // GET /api/v1/utilidades/periods
    async getPeriods(req, res) {
        try {
            const { year, status, page = 1, limit = 20 } = req.query
            const filter = { organizationID: req.ORGID }
            if (year) filter.year = parseInt(year)
            if (status) filter.status = status

            const periods = await UtilidadesPeriod.find(filter)
                .populate('calculated_by', 'firstname lastname')
                .populate('approved_by', 'firstname lastname')
                .sort({ year: -1, createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .lean()

            const total = await UtilidadesPeriod.countDocuments(filter)

            return res.status(200).json({
                success: true,
                message: 'Períodos de utilidades recuperados',
                data: periods,
                pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
            })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // GET /api/v1/utilidades/periods/:id
    async getPeriodById(req, res) {
        try {
            const { id } = req.params
            const period = await UtilidadesPeriod.findOne({ _id: id, organizationID: req.ORGID })
                .populate('calculated_by', 'firstname lastname')
                .populate('approved_by', 'firstname lastname')
                .lean()

            if (!period) {
                return res.status(404).json({ success: false, message: 'Período no encontrado' })
            }

            return res.status(200).json({ success: true, message: 'Período encontrado', data: period })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // POST /api/v1/utilidades/periods
    async createPeriod(req, res) {
        try {
            const { year, net_profit_usd, distribution_percentage, calculation_date, description } = req.body

            if (!year || !net_profit_usd || !distribution_percentage) {
                return res.status(400).json({ success: false, message: 'Campos requeridos: year, net_profit_usd, distribution_percentage' })
            }

            const existing = await UtilidadesPeriod.findOne({ organizationID: req.ORGID, year })
            if (existing) {
                return res.status(400).json({ success: false, message: 'Ya existe un período para ese año' })
            }

            const period = await UtilidadesPeriod.create({
                year,
                net_profit_usd: parseFloat(net_profit_usd),
                distribution_percentage: parseFloat(distribution_percentage),
                calculation_date: calculation_date ? new Date(calculation_date) : new Date(),
                description: description || '',
                status: 'DRAFT',
                calculated_by: req.HRID,
                organizationID: req.ORGID
            })

            return res.status(201).json({ success: true, message: 'Período de utilidades creado', data: period })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // POST /api/v1/utilidades/periods/:id/calculate
    async calculatePeriod(req, res) {
        try {
            const { id } = req.params
            const period = await UtilidadesPeriod.findOne({ _id: id, organizationID: req.ORGID })

            if (!period) {
                return res.status(404).json({ success: false, message: 'Período no encontrado' })
            }

            if (period.status !== 'DRAFT') {
                return res.status(400).json({ success: false, message: 'Solo se pueden calcular períodos en DRAFT' })
            }

            const policy = await PayrollPolicy.findOne({ organizationID: req.ORGID })
            const calculator = new UtilidadesCalculator(policy)

            const result = await calculator.calculateDistribution(id)

            period.total_pool_ves = result.totalPool.toNumber()
            period.employees_count = result.employees.length
            period.distribution_method = result.method
            period.calculation_details = result.details
            period.status = 'CALCULATED'
            await period.save()

            return res.status(200).json({
                success: true,
                message: `Utilidades calculadas para ${result.employees.length} empleados`,
                data: { period, distribution: result }
            })
        } catch (error) {
            console.error('[UtilidadesController.calculatePeriod] Error:', error)
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // POST /api/v1/utilidades/periods/:id/approve
    async approvePeriod(req, res) {
        try {
            const { id } = req.params
            const period = await UtilidadesPeriod.findOne({ _id: id, organizationID: req.ORGID })

            if (!period) {
                return res.status(404).json({ success: false, message: 'Período no encontrado' })
            }

            if (period.status !== 'CALCULATED') {
                return res.status(400).json({ success: false, message: 'El período debe estar CALCULADO para aprobar' })
            }

            period.status = 'APPROVED'
            period.approved_by = req.HRID
            period.approved_at = new Date()
            await period.save()

            return res.status(200).json({ success: true, message: 'Período aprobado', data: period })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // POST /api/v1/utilidades/periods/:id/pay
    async payPeriod(req, res) {
        try {
            const { id } = req.params
            const { payment_date, exchange_rate, method } = req.body

            const period = await UtilidadesPeriod.findOne({ _id: id, organizationID: req.ORGID })

            if (!period) {
                return res.status(404).json({ success: false, message: 'Período no encontrado' })
            }

            if (period.status !== 'APPROVED') {
                return res.status(400).json({ success: false, message: 'El período debe estar APROBADO para pagar' })
            }

            const policy = await PayrollPolicy.findOne({ organizationID: req.ORGID })
            const calculator = new UtilidadesCalculator(policy)

            const result = await calculator.generatePayments(
                id,
                payment_date ? new Date(payment_date) : new Date(),
                exchange_rate
            )

            period.status = 'PAID'
            period.paid_at = new Date()
            await period.save()

            // TODO: Generar recibos de nómina para cada pago

            return res.status(200).json({
                success: true,
                message: `Utilidades pagadas a ${result.payments.length} empleados`,
                data: { period, payments: result.payments }
            })
        } catch (error) {
            console.error('[UtilidadesController.payPeriod] Error:', error)
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // GET /api/v1/utilidades/payments
    async getPayments(req, res) {
        try {
            const { period, employee, status, page = 1, limit = 50 } = req.query
            const filter = { organizationID: req.ORGID }
            if (period) filter.period = period
            if (employee) filter.employee = employee
            if (status) filter.status = status

            const payments = await UtilidadesPayment.find(filter)
                .populate('employee', 'firstname lastname department')
                .populate('period', 'year net_profit_usd')
                .populate('contract', 'salary_amount salary_currency')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .lean()

            const total = await UtilidadesPayment.countDocuments(filter)

            return res.status(200).json({
                success: true,
                message: 'Pagos de utilidades recuperados',
                data: payments,
                pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
            })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // GET /api/v1/utilidades/payments/:id
    async getPaymentById(req, res) {
        try {
            const { id } = req.params
            const payment = await UtilidadesPayment.findOne({ _id: id, organizationID: req.ORGID })
                .populate('employee', 'firstname lastname department hire_date')
                .populate('contract', 'salary_amount salary_currency')
                .populate('period', 'year net_profit_usd distribution_percentage')
                .lean()

            if (!payment) {
                return res.status(404).json({ success: false, message: 'Pago no encontrado' })
            }

            return res.status(200).json({ success: true, message: 'Pago encontrado', data: payment })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // POST /api/v1/utilidades/payments/:id/pay
    async payIndividual(req, res) {
        try {
            const { id } = req.params
            const { payment_date, exchange_rate } = req.body

            const payment = await UtilidadesPayment.findOne({ _id: id, organizationID: req.ORGID })
                .populate('employee')
                .populate('contract')

            if (!payment) {
                return res.status(404).json({ success: false, message: 'Pago no encontrado' })
            }

            if (payment.status === 'PAID') {
                return res.status(400).json({ success: false, message: 'Este pago ya fue realizado' })
            }

            const policy = await PayrollPolicy.findOne({ organizationID: req.ORGID })

            // Crear recibo de utilidades
            const utilidadesReceipt = await PayrollReceipt.create({
                employee: payment.employee._id,
                period: payment.period,
                contract: payment.contract?._id,
                contract_snapshot: {
                    salary_amount: payment.employee.salary_amount,
                    salary_currency: payment.employee.salary_currency,
                    payment_frequency: payment.employee.payment_frequency,
                    includes_cestaticket: payment.employee.includes_cestaticket
                },
                salary_base_snapshot: payment.employee.salary_amount,
                exchange_rate_snapshot: exchange_rate || payment.exchange_rate,
                currency_code: 'VES',
                total_income_ves: payment.total_ves,
                total_deductions_ves: payment.islr_withheld_ves,
                net_pay_ves: payment.net_ves,
                status: 'PAID',
                tipo_recibo: 'UTILIDADES',
                payment_date: payment_date ? new Date(payment_date) : new Date(),
                organizationID: req.ORGID
            })

            payment.status = 'PAID'
            payment.paid_at = payment_date ? new Date(payment_date) : new Date()
            payment.payroll_receipt = utilidadesReceipt._id
            await payment.save()

            return res.status(200).json({
                success: true,
                message: 'Utilidades pagadas',
                data: { payment, receipt: utilidadesReceipt }
            })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    }
}

export default UtilidadesController