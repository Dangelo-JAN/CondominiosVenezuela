import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const LoanSchema = new Schema({
    employee: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    loan_type: {
        type: String,
        required: true,
        enum: ['PERSONAL', 'HIPOTECARIO', 'VEHICULO', 'EDUCATIVO', 'OTRO'],
        default: 'PERSONAL'
    },
    amount: {
        type: Number,
        required: true
    },
    interest_rate: {
        type: Number,
        default: 0
    },
    currency: {
        type: String,
        enum: ['VES', 'USD'],
        default: 'VES'
    },
    balance: {
        type: Number,
        default: 0
    },
    num_installments: {
        type: Number,
        required: true
    },
    installment_amount: {
        type: Number,
        required: true
    },
    frequency: {
        type: String,
        enum: ['QUINCENAL', 'MENSUAL'],
        default: 'QUINCENAL'
    },
    start_date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['ACTIVE', 'PAID', 'OVERDUE', 'CANCELLED'],
        default: 'ACTIVE'
    },
    description: {
        type: String,
        default: ''
    },
    approved_by: {
        type: Schema.Types.ObjectId,
        ref: 'HumanResources'
    },
    approved_at: {
        type: Date,
        default: null
    },
    organizationID: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    }
}, { timestamps: true })

LoanSchema.index({ organizationID: 1, employee: 1, status: 1 })

export const Loan = mongoose.model('Loan', LoanSchema)