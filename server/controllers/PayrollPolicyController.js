import { PayrollPolicy } from '../models/payroll/PayrollPolicy.model.js'
import { PayrollCompany } from '../models/payroll/PayrollCompany.model.js'

export const PayrollPolicyController = {
    // GET /api/v1/payroll-policy
    async getPolicy(req, res) {
        try {
            const policy = await PayrollPolicy.findOne({ organizationID: req.ORGID }).lean()

            if (!policy) {
                // Crear política por defecto si no existe
                const defaultPolicy = await PayrollPolicy.create({
                    organizationID: req.ORGID,
                    minimum_wage_ves: 130.00,
                    ivss_employee_rate: 4.00,
                    ivss_employer_rate: 9.00,
                    ivss_salary_cap_multiplier: 5,
                    faov_employee_rate: 1.00,
                    faov_employer_rate: 2.00,
                    faov_employer_base_formula: 'SALARIO_MENSUAL',
                    rpe_employee_rate: 0.50,
                    rpe_employer_rate: 2.00,
                    lppss_rate: 9.00,
                    imii_usd: 130.00,
                    inces_employer_rate: 2.00,
                    cestaticket_amount_usd: 40.00,
                    ut_value_ves: 9.00,
                    holiday_payout_factor: 1.50,
                    rest_day_payout_factor: 1.50,
                    overtime_day_factor: 1.50,
                    overtime_night_factor: 1.50,
                    night_bonus_rate: 0.30,
                    vacation_days_base: 15,
                    vacation_days_per_year: 1,
                    vacation_days_max: 30,
                    vacation_bonus_days_base: 15,
                    vacation_bonus_days_per_year: 1,
                    vacation_bonus_days_max: 30,
                    min_service_months: 12,
                    pay_rest_days: true,
                    pay_holidays: true,
                    accrual_mode: 'ANNUAL',
                    vacation_salary_basis: 'LAST_SALARY',
                    vacation_salary_source: 'TOTAL_SALARY',
                    cestaticket_pay_on_vacation: true,
                    cestaticket_separate_period: false,
                    salary_split_mode: 'MIXTO',
                    split_percentage_base: 60.00,
                    exchange_rate_source: 'BCV',
                    rest_weekdays: [5, 6],
                    seniority_cap_years: 30,
                    include_cestaticket_in_benefits: true,
                    include_commissions_in_benefits: true,
                    include_bonuses_in_benefits: true,
                    include_overtime_in_benefits: true,
                    include_utilidades_in_benefits: true
                })
                return res.status(200).json({ success: true, message: 'Política por defecto creada', data: defaultPolicy })
            }

            return res.status(200).json({ success: true, message: 'Política de nómina recuperada', data: policy })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // PUT /api/v1/payroll-policy
    async updatePolicy(req, res) {
        try {
            const policy = await PayrollPolicy.findOneAndUpdate(
                { organizationID: req.ORGID },
                { $set: req.body },
                { new: true, upsert: true, runValidators: true }
            )

            return res.status(200).json({ success: true, message: 'Política actualizada exitosamente', data: policy })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // GET /api/v1/payroll-company
    async getCompanyConfig(req, res) {
        try {
            const company = await PayrollCompany.findOne({ organizationID: req.ORGID }).lean()

            if (!company) {
                // Crear config por defecto
                const defaultCompany = await PayrollCompany.create({
                    organizationID: req.ORGID,
                    rif: '',
                    email: '',
                    salary_split_mode: 'MIXTO',
                    split_percentage_base: 60.00,
                    cestaticket_amount_usd: 40.00,
                    cestaticket_payment_day: 15,
                    cestaticket_package_mode: 'INTEGRADO',
                    vacation_days_base: 15,
                    vacation_days_per_year: 1,
                    vacation_days_max: 30,
                    vacation_bonus_days_base: 15,
                    vacation_bonus_days_per_year: 1,
                    vacation_bonus_days_max: 30,
                    exchange_rate_source: 'BCV',
                    rest_weekdays: [5, 6],
                    minimum_wage_ves: 130.00,
                    ut_value_ves: 9.00,
                    imii_usd: 130.00,
                    ivss_employee_rate: 4.00,
                    ivss_employer_rate: 9.00,
                    ivss_salary_cap_multiplier: 5,
                    faov_employee_rate: 1.00,
                    faov_employer_rate: 2.00,
                    rpe_employee_rate: 0.50,
                    rpe_employer_rate: 2.00,
                    lppss_rate: 9.00,
                    inces_employer_rate: 2.00,
                    holiday_payout_factor: 1.50,
                    rest_day_payout_factor: 1.50,
                    overtime_day_factor: 1.50,
                    overtime_night_factor: 1.50,
                    night_bonus_rate: 0.30,
                    min_service_months: 12,
                    pay_rest_days: true,
                    pay_holidays: true,
                    accrual_mode: 'ANNUAL',
                    vacation_salary_basis: 'LAST_SALARY',
                    vacation_salary_source: 'TOTAL_SALARY',
                    cestaticket_pay_on_vacation: true,
                    cestaticket_separate_period: false,
                    seniority_cap_years: 30,
                    include_cestaticket_in_benefits: true,
                    include_commissions_in_benefits: true,
                    include_bonuses_in_benefits: true,
                    include_overtime_in_benefits: true,
                    include_utilidades_in_benefits: true,
                    faov_employer_base_formula: 'SALARIO_MENSUAL',
                    vacation_cestaticket_label: 'CESTATICKET VACACIONAL',
                    active_modules: ['payroll', 'vacations', 'social_benefits', 'utilidades']
                })
                return res.status(200).json({ success: true, message: 'Configuración por defecto creada', data: defaultCompany })
            }

            return res.status(200).json({ success: true, message: 'Configuración de empresa recuperada', data: company })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    },

    // PUT /api/v1/payroll-company
    async updateCompanyConfig(req, res) {
        try {
            const company = await PayrollCompany.findOneAndUpdate(
                { organizationID: req.ORGID },
                { $set: req.body },
                { new: true, upsert: true, runValidators: true }
            )

            return res.status(200).json({ success: true, message: 'Configuración actualizada exitosamente', data: company })
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message })
        }
    }
}

export default PayrollPolicyController