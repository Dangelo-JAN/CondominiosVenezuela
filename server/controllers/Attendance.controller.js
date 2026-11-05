import { Attendance } from "../models/Attendance.model.js"
import { Employee } from "../models/Employee.model.js"
import { Schedule } from "../models/Schedule.model.js"
import { Absence } from "../models/Absence.model.js"

const DAYS_ORDER = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

export const HandleInitializeAttendance = async (req, res) => {
    try {
        const { employeeID } = req.body

        if (!employeeID) {
            return res.status(400).json({ success: false, message: "All fields are required" })
        }

        const employee = await Employee.findOne({ _id: employeeID, organizationID: req.ORGID })

        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" })
        }

        if (employee.attendance) {
            return res.status(400).json({ success: false, message: "Attendance Log already initialized for this employee" })
        }

        const currentdate = new Date().toISOString().split("T")[0]
        const attendancelog = {
            logdate: currentdate,
            logstatus: "Not Specified"
        }

        const newAttendance = await Attendance.create({
            employee: employeeID,
            status: "Not Specified",
            organizationID: req.ORGID
        })

        newAttendance.attendancelog.push(attendancelog)
        employee.attendance = newAttendance._id

        await employee.save()
        await newAttendance.save()

        return res.status(200).json({ success: true, message: "Attendance Log Initialized Successfully", data: newAttendance })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleAllAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find({ organizationID: req.ORGID }).populate("employee", "firstname lastname department")
        return res.status(200).json({ success: true, message: "All attendance records retrieved successfully", data: attendance })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleAttendance = async (req, res) => {
    try {
        const { attendanceID } = req.params

        if (!attendanceID) {
            return res.status(400).json({ success: false, message: "All fields are required" })
        }

        const attendance = await Attendance.findOne({ _id: attendanceID, organizationID: req.ORGID }).populate("employee", "firstname lastname department")

        if (!attendance) {
            return res.status(404).json({ success: false, message: "Attendance not found" })
        }

        return res.status(200).json({ success: true, message: "Attendance record retrieved successfully", data: attendance })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleUpdateAttendance = async (req, res) => {
    try {
        const { attendanceID, status, currentdate } = req.body

        const attendance = await Attendance.findOne({ _id: attendanceID, organizationID: req.ORGID })

        if (!attendance) {
            return res.status(404).json({ success: false, message: "Attendance not found" })
        }

        const FindDate = attendance.attendancelog.find((item) => item.logdate.toISOString().split("T")[0] === currentdate)

        if (!FindDate) {
            const newLog = {
                logdate: currentdate,
                logstatus: status
            }
            attendance.attendancelog.push(newLog)
        } else {
            FindDate.logstatus = status
        }

        await attendance.save()
        return res.status(200).json({ success: true, message: "Attendance status updated successfully", data: attendance })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

// ✅ NUEVO — Marcar hora de entrada
export const HandleCheckIn = async (req, res) => {
    try {
        const employeeID = req.EMPID
        const now = new Date()
        const currentdate = now.toISOString().split("T")[0]

        const employee = await Employee.findOne({ _id: employeeID, organizationID: req.ORGID })

        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" })
        }

        let attendance

        // Auto-inicializar asistencia si no existe
        if (!employee.attendance) {
            attendance = await Attendance.create({
                employee: employeeID,
                status: "Present",
                organizationID: req.ORGID
            })
            employee.attendance = attendance._id
            await employee.save()
        } else {
            attendance = await Attendance.findOne({ _id: employee.attendance, organizationID: req.ORGID })
        }

        if (!attendance) {
            return res.status(404).json({ success: false, message: "Attendance record not found" })
        }

        // Buscar el log de hoy
        let todayLog = attendance.attendancelog.find(
            (item) => item.logdate.toISOString().split("T")[0] === currentdate
        )

        if (!todayLog) {
            attendance.attendancelog.push({
                logdate: now,
                logstatus: "Present",
                checkin: now,
                checkout: null,
                duration: null
            })
        } else {
            if (todayLog.checkin) {
                return res.status(400).json({ success: false, message: "Ya marcaste tu entrada hoy" })
            }
            todayLog.checkin = now
            todayLog.logstatus = "Present"
        }

        attendance.status = "Present"
        await attendance.save()

        return res.status(200).json({
            success: true,
            message: "Hora de entrada registrada exitosamente",
            data: attendance
        })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

// ✅ NUEVO — Marcar hora de salida
export const HandleCheckOut = async (req, res) => {
    try {
        const employeeID = req.EMPID
        const now = new Date()
        const currentdate = now.toISOString().split("T")[0]

        const employee = await Employee.findOne({ _id: employeeID, organizationID: req.ORGID })

        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" })
        }

        if (!employee.attendance) {
            return res.status(400).json({ success: false, message: "Attendance not initialized for this employee" })
        }

        const attendance = await Attendance.findOne({ _id: employee.attendance, organizationID: req.ORGID })

        if (!attendance) {
            return res.status(404).json({ success: false, message: "Attendance record not found" })
        }

        const todayLog = attendance.attendancelog.find(
            (item) => item.logdate.toISOString().split("T")[0] === currentdate
        )

        if (!todayLog || !todayLog.checkin) {
            return res.status(400).json({ success: false, message: "Debes marcar tu entrada antes de marcar la salida" })
        }

        if (todayLog.checkout) {
            return res.status(400).json({ success: false, message: "Ya marcaste tu salida hoy" })
        }

        // Calcular duración en minutos
        const durationMinutes = Math.round((now - todayLog.checkin) / 60000)

        todayLog.checkout = now
        todayLog.duration = durationMinutes

        await attendance.save()

        // ✅ Registrar ausencias por tareas no completadas del día ACTUAL (no ayer)
        const currentDate = new Date(now)
        currentDate.setHours(0, 0, 0, 0)
        const currentDayName = DAYS_ORDER[currentDate.getDay()]

        const activeSchedule = await Schedule.findOne({
            employee: employeeID,
            isactive: true,
            startdate: { $lte: now },
            enddate: { $gte: now }
        })

        if (activeSchedule) {
            const daySchedule = activeSchedule.schedule.find(d => d.day === currentDayName)
            if (daySchedule && daySchedule.tasks && daySchedule.tasks.length > 0) {
                const incompleteTasks = daySchedule.tasks.filter(t => !t.completed)
                if (incompleteTasks.length > 0) {
                    const taskNames = incompleteTasks.map(t => t.title).join(", ")
                    await Absence.create({
                        employee: employeeID,
                        leaveRequest: null,
                        scheduleId: activeSchedule._id,
                        startdate: currentDate,
                        enddate: currentDate,
                        leavetype: "Tarea No Realizada",
                        title: "Ausencia por Tarea No Realizada",
                        reason: `Tareas no completadas del ${currentDayName}: ${taskNames}`,
                        createdBy: employeeID,
                        organizationID: req.ORGID
                    })
                }
            }
        }

        return res.status(200).json({
            success: true,
            message: "Hora de salida registrada exitosamente",
            data: attendance
        })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

// ✅ NUEVO — Obtener asistencia del empleado autenticado
export const HandleGetMyAttendance = async (req, res) => {
    try {
        const employeeID = req.EMPID

        const employee = await Employee.findOne({ _id: employeeID, organizationID: req.ORGID })

        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" })
        }

        // Si no tiene asistencia inicializada retornar objeto vacío — el frontend lo maneja
        if (!employee.attendance) {
            return res.status(200).json({
                success: true,
                message: "No attendance record found",
                data: { attendancelog: [] }
            })
        }

        const attendance = await Attendance.findById(employee.attendance)

        if (!attendance) {
            return res.status(200).json({
                success: true,
                message: "No attendance record found",
                data: { attendancelog: [] }
            })
        }

        return res.status(200).json({
            success: true,
            message: "Attendance retrieved successfully",
            data: attendance
        })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleDeleteAttendance = async (req, res) => {
    try {
        const { attendanceID } = req.params
        const attendance = await Attendance.findOne({ _id: attendanceID, organizationID: req.ORGID })

        if (!attendance) {
            return res.status(404).json({ success: false, message: "Attendance not found" })
        }

        const employee = await Employee.findById(attendance.employee)
        employee.attendance = null

        await employee.save()
        await attendance.deleteOne()

        return res.status(200).json({ success: true, message: "Attendance record deleted successfully" })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}
