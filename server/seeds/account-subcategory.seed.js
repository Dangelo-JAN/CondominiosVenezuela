import { AccountingAccountSubcategory } from '../models/accounting/AccountSubcategory.model.js'
import { Organization } from '../models/Organization.model.js'

/**
 * Seed de Subcategorías Contables para Nómina
 * Códigos según plan contable venezolano (adaptado para Nóminix)
 * 
 * Estructura:
 * - 1xxx: ACTIVOS
 * - 2xxx: PASIVOS (Por pagar)
 * - 3xxx: PATRIMONIO
 * - 4xxx: PASIVOS (Retenciones/Entes)
 * - 5xxx: INGRESOS
 * - 6xxx: GASTOS
 * - 7xxx: COSTOS
 */

const accountSubcategories = [
    // ============================================
    // GASTOS DE PERSONAL (61xx)
    // ============================================
    { code: '6111', name: 'Sueldos y Salarios Base', dre_role: 'EXPENSE', group: '61' },
    { code: '6112', name: 'Complementos y Adicionales', dre_role: 'EXPENSE', group: '61' },
    { code: '6113', name: 'Cestaticket / Alimentación', dre_role: 'EXPENSE', group: '61' },
    { code: '6121', name: 'Horas Extra Diurnas', dre_role: 'EXPENSE', group: '61' },
    { code: '6122', name: 'Horas Extra Nocturnas', dre_role: 'EXPENSE', group: '61' },
    { code: '6123', name: 'Bono Nocturno', dre_role: 'EXPENSE', group: '61' },
    { code: '6124', name: 'Días Feriados Trabajados', dre_role: 'EXPENSE', group: '61' },
    { code: '6125', name: 'Domingos Trabajados', dre_role: 'EXPENSE', group: '61' },
    { code: '6126', name: 'Días de Descanso Trabajados', dre_role: 'EXPENSE', group: '61' },
    { code: '6131', name: 'Reposo 3/3 (Enfermedad/Maternidad)', dre_role: 'EXPENSE', group: '61' },
    { code: '6132', name: 'Reposo Total (Accidente Laboral)', dre_role: 'EXPENSE', group: '61' },
    { code: '6199', name: 'Otros Gastos de Personal N.C.P.', dre_role: 'EXPENSE', group: '61' },

    // ============================================
    // GASTOS PATRONALES (62xx)
    // ============================================
    { code: '6211', name: 'IVSS Patronal', dre_role: 'EXPENSE', group: '62' },
    { code: '6212', name: 'FAOV Patronal', dre_role: 'EXPENSE', group: '62' },
    { code: '6213', name: 'RPE Patronal', dre_role: 'EXPENSE', group: '62' },
    { code: '6214', name: 'INCES Patronal', dre_role: 'EXPENSE', group: '62' },
    { code: '6215', name: 'LPPSS Patronal', dre_role: 'EXPENSE', group: '62' },
    { code: '6216', name: 'BANVIH Patronal', dre_role: 'EXPENSE', group: '62' },
    { code: '6299', name: 'Otros Costos Patronales N.C.P.', dre_role: 'EXPENSE', group: '62' },

    // ============================================
    // CUENTAS POR PAGAR A EMPLEADOS (21xx)
    // ============================================
    { code: '2111', name: 'Por Pagar a Empleados - Sueldos', dre_role: 'LIABILITY', group: '21' },
    { code: '2112', name: 'Por Pagar a Empleados - Vacaciones', dre_role: 'LIABILITY', group: '21' },
    { code: '2113', name: 'Por Pagar a Empleados - Utilidades', dre_role: 'LIABILITY', group: '21' },
    { code: '2114', name: 'Por Pagar a Empleados - Prestaciones', dre_role: 'LIABILITY', group: '21' },
    { code: '2115', name: 'Por Pagar a Empleados - Anticipos', dre_role: 'LIABILITY', group: '21' },
    { code: '2116', name: 'Por Pagar a Empleados - Préstamos', dre_role: 'LIABILITY', group: '21' },
    { code: '2199', name: 'Otras Cuentas por Pagar a Empleados', dre_role: 'LIABILITY', group: '21' },

    // ============================================
    // CUENTAS POR PAGAR A ENTES/RETENCIONES (22xx, 41xx)
    // ============================================
    { code: '2211', name: 'Por Pagar IVSS', dre_role: 'LIABILITY', group: '22' },
    { code: '2212', name: 'Por Pagar FAOV', dre_role: 'LIABILITY', group: '22' },
    { code: '2213', name: 'Por Pagar RPE', dre_role: 'LIABILITY', group: '22' },
    { code: '2214', name: 'Por Pagar INCES', dre_role: 'LIABILITY', group: '22' },
    { code: '2215', name: 'Por Pagar LPPSS', dre_role: 'LIABILITY', group: '22' },
    { code: '2216', name: 'Por Pagar BANVIH', dre_role: 'LIABILITY', group: '22' },

    { code: '4111', name: 'Retenciones IVSS Empleado', dre_role: 'LIABILITY', group: '41' },
    { code: '4112', name: 'Retenciones FAOV Empleado', dre_role: 'LIABILITY', group: '41' },
    { code: '4113', name: 'Retenciones RPE Empleado', dre_role: 'LIABILITY', group: '41' },
    { code: '4114', name: 'Retenciones ISLR', dre_role: 'LIABILITY', group: '41' },
    { code: '4115', name: 'Retenciones Faltas/Descuentos', dre_role: 'LIABILITY', group: '41' },
    { code: '4116', name: 'Retenciones Anticipo Vacacional', dre_role: 'LIABILITY', group: '41' },
    { code: '4117', name: 'Retenciones Préstamos/Adelantos', dre_role: 'LIABILITY', group: '41' },
    { code: '4199', name: 'Otras Retenciones y Cuentas por Pagar', dre_role: 'LIABILITY', group: '41' },
]

export async function seedAccountSubcategories(organizationID) {
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
        for (const acc of accountSubcategories) {
            try {
                const existing = await AccountingAccountSubcategory.findOne({
                    organizationID: org._id,
                    code: acc.code
                })

                if (existing) {
                    totalSkipped++
                    continue
                }

                await AccountingAccountSubcategory.create({
                    ...acc,
                    organizationID: org._id,
                    is_active: true
                })
                totalCreated++
            } catch (error) {
                if (error.code === 11000) {
                    totalSkipped++
                } else {
                    console.error(`[Seed] Error creando cuenta ${acc.code} para org ${org._id}:`, error.message)
                }
            }
        }
    }

    console.log(`[Seed] AccountSubcategory: ${totalCreated} creadas, ${totalSkipped} ya existían`)
    return { created: totalCreated, skipped: totalSkipped }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    import('../config/connectDB.js').then(({ default: connectDB }) => {
        connectDB().then(() => {
            seedAccountSubcategories().then(() => process.exit(0)).catch(() => process.exit(1))
        })
    })
}

export default { seedAccountSubcategories, accountSubcategories }