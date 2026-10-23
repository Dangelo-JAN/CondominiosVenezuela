import { PayrollNovelty } from '../models/payroll/PayrollNovelty.model.js'
import { PayrollConcept } from '../models/payroll/PayrollConcept.model.js'
import { PayrollPeriod } from '../models/payroll/PayrollPeriod.model.js'
import { Employee } from '../models/Employee.model.js'

export const PayrollNoveltyController = {
    // GET /api/v1/payroll-novelties
    async getAll(req, res) {
        try {
            const { period, employee, concept_code, status, page = 1, limit = 50 } = req.query
            const filter = { organizationID: req.ORGID }
            if (period) filter.period = period
            if (employee) filter.employee = employee
            if (concept_code) filter.concept_code = concept_code.toUpperCase()
            if (status) filter.status = status

            const novelties = await PayrollNovelty.find(filter)
                .populate('employee', 'firstname lastname department')
                .populate('period', 'name start_date end_date')
                .populate('applied_by', 'firstname lastname')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .lean()

            const total = await PayrollNovelty.countDocuments(filter)

            return res.status(200).json({
                success: true,
                message: 'Novedades recuperadas exitosamente',
                data: novelties,
                pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
            })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // GET /api/v1/payroll-novelties/:id
    async getById(req, res) {
        try {
            const { id } = req.params
            const novelty = await PayrollNovelty.findOne({ _id: id, organizationID: req.ORGID })
                .populate('employee', 'firstname lastname department')
                .populate('period', 'name start_date end_date')
                .populate('applied_by', 'firstname lastname')
                .lean()

            if (!novelty) {
                return res.status(404).json({ success: false, message: 'Novedad no encontrada' })
            }

            return res.status(200).json({ success: true, message: 'Novedad encontrada', data: novelty })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // POST /api/v1/payroll-novelties
    async create(req, res) {
        try {
            const { employee, period, concept_code, amount, quantity, unit, description, source, reference_id, reference_model } = req.body

            if (!employee || !period || !concept_code) {
                return res.status(400).json({ success: false, message: 'Campos requeridos: employee, period, concept_code' })
            }

            // Verificar que el concepto existe y es elegible para novedad
            const concept = await PayrollConcept.findOne({ code: concept_code.toUpperCase(), organizationID: req.ORGID })
            if (!concept) {
                return res.status(404).json({ success: false, message: 'Concepto no encontrado' })
            }

            if (!concept.is_novelty_eligible) {
                return res.status(400).json({ success: false, message: 'Este concepto no permite novedades' })
            }

            // Verificar que el período existe
            const payrollPeriod = await PayrollPeriod.findOne({ _id: period, organizationID: req.ORGID })
            if (!payrollPeriod) {
                return res.status(404).json({ success: false, message: 'Período de nómina no encontrado' })
            }

            const novelty = await PayrollNovelty.create({
                employee,
                period,
                concept_code: concept_code.toUpperCase(),
                amount: amount || 0,
                quantity: quantity || 1,
                unit: unit || 'BS',
                description: description || '',
                source: source || 'MANUAL',
                reference_id,
                reference_model,
                status: 'PENDING',
                organizationID: req.ORGID
            })

            // Marcar recibo para recálculo si está en DRAFT
            await PayrollReceipt.updateMany(
                { employee, period, organizationID: req.ORGID, status: 'DRAFT' },
                { needs_recalculation: true }
            )

            return res.status(201).json({ success: true, message: 'Novedad creada exitosamente', data: novelty })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // PUT /api/v1/payroll-novelties/:id
    async update(req, res) {
        try {
            const { id } = req.params
            const novelty = await PayrollNovelty.findOne({ _id: id, organizationID: req.ORGID })

            if (!novelty) {
                return res.status(404).json({ success: false, message: 'Novedad no encontrada' })
            }

            if (novelty.status === 'APPLIED') {
                return res.status(400).json({ success: false, message: 'No se puede modificar una novedad ya aplicada' })
            }

            const allowedFields = ['amount', 'quantity', 'unit', 'description', 'source', 'reference_id', 'reference_model']
            for (const field of allowedFields) {
                if (req.body[field] !== undefined) {
                    novelty[field] = req.body[field]
                }
            }

            await novelty.save()

            // Marcar recibo para recálculo
            await PayrollReceipt.updateMany(
                { employee: novelty.employee, period: novelty.period, organizationID: req.ORGID, status: 'DRAFT' },
                { needs_recalculation: true }
            )

            return res.status(200).json({ success: true, message: 'Novedad actualizada', data: novelty })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // POST /api/v1/payroll-novelties/:id/apply
    async apply(req, res) {
        try {
            const { id } = req.params
            const novelty = await PayrollNovelty.findOne({ _id: id, organizationID: req.ORGID })

            if (!novelty) {
                return res.status(404).json({ success: false, message: 'Novedad no encontrada' })
            }

            if (novelty.status === 'APPLIED') {
                return res.status(400).json({ success: false, message: 'La novedad ya está aplicada' })
            }

            novelty.status = 'APPLIED'
            novelty.applied_by = req.HRID
            novelty.applied_at = new Date()
            await novelty.save()

            // Marcar recibo para recálculo
            await PayrollReceipt.updateMany(
                { employee: novelty.employee, period: novelty.period, organizationID: req.ORGID, status: 'DRAFT' },
                { needs_recalculation: true }
            )

            return res.status(200).json({ success: true, message: 'Novedad aplicada exitosamente', data: novelty })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // POST /api/v1/payroll-novelties/:id/reject
    async reject(req, res) {
        try {
            const { id } = req.params
            const { reason } = req.body
            const novelty = await PayrollNovelty.findOne({ _id: id, organizationID: req.ORGID })

            if (!novelty) {
                return res.status(404).json({ success: false, message: 'Novedad no encontrada' })
            }

            novelty.status = 'REJECTED'
            novelty.description = `${novelty.description}\n[RECHAZADA: ${reason || 'Sin razón'}]`
            await novelty.save()

            return res.status(200).json({ success: true, message: 'Novedad rechazada', data: novelty })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // DELETE /api/v1/payroll-novelties/:id
    async delete(req, res) {
        try {
            const { id } = req.params
            const novelty = await PayrollNovelty.findOne({ _id: id, organizationID: req.ORGID })

            if (!novelty) {
                return res.status(404).json({ success: false, message: 'Novedad no encontrada' })
            }

            if (novelty.status === 'APPLIED') {
                return res.status(400).json({ success: false, message: 'No se puede eliminar una novedad aplicada' })
            }

            await novelty.deleteOne()

            return res.status(200).json({ success: true, message: 'Novedad eliminada' })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // POST /api/v1/payroll-novelties/bulk-create
    async bulkCreate(req, res) {
        try {
            const { novelties } = req.body // Array de novedades

            if (!Array.isArray(novelties) || novelties.length === 0) {
                return res.status(400).json({ success: false, message: 'Se requiere array de novedades' })
            }

            const results = { created: [], errors: [] }

            for (const n of novelties) {
                try {
                    if (!n.employee || !n.period || !n.concept_code) {
                        results.errors.push({ novelty: n, error: 'Campos requeridos faltantes' })
                        continue
                    }

                    const concept = await PayrollConcept.findOne({ code: n.concept_code.toUpperCase(), organizationID: req.ORGID })
                    if (!concept || !concept.is_novelty_eligible) {
                        results.errors.push({ novelty: n, error: 'Concepto inválido o no elegible' })
                        continue
                    }

                    const created = await PayrollNovelty.create({
                        employee: n.employee,
                        period: n.period,
                        concept_code: n.concept_code.toUpperCase(),
                        amount: n.amount || 0,
                        quantity: n.quantity || 1,
                        unit: n.unit || 'BS',
                        description: n.description || '',
                        source: n.source || 'IMPORT',
                        reference_id: n.reference_id,
                        reference_model: n.reference_model,
                        status: 'PENDING',
                        organizationID: req.ORGID
                    })

                    results.created.push(created)
                } catch (err) {
                    results.errors.push({ novelty: n, error: err.message })
                }
            }

            // Marcar recibos para recálculo
            const periods = [...new Set(results.created.map(n => n.period.toString()))]
            for (const periodId of periods) {
                await PayrollReceipt.updateMany(
                    { period: periodId, organizationID: req.ORGID, status: 'DRAFT' },
                    { needs_recalculation: true }
                )
            }

            return res.status(201).json({
                success: true,
                message: `Procesadas ${results.created.length} novedades, ${results.errors.length} errores`,
                data: results
            })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    }
}

export default PayrollNoveltyController