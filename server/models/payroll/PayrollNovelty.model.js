import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const PayrollNoveltySchema = new Schema({
    employee: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    period: {
        type: Schema.Types.ObjectId,
        ref: 'PayrollPeriod',
        required: true
    },
    concept_code: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    amount: {
        type: Number,
        default: 0
    },
    quantity: {
        type: Number,
        default: 1
    },
    unit: {
        type: String,
        enum: ['DÍAS', 'HORAS', 'UNIDADES', '%', 'BS', 'USD'],
        default: 'BS'
    },
    description: {
        type: String,
        default: ''
    },
    source: {
        type: String,
        enum: ['MANUAL', 'IMPORT', 'BIOMETRIC', 'POS', 'LEAVE', 'LOAN', 'ADVANCE'],
        default: 'MANUAL'
    },
    reference_id: {
        type: Schema.Types.ObjectId,
        default: null
    },
    reference_model: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPLIED', 'REJECTED'],
        default: 'PENDING'
    },
    applied_by: {
        type: Schema.Types.ObjectId,
        ref: 'HumanResources'
    },
    applied_at: {
        type: Date,
        default: null
    },
    organizationID: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    }
}, { timestamps: true })

PayrollNoveltySchema.index({ organizationID: 1, period: 1, employee: 1, concept_code: 1 })
PayrollNoveltySchema.index({ organizationID: 1, period: 1, status: 1 })

export const PayrollNovelty = mongoose.model('PayrollNovelty', PayrollNoveltySchema)