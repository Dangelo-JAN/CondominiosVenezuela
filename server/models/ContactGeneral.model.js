import mongoose from 'mongoose'
import { Schema } from "mongoose"

const ContactGeneralSchema = new Schema({
    inquiryType: {
        type: String,
        required: true,
        enum: [
            "Administrador de condominio",
            "Residente",
            "Proveedor",
            "Soporte técnico",
            "Ventas/Demo",
            "Alianzas estratégicas",
            "Otro"
        ]
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator: function (value) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            },
            message: 'Formato de correo electrónico inválido'
        }
    },
    phone: {
        type: String,
        trim: true
    },
    companyName: {
        type: String,
        required: true,
        trim: true
    },
    website: {
        type: String,
        trim: true
    },
    country: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    privacyAccepted: {
        type: Boolean,
        required: true,
        default: false
    }
}, { timestamps: true })

export const ContactGeneral = mongoose.model("ContactGeneral", ContactGeneralSchema)
