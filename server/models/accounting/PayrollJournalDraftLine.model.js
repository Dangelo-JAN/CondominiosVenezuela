import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const PayrollJournalDraftLineSchema = new Schema({
    draft: {
        type: Schema.Types.ObjectId,
        ref: 'AccountingPayrollJournalDraft',
        required: true
    },
    line_number: {
        type: Number,
        required: true
    },
    account_subcategory: {
        type: Schema.Types.ObjectId,
        ref: 'AccountingAccountSubcategory',
        required: true
    },
    concept_code: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    concept_name: {
        type: String,
        required: true,
        trim: true
    },
    account_role: {
        type: String,
        required: true,
        enum: ['EXPENSE', 'LIABILITY', 'EMPLOYER_EXPENSE'],
        default: 'EXPENSE'
    },
    debit_ves: {
        type: Number,
        default: 0
    },
    credit_ves: {
        type: Number,
        default: 0
    },
    debit_usd: {
        type: Number,
        default: 0
    },
    credit_usd: {
        type: Number,
        default: 0
    },
    employee: {
        type: Schema.Types.ObjectId,
        ref: 'Employee'
    },
    branch: {
        type: Schema.Types.ObjectId,
        ref: 'Branch'
    },
    description: {
        type: String,
        default: ''
    },
    organizationID: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    }
}, { timestamps: true })

PayrollJournalDraftLineSchema.index({ organizationID: 1, draft: 1, line_number: 1 })

export const AccountingPayrollJournalDraftLine = mongoose.model('AccountingPayrollJournalDraftLine', PayrollJournalDraftLineSchema)