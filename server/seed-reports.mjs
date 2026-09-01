/**
 * seed-reports.mjs — Data semilla histórica + generación de snapshots semanales
 *
 * Objetivo: permitir verificar que el mecanismo de cierre semanal
 * (`closePreviousWeekSnapshot`) se ejecuta correctamente, generando hasta 5
 * reportes "viejos" con contenido demostrable.
 *
 * Estrategia:
 *   1. Conecta Mongo (MongoClient nativo) + mongoose (para la lógica del controller).
 *   2. Inserta data semilla HISTÓRICA en 5 semanas ISO consecutivas (bitácoras,
 *      tarea completada, tarea pendiente, foto de trabajo, asistencia) con fechas
 *      FIJAS y deterministas, de forma idempotente (no duplica si ya existe).
 *   3. Dispara `closePreviousWeekSnapshot({ orgID, now })` retrocediendo `now`
 *      semana a semana para cerrar cada una de las semanas objetivo.
 *      El modelo tiene índice único {organizationID, isoYear, weekNumber}, por
 *      lo que re-ejecutar es IDEMPOTENTE (upsert, sin duplicar).
 *
 * Uso:
 *   node server/seed-reports.mjs                 # genera sobre la DB actual
 *   MONGODB_URI=... node server/seed-reports.mjs
 *
 * También es invocado por first-seed.mjs al final de la siembra.
 */
import mongoose from "mongoose"
import { MongoClient } from "mongodb"
import { fileURLToPath } from "url"
import { dirname } from "path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/condove_local"

// Utilidades de semana reutilizadas (misma convención UTC que el reporte)
import { mondayOfUTCWeek, addUTCDays, startOfUTCDay, getISOWeek } from "./utils/reportWindow.util.js"

// ── Empleado / canal por defecto para la data semilla ──────────────────────
// Se resuelven dinámicamente: primer HR (org) y primeros empleados.
let EMPLOYEE_FOR_SEED = null   // empId para bitácoras/fotos/asistencia/tareas
let HR_FOR_SEED = null          // hrId para createdby de schedules/notices
let ORG_FOR_SEED = null

const DAYS_ES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

// ── Helpers de fechas (deterministas, UTC) ─────────────────────────────────
const atUTC = (y, m0, d, h = 0, min = 0) => new Date(Date.UTC(y, m0, d, h, min))
const WEEK_ADJ_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

// ── Resolver IDs base (HR, org, empleados) ─────────────────────────────────
async function resolveBaseIds(db) {
    const hr = await db.collection("humanresources").findOne({ email: process.env.SEED_HR_EMAIL || "admin@test.local" })
        || await db.collection("humanresources").findOne({})
    if (!hr) throw new Error("No HR document found. Run first-seed.mjs / signup first.")
    const org = await db.collection("organizations").findOne({ _id: hr.organizationID })
    if (!org) throw new Error("Organization not found for HR.")
    const emps = await db.collection("employees").find({ organizationID: org._id, isactive: { $ne: false } })
        .limit(3).toArray()
    if (emps.length === 0) throw new Error("No employees found for org. Seed employees first.")

    ORG_FOR_SEED = org._id
    HR_FOR_SEED = hr._id
    EMPLOYEE_FOR_SEED = emps[0]._id   // canal principal
    return { orgId: org._id, hrId: hr._id, emps }
}

// ── Data semilla por semana ─────────────────────────────────────────────────
// Genera y inserta actividades (idempotente) dentro de la semana cuyo lunes es `monday`.
// devuelve un objeto con conteos insertados.
async function seedWeekData(db, { orgId, hrId, emps, monday }) {
    const counts = { bitacoras: 0, workphotos: 0, attendance: 0, schedulePending: 0, scheduleCompleted: 0 }
    const T = (dayIdx, h = 12) => addUTCDays(monday, dayIdx)                       // 0=Lun
    const empId = EMPLOYEE_FOR_SEED
    const otherEmpId = emps[1]?._id || empId
    const emp2Id = emps[2]?._id || empId

    // ── 1. Bitácora (Miércoles) ─────────────────────────────────────────────
    const bitacoraCreated = T(2)  // Miércoles
    const existsBit = await db.collection("bitacoras").findOne({
        organizationID: orgId,
        employee: empId,
        title: `Bitácora semanal W${getISOWeek(monday).week}`
    })
    if (!existsBit) {
        await db.collection("bitacoras").insertOne({
            title: `Bitácora semanal W${getISOWeek(monday).week}`,
            content: `Novedades de la semana del ${monday.toISOString().slice(0, 10)} generadas por seed-reports.`,
            images: [],
            videos: [],
            employee: empId,
            isDeleted: false,
            organizationID: orgId,
            createdAt: bitacoraCreated,
            updatedAt: bitacoraCreated
        })
        counts.bitacoras++
    }

    // ── 2. Foto de trabajo (Viernes) ────────────────────────────────────────
    const photoDate = T(4)
    const photoKey = `foto-w${getISOWeek(monday).week}`
    const existsPhoto = await db.collection("workphotos").findOne({
        organizationID: orgId,
        employee: empId,
        description: photoKey
    })
    if (!existsPhoto) {
        await db.collection("workphotos").insertOne({
            employee: empId,
            photourl: `https://placehold.co/800x600?text=${photoKey}`,
            publicid: photoKey,
            description: photoKey,
            workdate: photoDate,
            captureDate: photoDate,
            gpsLocation: { lat: 10.4806, lng: -66.9036 },
            organizationID: orgId,
            createdAt: photoDate,
            updatedAt: photoDate
        })
        counts.workphotos++
    }

    // ── 3. Asistencia (Martes) para dos empleados ───────────────────────────
    const attDate = T(1)
    for (const [ci, targetEmp] of [[0, empId], [1, otherEmpId]]) {
        const keyEmp = targetEmp
        const existsAtt = await db.collection("attendances").findOne({
            organizationID: orgId,
            employee: keyEmp,
            "attendancelog.logdate": attDate
        })
        if (!existsAtt) {
            await db.collection("attendances").updateOne(
                { organizationID: orgId, employee: keyEmp },
                {
                    $setOnInsert: { organizationID: orgId, employee: keyEmp, status: "Present", updatedAt: attDate },
                    $push: {
                        attendancelog: {
                            logdate: attDate,
                            logstatus: "Present",
                            checkin: new Date(attDate.getTime() + 9 * 3600000),
                            checkout: new Date(attDate.getTime() + 17 * 3600000),
                            duration: 480
                        }
                    }
                },
                { upsert: true }
            )
            counts.attendance++  // podría ser 1 o 2
        }
    }

    // ── 4. Horario con TAREA COMPLETADA (Jueves) y TAREA PENDIENTE (Lunes) ──
    //    Un horario activo que cubra la semana; una tarea completada con
    //    completedAt dentro de la ventana y una pendiente sin completedAt.
    const scheduleTitle = `Horario seed W${getISOWeek(monday).week}`
    let sch = await db.collection("schedules").findOne({ organizationID: orgId, title: scheduleTitle })
    if (!sch) {
        const doc = {
            employee: empId,
            title: scheduleTitle,
            description: "Horario generado por seed-reports para validar snapshots.",
            startdate: monday,
            enddate: addUTCDays(monday, 6),
            isactive: true,
            status: "active",
            closedAt: null,
            createdby: hrId,
            organizationID: orgId,
            schedule: [
                {
                    day: "Lunes",
                    tasks: [{
                        title: `Tarea pendiente W${getISOWeek(monday).week}`,
                        description: "Tarea sin completar de la semana.",
                        starttime: "09:00",
                        endtime: "10:30",
                        completed: false,
                        completedAt: null
                    }]
                },
                {
                    day: "Jueves",
                    tasks: [{
                        title: `Tarea completada W${getISOWeek(monday).week}`,
                        description: "Tarea finalizada durante la semana.",
                        starttime: "14:00",
                        endtime: "15:30",
                        completed: true,
                        completedAt: T(3, 14)   // Jueves 14:00 UTC
                    }]
                }
            ],
            createdAt: monday,
            updatedAt: monday
        }
        const r = await db.collection("schedules").insertOne(doc)
        sch = { _id: r.insertedId }
        counts.schedulePending++
        counts.scheduleCompleted++
    }

    // sanity: si el horario ya existía, aseguramos tarea pendiente/completada presentes.
    return counts
}

// ── Generar snapshots de las semanas objetivo ──────────────────────────────
// `weekMondays`: array de lunes de cada semana a cerrar (data semilla ya insertada).
// Para cerrar la semana de `weekMonday`, pasamos `now` = un instante en la semana
// SIGUIENTE (martes), porque getPreviousClosedWeek(now) retrocede 1 semana.
async function generateSnapshots(weekMondays) {
    // Importamos el controller DESPUÉS de conectar mongoose para que los models
    // estén registrados. `closePreviousWeekSnapshot` usa buildLiveReport real.
    const { closePreviousWeekSnapshot } = await import("./controllers/Report.controller.js")

    const created = []
    for (const weekMonday of weekMondays) {
        // martes de la semana siguiente a la objetivo
        const nowForWeek = startOfUTCDay(addUTCDays(weekMonday, 7 + 1))
        const { snapshot, alreadyExisted } = await closePreviousWeekSnapshot({ orgID: ORG_FOR_SEED, now: nowForWeek })
        created.push({ isoYear: snapshot.isoYear, weekNumber: snapshot.weekNumber, alreadyExisted })
        console.log(`   [snapshot] ${snapshot.isoYear}-W${snapshot.weekNumber} ${alreadyExisted ? "(ya existía)" : "(creado)"}`)
    }
    return created
}

// ── MAIN ───────────────────────────────────────────────────────────────────
export async function seedReports(options = {}) {
    const count = options.count || 5
    const client = new MongoClient(MONGO_URI)

    // Conexión mongoose (para el controller)
    if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(MONGO_URI)
    }

    try {
        await client.connect()
        const db = client.db()
        console.log("✅ seed-reports conectado")

        const { orgId, hrId, emps } = await resolveBaseIds(db)
        console.log(`📋 Org: ${orgId} | Empleados base: ${emps.length}`)

        // Determinar las 5 semanas objetivo (hacia atrás desde la semana pasada).
        const thisMonday = mondayOfUTCWeek(startOfUTCDay(new Date()))
        const weeks = []
        for (let i = 0; i < count; i++) {
            weeks.push(addUTCDays(thisMonday, -7 * (i + 1)))
        }

        console.log("\n🔄 Insertando data semilla histórica...")
        let totals = { bitacoras: 0, workphotos: 0, attendance: 0, schedulePending: 0, scheduleCompleted: 0 }
        for (const weekMonday of weeks) {
            const c = await seedWeekData(db, { orgId, hrId, emps, monday: weekMonday })
            const { week, isoYear } = getISOWeek(weekMonday)
            console.log(`   W${week}/${isoYear} (${weekMonday.toISOString().slice(0,10)}): ` +
                `bitácoras+${c.bitacoras}, fotos+${c.workphotos}, asistencia+${c.attendance}, schedules+${c.schedulePending}`)
            for (const k of Object.keys(totals)) totals[k] += c[k]
        }

        console.log("\n🔄 Generando snapshots semanales...")
        const created = await generateSnapshots(weeks)

        console.log("\n" + "═".repeat(55))
        console.log("✅ SEED-REPORTS COMPLETE")
        console.log("═".repeat(55))
        for (const s of created) {
            console.log(`   Snapshot ${s.isoYear}-W${s.weekNumber}: ${s.alreadyExisted ? "existía" : "creado"}`)
        }
        console.log("─".repeat(55))
        console.log(`   data semilla: bitácoras+${totals.bitacoras}, fotos+${totals.workphotos}, ` +
            `asistencia+${totals.attendance}, schedules+${totals.scheduleCompleted}`)
        console.log("═".repeat(55))

        return created
    } finally {
        await client.close()
    }
}

// ── Ejecución directa por CLI ──────────────────────────────────────────────
import { pathToFileURL } from "url"
const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isDirectRun) {
    seedReports()
        .then(() => { mongoose.disconnect(); process.exit(0) })
        .catch(err => { console.error("❌ Error:", err.message); mongoose.disconnect(); process.exit(1) })
}
