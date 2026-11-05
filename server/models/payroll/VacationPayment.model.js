import mongoose from "mongoose"
const { Schema, Types } = mongoose

const VacationPaymentSchema = new Schema(
    {
        organizationID: {
            type: Types.ObjectId,
            ref: "Organization",
            required: true,
        },
        vacation_request: {
            type: Types.ObjectId,
            ref: "VacationRequest",
            required: true,
        },
        payment_id: {
            type: Types.ObjectId,
            ref: "PayrollReceipt",
            required: true,
        },
        // Datos del pago
        days_paid: {
            type: Number,
            required: true,
            min: 0,
        },
        daily_salary_ves: {
            type: Number,
            required: true,
            min: 0,
        },
        bonus_days: {
            type: Number,
            default: 0,
        },
        bonus_amount_ves: {
            type: Number,
            default: 0,
        },
        total_ves: {
            type: Number,
            required: true,
            min: 0,
        },
        exchange_rate: {
            type: Number,
            default: 1,
        },
        // Estado
        status: {
            type: String,
            enum: ["PENDING", "PAID", "CANCELLED"],
            default: "PAID",
        },
    },
    { timestamps: true }
)

// Índices compuestos (incluyen organizationID, vacation_request, payment_id, status)
VacationPaymentSchema.index({ organizationID: 1, vacation_request: 1 })
VacationPaymentSchema.index({ organizationID: 1, payment_id: 1 })
VacationPaymentSchema.index({ organizationID: 1, status: 1 })

export const VacationPayment = mongoose.model("VacationPayment", VacationPaymentSchema)