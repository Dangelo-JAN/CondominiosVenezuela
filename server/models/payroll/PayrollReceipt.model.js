import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const PayrollReceiptSchema = new Schema({
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
    contract: {
        type: Schema.Types.ObjectId,
        ref: 'LaborContract'
    },
    branch: {
        type: Schema.Types.ObjectId,
        ref: 'Branch'
    },
    contract_snapshot: {
        type: Schema.Types.Mixed,
        default: {}
    },
    salary_base_snapshot: {
        type: Number,
        required: true
    },
    exchange_rate_snapshot: {
        type: Number,
        required: true
    },
    currency_code: {
        type: String,
        required: true,
        default: 'VES'
    },
    total_income_ves: {
        type: Number,
        default: 0
    },
    total_deductions_ves: {
        type: Number,
        default: 0
    },
    total_employer_cost_ves: {
        type: Number,
        default: 0
    },
    net_pay_ves: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        required: true,
        enum: ['DRAFT', 'CALCULATED', 'APPROVED', 'PAID', 'VOIDED'],
        default: 'DRAFT'
    },
    branch_split: {
        type: Schema.Types.Mixed,
        default: {}
    },
    needs_recalculation: {
        type: Boolean,
        default: false
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

PayrollReceiptSchema.index({ organizationID: 1, period: 1, employee: 1 }, { unique: true })
PayrollReceiptSchema.index({ organizationID: 1, period: 1, status: 1 })
PayrollReceiptSchema.index({ employee: 1, status: 1 })

export const PayrollReceipt = mongoose.model('PayrollReceipt', PayrollReceiptSchema)