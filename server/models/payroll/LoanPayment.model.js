import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const LoanPaymentSchema = new Schema({
    loan: {
        type: Schema.Types.ObjectId,
        ref: 'Loan',
        required: true
    },
    receipt: {
        type: Schema.Types.ObjectId,
        ref: 'PayrollReceipt'
    },
    amount: {
        type: Number,
        required: true
    },
    installment_number: {
        type: Number,
        required: true
    },
    payment_date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['PENDING', 'PAID', 'VOIDED'],
        default: 'PENDING'
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

LoanPaymentSchema.index({ organizationID: 1, loan: 1, installment_number: 1 }, { unique: true })
LoanPaymentSchema.index({ organizationID: 1, loan: 1, status: 1 })

export const LoanPayment = mongoose.model('LoanPayment', LoanPaymentSchema)