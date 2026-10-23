import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const PayrollJournalDraftSchema = new Schema({
    kind: {
        type: String,
        required: true,
        enum: ['NORMAL', 'VACATION', 'UTILITIES', 'SETTLEMENT'],
        default: 'NORMAL'
    },
    entry_date: {
        type: Date,
        required: true
    },
    reference: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        enum: ['DRAFT', 'VALIDATED', 'POSTED', 'REVERSED'],
        default: 'DRAFT'
    },
    total_debit_ves: {
        type: Number,
        default: 0
    },
    total_credit_ves: {
        type: Number,
        default: 0
    },
    total_debit_usd: {
        type: Number,
        default: 0
    },
    total_credit_usd: {
        type: Number,
        default: 0
    },
    issues: {
        type: Schema.Types.Mixed,
        default: []
    },
    warnings: {
        type: Schema.Types.Mixed,
        default: []
    },
    notes: {
        type: String,
        default: ''
    },
    branch: {
        type: Schema.Types.ObjectId,
        ref: 'Branch'
    },
    generated_by: {
        type: Schema.Types.ObjectId,
        ref: 'HumanResources'
    },
    posted_by: {
        type: Schema.Types.ObjectId,
        ref: 'HumanResources'
    },
    posted_at: {
        type: Date,
        default: null
    },
    period: {
        type: Schema.Types.ObjectId,
        ref: 'PayrollPeriod'
    },
    reversal_of: {
        type: Schema.Types.ObjectId,
        ref: 'PayrollJournalDraft',
        default: null
    },
    reversed_at: {
        type: Date,
        default: null
    },
    reversed_by: {
        type: Schema.Types.ObjectId,
        ref: 'HumanResources'
    },
    reversal_reason: {
        type: String,
        default: ''
    },
    organizationID: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    }
}, { timestamps: true })

PayrollJournalDraftSchema.index({ organizationID: 1, period: 1, state: 1 })
PayrollJournalDraftSchema.index({ organizationID: 1, entry_date: 1 })

export const AccountingPayrollJournalDraft = mongoose.model('AccountingPayrollJournalDraft', PayrollJournalDraftSchema)