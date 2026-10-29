import { ReceiptType } from '../models/payroll/ReceiptType.model.js'

/**
 * Seed: Tipos de Recibo de Nómina
 */
export const seedReceiptTypes = async (organizationID) => {
    const receiptTypes = [
        { code: 'NORMAL', name: 'Nómina Normal', description: 'Período quincenal/mensual regular', organizationID },
        { code: 'EXTRAORDINARY', name: 'Nómina Extraordinaria', description: 'Pagos extraordinarios (bonos, retroactivos, aguinaldos)', organizationID },
        { code: 'VACATION', name: 'Vacaciones', description: 'Pago de vacaciones y bono vacacional', organizationID },
        { code: 'UTILIDADES', name: 'Utilidades', description: 'Reparto anual de utilidades (15%)', organizationID },
        { code: 'SETTLEMENT', name: 'Liquidación', description: 'Liquidación final de contrato (prestaciones, vacaciones pendientes, etc.)', organizationID },
        { code: 'ADJUSTMENT', name: 'Ajuste', description: 'Ajustes y correcciones de nómina', organizationID },
        { code: 'BONUS', name: 'Bonificación', description: 'Pagos de bonos especiales', organizationID },
        { code: 'RETROACTIVE', name: 'Retroactivo', description: 'Pagos retroactivos por aumento salarial', organizationID }
    ]

    for (const rt of receiptTypes) {
        await ReceiptType.findOneAndUpdate(
            { code: rt.code, organizationID },
            { $setOnInsert: rt },
            { upsert: true, new: true }
        )
    }

    console.log(`✅ ${receiptTypes.length} ReceiptTypes seeded for organization ${organizationID}`)
    return receiptTypes.length
}