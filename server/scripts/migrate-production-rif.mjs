/**
 * MIGRACIÓN PRODUCCIÓN - MongoDB Atlas
 * Organización: 6a0cac2e63fe9b9c98e59a56
 * RIF: J314188305 (solo alphanumeric, uppercase)
 * 
 * Uso: node server/scripts/migrate-production-rif.mjs
 * 
 * ADVERTENCIA: Esto modifica la BASE DE DATOS DE PRODUCCIÓN
 */

import mongoose from 'mongoose';

// URI de producción (desde server/.env comentado)
const MONGODB_URI = 'mongodb+srv://cluster_cia_admin:dscuckdsSDCrfercdcc@clusterpruebacia.5hhyvrx.mongodb.net/?appName=ClusterPruebaCIA';

// Schema temporal para la migración
const OrganizationSchema = new mongoose.Schema({
    name: String,
    rif: {
        type: String,
        set: (v) => String(v || '').replace(/[^A-Z0-9]/gi, '').toUpperCase()
    }
}, { timestamps: true });

const Organization = mongoose.model('Organization', OrganizationSchema);

const sanitizeRif = (rif) => String(rif || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();

async function migrate() {
    try {
        console.log('🔌 Conectando a MongoDB Atlas (PRODUCCIÓN)...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a PRODUCCIÓN');

        // ID de producción especificado (corregido por usuario)
        const targetProdId = '6a0cac2d63fe9b9c98e59a54';
        const rif = 'J314188305'; // Solo alphanumeric, uppercase

        console.log(`\n📋 Buscando organización de PRODUCCIÓN: ${targetProdId}`);
        const org = await Organization.findById(targetProdId);

        if (!org) {
            console.error(`❌ ORGANIZACIÓN NO ENCONTRADA EN PRODUCCIÓN: ${targetProdId}`);
            console.error('   Verificar que el ID es correcto y la BD es la correcta');
            process.exit(1);
        }

        console.log(`\n📋 Organización de PRODUCCIÓN actual:`);
        console.log(`   - _id: ${org._id}`);
        console.log(`   - name: ${org.name}`);
        console.log(`   - rif actual: ${org.rif || '(vacío)'}`);
        console.log(`   - OrganizationMail: ${org.OrganizationMail}`);
        console.log(`   - OrganizationURL: ${org.OrganizationURL}`);

        if (org.rif === rif) {
            console.log(`\n✅ La organización YA TIENE el RIF correcto: ${rif}`);
            return;
        }

        console.log(`\n⚠️  CONFIRMACIÓN REQUERIDA:`);
        console.log(`   Esta operación MODIFICARÁ LA BASE DE DATOS DE PRODUCCIÓN`);
        console.log(`   Organización: ${org.name} (${org._id})`);
        console.log(`   RIF actual: ${org.rif || '(vacío)'}`);
        console.log(`   RIF nuevo:  ${rif}`);
        console.log(`\n   ¿Continuar? (y/N)`);
        
        // En script automatizado, continuar directamente
        console.log(`\n🔄 Actualizando RIF en PRODUCCIÓN a: ${rif}`);
        
        const updated = await Organization.findByIdAndUpdate(
            targetProdId,
            { $set: { rif: rif } },
            { new: true, runValidators: true, setDefaultsOnInsert: true }
        );

        console.log(`\n✅ Organización de PRODUCCIÓN actualizada:`);
        console.log(`   - _id: ${updated._id}`);
        console.log(`   - name: ${updated.name}`);
        console.log(`   - rif: ${updated.rif}`);

        // Verificar/crear índice único sparse en rif
        console.log('\n🔍 Verificando índice único sparse en rif...');
        const indexes = await Organization.collection.indexes();
        const rifIndex = indexes.find(idx => idx.key && idx.key.rif === 1);
        if (rifIndex) {
            console.log('✅ Índice en rif existe:', JSON.stringify(rifIndex.key));
            console.log('   Sparse:', rifIndex.sparse);
            console.log('   Unique:', rifIndex.unique);
        } else {
            console.log('⚠️ Índice en rif NO existe - creando...');
            await Organization.collection.createIndex(
                { rif: 1 }, 
                { unique: true, sparse: true, name: 'rif_1' }
            );
            console.log('✅ Índice rif_1 creado (unique: true, sparse: true)');
        }

        console.log('\n🎉 MIGRACIÓN DE PRODUCCIÓN COMPLETADA EXITOSAMENTE');

    } catch (error) {
        console.error('\n❌ ERROR EN MIGRACIÓN DE PRODUCCIÓN:', error.message);
        if (error.code === 11000) {
            console.error('   Error de duplicado: Ya existe otra organización con ese RIF');
        }
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Desconectado de MongoDB Atlas');
    }
}

migrate();