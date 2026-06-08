import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { HandleEmployeeDashboard } from "../../../redux/Thunks/EmployeeDashboardThunk.js"
import { Loading } from "../../../components/common/loading.jsx"
import { LogIn, LogOut, Clock, CheckCircle2, Circle, CalendarDays, AlertCircle, Building2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useIsDark } from "../../../hooks/useIsDark.js"

const DAYS_ES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

const formatTime = (dateStr) => {
    if (!dateStr) return "--:--"
    return new Date(dateStr).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
}

const formatDuration = (minutes) => {
    if (!minutes) return null
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return h > 0 ? `${h}h ${m}m` : `${m}m`
}

// ── Tokens de contraste actualizados ─────────────────────────────────────
// Claro:  card bg = #f0f2ff  |  border = #c7d2fe  |  shadow = blue glow
// Oscuro: card bg = rgba(255,255,255,0.05)  |  border = rgba(255,255,255,0.12)
// Sub-card claro:  bg = #ffffff  |  border = #e0e7ff
// Sub-card oscuro: bg = rgba(255,255,255,0.06)  |  border = rgba(255,255,255,0.1)

const CARD = {
    light: {
        bg: "#f0f2ff",
        border: "#a5b4fc",
        shadow: "0 2px 16px rgba(99,102,241,0.12), 0 1px 4px rgba(0,0,0,0.06)",
    },
    dark: {
        bg: "rgba(255,255,255,0.05)",
        border: "rgba(255,255,255,0.12)",
        shadow: "0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)",
    },
}

const SUBCARD = {
    light: { bg: "#ffffff", border: "#c7d2fe" },
    dark: { bg: "rgba(255,255,255,0.07)", border: "rgba(255,255,255,0.12)" },
}

export const EmployeeHomePage = () => {
    const dispatch = useDispatch()
    const { toast } = useToast()
    const { attendance, schedules, isLoading } = useSelector(s => s.employeedashboardreducer)
    const employeeData = useSelector(s => s.employeereducer.data?.employee)
    const [actionLoading, setActionLoading] = useState(false)
    const isDark = useIsDark()

    // Datos del empleado actual
    const empName = employeeData?.firstname && employeeData?.lastname 
        ? `${employeeData.firstname} ${employeeData.lastname}` 
        : null
    const empDepartment = employeeData?.department?.name || employeeData?.position || null
    const showDepartmentDescription = false // ← Cambiar a true para mostrar el Manual General

    const today = new Date()
    const todayStr = today.toISOString().split("T")[0]
    const todayDay = DAYS_ES[today.getDay()]

    useEffect(() => {
        dispatch(HandleEmployeeDashboard({ type: "MyAttendance" }))
        dispatch(HandleEmployeeDashboard({ type: "MySchedules" }))
    }, [])

    const todayLog = attendance?.attendancelog?.find(
        l => new Date(l.logdate).toISOString().split("T")[0] === todayStr
    )

    const hasCheckedIn = !!todayLog?.checkin
    const hasCheckedOut = !!todayLog?.checkout

    // Filtrar horarios activos Y no vencidos
    const todayNormalized = new Date(today)
    todayNormalized.setHours(0, 0, 0, 0)
    
    const activeSchedule = schedules?.find(s => {
        if (!s.isactive && s.isactive !== undefined) return false
        // Verificar que no esté vencido
        const endDate = new Date(s.enddate)
        endDate.setHours(0, 0, 0, 0)
        if (endDate < todayNormalized) return false
        // Verificar que today esté dentro del rango de fechas
        const startDate = new Date(s.startdate)
        startDate.setHours(0, 0, 0, 0)
        return startDate <= todayNormalized
    })
    
    // Solo mostrar tareas del día de hoy (no de cualquier día)
    const todayDayName = DAYS_ES[today.getDay()]
    const todayTasks = activeSchedule?.schedule?.find(d => d.day === todayDayName)?.tasks || []
    const hasActiveSchedule = !!activeSchedule

    const card = isDark ? CARD.dark : CARD.light
    const subcard = isDark ? SUBCARD.dark : SUBCARD.light

    const handleCheckIn = async () => {
        setActionLoading(true)
        const res = await dispatch(HandleEmployeeDashboard({ type: "CheckIn" }))
        setActionLoading(false)
        if (res.payload?.success) {
            toast({ variant: "success", title: "Entrada registrada", description: `${formatTime(res.payload?.data?.attendancelog?.at(-1)?.checkin)}` })
        } else {
            toast({ variant: "destructive", title: "Error", description: res.payload?.message })
        }
    }

    const handleCheckOut = async () => {
        setActionLoading(true)
        const res = await dispatch(HandleEmployeeDashboard({ type: "CheckOut" }))
        setActionLoading(false)
        if (res.payload?.success) {
            toast({ variant: "success", title: "Salida registrada", description: `Jornada: ${formatDuration(res.payload?.data?.attendancelog?.at(-1)?.duration)}` })
        } else {
            toast({ variant: "destructive", title: "Error", description: res.payload?.message })
        }
    }

    const handleCompleteTask = async (scheduleID, dayID, taskID) => {
        await dispatch(HandleEmployeeDashboard({
            type: "CompleteTask",
            data: { scheduleID, dayID, taskID }
        }))
    }

    if (isLoading && !attendance) return <Loading />

    return (
        <div className="flex flex-col w-full px-4 py-6 gap-6 overflow-y-auto min-h-full
            bg-white dark:bg-[#0f0f1a]">

            {/* Header */}
            <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-1
                    text-blue-500 dark:text-blue-400">
                    Mi Panel
                </p>
                <h1 className="text-2xl xl:text-3xl font-bold tracking-tight
                    text-gray-900 dark:text-white">
                    {empName ? `Bienvenido, ${empName} 👋` : "Bienvenido 👋"}
                </h1>
                {empDepartment && (
                    <p className="text-xs font-semibold text-blue-500 dark:text-blue-400">
                        {empDepartment}
                    </p>
                )}
                <p className="text-sm mt-1 text-gray-400 dark:text-gray-500">
                    {today.toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
            </div>

            {/* Grid principal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* ── Card checkin/checkout ──────────────────────────────── */}
                <div className="rounded-2xl p-5 flex flex-col gap-4"
                    style={{
                        background: card.bg,
                        border: `1px solid ${card.border}`,
                        boxShadow: card.shadow,
                    }}>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em]
                                text-blue-500 dark:text-blue-400">
                                Jornada de hoy
                            </p>
                            <h2 className="text-base font-bold mt-0.5
                                text-gray-900 dark:text-white">
                                Control de asistencia
                            </h2>
                        </div>
                        <div className={`w-2.5 h-2.5 rounded-full transition-colors ${hasCheckedIn && !hasCheckedOut
                                ? "bg-emerald-400 animate-pulse"
                                : "bg-gray-300 dark:bg-[rgba(255,255,255,0.15)]"
                            }`} />
                    </div>

                    {/* Horas */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl p-4 flex flex-col gap-1"
                            style={{
                                background: subcard.bg,
                                border: `1px solid ${subcard.border}`,
                            }}>
                            <p className="text-[10px] font-semibold uppercase tracking-wider
                                text-gray-400 dark:text-gray-500">
                                Entrada
                            </p>
                            <p className={`text-2xl font-bold tracking-tight ${hasCheckedIn
                                    ? "text-emerald-500"
                                    : "text-gray-300 dark:text-[rgba(255,255,255,0.15)]"
                                }`}>
                                {hasCheckedIn ? formatTime(todayLog.checkin) : "--:--"}
                            </p>
                        </div>
                        <div className="rounded-xl p-4 flex flex-col gap-1"
                            style={{
                                background: subcard.bg,
                                border: `1px solid ${subcard.border}`,
                            }}>
                            <p className="text-[10px] font-semibold uppercase tracking-wider
                                text-gray-400 dark:text-gray-500">
                                Salida
                            </p>
                            <p className={`text-2xl font-bold tracking-tight ${hasCheckedOut
                                    ? "text-red-400"
                                    : "text-gray-300 dark:text-[rgba(255,255,255,0.15)]"
                                }`}>
                                {hasCheckedOut ? formatTime(todayLog.checkout) : "--:--"}
                            </p>
                        </div>
                    </div>

                    {/* Duración */}
                    {hasCheckedOut && todayLog?.duration && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                            style={{
                                background: isDark ? "rgba(99,102,241,0.12)" : "#eef2ff",
                                border: `1px solid ${isDark ? "rgba(99,102,241,0.25)" : "#c7d2fe"}`,
                            }}>
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                Jornada: {formatDuration(todayLog.duration)}
                            </span>
                        </div>
                    )}

                    {/* Botones */}
                    <div className="flex gap-3 mt-auto">
                        <button
                            onClick={handleCheckIn}
                            disabled={hasCheckedIn || actionLoading}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl
                                text-sm font-semibold transition-all duration-200
                                bg-emerald-500 text-white hover:bg-emerald-600
                                disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <LogIn className="w-4 h-4" />
                            Entrada
                        </button>
                        <button
                            onClick={handleCheckOut}
                            disabled={!hasCheckedIn || hasCheckedOut || actionLoading}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl
                                text-sm font-semibold transition-all duration-200
                                bg-red-400 text-white hover:bg-red-500
                                disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <LogOut className="w-4 h-4" />
                            Salida
                        </button>
                    </div>
                </div>

                {/* ── Tareas de hoy ─────────────────────────────────────── */}
                <div className="rounded-2xl p-5 flex flex-col gap-4"
                    style={{
                        background: card.bg,
                        border: `1px solid ${card.border}`,
                        boxShadow: card.shadow,
                    }}>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em]
                                text-blue-500 dark:text-blue-400">
                                {todayDay}
                            </p>
                            <h2 className="text-base font-bold mt-0.5
                                text-gray-900 dark:text-white">
                                Tareas del día
                            </h2>
                        </div>
                        {todayTasks.length > 0 && (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                                style={{
                                    background: isDark ? "rgba(99,102,241,0.15)" : "#eef2ff",
                                    color: isDark ? "#a5b4fc" : "#4f46e5",
                                    border: `1px solid ${isDark ? "rgba(99,102,241,0.3)" : "#c7d2fe"}`,
                                }}>
                                {todayTasks.filter(t => t.completed).length}/{todayTasks.length}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 overflow-y-auto max-h-[280px]">
                        {!hasActiveSchedule ? (
                            <div className="flex flex-col items-center justify-center py-8 gap-2">
                                <CalendarDays className="w-8 h-8"
                                    style={{ color: isDark ? "rgba(255,255,255,0.15)" : "#d1d5db" }} />
                                <p className="text-sm text-gray-400 dark:text-gray-600">
                                    Sin horario activo
                                </p>
                            </div>
                        ) : todayTasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 gap-2">
                                <CalendarDays className="w-8 h-8"
                                    style={{ color: isDark ? "rgba(255,255,255,0.15)" : "#d1d5db" }} />
                                <p className="text-sm text-gray-400 dark:text-gray-600">
                                    Sin tareas para hoy
                                </p>
                            </div>
                        ) : (
                            todayTasks.map(task => (
                                <button
                                    key={task._id}
                                    onClick={() => handleCompleteTask(
                                        activeSchedule._id,
                                        activeSchedule.schedule.find(d => d.day === todayDay)._id,
                                        task._id
                                    )}
                                    className="flex items-start gap-3 p-3 rounded-xl text-left w-full
                                        transition-all duration-150"
                                    style={{
                                        border: `1px solid transparent`,
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "#ffffff"
                                        e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.1)" : "#e0e7ff"
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = "transparent"
                                        e.currentTarget.style.borderColor = "transparent"
                                    }}
                                >
                                    {task.completed
                                        ? <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-500" />
                                        : <Circle className="w-4 h-4 mt-0.5 flex-shrink-0"
                                            style={{ color: isDark ? "rgba(255,255,255,0.2)" : "#d1d5db" }} />
                                    }
                                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                        <p className={`text-sm font-medium truncate ${task.completed
                                                ? "line-through text-gray-400 dark:text-[rgba(255,255,255,0.3)]"
                                                : "text-gray-800 dark:text-[rgba(255,255,255,0.85)]"
                                            }`}>
                                            {task.title}
                                        </p>
                                        <p className="text-[11px] text-gray-400 dark:text-[rgba(255,255,255,0.35)]">
                                            {task.starttime} — {task.endtime}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Sin horario activo */}
            {!activeSchedule && !isLoading && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{
                        background: isDark ? "rgba(245,158,11,0.1)" : "#fffbeb",
                        border: `1px solid ${isDark ? "rgba(245,158,11,0.25)" : "#fde68a"}`,
                    }}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-yellow-500" />
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                        No tienes un horario activo asignado. Contacta a tu supervisor.
                    </p>
                </div>
            )}

            {/* Manual General — Descripción del departamento (oculto hasta activarlo) */}
            {showDepartmentDescription && (
                <>
                    {employeeData?.department ? (
                        <div className="rounded-2xl p-5 flex flex-col gap-4"
                            style={{
                                background: card.bg,
                                border: `1px solid ${card.border}`,
                                boxShadow: card.shadow,
                            }}>
                            <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em]
                                    text-blue-500 dark:text-blue-400">
                                    Manual General
                                </p>
                            </div>
                            <div
                                className="text-sm text-gray-500 dark:text-[rgba(255,255,255,0.4)]
                                    prose prose-sm max-w-none
                                    [&_h2]:text-gray-700 [&_h2]:font-bold [&_h2]:text-sm [&_h2]:mt-2 [&_h2]:mb-1
                                    [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-1
                                    [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:my-1
                                    [&_li]:mb-0.5 [&_strong]:font-semibold [&_strong]:text-gray-600
                                    [&_>_p]:my-3
                                    [&_hr]:border-gray-200 [&_hr]:my-2
                                    dark:[&_h2]:text-[rgba(255,255,255,0.7)] dark:[&_strong]:text-[rgba(255,255,255,0.6)]
                                    dark:[&_hr]:border-[rgba(255,255,255,0.08)]"
                                dangerouslySetInnerHTML={{ __html: employeeData.department.description }}
                            />
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                            style={{
                                background: isDark ? "rgba(245,158,11,0.1)" : "#fffbeb",
                                border: `1px solid ${isDark ? "rgba(245,158,11,0.25)" : "#fde68a"}`,
                            }}>
                            <AlertCircle className="w-4 h-4 flex-shrink-0 text-yellow-500" />
                            <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                No tienes un departamento asignado. Contacta a tu supervisor.
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
