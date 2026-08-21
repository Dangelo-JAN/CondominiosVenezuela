import mongoose from 'mongoose'
import { Schema } from "mongoose"

// ── Actividad individual serializada dentro del snapshot ───────────────────
// Clona los datos de la actividad en el momento del cierre. Si la fuente
// original (bitácora, foto, tarea) se edita o borra después, el snapshot
// NO cambia (inmutabilidad garantizada por diseño).
const SnapshotActivitySchema = new Schema({
    type: {
        type: String,
        required: true,
        enum: ["bitacora", "task_completed", "work_photo", "attendance"]
    },
    refId: { type: Schema.Types.ObjectId, default: null },   // referencia original (informativa)
    title: { type: String, default: "" },
    description: { type: String, default: null },
    date: { type: Date, required: true },                    // fecha UTC de la actividad
    meta: { type: Schema.Types.Mixed, default: null }        // duración, urls, día de semana, etc.
}, { _id: false })

const SnapshotTotalsSchema = new Schema({
    bitacoras: { type: Number, default: 0 },
    tasksCompleted: { type: Number, default: 0 },
    workPhotos: { type: Number, default: 0 },
    checkIns: { type: Number, default: 0 },
    totalMinutes: { type: Number, default: 0 }               // minutos trabajados (asistencia)
}, { _id: false })

// ── Resumen por empleado dentro del snapshot ───────────────────────────────
const EmployeeWeekSummarySchema = new Schema({
    employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    employeeName: { type: String, required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department", default: null },
    departmentName: { type: String, default: null },
    totals: { type: SnapshotTotalsSchema, default: () => ({}) },
    activities: [SnapshotActivitySchema]
}, { _id: false })

// ── Resumen por departamento ───────────────────────────────────────────────
const DepartmentWeekSummarySchema = new Schema({
    departmentId: { type: Schema.Types.ObjectId, ref: "Department", default: null },
    departmentName: { type: String, default: "Sin departamento" },
    totals: { type: SnapshotTotalsSchema, default: () => ({}) }
}, { _id: false })

// ── Snapshot semanal inmutable ─────────────────────────────────────────────
// Generado por cron los lunes 07:00 UTC (03:00 AM Caracas) cerrando la semana
// anterior (Lun 00:00 → Dom 23:59:59.999 UTC). Upsert idempotente mediante
// índice único {organizationID, isoYear, weekNumber}.
const WeeklyReportSnapshotSchema = new Schema({
    organizationID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required: true,
        index: true
    },
    isoYear: { type: Number, required: true },
    weekNumber: { type: Number, required: true },
    weekStart: { type: Date, required: true },   // lunes 00:00 UTC
    weekEnd: { type: Date, required: true },     // domingo 23:59:59.999 UTC
    status: {
        type: String,
        enum: ["closed"],
        default: "closed"
    },
    closedAt: { type: Date, default: Date.now },
    closedBy: { type: String, default: "cron" }, // 'cron' | ObjectId de HR (cierre manual futuro)
    totals: { type: SnapshotTotalsSchema, default: () => ({}) },
    byDepartment: [DepartmentWeekSummarySchema],
    employeesResumen: [EmployeeWeekSummarySchema]
}, { timestamps: true })

// Idempotencia: un solo snapshot por organización/semana ISO
WeeklyReportSnapshotSchema.index(
    { organizationID: 1, isoYear: 1, weekNumber: 1 },
    { unique: true }
)

export const WeeklyReportSnapshot = mongoose.model("WeeklyReportSnapshot", WeeklyReportSnapshotSchema)
