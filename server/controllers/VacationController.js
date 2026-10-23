import { VacationBalance } from '../models/payroll/VacationBalance.model.js'
import { VacationRequest } from '../models/payroll/VacationRequest.model.js'
import { VacationPayment } from '../models/payroll/VacationPayment.model.js'
import { PayrollReceipt } from '../models/payroll/PayrollReceipt.model.js'
import { Employee } from '../models/Employee.model.js'
import { PayrollPolicy } from '../models/payroll/PayrollPolicy.model.js'
import { VacationCalculator } from '../services/payroll/vacation-calculator.js'
import { Holiday } from '../models/payroll/Holiday.model.js'

export const VacationController = {
    // GET /api/v1/vacations/balances
    async getBalances(req, res) {
        try {
            const { employee, page = 1, limit = 50 } = req.query
            const filter = { organizationID: req.ORGID }
            if (employee) filter.employee = employee

            const balances = await VacationBalance.find(filter)
                .populate('employee', 'firstname lastname department hire_date')
                .populate('related_request', 'start_date end_date status')
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .lean()

            const total = await VacationBalance.countDocuments(filter)

            return res.status(200).json({
                success: true,
                message: 'Saldos de vacaciones recuperados',
                data: balances,
                pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
            })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // GET /api/v1/vacations/balances/:employeeId
    async getBalanceByEmployee(req, res) {
        try {
            const { employeeId } = req.params
            const balance = await VacationBalance.findOne({ employee: employeeId, organizationID: req.ORGID })
                .populate('employee', 'firstname lastname department hire_date')
                .populate('related_request', 'start_date end_date status')
                .lean()

            if (!balance) {
                return res.status(404).json({ success: false, message: 'Saldo de vacaciones no encontrado' })
            }

            return res.status(200).json({ success: true, message: 'Saldo encontrado', data: balance })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // POST /api/v1/vacations/requests
    async createRequest(req, res) {
        try {
            const { employee, contract, start_date, end_date, days_requested, vacation_type, notes, supporting_document } = req.body

            if (!employee || !start_date || !end_date || !days_requested) {
                return res.status(400).json({ success: false, message: 'Campos requeridos: employee, start_date, end_date, days_requested' })
            }

            // Verificar saldo disponible
            const balance = await VacationBalance.findOne({ employee, organizationID: req.ORGID }).lean()
            if (balance && balance.pending_days < days_requested) {
                return res.status(400).json({
                    success: false,
                    message: `Días solicitados (${days_requested}) superan días pendientes (${balance.pending_days})`
                })
            }

            const request = await VacationRequest.create({
                employee,
                contract,
                start_date: new Date(start_date),
                end_date: new Date(end_date),
                days_requested,
                vacation_type: vacation_type || 'NORMAL',
                status: 'PENDING',
                notes: notes || '',
                supporting_document: supporting_document || '',
                organizationID: req.ORGID
            })

            return res.status(201).json({ success: true, message: 'Solicitud de vacaciones creada', data: request })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // GET /api/v1/vacations/requests
    async getRequests(req, res) {
        try {
            const { employee, status, page = 1, limit = 20 } = req.query
            const filter = { organizationID: req.ORGID }
            if (employee) filter.employee = employee
            if (status) filter.status = status

            const requests = await VacationRequest.find(filter)
                .populate('employee', 'firstname lastname department')
                .populate('contract', 'salary_amount salary_currency')
                .populate('reviewed_by', 'firstname lastname')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .lean()

            const total = await VacationRequest.countDocuments(filter)

            return res.status(200).json({
                success: true,
                message: 'Solicitudes de vacaciones recuperadas',
                data: requests,
                pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
            })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // GET /api/v1/vacations/requests/:id
    async getRequestById(req, res) {
        try {
            const { id } = req.params
            const request = await VacationRequest.findOne({ _id: id, organizationID: req.ORGID })
                .populate('employee', 'firstname lastname department hire_date')
                .populate('contract', 'salary_amount salary_currency payment_frequency')
                .populate('reviewed_by', 'firstname lastname')
                .lean()

            if (!request) {
                return res.status(404).json({ success: false, message: 'Solicitud no encontrada' })
            }

            return res.status(200).json({ success: true, message: 'Solicitud encontrada', data: request })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // POST /api/v1/vacations/requests/:id/approve
    async approveRequest(req, res) {
        try {
            const { id } = req.params
            const request = await VacationRequest.findOne({ _id: id, organizationID: req.ORGID })

            if (!request) {
                return res.status(404).json({ success: false, message: 'Solicitud no encontrada' })
            }

            if (request.status !== 'PENDING') {
                return res.status(400).json({ success: false, message: 'Solo se pueden aprobar solicitudes PENDIENTES' })
            }

            request.status = 'APPROVED'
            request.reviewed_by = req.HRID
            request.reviewed_at = new Date()
            await request.save()

            // Crear novedad de anticipo de vacaciones si aplica
            // TODO: Integrar con PayrollNovelty

            return res.status(200).json({ success: true, message: 'Solicitud aprobada', data: request })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // POST /api/v1/vacations/requests/:id/reject
    async rejectRequest(req, res) {
        try {
            const { id } = req.params
            const { reason } = req.body
            const request = await VacationRequest.findOne({ _id: id, organizationID: req.ORGID })

            if (!request) {
                return res.status(404).json({ success: false, message: 'Solicitud no encontrada' })
            }

            if (request.status !== 'PENDING') {
                return res.status(400).json({ success: false, message: 'Solo se pueden rechazar solicitudes PENDIENTES' })
            }

            request.status = 'REJECTED'
            request.reviewed_by = req.HRID
            request.reviewed_at = new Date()
            request.notes = `${request.notes}\n[RECHAZADA: ${reason || 'Sin razón'}]`
            await request.save()

            return res.status(200).json({ success: true, message: 'Solicitud rechazada', data: request })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // POST /api/v1/vacations/requests/:id/pay
    async payVacation(req, res) {
        try {
            const { id } = req.params
            const { payment_date, period_id } = req.body

            const request = await VacationRequest.findOne({ _id: id, organizationID: req.ORGID })
                .populate('employee')
                .populate('contract')

            if (!request) {
                return res.status(404).json({ success: false, message: 'Solicitud no encontrada' })
            }

            if (request.status !== 'APPROVED') {
                return res.status(400).json({ success: false, message: 'Solo se pueden pagar solicitudes APROBADAS' })
            }

            const policy = await PayrollPolicy.findOne({ organizationID: req.ORGID })
            const calculator = new VacationCalculator(policy)

            // Calcular pago
            const paymentCalc = await calculator.calculateVacationPayment({
                employee: request.employee,
                daysEnjoyed: request.days_requested,
                calculationBase: policy.vacation_salary_basis,
                includeCestaticket: policy.cestaticket_pay_on_vacation
            })

            // Crear recibo de vacaciones
            const vacationReceipt = await PayrollReceipt.create({
                employee: request.employee._id,
                period: period_id,
                contract: request.contract?._id,
                contract_snapshot: {
                    salary_amount: request.employee.salary_amount,
                    salary_currency: request.employee.salary_currency,
                    payment_frequency: request.employee.payment_frequency,
                    includes_cestaticket: request.employee.includes_cestaticket
                },
                salary_base_snapshot: request.employee.salary_amount,
                exchange_rate_snapshot: 1, // TODO: obtener tasa real
                currency_code: 'VES',
                total_income_ves: paymentCalc.total.toNumber(),
                total_deductions_ves: 0,
                net_pay_ves: paymentCalc.total.toNumber(),
                status: 'PAID',
                tipo_recibo: 'VACACIONES',
                organizationID: req.ORGID
            })

            // Actualizar solicitud
            request.status = 'TAKEN'
            request.payroll_novelty = vacationReceipt._id
            await request.save()

            // Actualizar saldo
            await calculator.updateVacationBalance(
                request.employee._id,
                request.days_requested,
                request.start_date,
                request.end_date,
                paymentCalc.dailySalary
            )

            // Crear registro de pago de vacaciones
            const vacationPayment = await VacationPayment.create({
                vacation_request: request._id,
                payment_id: vacationReceipt._id,
                days_paid: request.days_requested,
                daily_salary_ves: paymentCalc.dailySalary.toNumber(),
                bonus_days: paymentCalc.bonusDays,
                bonus_amount_ves: paymentCalc.bonoVacacional.toNumber(),
                total_ves: paymentCalc.total.toNumber(),
                exchange_rate: 1,
                status: 'PAID',
                organizationID: req.ORGID
            })

            return res.status(200).json({
                success: true,
                message: 'Vacaciones pagadas exitosamente',
                data: { receipt: vacationReceipt, payment: vacationPayment, calculation: paymentCalc }
            })
        } catch (error) {
            console.error('[VacationController.payVacation] Error:', error)
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // GET /api/v1/holidays
    async getHolidays(req, res) {
        try {
            const { year, type } = req.query
            const filter = { organizationID: req.ORGID }
            if (year) {
                const start = new Date(year, 0, 1)
                const end = new Date(year, 11, 31, 23, 59, 59)
                filter.date = { $gte: start, $lte: end }
            }
            if (type) filter.type = type

            const holidays = await Holiday.find(filter).sort({ date: 1 }).lean()

            return res.status(200).json({ success: true, message: 'Feriados recuperados', data: holidays })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // POST /api/v1/holidays
    async createHoliday(req, res) {
        try {
            const { date, name, type, is_recurring, region, branch } = req.body

            if (!date || !name || !type) {
                return res.status(400).json({ success: false, message: 'Campos requeridos: date, name, type' })
            }

            const holiday = await Holiday.create({
                date: new Date(date),
                name,
                type,
                is_recurring: is_recurring || false,
                region: region || '',
                branch,
                organizationID: req.ORGID
            })

            return res.status(201).json({ success: true, message: 'Feriado creado', data: holiday })
        } catch (error) {
            if (error.code === 11000) {
                return res.status(400).json({ success: false, message: 'Ya existe un feriado en esa fecha' })
            }
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // DELETE /api/v1/holidays/:id
    async deleteHoliday(req, res) {
        try {
            const { id } = req.params
            const holiday = await Holiday.findOneAndDelete({ _id: id, organizationID: req.ORGID })

            if (!holiday) {
                return res.status(404).json({ success: false, message: 'Feriado no encontrado' })
            }

            return res.status(200).json({ success: true, message: 'Feriado eliminado' })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    }
}

export default VacationController