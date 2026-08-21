import mongoose from "mongoose"
import { Bitacora } from "../models/Bitacora.model.js"
import { Employee } from "../models/Employee.model.js"
import { Schedule } from "../models/Schedule.model.js"
import { WorkPhoto } from "../models/WorkPhoto.model.js"
import { Attendance } from "../models/Attendance.model.js"
import { Department } from "../models/Department.model.js"
import { WeeklyReportSnapshot } from "../models/WeeklyReportSnapshot.model.js"
import {
    getReportWindow,
    getPreviousClosedWeek,
    getISOWeek,
    mondayOfUTCWeek,
    addUTCDays,
    startOfUTCDay,
    REPORT_MODES
} from "../utils/reportWindow.util.js"

const DAYS_ES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

// ════════════════════════════════════════════════════════════════════════
// LÓGICA PURA (exportada para testing — `now` inyectable, sin HTTP)
// ════════════════════════════════════════════════════════════════════════

/**
 * Resuelve los empleados del scope de consulta.
 * - HR (departmentID = null): todos los empleados activos de la organización.
 * - Empleado (departmentID): solo empleados activos del mismo departamento.
 * @returns {Promise<Array>} empleados con department poblado
 */
async function resolveScopedEmployees(orgID, departmentID) {
    const filter = { organizationID: orgID, isactive: true }
    if (departmentID) filter.department = departmentID
    return Employee.find(filter)
        .select("_id firstname lastname department")
        .populate("department", "name")
}

/**
 * Recopila las 4 fuentes de actividad dentro de una ventana UTC.
 * @param {Object} p
 * @param {string|ObjectId} p.orgID
 * @param {Array<ObjectId>} p.empIds  ids de empleados del scope
 * @param {Date} p.start inicio ventana (inclusive)
 * @param {Date} p.end   fin ventana (inclusive)
 */
async function collectRawActivities({ orgID, empIds, start, end }) {
    const orgObjID = new mongoose.Types.ObjectId(String(orgID))

    // ── 1. Bitácoras (novedades) por fecha de creación ────────────────────
    const bitacoras = await Bitacora.find({
        organizationID: orgID,
        isDeleted: false,
        employee: { $in: empIds },
        createdAt: { $gte: start, $lte: end }
    })
        .select("title content createdAt employee images videos")
        .lean()

    // ── 2. Tareas completadas por completedAt (agregación sobre array anidado) ──
    const tasksCompleted = await Schedule.aggregate([
        { $match: { organizationID: orgObjID, employee: { $in: empIds } } },
        { $unwind: "$schedule" },
        { $unwind: "$schedule.tasks" },
        {
            $match: {
                "schedule.tasks.completed": true,
                "schedule.tasks.completedAt": { $ne: null, $gte: start, $lte: end }
            }
        },
        {
            $project: {
                _id: 0,
                employee: "$employee",
                taskId: "$schedule.tasks._id",
                title: "$schedule.tasks.title",
                dayName: "$schedule.day",
                starttime: "$schedule.tasks.starttime",
                endtime: "$schedule.tasks.endtime",
                completedAt: "$schedule.tasks.completedAt"
            }
        }
    ])

    // ── 3. Fotos de trabajo por workdate (se guarda a mediodía del día declarado) ──
    const workPhotos = await WorkPhoto.find({
        organizationID: orgID,
        employee: { $in: empIds },
        workdate: { $gte: start, $lte: end }
    })
        .select("description workdate photourl employee")
        .lean()

    // ── 4. Asistencia: check-ins dentro de la ventana ($filter sobre subdocs) ──
    const attendanceLogs = await Attendance.aggregate([
        { $match: { organizationID: orgObjID, employee: { $in: empIds } } },
        {
            $project: {
                _id: 0,
                employee: 1,
                logs: {
                    $filter: {
                        input: "$attendancelog",
                        as: "log",
                        cond: {
                            $and: [
                                { $ne: ["$$log.checkin", null] },
                                { $gte: ["$$log.checkin", start] },
                                { $lte: ["$$log.checkin", end] }
                            ]
                        }
                    }
                }
            }
        },
        { $unwind: "$logs" },
        { $replaceWith: { employee: "$employee", log: "$logs" } }
    ])

    return { bitacoras, tasksCompleted, workPhotos, attendanceLogs }
}

/**
 * Construye el reporte consolidado de una ventana: actividades por empleado,
 * totales globales y desglose por departamento.
 * FUNCIÓN PURA (sin HTTP) — testeable directamente.
 *
 * @param {Object} p
 * @param {string|ObjectId} p.orgID
 * @param {string|ObjectId|null} p.departmentID  null = toda la organización (vista HR)
 * @param {Date} p.start
 * @param {Date} p.end
 * @returns {Promise<Object>} { employees, totals, byDepartment }
 */
export async function buildLiveReport({ orgID, departmentID = null, start, end }) {
    const employees = await resolveScopedEmployees(orgID, departmentID)
    const empMap = new Map(employees.map(e => [String(e._id), e]))
    const empIds = employees.map(e => e._id)

    const emptyResult = { employees: [], totals: emptyTotals(), byDepartment: [] }
    if (empIds.length === 0) return emptyResult

    const raw = await collectRawActivities({ orgID, empIds, start, end })

    // ── Normalizar a lista unificada de actividades por empleado ──────────
    const perEmployee = new Map()   // empId -> { info, activities[], totals }
    for (const emp of employees) {
        perEmployee.set(String(emp._id), {
            info: {
                employee: emp._id,
                employeeName: `${emp.firstname} ${emp.lastname}`,
                departmentId: emp.department?._id ?? null,
                departmentName: emp.department?.name ?? "Sin departamento"
            },
            activities: [],
            totals: emptyTotals()
        })
    }

    const pushActivity = (empRef, activity) => {
        const entry = perEmployee.get(String(empRef))
        if (!entry) return   // empleado inactivo/eliminado tras crear la actividad: se ignora
        entry.activities.push(activity)
    }

    for (const b of raw.bitacoras) {
        pushActivity(b.employee, {
            type: "bitacora",
            refId: b._id,
            title: b.title,
            description: b.content?.slice(0, 300) ?? null,
            date: b.createdAt,
            meta: { images: b.images?.length ?? 0, videos: b.videos?.length ?? 0 }
        })
    }

    for (const t of raw.tasksCompleted) {
        pushActivity(t.employee, {
            type: "task_completed",
            refId: t.taskId,
            title: t.title,
            description: null,
            date: t.completedAt,
            meta: { dayName: t.dayName, starttime: t.starttime, endtime: t.endtime }
        })
    }

    for (const p of raw.workPhotos) {
        pushActivity(p.employee, {
            type: "work_photo",
            refId: p._id,
            title: p.description || "Foto de trabajo",
            description: p.description,
            date: p.workdate,
            meta: { photourl: p.photourl }
        })
    }

    for (const a of raw.attendanceLogs) {
        pushActivity(a.employee, {
            type: "attendance",
            refId: null,
            title: "Jornada laboral",
            description: null,
            date: a.log.checkin,
            meta: {
                checkout: a.log.checkout,
                durationMinutes: a.log.duration ?? null,
                logstatus: a.log.logstatus
            }
        })
    }

    // ── Totales por empleado + agrupación por departamento ────────────────
    const byDepartment = new Map()
    const grandTotals = emptyTotals()

    const resultEmployees = []
    for (const [, entry] of perEmployee) {
        for (const act of entry.activities) {
            if (act.type === "bitacora") entry.totals.bitacoras += 1
            else if (act.type === "task_completed") entry.totals.tasksCompleted += 1
            else if (act.type === "work_photo") entry.totals.workPhotos += 1
            else if (act.type === "attendance") {
                entry.totals.checkIns += 1
                entry.totals.totalMinutes += act.meta.durationMinutes ?? 0
            }
        }

        resultEmployees.push({ ...entry.info, totals: entry.totals, activities: sortActivities(entry.activities) })

        grandTotals.bitacoras += entry.totals.bitacoras
        grandTotals.tasksCompleted += entry.totals.tasksCompleted
        grandTotals.workPhotos += entry.totals.workPhotos
        grandTotals.checkIns += entry.totals.checkIns
        grandTotals.totalMinutes += entry.totals.totalMinutes

        const deptKey = String(entry.info.departmentId ?? "none")
        if (!byDepartment.has(deptKey)) {
            byDepartment.set(deptKey, {
                departmentId: entry.info.departmentId,
                departmentName: entry.info.departmentName,
                totals: emptyTotals()
            })
        }
        const dept = byDepartment.get(deptKey)
        dept.totals.bitacoras += entry.totals.bitacoras
        dept.totals.tasksCompleted += entry.totals.tasksCompleted
        dept.totals.workPhotos += entry.totals.workPhotos
        dept.totals.checkIns += entry.totals.checkIns
        dept.totals.totalMinutes += entry.totals.totalMinutes
    }

    return {
        employees: resultEmployees.sort((a, b) => b.totals.bitacoras - a.totals.bitacoras),
        totals: grandTotals,
        byDepartment: Array.from(byDepartment.values())
    }
}

function emptyTotals() {
    return { bitacoras: 0, tasksCompleted: 0, workPhotos: 0, checkIns: 0, totalMinutes: 0 }
}

function sortActivities(activities) {
    return [...activities].sort((a, b) => new Date(b.date) - new Date(a.date))
}

/**
 * Construye el payload completo del reporte vigente según la matriz temporal.
 * FUNCIÓN PURA — `now` inyectable para tests.
 *
 * @param {Object} p
 * @param {string|ObjectId} p.orgID
 * @param {string|ObjectId|null} p.departmentID
 * @param {Date} [p.now]
 */
export async function buildCurrentReportPayload({ orgID, departmentID = null, now = new Date() }) {
    const w = getReportWindow(now)

    const daily = w.dailyWindow
        ? await buildLiveReport({ orgID, departmentID, start: w.dailyWindow.start, end: w.dailyWindow.end })
        : null

    const weekly = w.weeklyWindow
        ? await buildLiveReport({ orgID, departmentID, start: w.weeklyWindow.start, end: w.weeklyWindow.end })
        : null

    return {
        mode: w.mode,
        generatedAt: now,
        dayLabel: DAYS_ES[w.referenceDate.getUTCDay()],
        dailyWindow: w.dailyWindow
            ? { start: w.dailyWindow.start, end: w.dailyWindow.end, label: w.dailyLabelDay }
            : null,
        weeklyWindow: w.weeklyWindow
            ? {
                start: w.weeklyWindow.start,
                end: w.weeklyWindow.end,
                weekNumber: w.currentWeek.week,
                isoYear: w.currentWeek.isoYear
            }
            : null,
        // Banner preliminar Vie–Dom (spec UX aprobada en #035)
        banner: w.mode === REPORT_MODES.WEEKLY_LIVE
            ? {
                type: "preliminary",
                message: "Reporte preliminar de la semana. Incluye actividades en desarrollo del fin de semana. Cierre oficial: lunes 3:00 AM."
            }
            : null,
        daily,
        weekly,
        previousWeek: w.previousWeek
    }
}

/**
 * Genera (o regenera idempotentemente) el snapshot inmutable de la última
 * semana completada para una organización.
 * FUNCIÓN PURA — `now` inyectable para tests.
 *
 * @param {Object} p
 * @param {string|ObjectId} p.orgID
 * @param {Date} [p.now]
 * @param {string} [p.closedBy]
 * @returns {Promise<{snapshot: Object, alreadyExisted: boolean}>}
 */
export async function closePreviousWeekSnapshot({ orgID, now = new Date(), closedBy = "cron" }) {
    const { start, end, week, isoYear } = getPreviousClosedWeek(now)

    const existing = await WeeklyReportSnapshot.findOne({
        organizationID: orgID,
        isoYear,
        weekNumber: week
    })

    const report = await buildLiveReport({ orgID, departmentID: null, start, end })

    const snapshot = await WeeklyReportSnapshot.findOneAndUpdate(
        { organizationID: orgID, isoYear, weekNumber: week },
        {
            $set: {
                weekStart: start,
                weekEnd: end,
                status: "closed",
                closedAt: existing?.closedAt ?? now,
                closedBy,
                totals: report.totals,
                byDepartment: report.byDepartment,
                employeesResumen: report.employees
            }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    return { snapshot, alreadyExisted: Boolean(existing) }
}

// ════════════════════════════════════════════════════════════════════════
// HANDLERS HTTP (wrappers finos)
// ════════════════════════════════════════════════════════════════════════

// GET /api/v1/report/current — HR: reporte vigente de TODA la organización
export const HandleGetCurrentReport = async (req, res) => {
    try {
        const data = await buildCurrentReportPayload({ orgID: req.ORGID })
        res.set("Cache-Control", "no-cache, no-store, must-revalidate")
        return res.status(200).json({ success: true, message: "Reporte generado exitosamente", data })
    } catch (error) {
        console.error("[ERROR] HandleGetCurrentReport:", error.message)
        return res.status(500).json({ success: false, message: error.message })
    }
}

// GET /api/v1/report/my-report — Empleado: reporte de SU departamento
// Fallback: si el empleado no tiene departamento asignado, ve solo SUS actividades.
export const HandleGetMyReport = async (req, res) => {
    try {
        const employee = await Employee.findOne({
            _id: req.EMPID,
            organizationID: req.ORGID
        }).select("_id department")

        if (!employee) {
            return res.status(404).json({ success: false, message: "Empleado no encontrado" })
        }

        const data = await buildCurrentReportPayload({
            orgID: req.ORGID,
            departmentID: employee.department ?? null
        })

        // Sin departamento: restringir adicionalmente al propio empleado
        if (!employee.department && data.daily) filterToSelf(data.daily, req.EMPID)
        if (!employee.department && data.weekly) filterToSelf(data.weekly, req.EMPID)

        res.set("Cache-Control", "no-cache, no-store, must-revalidate")
        return res.status(200).json({ success: true, message: "Reporte generado exitosamente", data })
    } catch (error) {
        console.error("[ERROR] HandleGetMyReport:", error.message)
        return res.status(500).json({ success: false, message: error.message })
    }
}

function filterToSelf(reportData, empID) {
    reportData.employees = reportData.employees.filter(e => String(e.employee) === String(empID))
    recalcTotals(reportData)
}

function recalcTotals(reportData) {
    const t = emptyTotals()
    const byDept = new Map()
    for (const emp of reportData.employees) {
        t.bitacoras += emp.totals.bitacoras
        t.tasksCompleted += emp.totals.tasksCompleted
        t.workPhotos += emp.totals.workPhotos
        t.checkIns += emp.totals.checkIns
        t.totalMinutes += emp.totals.totalMinutes
        const key = String(emp.departmentId ?? "none")
        if (!byDept.has(key)) {
            byDept.set(key, { departmentId: emp.departmentId, departmentName: emp.departmentName, totals: emptyTotals() })
        }
        const d = byDept.get(key)
        d.totals.bitacoras += emp.totals.bitacoras
        d.totals.tasksCompleted += emp.totals.tasksCompleted
        d.totals.workPhotos += emp.totals.workPhotos
        d.totals.checkIns += emp.totals.checkIns
        d.totals.totalMinutes += emp.totals.totalMinutes
    }
    reportData.totals = t
    reportData.byDepartment = Array.from(byDept.values())
}

// GET /api/v1/report/history — HR: snapshots cerrados (histórico inmutable)
export const HandleGetReportHistory = async (req, res) => {
    try {
        const snapshots = await WeeklyReportSnapshot.find({ organizationID: req.ORGID })
            .select("-employeesResumen.activities")   // listado liviano: solo totales
            .sort({ isoYear: -1, weekNumber: -1 })
            .limit(52)
        return res.status(200).json({ success: true, message: "Histórico recuperado exitosamente", data: snapshots })
    } catch (error) {
        console.error("[ERROR] HandleGetReportHistory:", error.message)
        return res.status(500).json({ success: false, message: error.message })
    }
}

// GET /api/v1/report/history/:isoYear/:weekNumber — HR: snapshot completo de una semana
export const HandleGetReportByWeek = async (req, res) => {
    try {
        const { isoYear, weekNumber } = req.params
        const snapshot = await WeeklyReportSnapshot.findOne({
            organizationID: req.ORGID,
            isoYear: Number(isoYear),
            weekNumber: Number(weekNumber)
        })
        if (!snapshot) {
            return res.status(404).json({ success: false, message: "No existe snapshot para esa semana" })
        }
        return res.status(200).json({ success: true, message: "Snapshot recuperado exitosamente", data: snapshot })
    } catch (error) {
        console.error("[ERROR] HandleGetReportByWeek:", error.message)
        return res.status(500).json({ success: false, message: error.message })
    }
}

// GET /api/v1/report/cron/close-week — SIN AUTH (patrón cron-job.org existente).
// Cierra la semana anterior para TODAS las organizaciones (multi-tenant).
export const HandleCronCloseAllWeeks = async (req, res) => {
    try {
        const startTime = new Date()
        console.log(`[CRON] close-week INICIADO — ${startTime.toISOString()}`)

        const orgIDs = await Employee.distinct("organizationID", { organizationID: { $ne: null } })
        const results = []

        for (const orgID of orgIDs) {
            try {
                const { snapshot, alreadyExisted } = await closePreviousWeekSnapshot({ orgID })
                results.push({
                    organizationID: String(orgID),
                    week: `${snapshot.isoYear}-W${snapshot.weekNumber}`,
                    alreadyExisted
                })
            } catch (orgError) {
                console.error(`[CRON] close-week ERROR org ${orgID}:`, orgError.message)
                results.push({ organizationID: String(orgID), error: orgError.message })
            }
        }

        console.log(`[CRON] close-week FINALIZADO — ${results.length} organizaciones procesadas`)
        return res.status(200).json({ success: true, message: "Cierre semanal finalizado", data: results })
    } catch (error) {
        console.error("[ERROR] HandleCronCloseAllWeeks:", error.message)
        return res.status(500).json({ success: false, message: error.message })
    }
}

// Re-export para tests y uso externo
export { getISOWeek, mondayOfUTCWeek, addUTCDays, startOfUTCDay }
