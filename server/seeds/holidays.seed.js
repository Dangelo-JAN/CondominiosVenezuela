import { Holiday } from '../models/payroll/Holiday.model.js'

/**
 * Seed: Feriados Nacionales de Venezuela 2024-2025
 * Basado en el calendario oficial de días feriados bancarios y laborales
 */
export const seedHolidays = async (organizationID) => {
    const holidays = [
        // 2024
        { date: '2024-01-01', name: 'Año Nuevo', type: 'NACIONAL', is_recurring: true, organizationID },
        { date: '2024-02-12', name: 'Carnaval', type: 'NACIONAL', is_recurring: false, organizationID },
        { date: '2024-02-13', name: 'Carnaval', type: 'NACIONAL', is_recurring: false, organizationID },
        { date: '2024-03-28', name: 'Jueves Santo', type: 'RELIGIOSO', is_recurring: false, organizationID },
        { date: '2024-03-29', name: 'Viernes Santo', type: 'RELIGIOSO', is_recurring: false, organizationID },
        { date: '2024-04-19', name: 'Declaración de la Independencia', type: 'NACIONAL', is_recurring: true, organizationID },
        { date: '2024-05-01', name: 'Día del Trabajador', type: 'NACIONAL', is_recurring: true, organizationID },
        { date: '2024-06-24', name: 'Batalla de Carabobo / Día del Ejército', type: 'NACIONAL', is_recurring: true, organizationID },
        { date: '2024-07-05', name: 'Día de la Independencia', type: 'NACIONAL', is_recurring: true, organizationID },
        { date: '2024-07-24', name: 'Natalicio de Simón Bolívar', type: 'NACIONAL', is_recurring: true, organizationID },
        { date: '2024-10-12', name: 'Día de la Resistencia Indígena', type: 'NACIONAL', is_recurring: true, organizationID },
        { date: '2024-11-18', name: 'Día de la Virgen del Rosario de Chiquinquirá', type: 'RELIGIOSO', is_recurring: true, region: 'ZULIA', organizationID },
        { date: '2024-12-24', name: 'Nochebuena', type: 'RELIGIOSO', is_recurring: true, organizationID },
        { date: '2024-12-25', name: 'Navidad', type: 'RELIGIOSO', is_recurring: true, organizationID },
        { date: '2024-12-31', name: 'Fin de Año', type: 'NACIONAL', is_recurring: true, organizationID },

        // 2025
        { date: '2025-01-01', name: 'Año Nuevo', type: 'NACIONAL', is_recurring: true, organizationID },
        { date: '2025-03-03', name: 'Carnaval', type: 'NACIONAL', is_recurring: false, organizationID },
        { date: '2025-03-04', name: 'Carnaval', type: 'NACIONAL', is_recurring: false, organizationID },
        { date: '2025-04-17', name: 'Jueves Santo', type: 'RELIGIOSO', is_recurring: false, organizationID },
        { date: '2025-04-18', name: 'Viernes Santo', type: 'RELIGIOSO', is_recurring: false, organizationID },
        { date: '2025-04-19', name: 'Declaración de la Independencia', type: 'NACIONAL', is_recurring: true, organizationID },
        { date: '2025-05-01', name: 'Día del Trabajador', type: 'NACIONAL', is_recurring: true, organizationID },
        { date: '2025-06-24', name: 'Batalla de Carabobo / Día del Ejército', type: 'NACIONAL', is_recurring: true, organizationID },
        { date: '2025-07-05', name: 'Día de la Independencia', type: 'NACIONAL', is_recurring: true, organizationID },
        { date: '2025-07-24', name: 'Natalicio de Simón Bolívar', type: 'NACIONAL', is_recurring: true, organizationID },
        { date: '2025-10-12', name: 'Día de la Resistencia Indígena', type: 'NACIONAL', is_recurring: true, organizationID },
        { date: '2025-11-18', name: 'Día de la Virgen del Rosario de Chiquinquirá', type: 'RELIGIOSO', is_recurring: true, region: 'ZULIA', organizationID },
        { date: '2025-12-24', name: 'Nochebuena', type: 'RELIGIOSO', is_recurring: true, organizationID },
        { date: '2025-12-25', name: 'Navidad', type: 'RELIGIOSO', is_recurring: true, organizationID },
        { date: '2025-12-31', name: 'Fin de Año', type: 'NACIONAL', is_recurring: true, organizationID }
    ]

    for (const holiday of holidays) {
        await Holiday.findOneAndUpdate(
            { date: holiday.date, organizationID },
            { $setOnInsert: holiday },
            { upsert: true, new: true }
        )
    }

    console.log(`✅ ${holidays.length} Holidays seeded for organization ${organizationID}`)
    return holidays.length
}