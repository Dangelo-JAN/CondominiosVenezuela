import { useEffect, useState, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useIsDark } from "../../../hooks/useIsDark.js"
import { Loading } from "../../../components/common/loading.jsx"
import { 
    HandleGetEmployeeLeaves, 
    HandleCreateEmployeeLeave,
    HandleUpdateEmployeeLeave,
    HandleDeleteEmployeeLeave
} from "../../../redux/Thunks/HRLeavesThunk.js"
import { Calendar, Plus, Edit, Trash2, Eye, Clock, CheckCircle, XCircle } from "lucide-react"
import { useForm } from "../../../hooks/useForm.js"
import { Button } from "../../../components/ui/button.jsx"
import { Input } from "../../../components/ui/input.jsx"
import { Label } from "../../../components/ui/label.jsx"
import { CustomSelect } from "../../../components/ui/custom-select.jsx"
import { ThemedModal } from "../../../components/common/Dashboard/ThemedModal.jsx"

const LEAVE_TYPES = ["Vacaciones", "Reposo Médico", "Personal", "Otro"]
const STATUS_OPTIONS = [
    { value: "all", label: "Todos" },
    { value: "Pending", label: "Pendiente" },
    { value: "Approved", label: "Aprobado" },
    { value: "Rejected", label: "Rechazado" }
]

const LeaveRequestForm = ({ initialData, onSubmit, onClose, isLoading }) => {
    const isDark = useIsDark()
    const { formData, handleChange, setFormData } = useForm({
        leavetype: initialData?.leavetype || "Personal",
        startdate: initialData?.startdate?.split("T")[0] || "",
        enddate: initialData?.enddate?.split("T")[0] || "",
        title: initialData?.title || "",
        reason: initialData?.reason || ""
    })

    // Estilos de input matching HRRequestspage - aplicados a TODOS los inputs
    const inputCls = `w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200 appearance-none
        bg-gray-50 border border-gray-200 text-gray-900
        focus:border-yellow-400 focus:bg-white focus:ring-2 focus:ring-yellow-100
        dark:bg-[rgba(255,255,255,0.05)] dark:border-[rgba(255,255,255,0.12)] dark:text-white dark:placeholder:text-[rgba(255,255,255,0.4)]
        dark:focus:border-[rgba(245,158,11,0.5)] dark:focus:bg-[rgba(245,158,11,0.06)]`

    useEffect(() => {
        if (initialData) {
            setFormData({
                leavetype: initialData.leavetype || "Personal",
                startdate: initialData.startdate?.split("T")[0] || "",
                enddate: initialData.enddate?.split("T")[0] || "",
                title: initialData.title || "",
                reason: initialData.reason || ""
            })
        }
    }, [initialData])

    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit(formData)
    }

    const labelStyle = { color: isDark ? "rgba(255,255,255,0.6)" : "#6b7280", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipo de ausencia */}
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

            {/* Fechas */}
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

            {/* Título */}
            <div className="flex flex-col gap-1.5">
                <label style={labelStyle}>Título</label>
                <Input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Ej: Solicitud de vacaciones" required className={inputCls} />
            </div>

            {/* Razón */}
            <div className="flex flex-col gap-1.5">
                <label style={labelStyle}>Razón</label>
                <textarea name="reason" value={formData.reason} onChange={handleChange}
                    placeholder="Describe la razón de tu solicitud..." required rows={3}
                    className={`${inputCls} resize-none`} />
            </div>

            {/* Botones */}
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

const RequestDetailsDialog = ({ request, onClose, onEdit, onDelete, isLoading }) => {
    const isDark = useIsDark()

    if (!request) return null

    const getStatusBadge = (status) => {
        const config = {
            Pending: { 
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
                    background: isDark ? c.bgD : c.bgL, 
                    color: isDark ? c.colorD : c.colorL,
                    border: `1px solid ${isDark ? c.bdrD : c.bdrL}` 
                }}>
                <Icon className="w-3 h-3" />
                {c.label}
            </span>
        )
    }

    const labelStyle = { 
        fontSize: "10px", 
        fontWeight: 600, 
        textTransform: "uppercase", 
        letterSpacing: "0.08em" 
    }

    return (
        <ThemedModal
            open={true}
            onOpenChange={onClose}
            title="Detalles de mi Solicitud"
            accent="yellow"
            footer={
                request.status === "Pending" && (
                    <div className="flex justify-end gap-2">
                        <Button
                            onClick={() => onDelete(request._id)}
                            variant="outline"
                            className="rounded-xl text-red-500 border-red-500 hover:bg-red-50"
                            disabled={isLoading}
                        >
                            <Trash2 className="w-4 h-4 mr-1" /> Eliminar
                        </Button>
                        <Button
                            onClick={() => onEdit(request)}
                            className="rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                        >
                            <Edit className="w-4 h-4 mr-1" /> Editar
                        </Button>
                    </div>
                )
            }
        >
            <div className="space-y-4">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs uppercase tracking-wider mb-1" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }}>Tipo de Ausencia</p>
                        <p className="font-medium" style={{ color: isDark ? "#fff" : "#374151" }}>{request.leavetype}</p>
                    </div>
                    {getStatusBadge(request.status)}
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl" style={{ background: isDark ? "rgba(255,255,255,0.04)" : "#f9fafb" }}>
                    <div>
                        <p className="text-xs uppercase tracking-wider mb-1" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }}>Título</p>
                        <p className="font-medium" style={{ color: isDark ? "#fff" : "#374151" }}>{request.title}</p>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wider mb-1" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }}>Fecha Inicio</p>
                        <p className="font-medium" style={{ color: isDark ? "#fff" : "#374151" }}>
                            {new Date(request.startdate).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}
                        </p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-xs uppercase tracking-wider mb-1" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }}>Fecha Fin</p>
                        <p className="font-medium" style={{ color: isDark ? "#fff" : "#374151" }}>
                            {new Date(request.enddate).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}
                        </p>
                    </div>
                </div>

                <div>
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }}>Razón</p>
                    <p className="p-3 rounded-xl text-sm" style={{ background: isDark ? "rgba(255,255,255,0.04)" : "#f9fafb", color: isDark ? "rgba(255,255,255,0.8)" : "#374151" }}>
                        {request.reason}
                    </p>
                </div>

                {request.approvedby && (
                    <div className="p-3 rounded-xl" style={{ background: isDark ? "rgba(245,158,11,0.1)" : "#fffbeb" }}>
                        <p className="text-xs uppercase tracking-wider mb-1" style={{ color: isDark ? "rgba(245,158,11,0.6)" : "#d97706" }}>
                            {request.status === "Approved" ? "Aprobado por" : "Rechazado por"}
                        </p>
                        <p className="font-medium" style={{ color: isDark ? "#fbbf24" : "#b45309" }}>
                            {request.approvedby.firstname} {request.approvedby.lastname}
                        </p>
                    </div>
                )}
            </div>
        </ThemedModal>
    )
}

export const EmployeeRequestspage = () => {
    const isDark = useIsDark()
    const dispatch = useDispatch()
    const HRLeavesState = useSelector((state) => state.HRLeavesReducer)
    
    const [statusFilter, setStatusFilter] = useState("all")
    
    // Dialog states
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [selectedRequest, setSelectedRequest] = useState(null)

    const table_headings = ["Tipo", "Fechas", "Título", "Estado", "Acciones"]
    
    useEffect(() => {
        dispatch(HandleGetEmployeeLeaves())
    }, [])

    const filteredLeaves = useMemo(() => {
        if (!HRLeavesState.data) return []
        
        return HRLeavesState.data.filter(leave => {
            if (statusFilter !== "all" && leave.status !== statusFilter) return false
            return true
        })
    }, [HRLeavesState.data, statusFilter])

    const getStatusBadge = (status) => {
        const config = {
            Pending: { bg: isDark ? "rgba(245,158,11,0.12)" : "rgba(245,158,11,0.10)", border: isDark ? "rgba(245,158,11,0.30)" : "rgba(245,158,11,0.25)", color: isDark ? "#fbbf24" : "#d97706", icon: Clock },
            Approved: { bg: isDark ? "rgba(16,185,129,0.12)" : "rgba(16,185,129,0.10)", border: isDark ? "rgba(16,185,129,0.30)" : "rgba(16,185,129,0.25)", color: isDark ? "#34d399" : "#059669", icon: CheckCircle },
            Rejected: { bg: isDark ? "rgba(239,68,68,0.12)" : "rgba(239,68,68,0.10)", border: isDark ? "rgba(239,68,68,0.30)" : "rgba(239,68,68,0.25)", color: isDark ? "#f87171" : "#dc2626", icon: XCircle }
        }
        const c = config[status] || config.Pending
        const Icon = c.icon
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
                <Icon className="w-3 h-3" />
                {status === "Pending" ? "Pendiente" : status === "Approved" ? "Aprobado" : "Rechazado"}
            </span>
        )
    }

    const formatDateRange = (start, end) => {
        const startDate = new Date(start).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })
        const endDate = new Date(end).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })
        return `${startDate} - ${endDate}`
    }

    // Handlers
    const handleCreate = async (formData) => {
        try {
            await dispatch(HandleCreateEmployeeLeave(formData)).unwrap()
            setIsCreateOpen(false)
            dispatch(HandleGetEmployeeLeaves())
        } catch (error) {
            console.error("Error al crear solicitud:", error)
        }
    }

    const handleEdit = (formData) => {
        dispatch(HandleUpdateEmployeeLeave({ ...formData, leaveID: selectedRequest._id })).then(() => {
            setIsEditOpen(false)
            setSelectedRequest(null)
            dispatch(HandleGetEmployeeLeaves())
        })
    }

    const handleDelete = (leaveID) => {
        if (window.confirm("¿Estás seguro de eliminar esta solicitud?")) {
            dispatch(HandleDeleteEmployeeLeave(leaveID)).then(() => {
                setIsDetailsOpen(false)
                setSelectedRequest(null)
                dispatch(HandleGetEmployeeLeaves())
            })
        }
    }

    if (HRLeavesState.isLoading) {
        return <Loading />
    }

    const requestsCount = filteredLeaves?.length ?? 0
    const pendingCount = HRLeavesState.data?.filter(l => l.status === "Pending").length ?? 0
    const approvedCount = HRLeavesState.data?.filter(l => l.status === "Approved").length ?? 0
    const rejectedCount = HRLeavesState.data?.filter(l => l.status === "Rejected").length ?? 0
    
    return (
        <div className="w-full h-full flex flex-col gap-6 px-4 py-6 overflow-y-auto bg-white dark:bg-[#0f0f1a]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: isDark ? "#06b6d4" : "#0891b2" }}>
                        Mis Solicitudes
                    </p>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl xl:text-3xl font-bold tracking-tight" style={{ color: isDark ? "#fff" : "#111827" }}>
                            Solicitudes de Ausencia
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                            style={{ background: isDark ? "rgba(6,182,212,0.12)" : "rgba(6,182,212,0.10)", color: isDark ? "#22d3ee" : "#0891b2" }}>
                            {requestsCount} total
                        </span>
                    </div>
                </div>
                <Button
                    onClick={() => setIsCreateOpen(true)}
                    className="rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white"
                >
                    <Plus className="w-4 h-4 mr-2" /> Nueva Solicitud
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border" style={{ background: isDark ? "rgba(245,158,11,0.05)" : "#fffbeb", borderColor: isDark ? "rgba(245,158,11,0.2)" : "#fcd34d" }}>
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: isDark ? "#fbbf24" : "#d97706" }}>Pendientes</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: isDark ? "#fff" : "#111827" }}>{pendingCount}</p>
                </div>
                <div className="p-4 rounded-xl border" style={{ background: isDark ? "rgba(16,185,129,0.05)" : "#ecfdf5", borderColor: isDark ? "rgba(16,185,129,0.2)" : "#6ee7b7" }}>
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: isDark ? "#34d399" : "#059669" }}>Aprobadas</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: isDark ? "#fff" : "#111827" }}>{approvedCount}</p>
                </div>
                <div className="p-4 rounded-xl border" style={{ background: isDark ? "rgba(239,68,68,0.05)" : "#fef2f2", borderColor: isDark ? "rgba(239,68,68,0.2)" : "#fca5a5" }}>
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: isDark ? "#f87171" : "#dc2626" }}>Rechazadas</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: isDark ? "#fff" : "#111827" }}>{rejectedCount}</p>
                </div>
            </div>

            {/* Divider */}
            <div className="h-px w-full" style={{ background: isDark ? "rgba(6,182,212,0.08)" : "#f3f4f6" }} />

            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex flex-col gap-1.5 w-full lg:w-48">
                    <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>Estado</label>
                    <CustomSelect
                        value={statusFilter}
                        onValueChange={(val) => setStatusFilter(val)}
                        options={STATUS_OPTIONS}
                        placeholder="Todos"
                        accentColor="yellow"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="flex flex-col gap-3 flex-1 overflow-auto">
                <div className="w-full rounded-xl overflow-hidden border" style={{ borderColor: isDark ? "rgba(6,182,212,0.15)" : "#e5e7eb", background: isDark ? "rgba(6,182,212,0.05)" : "#f9fafb" }}>
                    <div className={`grid grid-cols-2 sm:grid-cols-5 gap-2 px-3 py-2`}>
                        {table_headings.map((item) => (
                            <div key={item} className="text-xs font-bold uppercase tracking-wider text-center px-2 py-1.5 rounded-lg"
                                style={{ color: isDark ? "#06b6d4" : "#0891b2" }}>
                                {item}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="w-full rounded-xl overflow-hidden border" style={{ borderColor: isDark ? "rgba(6,182,212,0.1)" : "#e5e7eb", background: isDark ? "rgba(255,255,255,0.02)" : "#fff" }}>
                    {requestsCount === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: isDark ? "rgba(6,182,212,0.1)" : "#cffafe" }}>
                                <Calendar className="w-6 h-6" style={{ color: isDark ? "#06b6d4" : "#67e8f9" }} />
                            </div>
                            <p className="text-sm font-medium" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#9ca3af" }}>No tienes solicitudes de ausencia</p>
                            <Button
                                onClick={() => setIsCreateOpen(true)}
                                className="rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white text-sm"
                            >
                                <Plus className="w-4 h-4 mr-1" /> Crear mi primera solicitud
                            </Button>
                        </div>
                    ) : (
                        filteredLeaves.map((leave, index) => (
                            <div key={leave._id ?? index} className="grid grid-cols-2 sm:grid-cols-5 gap-2 px-3 py-3 items-center border-b last:border-b-0"
                                style={{ borderColor: isDark ? "rgba(6,182,212,0.08)" : "#f3f4f6" }}>
                                {/* Tipo */}
                                <div className="min-w-0">
                                    <p className="text-sm font-medium truncate" style={{ color: isDark ? "#fff" : "#374151" }}>{leave.leavetype}</p>
                                </div>

                                {/* Fechas */}
                                <div className="hidden sm:block min-w-0">
                                    <p className="text-sm truncate" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }}>{formatDateRange(leave.startdate, leave.enddate)}</p>
                                </div>

                                {/* Título */}
                                <div className="hidden sm:block min-w-0">
                                    <p className="text-sm truncate" style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#4b5563" }} title={leave.title}>{leave.title}</p>
                                </div>

                                {/* Estado */}
                                <div className="flex justify-center">{getStatusBadge(leave.status)}</div>

                                {/* Acciones */}
                                <div className="flex justify-center gap-1">
                                    <button onClick={() => { setSelectedRequest(leave); setIsDetailsOpen(true) }}
                                        className="p-1.5 rounded-lg hover:bg-cyan-100 dark:hover:bg-[rgba(6,182,212,0.1)] transition-colors" title="Ver detalles">
                                        <Eye className="w-4 h-4" style={{ color: isDark ? "#06b6d4" : "#0891b2" }} />
                                    </button>
                                    {leave.status === "Pending" && (
                                        <button onClick={() => { setSelectedRequest(leave); setIsEditOpen(true) }}
                                            className="p-1.5 rounded-lg hover:bg-cyan-100 dark:hover:bg-[rgba(6,182,212,0.1)] transition-colors" title="Editar">
                                            <Edit className="w-4 h-4" style={{ color: isDark ? "#06b6d4" : "#0891b2" }} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Create Dialog */}
            <ThemedModal
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                title="Nueva Solicitud de Ausencia"
                accent="yellow"
            >
                <LeaveRequestForm 
                    onSubmit={handleCreate} 
                    onClose={() => setIsCreateOpen(false)} 
                    isLoading={HRLeavesState.isLoading} 
                />
            </ThemedModal>

            {/* Edit Dialog */}
            <ThemedModal
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                title="Editar Solicitud"
                accent="yellow"
            >
                <LeaveRequestForm 
                    initialData={selectedRequest} 
                    onSubmit={handleEdit}
                    onClose={() => { setIsEditOpen(false); setSelectedRequest(null) }}
                    isLoading={HRLeavesState.isLoading}
                />
            </ThemedModal>

            {/* Details Dialog */}
            {isDetailsOpen && selectedRequest && (
                <RequestDetailsDialog
                    request={selectedRequest}
                    onClose={() => { setIsDetailsOpen(false); setSelectedRequest(null) }}
                    onEdit={(req) => { setIsDetailsOpen(false); setSelectedRequest(req); setIsEditOpen(true) }}
                    onDelete={handleDelete}
                    isLoading={HRLeavesState.isLoading}
                />
            )}
        </div>
    )
}