import { useEffect, useState, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useIsDark } from "../../../hooks/useIsDark.js"
import { useHRAuth } from "../../../hooks/useHRAuth.js"
import { Loading } from "../../../components/common/loading.jsx"
import {
    HandleGetHRLeaves,
    HandleUpdateHRLeaveStatus,
    HandleDeleteLeaveByHR,
    HandleCreateLeaveByHR,
    HandleUpdateLeaveByHR
} from "../../../redux/Thunks/HRLeavesThunk.js"
import { HandleGetHREmployees } from "../../../redux/Thunks/HREmployeesThunk.js"
import { Calendar, Filter, CheckCircle, XCircle, Clock, Plus, Edit, Trash2, Eye } from "lucide-react"
import { useForm } from "../../../hooks/useForm.js"
import { Button } from "../../../components/ui/button.jsx"
import { Input } from "../../../components/ui/input.jsx"
import {
    ThemedListWrapper,
    ThemedHeadingBar,
    ThemedListContainer,
} from "../../../components/common/Dashboard/ListDesigns.jsx"
import { CustomSelect } from "../../../components/ui/custom-select.jsx"
import * as Dialog from "@radix-ui/react-dialog"
import { ThemedModal } from "../../../components/common/Dashboard/ThemedModal.jsx"

const LEAVE_TYPES = ["Vacaciones", "Reposo Médico", "Personal", "Otro"]
const STATUS_OPTIONS = [
    { value: "all",      label: "Todos" },
    { value: "Pending",  label: "Pendiente" },
    { value: "Approved", label: "Aprobado" },
    { value: "Rejected", label: "Rechazado" },
]

// ── Tokens yellow para esta página ─────────────────────────────────────────
const AMBER = {
    // Avatar
    avatarLight: { bg: "#fef3c7", color: "#d97706" },
    avatarDark:  { bg: "rgba(245,158,11,0.20)", color: "#fbbf24", border: "rgba(245,158,11,0.40)" },
    // Separador de fila
    rowBorderLight: "#fde68a",
    rowBorderDark:  "rgba(255,255,255,0.08)",
    // Hover de fila
    rowHoverLight: "#fffbeb",
    rowHoverDark:  "rgba(245,158,11,0.06)",
}

// ── Badges de estado ──────────────────────────────────────────────────────
const getStatusBadge = (status, isDark) => {
    const config = {
        Pending:  {
            bgL: "#fef3c7", bdrL: "#fcd34d", colorL: "#92400e",
            bgD: "rgba(245,158,11,0.15)", bdrD: "rgba(245,158,11,0.35)", colorD: "#fbbf24",
            icon: Clock, label: "Pendiente"
        },
        Approved: {
            bgL: "#d1fae5", bdrL: "#6ee7b7", colorL: "#065f46",
            bgD: "rgba(16,185,129,0.15)", bdrD: "rgba(16,185,129,0.35)", colorD: "#34d399",
            icon: CheckCircle, label: "Aprobado"
        },
        Rejected: {
            bgL: "#fee2e2", bdrL: "#fca5a5", colorL: "#991b1b",
            bgD: "rgba(239,68,68,0.15)", bdrD: "rgba(239,68,68,0.35)", colorD: "#f87171",
            icon: XCircle, label: "Rechazado"
        },
    }
    const c = config[status] || config.Pending
    const Icon = c.icon
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{
                background: isDark ? c.bgD   : c.bgL,
                color:      isDark ? c.colorD : c.colorL,
                border:     `1px solid ${isDark ? c.bdrD : c.bdrL}`,
            }}>
            <Icon className="w-3 h-3" />
            {c.label}
        </span>
    )
}

const inputCls = `w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200 appearance-none
    bg-gray-50 border border-gray-200 text-gray-900
    focus:border-yellow-400 focus:bg-white focus:ring-2 focus:ring-yellow-100
    dark:bg-[rgba(255,255,255,0.05)] dark:border-[rgba(255,255,255,0.12)] dark:text-white dark:placeholder:text-[rgba(255,255,255,0.4)]
    dark:focus:border-[rgba(245,158,11,0.5)] dark:focus:bg-[rgba(245,158,11,0.06)]`

// ── Formulario de solicitud ───────────────────────────────────────────────
const RequestForm = ({ initialData, employees, onSubmit, onClose, isLoading }) => {
    const isDark = useIsDark()
    const { formData, handleChange, setFormData } = useForm({
        employeeID:  initialData?.employee?._id || "",
        leavetype:   initialData?.leavetype     || "Personal",
        startdate:   initialData?.startdate?.split("T")[0] || "",
        enddate:     initialData?.enddate?.split("T")[0]   || "",
        title:       initialData?.title  || "",
        reason:      initialData?.reason || "",
    })

    useEffect(() => {
        if (initialData) {
            setFormData({
                employeeID: initialData.employee?._id || "",
                leavetype:  initialData.leavetype     || "Personal",
                startdate:  initialData.startdate?.split("T")[0] || "",
                enddate:    initialData.enddate?.split("T")[0]   || "",
                title:      initialData.title  || "",
                reason:     initialData.reason || "",
            })
        }
    }, [initialData])

    const labelStyle = { color: isDark ? "rgba(255,255,255,0.6)" : "#6b7280", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }

    return (
        <form onSubmit={e => { e.preventDefault(); onSubmit(formData) }} className="space-y-4">
            {!initialData && (
                <div className="flex flex-col gap-1.5">
                    <label style={labelStyle}>Empleado</label>
                    <CustomSelect
                        value={formData.employeeID}
                        onValueChange={(val) => handleChange({ target: { name: "employeeID", value: val } })}
                        placeholder="Seleccionar empleado"
                        options={employees?.map(emp => ({ value: emp._id, label: `${emp.firstname} ${emp.lastname}` })) || []}
                        groupLabel="Empleados"
                        className={inputCls}
                    />
                </div>
            )}

            <div className="flex flex-col gap-1.5">
                <label style={labelStyle}>Tipo de ausencia</label>
                <CustomSelect
                    value={formData.leavetype}
                    onValueChange={(val) => handleChange({ target: { name: "leavetype", value: val } })}
                    placeholder="Seleccionar tipo"
                    options={LEAVE_TYPES.map(type => ({ value: type, label: type }))}
                    className={inputCls}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label style={labelStyle}>Fecha inicio</label>
                    <Input type="date" name="startdate" value={formData.startdate} onChange={handleChange} required className={inputCls} />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label style={labelStyle}>Fecha fin</label>
                    <Input type="date" name="enddate" value={formData.enddate} onChange={handleChange} required className={inputCls} />
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <label style={labelStyle}>Título</label>
                <Input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Ej: Solicitud de vacaciones" required className={inputCls} />
            </div>

            <div className="flex flex-col gap-1.5">
                <label style={labelStyle}>Razón</label>
                <textarea name="reason" value={formData.reason} onChange={handleChange}
                    placeholder="Describe la razón de tu solicitud..." required rows={3}
                    className={`${inputCls} resize-none`} />
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onClose} 
                    className="rounded-xl text-gray-600 border-gray-300 hover:bg-gray-100 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800">
                    Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}
                    className="rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white">
                    {isLoading ? "Guardando..." : initialData ? "Actualizar" : "Crear"}
                </Button>
            </div>
        </form>
    )
}

// ── Modal detalle solicitud ───────────────────────────────────────────────
const RequestDetailsDialog = ({ request, onClose, onApprove, onReject, onEdit, onDelete, isLoading, isViewer = false }) => {
    const isDark = useIsDark()
    if (!request) return null

    return (
        <Dialog.Root open={true} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg p-6 rounded-2xl z-50
                    bg-white dark:bg-[#0f0f1a] border shadow-xl max-h-[90vh] overflow-y-auto"
                    style={{ borderColor: isDark ? "rgba(255,255,255,0.12)" : "#c7d2fe" }}>

                    <Dialog.Title className="text-xl font-bold mb-4" style={{ color: isDark ? "#fff" : "#111827" }}>
                        Detalles de solicitud
                    </Dialog.Title>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border"
                                    style={{
                                        background: isDark ? AMBER.avatarDark.bg    : AMBER.avatarLight.bg,
                                        color:      isDark ? AMBER.avatarDark.color  : AMBER.avatarLight.color,
                                        borderColor:isDark ? AMBER.avatarDark.border : AMBER.avatarLight.bg,
                                    }}>
                                    {request.employee?.firstname?.[0]}{request.employee?.lastname?.[0]}
                                </div>
                                <div>
                                    <p className="font-semibold" style={{ color: isDark ? "#fff" : "#111827" }}>
                                        {request.employee?.firstname} {request.employee?.lastname}
                                    </p>
                                    <p className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                        {request.employee?.department?.name || "Sin departamento"}
                                    </p>
                                </div>
                            </div>
                            {getStatusBadge(request.status, isDark)}
                        </div>

                        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl"
                            style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#fffbeb", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#fde68a"}` }}>
                            {[
                                { label: "Tipo",   value: request.leavetype },
                                { label: "Título", value: request.title },
                                { label: "Inicio", value: new Date(request.startdate).toLocaleDateString("es-ES") },
                                { label: "Fin",    value: new Date(request.enddate).toLocaleDateString("es-ES") },
                            ].map(({ label, value }) => (
                                <div key={label}>
                                    <p className="text-xs uppercase tracking-wider mb-0.5"
                                        style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }}>{label}</p>
                                    <p className="font-medium text-sm" style={{ color: isDark ? "#fff" : "#374151" }}>{value}</p>
                                </div>
                            ))}
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-wider mb-1"
                                style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }}>Razón</p>
                            <p className="p-3 rounded-xl text-sm"
                                style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#fffbeb", color: isDark ? "rgba(255,255,255,0.8)" : "#374151", border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#fde68a"}` }}>
                                {request.reason}
                            </p>
                        </div>

                        {request.approvedby && (
                            <div>
                                <p className="text-xs uppercase tracking-wider mb-0.5"
                                    style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }}>
                                    {request.status === "Approved" ? "Aprobado por" : "Rechazado por"}
                                </p>
                                <p className="text-sm font-medium" style={{ color: isDark ? "#fff" : "#374151" }}>
                                    {request.approvedby.firstname} {request.approvedby.lastname}
                                </p>
                            </div>
                        )}
                    </div>

                    {request.status === "Pending" && !isViewer && (
                        <div className="flex justify-between mt-6 pt-4 border-t"
                            style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "#fde68a" }}>
                            <div className="flex gap-2">
                                <Button onClick={() => onEdit(request)} variant="outline"
                                    className="rounded-xl text-yellow-600 border-yellow-300 hover:bg-yellow-50 dark:text-yellow-400 dark:border-yellow-700 dark:hover:bg-[rgba(245,158,11,0.08)]">
                                    <Edit className="w-4 h-4 mr-1" /> Editar
                                </Button>
                                <Button onClick={() => onDelete(request._id)} variant="outline" disabled={isLoading}
                                    className="rounded-xl text-red-500 border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:bg-[rgba(239,68,68,0.08)]">
                                    <Trash2 className="w-4 h-4 mr-1" /> Eliminar
                                </Button>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={() => onReject(request._id)} disabled={isLoading}
                                    className="rounded-xl bg-red-500 hover:bg-red-600 text-white">
                                    <XCircle className="w-4 h-4 mr-1" /> Rechazar
                                </Button>
                                <Button onClick={() => onApprove(request._id)} disabled={isLoading}
                                    className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white">
                                    <CheckCircle className="w-4 h-4 mr-1" /> Aprobar
                                </Button>
                            </div>
                        </div>
                    )}

                    <Dialog.Close asChild>
                        <button className="absolute top-4 right-4 p-1.5 rounded-full transition-colors
                            hover:bg-gray-100 dark:hover:bg-[rgba(255,255,255,0.08)]"
                            style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#9ca3af" }}>✕</button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}

// ── Página principal ──────────────────────────────────────────────────────
export const HRRequestspage = () => {
    const isDark = useIsDark()
    const dispatch = useDispatch()
    const { isViewer: isHRViewer } = useHRAuth()
    const HRLeavesState    = useSelector(s => s.HRLeavesReducer)
    const HREmployeesState = useSelector(s => s.HREmployeesPageReducer)

    const [employeeFilter, setEmployeeFilter] = useState("")
    const [statusFilter,   setStatusFilter]   = useState("all")
    const [dateRange,      setDateRange]      = useState({ start: "", end: "" })
    const [isCreateOpen,   setIsCreateOpen]   = useState(false)
    const [isEditOpen,     setIsEditOpen]     = useState(false)
    const [isDetailsOpen,  setIsDetailsOpen]  = useState(false)
    const [selectedRequest,setSelectedRequest]= useState(null)

    const table_headings = ["Empleado", "Tipo", "Fechas", "Título", "Estado", "Acciones"]
    const hiddenCols     = ["Fechas", "Título"]

    useEffect(() => {
        dispatch(HandleGetHRLeaves())
        dispatch(HandleGetHREmployees({ apiroute: "GETALL" }))
    }, [])

    const filteredLeaves = useMemo(() => {
        if (!HRLeavesState.data) return []
        return HRLeavesState.data.filter(leave => {
            if (employeeFilter && leave.employee?._id !== employeeFilter) return false
            if (statusFilter !== "all" && leave.status !== statusFilter) return false
            if (dateRange.start || dateRange.end) {
                const ls = new Date(leave.startdate)
                if (dateRange.start && ls < new Date(dateRange.start)) return false
                if (dateRange.end   && ls > new Date(dateRange.end))   return false
            }
            return true
        })
    }, [HRLeavesState.data, employeeFilter, statusFilter, dateRange])

    const formatDateRange = (start, end) => {
        const s = new Date(start).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })
        const e = new Date(end).toLocaleDateString("es-ES",   { day: "2-digit", month: "short", year: "numeric" })
        return `${s} – ${e}`
    }

    const handleCreate = async (formData) => {
        try {
            await dispatch(HandleCreateLeaveByHR(formData)).unwrap()
            setIsCreateOpen(false)
            dispatch(HandleGetHRLeaves())
        } catch (err) { console.error(err) }
    }

    const handleEdit = (formData) => {
        dispatch(HandleUpdateLeaveByHR({ ...formData, leaveID: selectedRequest._id })).then(() => {
            setIsEditOpen(false); setSelectedRequest(null); dispatch(HandleGetHRLeaves())
        })
    }

    const handleApprove = async (leaveID) => {
        try {
            const res = await dispatch(HandleUpdateHRLeaveStatus({ leaveID, status: "Approved" })).unwrap()
            if (res.success) {
                setIsDetailsOpen(false); setSelectedRequest(null); dispatch(HandleGetHRLeaves())
            } else {
                alert(res.message || "Error al aprobar")
            }
        } catch (err) {
            alert(err.message || "Error al aprobar la solicitud")
        }
    }

    const handleReject = async (leaveID) => {
        try {
            const res = await dispatch(HandleUpdateHRLeaveStatus({ leaveID, status: "Rejected" })).unwrap()
            if (res.success) {
                setIsDetailsOpen(false); setSelectedRequest(null); dispatch(HandleGetHRLeaves())
            } else {
                alert(res.message || "Error al rechazar")
            }
        } catch (err) {
            alert(err.message || "Error al rechazar la solicitud")
        }
    }

    const handleDelete = (leaveID) => {
        if (window.confirm("¿Eliminar esta solicitud?")) {
            dispatch(HandleDeleteLeaveByHR(leaveID)).then(() => {
                setIsDetailsOpen(false); setSelectedRequest(null); dispatch(HandleGetHRLeaves())
            })
        }
    }

    if (HRLeavesState.isLoading) return <Loading />

    const requestsCount = filteredLeaves?.length ?? 0

    return (
        <div className="w-full h-full flex flex-col gap-6 px-4 py-6 overflow-y-auto bg-white dark:bg-[#0f0f1a]">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                        style={{ color: isDark ? "#f59e0b" : "#d97706" }}>
                        Gestión de Solicitudes
                    </p>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl xl:text-3xl font-bold tracking-tight"
                            style={{ color: isDark ? "#fff" : "#111827" }}>
                            Solicitudes de Ausencia
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                            style={{
                                background:  isDark ? "rgba(245,158,11,0.15)" : "#fef3c7",
                                color:       isDark ? "#fbbf24" : "#92400e",
                                border:      `1px solid ${isDark ? "rgba(245,158,11,0.35)" : "#fcd34d"}`,
                            }}>
                            {requestsCount} total
                        </span>
                    </div>
                </div>
                {!isHRViewer && (
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white">
                        <Plus className="w-4 h-4 mr-2" /> Nueva Solicitud
                    </Button>
                )}
            </div>

            {/* Divider */}
            <div className="h-px w-full"
                style={{ background: isDark ? "rgba(245,158,11,0.08)" : "#fde68a" }} />

            {/* Filtros */}
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Empleado */}
                <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                    <label className="text-[10px] font-semibold uppercase tracking-wider"
                        style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                        <Filter className="w-3 h-3 inline mr-1" />Empleado
                    </label>
                    <CustomSelect
                        value={employeeFilter}
                        onValueChange={setEmployeeFilter}
                        placeholder="Todos los empleados"
                        options={HREmployeesState.data?.map(emp => ({ value: emp._id, label: `${emp.firstname} ${emp.lastname}` })) || []}
                        groupLabel="Empleados"
                        className={inputCls}
                    />
                </div>

                {/* Estado */}
                <div className="flex flex-col gap-1.5 w-full lg:w-48">
                    <label className="text-[10px] font-semibold uppercase tracking-wider"
                        style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>Estado</label>
                    <CustomSelect
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                        placeholder="Todos"
                        options={STATUS_OPTIONS.map(opt => ({ value: opt.value, label: opt.label }))}
                        className={inputCls}
                    />
                </div>

                {/* Fechas */}
                <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                    <label className="text-[10px] font-semibold uppercase tracking-wider"
                        style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                        <Calendar className="w-3 h-3 inline mr-1" />Desde – Hasta
                    </label>
                    <div className="flex gap-2">
                        <input type="date" value={dateRange.start}
                            onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                            className={inputCls} />
                        <input type="date" value={dateRange.end}
                            onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                            className={inputCls} />
                    </div>
                </div>
            </div>

            {/* Tabla */}
            <div className="flex flex-col gap-3 flex-1 overflow-auto">

                {/* Header de columnas */}
                <ThemedListWrapper accent="yellow">
                    <ThemedHeadingBar
                        accent="yellow"
                        table_layout="grid-cols-6"
                        table_headings={table_headings}
                        hiddenCols={hiddenCols}
                    />
                </ThemedListWrapper>

                {/* Filas */}
                <ThemedListContainer accent="yellow">
                    {requestsCount === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                style={{ background: isDark ? "rgba(245,158,11,0.15)" : "#fef3c7" }}>
                                <Calendar className="w-6 h-6" style={{ color: isDark ? "#f59e0b" : "#d97706" }} />
                            </div>
                            <p className="text-sm font-medium"
                                style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#9ca3af" }}>
                                No hay solicitudes de ausencia
                            </p>
                        </div>
                    ) : (
                        filteredLeaves.map((leave, index) => (
                            <div key={leave._id ?? index}
                                className="grid grid-cols-2 sm:grid-cols-6 gap-2 px-3 py-3 items-center
                                    border-b last:border-b-0 transition-colors duration-150"
                                style={{
                                    borderColor:      isDark ? AMBER.rowBorderDark  : AMBER.rowBorderLight,
                                    cursor: "default",
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = isDark ? AMBER.rowHoverDark  : AMBER.rowHoverLight}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>

                                {/* Empleado */}
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold border"
                                        style={{
                                            background:  isDark ? AMBER.avatarDark.bg    : AMBER.avatarLight.bg,
                                            color:       isDark ? AMBER.avatarDark.color  : AMBER.avatarLight.color,
                                            borderColor: isDark ? AMBER.avatarDark.border : AMBER.avatarLight.bg,
                                        }}>
                                        {leave.employee?.firstname?.[0]}{leave.employee?.lastname?.[0]}
                                    </div>
                                    <p className="text-sm font-semibold truncate"
                                        style={{ color: isDark ? "#ffffff" : "#111827" }}>
                                        {leave.employee ? `${leave.employee.firstname} ${leave.employee.lastname}` : "Sin asignar"}
                                    </p>
                                </div>

                                {/* Tipo */}
                                <div className="min-w-0">
                                    <p className="text-sm truncate"
                                        style={{ color: isDark ? "rgba(255,255,255,0.7)" : "#6b7280" }}>
                                        {leave.leavetype}
                                    </p>
                                </div>

                                {/* Fechas */}
                                <div className="hidden sm:block min-w-0">
                                    <p className="text-sm truncate"
                                        style={{ color: isDark ? "rgba(255,255,255,0.45)" : "#9ca3af" }}>
                                        {formatDateRange(leave.startdate, leave.enddate)}
                                    </p>
                                </div>

                                {/* Título */}
                                <div className="hidden sm:block min-w-0">
                                    <p className="text-sm truncate"
                                        style={{ color: isDark ? "rgba(255,255,255,0.65)" : "#4b5563" }}
                                        title={leave.title}>
                                        {leave.title}
                                    </p>
                                </div>

                                {/* Estado */}
                                <div className="flex justify-center">
                                    {getStatusBadge(leave.status, isDark)}
                                </div>

                                {/* Acciones */}
                                <div className="flex justify-center gap-1">
                                    <button
                                        onClick={() => { setSelectedRequest(leave); setIsDetailsOpen(true) }}
                                        className="p-1.5 rounded-lg transition-colors"
                                        style={{ color: isDark ? "#f59e0b" : "#d97706" }}
                                        onMouseEnter={e => e.currentTarget.style.background = isDark ? "rgba(245,158,11,0.12)" : "#fef3c7"}
                                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                        title="Ver detalles">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    {leave.status === "Pending" && !isHRViewer && (
                                        <>
                                            <button
                                                onClick={() => { setSelectedRequest(leave); setIsEditOpen(true) }}
                                                className="p-1.5 rounded-lg transition-colors"
                                                style={{ color: isDark ? "#f59e0b" : "#d97706" }}
                                                onMouseEnter={e => e.currentTarget.style.background = isDark ? "rgba(245,158,11,0.12)" : "#fef3c7"}
                                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                                title="Editar">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(leave._id)}
                                                className="p-1.5 rounded-lg transition-colors"
                                                style={{ color: isDark ? "#f87171" : "#dc2626" }}
                                                onMouseEnter={e => e.currentTarget.style.background = isDark ? "rgba(239,68,68,0.12)" : "#fee2e2"}
                                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                                title="Eliminar">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </ThemedListContainer>
            </div>

            {/* Modal crear */}
            <ThemedModal
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                title="Nueva solicitud de ausencia"
                accent="yellow"
            >
                <RequestForm employees={HREmployeesState.data} onSubmit={handleCreate}
                    onClose={() => setIsCreateOpen(false)} isLoading={HRLeavesState.isLoading} />
            </ThemedModal>

            {/* Modal editar */}
            <ThemedModal
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                title="Editar solicitud"
                accent="yellow"
            >
                <RequestForm initialData={selectedRequest} employees={HREmployeesState.data}
                    onSubmit={handleEdit}
                    onClose={() => { setIsEditOpen(false); setSelectedRequest(null) }}
                    isLoading={HRLeavesState.isLoading} />
            </ThemedModal>

            {/* Modal detalle */}
            {isDetailsOpen && selectedRequest && (
                <RequestDetailsDialog
                    request={selectedRequest}
                    onClose={() => { setIsDetailsOpen(false); setSelectedRequest(null) }}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onEdit={req => { setIsDetailsOpen(false); setSelectedRequest(req); setIsEditOpen(true) }}
                    onDelete={handleDelete}
                    isLoading={HRLeavesState.isLoading}
                    isViewer={isHRViewer}
                />
            )}
        </div>
    )
}
