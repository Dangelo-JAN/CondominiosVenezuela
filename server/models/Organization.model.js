import mongoose from "mongoose";
import { Schema } from "mongoose";

/**
 * Normaliza RIF: elimina caracteres especiales, solo letras y números, uppercase
 * Ej: "J-31418830-5" → "J314188305"
 */
export const sanitizeRif = (rif) => 
    String(rif || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();

const OrganizationSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
    },
    // NUEVO: RIF de la organización (fuente de verdad para PayrollCompany)
    rif: {
        type: String,
        trim: true,
        uppercase: true,
        sparse: true,                    // Permite null/undefined para orgs sin RIF (ej. platform admin)
        unique: true,                    // Único cuando existe
        validate: {
            validator: (v) => !v || /^[A-Z0-9]+$/.test(v),
            message: 'RIF solo debe contener letras y números (sin guiones ni espacios)'
        },
        set: (v) => sanitizeRif(v)       // Auto-limpia al guardar
    },
    // NUEVO: Jerarquía para administradoras (v2)
    parentOrganizationID: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        default: null,
        index: true
    },
    organizationType: {
        type: String,
        enum: ['ADMINISTRADORA', 'EDIFICIO', 'INDEPENDIENTE'],
        default: 'INDEPENDIENTE'
    },
    employees: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee"
        }
    ],
    HRs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "HumanResources"
        }
    ],
    OrganizationURL: {
        type: String,
        required: true,
        unique: true
    },
    OrganizationMail: {
        type: String,
        required: true,
        unique: true
    },
},
    {
        timestamps: true,
    })

// Virtual para obtener organizaciones hijas
OrganizationSchema.virtual('children', {
    ref: 'Organization',
    localField: '_id',
    foreignField: 'parentOrganizationID'
});

// Asegurar que virtuals se incluyan en JSON
OrganizationSchema.set('toJSON', { virtuals: true });
OrganizationSchema.set('toObject', { virtuals: true });

export const Organization = mongoose.model("Organization", OrganizationSchema);