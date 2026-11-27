import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const SocialBenefitsLedgerSchema = new Schema({
    employee: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    contract: {
        type: Schema.Types.ObjectId,
        ref: 'LaborContract',
        required: true
    },
    entry_type: {
        type: String,
        required: true,
        enum: ['ACCRUAL', 'PAYMENT', 'ADJUSTMENT', 'REVERSAL', 'SETTLEMENT'],
        default: 'ACCRUAL'
    },
    amount_ves: {
        type: Number,
        default: 0
    },
    days_accrued: {
        type: Number,
        default: 0
    },
    daily_salary_ves: {
        type: Number,
        default: 0
    },
    period_start: {
        type: Date,
        required: true
    },
    period_end: {
        type: Date,
        required: true
    },
    reversed_entry: {
        type: Schema.Types.ObjectId,
        ref: 'SocialBenefitsLedger',
        default: null
    },
    notes: {
        type: String,
        default: ''
    },
    organizationID: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    }
}, { timestamps: true })

SocialBenefitsLedgerSchema.index({ organizationID: 1, employee: 1, contract: 1, entry_type: 1 })
SocialBenefitsLedgerSchema.index({ organizationID: 1, period_start: 1, period_end: 1 })

export const SocialBenefitsLedger = mongoose.model('SocialBenefitsLedger', SocialBenefitsLedgerSchema)