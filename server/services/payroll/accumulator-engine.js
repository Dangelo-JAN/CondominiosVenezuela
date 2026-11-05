import { Decimal } from 'decimal.js'

/**
 * Motor de Acumuladores - AccumulatorEngine
 * Maneja las bases de cálculo para conceptos de nómina
 * Basado en la lógica de Nóminix (payroll_core/services/accumulators.py)
 */
export class AccumulatorEngine {
    static BASES = [
        'FAOV_BASE',
        'IVSS_BASE',
        'RPE_BASE',
        'PRESTACIONES_BASE',
        'ISLR_BASE',
        'INCES_BASE'
    ]

    constructor() {
        this.bases = {}
        this.history = {}
        this.reset()
    }

    reset() {
        for (const base of AccumulatorEngine.BASES) {
            this.bases[base] = new Decimal(0)
            this.history[base] = []
        }
    }

    /**
     * Agrega un monto a una base de cálculo
     * @param {string} baseName - Nombre de la base (FAOV_BASE, IVSS_BASE, etc.)
     * @param {Decimal|number|string} amount - Monto a agregar
     * @param {string} conceptCode - Código del concepto que origina la acumulación
     */
    add(baseName, amount, conceptCode = null) {
        if (!AccumulatorEngine.BASES.includes(baseName)) {
            return
        }

        const decimalAmount = new Decimal(amount)
        this.bases[baseName] = this.bases[baseName].plus(decimalAmount)

        this.history[baseName].push({
            concept: conceptCode,
            amount: decimalAmount,
            runningTotal: this.bases[baseName],
            timestamp: new Date()
        })
    }

    /**
     * Obtiene el valor actual de una base
     */
    get(baseName) {
        return this.bases[baseName] || new Decimal(0)
    }

    /**
     * Obtiene todas las bases como objeto plano con Decimals
     */
    getAll() {
        const result = {}
        for (const base of AccumulatorEngine.BASES) {
            result[base] = this.bases[base]
        }
        return result
    }

    /**
     * Obtiene el historial de una base
     */
    getHistory(baseName) {
        return this.history[baseName] || []
    }

    /**
     * Obtiene todo el historial
     */
    getAllHistory() {
        return { ...this.history }
    }

    /**
     * Setea un valor directamente (para inicialización o ajustes)
     */
    set(baseName, amount) {
        if (!AccumulatorEngine.BASES.includes(baseName)) {
            return
        }
        this.bases[baseName] = new Decimal(amount)
        this.history[baseName] = [{
            concept: 'MANUAL_ADJUSTMENT',
            amount: new Decimal(amount),
            runningTotal: new Decimal(amount),
            timestamp: new Date()
        }]
    }

    /**
     * Verifica si una base existe
     */
    has(baseName) {
        return AccumulatorEngine.BASES.includes(baseName)
    }

    /**
     * Clona el motor (útil para simulación)
     */
    clone() {
        const cloned = new AccumulatorEngine()
        for (const base of AccumulatorEngine.BASES) {
            cloned.bases[base] = this.bases[base]
            cloned.history[base] = [...this.history[base]]
        }
        return cloned
    }

    /**
     * Serializa para almacenamiento/log
     */
    toJSON() {
        const result = {}
        for (const base of AccumulatorEngine.BASES) {
            result[base] = {
                value: this.bases[base].toString(),
                history: this.history[base].map(h => ({
                    concept: h.concept,
                    amount: h.amount.toString(),
                    runningTotal: h.runningTotal.toString(),
                    timestamp: h.timestamp
                }))
            }
        }
        return result
    }

    /**
     * Crea motor desde JSON (para reconstrucción)
     */
    static fromJSON(json) {
        const engine = new AccumulatorEngine()
        for (const base of AccumulatorEngine.BASES) {
            if (json[base]) {
                engine.bases[base] = new Decimal(json[base].value)
                engine.history[base] = (json[base].history || []).map(h => ({
                    concept: h.concept,
                    amount: new Decimal(h.amount),
                    runningTotal: new Decimal(h.runningTotal),
                    timestamp: new Date(h.timestamp)
                }))
            }
        }
        return engine
    }
}

export default AccumulatorEngine