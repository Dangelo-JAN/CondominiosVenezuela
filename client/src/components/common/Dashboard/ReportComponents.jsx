import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { useIsDark } from "../../../hooks/useIsDark.js"
import { HandleGetCurrentReport } from "../../../redux/Thunks/ReportThunk.js"
import { Loading } from "../loading.jsx"
import {
    FileText, CheckCircle2, Camera, LogIn, CalendarDays,
    ClipboardList, Lock, ArrowRight
} from "lucide-react"

// ── Tokens del módulo Reportes (familia Novedades — acento yellow) ────────
// Claro:  accent text #ca8a04 | bg #fef9c3 | border rgba(252,227,0,0.25)
// Oscuro: accent #facc15     | bg rgba(252,227,0,0.10) | border rgba(252,227,0,0.30)

export const YELLOW = (isDark) => ({
    text: isDark ? "#facc15" : "#ca8a04",
    bg: isDark ? "rgba(252,227,0,0.10)" : "#fef9c3",
    bgSoft: isDark ? "rgba(252,227,0,0.05)" : "rgba(254,249,195,0.5)",
    border: isDark ? "1px solid rgba(252,227,0,0.30)" : "1px solid rgba(252,227,0,0.30)",
    divider: isDark ? "rgba(252,227,0,0.08)" : "#fef9c3"
})

const formatDate = (dateStr) => {
    if (!dateStr) return "--"
    return new Date(dateStr).toLocaleDateString("es-ES", {
        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
    })
}

const formatMinutes = (minutes) => {
    if (!minutes) return null
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return h > 0 ? `${h}h ${m}m` : `${m}m`
}

const getInitials = (name) => {
    if (!name) return "??"
    const parts = name.trim().split(" ")
    return `${(parts[0] || "")[0] || ""}${(parts[1] || "")[0] || ""}`.toUpperCase()
}

// ── Badge de modo ──────────────────────────────────────────────────────────
export const ReportModeBadge = ({ mode }) => {
    const isDark = useIsDark()
    const y = YELLOW(isDark)

    const config = {
        WEEK_START: { label: "Semana iniciando", live: false },
        DAILY: { label: "Borrador diario", live: false },
        WEEKLY_LIVE: { label: "En vivo · preliminar", live: true }
    }[mode] || { label: mode, live: false }

    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors duration-300"
            style={{ background: y.bg, color: y.text, border: y.border }}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.live ? "animate-pulse" : ""}`}
                style={{ background: y.text }} />
            {config.label}
        </span>
    )
}

// ── Fila de actividad individual ───────────────────────────────────────────
const ACTIVITY_ICONS = {
    bitacora: { Icon: FileText, key: "Bitácora" },
    task_completed: { Icon: CheckCircle2, key: "Tarea" },
    work_photo: { Icon: Camera, key: "Foto" },
    attendance: { Icon: LogIn, key: "Jornada" }
}

export const ActivityRow = ({ activity }) => {
    const isDark = useIsDark()
    const y = YELLOW(isDark)
    const { Icon, key } = ACTIVITY_ICONS[activity.type] || { Icon: ClipboardList, key: "Actividad" }

    const metaParts = []
    if (activity.meta?.dayName) metaParts.push(activity.meta.dayName)
    if (activity.meta?.starttime) metaParts.push(`${activity.meta.starttime}–${activity.meta.endtime}`)
    if (activity.type === "attendance" && activity.meta?.durationMinutes) {
        metaParts.push(formatMinutes(activity.meta.durationMinutes))
    }

    return (
        <div className="flex items-start gap-2.5 py-1.5">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: y.bg }}>
                <Icon className="w-3 h-3" style={{ color: y.text }} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate text-gray-800 dark:text-white/90" title={activity.title}>
                    {activity.title}
                </p>
                {(metaParts.length > 0 || activity.date) && (
                    <p className="text-[10px]" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#9ca3af" }}>
                        {[key, ...metaParts].join(" · ")} · {formatDate(activity.date)}
                    </p>
                )}
            </div>
        </div>
    )
}

// ── Barra de totales ───────────────────────────────────────────────────────
export const ReportTotalsBar = ({ totals }) => {
    if (!totals) return null
    const chips = [
        { label: "Bitácoras", value: totals.bitacoras },
        { label: "Tareas", value: totals.tasksCompleted },
        { label: "Fotos", value: totals.workPhotos },
        { label: "Entradas", value: totals.checkIns },
        { label: "Horas", value: formatMinutes(totals.totalMinutes) ?? "0m" }
    ]
    return (
        <div className="flex flex-wrap gap-2">
            {chips.map(c => (
                <TotalChip key={c.label} label={c.label} value={c.value} />
            ))}
        </div>
    )
}

const TotalChip = ({ label, value }) => {
    const isDark = useIsDark()
    const y = YELLOW(isDark)
    return (
        <div className="px-3 py-1.5 rounded-xl flex items-center gap-2"
            style={{ background: y.bgSoft, border: `1px solid ${isDark ? "rgba(252,227,0,0.15)" : "#fef08a"}` }}>
            <span className="text-sm font-bold" style={{ color: y.text }}>{value}</span>
            <span className="text-[10px] font-medium uppercase tracking-wider"
                style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#a16207" }}>
                {label}
            </span>
        </div>
    )
}

// ── Grupo de actividades por empleado ──────────────────────────────────────
export const EmployeeActivityGroup = ({ employee, maxActivities = null }) => {
    const isDark = useIsDark()
    const y = YELLOW(isDark)
    const activities = maxActivities ? employee.activities.slice(0, maxActivities) : employee.activities

    return (
        <div className="rounded-xl p-3 transition-colors duration-300"
            style={{
                background: isDark ? "rgba(255,255,255,0.04)" : "#ffffff",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.10)" : "#fef08a"}`
            }}>
            <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{ background: y.bg, color: y.text }}>
                    {getInitials(employee.employeeName)}
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-semibold truncate text-gray-800 dark:text-white">
                        {employee.employeeName}
                    </p>
                    <p className="text-[10px] truncate" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#9ca3af" }}>
                        {employee.departmentName ?? "Sin departamento"}
                    </p>
                </div>
                <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: y.bg, color: y.text }}>
                    {employee.activities.length} act.
                </span>
            </div>
            <div className="divide-y" style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "#fef9c3" }}>
                {activities.map((act, i) => (
                    <ActivityRow key={`${act.refId ?? i}-${act.type}`} activity={act} />
                ))}
            </div>
        </div>
    )
}

// ── Estado vacío explícito (lunes / sin actividades) ───────────────────────
export const ReportEmptyState = ({ title, message }) => {
    const isDark = useIsDark()
    const y = YELLOW(isDark)
    return (
        <div className="flex flex-col items-center justify-center py-8 px-4 gap-2 rounded-xl"
            style={{ background: y.bgSoft, border: `1px dashed ${isDark ? "rgba(252,227,0,0.20)" : "#fef08a"}` }}>
            <CalendarDays className="w-7 h-7" style={{ color: y.text }} />
            <p className="text-sm font-semibold" style={{ color: y.text }}>{title}</p>
            <p className="text-xs text-center" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#a16207" }}>
                {message}
            </p>
        </div>
    )
}

// ── Banner preliminar (Vie–Dom) ────────────────────────────────────────────
export const PreliminaryBanner = ({ banner }) => {
    const isDark = useIsDark()
    if (!banner) return null
    return (
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
            style={{
                background: isDark ? "rgba(99,102,241,0.12)" : "#eef2ff",
                border: `1px solid ${isDark ? "rgba(99,102,241,0.30)" : "#c7d2fe"}`
            }}>
            <ClipboardList className="w-3.5 h-3.5 flex-shrink-0 text-blue-500 dark:text-blue-400" />
            <p className="text-xs font-medium text-blue-600 dark:text-blue-300">
                {banner.message}
            </p>
        </div>
    )
}

// ════════════════════════════════════════════════════════════════════════
// CARD COMPACTA — para el dashboard principal HR (self-contained)
// ════════════════════════════════════════════════════════════════════════
export const ReportCompactCard = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { currentReport, isLoading } = useSelector(s => s.reportreducer)
    const isDark = useIsDark()
    const y = YELLOW(isDark)

    useEffect(() => {
        dispatch(HandleGetCurrentReport())
    }, [dispatch])

    const daily = currentReport?.daily
    const hasDailyData = daily && (daily.totals.bitacoras + daily.totals.tasksCompleted +
        daily.totals.workPhotos + daily.totals.checkIns) > 0

    return (
        <div className="rounded-2xl p-5 flex flex-col gap-4 transition-all duration-300"
            style={{
                background: isDark ? "linear-gradient(135deg, rgba(252,227,0,0.06) 0%, rgba(255,255,255,0.02) 100%)" : "linear-gradient(135deg, #fefce8 0%, #ffffff 60%)",
                border: `1px solid ${isDark ? "rgba(252,227,0,0.25)" : "#fef08a"}`,
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)"
            }}>

            {/* Header */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: y.bg }}>
                        <ClipboardList className="w-4.5 h-4.5" style={{ color: y.text }} />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: y.text }}>
                            Reporte de Actividades
                        </p>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white">
                            {currentReport?.mode === "WEEK_START"
                                ? "Nueva semana laboral"
                                : currentReport?.mode === "WEEKLY_LIVE"
                                    ? "Resumen semanal en curso"
                                    : `Actividades${currentReport?.dailyWindow?.label ? ` del ${currentReport.dailyWindow.label}` : " recientes"}`}
                        </h2>
                    </div>
                </div>
                {currentReport && <ReportModeBadge mode={currentReport.mode} />}
            </div>

            {/* Banner preliminar */}
            {currentReport?.banner && <PreliminaryBanner banner={currentReport.banner} />}

            {/* Contenido */}
            {isLoading && !currentReport ? (
                <Loading />
            ) : !currentReport || currentReport.mode === "WEEK_START" ? (
                <ReportEmptyState
                    title="La semana está iniciando"
                    message="Las actividades del equipo aparecerán aquí a partir del primer día registrado."
                />
            ) : (
                <>
                    <ReportTotalsBar totals={hasDailyData ? daily.totals : currentReport.weekly?.totals} />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {hasDailyData && daily.employees.slice(0, 3).map(emp => (
                            <EmployeeActivityGroup key={String(emp.employee)} employee={emp} maxActivities={3} />
                        ))}
                    </div>

                    {hasDailyData === false && currentReport.weekly && (
                        <ReportEmptyState
                            title="Sin actividades registradas ayer"
                            message="El resumen semanal preliminar está disponible en la página de reportes."
                        />
                    )}
                </>
            )}

            {/* Link a página completa */}
            <button
                onClick={() => navigate("/HR/dashboard/reports")}
                className="self-start inline-flex items-center gap-1.5 text-xs font-semibold hover:gap-2.5 transition-all duration-200"
                style={{ color: y.text }}>
                Ver reporte completo e histórico
                <ArrowRight className="w-3.5 h-3.5" />
            </button>
        </div>
    )
}

