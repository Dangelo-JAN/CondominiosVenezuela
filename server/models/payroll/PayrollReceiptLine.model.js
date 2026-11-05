import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const PayrollReceiptLineSchema = new Schema({
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
    kind: {
        type: String,
        required: true,
        enum: ['INCOME', 'DEDUCTION', 'EMPLOYER_COST', 'INFORMATIONAL'],
        default: 'INCOME'
    },
    amount_ves: {
        type: Number,
        default: 0
    },
    amount_src: {
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
    percentage: {
        type: Number,
        default: 0
    },
    tipo_recibo: {
        type: Schema.Types.ObjectId,
        ref: 'ReceiptType'
    },
    calculation_log: {
        type: Schema.Types.Mixed,
        default: {}
    },
    calculation_trace: {
        type: String,
        default: ''
    },
    notes: {
        type: String,
        default: ''
    },
    is_salary_incidence: {
        type: Boolean,
        default: false
    },
    exchange_rate: {
        type: Number,
        default: 1
    },
    branch: {
        type: Schema.Types.ObjectId,
        ref: 'Branch'
    },
    organizationID: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    }
}, { timestamps: true })

PayrollReceiptLineSchema.index({ organizationID: 1, receipt: 1, concept_code: 1 })
PayrollReceiptLineSchema.index({ receipt: 1, kind: 1 })

export const PayrollReceiptLine = mongoose.model('PayrollReceiptLine', PayrollReceiptLineSchema)