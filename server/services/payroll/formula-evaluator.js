import { Decimal } from 'decimal.js'
import * as acorn from 'acorn'

/**
 * Evaluador Seguro de Fórmulas - AST-based
 * Réplica del SafeFormulaEvaluator de Nóminix
 * Permite evaluar fórmulas matemáticas de forma segura sin eval()
 */
export class SafeFormulaEvaluator {
    static ALLOWED_OPERATORS = {
        Add: (a, b) => a.plus(b),
        Sub: (a, b) => a.minus(b),
        Mult: (a, b) => a.times(b),
        Div: (a, b) => a.div(b),
        Pow: (a, b) => a.pow(b),
        Mod: (a, b) => a.mod(b),
        USub: (a) => a.neg(),
        UAdd: (a) => a
    }

    static ALLOWED_COMPARATORS = {
        Eq: (a, b) => a.eq(b),
        NotEq: (a, b) => a.neq(b),
        Lt: (a, b) => a.lt(b),
        LtE: (a, b) => a.lte(b),
        Gt: (a, b) => a.gt(b),
        Gte: (a, b) => a.gte(b)
    }

    static ALLOWED_FUNCTIONS = {
        min: (...args) => new Decimal(Math.min(...args.map(a => a.toNumber()))),
        max: (...args) => new Decimal(Math.max(...args.map(a => a.toNumber()))),
        abs: (a) => a.abs(),
        round: (a, precision = 0) => {
            const factor = new Decimal(10).pow(precision)
            return a.times(factor).toDecimalPlaces(0).div(factor)
        },
        floor: (a) => new Decimal(Math.floor(a.toNumber())),
        ceil: (a) => new Decimal(Math.ceil(a.toNumber())),
        Decimal: (a) => new Decimal(a),
        // Uppercase aliases for compatibility
        MIN: (...args) => new Decimal(Math.min(...args.map(a => a.toNumber()))),
        MAX: (...args) => new Decimal(Math.max(...args.map(a => a.toNumber()))),
        ABS: (a) => a.abs(),
        ROUND: (a, precision = 0) => {
            const factor = new Decimal(10).pow(precision)
            return a.times(factor).toDecimalPlaces(0).div(factor)
        },
        FLOOR: (a) => new Decimal(Math.floor(a.toNumber())),
        CEIL: (a) => new Decimal(Math.ceil(a.toNumber()))
    }

    constructor(allowedNames = {}) {
        this.allowedNames = allowedNames
    }

    /**
         * Evalúa una fórmula string y retorna Decimal
         */
        evaluate(formula) {
            if (!formula || typeof formula !== 'string') {
                return new Decimal(0)
            }

            try {
                const tree = this.parseFormula(formula)
                // tree.body is an array of statements, we need the first expression
                const body = tree.body[0]
                if (body.type === 'ExpressionStatement') {
                    return this._evalNode(body.expression)
                }
                return this._evalNode(body)
            } catch (error) {
                throw new Error(`Error evaluando fórmula "${formula}": ${error.message}`)
            }
        }

    parseFormula(formula) {
        return acorn.parse(formula, {
            ecmaVersion: 2020,
            sourceType: 'script'
        })
    }

    _evalNode(node) {
        if (!node) {
            return new Decimal(0)
        }

        switch (node.type) {
            case 'Literal':
            case 'Constant':
                return new Decimal(node.value === null ? 0 : node.value)

            case 'Identifier':
                if (node.name in this.allowedNames) {
                    return new Decimal(this.allowedNames[node.name])
                }
                throw new Error(`Variable no permitida: ${node.name}`)

            case 'BinaryExpression':
                return this._evalBinaryExpression(node)

            case 'UnaryExpression':
                return this._evalUnaryExpression(node)

            case 'CallExpression':
                return this._evalCallExpression(node)

            case 'ConditionalExpression':
                return this._evalConditionalExpression(node)

            case 'LogicalExpression':
                return this._evalLogicalExpression(node)

            case 'ComparisonExpression':
                return this._evalComparisonExpression(node)

            case 'MemberExpression':
                return this._evalMemberExpression(node)

            default:
                throw new Error(`Nodo AST no soportado: ${node.type}`)
        }
    }

    _evalBinaryExpression(node) {
        const left = this._evalNode(node.left)
        const right = this._evalNode(node.right)
        const opName = node.operator

        const operatorMap = {
            '+': 'Add',
            '-': 'Sub',
            '*': 'Mult',
            '/': 'Div',
            '%': 'Mod',
            '**': 'Pow'
        }

        const opType = operatorMap[opName]
        if (opType && SafeFormulaEvaluator.ALLOWED_OPERATORS[opType]) {
            return SafeFormulaEvaluator.ALLOWED_OPERATORS[opType](left, right)
        }

        throw new Error(`Operador binario no permitido: ${opName}`)
    }

    _evalUnaryExpression(node) {
        const operand = this._evalNode(node.argument)
        const opName = node.operator

        const operatorMap = {
            '-': 'USub',
            '+': 'UAdd'
        }

        const opType = operatorMap[opName]
        if (opType && SafeFormulaEvaluator.ALLOWED_OPERATORS[opType]) {
            return SafeFormulaEvaluator.ALLOWED_OPERATORS[opType](operand)
        }

        throw new Error(`Operador unario no permitido: ${opName}`)
    }

    _evalCallExpression(node) {
        if (node.callee.type !== 'Identifier') {
            throw new Error('Solo se permiten llamadas a funciones directas')
        }

        const funcName = node.callee.name
        if (!(funcName in SafeFormulaEvaluator.ALLOWED_FUNCTIONS)) {
            throw new Error(`Función no permitida: ${funcName}`)
        }

        const args = node.arguments.map(arg => this._evalNode(arg))
        return SafeFormulaEvaluator.ALLOWED_FUNCTIONS[funcName](...args)
    }

    _evalConditionalExpression(node) {
        const test = this._evalNode(node.test)
        const isTruthy = !test.isZero()
        return this._evalNode(isTruthy ? node.consequent : node.alternate)
    }

    _evalLogicalExpression(node) {
        const left = this._evalNode(node.left)
        const operator = node.operator

        if (operator === '&&') {
            return left.isZero() ? new Decimal(0) : this._evalNode(node.right)
        }
        if (operator === '||') {
            return left.isZero() ? this._evalNode(node.right) : new Decimal(1)
        }

        throw new Error(`Operador lógico no permitido: ${operator}`)
    }

    _evalComparisonExpression(node) {
        const left = this._evalNode(node.left)
        const right = this._evalNode(node.right)
        const opName = node.operator

        const comparatorMap = {
            '===': 'Eq',
            '==': 'Eq',
            '!==': 'NotEq',
            '!=': 'NotEq',
            '<': 'Lt',
            '<=': 'LtE',
            '>': 'Gt',
            '>=': 'Gte'
        }

        const compType = comparatorMap[opName]
        if (compType && SafeFormulaEvaluator.ALLOWED_COMPARATORS[compType]) {
            return SafeFormulaEvaluator.ALLOWED_COMPARATORS[compType](left, right) ? new Decimal(1) : new Decimal(0)
        }

        throw new Error(`Comparador no permitido: ${opName}`)
    }

    _evalMemberExpression(node) {
        if (node.object.type === 'Identifier' && node.object.name === 'Math') {
            if (node.property.type === 'Identifier') {
                const prop = node.property.name
                const mathConstants = {
                    PI: Math.PI,
                    E: Math.E,
                    LN2: Math.LN2,
                    LN10: Math.LN10,
                    LOG2E: Math.LOG2E,
                    LOG10E: Math.LOG10E,
                    SQRT1_2: Math.SQRT1_2,
                    SQRT2: Math.SQRT2
                }
                if (prop in mathConstants) {
                    return new Decimal(mathConstants[prop])
                }
            }
        }
        throw new Error('Acceso a propiedades no permitido')
    }
}

/**
 * Función helper para evaluación directa
 */
export function safeEval(formula, allowedNames = {}) {
    const evaluator = new SafeFormulaEvaluator(allowedNames)
    return evaluator.evaluate(formula)
}

/**
 * Valida una fórmula sin evaluarla (para validación en modelo)
 */
export function validateFormula(formula, allowedNames = {}) {
    if (!formula || typeof formula !== 'string' || formula.trim() === '') {
        return { valid: false, error: 'Fórmula vacía' }
    }
    try {
        const evaluator = new SafeFormulaEvaluator(allowedNames)
        const testValues = {}
        for (const key of Object.keys(allowedNames)) {
            testValues[key] = 1
        }
        evaluator.allowedNames = testValues
        evaluator.evaluate(formula)
        return { valid: true, error: null }
    } catch (error) {
        return { valid: false, error: error.message }
    }
}

export default {
    SafeFormulaEvaluator,
    safeEval,
    validateFormula
}