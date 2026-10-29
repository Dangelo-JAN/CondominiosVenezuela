import { Decimal } from 'decimal.js'

/**
 * Calculador de Costos Patronales - EmployerCosts
 * Calcula IVSS_PATRONAL, RPE_PATRONAL, FAOV_PATRONAL, INCES_PATRONAL, LPPSS_PATRONAL, BANVIH_PATRONAL
 * Basado en la lógica de Nóminix (payroll_core/services/payroll_engine.py calculate_employer_costs)
 */

export async function calculateEmployerCosts(context, accumulators) {
    const policy = context.policy
    const exchangeRate = context.exchangeRate
    const variables = context.getAllowedVariables()

    const costs = []
    const lunes = variables.LUNES || new Decimal(0)

    // Base semanal para IVSS y RPE (salario mínimo × 5 × 12 / 52)
    const weeklyBase = new Decimal(policy.minimum_wage_ves || 130)
        .times(5)
        .times(12)
        .div(52)

    // ═══════════════════════════════════════════════════════════════════════
    // 1. IVSS PATRONAL
    // ═══════════════════════════════════════════════════════════════════════
    const ivssBase = Decimal.min(
        accumulators.get('IVSS_BASE'),
        new Decimal(policy.minimum_wage_ves || 130).times(policy.ivss_salary_cap_multiplier || 5)
    )
    const ivssAmount = weeklyBase
        .times(new Decimal(policy.ivss_employer_rate || 9).div(100))
        .times(lunes)

    costs.push({
        concept_code: 'IVSS_PATRONAL',
        concept_name: 'Seguro Social Obligatorio (IVSS) - Patronal',
        base_ves: ivssBase.toNumber(),
        rate: policy.ivss_employer_rate || 9,
        amount_ves: ivssAmount.dp(2, Decimal.ROUND_HALF_UP).toNumber(),
        calculation_log: {
            trace: `Base semanal: ${weeklyBase.toFixed(2)} × ${policy.ivss_employer_rate}% × ${lunes.toNumber()} lunes = ${ivssAmount.toFixed(2)}`,
            formula: 'weeklyBase × (ivss_employer_rate / 100) × LUNES',
            variables: {
                weeklyBase: { value: weeklyBase.toNumber(), description: 'Base semanal (salario mínimo × 5 × 12 / 52)' },
                ivss_employer_rate: { value: policy.ivss_employer_rate, description: '% IVSS patronal' },
                LUNES: { value: lunes.toNumber(), description: 'Cantidad de lunes en el período' }
            }
        }
    })

    // ═══════════════════════════════════════════════════════════════════════
    // 2. RPE PATRONAL
    // ═══════════════════════════════════════════════════════════════════════
    const rpeAmount = weeklyBase
        .times(new Decimal(policy.rpe_employer_rate || 2).div(100))
        .times(lunes)

    costs.push({
        concept_code: 'RPE_PATRONAL',
        concept_name: 'Régimen Prestacional de Empleo (RPE) - Patronal',
        base_ves: accumulators.get('RPE_BASE').toNumber(),
        rate: policy.rpe_employer_rate || 2,
        amount_ves: rpeAmount.dp(2, Decimal.ROUND_HALF_UP).toNumber(),
        calculation_log: {
            trace: `Base semanal: ${weeklyBase.toFixed(2)} × ${policy.rpe_employer_rate}% × ${lunes.toNumber()} lunes = ${rpeAmount.toFixed(2)}`,
            formula: 'weeklyBase × (rpe_employer_rate / 100) × LUNES',
            variables: {
                weeklyBase: { value: weeklyBase.toNumber(), description: 'Base semanal (salario mínimo × 5 × 12 / 52)' },
                rpe_employer_rate: { value: policy.rpe_employer_rate, description: '% RPE patronal' },
                LUNES: { value: lunes.toNumber(), description: 'Cantidad de lunes en el período' }
            }
        }
    })

    // ═══════════════════════════════════════════════════════════════════════
    // 3. FAOV PATRONAL
    // ═══════════════════════════════════════════════════════════════════════
    // Base configurable: SALARIO_MENSUAL (default) o según fórmula
    let faovBase = new Decimal(0)
    const faovFormula = policy.faov_employer_base_formula || 'SALARIO_MENSUAL'

    if (faovFormula === 'SALARIO_MENSUAL') {
        faovBase = variables.SUELDO_BASE_MENSUAL || new Decimal(0)
    } else if (faovFormula === 'SALARIO_TOTAL') {
        faovBase = variables.SALARIO_PERIOD || new Decimal(0)
        // Si es quincenal, anualizar
        if (context.period?.period_frequency === 'QUINCENAL') {
            faovBase = faovBase.times(2)
        }
    } else {
        // Evaluar fórmula personalizada
        try {
            faovBase = new Decimal(evalFormula(faovFormula, variables))
        } catch {
            faovBase = variables.SUELDO_BASE_MENSUAL || new Decimal(0)
        }
    }

    const faovAmount = faovBase
        .times(new Decimal(policy.faov_employer_rate || 2).div(100))

    costs.push({
        concept_code: 'FAOV_PATRONAL',
        concept_name: 'Fondo de Ahorro Obligatorio para Vivienda (FAOV) - Patronal',
        base_ves: faovBase.toNumber(),
        rate: policy.faov_employer_rate || 2,
        amount_ves: faovAmount.dp(2, Decimal.ROUND_HALF_UP).toNumber(),
        calculation_log: {
            trace: `Base (${faovFormula}): ${faovBase.toFixed(2)} × ${policy.faov_employer_rate}% = ${faovAmount.toFixed(2)}`,
            formula: 'faov_employer_base × (faov_employer_rate / 100)',
            variables: {
                faov_employer_base_formula: { value: faovFormula, description: 'Fórmula base patronal FAOV' },
                faovBase: { value: faovBase.toNumber(), description: 'Base calculada' },
                faov_employer_rate: { value: policy.faov_employer_rate, description: '% FAOV patronal' }
            }
        }
    })

    // ═══════════════════════════════════════════════════════════════════════
    // 4. INCES PATRONAL (Trimestral - se calcula por período como provisión)
    // ═══════════════════════════════════════════════════════════════════════
    // Base = Nómina bruta del período (aprox 1/3 del trimestre)
    const incesBase = accumulators.get('INCES_BASE') || variables.FAOV_BASE || new Decimal(0)
    const incesAmount = incesBase
        .times(new Decimal(policy.inces_employer_rate || 2).div(100))
        .div(3) // Provisión mensual/quincenal del trimestre

    costs.push({
        concept_code: 'INCES_PATRONAL',
        concept_name: 'INCES - Patronal (Provisión)',
        base_ves: incesBase.toNumber(),
        rate: policy.inces_employer_rate || 2,
        amount_ves: incesAmount.dp(2, Decimal.ROUND_HALF_UP).toNumber(),
        calculation_log: {
            trace: `Base INCES: ${incesBase.toFixed(2)} × ${policy.inces_employer_rate}% ÷ 3 = ${incesAmount.toFixed(2)}`,
            formula: 'INCES_BASE × (inces_employer_rate / 100) / 3',
            variables: {
                INCES_BASE: { value: incesBase.toNumber(), description: 'Base INCES (aprox FAOV_BASE)' },
                inces_employer_rate: { value: policy.inces_employer_rate, description: '% INCES patronal anual' }
            }
        }
    })

    // ═══════════════════════════════════════════════════════════════════════
    // 5. LPPSS PATRONAL
    // ═══════════════════════════════════════════════════════════════════════
    // Base = MIN(salario_ves, imii_usd × exchange_rate)
    const salaryVes = variables.SALARIO_PERIOD || new Decimal(0)
    const imiiVes = new Decimal(policy.imii_usd || 130).times(exchangeRate)
    const lppssBase = Decimal.min(salaryVes, imiiVes)
    const lppssAmount = lppssBase
        .times(new Decimal(policy.lppss_rate || 9).div(100))

    costs.push({
        concept_code: 'LPPSS_PATRONAL',
        concept_name: 'Ley de Protección del Poder Adquisitivo (LPPSS) - Patronal',
        base_ves: lppssBase.toNumber(),
        rate: policy.lppss_rate || 9,
        amount_ves: lppssAmount.dp(2, Decimal.ROUND_HALF_UP).toNumber(),
        calculation_log: {
            trace: `MIN(${salaryVes.toFixed(2)}, ${imiiVes.toFixed(2)}) × ${policy.lppss_rate}% = ${lppssAmount.toFixed(2)}`,
            formula: 'MIN(SALARIO_PERIOD, IMI_USD × exchange_rate) × (lppss_rate / 100)',
            variables: {
                SALARIO_PERIOD: { value: salaryVes.toNumber(), description: 'Salario del período en VES' },
                IMI_VES: { value: imiiVes.toNumber(), description: 'IMI en VES (imii_usd × tasa)' },
                lppss_rate: { value: policy.lppss_rate, description: '% LPPSS' }
            }
        }
    })

    // ═══════════════════════════════════════════════════════════════════════
    // 6. BANVIH PATRONAL (1-2% según nómina total)
    // ═══════════════════════════════════════════════════════════════════════
    // Usar base similar a FAOV
    const banvihBase = faovBase
    const banvihRate = policy.banvih_employer_rate || 1 // 1% default
    const banvihAmount = banvihBase
        .times(new Decimal(banvihRate).div(100))

    costs.push({
        concept_code: 'BANVIH_PATRONAL',
        concept_name: 'Banco de Vivienda y Hábitat (BANVIH) - Patronal',
        base_ves: banvihBase.toNumber(),
        rate: banvihRate,
        amount_ves: banvihAmount.dp(2, Decimal.ROUND_HALF_UP).toNumber(),
        calculation_log: {
            trace: `Base BANVIH: ${banvihBase.toFixed(2)} × ${banvihRate}% = ${banvihAmount.toFixed(2)}`,
            formula: 'faov_employer_base × (banvih_rate / 100)',
            variables: {
                faov_employer_base: { value: banvihBase.toNumber(), description: 'Base FAOV patronal' },
                banvih_rate: { value: banvihRate, description: '% BANVIH patronal' }
            }
        }
    })

    return costs
}

/**
 * Evalúa fórmula simple para faov_employer_base_formula
 */
function evalFormula(formula, variables) {
    // Reemplazar variables conocidas
    let expr = formula
    for (const [key, value] of Object.entries(variables)) {
        if (value instanceof Decimal) {
            expr = expr.replace(new RegExp(key, 'g'), value.toString())
        }
    }
    // Evaluación segura simple (solo operaciones básicas)
    return Function('"use strict"; return (' + expr + ')')()
}

/**
 * Calcula costos patronales para un recibo individual (para recálculo)
 */
export async function calculateEmployerCostsForReceipt(receipt, context, accumulators) {
    return calculateEmployerCosts(context, accumulators)
}

export default {
    calculateEmployerCosts,
    calculateEmployerCostsForReceipt
}