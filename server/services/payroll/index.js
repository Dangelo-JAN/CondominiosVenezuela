// ═══════════════════════════════════════════════════════════════════════
// SERVICIOS DE NÓMINA - EXPORTACIONES CENTRALIZADAS
// ═══════════════════════════════════════════════════════════════════════

// Evaluador de fórmulas
export { SafeFormulaEvaluator, safeEval, validateFormula } from './formula-evaluator.js'

// Contexto de evaluación
export { FormulaContext } from './formula-context.js'

// Motor de acumuladores
export { AccumulatorEngine } from './accumulator-engine.js'

// Reglas de conceptos
export { ConceptRulesEngine } from './concept-rules.js'

// Motor principal de nómina
export { PayrollEngine, calculatePayrollPeriod, calculateEmployeeReceipt } from './payroll-engine.js'

// Costos patronales
export { calculateEmployerCosts, calculateEmployerCostsForReceipt } from './employer-costs.js'

// Calculador de vacaciones
export { VacationCalculator, calculateVacationDays, calculateBonoVacacionalDays, calculateVacationSalaryDaily } from './vacation-calculator.js'

// Calculador de prestaciones/liquidaciones
export { SettlementCalculator, calculateSettlement, calculateSeniority, calculatePendingVacations, calculateCestaticketProportional } from './settlement-calculator.js'

// Calculador de utilidades
export { UtilidadesCalculator, calculateUtilidades, distribute15Percent, calculateIslrOnUtilidades } from './utilidades-calculator.js'

// Calculador de ISLR
export { ISLRCalculator, calculateISLRMonthly, calculateAccumulatedISLR, getDefaultISLRTable } from './islr-calculator.js'

// Generador de asientos contables
export { JournalGenerator, generatePayrollJournal, mapConceptToAccount, validateDoubleEntry } from './journal-generator.js'

// Tipos y constantes
export const PAYROLL_CONCEPT_KINDS = ['INCOME', 'DEDUCTION', 'EMPLOYER_COST', 'INFORMATIONAL']
export const COMPUTATION_METHODS = ['FIXED_AMOUNT', 'PERCENTAGE_OF_BASIC', 'DYNAMIC_FORMULA', 'TABLE', 'EXTERNAL_API']
export const ACCUMULATOR_BASES = ['FAOV_BASE', 'IVSS_BASE', 'RPE_BASE', 'PRESTACIONES_BASE', 'ISLR_BASE', 'INCES_BASE']
export const RECEIPT_STATUSES = ['DRAFT', 'CALCULATED', 'APPROVED', 'PAID', 'VOIDED']
export const PERIOD_STATUSES = ['DRAFT', 'CALCULATING', 'CALCULATED', 'APPROVED', 'PAID', 'CLOSED']
export const SETTLEMENT_CAUSES = ['RESIGNATION', 'DISMISSAL', 'EXPIRATION', 'DEATH', 'MUTUAL_AGREEMENT']
export const VACATION_TYPES = ['NORMAL', 'ACUMULADA', 'ANTICIPADA', 'PROPORTIONAL']
export const UTILIDADES_METHODS = ['MIXED_50_50', 'DAYS_ONLY', 'SALARY_ONLY']
export const SALARY_SPLIT_MODES = ['MIXTO', 'BASE_COMPLEMENT', 'TOTAL_BASE']
export const ACCRUAL_MODES = ['ANNUAL', 'MONTHLY', 'DAILY']
export const VACATION_SALARY_BASES = ['LAST_SALARY', 'AVERAGE_3M', 'AVERAGE_6M', 'BEST_YEAR']
export const EXCHANGE_RATE_SOURCES = ['BCV', 'PARALELO', 'MANUAL']
export const CONTRACT_TYPES = ['INDEFINIDO', 'FIJO', 'TEMPORAL', 'APRENDIZ', 'PRACTICANTE']
export const PAYMENT_FREQUENCIES = ['QUINCENAL', 'MENSUAL', 'SEMANAL']
export const BANK_ACCOUNT_TYPES = ['CORRIENTE', 'AHORRO']
export const LOAN_TYPES = ['PERSONAL', 'HIPOTECARIO', 'VEHICULO', 'EDUCATIVO', 'OTRO']
export const ADVANCE_MOTIVES = ['QUINCENA', 'ESPECIAL', 'MEDICO', 'ESTUDIO', 'OTRO']
export const HOLIDAY_TYPES = ['NATIONAL', 'REGIONAL', 'RELIGIOUS', 'COMPANY']