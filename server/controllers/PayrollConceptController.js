import { PayrollConcept } from '../models/payroll/PayrollConcept.model.js'
import { ReceiptType } from '../models/payroll/ReceiptType.model.js'
import { validateFormula } from '../services/payroll/formula-evaluator.js'

export const PayrollConceptController = {
    // GET /api/v1/payroll-concepts
    async getAll(req, res) {
        try {
            const { kind, active, page = 1, limit = 50 } = req.query
            const filter = { organizationID: req.ORGID }
            if (kind) filter.kind = kind
            if (active !== undefined) filter.active = active === 'true'

            const concepts = await PayrollConcept.find(filter)
                .populate('tipo_recibo', 'code name')
                .populate('currency_id', 'code symbol')
                .sort({ receipt_order: 1, code: 1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .lean()

            const total = await PayrollConcept.countDocuments(filter)

            return res.status(200).json({
                success: true,
                message: 'Conceptos de nómina recuperados',
                data: concepts,
                pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
            })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // GET /api/v1/payroll-concepts/:id
    async getById(req, res) {
        try {
            const { id } = req.params
            const concept = await PayrollConcept.findOne({ _id: id, organizationID: req.ORGID })
                .populate('tipo_recibo', 'code name')
                .populate('currency_id', 'code symbol')
                .lean()

            if (!concept) {
                return res.status(404).json({ success: false, message: 'Concepto no encontrado' })
            }

            return res.status(200).json({ success: true, message: 'Concepto encontrado', data: concept })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // POST /api/v1/payroll-concepts
    async create(req, res) {
        try {
            const {
                code, name, description, kind, computation_method, value, currency_id,
                formula, system_params, calculation_base, behavior, rules, incidences,
                is_salary_incidence, is_system, is_novelty_eligible,
                deducts_from_base_salary, adds_to_complement, replaces_base_salary,
                tipo_recibo, receipt_order, show_on_payslip, appears_on_receipt, show_even_if_zero,
                unit_label
            } = req.body

            if (!code || !name || !kind) {
                return res.status(400).json({ success: false, message: 'Campos requeridos: code, name, kind' })
            }

            // Validar fórmula si es DYNAMIC_FORMULA
            if (computation_method === 'DYNAMIC_FORMULA' && formula) {
                const validation = validateFormula(formula, {
                    SALARIO_PERIOD: 1, SUELDO_BASE_DIARIO: 1, DIAS_EFECTIVOS: 1,
                    H_EXTRA_DIURNA: 1, IVSS_BASE: 1, FAOV_BASE: 1
                })
                if (!validation.valid) {
                    return res.status(400).json({ success: false, message: `Fórmula inválida: ${validation.error}` })
                }
            }

            const concept = await PayrollConcept.create({
                code: code.toUpperCase(),
                name,
                description,
                kind,
                computation_method: computation_method || 'FIXED_AMOUNT',
                value: value || 0,
                currency_id,
                formula: formula || '',
                system_params: system_params || {},
                calculation_base: calculation_base || 'GROSS',
                behavior: behavior || 'FIXED',
                rules: rules || {},
                incidences: incidences || [],
                is_salary_incidence: is_salary_incidence || false,
                is_system: is_system || false,
                is_novelty_eligible: is_novelty_eligible !== false,
                deducts_from_base_salary: deducts_from_base_salary || false,
                adds_to_complement: adds_to_complement || false,
                replaces_base_salary: replaces_base_salary || false,
                tipo_recibo,
                receipt_order: receipt_order || 0,
                show_on_payslip: show_on_payslip !== false,
                appears_on_receipt: appears_on_receipt !== false,
                show_even_if_zero: show_even_if_zero || false,
                unit_label: unit_label || 'BS',
                organizationID: req.ORGID
            })

            return res.status(201).json({ success: true, message: 'Concepto creado exitosamente', data: concept })
        } catch (error) {
            if (error.code === 11000) {
                return res.status(400).json({ success: false, message: 'Ya existe un concepto con ese código' })
            }
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // PUT /api/v1/payroll-concepts/:id
    async update(req, res) {
        try {
            const { id } = req.params
            const concept = await PayrollConcept.findOne({ _id: id, organizationID: req.ORGID })

            if (!concept) {
                return res.status(404).json({ success: false, message: 'Concepto no encontrado' })
            }

            // No permitir modificar conceptos del sistema
            if (concept.is_system) {
                return res.status(400).json({ success: false, message: 'No se pueden modificar conceptos del sistema' })
            }

            const allowedFields = [
                'name', 'description', 'kind', 'computation_method', 'value', 'currency_id',
                'formula', 'system_params', 'calculation_base', 'behavior', 'rules', 'incidences',
                'is_salary_incidence', 'is_novelty_eligible', 'deducts_from_base_salary',
                'adds_to_complement', 'replaces_base_salary', 'tipo_recibo', 'receipt_order',
                'show_on_payslip', 'appears_on_receipt', 'show_even_if_zero', 'unit_label', 'active'
            ]

            for (const field of allowedFields) {
                if (req.body[field] !== undefined) {
                    concept[field] = req.body[field]
                }
            }

            // Validar fórmula si cambió
            if (req.body.formula && concept.computation_method === 'DYNAMIC_FORMULA') {
                const validation = validateFormula(concept.formula, {
                    SALARIO_PERIOD: 1, SUELDO_BASE_DIARIO: 1, DIAS_EFECTIVOS: 1,
                    H_EXTRA_DIURNA: 1, IVSS_BASE: 1, FAOV_BASE: 1
                })
                if (!validation.valid) {
                    return res.status(400).json({ success: false, message: `Fórmula inválida: ${validation.error}` })
                }
            }

            await concept.save()

            return res.status(200).json({ success: true, message: 'Concepto actualizado exitosamente', data: concept })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // DELETE /api/v1/payroll-concepts/:id
    async delete(req, res) {
        try {
            const { id } = req.params
            const concept = await PayrollConcept.findOne({ _id: id, organizationID: req.ORGID })

            if (!concept) {
                return res.status(404).json({ success: false, message: 'Concepto no encontrado' })
            }

            if (concept.is_system) {
                return res.status(400).json({ success: false, message: 'No se pueden eliminar conceptos del sistema' })
            }

            await concept.deleteOne()

            return res.status(200).json({ success: true, message: 'Concepto eliminado exitosamente' })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // POST /api/v1/payroll-concepts/validate-formula
    async validateFormula(req, res) {
        try {
            const { formula } = req.body
            if (!formula) {
                return res.status(400).json({ success: false, message: 'Fórmula requerida' })
            }

            const validation = validateFormula(formula, {
                SALARIO_PERIOD: 1, SUELDO_BASE_DIARIO: 1, DIAS_EFECTIVOS: 1,
                H_EXTRA_DIURNA: 1, IVSS_BASE: 1, FAOV_BASE: 1,
                minimum_wage_ves: 1, ivss_employee_rate: 1
            })

            return res.status(200).json({ success: true, message: 'Validación completada', data: validation })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // GET /api/v1/receipt-types
    async getReceiptTypes(req, res) {
        try {
            const types = await ReceiptType.find({ organizationID: req.ORGID, active: true })
                .sort({ code: 1 })
                .lean()

            return res.status(200).json({ success: true, message: 'Tipos de recibo recuperados', data: types })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // POST /api/v1/receipt-types
    async createReceiptType(req, res) {
        try {
            const { code, name, description } = req.body
            if (!code || !name) {
                return res.status(400).json({ success: false, message: 'Campos requeridos: code, name' })
            }

            const type = await ReceiptType.create({
                code: code.toUpperCase(),
                name,
                description,
                organizationID: req.ORGID
            })

            return res.status(201).json({ success: true, message: 'Tipo de recibo creado', data: type })
        } catch (error) {
            if (error.code === 11000) {
                return res.status(400).json({ success: false, message: 'Ya existe un tipo con ese código' })
            }
            return res.status(500).json({ success: false, message: error.message })
        }
    }
}

export default PayrollConceptController