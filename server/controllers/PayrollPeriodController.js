import { PayrollPeriod } from '../models/payroll/PayrollPeriod.model.js'
import { PayrollReceipt } from '../models/payroll/PayrollReceipt.model.js'
import { PayrollPolicy } from '../models/payroll/PayrollPolicy.model.js'
import { Employee } from '../models/Employee.model.js'
import { Department } from '../models/Department.model.js'
import { calculatePayrollPeriod, calculateEmployeeReceipt } from '../services/payroll/payroll-engine.js'
import { JournalGenerator } from '../services/payroll/journal-generator.js'

export const PayrollPeriodController = {
    // GET /api/v1/payroll-periods
    async getAll(req, res) {
        try {
            const { status, page = 1, limit = 20 } = req.query
            const filter = { organizationID: req.ORGID }
            if (status) filter.status = status

            const periods = await PayrollPeriod.find(filter)
                .sort({ start_date: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .lean()

            const total = await PayrollPeriod.countDocuments(filter)

            return res.status(200).json({
                success: true,
                message: 'Períodos de nómina recuperados exitosamente',
                data: periods,
                pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
            })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // GET /api/v1/payroll-periods/:id
    async getById(req, res) {
        try {
            const { id } = req.params
            const period = await PayrollPeriod.findOne({ _id: id, organizationID: req.ORGID }).lean()

            if (!period) {
                return res.status(404).json({ success: false, message: 'Período no encontrado' })
            }

            return res.status(200).json({ success: true, message: 'Período encontrado', data: period })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // POST /api/v1/payroll-periods
    async create(req, res) {
        try {
            const { name, start_date, end_date, payment_date, period_type, period_frequency, days_count, pinned_rate, pinned_rate_note } = req.body

            if (!name || !start_date || !end_date || !payment_date) {
                return res.status(400).json({ success: false, message: 'Campos requeridos: name, start_date, end_date, payment_date' })
            }

            const period = await PayrollPeriod.create({
                name,
                start_date: new Date(start_date),
                end_date: new Date(end_date),
                payment_date: new Date(payment_date),
                period_type: period_type || 'NORMAL',
                period_frequency: period_frequency || 'QUINCENAL',
                days_count: days_count || 15,
                pinned_rate,
                pinned_rate_note,
                status: 'DRAFT',
                organizationID: req.ORGID
            })

            return res.status(201).json({ success: true, message: 'Período creado exitosamente', data: period })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // PUT /api/v1/payroll-periods/:id
    async update(req, res) {
        try {
            const { id } = req.params
            const { name, start_date, end_date, payment_date, period_type, period_frequency, days_count, pinned_rate, pinned_rate_note } = req.body

            const period = await PayrollPeriod.findOne({ _id: id, organizationID: req.ORGID })
            if (!period) {
                return res.status(404).json({ success: false, message: 'Período no encontrado' })
            }

            if (period.status !== 'DRAFT') {
                return res.status(400).json({ success: false, message: 'Solo se pueden editar períodos en estado DRAFT' })
            }

            period.name = name || period.name
            period.start_date = start_date ? new Date(start_date) : period.start_date
            period.end_date = end_date ? new Date(end_date) : period.end_date
            period.payment_date = payment_date ? new Date(payment_date) : period.payment_date
            period.period_type = period_type || period.period_type
            period.period_frequency = period_frequency || period.period_frequency
            period.days_count = days_count || period.days_count
            period.pinned_rate = pinned_rate ?? period.pinned_rate
            period.pinned_rate_note = pinned_rate_note || period.pinned_rate_note

            await period.save()

            return res.status(200).json({ success: true, message: 'Período actualizado exitosamente', data: period })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // DELETE /api/v1/payroll-periods/:id
    async delete(req, res) {
        try {
            const { id } = req.params

            const period = await PayrollPeriod.findOne({ _id: id, organizationID: req.ORGID })
            if (!period) {
                return res.status(404).json({ success: false, message: 'Período no encontrado' })
            }

            if (period.status !== 'DRAFT') {
                return res.status(400).json({ success: false, message: 'Solo se pueden eliminar períodos en estado DRAFT' })
            }

            await period.deleteOne()

            return res.status(200).json({ success: true, message: 'Período eliminado exitosamente' })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // POST /api/v1/payroll-periods/:id/calculate
    async calculate(req, res) {
        try {
            const { id } = req.params

            const period = await PayrollPeriod.findOne({ _id: id, organizationID: req.ORGID })
            if (!period) {
                return res.status(404).json({ success: false, message: 'Período no encontrado' })
            }

            if (period.status !== 'DRAFT' && period.status !== 'CALCULATED') {
                return res.status(400).json({ success: false, message: 'El período debe estar en estado DRAFT o CALCULATED para calcular' })
            }

            const receipts = await calculatePayrollPeriod(req.ORGID, id)

            return res.status(200).json({
                success: true,
                message: `Nómina calculada exitosamente para ${receipts.length} empleados`,
                data: { receiptsCount: receipts.length, periodStatus: 'CALCULATED' }
            })
        } catch (error) {
            console.error('[PayrollPeriodController.calculate] Error:', error)
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // POST /api/v1/payroll-periods/:id/approve
    async approve(req, res) {
        try {
            const { id } = req.params

            const period = await PayrollPeriod.findOne({ _id: id, organizationID: req.ORGID })
            if (!period) {
                return res.status(404).json({ success: false, message: 'Período no encontrado' })
            }

            if (period.status !== 'CALCULATED') {
                return res.status(400).json({ success: false, message: 'El período debe estar CALCULADO para aprobar' })
            }

            // Generar asiento contable
            const generator = new JournalGenerator(req.ORGID)
            await generator.initialize()

            const receipts = await PayrollReceipt.find({ period: id, organizationID: req.ORGID }).lean()
            const { draft } = await generator.generatePayrollJournalDraft(period, receipts)

            // Validar partida doble
            const validation = generator.validateDoubleEntry(draft)
            if (!validation.valid) {
                return res.status(400).json({
                    success: false,
                    message: `Asiento contable desbalanceado: diferencia ${validation.difference.toFixed(2)} VES`
                })
            }

            // Publicar asiento
            await generator.postJournalDraft(draft._id, req.HRID)

            // Actualizar período y recibos
            period.status = 'APPROVED'
            await period.save()

            await PayrollReceipt.updateMany(
                { period: id, organizationID: req.ORGID },
                { status: 'APPROVED' }
            )

            return res.status(200).json({
                success: true,
                message: 'Período aprobado y asiento contable generado',
                data: { periodStatus: 'APPROVED', journalDraftId: draft._id }
            })
        } catch (error) {
            console.error('[PayrollPeriodController.approve] Error:', error)
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // POST /api/v1/payroll-periods/:id/pay
    async pay(req, res) {
        try {
            const { id } = req.params

            const period = await PayrollPeriod.findOne({ _id: id, organizationID: req.ORGID })
            if (!period) {
                return res.status(404).json({ success: false, message: 'Período no encontrado' })
            }

            if (period.status !== 'APPROVED') {
                return res.status(400).json({ success: false, message: 'El período debe estar APROBADO para pagar' })
            }

            // Actualizar recibos a PAID
            await PayrollReceipt.updateMany(
                { period: id, organizationID: req.ORGID, status: 'APPROVED' },
                { status: 'PAID', payment_date: new Date() }
            )

            period.status = 'PAID'
            await period.save()

            // TODO: Lanzar export_bank_files y send_payslips_email (Celery tasks)

            return res.status(200).json({
                success: true,
                message: 'Período marcado como pagado',
                data: { periodStatus: 'PAID' }
            })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // POST /api/v1/payroll-periods/:id/close
    async close(req, res) {
        try {
            const { id } = req.params

            const period = await PayrollPeriod.findOne({ _id: id, organizationID: req.ORGID })
            if (!period) {
                return res.status(404).json({ success: false, message: 'Período no encontrado' })
            }

            if (period.status !== 'PAID') {
                return res.status(400).json({ success: false, message: 'El período debe estar PAGADO para cerrar' })
            }

            period.status = 'CLOSED'
            await period.save()

            return res.status(200).json({ success: true, message: 'Período cerrado exitosamente', data: period })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    }
}

export default PayrollPeriodController