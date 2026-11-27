import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const PayrollCompanySchema = new Schema({
    organizationID: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        unique: true
    },
    // Información legal
    rif: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    logo: {
        type: String,
        default: ''
    },
    colors: {
        primary: { type: String, default: '#003DA5' },
        secondary: { type: String, default: '#FCE300' }
    },
    address: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    // Configuración nómina
    salary_split_mode: {
        type: String,
        enum: ['MIXTO', 'BASE_COMPLEMENT', 'TOTAL_BASE'],
        default: 'MIXTO'
    },
    split_percentage_base: {
        type: Number,
        default: 60.00
    },
    cestaticket_amount_usd: {
        type: Number,
        default: 40.00
    },
    cestaticket_payment_day: {
        type: Number,
        default: 15
    },
    cestaticket_package_mode: {
        type: String,
        enum: ['INTEGRADO', 'SEPARADO'],
        default: 'INTEGRADO'
    },
    vacation_days_base: {
        type: Number,
        default: 15
    },
    vacation_days_per_year: {
        type: Number,
        default: 1
    },
    vacation_days_max: {
        type: Number,
        default: 30
    },
    vacation_bonus_days_base: {
        type: Number,
        default: 15
    },
    vacation_bonus_days_per_year: {
        type: Number,
        default: 1
    },
    vacation_bonus_days_max: {
        type: Number,
        default: 30
    },
    exchange_rate_source: {
        type: String,
        enum: ['BCV', 'PARALELO', 'MANUAL'],
        default: 'BCV'
    },
    rest_weekdays: {
        type: Schema.Types.Mixed,
        default: [5, 6]
    },
    banavih_patron_number: {
        type: String,
        default: ''
    },
    inces_number: {
        type: String,
        default: ''
    },
    faov_number: {
        type: String,
        default: ''
    },
    ivss_number: {
        type: String,
        default: ''
    },
    // Tasas legales (snapshot de política)
    minimum_wage_ves: {
        type: Number,
        default: 130.00
    },
    ut_value_ves: {
        type: Number,
        default: 9.00
    },
    imii_usd: {
        type: Number,
        default: 130.00
    },
    ivss_employee_rate: {
        type: Number,
        default: 4.00
    },
    ivss_employer_rate: {
        type: Number,
        default: 9.00
    },
    ivss_salary_cap_multiplier: {
        type: Number,
        default: 5
    },
    faov_employee_rate: {
        type: Number,
        default: 1.00
    },
    faov_employer_rate: {
        type: Number,
        default: 2.00
    },
    rpe_employee_rate: {
        type: Number,
        default: 0.50
    },
    rpe_employer_rate: {
        type: Number,
        default: 2.00
    },
    lppss_rate: {
        type: Number,
        default: 9.00
    },
    inces_employer_rate: {
        type: Number,
        default: 2.00
    },
    holiday_payout_factor: {
        type: Number,
        default: 1.50
    },
    rest_day_payout_factor: {
        type: Number,
        default: 1.50
    },
    overtime_day_factor: {
        type: Number,
        default: 1.50
    },
    overtime_night_factor: {
        type: Number,
        default: 1.50
    },
    night_bonus_rate: {
        type: Number,
        default: 0.30
    },
    min_service_months: {
        type: Number,
        default: 12
    },
    pay_rest_days: {
        type: Boolean,
        default: true
    },
    pay_holidays: {
        type: Boolean,
        default: true
    },
    accrual_mode: {
        type: String,
        enum: ['ANNUAL', 'MONTHLY', 'DAILY'],
        default: 'ANNUAL'
    },
    vacation_salary_basis: {
        type: String,
        enum: ['LAST_SALARY', 'AVERAGE_3M', 'AVERAGE_6M', 'BEST_YEAR'],
        default: 'LAST_SALARY'
    },
    vacation_salary_source: {
        type: String,
        enum: ['BASE_SALARY', 'TOTAL_SALARY'],
        default: 'TOTAL_SALARY'
    },
    cestaticket_pay_on_vacation: {
        type: Boolean,
        default: true
    },
    cestaticket_separate_period: {
        type: Boolean,
        default: false
    },
    seniority_cap_years: {
        type: Number,
        default: 30
    },
    include_cestaticket_in_benefits: {
        type: Boolean,
        default: true
    },
    include_commissions_in_benefits: {
        type: Boolean,
        default: true
    },
    include_bonuses_in_benefits: {
        type: Boolean,
        default: true
    },
    include_overtime_in_benefits: {
        type: Boolean,
        default: true
    },
    include_utilidades_in_benefits: {
        type: Boolean,
        default: true
    },
    faov_employer_base_formula: {
        type: String,
        default: 'SALARIO_MENSUAL'
    },
    vacation_cestaticket_label: {
        type: String,
        default: 'CESTATICKET VACACIONAL'
    },
    // Módulos activos
    active_modules: {
        type: [String],
        default: ['payroll', 'vacations', 'social_benefits', 'utilidades']
    }
}, { timestamps: true })

PayrollCompanySchema.index({ organizationID: 1 }, { unique: true })

export const PayrollCompany = mongoose.model('PayrollCompany', PayrollCompanySchema)