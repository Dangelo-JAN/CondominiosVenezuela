import mongoose from 'mongoose'
import { Schema } from "mongoose"

const AttendanceSchema = new Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Employee"
    },
    status: {
        type: String,
        required: true,
        enum: ['Present', 'Absent', 'Not Specified']
    },
    attendancelog: [
        {
            logdate: {
                type: Date,
                required: true
            },
            logstatus: {
                type: String,
                required: true,
                enum: ['Present', 'Absent', 'Not Specified']
            },
            // ✅ NUEVO — hora de entrada (null = no ha marcado)
            checkin: {
                type: Date,
                default: null
            },
            // ✅ NUEVO — hora de salida (null = no ha salido)
            checkout: {
                type: Date,
                default: null
            },
            // ✅ NUEVO — duración en minutos (calculada al hacer checkout)
            duration: {
                type: Number,
                default: null
            }
        }
    ],
    organizationID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization"
    }
}, { timestamps: true })

// Índice para reportes: asistencia por organización + empleado
AttendanceSchema.index({ organizationID: 1, employee: 1 })

export const Attendance = mongoose.model("Attendance", AttendanceSchema)
