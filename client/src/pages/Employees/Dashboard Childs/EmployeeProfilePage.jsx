import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { HandleEmployeeDashboard } from "../../../redux/Thunks/EmployeeDashboardThunk.js"
import { HandleGetEmployees } from "../../../redux/Thunks/EmployeeThunk.js"
import { Loading } from "../../../components/common/loading.jsx"
import { useIsDark } from "../../../hooks/useIsDark.js"
import {
    User, Mail, Phone, Building2, ShieldCheck,
    ShieldAlert, Clock, CalendarDays, FileText,
    DollarSign, Briefcase, ClipboardList
} from "lucide-react"

const formatDate = (d) => d ? new Date(d).toLocaleDateString("es-ES", {
    day: "numeric", month: "long", year: "numeric"
}) : "—"

const formatTime = (d) => d ? new Date(d).toLocaleTimeString("es-ES", {
    hour: "2-digit", minute: "2-digit"
}) : "—"

// Mapa de colores de acento → valores concretos para claro y oscuro
const ACCENT_MAP = {
    "#003DA5": { lightBg: "#e0e7ff", lightBorder: "#a5b4fc", darkBg: "rgba(99,102,241,0.2)", darkBorder: "rgba(99,102,241,0.4)" },
    "#8b5cf6": { lightBg: "#ede9fe", lightBorder: "#c4b5fd", darkBg: "rgba(139,92,246,0.2)", darkBorder: "rgba(139,92,246,0.4)" },
    "#06b6d4": { lightBg: "#cffafe", lightBorder: "#67e8f9", darkBg: "rgba(6,182,212,0.2)", darkBorder: "rgba(6,182,212,0.4)" },
    "#f59e0b": { lightBg: "#fef3c7", lightBorder: "#fcd34d", darkBg: "rgba(245,158,11,0.2)", darkBorder: "rgba(245,158,11,0.4)" },
    "#10b981": { lightBg: "#d1fae5", lightBorder: "#6ee7b7", darkBg: "rgba(16,185,129,0.2)", darkBorder: "rgba(16,185,129,0.4)" },
    "#ef4444": { lightBg: "#fee2e2", lightBorder: "#fca5a5", darkBg: "rgba(239,68,68,0.2)", darkBorder: "rgba(239,68,68,0.4)" },
}

// ── Tarjeta de información ────────────────────────────────────────────────
const InfoCard = ({ icon: Icon, label, value, accent, isDark }) => {
    const colors = ACCENT_MAP[accent] || ACCENT_MAP["#003DA5"]
    return (
        <div className="flex items-center gap-3 p-4 rounded-2xl transition-all duration-200"
            style={{
                background: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "#e0e7ff"}`,
                boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.05)",
            }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                    background: isDark ? colors.darkBg : colors.lightBg,
                    border: `1px solid ${isDark ? colors.darkBorder : colors.lightBorder}`,
                }}>
                <Icon className="w-5 h-5" style={{ color: accent }} />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5"
                    style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(107,114,128,1)" }}>
                    {label}
                </p>
                <p className="text-sm font-semibold truncate"
                    style={{ color: isDark ? "#ffffff" : "#111827" }}>
                    {value || "—"}
                </p>
            </div>
        </div>
    )
}

// ── Tarjeta de estadística ────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, accent, isDark }) => {
    const colors = ACCENT_MAP[accent] || ACCENT_MAP["#003DA5"]
    return (
        <div className="flex flex-col gap-2 p-4 rounded-2xl transition-all duration-200"
            style={{
                background: isDark
                    ? `linear-gradient(135deg, ${colors.darkBg} 0%, rgba(255,255,255,0.02) 100%)`
                    : `linear-gradient(135deg, ${colors.lightBg} 0%, #ffffff 70%)`,
                border: `1px solid ${isDark ? colors.darkBorder : colors.lightBorder}`,
                boxShadow: isDark
                    ? `0 4px 16px ${colors.darkBg}`
                    : `0 2px 12px rgba(0,0,0,0.05)`,
            }}>
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: accent }}>
                    {label}
                </p>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                        background: isDark ? colors.darkBg : colors.lightBg,
                        border: `1px solid ${isDark ? colors.darkBorder : colors.lightBorder}`,
                    }}>
                    <Icon className="w-4 h-4" style={{ color: accent }} />
                </div>
            </div>
            <p className="text-2xl font-bold"
                style={{ color: isDark ? "#ffffff" : "#111827" }}>
                {value ?? "—"}
            </p>
        </div>
    )
}

// ── Página principal ──────────────────────────────────────────────────────
export const EmployeeProfilePage = () => {
    const dispatch = useDispatch()
    const isDark = useIsDark()
    const { attendance } = useSelector(s => s.employeedashboardreducer)
    const employeeState = useSelector(s => s.employeereducer)
    const [profile, setProfile] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            setIsLoading(true)
            await dispatch(HandleGetEmployees({ apiroute: "CHECKELOGIN" }))
            const profileRes = await dispatch(HandleGetEmployees({ apiroute: "GET_BY_EMPLOYEE" }))
            if (profileRes.payload?.data) setProfile(profileRes.payload.data)
            if (!attendance) dispatch(HandleEmployeeDashboard({ type: "MyAttendance" }))
            setIsLoading(false)
        }
        load()
    }, [])

    if (isLoading) return <Loading />

    const emp = profile
    const todayStr = new Date().toISOString().split("T")[0]
    const todayLog = attendance?.attendancelog?.find(
        l => new Date(l.logdate).toISOString().split("T")[0] === todayStr
    )
    const totalLogs = attendance?.attendancelog?.length ?? 0
    const presentDays = attendance?.attendancelog?.filter(l => l.logstatus === "Present").length ?? 0
    const absentDays = attendance?.attendancelog?.filter(l => l.logstatus === "Absent").length ?? 0

    // Estilos del card hero (avatar + nombre)
    const heroStyle = {
        background: isDark ? "rgba(255,255,255,0.05)" : "#f0f2ff",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "#c7d2fe"}`,
        boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.2)" : "0 2px 16px rgba(99,102,241,0.08)",
    }

    return (
        <div className="flex flex-col w-full px-4 py-6 gap-6 overflow-y-auto min-h-full"
            style={{ background: isDark ? "#0f0f1a" : "#ffffff" }}>

            {/* Header */}
            <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-1
                    text-blue-500 dark:text-blue-400">
                    Mi Cuenta
                </p>
                <h1 className="text-2xl xl:text-3xl font-bold tracking-tight
                    text-gray-900 dark:text-white">
                    Mi Perfil
                </h1>
                <p className="text-sm mt-1 text-gray-400 dark:text-gray-500">
                    Tu información personal y estadísticas de trabajo
                </p>
            </div>

            <div className="h-px w-full"
                style={{ background: isDark ? "rgba(99,102,241,0.1)" : "#e0e7ff" }} />

            {/* Avatar + nombre */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-5 rounded-2xl"
                style={heroStyle}>

                <div className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0
                    text-white text-2xl font-bold"
                    style={{ background: "linear-gradient(135deg, #003DA5, #8b5cf6)" }}>
                    {emp?.firstname?.[0]?.toUpperCase()}{emp?.lastname?.[0]?.toUpperCase()}
                </div>

                <div className="flex flex-col gap-1.5 text-center sm:text-left">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {emp?.firstname} {emp?.lastname}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{emp?.email}</p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                        <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${emp?.isverified
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-[rgba(16,185,129,0.12)] dark:text-emerald-400 dark:border-[rgba(16,185,129,0.3)]"
                                : "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-[rgba(245,158,11,0.12)] dark:text-yellow-400 dark:border-[rgba(245,158,11,0.3)]"
                            }`}>
                            {emp?.isverified
                                ? <><ShieldCheck className="w-3 h-3" /> Verificado</>
                                : <><ShieldAlert className="w-3 h-3" /> Sin verificar</>
                            }
                        </span>
                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border
                            bg-blue-50 text-blue-700 border-blue-200
                            dark:bg-[rgba(99,102,241,0.12)] dark:text-blue-400 dark:border-[rgba(99,102,241,0.3)]">
                            <Briefcase className="w-3 h-3" /> Empleado
                        </span>
                    </div>
                </div>

                <div className="sm:ml-auto flex flex-col items-center sm:items-end gap-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider"
                        style={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(107,114,128,1)" }}>
                        Último acceso
                    </p>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {formatDate(emp?.lastlogin)}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-600">
                        {formatTime(emp?.lastlogin)}
                    </p>
                </div>
            </div>

            {/* Información personal */}
            <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-3
                    text-blue-500 dark:text-blue-400">
                    Información Personal
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <InfoCard icon={User} label="Nombre" value={`${emp?.firstname} ${emp?.lastname}`} accent="#003DA5" isDark={isDark} />
                    <InfoCard icon={Mail} label="Correo" value={emp?.email} accent="#8b5cf6" isDark={isDark} />
                    <InfoCard icon={Phone} label="Teléfono" value={emp?.contactnumber} accent="#06b6d4" isDark={isDark} />
                    <InfoCard icon={Building2} label="Departamento" value={emp?.department?.name || "Sin asignar"} accent="#f59e0b" isDark={isDark} />
                    <InfoCard icon={CalendarDays} label="Miembro desde" value={formatDate(emp?.createdAt)} accent="#10b981" isDark={isDark} />
                    <InfoCard icon={Clock} label="Último acceso" value={`${formatDate(emp?.lastlogin)} · ${formatTime(emp?.lastlogin)}`} accent="#003DA5" isDark={isDark} />
                </div>
            </div>

            {/* Resumen de asistencia */}
            <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-3
                    text-blue-500 dark:text-blue-400">
                    Resumen de Asistencia
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatCard icon={CalendarDays} label="Total días" value={totalLogs} accent="#003DA5" isDark={isDark} />
                    <StatCard icon={ShieldCheck} label="Presencias" value={presentDays} accent="#10b981" isDark={isDark} />
                    <StatCard icon={ShieldAlert} label="Ausencias" value={absentDays} accent="#ef4444" isDark={isDark} />
                    <StatCard icon={Clock} label="Hoy entrada"
                        value={todayLog?.checkin ? formatTime(todayLog.checkin) : "—"}
                        accent="#f59e0b" isDark={isDark} />
                </div>
            </div>

            {/* Mis documentos */}
            <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-3
                    text-blue-500 dark:text-blue-400">
                    Mis Documentos
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatCard icon={DollarSign} label="Nóminas" value={emp?.salary?.length ?? 0} accent="#003DA5" isDark={isDark} />
                    <StatCard icon={FileText} label="Avisos" value={emp?.notice?.length ?? 0} accent="#8b5cf6" isDark={isDark} />
                    <StatCard icon={ClipboardList} label="Ausencias" value={emp?.leaverequest?.length ?? 0} accent="#06b6d4" isDark={isDark} />
                    <StatCard icon={Briefcase} label="Solicitudes" value={emp?.generaterequest?.length ?? 0} accent="#f59e0b" isDark={isDark} />
                </div>
            </div>
        </div>
    )
}
