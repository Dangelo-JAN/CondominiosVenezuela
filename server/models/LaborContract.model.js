import mongoose from "mongoose"
const { Schema, Types } = mongoose

const LaborContractSchema = new Schema(
    {
        organizationID: {
            type: Types.ObjectId,
            ref: "Organization",
            required: true,
        },
        employee: {
            type: Types.ObjectId,
            ref: "Employee",
            required: true,
        },
        // Tipo de contrato
        contract_type: {
            type: String,
            enum: ["INDEFINIDO", "FIJO", "TEMPORAL", "APRENDIZ", "PRACTICANTE"],
            default: "INDEFINIDO",
        },
        // Fechas
        start_date: {
            type: Date,
            required: true,
        },
        end_date: {
            type: Date,
            default: null, // null = indefinido
        },
        // Salario
        salary_amount: {
            type: Number,
            required: true,
            min: 0,
        },
        salary_currency: {
            type: String,
            enum: ["VES", "USD"],
            default: "USD",
        },
        // Frecuencia de pago
        payment_frequency: {
            type: String,
            enum: ["QUINCENAL", "MENSUAL", "SEMANAL"],
            default: "QUINCENAL",
        },
        // Beneficios
        includes_cestaticket: {
            type: Boolean,
            default: true,
        },
        cestaticket_amount: {
            type: Number,
            default: 0,
        },
        cestaticket_currency: {
            type: String,
            enum: ["VES", "USD"],
            default: "VES",
        },
        // Estado
        is_active: {
            type: Boolean,
            default: true,
        },
        // Días de descanso personalizados
        rest_weekdays: {
            type: Schema.Types.Mixed,
            default: null,
        },
        // Referencias para cálculo de prestaciones
        hire_date: {
            type: Date,
            default: null,
        },
        // Para histórico de cambios
        changes_log: [{
            field: { type: String, required: true },
            old_value: { type: Schema.Types.Mixed },
            new_value: { type: Schema.Types.Mixed },
            changed_by: { type: Types.ObjectId, ref: "HumanResources" },
            changed_at: { type: Date, default: Date.now },
            reason: { type: String },
        }],
    },
    { timestamps: true }
)

// Índices compuestos (incluyen organizationID, employee, is_active)
LaborContractSchema.index({ organizationID: 1, employee: 1, is_active: 1 })
LaborContractSchema.index({ organizationID: 1, is_active: 1 })

export const LaborContract = mongoose.model("LaborContract", LaborContractSchema)