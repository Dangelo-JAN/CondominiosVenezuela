import { AccumulatorEngine } from '../../services/payroll/accumulator-engine.js'
import { Decimal } from 'decimal.js'

describe('AccumulatorEngine', () => {
    let engine

    beforeEach(() => {
        engine = new AccumulatorEngine()
    })

    describe('reset', () => {
        test('should initialize all 6 accumulators to zero', () => {
            engine.reset()
            const acc = engine.getAll()

            expect(acc.FAOV_BASE).toBeDefined()
            expect(acc.IVSS_BASE).toBeDefined()
            expect(acc.RPE_BASE).toBeDefined()
            expect(acc.PRESTACIONES_BASE).toBeDefined()
            expect(acc.ISLR_BASE).toBeDefined()
            expect(acc.INCES_BASE).toBeDefined()

            expect(acc.FAOV_BASE.toNumber()).toBe(0)
            expect(acc.IVSS_BASE.toNumber()).toBe(0)
            expect(acc.RPE_BASE.toNumber()).toBe(0)
            expect(acc.PRESTACIONES_BASE.toNumber()).toBe(0)
            expect(acc.ISLR_BASE.toNumber()).toBe(0)
            expect(acc.INCES_BASE.toNumber()).toBe(0)
        })
    })

    describe('add', () => {
        test('should add amount to specific accumulator', () => {
            engine.reset()
            engine.add('IVSS_BASE', 100)
            engine.add('IVSS_BASE', 50)

            expect(engine.get('IVSS_BASE').toNumber()).toBe(150)
        })

        test('should not affect other accumulators', () => {
            engine.reset()
            engine.add('IVSS_BASE', 100)
            engine.add('FAOV_BASE', 50)

            expect(engine.get('IVSS_BASE').toNumber()).toBe(100)
            expect(engine.get('FAOV_BASE').toNumber()).toBe(50)
        })
    })

    describe('calculateBases from receipt lines', () => {
        test('should calculate IVSS_BASE with overtime included', () => {
            engine.reset()

            const receipt = {
                lines: [
                    { concept_code: 'BASE', total_ves: 1000, concept: { incidences: ['IVSS'] } },
                    { concept_code: 'HE_DIURNA', total_ves: 200, concept: { incidences: ['IVSS'] } },
                    { concept_code: 'BONO_PRODUCCION', total_ves: 300, concept: { incidences: ['IVSS'] } },
                    { concept_code: 'BONO_TRANSPORTE', total_ves: 100, concept: { incidences: [] } }
                ]
            }

            for (const line of receipt.lines) {
                if (line.concept.incidences.includes('IVSS')) {
                    engine.add('IVSS_BASE', line.total_ves, line.concept_code)
                }
                if (line.concept.incidences.includes('FAOV')) {
                    engine.add('FAOV_BASE', line.total_ves, line.concept_code)
                }
            }

            expect(engine.get('IVSS_BASE').toNumber()).toBe(1500)
        })

        test('should calculate FAOV_BASE (salario normal only)', () => {
            engine.reset()

            const receipt = {
                lines: [
                    { concept_code: 'BASE', total_ves: 1000, concept: { incidences: ['FAOV'] } },
                    { concept_code: 'COMPLEMENT', total_ves: 500, concept: { incidences: ['FAOV'] } },
                    { concept_code: 'HE_DIURNA', total_ves: 200, concept: { incidences: [] } }
                ]
            }

            for (const line of receipt.lines) {
                if (line.concept.incidences.includes('FAOV')) {
                    engine.add('FAOV_BASE', line.total_ves, line.concept_code)
                }
            }

            expect(engine.get('FAOV_BASE').toNumber()).toBe(1500)
        })

        test('should calculate RPE_BASE', () => {
            engine.reset()

            const receipt = {
                lines: [
                    { concept_code: 'BASE', total_ves: 1000, concept: { incidences: ['RPE'] } },
                    { concept_code: 'COMPLEMENT', total_ves: 500, concept: { incidences: ['RPE'] } }
                ]
            }

            for (const line of receipt.lines) {
                if (line.concept.incidences.includes('RPE')) {
                    engine.add('RPE_BASE', line.total_ves, line.concept_code)
                }
            }

            expect(engine.get('RPE_BASE').toNumber()).toBe(1500)
        })

        test('should calculate PRESTACIONES_BASE with cestaticket', () => {
            engine.reset()

            const receipt = {
                lines: [
                    { concept_code: 'BASE', total_ves: 1000, concept: { incidences: ['PRESTACIONES'] } },
                    { concept_code: 'COMPLEMENT', total_ves: 500, concept: { incidences: ['PRESTACIONES'] } },
                    { concept_code: 'BONO_ALIMENTACION', total_ves: 360, concept: { incidences: ['PRESTACIONES'] } }
                ]
            }

            for (const line of receipt.lines) {
                if (line.concept.incidences.includes('PRESTACIONES')) {
                    engine.add('PRESTACIONES_BASE', line.total_ves, line.concept_code)
                }
            }

            expect(engine.get('PRESTACIONES_BASE').toNumber()).toBe(1860)
        })

        test('should calculate ISLR_BASE (gravable only)', () => {
            engine.reset()

            const receipt = {
                lines: [
                    { concept_code: 'BASE', total_ves: 1000, concept: { incidences: ['ISLR'] } },
                    { concept_code: 'COMPLEMENT', total_ves: 500, concept: { incidences: ['ISLR'] } },
                    { concept_code: 'BONO_ALIMENTACION', total_ves: 360, concept: { incidences: [] } },
                    { concept_code: 'BONO_TRANSPORTE', total_ves: 100, concept: { incidences: [] } }
                ]
            }

            for (const line of receipt.lines) {
                if (line.concept.incidences.includes('ISLR')) {
                    engine.add('ISLR_BASE', line.total_ves, line.concept_code)
                }
            }

            expect(engine.get('ISLR_BASE').toNumber()).toBe(1500)
        })

        test('should calculate INCES_BASE', () => {
            engine.reset()

            const receipt = {
                lines: [
                    { concept_code: 'BASE', total_ves: 1000, concept: { incidences: ['INCES'] } },
                    { concept_code: 'COMPLEMENT', total_ves: 500, concept: { incidences: ['INCES'] } }
                ]
            }

            for (const line of receipt.lines) {
                if (line.concept.incidences.includes('INCES')) {
                    engine.add('INCES_BASE', line.total_ves, line.concept_code)
                }
            }

            expect(engine.get('INCES_BASE').toNumber()).toBe(1500)
        })
    })

    describe('applyCap (manual)', () => {
        test('should apply SMVM multiplier cap manually', () => {
            engine.reset()
            engine.add('IVSS_BASE', 10000)

            const cap = 5 * 130 // 5 * SMVM
            const current = engine.get('IVSS_BASE')
            const capped = Decimal.min(current, cap)

            expect(capped.toNumber()).toBe(650)
        })

        test('should not cap if below limit', () => {
            engine.reset()
            engine.add('IVSS_BASE', 500)

            const cap = 5 * 130
            const current = engine.get('IVSS_BASE')
            const capped = Decimal.min(current, cap)

            expect(capped.toNumber()).toBe(500)
        })
    })

    describe('getAll', () => {
        test('should return all accumulator values', () => {
            engine.reset()
            engine.add('IVSS_BASE', 100)
            engine.add('FAOV_BASE', 200)

            const bases = engine.getAll()

            expect(bases.IVSS_BASE.toNumber()).toBe(100)
            expect(bases.FAOV_BASE.toNumber()).toBe(200)
            expect(bases.RPE_BASE.toNumber()).toBe(0)
        })
    })

    describe('history', () => {
        test('should track history of additions', () => {
            engine.reset()
            engine.add('IVSS_BASE', 100, 'BASE')
            engine.add('IVSS_BASE', 50, 'HE_DIURNA')

            const history = engine.getHistory('IVSS_BASE')

            expect(history.length).toBe(2)
            expect(history[0].concept).toBe('BASE')
            expect(history[0].amount.toNumber()).toBe(100)
            expect(history[1].concept).toBe('HE_DIURNA')
            expect(history[1].amount.toNumber()).toBe(50)
        })
    })

    describe('clone', () => {
        test('should create independent clone', () => {
            engine.reset()
            engine.add('IVSS_BASE', 100)

            const cloned = engine.clone()
            cloned.add('IVSS_BASE', 200)

            expect(engine.get('IVSS_BASE').toNumber()).toBe(100)
            expect(cloned.get('IVSS_BASE').toNumber()).toBe(300)
        })
    })

    describe('toJSON/fromJSON', () => {
        test('should serialize and deserialize correctly', () => {
            engine.reset()
            engine.add('IVSS_BASE', 100, 'BASE')
            engine.add('FAOV_BASE', 50, 'COMPLEMENT')

            const json = engine.toJSON()
            const restored = AccumulatorEngine.fromJSON(json)

            expect(restored.get('IVSS_BASE').toNumber()).toBe(100)
            expect(restored.get('FAOV_BASE').toNumber()).toBe(50)
            expect(restored.getHistory('IVSS_BASE').length).toBe(1)
        })
    })
})