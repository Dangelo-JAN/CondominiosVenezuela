#!/usr/bin/env node
/**
 * create-indexes.mjs
 * ────────────────────────────────────────────────────────────────────
 * Script para crear/actualizar índices en MongoDB Atlas.
 * Ejecutar en cada deploy para asegurar que todos los índices
 * definidos en los modelos Mongoose estén creados.
 *
 * Uso: node server/scripts/create-indexes.mjs
 * ────────────────────────────────────────────────────────────────────
 */

import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ENV_PATH = resolve(__dirname, '..', '.env')
dotenv.config({ path: ENV_PATH })

import { ConnectDB } from '../config/connectDB.js'
import mongoose from 'mongoose'

// Importar todos los modelos payroll para registrar sus índices
import '../models/payroll/PayrollPeriod.model.js'
import '../models/payroll/PayrollReceipt.model.js'
import '../models/payroll/PayrollReceiptLine.model.js'
import '../models/payroll/PayrollPolicy.model.js'
import '../models/payroll/PayrollCompany.model.js'
import '../models/payroll/PayrollConcept.model.js'
import '../models/payroll/ReceiptType.model.js'
import '../models/payroll/ISLRRetentionTable.model.js'
import '../models/payroll/ISLRRetention.model.js'
import '../models/payroll/SocialBenefitsLedger.model.js'
import '../models/payroll/SocialBenefitsSettlement.model.js'
import '../models/payroll/VacationBalance.model.js'
import '../models/payroll/VacationRequest.model.js'
import '../models/payroll/UtilidadesPayment.model.js'
import '../models/payroll/UtilidadesPeriod.model.js'
import '../models/payroll/PayrollNovelty.model.js'
import '../models/payroll/AdvanceRequest.model.js'
import '../models/payroll/Loan.model.js'
import '../models/payroll/LoanPayment.model.js'
import '../models/payroll/PayrollEmployerCost.model.js'
import '../models/payroll/Holiday.model.js'

// Modelos accounting
import '../models/accounting/AccountSubcategory.model.js'
import '../models/accounting/PayrollJournalDraft.model.js'
import '../models/accounting/PayrollJournalDraftLine.model.js'
import '../models/accounting/ReportMapping.model.js'

async function createIndexes() {
    console.log('🔗 Conectando a MongoDB...')
    await ConnectDB()
    
    console.log('📦 Obteniendo lista de modelos...')
    const modelNames = Object.keys(mongoose.models)
    console.log(`   Modelos encontrados: ${modelNames.length}`)
    
    let totalIndexes = 0
    let createdIndexes = 0
    let errors = 0
    
    for (const modelName of modelNames) {
        const Model = mongoose.models[modelName]
        
        // Solo procesar modelos de nuestro dominio (payroll, accounting, HR)
        const relevantDomains = ['Payroll', 'Account', 'Journal', 'HumanResource', 'Employee', 'Organization', 'Department', 'Schedule', 'Leave', 'Notice', 'Bitacora']
        const isRelevant = relevantDomains.some(d => modelName.includes(d))
        
        if (!isRelevant && !modelName.startsWith('Payroll') && !modelName.startsWith('Account') && !modelName.startsWith('Journal')) {
            continue
        }
        
        console.log(`\n📋 Procesando: ${modelName}`)
        
        try {
            const indexes = Model.schema.indexes()
            
            if (indexes.length === 0) {
                console.log(`   ⏭️  Sin índices definidos`)
                continue
            }
            
            console.log(`   Índices definidos: ${indexes.length}`)
            totalIndexes += indexes.length
            
            // Crear índices uno por uno para mejor reporte
            for (const [indexSpec, options] of indexes) {
                const indexName = options.name || Object.keys(indexSpec).map(k => `${k}_${indexSpec[k]}`).join('_')
                
                try {
                    await Model.collection.createIndex(indexSpec, options)
                    console.log(`   ✅ ${indexName}`)
                    createdIndexes++
                } catch (indexError) {
                    // Si el índice ya existe con diferentes opciones, puede fallar
                    if (indexError.code === 85 || indexError.codeName === 'IndexOptionsConflict') {
                        console.log(`   ⚠️  ${indexName} - Conflicto de opciones (ya existe con distinta config)`)
                        // Intentar dropear y recrear
                        try {
                            await Model.collection.dropIndex(indexName)
                            await Model.collection.createIndex(indexSpec, options)
                            console.log(`   🔄 ${indexName} - Recreado`)
                            createdIndexes++
                        } catch (dropError) {
                            console.log(`   ❌ ${indexName} - No se pudo recrear: ${dropError.message}`)
                            errors++
                        }
                    } else {
                        console.log(`   ❌ ${indexName} - Error: ${indexError.message}`)
                        errors++
                    }
                }
            }
            
        } catch (modelError) {
            console.log(`   ❌ Error en modelo: ${modelError.message}`)
            errors++
        }
    }
    
    // Resumen final
    console.log('\n' + '='.repeat(50))
    console.log('📊 RESUMEN DE ÍNDICES')
    console.log('='.repeat(50))
    console.log(`   Modelos procesados: ${modelNames.filter(m => relevantDomains.some(d => m.includes(d))).length}`)
    console.log(`   Total índices definidos: ${totalIndexes}`)
    console.log(`   ✅ Creados/Actualizados: ${createdIndexes}`)
    console.log(`   ❌ Errores: ${errors}`)
    
    if (errors > 0) {
        console.log('\n⚠️  Hubo errores. Revisar logs arriba.')
        process.exit(1)
    } else {
        console.log('\n✅ Todos los índices creados correctamente.')
        process.exit(0)
    }
}

// Ejecutar
createIndexes().catch(err => {
    console.error('💥 Error fatal:', err)
    process.exit(1)
})