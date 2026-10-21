import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const ISLRRetentionSchema = new Schema({
    employee: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    taxable_income_ves: {
        type: Number,
        default: 0
    },
    retention_amount_ves: {
        type: Number,
        default: 0
    },
    accumulated_income_ves: {
        type: Number,
        default: 0
    },
    accumulated_retention_ves: {
        type: Number,
        default: 0
    },
    rate_applied: {
        type: Number,
        default: 0
    },
    ut_value_used: {
        type: Number,
        default: 9
    },
    organizationID: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    }
}, { timestamps: true })

ISLRRetentionSchema.index({ organizationID: 1, employee: 1, year: 1, month: 1 }, { unique: true })
ISLRRetentionSchema.index({ organizationID: 1, year: 1, month: 1 })

export const ISLRRetention = mongoose.model('ISLRRetention', ISLRRetentionSchema)