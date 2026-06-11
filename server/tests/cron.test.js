import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import supertest from 'supertest'
import express from 'express'

// ── Models (deben importarse antes de usarlos para registrar schemas) ───
import { Schedule } from '../models/Schedule.model.js'
import { Absence } from '../models/Absence.model.js'

// ── Controladores ──────────────────────────────────────────────────────
import {
    HandleCloseExpiredSchedules,
    HandleRegisterDailyAbsences
} from '../controllers/Schedule.controller.js'

// ── Misma constante usada en el controller ─────────────────────────────
const DAYS_ORDER = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

// ── Helper: fechas base del controlador ────────────────────────────────
function getControllerDates () {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const yesterdayDayName = DAYS_ORDER[yesterday.getDay()]

    return { yesterday, today, yesterdayDayName }
}

// ── Helper: crear un schedule activo que cubra "ayer" ──────────────────
function buildActiveSchedule (overrides = {}) {
    const { yesterday, today } = getControllerDates()

    // Por defecto: empieza 7 días antes de ayer, termina 7 días después de ayer
    const start = new Date(yesterday.getTime())
    start.setDate(start.getDate() - 7)

    const end = new Date(yesterday.getTime())
    end.setDate(end.getDate() + 7)

    return {
        employee:        new mongoose.Types.ObjectId(),
        title:           'Schedule de prueba',
        description:     null,
        startdate:       start,
        enddate:         end,
        schedule:        [],
        isactive:        true,
        status:          'active',
        closedAt:        null,
        createdby:       new mongoose.Types.ObjectId(),
        organizationID:  new mongoose.Types.ObjectId(),
        ...overrides
    }
}

// ── Setup Express (solo las rutas cron, sin auth) ──────────────────────
const app = express()
app.use(express.json())
app.get('/api/v1/schedule/cron/close-expired', HandleCloseExpiredSchedules)
app.get('/api/v1/schedule/cron/register-absences', HandleRegisterDailyAbsences)

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
    await Schedule.deleteMany({})
    await Absence.deleteMany({})
})

// ═══════════════════════════════════════════════════════════════════════
//  CRON: close-expired
// ═══════════════════════════════════════════════════════════════════════
describe('GET /api/v1/schedule/cron/close-expired', () => {

    it('debe cerrar horarios con enddate anterior a hoy', async () => {
        const past = new Date('2024-01-01')
        await Schedule.create(buildActiveSchedule({ enddate: past, startdate: new Date('2024-01-01') }))

        const res = await supertest(app).get('/api/v1/schedule/cron/close-expired')

        expect(res.status).toBe(200)
        expect(res.body.success).toBe(true)
        expect(res.body.data.modifiedCount).toBe(1)

        const closed = await Schedule.find({ status: 'closed' })
        expect(closed.length).toBe(1)
    })

    it('NO debe cerrar horarios con enddate >= hoy', async () => {
        const { today } = getControllerDates()
        const future = new Date(today.getTime())
        future.setDate(future.getDate() + 30)

        await Schedule.create(buildActiveSchedule({ enddate: future }))

        const res = await supertest(app).get('/api/v1/schedule/cron/close-expired')

        expect(res.status).toBe(200)
        expect(res.body.data.modifiedCount).toBe(0)
    })

    it('NO debe cerrar horarios ya cerrados aunque tengan enddate pasada', async () => {
        const past = new Date('2024-01-01')
        await Schedule.create(buildActiveSchedule({
            enddate: past,
            startdate: new Date('2024-01-01'),
            status: 'closed'
        }))

        const res = await supertest(app).get('/api/v1/schedule/cron/close-expired')

        expect(res.status).toBe(200)
        expect(res.body.data.modifiedCount).toBe(0)
    })

    it('debe responder gracefulmente sin horarios en DB', async () => {
        const res = await supertest(app).get('/api/v1/schedule/cron/close-expired')

        expect(res.status).toBe(200)
        expect(res.body.data.modifiedCount).toBe(0)
    })
})

// ═══════════════════════════════════════════════════════════════════════
//  CRON: register-absences
// ═══════════════════════════════════════════════════════════════════════
describe('GET /api/v1/schedule/cron/register-absences', () => {

    it('debe registrar ausencia si hay tareas incompletas de ayer', async () => {
        const { yesterdayDayName } = getControllerDates()

        const schedule = await Schedule.create(buildActiveSchedule({
            schedule: [{
                day: yesterdayDayName,
                tasks: [
                    { title: 'Tarea 1', starttime: '09:00', endtime: '10:00', completed: false }
                ]
            }]
        }))

        const res = await supertest(app).get('/api/v1/schedule/cron/register-absences')

        expect(res.status).toBe(200)
        expect(res.body.success).toBe(true)
        expect(res.body.data.absencesRegistered).toBe(1)

        const absences = await Absence.find({ scheduleId: schedule._id })
        expect(absences.length).toBe(1)
        expect(absences[0].leavetype).toBe('Tarea No Realizada')
    })

    it('NO debe registrar ausencia si todas las tareas están completadas', async () => {
        const { yesterdayDayName } = getControllerDates()

        await Schedule.create(buildActiveSchedule({
            schedule: [{
                day: yesterdayDayName,
                tasks: [
                    { title: 'Tarea 1', starttime: '09:00', endtime: '10:00', completed: true }
                ]
            }]
        }))

        const res = await supertest(app).get('/api/v1/schedule/cron/register-absences')

        expect(res.status).toBe(200)
        expect(res.body.data.absencesRegistered).toBe(0)
    })

    it('NO debe duplicar ausencia si ya existe para el mismo empleado/fecha (Fase 1)', async () => {
        const { yesterday, today, yesterdayDayName } = getControllerDates()

        const schedule = await Schedule.create(buildActiveSchedule({
            schedule: [{
                day: yesterdayDayName,
                tasks: [
                    { title: 'Tarea 1', starttime: '09:00', endtime: '10:00', completed: false }
                ]
            }]
        }))

        // Pre-crear la ausencia (simula que ya fue registrada por checkout)
        await Absence.create({
            employee: schedule.employee,
            scheduleId: schedule._id,
            startdate: yesterday,
            enddate: yesterday,
            leavetype: 'Tarea No Realizada',
            title: 'Ausencia por Tarea No Realizada',
            reason: 'Pre-existente',
            organizationID: schedule.organizationID
        })

        const res = await supertest(app).get('/api/v1/schedule/cron/register-absences')

        expect(res.status).toBe(200)
        expect(res.body.data.absencesRegistered).toBe(0)

        // Debe seguir habiendo solo 1 ausencia (la pre-creada)
        const absences = await Absence.find({ scheduleId: schedule._id })
        expect(absences.length).toBe(1)
    })

    it('debe saltar schedules que no tienen el día de ayer en su schedule array', async () => {
        // Crear schedule con un día que NO es ayer
        const otherDay = 'Lunes' // día fijo que casi nunca será "ayer"
        await Schedule.create(buildActiveSchedule({
            schedule: [{
                day: otherDay,
                tasks: [
                    { title: 'Tarea 1', starttime: '09:00', endtime: '10:00', completed: false }
                ]
            }]
        }))

        const res = await supertest(app).get('/api/v1/schedule/cron/register-absences')

        expect(res.status).toBe(200)
        expect(res.body.data.absencesRegistered).toBe(0)
    })

    it('debe saltar schedules que no tienen tasks en el día de ayer', async () => {
        const { yesterdayDayName } = getControllerDates()

        await Schedule.create(buildActiveSchedule({
            schedule: [{
                day: yesterdayDayName,
                tasks: [] // array vacío
            }]
        }))

        const res = await supertest(app).get('/api/v1/schedule/cron/register-absences')

        expect(res.status).toBe(200)
        expect(res.body.data.absencesRegistered).toBe(0)
    })

    it('debe responder gracefulmente sin horarios activos', async () => {
        const { yesterdayDayName } = getControllerDates()

        // Schedule con status "closed"
        await Schedule.create(buildActiveSchedule({
            status: 'closed',
            schedule: [{
                day: yesterdayDayName,
                tasks: [
                    { title: 'Tarea 1', starttime: '09:00', endtime: '10:00', completed: false }
                ]
            }]
        }))

        const res = await supertest(app).get('/api/v1/schedule/cron/register-absences')

        expect(res.status).toBe(200)
        expect(res.body.data.absencesRegistered).toBe(0)
    })
})
