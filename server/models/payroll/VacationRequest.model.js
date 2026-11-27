import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const VacationRequestSchema = new Schema({
    employee: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    contract: {
        type: Schema.Types.ObjectId,
        ref: 'LaborContract'
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: true
    },
    days_requested: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'TAKEN'],
        default: 'PENDING'
    },
    vacation_type: {
        type: String,
        required: true,
        enum: ['NORMAL', 'ACUMULADA', 'ANTICIPADA', 'PROPORTIONAL'],
        default: 'NORMAL'
    },
    reviewed_by: {
        type: Schema.Types.ObjectId,
        ref: 'HumanResources'
    },
    reviewed_at: {
        type: Date,
        default: null
    },
    notes: {
        type: String,
        default: ''
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

VacationRequestSchema.index({ organizationID: 1, employee: 1, status: 1 })
VacationRequestSchema.index({ organizationID: 1, start_date: 1, end_date: 1 })

export const VacationRequest = mongoose.model('VacationRequest', VacationRequestSchema)