import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const PayrollPeriodSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: true
    },
    payment_date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['DRAFT', 'CALCULATING', 'CALCULATED', 'APPROVED', 'PAID', 'CLOSED'],
        default: 'DRAFT'
    },
    period_type: {
        type: String,
        required: true,
        enum: ['NORMAL', 'VACATION', 'UTILITIES', 'SETTLEMENT', 'ADJUSTMENT'],
        default: 'NORMAL'
    },
    period_frequency: {
        type: String,
        required: true,
        enum: ['QUINCENAL', 'MENSUAL', 'SEMANAL'],
        default: 'QUINCENAL'
    },
    days_count: {
        type: Number,
        required: true,
        default: 15
    },
    pinned_rate: {
        type: Number,
        default: null
    },
    pinned_rate_note: {
        type: String,
        default: ''
    },
    exchange_rate_snapshot: {
        type: Number,
        default: null
    },
    import_batch_id: {
        type: Schema.Types.ObjectId,
        ref: 'PayrollImportBatch'
    },
    organizationID: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    }
}, { timestamps: true })

PayrollPeriodSchema.index({ organizationID: 1, start_date: 1, end_date: 1 })
PayrollPeriodSchema.index({ organizationID: 1, status: 1 })

export const PayrollPeriod = mongoose.model('PayrollPeriod', PayrollPeriodSchema)