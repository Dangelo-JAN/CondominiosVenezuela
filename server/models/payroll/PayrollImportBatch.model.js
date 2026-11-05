import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const PayrollImportBatchSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    file_name: {
        type: String,
        required: true
    },
    file_size: {
        type: Number,
        default: 0
    },
    period: {
        type: Schema.Types.ObjectId,
        ref: 'PayrollPeriod'
    },
    status: {
        type: String,
        required: true,
        enum: ['UPLOADED', 'VALIDATING', 'VALIDATED', 'IMPORTING', 'COMPLETED', 'FAILED', 'ROLLED_BACK'],
        default: 'UPLOADED'
    },
    total_rows: {
        type: Number,
        default: 0
    },
    successful_rows: {
        type: Number,
        default: 0
    },
    failed_rows: {
        type: Number,
        default: 0
    },
    errors: {
        type: [Schema.Types.Mixed],
        default: []
    },
    imported_by: {
        type: Schema.Types.ObjectId,
        ref: 'HumanResources'
    },
    imported_at: {
        type: Date,
        default: null
    },
    rollback_batch_id: {
        type: Schema.Types.ObjectId,
        ref: 'PayrollImportBatch',
        default: null
    },
    organizationID: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    }
}, { timestamps: true })

PayrollImportBatchSchema.index({ organizationID: 1, period: 1, status: 1 })

export const PayrollImportBatch = mongoose.model('PayrollImportBatch', PayrollImportBatchSchema)