import { ISLRRetentionTable } from '../models/payroll/ISLRRetentionTable.model.js'
import { Organization } from '../models/Organization.model.js'

/**
 * Seed de Tablas de Retención ISLR (SUNAT/SENIAT Venezuela)
 * Tablas oficiales para cálculo de retención de ISLR
 * 
 * Basado en:
 * - Gaceta Oficial N° 41.437 (2018) - Tablas 2019
 * - Actualizaciones anuales SENIAT
 * - Unidades Tributarias (UT) ajustadas anualmente
 * 
 * Estructura: Para cada año, tabla de tramos con:
 * - lower_limit_ut: Límite inferior en UT
 * - upper_limit_ut: Límite superior en UT (null = infinito)
 * - fixed_amount_ut: Cuota fija en UT
 * - percentage: Porcentaje excedente (%)
 * - subtract_amount_ut: Monto a restar en UT (para fórmula: (base - lower) * % + fixed - subtract)
 */

const islrTables = {
    // TABLA 2024 (UT = 9.00 Bs. según Gaceta Oficial 2024)
    // Fuente: SENIAT Providencia Administrativa N° SNAT/2024/0001
    '2024': {
        ut_value_ves: 9.00,
        brackets: [
            { lower_limit_ut: 0,       upper_limit_ut: 625,    fixed_amount_ut: 0,      percentage: 0,   subtract_amount_ut: 0    },   // Exento
            { lower_limit_ut: 625,     upper_limit_ut: 1250,   fixed_amount_ut: 0,      percentage: 6,   subtract_amount_ut: 37.5 },
            { lower_limit_ut: 1250,    upper_limit_ut: 2500,   fixed_amount_ut: 37.5,   percentage: 9,   subtract_amount_ut: 75   },
            { lower_limit_ut: 2500,    upper_limit_ut: 3750,   fixed_amount_ut: 150,    percentage: 12,  subtract_amount_ut: 150  },
            { lower_limit_ut: 3750,    upper_limit_ut: 5000,   fixed_amount_ut: 300,    percentage: 16,  subtract_amount_ut: 300  },
            { lower_limit_ut: 5000,    upper_limit_ut: 7500,   fixed_amount_ut: 500,    percentage: 20,  subtract_amount_ut: 500  },
            { lower_limit_ut: 7500,    upper_limit_ut: 10000,  fixed_amount_ut: 1000,   percentage: 24,  subtract_amount_ut: 1000 },
            { lower_limit_ut: 10000,   upper_limit_ut: 15000,  fixed_amount_ut: 1600,   percentage: 28,  subtract_amount_ut: 1600 },
            { lower_limit_ut: 15000,   upper_limit_ut: 20000,  fixed_amount_ut: 3000,   percentage: 31,  subtract_amount_ut: 3000 },
            { lower_limit_ut: 20000,   upper_limit_ut: null,   fixed_amount_ut: 4550,   percentage: 34,  subtract_amount_ut: 4550 },
        ]
    },

    // TABLA 2025 (UT estimada - se actualizará cuando SENIAT publique)
    // UT 2025 estimada: 10.00 Bs (ajustar cuando sea oficial)
    '2025': {
        ut_value_ves: 10.00,
        brackets: [
            { lower_limit_ut: 0,       upper_limit_ut: 625,    fixed_amount_ut: 0,      percentage: 0,   subtract_amount_ut: 0    },
            { lower_limit_ut: 625,     upper_limit_ut: 1250,   fixed_amount_ut: 0,      percentage: 6,   subtract_amount_ut: 37.5 },
            { lower_limit_ut: 1250,    upper_limit_ut: 2500,   fixed_amount_ut: 37.5,   percentage: 9,   subtract_amount_ut: 75   },
            { lower_limit_ut: 2500,    upper_limit_ut: 3750,   fixed_amount_ut: 150,    percentage: 12,  subtract_amount_ut: 150  },
            { lower_limit_ut: 3750,    upper_limit_ut: 5000,   fixed_amount_ut: 300,    percentage: 16,  subtract_amount_ut: 300  },
            { lower_limit_ut: 5000,    upper_limit_ut: 7500,   fixed_amount_ut: 500,    percentage: 20,  subtract_amount_ut: 500  },
            { lower_limit_ut: 7500,    upper_limit_ut: 10000,  fixed_amount_ut: 1000,   percentage: 24,  subtract_amount_ut: 1000 },
            { lower_limit_ut: 10000,   upper_limit_ut: 15000,  fixed_amount_ut: 1600,   percentage: 28,  subtract_amount_ut: 1600 },
            { lower_limit_ut: 15000,   upper_limit_ut: 20000,  fixed_amount_ut: 3000,   percentage: 31,  subtract_amount_ut: 3000 },
            { lower_limit_ut: 20000,   upper_limit_ut: null,   fixed_amount_ut: 4550,   percentage: 34,  subtract_amount_ut: 4550 },
        ]
    },

    // TABLA 2023 (para referencia histórica)
    '2023': {
        ut_value_ves: 9.00,
        brackets: [
            { lower_limit_ut: 0,       upper_limit_ut: 625,    fixed_amount_ut: 0,      percentage: 0,   subtract_amount_ut: 0    },
            { lower_limit_ut: 625,     upper_limit_ut: 1250,   fixed_amount_ut: 0,      percentage: 6,   subtract_amount_ut: 37.5 },
            { lower_limit_ut: 1250,    upper_limit_ut: 2500,   fixed_amount_ut: 37.5,   percentage: 9,   subtract_amount_ut: 75   },
            { lower_limit_ut: 2500,    upper_limit_ut: 3750,   fixed_amount_ut: 150,    percentage: 12,  subtract_amount_ut: 150  },
            { lower_limit_ut: 3750,    upper_limit_ut: 5000,   fixed_amount_ut: 300,    percentage: 16,  subtract_amount_ut: 300  },
            { lower_limit_ut: 5000,    upper_limit_ut: 7500,   fixed_amount_ut: 500,    percentage: 20,  subtract_amount_ut: 500  },
            { lower_limit_ut: 7500,    upper_limit_ut: 10000,  fixed_amount_ut: 1000,   percentage: 24,  subtract_amount_ut: 1000 },
            { lower_limit_ut: 10000,   upper_limit_ut: 15000,  fixed_amount_ut: 1600,   percentage: 28,  subtract_amount_ut: 1600 },
            { lower_limit_ut: 15000,   upper_limit_ut: 20000,  fixed_amount_ut: 3000,   percentage: 31,  subtract_amount_ut: 3000 },
            { lower_limit_ut: 20000,   upper_limit_ut: null,   fixed_amount_ut: 4550,   percentage: 34,  subtract_amount_ut: 4550 },
        ]
    },
}

export async function seedISLRRetentionTables(organizationID) {
    // Si no se pasa organizationID, obtener todas las activas
    let organizations
    if (organizationID) {
        organizations = [{ _id: organizationID }]
    } else {
        organizations = await Organization.find({ isactive: true }).lean()
    }
    
    let totalCreated = 0
    let totalSkipped = 0

    for (const org of organizations) {
        for (const [year, tableData] of Object.entries(islrTables)) {
            try {
                const existing = await ISLRRetentionTable.findOne({
                    organizationID: org._id,
                    year: parseInt(year)
                })

                if (existing) {
                    totalSkipped++
                    continue
                }

                await ISLRRetentionTable.create({
                    year: parseInt(year),
                    ut_value_ves: tableData.ut_value_ves,
                    brackets: tableData.brackets,
                    organizationID: org._id,
                    is_active: true,
                    source: 'SENIAT',
                    notes: `Tabla ISLR ${year} - UT = ${tableData.ut_value_ves} Bs`
                })
                totalCreated++
            } catch (error) {
                if (error.code === 11000) {
                    totalSkipped++
                } else {
                    console.error(`[Seed] Error creando tabla ISLR ${year} para org ${org._id}:`, error.message)
                }
            }
        }
    }

    console.log(`[Seed] ISLRRetentionTable: ${totalCreated} creadas, ${totalSkipped} ya existían`)
    return { created: totalCreated, skipped: totalSkipped }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    import('../config/connectDB.js').then(({ default: connectDB }) => {
        connectDB().then(() => {
            seedISLRRetentionTables().then(() => process.exit(0)).catch(() => process.exit(1))
        })
    })
}

export default { seedISLRRetentionTables, islrTables }