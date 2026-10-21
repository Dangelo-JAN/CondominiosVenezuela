import { ConnectDB } from '../config/connectDB.js'
import { Organization } from '../models/Organization.model.js'
import { seedPayrollPolicy } from './payroll-policy.seed.js'
import { seedPayrollConcepts } from './payroll-concepts.seed.js'
import { seedReceiptTypes } from './receipt-types.seed.js'
import { seedPayrollCompany } from './payroll-company.seed.js'
import { seedHolidays } from './holidays.seed.js'

/**
 * Seed maestro para el módulo de Nómina Venezolana
 * Ejecuta todos los seeds en orden de dependencia
 */
export const runPayrollSeeds = async () => {
    try {
        console.log('🌱 Iniciando seeds de Nómina Venezolana...')

        // Conectar a la base de datos
        await ConnectDB()

        // Obtener organización por defecto (primera encontrada)
        const org = await Organization.findOne({})
        if (!org) {
            throw new Error('No se encontró ninguna organización. Ejecute first-seed.mjs primero.')
        }

        const organizationID = org._id
        console.log(`📋 Organización: ${org.name} (${organizationID})`)

        // Ejecutar seeds en orden de dependencia
        console.log('\n1️⃣  Seeding ReceiptTypes...')
        await seedReceiptTypes(organizationID)

        console.log('\n2️⃣  Seeding PayrollPolicy...')
        await seedPayrollPolicy(organizationID)

        console.log('\n3️⃣  Seeding PayrollCompany...')
        await seedPayrollCompany(organizationID)

        console.log('\n4️⃣  Seeding PayrollConcepts...')
        await seedPayrollConcepts(organizationID)

        console.log('\n5️⃣  Seeding Holidays...')
        await seedHolidays(organizationID)

        console.log('\n✅ ¡Todos los seeds de nómina completados exitosamente!')
        console.log('📊 Resumen:')
        console.log('   - PayrollPolicy: Parámetros legales venezolanos')
        console.log('   - PayrollCompany: Configuración organizacional')
        console.log('   - ReceiptTypes: 8 tipos de recibo')
        console.log('   - PayrollConcepts: 45+ conceptos (ingresos, deducciones, costos patronales)')
        console.log('   - Holidays: 30 feriados 2024-2025')

        process.exit(0)
    } catch (error) {
        console.error('❌ Error en seeds de nómina:', error)
        process.exit(1)
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    runPayrollSeeds()
}