import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const PayrollEmployerCostSchema = new Schema({
    receipt: {
        type: Schema.Types.ObjectId,
        ref: 'PayrollReceipt',
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
    base_ves: {
        type: Number,
        default: 0
    },
    rate: {
        type: Number,
        default: 0
    },
    amount_ves: {
        type: Number,
        default: 0
    },
    calculation_log: {
        type: Schema.Types.Mixed,
        default: {}
    },
    organizationID: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    }
}, { timestamps: true })

PayrollEmployerCostSchema.index({ organizationID: 1, receipt: 1, concept_code: 1 })

export const PayrollEmployerCost = mongoose.model('PayrollEmployerCost', PayrollEmployerCostSchema)