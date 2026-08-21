import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

// ── Models ─────────────────────────────────────────────────────────────
import { Employee } from '../models/Employee.model.js'
import { Department } from '../models/Department.model.js'
import { Bitacora } from '../models/Bitacora.model.js'
import { Schedule } from '../models/Schedule.model.js'
import { WorkPhoto } from '../models/WorkPhoto.model.js'
import { Attendance } from '../models/Attendance.model.js'
import { WeeklyReportSnapshot } from '../models/WeeklyReportSnapshot.model.js'

// ── Lógica pura bajo test (now inyectable — sin fake timers) ───────────
import {
    buildCurrentReportPayload,
    closePreviousWeekSnapshot,
    buildLiveReport,
    buildMyWeeklyHistory
} from '../controllers/Report.controller.js'

// ── Semana ancla: lun 17 – dom 23 ago 2026 (UTC) ───────────────────────
const ORG = new mongoose.Types.ObjectId()
const MON = new Date('2026-08-17T00:00:00.000Z')
const TUE = new Date('2026-08-18T10:00:00.000Z')   // martes (reporte muestra lunes)
const SAT_MORNING = new Date('2026-08-22T14:00:00.000Z')   // check-in sabatino sembrado
const SAT_AFTERNOON = new Date('2026-08-22T18:00:00.000Z')
const NEXT_MON_CRON = new Date('2026-08-24T07:00:00.000Z') // lunes 03:00 Caracas

let deptMantenimiento
let deptLimpieza
let empA   // depto Mantenimiento
let empB   // depto Mantenimiento
let empC   // depto Limpieza

async function seedWeekData () {
    deptMantenimiento = await Department.create({ name: 'Mantenimiento', description: 'Depto de mantenimiento', organizationID: ORG })
    deptLimpieza = await Department.create({ name: 'Limpieza', description: 'Depto de limpieza', organizationID: ORG })

    empA = await Employee.create({
        firstname: 'Ana', lastname: 'Perez', email: 'ana@test.ve', password: 'x',
        contactnumber: '0414', role: 'Employee', isverified: true,
        department: deptMantenimiento._id, organizationID: ORG
    })
    empB = await Employee.create({
        firstname: 'Beto', lastname: 'Rossi', email: 'beto@test.ve', password: 'x',
        contactnumber: '0414', role: 'Employee', isverified: true,
        department: deptMantenimiento._id, organizationID: ORG
    })
    empC = await Employee.create({
        firstname: 'Carla', lastname: 'Diaz', email: 'carla@test.ve', password: 'x',
        contactnumber: '0414', role: 'Employee', isverified: true,
        department: deptLimpieza._id, organizationID: ORG
    })

    // Bitácora de Ana el LUNES (debe verse el MARTES como "día anterior")
    await Bitacora.create({
        title: 'Reparación bomba de agua', content: 'Cambié el sello',
        employee: empA._id, organizationID: ORG,
        createdAt: new Date('2026-08-17T14:30:00.000Z'), updatedAt: new Date('2026-08-17T14:30:00.000Z')
    })
    // Bitácora de Carla el JUEVES (NO debe verse el martes)
    await Bitacora.create({
        title: 'Limpieza profunda lobby', content: 'Áreas comunes',
        employee: empC._id, organizationID: ORG,
        createdAt: new Date('2026-08-20T11:00:00.000Z'), updatedAt: new Date('2026-08-20T11:00:00.000Z')
    })

    // Tarea completada por Beto el LUNES 15:00 UTC (con completedAt — campo nuevo)
    const monday = new Date('2026-08-17T00:00:00.000Z')
    await Schedule.create({
        employee: empB._id, title: 'Horario semanal',
        startdate: monday, enddate: new Date('2026-08-28T00:00:00.000Z'),
        schedule: [{
            day: 'Lunes',
            tasks: [
                { title: 'Cambiar filtro A/C', starttime: '08:00', endtime: '09:00', completed: true, completedAt: new Date('2026-08-17T15:00:00.000Z') },
                { title: 'Revisar luces pasillo', starttime: '09:00', endtime: '10:00', completed: false, completedAt: null }
            ]
        }],
        createdby: new mongoose.Types.ObjectId(), organizationID: ORG
    })

    // Foto de trabajo de Carla el VIERNES (workdate a mediodía — convención del sistema)
    await WorkPhoto.create({
        employee: empC._id, photourl: 'http://img.test/1.jpg', publicid: 'img1',
        description: 'Piso encerado', workdate: new Date('2026-08-21T12:00:00.000Z'),
        organizationID: ORG
    })

    // Asistencia: check-in de Ana el LUNES y de Ana el SÁBADO (requisito #3)
    const attA = await Attendance.create({ employee: empA._id, status: 'Present', organizationID: ORG })
    attA.attendancelog.push(
        { logdate: new Date('2026-08-17T13:00:00.000Z'), logstatus: 'Present', checkin: new Date('2026-08-17T13:00:00.000Z'), checkout: new Date('2026-08-17T21:00:00.000Z'), duration: 480 },
        { logdate: new Date('2026-08-22T14:00:00.000Z'), logstatus: 'Present', checkin: new Date('2026-08-22T14:00:00.000Z'), checkout: null, duration: null }
    )
    await attA.save()
}

let mongoServer

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())
})

afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
})

beforeEach(async () => {
    const collections = await mongoose.connection.db.collections()
    for (const c of collections) await c.deleteMany({})
    await seedWeekData()
})

describe('buildCurrentReportPayload — matriz temporal con datos reales', () => {
    it('MARTES → DAILY: muestra SOLO actividades del lunes (bitácora + tarea + checkin de lun)', async () => {
        const payload = await buildCurrentReportPayload({ orgID: ORG, now: TUE })

        expect(payload.mode).toBe('DAILY')
        expect(payload.daily).not.toBeNull()
        expect(payload.weekly).toBeNull()

        // La bitácora del jueves de Carla NO aparece; la del lunes de Ana SÍ
        const dailyBitacoras = payload.daily.employees.flatMap(e => e.activities.filter(a => a.type === 'bitacora'))
        expect(dailyBitacoras).toHaveLength(1)
        expect(dailyBitacoras[0].title).toBe('Reparación bomba de agua')

        // Tarea completada el lunes por Beto incluida
        const tasks = payload.daily.employees.flatMap(e => e.activities.filter(a => a.type === 'task_completed'))
        expect(tasks).toHaveLength(1)
        expect(tasks[0].title).toBe('Cambiar filtro A/C')

        // Check-in del lunes incluido (480 min)
        expect(payload.daily.totals.checkIns).toBe(1)
        expect(payload.daily.totals.totalMinutes).toBe(480)

        // La foto del viernes NO está en la ventana diaria del martes
        const photos = payload.daily.employees.flatMap(e => e.activities.filter(a => a.type === 'work_photo'))
        expect(photos).toHaveLength(0)

        expect(payload.dailyWindow.label).toBe('Lunes')
    })

    it('LUNES → WEEK_START: secciones vacías aunque existan datos previos', async () => {
        const payload = await buildCurrentReportPayload({ orgID: ORG, now: MON })
        expect(payload.mode).toBe('WEEK_START')
        expect(payload.daily).toBeNull()
        expect(payload.dailyWindow).toBeNull()
        expect(payload.weekly).toBeNull()
    })

    it('SÁBADO TARDE → WEEKLY_LIVE: actividad del sábado en AMBAS ventanas (requisito #3)', async () => {
        const payload = await buildCurrentReportPayload({ orgID: ORG, now: SAT_AFTERNOON })

        expect(payload.mode).toBe('WEEKLY_LIVE')
        expect(payload.banner.type).toBe('preliminary')

        // Diario = HOY (sábado): contiene el check-in sabatino de Ana
        const satCheckins = payload.daily.employees.flatMap(e => e.activities.filter(a => a.type === 'attendance'))
        expect(satCheckins).toHaveLength(1)
        expect(new Date(satCheckins[0].date).toISOString()).toBe(SAT_MORNING.toISOString())

        // Semanal = Lun→ahora: contiene TODO (bitácoras lun+jue, tarea, foto vie, 2 checkins)
        expect(payload.weekly.totals.bitacoras).toBe(2)
        expect(payload.weekly.totals.tasksCompleted).toBe(1)
        expect(payload.weekly.totals.workPhotos).toBe(1)
        expect(payload.weekly.totals.checkIns).toBe(2)

        // La actividad del sábado está dentro de la ventana semanal
        const weeklyAtt = payload.weekly.employees.flatMap(e => e.activities.filter(a => a.type === 'attendance'))
        const satInWeekly = weeklyAtt.some(a => new Date(a.date).toISOString() === SAT_MORNING.toISOString())
        expect(satInWeekly).toBe(true)
    })

    it('desglose byDepartment separa Mantenimiento de Limpieza', async () => {
        const payload = await buildCurrentReportPayload({ orgID: ORG, now: SAT_AFTERNOON })
        const depts = Object.fromEntries(payload.weekly.byDepartment.map(d => [d.departmentName, d]))

        expect(depts['Mantenimiento'].totals.bitacoras).toBe(1)   // Ana (lunes)
        expect(depts['Mantenimiento'].totals.tasksCompleted).toBe(1) // Beto
        expect(depts['Limpieza'].totals.bitacoras).toBe(1)        // Carla (jueves)
        expect(depts['Limpieza'].totals.workPhotos).toBe(1)       // Carla (viernes)
    })

    it('SCOPE POR DEPARTAMENTO: empleado de Limpieza no ve actividades de Mantenimiento (requisito #4)', async () => {
        const payload = await buildCurrentReportPayload({ orgID: ORG, departmentID: deptLimpieza._id, now: SAT_AFTERNOON })

        const names = payload.weekly.employees.map(e => e.employeeName)
        expect(names).toEqual(expect.arrayContaining(['Carla Diaz']))
        expect(names).not.toEqual(expect.arrayContaining(['Ana Perez', 'Beto Rossi']))
        expect(payload.weekly.totals.bitacoras).toBe(1)           // solo Carla
        expect(payload.weekly.totals.tasksCompleted).toBe(0)      // tarea era de Beto
    })

    it('empleado sin departamento (scope null vía departmentID=null) ve toda la org', async () => {
        const report = await buildLiveReport({ orgID: ORG, departmentID: null, start: MON, end: SAT_AFTERNOON })
        expect(report.employees).toHaveLength(3)
    })
})

describe('closePreviousWeekSnapshot — cierre idempotente', () => {
    it('crea snapshot inmutable de la semana anterior con todos los totales', async () => {
        const { snapshot, alreadyExisted } = await closePreviousWeekSnapshot({ orgID: ORG, now: NEXT_MON_CRON })

        expect(alreadyExisted).toBe(false)
        expect(snapshot.status).toBe('closed')
        expect(snapshot.isoYear).toBe(2026)
        expect(snapshot.weekStart.toISOString()).toBe('2026-08-17T00:00:00.000Z')
        expect(snapshot.weekEnd.toISOString()).toBe('2026-08-23T23:59:59.999Z')

        // Totales completos de la semana 17–23 ago
        expect(snapshot.totals.bitacoras).toBe(2)
        expect(snapshot.totals.tasksCompleted).toBe(1)
        expect(snapshot.totals.workPhotos).toBe(1)
        expect(snapshot.totals.checkIns).toBe(2)
        expect(snapshot.totals.totalMinutes).toBe(480)

        // Resumen por empleado serializado (clon, no refs vivas)
        const ana = snapshot.employeesResumen.find(e => e.employeeName === 'Ana Perez')
        expect(ana.departmentName).toBe('Mantenimiento')
        expect(ana.activities.length).toBeGreaterThanOrEqual(2)   // bitácora + 2 checkins
    })

    it('SEGUNDA ejecución → NO duplica (upsert idempotente)', async () => {
        await closePreviousWeekSnapshot({ orgID: ORG, now: NEXT_MON_CRON })
        const second = await closePreviousWeekSnapshot({ orgID: ORG, now: new Date('2026-08-24T09:00:00.000Z') })

        expect(second.alreadyExisted).toBe(true)
        const count = await WeeklyReportSnapshot.countDocuments({ organizationID: ORG })
        expect(count).toBe(1)
    })

    it('multi-tenant: snapshots de dos organizaciones son independientes', async () => {
        const otherOrg = new mongoose.Types.ObjectId()
        await closePreviousWeekSnapshot({ orgID: ORG, now: NEXT_MON_CRON })
        await closePreviousWeekSnapshot({ orgID: otherOrg, now: NEXT_MON_CRON })

        const total = await WeeklyReportSnapshot.countDocuments({})
        expect(total).toBe(2)
    })
})

describe('buildMyWeeklyHistory — Mis Reportes (aislamiento por empleado)', () => {
    it('devuelve SOLO las actividades propias (Ana no ve tarea de Beto ni items de Carla)', async () => {
        await closePreviousWeekSnapshot({ orgID: ORG, now: NEXT_MON_CRON })
        const history = await buildMyWeeklyHistory({ orgID: ORG, employeeID: empA._id })

        expect(history).toHaveLength(1)
        const week = history[0]
        expect(week.status).toBe('closed')
        expect(week.isoYear).toBe(2026)
        expect(new Date(week.weekStart).toISOString()).toBe('2026-08-17T00:00:00.000Z')

        // Solo bitácora de Ana + sus 2 checkins; NADA de Beto (task) ni Carla
        const types = week.myActivities.map(a => a.type).sort()
        expect(types).toEqual(['attendance', 'attendance', 'bitacora'])
        expect(week.myTotals.bitacoras).toBe(1)
        expect(week.myTotals.checkIns).toBe(2)
        expect(week.myTotals.tasksCompleted).toBe(0)   // la tarea era de Beto
        expect(week.myTotals.workPhotos).toBe(0)       // la foto era de Carla
        // El payload NUNCA incluye el resumen completo del snapshot
        expect(week.employeesResumen).toBeUndefined()
        expect(week.byDepartment).toBeUndefined()
    })

    it('empleado sin actividades en la semana → totales 0 y activities []', async () => {
        await closePreviousWeekSnapshot({ orgID: ORG, now: NEXT_MON_CRON })
        const ghostID = new mongoose.Types.ObjectId()   // empleado sin registro en snapshot
        const history = await buildMyWeeklyHistory({ orgID: ORG, employeeID: ghostID })

        expect(history).toHaveLength(1)
        expect(history[0].myTotals.bitacoras).toBe(0)
        expect(history[0].myTotals.checkIns).toBe(0)
        expect(history[0].myActivities).toEqual([])
    })

    it('orden descendente y multi-semana (cada semana solo lo propio)', async () => {
        // Cierra semana 17–23 ago y luego semana 24–30 ago
        await closePreviousWeekSnapshot({ orgID: ORG, now: NEXT_MON_CRON })
        // Bitácora de Beto en la segunda semana, luego cierra
        await Bitacora.create({
            title: 'Segunda semana', content: 'Beto',
            employee: empB._id, organizationID: ORG,
            createdAt: new Date('2026-08-25T10:00:00.000Z'), updatedAt: new Date('2026-08-25T10:00:00.000Z')
        })
        await closePreviousWeekSnapshot({ orgID: ORG, now: new Date('2026-08-31T07:00:00.000Z') })

        const beto = await buildMyWeeklyHistory({ orgID: ORG, employeeID: empB._id })
        expect(beto.map(w => w.weekNumber)).toEqual([35, 34])   // desc: 24-30ago=W35, 17-23ago=W34

        const w35 = beto[0]
        expect(w35.myActivities).toHaveLength(1)
        expect(w35.myActivities[0].title).toBe('Segunda semana')
        const w34 = beto[1]
        expect(w34.myTotals.tasksCompleted).toBe(1)   // su tarea de filtro A/C
        expect(w34.myTotals.bitacoras).toBe(0)
    })

    it('multi-tenant: no mezcla snapshots de otras organizaciones', async () => {
        await closePreviousWeekSnapshot({ orgID: ORG, now: NEXT_MON_CRON })
        const otherOrg = new mongoose.Types.ObjectId()
        const other = await buildMyWeeklyHistory({ orgID: otherOrg, employeeID: empA._id })
        expect(other).toEqual([])
    })
})
