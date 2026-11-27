import { PayrollPolicy } from '../models/payroll/PayrollPolicy.model.js'

/**
 * Seed: PayrollPolicy por defecto
 * Parámetros legales venezolanos actualizados (referencia 2024-2025)
 * Basado en: LOTTT, IVSS, FAOV, INCES, ISLR, RPE, LPPSS
 */
export const seedPayrollPolicy = async (organizationID) => {
    const policy = await PayrollPolicy.findOneAndUpdate(
        { organizationID },
        {
            $setOnInsert: {
                organizationID,

                // Salario Mínimo Vital (SMVM) - Referencia 2024-2025
                minimum_wage_ves: 130.00,
                minimum_wage_usd: 3.60, // Referencia aproximada

                // IVSS (Instituto Venezolano de los Seguros Sociales)
                // Art. 96-98 LOTTT - 4% empleado, 9% patronal (hasta 5 SMVM)
                ivss_employee_rate: 4.00,
                ivss_employer_rate: 9.00,
                ivss_salary_cap_multiplier: 5, // Tope: 5 salarios mínimos

                // FAOV (Fondo de Ahorro Obligatorio para la Vivienda)
                // Ley FAOV - 1% empleado, 2% patronal
                faov_employee_rate: 1.00,
                faov_employer_rate: 2.00,
                faov_employer_base_formula: 'SALARIO_MENSUAL', // o 'SALARIO_NORMAL'

                // RPE (Régimen de Prestaciones de Empleo) - Ley RPE
                // 0.5% empleado, 2% patronal
                rpe_employee_rate: 0.50,
                rpe_employer_rate: 2.00,

                // LPPSS (Ley de Prestaciones Sociales) - 9% patronal
                lppss_rate: 9.00,

                // INCES (Instituto Nacional de Capacitación y Educación Socialista)
                // 2% patronal sobre salario normal
                inces_employer_rate: 2.00,

                // BANVIH (Banco Nacional de Vivienda y Habitat) - 2% patronal
                banvih_employer_rate: 2.00,

                // CESTATICKET (Cesta Ticket / Alimentación)
                // 40 UT mensuales (exento hasta 40 UT, gravable exceso)
                cestaticket_amount_usd: 40.00,
                cestaticket_payment_day: 15,
                cestaticket_package_mode: 'INTEGRADO', // INTEGRADO, SEPARADO, MIXTO

                // Unidad Tributaria (UT) - Valor oficial
                ut_value_ves: 9.00,

                // IMII (Ingreso Mínimo Integral Indexado) - Referencia
                imii_usd: 130.00,

                // Horas Extra y Recargos (LOTTT Art. 170-173)
                holiday_payout_factor: 1.50,      // Trabajo en feriado: 150%
                rest_day_payout_factor: 1.50,     // Trabajo en día de descanso: 150%
                overtime_day_factor: 1.50,        // Horas extra diurnas: 50% recargo
                overtime_night_factor: 1.50,      // Horas extra nocturnas: 50% + nocturnidad
                night_bonus_rate: 0.30,           // Bono nocturnidad: 30%

                // Vacaciones (LOTTT Art. 186-190)
                vacation_days_base: 15,           // 15 días primer año
                vacation_days_per_year: 1,        // +1 día por año adicional
                vacation_days_max: 30,            // Tope 30 días
                vacation_bonus_days_base: 15,     // Bono vacacional: 15 días base
                vacation_bonus_days_per_year: 1,  // +1 día por año
                vacation_bonus_days_max: 30,      // Tope 30 días
                min_service_months: 12,           // Mínimo 12 meses para vacaciones completas
                pay_rest_days: true,              // Pagar días de descanso en vacaciones
                pay_holidays: true,               // Pagar feriados en vacaciones
                accrual_mode: 'ANNUAL',           // ANNUAL, MONTHLY, DAILY
                vacation_salary_basis: 'LAST_SALARY', // LAST_SALARY, AVERAGE_3M, AVERAGE_6M, AVERAGE_12M, HIGHEST_3M, CONTRACTUAL, TOTAL_SALARY
                vacation_salary_source: 'TOTAL_SALARY', // TOTAL_SALARY, BASE_SALARY, BASE_PLUS_CESTA
                cestaticket_pay_on_vacation: true,
                cestaticket_separate_period: false,

                // División Salario (Práctica venezolana)
                salary_split_mode: 'MIXTO',       // MIXTO, BASE_COMPLEMENT, TOTAL_BASE
                split_percentage_base: 60.00,     // % base en modo MIXTO

                // Tipo de Cambio
                exchange_rate_source: 'BCV',      // BCV, PARALLEL, FIXED, CUSTOM

                // Días de descanso (0=Domingo, 6=Sábado)
                rest_weekdays: [5, 6],            // Viernes-Sábado o Sábado-Domingo

                // Prestaciones Sociales (LOTTT Art. 174-177)
                seniority_cap_years: 30,          // Tope 30 años de antigüedad
                include_cestaticket_in_benefits: true,
                include_commissions_in_benefits: true,
                include_bonuses_in_benefits: true,
                include_overtime_in_benefits: true,
                include_utilidades_in_benefits: true,

                // Módulos activos
                active_modules: ['payroll', 'vacations', 'social_benefits', 'utilidades']
            }
        },
        { upsert: true, new: true, runValidators: true }
    )

    console.log(`✅ PayrollPolicy seeded for organization ${organizationID}`)
    return policy
}