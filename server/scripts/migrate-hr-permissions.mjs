/**
 * Migración idempotente: Sincronizar permissions con role actual
 * Ejecutar: node server/scripts/migrate-hr-permissions.mjs
 * Seguro para re-ejecutar: solo actualiza si difieren
 */

import mongoose from 'mongoose';
import { HumanResources, DEFAULT_PERMISSIONS, CARGO_TO_ROLE } from '../models/HR.model.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://cluster_cia_admin:dscuckdsSDCrfercdcc@clusterpruebacia.5hhyvrx.mongodb.net/?appName=ClusterPruebaCIA';

async function migrate() {
    await mongoose.connect(MONGODB_URI);
    console.log('[MIGRATE] Conectado a MongoDB');

    const hrs = await HumanResources.find({}).select('firstname lastname role cargo permissions');
    console.log(`[MIGRATE] Encontrados ${hrs.length} usuarios HR`);

    let updated = 0;
    let unchanged = 0;

    for (const hr of hrs) {
        const targetRole = hr.role || (hr.cargo ? CARGO_TO_ROLE[hr.cargo] : 'HR-Admin');
        const targetPermissions = DEFAULT_PERMISSIONS[targetRole] || DEFAULT_PERMISSIONS['HR-Admin'];

        // Comparar permissions actuales vs target (deep compare simplificado)
        const currentPayroll = hr.permissions?.payroll || {};
        const targetPayroll = targetPermissions.payroll || {};

        const needsUpdate = 
            currentPayroll.create !== targetPayroll.create ||
            currentPayroll.read !== targetPayroll.read ||
            currentPayroll.update !== targetPayroll.update ||
            currentPayroll.delete !== targetPayroll.delete;

        // Verificar todos los módulos (no solo payroll)
        const modules = Object.keys(targetPermissions);
        let anyDiff = needsUpdate;
        for (const mod of modules) {
            const curr = hr.permissions?.[mod] || {};
            const targ = targetPermissions[mod];
            if (curr.create !== targ.create || curr.read !== targ.read || 
                curr.update !== targ.update || curr.delete !== targ.delete) {
                anyDiff = true;
                break;
            }
        }

        if (anyDiff) {
            hr.permissions = targetPermissions;
            await hr.save();
            console.log(`[MIGRATE] ✅ Actualizado: ${hr.firstname} ${hr.lastname} (${hr.cargo} → ${targetRole})`);
            updated++;
        } else {
            console.log(`[MIGRATE] ⏭️  Sin cambios: ${hr.firstname} ${hr.lastname} (${targetRole})`);
            unchanged++;
        }
    }

    console.log(`\n[MIGRATE] Resumen: ${updated} actualizados, ${unchanged} sin cambios`);
    await mongoose.disconnect();
    console.log('[MIGRATE] Desconectado');
}

migrate().catch(err => {
    console.error('[MIGRATE] ERROR:', err);
    process.exit(1);
});