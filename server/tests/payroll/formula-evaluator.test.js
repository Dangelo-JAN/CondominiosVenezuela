import { SafeFormulaEvaluator as FormulaEvaluator, validateFormula } from '../../services/payroll/formula-evaluator.js'

describe('FormulaEvaluator', () => {
    let evaluator

    beforeEach(() => {
        evaluator = new FormulaEvaluator({})
    })

    describe('Basic arithmetic', () => {
        test('should evaluate simple addition', () => {
            const result = evaluator.evaluate('2 + 3')
            expect(result.toNumber()).toBe(5)
        })

        test('should evaluate simple subtraction', () => {
            const result = evaluator.evaluate('10 - 4')
            expect(result.toNumber()).toBe(6)
        })

        test('should evaluate multiplication', () => {
            const result = evaluator.evaluate('6 * 7')
            expect(result.toNumber()).toBe(42)
        })

        test('should evaluate division', () => {
            const result = evaluator.evaluate('20 / 4')
            expect(result.toNumber()).toBe(5)
        })

        test('should respect operator precedence', () => {
            const result = evaluator.evaluate('2 + 3 * 4')
            expect(result.toNumber()).toBe(14)
        })

        test('should handle parentheses', () => {
            const result = evaluator.evaluate('(2 + 3) * 4')
            expect(result.toNumber()).toBe(20)
        })
    })

    describe('Variables', () => {
        test('should substitute simple variables', () => {
            const evaluatorWithVars = new FormulaEvaluator({ SALARIO_BASE: 1000 })
            const result = evaluatorWithVars.evaluate('SALARIO_BASE + 100')
            expect(result.toNumber()).toBe(1100)
        })

        test('should substitute decimal variables', () => {
            const evaluatorWithVars = new FormulaEvaluator({ BASE: 1000, RATE: 0.04 })
            const result = evaluatorWithVars.evaluate('BASE * RATE')
            expect(result.toNumber()).toBe(40)
        })

        test('should throw on undefined variable', () => {
            expect(() => evaluator.evaluate('UNDEFINED_VAR + 1')).toThrow("Variable no permitida: UNDEFINED_VAR")
        })
    })

    describe('Functions', () => {
        test('should evaluate MIN function', () => {
            const result = evaluator.evaluate('MIN(100, 50)')
            expect(result.toNumber()).toBe(50)
        })

        test('should evaluate MAX function', () => {
            const result = evaluator.evaluate('MAX(100, 50)')
            expect(result.toNumber()).toBe(100)
        })

        test('should evaluate MIN with variables', () => {
            const evaluatorWithVars = new FormulaEvaluator({ SALARIO: 1000, TOPE: 500 })
            const result = evaluatorWithVars.evaluate('MIN(SALARIO, TOPE)')
            expect(result.toNumber()).toBe(500)
        })

        test('should evaluate ABS function', () => {
            const result = evaluator.evaluate('ABS(-50)')
            expect(result.toNumber()).toBe(50)
        })

        test('should evaluate ROUND function', () => {
            const result = evaluator.evaluate('ROUND(3.14159, 2)')
            expect(result.toNumber()).toBe(3.14)
        })

        test('should evaluate FLOOR function', () => {
            const result = evaluator.evaluate('FLOOR(3.9)')
            expect(result.toNumber()).toBe(3)
        })

        test('should evaluate CEIL function', () => {
            const result = evaluator.evaluate('CEIL(3.1)')
            expect(result.toNumber()).toBe(4)
        })
    })

    describe('Venezuelan payroll formulas', () => {
        test('should calculate IVSS obrero (4% with cap 5 SMVM)', () => {
            const formula = 'MIN(IVSS_BASE, 5 * MINIMUM_WAGE_VES) * 0.04'
            const evaluatorWithVars = new FormulaEvaluator({ IVSS_BASE: 1000, MINIMUM_WAGE_VES: 130 })
            const result = evaluatorWithVars.evaluate(formula)
            expect(result.toNumber()).toBe(26)
        })

        test('should calculate FAOV obrero (1%)', () => {
            const formula = 'FAOV_BASE * 0.01'
            const evaluatorWithVars = new FormulaEvaluator({ FAOV_BASE: 1000 })
            const result = evaluatorWithVars.evaluate(formula)
            expect(result.toNumber()).toBe(10)
        })

        test('should calculate overtime diurna (1.5x)', () => {
            const formula = 'H_EXTRA_DIURNA * SUELDO_BASE_HORA * 1.5'
            const evaluatorWithVars = new FormulaEvaluator({ H_EXTRA_DIURNA: 10, SUELDO_BASE_HORA: 50 })
            const result = evaluatorWithVars.evaluate(formula)
            expect(result.toNumber()).toBe(750)
        })

        test('should calculate overtime nocturna (1.8x = 1.5 + 0.3)', () => {
            const formula = 'H_EXTRA_NOCTURNA * SUELDO_BASE_HORA * 1.8'
            const evaluatorWithVars = new FormulaEvaluator({ H_EXTRA_NOCTURNA: 5, SUELDO_BASE_HORA: 50 })
            const result = evaluatorWithVars.evaluate(formula)
            expect(result.toNumber()).toBe(450)
        })

        test('should calculate vacation pay', () => {
            const formula = 'DIAS_VACACIONES_DISFRUTADOS * SALARIO_VACACIONAL_DIARIO'
            const evaluatorWithVars = new FormulaEvaluator({ DIAS_VACACIONES_DISFRUTADOS: 15, SALARIO_VACACIONAL_DIARIO: 200 })
            const result = evaluatorWithVars.evaluate(formula)
            expect(result.toNumber()).toBe(3000)
        })

        test('should calculate bono vacacional', () => {
            const formula = 'DIAS_BONO_VACACIONAL * SALARIO_VACACIONAL_DIARIO'
            const evaluatorWithVars = new FormulaEvaluator({ DIAS_BONO_VACACIONAL: 15, SALARIO_VACACIONAL_DIARIO: 200 })
            const result = evaluatorWithVars.evaluate(formula)
            expect(result.toNumber()).toBe(3000)
        })

        test('should calculate cestaticket (40 UT * UT_VALUE)', () => {
            const formula = 'MIN(CESTATICKET_UT * UT_VALUE_VES, 40 * UT_VALUE_VES)'
            const evaluatorWithVars = new FormulaEvaluator({ CESTATICKET_UT: 40, UT_VALUE_VES: 9 })
            const result = evaluatorWithVars.evaluate(formula)
            expect(result.toNumber()).toBe(360)
        })

        test('should calculate utilidades (split 50/50)', () => {
            const formula = '(UTILIDADES_POOL_VES * 0.5 * DIAS_EMPLEADO / TOTAL_DIAS) + (UTILIDADES_POOL_VES * 0.5 * SALARIO_EMPLEADO / TOTAL_SALARIOS)'
            const evaluatorWithVars = new FormulaEvaluator({
                UTILIDADES_POOL_VES: 100000,
                DIAS_EMPLEADO: 240,
                TOTAL_DIAS: 2400,
                SALARIO_EMPLEADO: 3000,
                TOTAL_SALARIOS: 30000
            })
            const result = evaluatorWithVars.evaluate(formula)
            expect(result.toNumber()).toBe(10000)
        })

        test('should calculate prestaciones antigüedad (30 días/año, tope 30 años)', () => {
            const formula = 'MIN(ANTIGUEDAD_ANOS, 30) * 30 * SALARIO_PRESTACIONES_DIARIO'
            const evaluatorWithVars = new FormulaEvaluator({ ANTIGUEDAD_ANOS: 10, SALARIO_PRESTACIONES_DIARIO: 100 })
            const result = evaluatorWithVars.evaluate(formula)
            expect(result.toNumber()).toBe(30000)
        })

        test('should cap prestaciones at 30 years', () => {
            const formula = 'MIN(ANTIGUEDAD_ANOS, 30) * 30 * SALARIO_PRESTACIONES_DIARIO'
            const evaluatorWithVars = new FormulaEvaluator({ ANTIGUEDAD_ANOS: 35, SALARIO_PRESTACIONES_DIARIO: 100 })
            const result = evaluatorWithVars.evaluate(formula)
            expect(result.toNumber()).toBe(90000)
        })
    })

    describe('Complex expressions', () => {
        test('should handle nested function calls', () => {
            const result = evaluator.evaluate('ROUND(MIN(100.567, 50.123), 1)', {})
            expect(result.toNumber()).toBe(50.1)
        })

        test('should handle multiple operations', () => {
            const evaluatorWithVars = new FormulaEvaluator({ BASE: 1000, BONUS: 200, DEDUCTION_RATE: 0.1 })
            const result = evaluatorWithVars.evaluate('(BASE + BONUS) * (1 - DEDUCTION_RATE)')
            expect(result.toNumber()).toBe(1080)
        })
    })
})

describe('validateFormula', () => {
    test('should validate correct formula', () => {
        const result = validateFormula('BASE * 0.04', { BASE: 1 })
        expect(result.valid).toBe(true)
        expect(result.error).toBeNull()
    })

    test('should reject formula with undefined variable', () => {
        const result = validateFormula('UNDEFINED * 0.04', { BASE: 1 })
        expect(result.valid).toBe(false)
        expect(result.error).toContain('UNDEFINED')
    })

    test('should reject syntactically invalid formula', () => {
        const result = validateFormula('BASE * * 0.04', { BASE: 1 })
        expect(result.valid).toBe(false)
    })

    test('should reject empty formula', () => {
        const result = validateFormula('', { BASE: 1 })
        expect(result.valid).toBe(false)
    })
})