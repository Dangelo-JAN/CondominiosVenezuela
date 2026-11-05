import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const VacationBalanceSchema = new Schema({
    employee: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
        unique: true
    },
    accrued_days: {
        type: Number,
        default: 0
    },
    taken_days: {
        type: Number,
        default: 0
    },
    pending_days: {
        type: Number,
        default: 0
    },
    expired_days: {
        type: Number,
        default: 0
    },
    current_period_start: {
        type: Date,
        required: true
    },
    current_period_end: {
        type: Date,
        required: true
    },
    daily_salary_ves: {
        type: Number,
        default: 0
    },
    related_request: {
        type: Schema.Types.ObjectId,
        ref: 'VacationRequest'
    },
    organizationID: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    }
}, { timestamps: true })

VacationBalanceSchema.index({ organizationID: 1, employee: 1 }, { unique: true })

export const VacationBalance = mongoose.model('VacationBalance', VacationBalanceSchema)