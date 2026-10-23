import { Decimal } from 'decimal.js'

/**
 * Validador y Aplicador de Reglas de Conceptos - ConceptRules
 * Procesa rules JSONB: condiciones, topes, rangos, dependencias
 * Basado en la lógica de Nóminix (payroll_core/models.py PayrollConcept.rules)
 */
export class ConceptRulesEngine {
    /**
     * Valida si un concepto aplica según sus condiciones
     * @param {Object} concept - Documento PayrollConcept
     * @param {Object} context - FormulaContext con variables
     * @returns {boolean}
     */
    static evaluateConditions(concept, context) {
        if (!concept.rules || !concept.rules.conditions) {
            return true
        }

        const variables = context.getAllowedVariables()

        for (const condition of concept.rules.conditions) {
            if (!this._evaluateCondition(condition, variables)) {
                return false
            }
        }

        return true
    }

    /**
     * Evalúa una condición individual
     */
    static _evaluateCondition(condition, variables) {
        const { field, operator, value } = condition

        const fieldValue = variables[field]
        if (!fieldValue) {
            return false
        }

        const fieldDecimal = new Decimal(fieldValue)
        const compareValue = new Decimal(value)

        switch (operator) {
            case '>':
                return fieldDecimal.gt(compareValue)
            case '>=':
                return fieldDecimal.gte(compareValue)
            case '<':
                return fieldDecimal.lt(compareValue)
            case '<=':
                return fieldDecimal.lte(compareValue)
            case '==':
            case '===':
                return fieldDecimal.eq(compareValue)
            case '!=':
            case '!==':
                return fieldDecimal.neq(compareValue)
            case 'in':
                if (Array.isArray(value)) {
                    return value.some(v => fieldDecimal.eq(new Decimal(v)))
                }
                return false
            case 'not_in':
                if (Array.isArray(value)) {
                    return !value.some(v => fieldDecimal.eq(new Decimal(v)))
                }
                return true
            default:
                return false
        }
    }

    /**
     * Aplica topes (caps) a un monto calculado
     * @param {Object} concept - Documento PayrollConcept
     * @param {Decimal} amount - Monto calculado
     * @param {Object} context - FormulaContext
     * @returns {Decimal} Monto con topes aplicados
     */
    static applyCaps(concept, amount, context) {
        if (!concept.rules || !concept.rules.caps) {
            return amount
        }

        const caps = concept.rules.caps
        const variables = context.getAllowedVariables()
        let result = new Decimal(amount)

        // Tope semanal de horas extra
        if (caps.weekly_max_hours && concept.code === 'H_EXTRA_DIURNA') {
            const weeklyHours = variables.H_EXTRA_DIURNA || new Decimal(0)
            if (weeklyHours.gt(caps.weekly_max_hours)) {
                const factor = new Decimal(caps.weekly_max_hours).div(weeklyHours)
                result = result.times(factor)
            }
        }

        // Tope diario de horas extra
        if (caps.daily_max_hours && concept.code === 'H_EXTRA_DIURNA') {
            // Requiere lógica más compleja por día
        }

        // Tope porcentual
        if (caps.max_percentage && caps.base_variable) {
            const base = variables[caps.base_variable] || new Decimal(0)
            const maxAmount = base.times(caps.max_percentage).div(100)
            if (result.gt(maxAmount)) {
                result = maxAmount
            }
        }

        // Tope absoluto
        if (caps.max_amount) {
            const maxAmount = new Decimal(caps.max_amount)
            if (result.gt(maxAmount)) {
                result = maxAmount
            }
        }

        // Tope mínimo
        if (caps.min_amount) {
            const minAmount = new Decimal(caps.min_amount)
            if (result.lt(minAmount)) {
                result = minAmount
            }
        }

        return result
    }

    /**
     * Verifica dependencias del concepto
     * @param {Object} concept - Documento PayrollConcept
     * @param {Object} context - FormulaContext
     * @returns {boolean}
     */
    static checkDependencies(concept, context) {
        if (!concept.rules || !concept.rules.dependencies) {
            return true
        }

        const variables = context.getAllowedVariables()

        for (const dep of concept.rules.dependencies) {
            if (dep in variables) {
                const value = variables[dep]
                if (!value || new Decimal(value).isZero()) {
                    return false
                }
            }
        }

        return true
    }

    /**
     * Valida reglas de sistema (system_params)
     * @param {Object} concept - Documento PayrollConcept
     * @returns {{ valid: boolean, error?: string }}
     */
    static validateSystemParams(concept) {
        if (!concept.system_params) {
            return { valid: true }
        }

        const params = concept.system_params

        // Validar rate
        if (params.rate !== undefined) {
            const rate = new Decimal(params.rate)
            if (rate.lt(0) || rate.gt(100)) {
                return { valid: false, error: 'rate debe estar entre 0 y 100' }
            }
        }

        // Validar is_weekly
        if (params.is_weekly !== undefined && typeof params.is_weekly !== 'boolean') {
            return { valid: false, error: 'is_weekly debe ser boolean' }
        }

        // Validar base_label
        const validBases = ['FAOV_BASE', 'IVSS_BASE', 'RPE_BASE', 'PRESTACIONES_BASE', 'ISLR_BASE', 'INCES_BASE']
        if (params.base_label && !validBases.includes(params.base_label)) {
            return { valid: false, error: `base_label inválido: ${params.base_label}` }
        }

        // Validar base_source
        const validSources = ['ACCUMULATOR', 'CONTRACT', 'ATTENDANCE', 'NOVELTY']
        if (params.base_source && !validSources.includes(params.base_source)) {
            return { valid: false, error: `base_source inválido: ${params.base_source}` }
        }

        // Validar cap_multiplier
        if (params.cap_multiplier !== undefined) {
            const mult = new Decimal(params.cap_multiplier)
            if (mult.lte(0)) {
                return { valid: false, error: 'cap_multiplier debe ser > 0' }
            }
        }

        return { valid: true }
    }

    /**
     * Procesa reglas completas para un concepto
     * @param {Object} concept - Documento PayrollConcept
     * @param {Decimal} amount - Monto calculado
     * @param {Object} context - FormulaContext
     * @returns {Decimal} Monto final con reglas aplicadas
     */
    static processConceptRules(concept, amount, context) {
        // 1. Verificar condiciones
        if (!this.evaluateConditions(concept, context)) {
            return new Decimal(0)
        }

        // 2. Verificar dependencias
        if (!this.checkDependencies(concept, context)) {
            return new Decimal(0)
        }

        // 3. Aplicar topes
        let result = this.applyCaps(concept, amount, context)

        // 4. Redondear a 2 decimales
        result = result.dp(2, Decimal.ROUND_HALF_UP)

        return result
    }
}

export default ConceptRulesEngine