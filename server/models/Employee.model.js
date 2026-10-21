import mongoose from 'mongoose'
import { Schema } from "mongoose";

const EmployeeSchema = new Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String, 
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (value) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            },
            message: 'Invalid email address format, please enter a valid email address',
        }
    },
    password: {
        type: String,
        required: true,
    },
    contactnumber: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["HR-Admin", "Employee"],
        required: true,
    },
    lastlogin: {
        type: Date,
        default: Date.now
    },
    isverified: {
        type: Boolean,
        default: false
    },
    verificationtoken: {
        type: String
    },
    verificationtokenexpires: {
        type: Date
    },
    // Campos para invitación (cuando HR crea empleado sin password)
    invitationtoken: {
        type: String
    },
    invitationtokenexpires: {
        type: Date
    },
    isactive: {
        type: Boolean,
        default: true
    },
    invitedby: {
        type: Schema.Types.ObjectId,
        ref: "HumanResources"
    },
    resetpasswordtoken: {
        type: String
    },
    resetpasswordexpires: {
        type: Date
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department"
    },
    attendance: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attendance"
    },
    notice: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Notice"
        }
    ],
    salary: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Salary"
        }
    ],
    leaverequest: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Leave"
        }
    ],
    generaterequest: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "GenerateRequest"
        }
    ],
    organizationID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization"
    },
    // ═══════════════════════════════════════════════════════════════
    // CAMPOS DE NÓMINA VENEZOLANA (Nóminix-compatible)
    // ═══════════════════════════════════════════════════════════════
    // Identificación legal
    national_id: {
        type: String,
        trim: true,
        uppercase: true
    },
    rif: {
        type: String,
        trim: true,
        uppercase: true
    },
    ivss_code: {
        type: String,
        trim: true
    },
    faov_code: {
        type: String,
        trim: true
    },
    employee_code: {
        type: String,
        trim: true,
        uppercase: true
    },
    // Fechas laborales
    birth_date: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['M', 'F'],
        default: 'M'
    },
    marital_status: {
        type: String,
        enum: ['SOLTERO', 'CASADO', 'DIVORCIADO', 'VIUDO', 'UNION_ESTABLE'],
        default: 'SOLTERO'
    },
    hire_date: {
        type: Date,
        required: true
    },
    termination_date: {
        type: Date,
        default: null
    },
    // Bancarios
    bank_name: {
        type: String,
        trim: true
    },
    bank_account_number: {
        type: String,
        trim: true
    },
    bank_account_type: {
        type: String,
        enum: ['CORRIENTE', 'AHORRO'],
        default: 'CORRIENTE'
    },
    // Tallas y dotación
    shirt_size: {
        type: String,
        trim: true
    },
    pants_size: {
        type: String,
        trim: true
    },
    shoe_size: {
        type: String,
        trim: true
    },
    last_endowment_date: {
        type: Date,
        default: null
    },
    // Contrato activo (snapshot rápido)
    active_contract: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LaborContract"
    },
    // Configuración nómina por empleado (override de policy)
    salary_amount: {
        type: Number,
        default: 0
    },
    salary_currency: {
        type: String,
        enum: ['VES', 'USD'],
        default: 'USD'
    },
    payment_frequency: {
        type: String,
        enum: ['QUINCENAL', 'MENSUAL', 'SEMANAL'],
        default: 'QUINCENAL'
    },
    contract_type: {
        type: String,
        enum: ['INDEFINIDO', 'FIJO', 'TEMPORAL', 'APRENDIZ', 'PRACTICANTE'],
        default: 'INDEFINIDO'
    },
    includes_cestaticket: {
        type: Boolean,
        default: true
    },
    total_salary_override: {
        type: Number,
        default: null
    },
    islr_retention_percentage: {
        type: Number,
        default: 0
    },
    payroll_mode_override: {
        type: String,
        enum: ['SALARY', 'VARIABLE', 'MIXTO'],
        default: 'SALARY'
    },
    // Días de descanso personalizados (override de company/policy)
    rest_weekdays: {
        type: Schema.Types.Mixed,
        default: null
    },
    // Excluir de facturación/préstamos
    exclude_from_billing: {
        type: Boolean,
        default: false
    },
    // Relaciones de nómina
    payroll_receipts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PayrollReceipt"
        }
    ],
    payroll_novelties: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PayrollNovelty"
        }
    ],
    vacation_balance: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "VacationBalance"
    },
    vacation_requests: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "VacationRequest"
        }
    ],
    social_benefits_ledger: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SocialBenefitsLedger"
        }
    ],
    social_benefits_settlements: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SocialBenefitsSettlement"
        }
    ],
    utilidades_payments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UtilidadesPayment"
        }
    ],
    loans: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Loan"
        }
    ],
    advance_requests: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AdvanceRequest"
        }
    ]
},
    { timestamps: true }
);

export const Employee = mongoose.model('Employee', EmployeeSchema)
