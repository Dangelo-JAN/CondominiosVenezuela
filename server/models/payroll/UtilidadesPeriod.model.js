import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const UtilidadesPeriodSchema = new Schema({
    year: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['OPEN', 'CALCULATING', 'CALCULATED', 'APPROVED', 'PAID', 'CLOSED'],
        default: 'OPEN'
    },
    net_profit_ves: {
        type: Number,
        default: 0
    },
    distributable_amount_ves: {
        type: Number,
        default: 0
    },
    total_employees_eligible: {
        type: Number,
        default: 0
    },
    total_days_worked: {
        type: Number,
        default: 0
    },
    daily_rate_ves: {
        type: Number,
        default: 0
    },
    calculation_date: {
        type: Date,
        default: null
    },
    approved_by: {
        type: Schema.Types.ObjectId,
        ref: 'HumanResources'
    },
    approved_at: {
        type: Date,
        default: null
    },
    payment_deadline: {
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

UtilidadesPeriodSchema.index({ organizationID: 1, year: 1 }, { unique: true })
UtilidadesPeriodSchema.index({ organizationID: 1, status: 1 })

export const UtilidadesPeriod = mongoose.model('UtilidadesPeriod', UtilidadesPeriodSchema)