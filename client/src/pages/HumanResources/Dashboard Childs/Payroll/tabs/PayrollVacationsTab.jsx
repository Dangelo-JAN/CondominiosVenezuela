import { useEffect, useState, useCallback, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useSearchParams } from "react-router-dom"
import { HandleVacations } from "../../../../../redux/Thunks/PayrollThunk.js"
import { HandlePayrollPeriods } from "../../../../../redux/Thunks/PayrollThunk.js"
import { Loading } from "../../../../../components/common/loading.jsx"
import { useIsDark } from "../../../../../hooks/useIsDark.js"
import { useHRAuth } from "../../../../../hooks/useHRAuth.js"
import { CustomSelect } from "../../../../../components/ui/custom-select.jsx"
import { ConfirmDialog } from "../../../../../components/common/ConfirmDialog.jsx"
import { ThemedListWrapper, ThemedHeadingBar, ThemedListContainer } from "../../../../../components/common/Dashboard/ListDesigns"
import {
    Plane, Users, Calendar, Filter, Search, Plus, Eye, CheckCircle, XCircle, DollarSign, Trash2, RefreshCw,
    AlertTriangle, Settings, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, FileText, Clock, CreditCard, Building2
} from "lucide-react"

// ──────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTES: Modales (se definen aquí para evitar archivos extra por ahora)
// ──────────────────────────────────────────────────────────────────────────────

// --- VacationBalanceDetailModal ---
const VacationBalanceDetailModal = ({ balance, onClose, isDark }) => {
    const formatDate = (dateStr) => {
        if (!dateStr) return '—'
        return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    }
    const formatCurrency = (val) => {
        if (val === undefined || val === null) return '—'
        return `$ ${val.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

    if (!balance) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b transition-colors duration-300"
                    style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.1)" }}>
                            <Plane className="w-5 h-5" style={{ color: "#003DA5" }} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Detalle de Saldo Vacacional</h2>
                            <p className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                {balance.employee?.firstname} {balance.employee?.lastname}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-4 max-h-[70vh] overflow-auto">
                    {/* Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Empleado</p>
                            <p className="font-medium text-gray-900 dark:text-white">{balance.employee?.firstname} {balance.employee?.lastname}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Departamento</p>
                            <p className="font-medium text-gray-900 dark:text-white">{balance.employee?.department?.name || '—'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Período</p>
                            <p className="font-medium text-gray-900 dark:text-white">{balance.period?.name || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Fechas Período</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                                {balance.period?.start_date && balance.period?.end_date
                                    ? `${formatDate(balance.period.start_date)} - ${formatDate(balance.period.end_date)}`
                                    : '—'}
                            </p>
                        </div>
                    </div>

                    {/* Balance Details */}
                    <div className="mb-6 p-4 rounded-xl transition-colors duration-300"
                        style={{
                            background: isDark ? "rgba(0,61,165,0.08)" : "rgba(0,61,165,0.05)",
                            border: isDark ? "1px solid rgba(0,61,165,0.2)" : "1px solid rgba(0,61,165,0.15)"
                        }}>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Settings className="w-5 h-5" style={{ color: "#003DA5" }} />
                            Cálculo de Vacaciones
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-3 rounded-lg" style={{ background: isDark ? "rgba(16,185,129,0.15)" : "#d1fae5" }}>
                                <p className="text-xs text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Días Base</p>
                                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-300">{balance.days_accrued || balance.accrued_days || 0}</p>
                            </div>
                            <div className="p-3 rounded-lg" style={{ background: isDark ? "rgba(239,68,68,0.15)" : "#fee2e2" }}>
                                <p className="text-xs text-red-700 dark:text-red-400 uppercase tracking-wider">Días Tomados</p>
                                <p className="text-2xl font-bold text-red-900 dark:text-red-300">{balance.days_taken || balance.taken_days || 0}</p>
                            </div>
                            <div className="p-3 rounded-lg" style={{ background: isDark ? "rgba(245,158,11,0.15)" : "#fef3c7" }}>
                                <p className="text-xs text-yellow-700 dark:text-yellow-400 uppercase tracking-wider">Días Pendientes</p>
                                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-300">{balance.days_pending || balance.pending_days || (balance.days_accrued - balance.days_taken) || 0}</p>
                            </div>
                            <div className="p-3 rounded-lg" style={{ background: isDark ? "rgba(6,182,212,0.15)" : "#cffafe" }}>
                                <p className="text-xs text-cyan-700 dark:text-cyan-400 uppercase tracking-wider">Bono Vacacional</p>
                                <p className="text-2xl font-bold text-cyan-900 dark:text-cyan-300">{balance.vacation_bonus_days || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Histórico / Movimientos */}
                    {balance.movements && balance.movements.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Movimientos</h3>
                            <div className="space-y-2">
                                {balance.movements.map((mov, idx) => (
                                    <div key={idx} className="p-3 rounded-lg border transition-colors"
                                        style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb" }}>
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-gray-900 dark:text-white">{mov.type || mov.concept}</span>
                                            <span className={`font-semibold ${mov.days > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {mov.days > 0 ? '+' : ''}{mov.days} días
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{mov.description || mov.reason}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-2 pt-4 border-t mt-6"
                        style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                        <button onClick={onClose} className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// --- VacationRequestDetailModal ---
const VacationRequestDetailModal = ({ request, onClose, isDark }) => {
    const formatDate = (dateStr) => {
        if (!dateStr) return '—'
        return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    const statusConfig = {
        PENDING: { bg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Pendiente', icon: Clock },
        APPROVED: { bg: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Aprobada', icon: CheckCircle },
        REJECTED: { bg: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', label: 'Rechazada', icon: XCircle },
        PAID: { bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', label: 'Pagada', icon: DollarSign },
    }

    const typeConfig = {
        VACATION: { label: 'Vacaciones Ordinarias', icon: Plane },
        VACATION_BONUS: { label: 'Bono Vacacional', icon: DollarSign },
        MEDICAL_LEAVE: { label: 'Licencia Médica', icon: AlertTriangle },
        MATERNITY: { label: 'Licencia Maternidad', icon: Building2 },
    }

    if (!request) return null

    const s = statusConfig[request.status] || statusConfig.PENDING
    const t = typeConfig[request.request_type] || typeConfig.VACATION
    const StatusIcon = s.icon
    const TypeIcon = t.icon

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b transition-colors duration-300"
                    style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.1)" }}>
                            <TypeIcon className="w-5 h-5" style={{ color: "#003DA5" }} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Detalle de Solicitud</h2>
                            <p className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                {request.employee?.firstname} {request.employee?.lastname} • {t.label}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg}`}>
                            <StatusIcon className="w-3 h-3" />
                            {s.label}
                        </span>
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-4 max-h-[70vh] overflow-auto">
                    {/* Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Empleado</p>
                            <p className="font-medium text-gray-900 dark:text-white">{request.employee?.firstname} {request.employee?.lastname}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Departamento</p>
                            <p className="font-medium text-gray-900 dark:text-white">{request.employee?.department?.name || '—'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Tipo</p>
                            <p className="font-medium text-gray-900 dark:text-white">{t.label}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Días Solicitados</p>
                            <p className="font-medium text-gray-900 dark:text-white">{request.days_count || request.days}</p>
                        </div>
                    </div>

                    {/* Fechas */}
                    <div className="mb-6 p-4 rounded-xl transition-colors duration-300"
                        style={{
                            background: isDark ? "rgba(0,61,165,0.08)" : "rgba(0,61,165,0.05)",
                            border: isDark ? "1px solid rgba(0,61,165,0.2)" : "1px solid rgba(0,61,165,0.15)"
                        }}>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Calendar className="w-5 h-5" style={{ color: "#003DA5" }} />
                            Fechas de la Solicitud
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Fecha Inicio</p>
                                <p className="font-medium text-gray-900 dark:text-white">{formatDate(request.start_date)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Fecha Fin</p>
                                <p className="font-medium text-gray-900 dark:text-white">{formatDate(request.end_date)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Fecha Retorno</p>
                                <p className="font-medium text-gray-900 dark:text-white">{formatDate(request.return_date)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Días Hábiles</p>
                                <p className="font-medium text-gray-900 dark:text-white">{request.working_days || request.days_count}</p>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {request.description && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Observaciones</h3>
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{request.description}</p>
                        </div>
                    )}

                    {/* Status History */}
                    <div className="mb-6 p-4 rounded-xl transition-colors duration-300"
                        style={{
                            background: isDark ? "rgba(255,255,255,0.04)" : "#f9fafb",
                            border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.05)"
                        }}>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Historial de Estado</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: isDark ? "rgba(255,255,255,0.02)" : "#f3f4f6" }}>
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">1</div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Solicitud Creada</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(request.createdAt)}</p>
                                </div>
                            </div>
                            {request.approved_at && (
                                <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: isDark ? "rgba(16,185,129,0.08)" : "#f0fdf4" }}>
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">2</div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Aprobada</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(request.approved_at)} por {request.approved_by?.firstname} {request.approved_by?.lastname}</p>
                                    </div>
                                </div>
                            )}
                            {request.rejected_at && (
                                <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: isDark ? "rgba(239,68,68,0.08)" : "#fef2f2" }}>
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">2</div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Rechazada</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(request.rejected_at)} por {request.rejected_by?.firstname} {request.rejected_by?.lastname}</p>
                                        {request.rejection_reason && <p className="text-sm text-red-600 dark:text-red-400 mt-1">Motivo: {request.rejection_reason}</p>}
                                    </div>
                                </div>
                            )}
                            {request.paid_at && (
                                <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: isDark ? "rgba(6,182,212,0.08)" : "#ecfeff" }}>
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400">3</div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Pagada</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(request.paid_at)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-2 pt-4 border-t"
                        style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                        <button onClick={onClose} className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// --- HolidayFormModal ---
const HolidayFormModal = ({ open, onClose, onSubmit, isDark, editingHoliday = null }) => {
    const [formData, setFormData] = useState({
        name: "",
        date: "",
        type: "NATIONAL",
        description: ""
    })
    const [errors, setErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)

    const typeOptions = [
        { value: "NATIONAL", label: "Nacional" },
        { value: "REGIONAL", label: "Regional" },
        { value: "COMPANY", label: "Empresa" },
        { value: "RELIGIOUS", label: "Religioso" },
    ]

    useEffect(() => {
        if (open) {
            if (editingHoliday) {
                setFormData({
                    name: editingHoliday.name || "",
                    date: editingHoliday.date ? editingHoliday.date.split('T')[0] : "",
                    type: editingHoliday.type || "NATIONAL",
                    description: editingHoliday.description || ""
                })
            } else {
                setFormData({ name: "", date: "", type: "NATIONAL", description: "" })
            }
            setErrors({})
        }
    }, [open, editingHoliday])

    const validate = () => {
        const newErrors = {}
        if (!formData.name.trim()) newErrors.name = "Nombre es requerido"
        if (!formData.date) newErrors.date = "Fecha es requerida"
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return
        setSubmitting(true)
        try {
            await onSubmit(formData)
            onClose()
        } catch (err) {
            setErrors({ submit: err.message || "Error al guardar" })
        } finally {
            setSubmitting(false)
        }
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b transition-colors duration-300"
                        style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.1)" }}>
                                <Calendar className="w-5 h-5" style={{ color: "#003DA5" }} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {editingHoliday ? "Editar Festivo" : "Nuevo Festivo"}
                            </h2>
                        </div>
                        <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="p-4 space-y-4">
                        {errors.submit && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                                {errors.submit}
                            </div>
                        )}

                        {/* Name */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                Nombre <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="Ej: Día de la Independencia"
                                className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200
                                    bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                                    focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
                                    dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                    dark:placeholder-[rgba(255,255,255,0.25)] dark:focus:border-[rgba(0,61,165,0.5)]
                                    ${errors.name ? 'border-red-400' : ''}`}
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                        </div>

                        {/* Date */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                Fecha <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200
                                    bg-gray-50 border border-gray-200 text-gray-900
                                    focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
                                    dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                    dark:focus:border-[rgba(0,61,165,0.5)]
                                    ${errors.date ? 'border-red-400' : ''}`}
                            />
                            {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
                        </div>

                        {/* Type */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                Tipo
                            </label>
                            <CustomSelect
                                value={formData.type}
                                onValueChange={(val) => setFormData({...formData, type: val})}
                                options={typeOptions}
                                placeholder="Seleccionar tipo"
                                accentColor="blue"
                                disabled={submitting}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                Descripción
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                rows={3}
                                placeholder="Descripción opcional..."
                                className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200
                                    bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                                    focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
                                    dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                    dark:placeholder-[rgba(255,255,255,0.25)] dark:focus:border-[rgba(0,61,165,0.5)]`}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                                Cancelar
                            </button>
                            <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" style={{ background: "#003DA5" }}>
                                {submitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Calendar className="w-4 h-4" />
                                        {editingHoliday ? "Actualizar" : "Crear"}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

// --- VacationRequestFormModal ---
const VacationRequestFormModal = ({ open, onClose, onSubmit, isDark, employees, periods, editingRequest = null }) => {
    const [formData, setFormData] = useState({
        employee: "select",
        period: "select",
        request_type: "VACATION",
        start_date: "",
        end_date: "",
        description: ""
    })
    const [errors, setErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)

    const typeOptions = [
        { value: "VACATION", label: "Vacaciones Ordinarias" },
        { value: "VACATION_BONUS", label: "Bono Vacacional" },
        { value: "MEDICAL_LEAVE", label: "Licencia Médica" },
        { value: "MATERNITY", label: "Licencia Maternidad" },
    ]

    const employeeOptions = useMemo(() => [
        { value: "select", label: "Seleccionar empleado..." },
        ...(employees?.map(e => ({ value: e._id, label: `${e.firstname} ${e.lastname} (${e.employee_code || e.email})` })) || [])
    ], [employees])

    const periodOptions = useMemo(() => [
        { value: "select", label: "Seleccionar período..." },
        ...(periods?.map(p => ({ value: p._id, label: p.name })) || [])
    ], [periods])

    useEffect(() => {
        if (open) {
            if (editingRequest) {
                setFormData({
                    employee: editingRequest.employee?._id || editingRequest.employee || "select",
                    period: editingRequest.period?._id || editingRequest.period || "select",
                    request_type: editingRequest.request_type || "VACATION",
                    start_date: editingRequest.start_date ? editingRequest.start_date.split('T')[0] : "",
                    end_date: editingRequest.end_date ? editingRequest.end_date.split('T')[0] : "",
                    description: editingRequest.description || ""
                })
            } else {
                setFormData({ employee: "select", period: "select", request_type: "VACATION", start_date: "", end_date: "", description: "" })
            }
            setErrors({})
        }
    }, [open, editingRequest, employees, periods])

    const validate = () => {
        const newErrors = {}
        if (!formData.employee || formData.employee === "select") newErrors.employee = "Empleado es requerido"
        if (!formData.period || formData.period === "select") newErrors.period = "Período es requerido"
        if (!formData.start_date) newErrors.start_date = "Fecha inicio es requerida"
        if (!formData.end_date) newErrors.end_date = "Fecha fin es requerida"
        if (formData.start_date && formData.end_date && new Date(formData.start_date) > new Date(formData.end_date)) {
            newErrors.end_date = "Fecha fin debe ser posterior a fecha inicio"
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return
        setSubmitting(true)
        try {
            await onSubmit(formData)
            onClose()
        } catch (err) {
            setErrors({ submit: err.message || "Error al guardar" })
        } finally {
            setSubmitting(false)
        }
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b transition-colors duration-300"
                        style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.1)" }}>
                                <Plane className="w-5 h-5" style={{ color: "#003DA5" }} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {editingRequest ? "Editar Solicitud" : "Nueva Solicitud de Vacaciones"}
                            </h2>
                        </div>
                        <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="p-4 space-y-4 max-h-[70vh] overflow-auto">
                        {errors.submit && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                                {errors.submit}
                            </div>
                        )}

                        {/* Employee */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                Empleado <span className="text-red-500">*</span>
                            </label>
                            <CustomSelect
                                value={formData.employee}
                                onValueChange={(val) => setFormData({...formData, employee: val})}
                                options={employeeOptions}
                                placeholder="Seleccionar empleado..."
                                accentColor="blue"
                                disabled={submitting || !!editingRequest}
                            />
                            {errors.employee && <p className="mt-1 text-xs text-red-500">{errors.employee}</p>}
                        </div>

                        {/* Period */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                Período <span className="text-red-500">*</span>
                            </label>
                            <CustomSelect
                                value={formData.period}
                                onValueChange={(val) => setFormData({...formData, period: val})}
                                options={periodOptions}
                                placeholder="Seleccionar período..."
                                accentColor="blue"
                                disabled={submitting}
                            />
                            {errors.period && <p className="mt-1 text-xs text-red-500">{errors.period}</p>}
                        </div>

                        {/* Request Type */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                Tipo de Solicitud
                            </label>
                            <CustomSelect
                                value={formData.request_type}
                                onValueChange={(val) => setFormData({...formData, request_type: val})}
                                options={typeOptions}
                                placeholder="Seleccionar tipo"
                                accentColor="blue"
                                disabled={submitting}
                            />
                        </div>

                        {/* Dates Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                    Fecha Inicio <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                                    className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200
                                        bg-gray-50 border border-gray-200 text-gray-900
                                        focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
                                        dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                        dark:focus:border-[rgba(0,61,165,0.5)]
                                        ${errors.start_date ? 'border-red-400' : ''}`}
                                />
                                {errors.start_date && <p className="mt-1 text-xs text-red-500">{errors.start_date}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                    Fecha Fin <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                                    className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200
                                        bg-gray-50 border border-gray-200 text-gray-900
                                        focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
                                        dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                        dark:focus:border-[rgba(0,61,165,0.5)]
                                        ${errors.end_date ? 'border-red-400' : ''}`}
                                />
                                {errors.end_date && <p className="mt-1 text-xs text-red-500">{errors.end_date}</p>}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                Observaciones
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                rows={3}
                                placeholder="Observaciones opcionales..."
                                className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200
                                    bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                                    focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
                                    dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                    dark:placeholder-[rgba(255,255,255,0.25)] dark:focus:border-[rgba(0,61,165,0.5)]`}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                                Cancelar
                            </button>
                            <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" style={{ background: "#003DA5" }}>
                                {submitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Plane className="w-4 h-4" />
                                        {editingRequest ? "Actualizar" : "Crear"}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

// --- RejectReasonModal ---
const RejectReasonModal = ({ open, onClose, onConfirm, requestId, isDark }) => {
    const [reason, setReason] = useState("")

    useEffect(() => {
        if (open) setReason("")
    }, [open])

    if (!open) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: isDark ? "rgba(239,68,68,0.15)" : "#fee2e2" }}>
                            <XCircle className="w-5 h-5" style={{ color: "#dc2626" }} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">¿Rechazar solicitud?</h3>
                            <p className="text-sm mb-4" style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#6b7280" }}>
                                La solicitud será marcada como RECHAZADA. Se registrará el motivo y no se procesará para nómina.
                            </p>
                            <div className="mb-4">
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                    Motivo del rechazo <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    rows={3}
                                    placeholder="Escriba el motivo del rechazo..."
                                    className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200
                                        bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                                        focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-100
                                        dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                        dark:placeholder-[rgba(255,255,255,0.25)] dark:focus:border-[rgba(239,68,68,0.5)]`}
                                />
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-[rgba(255,255,255,0.05)] dark:text-gray-300 dark:hover:bg-[rgba(255,255,255,0.1)]">
                                    Cancelar
                                </button>
                                <button onClick={() => { onConfirm(requestId, reason); onClose(); }} disabled={!reason.trim()} className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: "#dc2626" }}>
                                    Rechazar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ──────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL: PayrollVacationsTab
// ──────────────────────────────────────────────────────────────────────────────

export const PayrollVacationsTab = () => {
    const isDark = useIsDark()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { can, isReady } = useHRAuth()

    // ── Redux Selectors ──────────────────────────────────────────────────────
    const { data: vacationBalances, isLoading: balancesLoading, error: balancesError, pagination: balancesPagination } = useSelector((state) => state.payrollReducer.vacationBalances)
    const { data: vacationRequests, isLoading: requestsLoading, error: requestsError, pagination: requestsPagination } = useSelector((state) => state.payrollReducer.vacationRequests)
    const { data: holidays, isLoading: holidaysLoading, error: holidaysError } = useSelector((state) => state.payrollReducer.holidays)
    const { data: periods } = useSelector((state) => state.payrollReducer.periods)
    const { data: employees } = useSelector((state) => state.employeeReducer?.employees || state.employeeReducer?.data || [])

    // ── Estado Local ─────────────────────────────────────────────────────────
    const [activeSubTab, setActiveSubTab] = useState("balances") // balances | requests | holidays
    const [statusFilter, setStatusFilter] = useState("all")
    const [searchTerm, setSearchTerm] = useState("")
    const [periodFilter, setPeriodFilter] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [detailBalance, setDetailBalance] = useState(null)
    const [detailRequest, setDetailRequest] = useState(null)
    const [showRequestFormModal, setShowRequestFormModal] = useState(false)
    const [editRequest, setEditRequest] = useState(null)
    const [applyConfirm, setApplyConfirm] = useState(null)
    const [rejectConfirm, setRejectConfirm] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const [showHolidayFormModal, setShowHolidayFormModal] = useState(false)
    const [editHoliday, setEditHoliday] = useState(null)

    // ── Opciones para Filtros ────────────────────────────────────────────────
    const periodOptions = useMemo(() => {
        const formatDateShort = (dateStr) => {
            if (!dateStr) return ''
            return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
        }
        const formatDateVeryShort = (dateStr) => {
            if (!dateStr) return ''
            return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
        }
        return [
            { value: "all", label: "Todos los períodos" },
            ...(periods?.map(p => ({
                value: p._id,
                label: `${p.name} (${formatDateVeryShort(p.start_date)} - ${formatDateShort(p.end_date)})`
            })) || [])
        ]
    }, [periods])

    const statusOptions = useMemo(() => [
        { value: "all", label: "Todos los estados" },
        { value: "PENDING", label: "Pendiente" },
        { value: "APPROVED", label: "Aprobada" },
        { value: "REJECTED", label: "Rechazada" },
        { value: "PAID", label: "Pagada" },
    ], [])

    // ── Carga Inicial de Datos ──────────────────────────────────────────────
    useEffect(() => {
        const params = {
            page: currentPage,
            limit: 50,
            status: statusFilter !== "all" ? statusFilter : undefined,
            period: periodFilter !== "all" ? periodFilter : undefined,
        }
        dispatch(HandleVacations({ type: "BALANCES_GETALL", ...params }))
        dispatch(HandleVacations({ type: "REQUESTS_GETALL", ...params }))
        dispatch(HandleVacations({ type: "HOLIDAYS_GETALL", data: {} }))
        dispatch(HandlePayrollPeriods({ type: "GETALL", page: 1, limit: 100 }))
    }, [dispatch, currentPage, statusFilter, periodFilter])

    // ── Handlers de Acciones ─────────────────────────────────────────────────
    const handleApprove = useCallback(async (id) => {
        await dispatch(HandleVacations({ type: "REQUESTS_APPROVE", id })).unwrap()
        setApplyConfirm(null)
    }, [dispatch])

    const handleReject = useCallback(async (id, reason) => {
        await dispatch(HandleVacations({ type: "REQUESTS_REJECT", id, reason })).unwrap()
        setRejectConfirm(null)
    }, [dispatch])

    const handlePay = useCallback(async (id) => {
        await dispatch(HandleVacations({ type: "REQUESTS_PAY", id })).unwrap()
    }, [dispatch])

    const handleDeleteHoliday = useCallback(async (id) => {
        await dispatch(HandleVacations({ type: "HOLIDAYS_DELETE", id })).unwrap()
        setDeleteConfirm(null)
    }, [dispatch])

    const handleCreateRequest = useCallback(async (data) => {
        await dispatch(HandleVacations({ type: "REQUESTS_CREATE", data })).unwrap()
        setShowRequestFormModal(false)
        setEditRequest(null)
    }, [dispatch])

    const handleCreateHoliday = useCallback(async (data) => {
        await dispatch(HandleVacations({ type: "HOLIDAYS_CREATE", data })).unwrap()
        setShowHolidayFormModal(false)
        setEditHoliday(null)
    }, [dispatch])

    // ── Utilidades de Formato ────────────────────────────────────────────────
    const formatDate = (dateStr) => {
        if (!dateStr) return '—'
        return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    const formatDateShort = (dateStr) => {
        if (!dateStr) return '—'
        return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
    }

    const statusConfig = {
        PENDING: { bg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Pendiente', icon: Clock },
        APPROVED: { bg: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Aprobada', icon: CheckCircle },
        REJECTED: { bg: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', label: 'Rechazada', icon: XCircle },
        PAID: { bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', label: 'Pagada', icon: DollarSign },
    }

    const requestTypeConfig = {
        VACATION: { label: 'Vacaciones', icon: Plane, color: 'blue' },
        VACATION_BONUS: { label: 'Bono Vac.', icon: DollarSign, color: 'yellow' },
        MEDICAL_LEAVE: { label: 'Médica', icon: AlertTriangle, color: 'red' },
        MATERNITY: { label: 'Maternidad', icon: Building2, color: 'purple' },
    }

    // ── SubTabs Config ───────────────────────────────────────────────────────
    const SUBTABS = [
        { id: "balances", label: "Saldos", icon: Users, count: vacationBalances?.length || 0 },
        { id: "requests", label: "Solicitudes", icon: FileText, count: vacationRequests?.length || 0 },
        { id: "holidays", label: "Festivos", icon: Calendar, count: holidays?.length || 0 },
    ]

    const canCreate = can("payroll", "create")
    const canUpdate = can("payroll", "update")
    const canDelete = can("payroll", "delete")

    // ── Loading State ────────────────────────────────────────────────────────
    const isLoading = balancesLoading || requestsLoading || holidaysLoading

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <Loading size="lg" />
            </div>
        )
    }

    // ── Render Principal ─────────────────────────────────────────────────────
    return (
        <div className="w-full h-full flex flex-col bg-white dark:bg-[#0f0f1a]">
            {/* Header Principal */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border-b transition-colors duration-300"
                style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.1)" }}>
                        <Plane className="w-6 h-6" style={{ color: "#003DA5" }} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vacaciones</h1>
                        <p className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                            Gestión de saldos, solicitudes y festivos
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            dispatch(HandleVacations({ type: "BALANCES_GETALL", page: currentPage, limit: 50 }))
                            dispatch(HandleVacations({ type: "REQUESTS_GETALL", page: currentPage, limit: 50 }))
                            dispatch(HandleVacations({ type: "HOLIDAYS_GETALL", data: {} }))
                        }}
                        disabled={isLoading}
                        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
                        title="Actualizar datos"
                    >
                        <RefreshCw className={isLoading ? "animate-spin w-5 h-5" : "w-5 h-5"} />
                    </button>
                </div>
            </div>

            {/* SubTabs Bar */}
            <div className="flex flex-wrap gap-1 px-4 py-2 border-b transition-colors duration-300"
                style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                {SUBTABS.map(({ id, label, icon: Icon, count }) => (
                    <button
                        key={id}
                        onClick={() => { setActiveSubTab(id); setCurrentPage(1); }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap
                            ${activeSubTab === id
                                ? "text-white shadow-sm"
                                : "hover:bg-gray-100 dark:hover:bg-[rgba(255,255,255,0.05)]"}
                        `}
                        style={{
                            background: activeSubTab === id ? "#003DA5" : "transparent",
                            color: activeSubTab === id ? "#fff" : isDark ? "rgba(255,255,255,0.7)" : "#374151"
                        }}
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                        <span className={`px-1.5 py-0.5 rounded-full text-xs ${activeSubTab === id ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                            {count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Filtros (solo para Balances y Solicitudes) */}
            {(activeSubTab === "balances" || activeSubTab === "requests") && (
                <div className="flex flex-col sm:flex-row gap-3 p-4 border-b transition-colors duration-300"
                    style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                    {/* Búsqueda */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }} />
                        <input
                            type="text"
                            placeholder="Buscar empleado..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className={`w-full pl-10 pr-3 py-2 rounded-xl text-sm outline-none transition-all duration-200
                                bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                                focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
                                dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                dark:placeholder-[rgba(255,255,255,0.25)] dark:focus:border-[rgba(0,61,165,0.5)]`}
                        />
                    </div>

                    {/* Filtro Estado (solo solicitudes) */}
                    {activeSubTab === "requests" && (
                        <div className="w-full sm:w-48">
                            <CustomSelect
                                value={statusFilter}
                                onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
                                options={statusOptions}
                                placeholder="Filtrar estado"
                                accentColor="blue"
                            />
                        </div>
                    )}

                    {/* Filtro Período */}
                    <div className="w-full sm:w-64">
                        <CustomSelect
                            value={periodFilter}
                            onValueChange={(val) => { setPeriodFilter(val); setCurrentPage(1); }}
                            options={periodOptions}
                            placeholder="Filtrar período"
                            accentColor="blue"
                        />
                    </div>

                    {/* Botón Crear (solo solicitudes y festivos) */}
                    {(activeSubTab === "requests" || activeSubTab === "holidays") && canCreate && (
                        <button
                            onClick={() => {
                                if (activeSubTab === "requests") {
                                    setEditRequest(null)
                                    setShowRequestFormModal(true)
                                } else {
                                    setEditHoliday(null)
                                    setShowHolidayFormModal(true)
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all duration-200 whitespace-nowrap"
                            style={{ background: "#003DA5" }}
                        >
                            <Plus className="w-4 h-4" />
                            {activeSubTab === "requests" ? "Nueva Solicitud" : "Nuevo Festivo"}
                        </button>
                    )}
                </div>
            )}

            {/* Contenido Principal */}
            <div className="flex-1 min-h-0 overflow-hidden p-4">
                {activeSubTab === "balances" && (
                    // ─── TABLA SALDOS ───
                    <ThemedListWrapper accent="blue">
                        <ThemedHeadingBar
                            table_layout="sm:grid-cols-6"
                            table_headings={["Empleado", "Departamento", "Período", "Días Acum.", "Días Tomados", "Días Pend.", "Acciones"]}
                            accent="blue"
                        />
                        <ThemedListContainer accent="blue">
                            {vacationBalances && vacationBalances.length > 0 ? (
                                vacationBalances.map((balance, index) => (
                                    <div
                                        key={balance._id ?? index}
                                        className="grid sm:grid-cols-6 gap-2 px-3 py-3 items-center
                                            border-b last:border-b-0 transition-colors duration-150
                                            border-[#dde5ff] dark:border-[rgba(255,255,255,0.08)]
                                            hover:bg-[#e0f2fe] dark:hover:bg-[rgba(0,61,165,0.08)]"
                                    >
                                        {/* Empleado */}
                                        <div className="flex items-center gap-2.5 min-w-0 sm:col-span-2">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold
                                                bg-blue-100 text-blue-700
                                                dark:bg-[rgba(0,61,165,0.25)] dark:text-blue-300
                                                border border-blue-200 dark:border-[rgba(0,61,165,0.4)]">
                                                {balance.employee?.firstname?.slice(0,1).toUpperCase()}{balance.employee?.lastname?.slice(0,1).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold truncate text-gray-900 dark:text-white">
                                                    {balance.employee?.firstname} {balance.employee?.lastname}
                                                </p>
                                                <p className="text-xs truncate" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                                    {balance.employee?.employee_code || balance.employee?.email}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Departamento */}
                                        <div className="hidden sm:block sm:col-span-1">
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full truncate max-w-[120px]
                                                ${balance.employee?.department
                                                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-[rgba(16,185,129,0.15)] dark:text-emerald-400 dark:border-[rgba(16,185,129,0.3)]"
                                                    : "bg-gray-100 text-gray-500 border border-gray-200 dark:bg-[rgba(255,255,255,0.07)] dark:text-[rgba(255,255,255,0.4)] dark:border-[rgba(255,255,255,0.12)]"
                                                }`}>
                                                {balance.employee?.department?.name || "Sin asignar"}
                                            </span>
                                        </div>

                                        {/* Período */}
                                        <div className="hidden sm:block sm:col-span-1 text-center">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{balance.period?.name}</p>
                                            <p className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                                {balance.period?.start_date && balance.period?.end_date
                                                    ? `${formatDateShort(balance.period.start_date)} - ${formatDateShort(balance.period.end_date)}`
                                                    : '—'}
                                            </p>
                                        </div>

                                        {/* Días Acumulados */}
                                        <div className="hidden sm:block sm:col-span-1 text-center">
                                            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{balance.days_accrued || balance.accrued_days || 0}</p>
                                        </div>

                                        {/* Días Tomados */}
                                        <div className="hidden sm:block sm:col-span-1 text-center">
                                            <p className="text-lg font-bold text-red-600 dark:text-red-400">{balance.days_taken || balance.taken_days || 0}</p>
                                        </div>

                                        {/* Días Pendientes */}
                                        <div className="hidden sm:block sm:col-span-1 text-center">
                                            <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{balance.days_pending || balance.pending_days || (balance.days_accrued - balance.days_taken) || 0}</p>
                                        </div>

                                        {/* Acciones */}
                                        <div className="flex justify-center items-center gap-1 sm:col-span-1">
                                            <button
                                                onClick={() => setDetailBalance(balance)}
                                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500"
                                                title="Ver detalle"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                    <Plane className="w-12 h-12 mb-4" style={{ color: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,61,165,0.2)" }} />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No hay saldos de vacaciones</h3>
                                    <p className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                        Los saldos se generan automáticamente al calcular nómina
                                    </p>
                                </div>
                            )}
                        </ThemedListContainer>
                    </ThemedListWrapper>
                )}

                {activeSubTab === "requests" && (
                    // ─── TABLA SOLICITUDES ───
                    <ThemedListWrapper accent="yellow">
                        <ThemedHeadingBar
                            table_layout="sm:grid-cols-7"
                            table_headings={["Empleado", "Tipo", "Fechas", "Días", "Estado", "Período", "Acciones"]}
                            accent="yellow"
                        />
                        <ThemedListContainer accent="yellow">
                            {vacationRequests && vacationRequests.length > 0 ? (
                                vacationRequests.map((request, index) => {
                                    const s = statusConfig[request.status] || statusConfig.PENDING
                                    const t = requestTypeConfig[request.request_type] || requestTypeConfig.VACATION
                                    const StatusIcon = s.icon
                                    const TypeIcon = t.icon

                                    return (
                                        <div
                                            key={request._id ?? index}
                                            className="grid sm:grid-cols-7 gap-2 px-3 py-3 items-center
                                                border-b last:border-b-0 transition-colors duration-150
                                                border-[#fde047] dark:border-[rgba(252,227,0,0.15)]
                                                hover:bg-[#fefce8] dark:hover:bg-[rgba(252,227,0,0.08)]"
                                        >
                                            {/* Empleado */}
                                            <div className="flex items-center gap-2.5 min-w-0 sm:col-span-2">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold
                                                    bg-yellow-100 text-yellow-700
                                                    dark:bg-[rgba(252,227,0,0.25)] dark:text-yellow-300
                                                    border border-yellow-200 dark:border-[rgba(252,227,0,0.4)]">
                                                    {request.employee?.firstname?.slice(0,1).toUpperCase()}{request.employee?.lastname?.slice(0,1).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold truncate text-gray-900 dark:text-white">
                                                        {request.employee?.firstname} {request.employee?.lastname}
                                                    </p>
                                                    <p className="text-xs truncate" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                                        {request.employee?.department?.name || '—'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Tipo */}
                                            <div className="hidden sm:block sm:col-span-1 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                                                    bg-${t.color}-100 text-${t.color}-700
                                                    dark:bg-${t.color}-900/30 dark:text-${t.color}-400`}>
                                                    <TypeIcon className="w-3 h-3" />
                                                    {t.label}
                                                </span>
                                            </div>

                                            {/* Fechas */}
                                            <div className="hidden sm:block sm:col-span-1 text-center">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {formatDateShort(request.start_date)} - {formatDateShort(request.end_date)}
                                                </p>
                                                <p className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                                    Retorno: {formatDateShort(request.return_date)}
                                                </p>
                                            </div>

                                            {/* Días */}
                                            <div className="hidden sm:block sm:col-span-1 text-center">
                                                <p className="text-lg font-bold text-gray-900 dark:text-white">{request.days_count || request.days}</p>
                                            </div>

                                            {/* Estado */}
                                            <div className="hidden sm:block sm:col-span-1 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${s.bg}`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {s.label}
                                                </span>
                                            </div>

                                            {/* Período */}
                                            <div className="hidden sm:block sm:col-span-1 text-center">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{request.period?.name}</p>
                                            </div>

                                            {/* Acciones */}
                                            <div className="flex justify-center items-center gap-1 sm:col-span-1">
                                                <button
                                                    onClick={() => setDetailRequest(request)}
                                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500"
                                                    title="Ver detalle"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {canUpdate && request.status === "PENDING" && (
                                                    <>
                                                        <button
                                                            onClick={() => setApplyConfirm(request._id)}
                                                            className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-green-600"
                                                            title="Aprobar"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setRejectConfirm(request._id)}
                                                            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-red-600"
                                                            title="Rechazar"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {canUpdate && request.status === "APPROVED" && (
                                                    <button
                                                        onClick={() => handlePay(request._id)}
                                                        className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-blue-600"
                                                        title="Marcar como pagada"
                                                    >
                                                        <DollarSign className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {canUpdate && canCreate && request.status === "PENDING" && (
                                                    <button
                                                        onClick={() => { setEditRequest(request); setShowRequestFormModal(true); }}
                                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500"
                                                        title="Editar"
                                                    >
                                                        <Settings className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                    <FileText className="w-12 h-12 mb-4" style={{ color: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,61,165,0.2)" }} />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No hay solicitudes de vacaciones</h3>
                                    <p className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                        {canCreate ? 'Crea la primera solicitud con el botón "Nueva Solicitud"' : 'No tienes permisos para crear solicitudes'}
                                    </p>
                                </div>
                            )}
                        </ThemedListContainer>
                    </ThemedListWrapper>
                )}

                {activeSubTab === "holidays" && (
                    // ─── TABLA FESTIVOS ───
                    <ThemedListWrapper accent="emerald">
                        <div className="flex items-center justify-between px-3 py-2">
                            <ThemedHeadingBar
                                table_layout="sm:grid-cols-4"
                                table_headings={["Nombre", "Fecha", "Tipo", "Acciones"]}
                                accent="emerald"
                            />
                            {canCreate && (
                                <button
                                    onClick={() => { setEditHoliday(null); setShowHolidayFormModal(true); }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-white transition-all duration-200 whitespace-nowrap"
                                    style={{ background: "#003DA5" }}
                                >
                                    <Plus className="w-4 h-4" />
                                    Nuevo Festivo
                                </button>
                            )}
                        </div>
                        <ThemedListContainer accent="emerald">
                            {holidays && holidays.length > 0 ? (
                                holidays.map((holiday, index) => (
                                    <div
                                        key={holiday._id ?? index}
                                        className="grid sm:grid-cols-4 gap-2 px-3 py-3 items-center
                                            border-b last:border-b-0 transition-colors duration-150
                                            border-[#6ee7b7] dark:border-[rgba(16,185,129,0.15)]
                                            hover:bg-[#f0fdf4] dark:hover:bg-[rgba(16,185,129,0.08)]"
                                    >
                                        {/* Nombre */}
                                        <div className="sm:col-span-1 min-w-0">
                                            <p className="text-sm font-semibold truncate text-gray-900 dark:text-white">{holiday.name}</p>
                                            {holiday.description && (
                                                <p className="text-xs truncate" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                                    {holiday.description}
                                                </p>
                                            )}
                                        </div>

                                        {/* Fecha */}
                                        <div className="hidden sm:block sm:col-span-1 text-center">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(holiday.date)}</p>
                                        </div>

                                        {/* Tipo */}
                                        <div className="hidden sm:block sm:col-span-1 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                                                ${holiday.type === "NATIONAL" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                                                  holiday.type === "REGIONAL" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" :
                                                  holiday.type === "COMPANY" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                                                  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                }`}>
                                                {holiday.type === "NATIONAL" && "Nacional"}
                                                {holiday.type === "REGIONAL" && "Regional"}
                                                {holiday.type === "COMPANY" && "Empresa"}
                                                {holiday.type === "RELIGIOUS" && "Religioso"}
                                            </span>
                                        </div>

                                        {/* Acciones */}
                                        <div className="flex justify-center items-center gap-1 sm:col-span-1">
                                            {canUpdate && (
                                                <button
                                                    onClick={() => { setEditHoliday(holiday); setShowHolidayFormModal(true); }}
                                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500"
                                                    title="Editar"
                                                >
                                                    <Settings className="w-4 h-4" />
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button
                                                    onClick={() => setDeleteConfirm(holiday._id)}
                                                    className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-red-600"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                    <Calendar className="w-12 h-12 mb-4" style={{ color: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,61,165,0.2)" }} />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No hay festivos configurados</h3>
                                    <p className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                        {canCreate ? 'Agrega festivos con el botón "Nuevo Festivo"' : 'No tienes permisos para gestionar festivos'}
                                    </p>
                                </div>
                            )}
                        </ThemedListContainer>
                    </ThemedListWrapper>
                )}

                {/* Paginación (para balances y requests) */}
                {(activeSubTab === "balances" || activeSubTab === "requests") && (
                    <div className="flex items-center justify-between mt-4 px-2">
                        <p className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                            Mostrando {(currentPage - 1) * 50 + 1} - {Math.min(currentPage * 50, activeSubTab === "balances" ? balancesPagination?.total || vacationBalances?.length : requestsPagination?.total || vacationRequests?.length)} de {activeSubTab === "balances" ? balancesPagination?.total || vacationBalances?.length : requestsPagination?.total || vacationRequests?.length} registros
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="px-3 py-1 text-sm font-medium" style={{ color: isDark ? "rgba(255,255,255,0.7)" : "#374151" }}>
                                Página {currentPage}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => p + 1)}
                                disabled={(activeSubTab === "balances" ? currentPage * 50 >= (balancesPagination?.total || vacationBalances?.length) : currentPage * 50 >= (requestsPagination?.total || vacationRequests?.length))}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── MODALES ─── */}

            {/* VacationBalanceDetailModal */}
            {detailBalance && (
                <VacationBalanceDetailModal
                    balance={detailBalance}
                    onClose={() => setDetailBalance(null)}
                    isDark={isDark}
                />
            )}

            {/* VacationRequestDetailModal */}
            {detailRequest && (
                <VacationRequestDetailModal
                    request={detailRequest}
                    onClose={() => setDetailRequest(null)}
                    isDark={isDark}
                />
            )}

            {/* VacationRequestFormModal */}
            {showRequestFormModal && (
                <VacationRequestFormModal
                    open={showRequestFormModal}
                    onClose={() => { setShowRequestFormModal(false); setEditRequest(null); }}
                    onSubmit={handleCreateRequest}
                    isDark={isDark}
                    employees={employees}
                    periods={periods}
                    editingRequest={editRequest}
                />
            )}

            {/* HolidayFormModal */}
            {showHolidayFormModal && (
                <HolidayFormModal
                    open={showHolidayFormModal}
                    onClose={() => { setShowHolidayFormModal(false); setEditHoliday(null); }}
                    onSubmit={handleCreateHoliday}
                    isDark={isDark}
                    editingHoliday={editHoliday}
                />
            )}

            {/* ConfirmDialog - Aprobar Solicitud */}
            <ConfirmDialog
                open={!!applyConfirm}
                onClose={() => setApplyConfirm(null)}
                onConfirm={() => handleApply(applyConfirm)}
                title="¿Aprobar solicitud?"
                message="La solicitud será marcada como APROBADA y estará lista para ser procesada en nómina."
                confirmText="Aprobar"
                variant="info"
            />

            {/* RejectReasonModal */}
            {rejectConfirm && (
                <RejectReasonModal
                    open={true}
                    onClose={() => setRejectConfirm(null)}
                    onConfirm={handleReject}
                    requestId={rejectConfirm}
                    isDark={isDark}
                />
            )}

            {/* ConfirmDialog - Eliminar Festivo */}
            <ConfirmDialog
                open={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={() => handleDeleteHoliday(deleteConfirm)}
                title="¿Eliminar festivo?"
                message="Esta acción no se puede deshacer. El festivo será eliminado permanentemente."
                confirmText="Eliminar"
                variant="danger"
            />
        </div>
    )
}

export default PayrollVacationsTab