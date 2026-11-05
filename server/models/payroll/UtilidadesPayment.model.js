import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const UtilidadesPaymentSchema = new Schema({
    employee: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    period: {
        type: Schema.Types.ObjectId,
        ref: 'UtilidadesPeriod',
        required: true
    },
    days_worked: {
        type: Number,
        default: 0
    },
    daily_rate_ves: {
        type: Number,
        default: 0
    },
    gross_amount_ves: {
        type: Number,
        default: 0
    },
    islr_retention_ves: {
        type: Number,
        default: 0
    },
    net_amount_ves: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        required: true,
        enum: ['PENDING', 'PAID', 'VOIDED'],
        default: 'PENDING'
    },
    payment_date: {
        type: Date,
        default: null
    },
    payment_method: {
        type: String,
        default: ''
    },
    bank_reference: {
        type: String,
        default: ''
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

UtilidadesPaymentSchema.index({ organizationID: 1, period: 1, employee: 1 }, { unique: true })
UtilidadesPaymentSchema.index({ organizationID: 1, period: 1, status: 1 })

export const UtilidadesPayment = mongoose.model('UtilidadesPayment', UtilidadesPaymentSchema)