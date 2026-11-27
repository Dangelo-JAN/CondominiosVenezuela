import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const SocialBenefitsSettlementSchema = new Schema({
    contract: {
        type: Schema.Types.ObjectId,
        ref: 'LaborContract',
        required: true
    },
    settlement_date: {
        type: Date,
        required: true
    },
    cause: {
        type: String,
        required: true,
        enum: ['RESIGNATION', 'DISMISSAL', 'EXPIRATION', 'DEATH', 'MUTUAL_AGREEMENT'],
        default: 'RESIGNATION'
    },
    daily_salary_ves: {
        type: Number,
        required: true
    },
    accrued_days: {
        type: Number,
        default: 0
    },
    pending_days: {
        type: Number,
        default: 0
    },
    seniority_amount: {
        type: Number,
        default: 0
    },
    vacation_amount: {
        type: Number,
        default: 0
    },
    bonus_amount: {
        type: Number,
        default: 0
    },
    cestaticket_amount: {
        type: Number,
        default: 0
    },
    utilities_amount: {
        type: Number,
        default: 0
    },
    other_amount: {
        type: Number,
        default: 0
    },
    total_ves: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        required: true,
        enum: ['DRAFT', 'CALCULATED', 'APPROVED', 'PAID', 'VOIDED'],
        default: 'DRAFT'
    },
    approved_by: {
        type: Schema.Types.ObjectId,
        ref: 'HumanResources'
    },
    approved_at: {
        type: Date,
        default: null
    },
    paid_at: {
        type: Date,
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

SocialBenefitsSettlementSchema.index({ organizationID: 1, contract: 1, status: 1 })
SocialBenefitsSettlementSchema.index({ organizationID: 1, settlement_date: 1 })

export const SocialBenefitsSettlement = mongoose.model('SocialBenefitsSettlement', SocialBenefitsSettlementSchema)