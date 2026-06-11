import { Schedule } from "../models/Schedule.model.js"
import { Absence } from "../models/Absence.model.js"
import { Employee } from "../models/Employee.model.js"
import { HumanResources } from "../models/HR.model.js"

// Días de la semana ordenados
const DAYS_ORDER = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

// ── HR: Crear horario y asignarlo a un empleado ───────────────────────────
export const HandleCreateSchedule = async (req, res) => {
    try {
        const { employeeID, title, description, startdate, enddate, schedule } = req.body

        if (!employeeID || !title || !startdate || !enddate || !schedule) {
            return res.status(400).json({ success: false, message: "Todos los campos son requeridos" })
        }

        const employee = await Employee.findOne({ _id: employeeID, organizationID: req.ORGID })

        if (!employee) {
            return res.status(404).json({ success: false, message: "Empleado no encontrado" })
        }

        const newSchedule = await Schedule.create({
            employee: employeeID,
            title,
            description: description || null,
            startdate,
            enddate,
            schedule,
            createdby: req.HRid,
            organizationID: req.ORGID
        })

        return res.status(201).json({
            success: true,
            message: "Horario creado y asignado exitosamente",
            data: newSchedule
        })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

// ── HR: Obtener todos los horarios de la organización ─────────────────────
export const HandleGetAllSchedules = async (req, res) => {
    try {
        const schedules = await Schedule.find({ organizationID: req.ORGID })
            .populate("employee", "firstname lastname department")
            .populate("createdby", "firstname lastname")
            .sort({ createdAt: -1 })

        return res.status(200).json({
            success: true,
            message: "Horarios obtenidos exitosamente",
            data: schedules
        })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

// ── HR: Obtener horarios de un empleado específico ────────────────────────
export const HandleGetEmployeeSchedules = async (req, res) => {
    try {
        const { employeeID } = req.params

        if (!employeeID) {
            return res.status(400).json({ success: false, message: "employeeID es requerido" })
        }

        const schedules = await Schedule.find({
            employee: employeeID,
            organizationID: req.ORGID
        })
            .populate("employee", "firstname lastname department")
            .populate("createdby", "firstname lastname")
            .sort({ createdAt: -1 })

        return res.status(200).json({
            success: true,
            message: "Horarios del empleado obtenidos exitosamente",
            data: schedules
        })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

// ── HR: Actualizar un horario ─────────────────────────────────────────────
export const HandleUpdateSchedule = async (req, res) => {
    try {
        const { scheduleID, title, description, startdate, enddate, schedule, isactive } = req.body

        if (!scheduleID) {
            return res.status(400).json({ success: false, message: "scheduleID es requerido" })
        }

        const existingSchedule = await Schedule.findOne({
            _id: scheduleID,
            organizationID: req.ORGID
        })

        if (!existingSchedule) {
            return res.status(404).json({ success: false, message: "Horario no encontrado" })
        }

        if (title !== undefined) existingSchedule.title = title
        if (description !== undefined) existingSchedule.description = description
        if (startdate !== undefined) existingSchedule.startdate = startdate
        if (enddate !== undefined) existingSchedule.enddate = enddate
        if (schedule !== undefined) existingSchedule.schedule = schedule
        if (isactive !== undefined) existingSchedule.isactive = isactive

        await existingSchedule.save()

        return res.status(200).json({
            success: true,
            message: "Horario actualizado exitosamente",
            data: existingSchedule
        })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

// ── HR: Eliminar un horario ───────────────────────────────────────────────
export const HandleDeleteSchedule = async (req, res) => {
    try {
        const { scheduleID } = req.params

        if (!scheduleID) {
            return res.status(400).json({ success: false, message: "scheduleID es requerido" })
        }

        const schedule = await Schedule.findOne({
            _id: scheduleID,
            organizationID: req.ORGID
        })

        if (!schedule) {
            return res.status(404).json({ success: false, message: "Horario no encontrado" })
        }

        await schedule.deleteOne()

        return res.status(200).json({
            success: true,
            message: "Horario eliminado exitosamente"
        })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

// ── Employee: Obtener mis horarios activos ────────────────────────────────
export const HandleGetMySchedules = async (req, res) => {
    try {

        const schedules = await Schedule.find({
            employee: req.EMPID,
            organizationID: req.ORGID,
            isactive: true
        })
            .populate("createdby", "firstname lastname")
            .sort({ startdate: 1 })

        return res.status(200).json({
            success: true,
            message: "Horarios obtenidos exitosamente",
            data: schedules
        })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

// ── Employee: Marcar tarea como completada ────────────────────────────────
export const HandleCompleteTask = async (req, res) => {
    try {
        const { scheduleID, dayID, taskID } = req.body

        if (!scheduleID || !dayID || !taskID) {
            return res.status(400).json({ success: false, message: "Todos los campos son requeridos" })
        }

        const schedule = await Schedule.findOne({
            _id: scheduleID,
            employee: req.EMPID,
            organizationID: req.ORGID
        })

        if (!schedule) {
            return res.status(404).json({ success: false, message: "Horario no encontrado" })
        }

        // Verificar que el horario esté activo
        if (schedule.status !== "active") {
            return res.status(400).json({ success: false, message: "El horario está cerrado" })
        }

        const day = schedule.schedule.id(dayID)
        if (!day) {
            return res.status(404).json({ success: false, message: "Día no encontrado" })
        }

        const task = day.tasks.id(taskID)
        if (!task) {
            return res.status(404).json({ success: false, message: "Tarea no encontrada" })
        }

        task.completed = !task.completed
        await schedule.save()

        return res.status(200).json({
            success: true,
            message: `Tarea marcada como ${task.completed ? "completada" : "pendiente"}`,
            data: schedule
        })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

// ── HR: Duplicar horario ─────────────────────────────────────────────────
export const HandleDuplicateSchedule = async (req, res) => {
    try {
        const { scheduleID } = req.params
        const { title, startdate, enddate } = req.body

        if (!scheduleID) {
            return res.status(400).json({ success: false, message: "scheduleID es requerido" })
        }

        const originalSchedule = await Schedule.findOne({
            _id: scheduleID,
            organizationID: req.ORGID
        })

        if (!originalSchedule) {
            return res.status(404).json({ success: false, message: "Horario no encontrado" })
        }

        const duplicatedSchedule = new Schedule({
            employee: originalSchedule.employee,
            title: title || `${originalSchedule.title} (Copia)`,
            description: originalSchedule.description,
            startdate: startdate || null,
            enddate: enddate || null,
            schedule: originalSchedule.schedule,
            isactive: true,
            status: "active",
            createdby: req.HRid,
            organizationID: req.ORGID
        })

        await duplicatedSchedule.save()

        return res.status(201).json({
            success: true,
            message: "Horario duplicado exitosamente",
            data: duplicatedSchedule
        })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

// ── HR: Cerrar horario ────────────────────────────────────────────────────────
export const HandleCloseSchedule = async (req, res) => {
    try {
        const { scheduleID } = req.params

        const schedule = await Schedule.findOne({
            _id: scheduleID,
            organizationID: req.ORGID
        })

        if (!schedule) {
            return res.status(404).json({ success: false, message: "Horario no encontrado" })
        }

        if (schedule.status === "closed") {
            return res.status(400).json({ success: false, message: "El horario ya está cerrado" })
        }

        schedule.status = "closed"
        schedule.closedAt = new Date()
        await schedule.save()

        return res.status(200).json({
            success: true,
            message: "Horario cerrado exitosamente",
            data: schedule
        })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

// ── CRON: Cerrar horarios vencidos ───────────────────────────────────────────
export const HandleCloseExpiredSchedules = async (req, res) => {
    const startTime = new Date().toISOString()
    console.log(`[CRON] close-expired INICIADO — ${startTime}`)
    try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const result = await Schedule.updateMany(
            {
                status: "active",
                enddate: { $lt: today }
            },
            {
                status: "closed",
                closedAt: new Date()
            }
        )

        console.log(`[CRON] close-expired FINALIZADO — ${result.modifiedCount} horarios cerrados — ${new Date().toISOString()}`)

        return res.status(200).json({
            success: true,
            message: `Se cerraron ${result.modifiedCount} horarios vencidos`,
            data: { modifiedCount: result.modifiedCount }
        })

    } catch (error) {
        console.error(`[CRON] ERROR en close-expired:`, error.message, error.stack)
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

// ── CRON: Registro de ausencias por tareas no completadas ─────────────
export const HandleRegisterDailyAbsences = async (req, res) => {
    const startTime = new Date().toISOString()
    try {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        yesterday.setHours(0, 0, 0, 0)

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const yesterdayDayName = DAYS_ORDER[yesterday.getDay()]

        console.log(`[CRON] register-absences INICIADO — ${startTime} — ayer: ${yesterdayDayName}`)

        const activeSchedules = await Schedule.find({
            status: "active",
            startdate: { $lte: yesterday },
            enddate: { $gte: yesterday }
        })

        let absencesRegistered = 0

        for (const schedule of activeSchedules) {
            const daySchedule = schedule.schedule.find(d => d.day === yesterdayDayName)

            if (!daySchedule || !daySchedule.tasks || daySchedule.tasks.length === 0) {
                continue
            }

            const incompleteTasks = daySchedule.tasks.filter(t => !t.completed)

            if (incompleteTasks.length > 0) {
                // ── Verificar que no exista ausencia duplicada ─────────────────
                const existingAbsence = await Absence.findOne({
                    employee: schedule.employee,
                    scheduleId: schedule._id,
                    startdate: { $gte: yesterday, $lt: today },
                    leavetype: "Tarea No Realizada"
                })
                if (existingAbsence) {
                    console.log(`[CRON] Ausencia ya existe para empleado ${schedule.employee} en fecha ${yesterday.toISOString().split('T')[0]} — saltando`)
                    continue
                }

                const taskNames = incompleteTasks.map(t => t.title).join(", ")

                await Absence.create({
                    employee: schedule.employee,
                    leaveRequest: null,
                    scheduleId: schedule._id,
                    startdate: yesterday,
                    enddate: yesterday,
                    leavetype: "Tarea No Realizada",
                    title: "Ausencia por Tarea No Realizada",
                    reason: `Tareas no completadas del ${yesterdayDayName}: ${taskNames}`,
                    createdBy: req.HRid || req.EMPID,
                    organizationID: schedule.organizationID
                })

                absencesRegistered++
            }
        }

        console.log(`[CRON] register-absences FINALIZADO — ${absencesRegistered} ausencias registradas — ${new Date().toISOString()}`)

        return res.status(200).json({
            success: true,
            message: `Se registraron ${absencesRegistered} ausencias por tareas no completadas`,
            data: { absencesRegistered }
        })

    } catch (error) {
        console.error(`[CRON] ERROR en register-absences:`, error.message, error.stack)
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}
