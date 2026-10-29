import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const PermissionModuleSchema = new Schema({
    create: { type: Boolean, default: false },
    read:   { type: Boolean, default: true  },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
}, { _id: false })

const PayrollConceptSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    kind: {
        type: String,
        required: true,
        enum: ['INCOME', 'DEDUCTION', 'EMPLOYER_COST', 'INFORMATIONAL'],
        default: 'INCOME'
    },
    computation_method: {
        type: String,
        required: true,
        enum: ['FIXED_AMOUNT', 'PERCENTAGE_OF_BASIC', 'DYNAMIC_FORMULA', 'TABLE', 'EXTERNAL_API'],
        default: 'FIXED_AMOUNT'
    },
    value: {
        type: Number,
        default: 0
    },
    currency_id: {
        type: Schema.Types.ObjectId,
        ref: 'Currency'
    },
    formula: {
        type: String,
        default: ''
    },
    system_params: {
        type: Schema.Types.Mixed,
        default: {}
    },
    calculation_base: {
        type: String,
        enum: ['GROSS', 'BASE_SALARY', 'NET', 'TAXABLE', 'UT', 'CUSTOM'],
        default: 'GROSS'
    },
    behavior: {
        type: String,
        enum: ['FIXED', 'VARIABLE', 'NOVELTY', 'OVERTIME', 'BONUS', 'COMMISSION', 'ALLOWANCE'],
        default: 'FIXED'
    },
    rules: {
        type: Schema.Types.Mixed,
        default: {}
    },
    incidences: {
        type: [String],
        default: []
    },
    is_salary_incidence: {
        type: Boolean,
        default: false
    },
    is_system: {
        type: Boolean,
        default: false
    },
    is_novelty_eligible: {
        type: Boolean,
        default: true
    },
    deducts_from_base_salary: {
        type: Boolean,
        default: false
    },
    adds_to_complement: {
        type: Boolean,
        default: false
    },
    replaces_base_salary: {
        type: Boolean,
        default: false
    },
    tipo_recibo: {
        type: Schema.Types.ObjectId,
        ref: 'ReceiptType'
    },
    receipt_order: {
        type: Number,
        default: 0
    },
    show_on_payslip: {
        type: Boolean,
        default: true
    },
    appears_on_receipt: {
        type: Boolean,
        default: true
    },
    show_even_if_zero: {
        type: Boolean,
        default: false
    },
    unit_label: {
        type: String,
        enum: ['DÍAS', 'HORAS', 'UNIDADES', '%', 'BS', 'USD'],
        default: 'BS'
    },
    organizationID: {
        type: Schema.Types.ObjectId,
        ref: 'Organization'
    },
    active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true })

PayrollConceptSchema.index({ organizationID: 1, code: 1 }, { unique: true })
PayrollConceptSchema.index({ organizationID: 1, kind: 1, receipt_order: 1 })

export const PayrollConcept = mongoose.model('PayrollConcept', PayrollConceptSchema)