import { Decimal } from 'decimal.js'
import { PayrollReceipt } from '../../models/payroll/PayrollReceipt.model.js'
import { PayrollReceiptLine } from '../../models/payroll/PayrollReceiptLine.model.js'
import { PayrollEmployerCost } from '../../models/payroll/PayrollEmployerCost.model.js'
import { AccountingAccountSubcategory } from '../../models/accounting/AccountSubcategory.model.js'
import { AccountingReportMapping } from '../../models/accounting/ReportMapping.model.js'
import { AccountingPayrollJournalDraft } from '../../models/accounting/PayrollJournalDraft.model.js'
import { AccountingPayrollJournalDraftLine } from '../../models/accounting/PayrollJournalDraftLine.model.js'

/**
 * Generador de Asientos Contables de Nómina - JournalGenerator
 * Genera partidas dobles (débito/crédito) para nómina
 * Basado en la lógica de Nóminix (payroll_core/services/journal_generator.py)
 */

export class JournalGenerator {
    constructor(organizationID) {
        this.organizationID = organizationID
        this.accountMappings = new Map()
    }

    /**
     * Inicializa cargando mapeos de cuentas contables
     */
    async initialize() {
        const mappings = await AccountingReportMapping.find({
            organizationID: this.organizationID,
            is_active: true
        }).lean()

        for (const m of mappings) {
            this.accountMappings.set(m.concept_code, {
                debitAccount: m.debit_account_subcategory,
                creditAccount: m.credit_account_subcategory,
                accountRole: m.account_role // EXPENSE, LIABILITY, EMPLOYER_EXPENSE
            })
        }

        return this
    }

    /**
     * Genera borrador de asiento contable para nómina
     * @param {Object} period - PayrollPeriod
     * @param {Array} receipts - Array de PayrollReceipt
     * @returns {Promise<Object>} { draft, lines }
     */
    async generatePayrollJournalDraft(period, receipts) {
        const lines = []
        let totalDebit = new Decimal(0)
        let totalCredit = new Decimal(0)

        // ═══════════════════════════════════════════════════════════════════════
        // 1. LÍNEAS DE INGRESOS (DÉBITO: Gasto nómina / CRÉDITO: Por pagar empleados)
        // ═══════════════════════════════════════════════════════════════════════
        for (const receipt of receipts) {
            const receiptLines = await PayrollReceiptLine.find({
                receipt: receipt._id,
                kind: 'INCOME'
            }).lean()

            for (const line of receiptLines) {
                const mapping = this._getAccountMapping(line.concept_code, 'INCOME')
                const amount = new Decimal(line.amount_ves)

                // DÉBITO: Cuenta de gasto (6xxx)
                lines.push({
                    account_subcategory: mapping.debitAccount,
                    concept_code: line.concept_code,
                    concept_name: line.concept_name,
                    account_role: 'EXPENSE',
                    debit_ves: amount.toNumber(),
                    credit_ves: 0,
                    employee: receipt.employee,
                    branch: receipt.branch,
                    description: `${line.concept_name} - ${receipt.employee?.firstname} ${receipt.employee?.lastname}`
                })
                totalDebit = totalDebit.plus(amount)

                // CRÉDITO: Cuenta por pagar a empleado (2xxx)
                lines.push({
                    account_subcategory: mapping.creditAccount,
                    concept_code: line.concept_code,
                    concept_name: line.concept_name,
                    account_role: 'LIABILITY',
                    debit_ves: 0,
                    credit_ves: amount.toNumber(),
                    employee: receipt.employee,
                    branch: receipt.branch,
                    description: `Por pagar ${line.concept_name} - ${receipt.employee?.firstname} ${receipt.employee?.lastname}`
                })
                totalCredit = totalCredit.plus(amount)
            }
        }

        // ═══════════════════════════════════════════════════════════════════════
        // 2. LÍNEAS DE DEDUCCIONES (DÉBITO: Por pagar empleados / CRÉDITO: Retenciones)
        // ═══════════════════════════════════════════════════════════════════════
        for (const receipt of receipts) {
            const deductionLines = await PayrollReceiptLine.find({
                receipt: receipt._id,
                kind: 'DEDUCTION'
            }).lean()

            for (const line of deductionLines) {
                const mapping = this._getAccountMapping(line.concept_code, 'DEDUCTION')
                const amount = new Decimal(line.amount_ves)

                // DÉBITO: Cuenta por pagar a empleado (2xxx) - reduce lo que se le debe
                lines.push({
                    account_subcategory: mapping.debitAccount,
                    concept_code: line.concept_code,
                    concept_name: line.concept_name,
                    account_role: 'LIABILITY',
                    debit_ves: amount.toNumber(),
                    credit_ves: 0,
                    employee: receipt.employee,
                    branch: receipt.branch,
                    description: `Deducción ${line.concept_name} - ${receipt.employee?.firstname} ${receipt.employee?.lastname}`
                })
                totalDebit = totalDebit.plus(amount)

                // CRÉDITO: Cuenta de retención/por pagar ente (4xxx/2xxx)
                lines.push({
                    account_subcategory: mapping.creditAccount,
                    concept_code: line.concept_code,
                    concept_name: line.concept_name,
                    account_role: 'LIABILITY',
                    debit_ves: 0,
                    credit_ves: amount.toNumber(),
                    employee: receipt.employee,
                    branch: receipt.branch,
                    description: `Retención ${line.concept_name} - ${receipt.employee?.firstname} ${receipt.employee?.lastname}`
                })
                totalCredit = totalCredit.plus(amount)
            }
        }

        // ═══════════════════════════════════════════════════════════════════════
        // 3. COSTOS PATRONALES (DÉBITO: Gasto patronal / CRÉDITO: Por pagar entes)
        // ═══════════════════════════════════════════════════════════════════════
        for (const receipt of receipts) {
            const employerCosts = await PayrollEmployerCost.find({
                receipt: receipt._id
            }).lean()

            for (const cost of employerCosts) {
                const mapping = this._getAccountMapping(cost.concept_code, 'EMPLOYER_COST')
                const amount = new Decimal(cost.amount_ves)

                // DÉBITO: Cuenta de gasto patronal (6xxx)
                lines.push({
                    account_subcategory: mapping.debitAccount,
                    concept_code: cost.concept_code,
                    concept_name: cost.concept_name,
                    account_role: 'EMPLOYER_EXPENSE',
                    debit_ves: amount.toNumber(),
                    credit_ves: 0,
                    employee: receipt.employee,
                    branch: receipt.branch,
                    description: `Costo patronal ${cost.concept_name} - ${receipt.employee?.firstname} ${receipt.employee?.lastname}`
                })
                totalDebit = totalDebit.plus(amount)

                // CRÉDITO: Cuenta por pagar a ente (2xxx - IVSS, FAOV, etc.)
                lines.push({
                    account_subcategory: mapping.creditAccount,
                    concept_code: cost.concept_code,
                    concept_name: cost.concept_name,
                    account_role: 'LIABILITY',
                    debit_ves: 0,
                    credit_ves: amount.toNumber(),
                    employee: receipt.employee,
                    branch: receipt.branch,
                    description: `Por pagar ${cost.concept_name} patronal - ${receipt.employee?.firstname} ${receipt.employee?.lastname}`
                })
                totalCredit = totalCredit.plus(amount)
            }
        }

        // ═══════════════════════════════════════════════════════════════════════
        // CREAR BORRADOR
        // ═══════════════════════════════════════════════════════════════════════
        const draft = await AccountingPayrollJournalDraft.create({
            kind: period.period_type || 'NORMAL',
            entry_date: period.payment_date,
            reference: `NOM-${period.name}`,
            state: 'DRAFT',
            total_debit_ves: totalDebit.toNumber(),
            total_credit_ves: totalCredit.toNumber(),
            total_debit_usd: totalDebit.div(period.pinned_rate || period.exchange_rate_snapshot || 1).toNumber(),
            total_credit_usd: totalCredit.div(period.pinned_rate || period.exchange_rate_snapshot || 1).toNumber(),
            branch_id: period.branch_id,
            generated_by: null, // Se llena al aprobar
            period: period._id,
            organizationID: this.organizationID
        })

        // Crear líneas del borrador
        const draftLines = lines.map((line, index) => ({
            draft: draft._id,
            line_number: index + 1,
            account_subcategory: line.account_subcategory,
            concept_code: line.concept_code,
            concept_name: line.concept_name,
            account_role: line.account_role,
            debit_ves: line.debit_ves,
            credit_ves: line.credit_ves,
            debit_usd: line.debit_ves / (period.pinned_rate || period.exchange_rate_snapshot || 1),
            credit_usd: line.credit_ves / (period.pinned_rate || period.exchange_rate_snapshot || 1),
            employee: line.employee,
            branch: line.branch,
            description: line.description,
            organizationID: this.organizationID
        }))

        await AccountingPayrollJournalDraftLine.insertMany(draftLines)

        return { draft, lines: draftLines }
    }

    /**
     * Obtiene mapeo de cuenta para un concepto
     */
    _getAccountMapping(conceptCode, kind) {
        const key = `${conceptCode}_${kind}`
        const mapping = this.accountMappings.get(key)

        if (mapping) {
            return mapping
        }

        // Mapeo por defecto según tipo
        const defaultMappings = {
            // Ingresos
            'SUELDO_BASE_INCOME': { debitAccount: '6111', creditAccount: '2111' },
            'COMPLEMENTO_INCOME': { debitAccount: '6112', creditAccount: '2111' },
            'CESTATICKET_INCOME': { debitAccount: '6113', creditAccount: '2111' },
            'H_EXTRA_DIURNA_INCOME': { debitAccount: '6121', creditAccount: '2111' },
            'H_EXTRA_NOCTURNA_INCOME': { debitAccount: '6122', creditAccount: '2111' },
            'BONO_NOCTURNO_INCOME': { debitAccount: '6123', creditAccount: '2111' },
            'DIAS_FERIADO_INCOME': { debitAccount: '6124', creditAccount: '2111' },
            'DOMINGO_TRABAJADO_INCOME': { debitAccount: '6125', creditAccount: '2111' },
            'DIAS_DESCANSO_INCOME': { debitAccount: '6126', creditAccount: '2111' },
            'REPOSO_33_INCOME': { debitAccount: '6131', creditAccount: '2111' },
            'REP_FULL_INCOME': { debitAccount: '6132', creditAccount: '2111' },

            // Deducciones
            'IVSS_DEDUCTION': { debitAccount: '2111', creditAccount: '4111' },
            'FAOV_DEDUCTION': { debitAccount: '2111', creditAccount: '4112' },
            'RPE_DEDUCTION': { debitAccount: '2111', creditAccount: '4113' },
            'ISLR_DEDUCTION': { debitAccount: '2111', creditAccount: '4114' },
            'DESC_FALTA_DEDUCTION': { debitAccount: '2111', creditAccount: '4115' },
            'ANTICIPO_VAC_DEDUCTION': { debitAccount: '2111', creditAccount: '4116' },
            'PRESTAMO_DEDUCTION': { debitAccount: '2111', creditAccount: '4117' },

            // Costos Patronales
            'IVSS_PATRONAL_EMPLOYER_COST': { debitAccount: '6211', creditAccount: '2211' },
            'FAOV_PATRONAL_EMPLOYER_COST': { debitAccount: '6212', creditAccount: '2212' },
            'RPE_PATRONAL_EMPLOYER_COST': { debitAccount: '6213', creditAccount: '2213' },
            'INCES_PATRONAL_EMPLOYER_COST': { debitAccount: '6214', creditAccount: '2214' },
            'LPPSS_PATRONAL_EMPLOYER_COST': { debitAccount: '6215', creditAccount: '2215' },
            'BANVIH_PATRONAL_EMPLOYER_COST': { debitAccount: '6216', creditAccount: '2216' }
        }

        return defaultMappings[key] || {
            debitAccount: kind === 'INCOME' ? '6199' : kind === 'DEDUCTION' ? '2111' : '6299',
            creditAccount: kind === 'INCOME' ? '2111' : '4199'
        }
    }

    /**
     * Valida partida doble
     */
    validateDoubleEntry(draft) {
        const diff = new Decimal(draft.total_debit_ves).minus(draft.total_credit_ves)
        return {
            valid: diff.abs().lte(0.01), // Tolerancia 1 centavo
            difference: diff.toNumber(),
            totalDebit: draft.total_debit_ves,
            totalCredit: draft.total_credit_ves
        }
    }

    /**
     * Publica el asiento (cambia estado a POSTED)
     */
    async postJournalDraft(draftId, postedBy) {
        const draft = await AccountingPayrollJournalDraft.findByIdAndUpdate(
            draftId,
            {
                state: 'POSTED',
                posted_at: new Date(),
                posted_by: postedBy
            },
            { new: true }
        )

        // Aquí se crearían los AccountingTransaction reales
        // Por ahora solo cambiamos estado

        return draft
    }

    /**
     * Anula un asiento (crea asiento reverso)
     */
    async reverseJournalDraft(draftId, reversedBy, reason) {
        const draft = await AccountingPayrollJournalDraft.findById(draftId)
        if (!draft) throw new Error('Borrador no encontrado')

        // Crear asiento reverso
        const reversedDraft = await AccountingPayrollJournalDraft.create({
            kind: draft.kind,
            entry_date: new Date(),
            reference: `REV-${draft.reference}`,
            state: 'POSTED',
            total_debit_ves: draft.total_credit_ves, // Se invierten
            total_credit_ves: draft.total_debit_ves,
            total_debit_usd: draft.total_credit_usd,
            total_credit_usd: draft.total_debit_usd,
            branch_id: draft.branch_id,
            generated_by: reversedBy,
            period: draft.period,
            reversal_of: draft._id,
            reversal_reason: reason,
            organizationID: this.organizationID
        })

        // Crear líneas invertidas
        const originalLines = await AccountingPayrollJournalDraftLine.find({ draft: draftId }).lean()

        const reversedLines = originalLines.map((line, index) => ({
            draft: reversedDraft._id,
            line_number: index + 1,
            account_subcategory: line.account_subcategory,
            concept_code: line.concept_code,
            concept_name: line.concept_name,
            account_role: line.account_role,
            debit_ves: line.credit_ves, // Invertido
            credit_ves: line.debit_ves, // Invertido
            debit_usd: line.credit_usd,
            credit_usd: line.debit_usd,
            employee: line.employee,
            branch: line.branch,
            description: `REVERSO: ${line.description}`,
            organizationID: this.organizationID
        }))

        await AccountingPayrollJournalDraftLine.insertMany(reversedLines)

        // Marcar original como reversado
        draft.state = 'REVERSED'
        draft.reversed_at = new Date()
        draft.reversed_by = reversedBy
        await draft.save()

        return reversedDraft
    }
}

/**
 * Genera asiento contable de nómina (función helper)
 */
export async function generatePayrollJournal(organizationID, period, receipts) {
    const generator = new JournalGenerator(organizationID)
    await generator.initialize()
    return generator.generatePayrollJournalDraft(period, receipts)
}

/**
 * Mapea concepto a cuenta contable (función helper)
 */
export function mapConceptToAccount(conceptCode, kind, customMappings = {}) {
    const key = `${conceptCode}_${kind}`
    return customMappings[key] || {
        debitAccount: kind === 'INCOME' ? '6199' : kind === 'DEDUCTION' ? '2111' : '6299',
        creditAccount: kind === 'INCOME' ? '2111' : '4199'
    }
}

/**
 * Valida partida doble (función helper)
 */
export function validateDoubleEntry(draft) {
    const diff = new Decimal(draft.total_debit_ves).minus(draft.total_credit_ves)
    return {
        valid: diff.abs().lte(0.01),
        difference: diff.toNumber(),
        totalDebit: draft.total_debit_ves,
        totalCredit: draft.total_credit_ves
    }
}

export default JournalGenerator