import mongoose from 'mongoose'
import { Schema } from "mongoose"

const WorkPhotoSchema = new Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Employee"
    },
    // URL de la imagen (Cloudinary, S3, etc.)
    photourl: {
        type: String,
        required: true
    },
    // ID público para poder eliminarla del servicio de almacenamiento
    publicid: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: null
    },
    // Fecha de la jornada a la que corresponde la foto (seleccionada por el usuario)
    workdate: {
        type: Date,
        required: true
    },
    // Fecha real de captura de la foto (extraída de metadata EXIF)
    captureDate: {
        type: Date,
        required: false // Se hace obligatorio en el controller
    },
    // Ubicación GPS de la foto (extraída de metadata EXIF - opcional)
    gpsLocation: {
        lat: { type: Number, default: null },
        lng: { type: Number, default: null }
    },
    // HR puede marcar la foto como vista
    reviewedby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HumanResources",
        default: null
    },
    reviewedat: {
        type: Date,
        default: null
    },
    organizationID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required: true
    }
}, { timestamps: true })

export const WorkPhoto = mongoose.model("WorkPhoto", WorkPhotoSchema)
