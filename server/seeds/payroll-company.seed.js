import { PayrollCompany } from '../models/payroll/PayrollCompany.model.js'

/**
 * Seed: Configuración de Empresa para Nómina
 * Extiende la configuración base de PayrollPolicy con campos específicos de la organización
 */
export const seedPayrollCompany = async (organizationID) => {
    const company = await PayrollCompany.findOneAndUpdate(
        { organizationID },
        {
            $setOnInsert: {
                organizationID,

                // Identificación fiscal
                rif: 'J-00000000-0',
                email: 'nomina@empresa.com',
                phone: '+58-212-0000000',
                address: 'Dirección fiscal de la empresa',

                // Configuración salarial
                salary_split_mode: 'MIXTO',
                split_percentage_base: 60.00,

                // CESTATICKET
                cestaticket_amount_usd: 40.00,
                cestaticket_payment_day: 15,
                cestaticket_package_mode: 'INTEGRADO',
                cestaticket_provider: 'EDENRED', // EDENRED, SODEXO, CHEQUES, EFECTIVO
                cestaticket_vacation_label: 'CESTATICKET VACACIONAL',

                // Vacaciones
                vacation_days_base: 15,
                vacation_days_per_year: 1,
                vacation_days_max: 30,
                vacation_bonus_days_base: 15,
                vacation_bonus_days_per_year: 1,
                vacation_bonus_days_max: 30,
                vacation_salary_basis: 'LAST_SALARY',
                vacation_salary_source: 'TOTAL_SALARY',
                cestaticket_pay_on_vacation: true,
                cestaticket_separate_period: false,

                // Parámetros legales (reflejando PayrollPolicy)
                exchange_rate_source: 'BCV',
                rest_weekdays: [5, 6], // Viernes, Sábado
                minimum_wage_ves: 130.00,
                ut_value_ves: 9.00,
                imii_usd: 130.00,

                // Tasas IVSS
                ivss_employee_rate: 4.00,
                ivss_employer_rate: 9.00,
                ivss_salary_cap_multiplier: 5,

                // Tasas FAOV
                faov_employee_rate: 1.00,
                faov_employer_rate: 2.00,
                faov_employer_base_formula: 'SALARIO_MENSUAL',

                // Tasas RPE
                rpe_employee_rate: 0.50,
                rpe_employer_rate: 2.00,

                // LPPSS
                lppss_rate: 9.00,

                // INCES
                inces_employer_rate: 2.00,

                // BANVIH
                banvih_employer_rate: 2.00,

                // Recargos
                holiday_payout_factor: 1.50,
                rest_day_payout_factor: 1.50,
                overtime_day_factor: 1.50,
                overtime_night_factor: 1.50,
                night_bonus_rate: 0.30,

                // Prestaciones
                min_service_months: 12,
                pay_rest_days: true,
                pay_holidays: true,
                accrual_mode: 'ANNUAL',
                seniority_cap_years: 30,
                include_cestaticket_in_benefits: true,
                include_commissions_in_benefits: true,
                include_bonuses_in_benefits: true,
                include_overtime_in_benefits: true,
                include_utilidades_in_benefits: true,

                // Bancos para nómina
                payroll_bank_accounts: [
                    { bank_code: '0102', bank_name: 'Banco de Venezuela', account_type: 'CORRIENTE', account_last4: '0000', is_default: true },
                    { bank_code: '0105', bank_name: 'Banco Mercantil', account_type: 'CORRIENTE', account_last4: '0000', is_default: false },
                    { bank_code: '0134', bank_name: 'Banesco', account_type: 'CORRIENTE', account_last4: '0000', is_default: false },
                    { bank_code: '0137', bank_name: 'Banco Sofitasa', account_type: 'CORRIENTE', account_last4: '0000', is_default: false },
                    { bank_code: '0163', bank_name: 'Banco del Tesoro', account_type: 'CORRIENTE', account_last4: '0000', is_default: false },
                    { bank_code: '0166', bank_name: 'Banco Agrícola', account_type: 'CORRIENTE', account_last4: '0000', is_default: false },
                    { bank_code: '0168', bank_name: 'Bancaribe', account_type: 'CORRIENTE', account_last4: '0000', is_default: false },
                    { bank_code: '0171', bank_name: 'Banco Activo', account_type: 'CORRIENTE', account_last4: '0000', is_default: false },
                    { bank_code: '0172', bank_name: 'Bancamiga', account_type: 'CORRIENTE', account_last4: '0000', is_default: false },
                    { bank_code: '0173', bank_name: 'Banco Internacional de Desarrollo', account_type: 'CORRIENTE', account_last4: '0000', is_default: false }
                ],

                // Módulos activos
                active_modules: ['payroll', 'vacations', 'social_benefits', 'utilidades'],

                // Configuración de exportación bancaria
                bank_export_format: 'SUDEBAN', // SUDEBAN, CUSTOM
                bank_export_encoding: 'UTF-8',

                // Notificaciones
                notify_on_calculate: true,
                notify_on_approve: true,
                notify_on_pay: true,
                send_payslip_email: true,
                send_payslip_whatsapp: false
            }
        },
        { upsert: true, new: true, runValidators: true }
    )

    console.log(`✅ PayrollCompany seeded for organization ${organizationID}`)
    return company
}