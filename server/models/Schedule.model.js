import mongoose from 'mongoose'
import { Schema } from "mongoose"

const TaskSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: null
    },
    starttime: {
        type: String, // formato "HH:mm"
        required: true
    },
    endtime: {
        type: String, // formato "HH:mm"
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    // Fecha UTC en que se marcó como completada (null si está pendiente).
    // Requerido para atribuir completaciones a ventanas de reportes diarios/semanales.
    // Tareas históricas anteriores a este campo quedan con null y se excluyen de ventanas.
    completedAt: {
        type: Date,
        default: null
    }
}, { _id: true })

const DayScheduleSchema = new Schema({
    day: {
        type: String,
        required: true,
        enum: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
    },
    tasks: [TaskSchema]
}, { _id: true })

const ScheduleSchema = new Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Employee"
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: null
    },
    startdate: {
        type: Date,
        required: true
    },
    enddate: {
        type: Date,
        required: true
    },
    schedule: [DayScheduleSchema],
    isactive: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ["active", "closed", "expired"],
        default: "active"
    },
    closedAt: {
        type: Date,
        default: null
    },
    createdby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HumanResources",
        required: true
    },
    organizationID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required: true
    }
}, { timestamps: true })

export const Schedule = mongoose.model("Schedule", ScheduleSchema)
