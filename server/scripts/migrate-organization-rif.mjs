/**
 * Migración: Agregar RIF a organización existente
 * Organización objetivo: 6a0cac2e63fe9b9c98e59a56 (producción) o primera org local
 * RIF: J314188305 (solo alphanumeric, uppercase)
 * 
 * Uso: node server/scripts/migrate-organization-rif.mjs
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/condove_local';

// Schema temporal para la migración
const OrganizationSchema = new mongoose.Schema({
    name: String,
    rif: {
        type: String,
        set: (v) => String(v || '').replace(/[^A-Z0-9]/gi, '').toUpperCase()
    }
}, { timestamps: true });

const Organization = mongoose.model('Organization', OrganizationSchema);

async function migrate() {
    try {
        console.log('🔌 Conectando a MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado');

        // ID de producción especificado por el usuario
        const targetProdId = '6a0cac2e63fe9b9c98e59a56';
        const rif = 'J314188305'; // Solo alphanumeric, uppercase

        console.log(`\n📋 Buscando organización de producción: ${targetProdId}`);
        let org = await Organization.findById(targetProdId);

        if (!org) {
            console.log(`⚠️ Organización de producción no encontrada en esta BD`);
            console.log(`📋 Buscando primera organización disponible en BD local...`);
            org = await Organization.findOne().sort({ createdAt: 1 });
            
            if (!org) {
                console.error(`❌ No hay organizaciones en la base de datos`);
                process.exit(1);
            }
            console.log(`✅ Usando organización local: ${org._id} (${org.name})`);
        } else {
            console.log(`✅ Organización de producción encontrada`);
        }

        console.log(`\n📋 Organización a actualizar:`);
        console.log(`   - _id: ${org._id}`);
        console.log(`   - name: ${org.name}`);
        console.log(`   - rif actual: ${org.rif || '(vacío)'}`);

        if (org.rif === rif) {
            console.log(`\n✅ La organización ya tiene el RIF correcto: ${rif}`);
            return;
        }

        console.log(`\n🔄 Actualizando RIF a: ${rif}`);
        
        // Usar findByIdAndUpdate para activar el setter
        const updated = await Organization.findByIdAndUpdate(
            org._id,
            { $set: { rif: rif } },
            { new: true, runValidators: true, setDefaultsOnInsert: true }
        );

        console.log(`\n✅ Organización actualizada:`);
        console.log(`   - _id: ${updated._id}`);
        console.log(`   - name: ${updated.name}`);
        console.log(`   - rif: ${updated.rif}`);

        // Verificar índice único
        console.log('\n🔍 Verificando índice único sparse en rif...');
        const indexes = await Organization.collection.indexes();
        const rifIndex = indexes.find(idx => idx.key.rif === 1);
        if (rifIndex) {
            console.log('✅ Índice en rif existe:', JSON.stringify(rifIndex.key));
            console.log('   Sparse:', rifIndex.sparse);
            console.log('   Unique:', rifIndex.unique);
        } else {
            console.log('⚠️ Índice en rif no encontrado (se creará al reiniciar con create-indexes.mjs)');
        }

        console.log('\n🎉 Migración completada exitosamente');

    } catch (error) {
        console.error('\n❌ Error en migración:', error.message);
        if (error.code === 11000) {
            console.error('   Error de duplicado: Ya existe otra organización con ese RIF');
        }
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Desconectado de MongoDB');
    }
}

migrate();