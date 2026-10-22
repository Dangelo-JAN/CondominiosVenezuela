import { AccountingAccountSubcategory } from '../models/accounting/AccountSubcategory.model.js'

/**
 * Seed: Subcuentas Contables para Nómina Venezolana
 * Plan de cuentas compatible con JournalGenerator
 * Estructura: 6xxx = Gastos, 2xxx = Pasivos (por pagar), 4xxx = Retenciones
 */

export const seedAccountSubcategories = async (organizationID) => {
    const accounts = [
        // ═══════════════════════════════════════════════════════════════════════
        // GASTOS DE PERSONAL (61xx) - Cuentas de resultado (DÉBITO en ingresos)
        // ═══════════════════════════════════════════════════════════════════════
        { code: '6111', name: 'Sueldo Base', dre_role: 'EXPENSE', is_active: true, organizationID },
        { code: '6112', name: 'Complemento Salarial', dre_role: 'EXPENSE', is_active: true, organizationID },
        { code: '6113', name: 'Cestaticket / Alimentación', dre_role: 'EXPENSE', is_active: true, organizationID },
        { code: '6121', name: 'Horas Extra Diurnas', dre_role: 'EXPENSE', is_active: true, organizationID },
        { code: '6122', name: 'Horas Extra Nocturnas', dre_role: 'EXPENSE', is_active: true, organizationID },
        { code: '6123', name: 'Bono Nocturnidad', dre_role: 'EXPENSE', is_active: true, organizationID },
        { code: '6124', name: 'Días Feriados Trabajados', dre_role: 'EXPENSE', is_active: true, organizationID },
        { code: '6125', name: 'Domingos Trabajados', dre_role: 'EXPENSE', is_active: true, organizationID },
        { code: '6126', name: 'Días de Descanso Trabajados', dre_role: 'EXPENSE', is_active: true, organizationID },
        { code: '6131', name: 'Reposo Médico (33%)', dre_role: 'EXPENSE', is_active: true, organizationID },
        { code: '6132', name: 'Reposo Médico (100%)', dre_role: 'EXPENSE', is_active: true, organizationID },
        { code: '6141', name: 'Vacaciones Pagadas', dre_role: 'EXPENSE', is_active: true, organizationID },
        { code: '6142', name: 'Bono Vacacional', dre_role: 'EXPENSE', is_active: true, organizationID },
        { code: '6151', name: 'Utilidades', dre_role: 'EXPENSE', is_active: true, organizationID },
        { code: '6161', name: 'Prestaciones Sociales / Liquidación', dre_role: 'EXPENSE', is_active: true, organizationID },
        { code: '6199', name: 'Otros Gastos de Personal', dre_role: 'EXPENSE', is_active: true, organizationID },

        // ═══════════════════════════════════════════════════════════════════════
        // GASTOS PATRONALES (62xx) - Cuentas de resultado (DÉBITO en costos patronales)
        // ═══════════════════════════════════════════════════════════════════════
        { code: '6211', name: 'IVSS Patronal (9%)', dre_role: 'EXPENSE', is_active: true, organizationID },
        { code: '6212', name: 'FAOV Patronal (2%)', dre_role: 'EXPENSE', is_active: true, organizationID },
        { code: '6213', name: 'RPE Patronal (2%)', dre_role: 'EXPENSE', is_active: true, organizationID },
        { code: '6214', name: 'INCES Patronal (2%)', dre_role: 'EXPENSE', is_active: true, organizationID },
        { code: '6215', name: 'LPPSS Patronal (9%)', dre_role: 'EXPENSE', is_active: true, organizationID },
        { code: '6216', name: 'BANVIH Patronal (2%)', dre_role: 'EXPENSE', is_active: true, organizationID },
        { code: '6299', name: 'Otros Costos Patronales', dre_role: 'EXPENSE', is_active: true, organizationID },

        // ═══════════════════════════════════════════════════════════════════════
        // POR PAGAR A EMPLEADOS (21xx) - Pasivos (CRÉDITO en ingresos, DÉBITO en deducciones)
        // ═══════════════════════════════════════════════════════════════════════
        { code: '2111', name: 'Por Pagar - Sueldos y Salarios', dre_role: 'LIABILITY', is_active: true, organizationID },
        { code: '2112', name: 'Por Pagar - Vacaciones', dre_role: 'LIABILITY', is_active: true, organizationID },
        { code: '2113', name: 'Por Pagar - Utilidades', dre_role: 'LIABILITY', is_active: true, organizationID },
        { code: '2114', name: 'Por Pagar - Prestaciones Sociales', dre_role: 'LIABILITY', is_active: true, organizationID },
        { code: '2115', name: 'Por Pagar - Anticipos y Préstamos', dre_role: 'LIABILITY', is_active: true, organizationID },

        // ═══════════════════════════════════════════════════════════════════════
        // POR PAGAR A ENTES PATRONALES (22xx) - Pasivos (CRÉDITO en costos patronales)
        // ═══════════════════════════════════════════════════════════════════════
        { code: '2211', name: 'Por Pagar - IVSS Patronal', dre_role: 'LIABILITY', is_active: true, organizationID },
        { code: '2212', name: 'Por Pagar - FAOV Patronal', dre_role: 'LIABILITY', is_active: true, organizationID },
        { code: '2213', name: 'Por Pagar - RPE Patronal', dre_role: 'LIABILITY', is_active: true, organizationID },
        { code: '2214', name: 'Por Pagar - INCES Patronal', dre_role: 'LIABILITY', is_active: true, organizationID },
        { code: '2215', name: 'Por Pagar - LPPSS Patronal', dre_role: 'LIABILITY', is_active: true, organizationID },
        { code: '2216', name: 'Por Pagar - BANVIH Patronal', dre_role: 'LIABILITY', is_active: true, organizationID },

        // ═══════════════════════════════════════════════════════════════════════
        // RETENCIONES Y POR PAGAR A TERCEROS (41xx) - Pasivos (CRÉDITO en deducciones)
        // ═══════════════════════════════════════════════════════════════════════
        { code: '4111', name: 'Por Retener/Entregar - IVSS Empleado (4%)', dre_role: 'LIABILITY', is_active: true, organizationID },
        { code: '4112', name: 'Por Retener/Entregar - FAOV Empleado (1%)', dre_role: 'LIABILITY', is_active: true, organizationID },
        { code: '4113', name: 'Por Retener/Entregar - RPE Empleado (0.5%)', dre_role: 'LIABILITY', is_active: true, organizationID },
        { code: '4114', name: 'Por Retener/Entregar - ISLR', dre_role: 'LIABILITY', is_active: true, organizationID },
        { code: '4115', name: 'Por Retener/Entregar - Descuentos por Faltas', dre_role: 'LIABILITY', is_active: true, organizationID },
        { code: '4116', name: 'Por Retener/Entregar - Anticipo Vacacional', dre_role: 'LIABILITY', is_active: true, organizationID },
        { code: '4117', name: 'Por Retener/Entregar - Préstamos Empleados', dre_role: 'LIABILITY', is_active: true, organizationID },
        { code: '4199', name: 'Otras Retenciones por Entregar', dre_role: 'LIABILITY', is_active: true, organizationID },
    ]

    let created = 0
    let updated = 0

    for (const acc of accounts) {
        const result = await AccountingAccountSubcategory.findOneAndUpdate(
            { organizationID: acc.organizationID, code: acc.code },
            { $setOnInsert: acc },
            { upsert: true, new: true, runValidators: true }
        )

        if (result.isNew) created++
        else updated++
    }

    console.log(`✅ AccountSubcategory seeded for organization ${organizationID}: ${created} creadas, ${updated} existentes`)
    return { created, updated }
}

export default seedAccountSubcategories