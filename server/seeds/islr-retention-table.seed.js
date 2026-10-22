import { ISLRRetentionTable } from '../models/payroll/ISLRRetentionTable.model.js'

/**
 * Seed: Tablas ISLR (Impuesto Sobre La Renta) Venezuela 2024-2025
 * Basado en Ley ISLR vigente - SENIAT
 * Tablas progresivas por Unidades Tributarias (UT)
 * 
 * UT 2024: 9,00 VES (Gaceta Oficial N° 42.774)
 * UT 2025: 9,00 VES (pendiente actualización oficial, mantener 9.00 como referencia)
 * 
 * Estructura: income_from_ut, income_to_ut (en UT), rate (%), subtrahend (en UT)
 */

export const seedISLRRetentionTables = async (organizationID) => {
    const tables = [
        // ========== AÑO 2024 ==========
        { year: 2024, income_from_ut: 0,       income_to_ut: 1000,  rate: 0,   subtrahend: 0,   ut_value: 9.00, is_active: true, organizationID },
        { year: 2024, income_from_ut: 1000,    income_to_ut: 1500,  rate: 6,   subtrahend: 60,  ut_value: 9.00, is_active: true, organizationID },
        { year: 2024, income_from_ut: 1500,    income_to_ut: 2000,  rate: 9,   subtrahend: 105, ut_value: 9.00, is_active: true, organizationID },
        { year: 2024, income_from_ut: 2000,    income_to_ut: 2500,  rate: 12,  subtrahend: 150, ut_value: 9.00, is_active: true, organizationID },
        { year: 2024, income_from_ut: 2500,    income_to_ut: 3000,  rate: 16,  subtrahend: 250, ut_value: 9.00, is_active: true, organizationID },
        { year: 2024, income_from_ut: 3000,    income_to_ut: 4000,  rate: 20,  subtrahend: 370, ut_value: 9.00, is_active: true, organizationID },
        { year: 2024, income_from_ut: 4000,    income_to_ut: 6000,  rate: 24,  subtrahend: 530, ut_value: 9.00, is_active: true, organizationID },
        { year: 2024, income_from_ut: 6000,    income_to_ut: 10000, rate: 28,  subtrahend: 770, ut_value: 9.00, is_active: true, organizationID },
        { year: 2024, income_from_ut: 10000,   income_to_ut: null,  rate: 34,  subtrahend: 1370, ut_value: 9.00, is_active: true, organizationID },

        // ========== AÑO 2025 ==========
        // Mismas tablas 2024 (UT no cambió oficialmente al cierre 2024)
        // Cuando SENIAT publique nuevas tablas, actualizar este seed
        { year: 2025, income_from_ut: 0,       income_to_ut: 1000,  rate: 0,   subtrahend: 0,   ut_value: 9.00, is_active: true, organizationID },
        { year: 2025, income_from_ut: 1000,    income_to_ut: 1500,  rate: 6,   subtrahend: 60,  ut_value: 9.00, is_active: true, organizationID },
        { year: 2025, income_from_ut: 1500,    income_to_ut: 2000,  rate: 9,   subtrahend: 105, ut_value: 9.00, is_active: true, organizationID },
        { year: 2025, income_from_ut: 2000,    income_to_ut: 2500,  rate: 12,  subtrahend: 150, ut_value: 9.00, is_active: true, organizationID },
        { year: 2025, income_from_ut: 2500,    income_to_ut: 3000,  rate: 16,  subtrahend: 250, ut_value: 9.00, is_active: true, organizationID },
        { year: 2025, income_from_ut: 3000,    income_to_ut: 4000,  rate: 20,  subtrahend: 370, ut_value: 9.00, is_active: true, organizationID },
        { year: 2025, income_from_ut: 4000,    income_to_ut: 6000,  rate: 24,  subtrahend: 530, ut_value: 9.00, is_active: true, organizationID },
        { year: 2025, income_from_ut: 6000,    income_to_ut: 10000, rate: 28,  subtrahend: 770, ut_value: 9.00, is_active: true, organizationID },
        { year: 2025, income_from_ut: 10000,   income_to_ut: null,  rate: 34,  subtrahend: 1370, ut_value: 9.00, is_active: true, organizationID },
    ]

    let created = 0
    let updated = 0

    for (const table of tables) {
        const result = await ISLRRetentionTable.findOneAndUpdate(
            { organizationID: table.organizationID, year: table.year, income_from_ut: table.income_from_ut },
            { $setOnInsert: table },
            { upsert: true, new: true, runValidators: true }
        )
        
        if (result.isNew) created++
        else updated++
    }

    console.log(`✅ ISLRRetentionTable seeded for organization ${organizationID}: ${created} creadas, ${updated} existentes`)
    return { created, updated }
}

// Helper para obtener tabla en formato calculador
export const getISLRTableForCalculator = async (organizationID, year) => {
    return ISLRRetentionTable.find({ organizationID, year, is_active: true })
        .sort({ income_from_ut: 1 })
        .lean()
}

export default seedISLRRetentionTables