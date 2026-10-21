import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const AdvanceRequestSchema = new Schema({
    contract: {
        type: Schema.Types.ObjectId,
        ref: 'LaborContract',
        required: true
    },
    motive: {
        type: String,
        required: true,
        enum: ['QUINCENA', 'ESPECIAL', 'MEDICO', 'ESTUDIO', 'OTRO'],
        default: 'OTRO'
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'PAID'],
        default: 'PENDING'
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
    supporting_document: {
        type: String,
        default: ''
    },
    payroll_novelty: {
        type: Schema.Types.ObjectId,
        ref: 'PayrollNovelty'
    },
    organizationID: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    }
}, { timestamps: true })

AdvanceRequestSchema.index({ organizationID: 1, contract: 1, status: 1 })

export const AdvanceRequest = mongoose.model('AdvanceRequest', AdvanceRequestSchema)