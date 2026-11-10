import { useEffect, useState, useCallback, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useSearchParams } from "react-router-dom"
import { HandlePayrollNovelties } from "../../../../../redux/Thunks/PayrollThunk.js"
import { Loading } from "../../../../../components/common/loading.jsx"
import { useIsDark } from "../../../../../hooks/useIsDark.js"
import { useHRAuth } from "../../../../../hooks/useHRAuth.js"
import { CustomSelect } from "../../../../../components/ui/custom-select.jsx"
import { ConfirmDialog } from "../../../../../components/common/ConfirmDialog.jsx"
import { ThemedListWrapper, ThemedHeadingBar, ThemedListContainer } from "../../../../../components/common/Dashboard/ListDesigns"
import { NoveltyFormModal } from "../../../../../components/payroll/NoveltyFormModal.jsx"
import { Search, Filter, Calendar, FileText, ChevronDown, Eye, Edit, CheckCircle, XCircle, Trash2, RefreshCw, AlertTriangle, Download, Upload, Loader2, Settings } from "lucide-react"

// --- NoveltyDetailModal Component ---
const NoveltyDetailModal = ({ novelty, onClose, isDark }) => {
    const formatCurrency = (val) => {
        if (val === undefined || val === null) return '—'
        return `$ ${val.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return '—'
        return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    const statusConfig = {
        PENDING: { bg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Pendiente', icon: AlertTriangle },
        APPLIED: { bg: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Aplicada', icon: CheckCircle },
        REJECTED: { bg: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', label: 'Rechazada', icon: XCircle },
    }

    const sourceConfig = {
        MANUAL: { bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', label: 'Manual' },
        IMPORT: { bg: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', label: 'Importación' },
        BIOMETRIC: { bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400', label: 'Biométrico' },
        POS: { bg: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400', label: 'POS' },
        LEAVE: { bg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400', label: 'Licencia' },
        LOAN: { bg: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', label: 'Préstamo' },
        ADVANCE: { bg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400', label: 'Anticipo' },
    }

    const s = statusConfig[novelty.status] || statusConfig.PENDING
    const src = sourceConfig[novelty.source] || sourceConfig.MANUAL
    const StatusIcon = s.icon

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b transition-colors duration-300"
                    style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.1)" }}>
                            <FileText className="w-5 h-5" style={{ color: "#003DA5" }} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Detalle de Novedad</h2>
                            <p className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                {novelty.employee?.firstname} {novelty.employee?.lastname} • {novelty.period?.name}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg}`}>
                            <StatusIcon className="w-3 h-3" />
                            {s.label}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${src.bg}`}>
                            {src.label}
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
                            <p className="font-medium text-gray-900 dark:text-white">{novelty.employee?.firstname} {novelty.employee?.lastname}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Departamento</p>
                            <p className="font-medium text-gray-900 dark:text-white">{novelty.employee?.department?.name || '—'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Período</p>
                            <p className="font-medium text-gray-900 dark:text-white">{novelty.period?.name || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Fechas Período</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                                {novelty.period?.start_date && novelty.period?.end_date
                                    ? `${formatDate(novelty.period.start_date)} - ${formatDate(novelty.period.end_date)}`
                                    : '—'}
                            </p>
                        </div>
                    </div>

                    {/* Concept Info */}
                    <div className="mb-6 p-4 rounded-xl transition-colors duration-300"
                        style={{ 
                            background: isDark ? "rgba(0,61,165,0.08)" : "rgba(0,61,165,0.05)",
                            border: isDark ? "1px solid rgba(0,61,165,0.2)" : "1px solid rgba(0,61,165,0.15)"
                        }}>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Settings className="w-5 h-5" style={{ color: "#003DA5" }} />
                            Concepto
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Código</p>
                                <p className="font-mono font-medium text-gray-900 dark:text-white">{novelty.concept_code}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Monto Unitario</p>
                                <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(novelty.amount)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Cantidad</p>
                                <p className="font-medium text-gray-900 dark:text-white">{novelty.quantity}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Unidad</p>
                                <p className="font-medium text-gray-900 dark:text-white">{novelty.unit}</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Calculado</p>
                            <p className="font-bold text-xl text-gray-900 dark:text-white">{formatCurrency((novelty.amount || 0) * (novelty.quantity || 1))}</p>
                        </div>
                    </div>

                    {/* Description */}
                    {novelty.description && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Descripción</h3>
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{novelty.description}</p>
                        </div>
                    )}

                    {/* References */}
                    {(novelty.reference_id || novelty.reference_model) && (
                        <div className="mb-6 p-4 rounded-xl transition-colors duration-300"
                            style={{ 
                                background: isDark ? "rgba(255,255,255,0.04)" : "#f9fafb",
                                border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.05)"
                            }}>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Referencias</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {novelty.reference_id && (
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">ID Referencia</p>
                                        <p className="font-mono text-sm text-gray-900 dark:text-white">{novelty.reference_id}</p>
                                    </div>
                                )}
                                {novelty.reference_model && (
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Modelo Referencia</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{novelty.reference_model}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Status Info */}
                    <div className="mb-6 p-4 rounded-xl transition-colors duration-300"
                        style={{ 
                            background: isDark ? "rgba(255,255,255,0.04)" : "#f9fafb",
                            border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.05)"
                        }}>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Estado y Auditoría</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Estado</p>
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${s.bg}`}>
                                    <StatusIcon className="w-3 h-3" />
                                    {s.label}
                                </span>
                            </div>
                            {novelty.applied_at && (
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Aplicada el</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(novelty.applied_at)}</p>
                                </div>
                            )}
                            {novelty.applied_by && (
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Aplicada por</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{novelty.applied_by.firstname} {novelty.applied_by.lastname}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Creada</p>
                                <p className="font-medium text-gray-900 dark:text-white">{formatDate(novelty.createdAt)}</p>
                            </div>
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

// --- RejectConfirmModal Component (with reason input) ---
const RejectConfirmModal = ({ open, onClose, onConfirm, noveltyId, isDark }) => {
    const [reason, setReason] = useState("")

    useEffect(() => {
        if (open) setReason("")
    }, [open])

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start gap-3 p-6">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: isDark ? "rgba(239,68,68,0.15)" : "#fee2e2" }}>
                        <XCircle className="w-5 h-5" style={{ color: "#dc2626" }} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">¿Rechazar novedad?</h3>
                        <p className="text-sm mb-4" style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#6b7280" }}>
                            La novedad será marcada como RECHAZADA. Se registrará el motivo y no se aplicará al cálculo de nómina.
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
                            <button onClick={() => { onConfirm(noveltyId, reason); onClose(); }} disabled={!reason.trim()} className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: "#dc2626" }}>
                                Rechazar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export const PayrollNoveltiesTab = () => {
    const isDark = useIsDark()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { data: novelties, isLoading, error, pagination } = useSelector((state) => state.payrollReducer.novelties)
    const { data: periods } = useSelector((state) => state.payrollReducer.periods)
    const { data: concepts } = useSelector((state) => state.payrollReducer.concepts)
    const { can, isReady } = useHRAuth()

    const [statusFilter, setStatusFilter] = useState("all")
    const [searchTerm, setSearchTerm] = useState("")
    const [periodFilter, setPeriodFilter] = useState("")
    const [conceptFilter, setConceptFilter] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [showFormModal, setShowFormModal] = useState(false)
    const [editNovelty, setEditNovelty] = useState(null)
    const [detailNovelty, setDetailNovelty] = useState(null)
    const [applyConfirm, setApplyConfirm] = useState(null)
    const [rejectConfirm, setRejectConfirm] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

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

    const conceptOptions = useMemo(() => [
        { value: "all", label: "Todos los conceptos" },
        ...(concepts?.filter(c => c.active && c.is_novelty_eligible).map(c => ({ value: c.code, label: `${c.code} - ${c.name}` })) || [])
    ], [concepts])

    const statusOptions = useMemo(() => [
        { value: "all", label: "Todos los estados" },
        { value: "PENDING", label: "Pendiente" },
        { value: "APPLIED", label: "Aplicada" },
        { value: "REJECTED", label: "Rechazada" },
    ], [])

    useEffect(() => {
        const params = { 
            page: currentPage, 
            limit: 50,
            status: statusFilter !== "all" ? statusFilter : undefined,
            period: periodFilter !== "all" ? periodFilter : undefined,
            concept_code: conceptFilter !== "all" ? conceptFilter : undefined,
        }
        dispatch(HandlePayrollNovelties({ type: "GETALL", ...params }))
    }, [dispatch, currentPage, statusFilter, periodFilter, conceptFilter])

    const handleApply = useCallback(async (id) => {
        await dispatch(HandlePayrollNovelties({ type: "APPLY", id })).unwrap()
        setApplyConfirm(null)
    }, [dispatch])

    const handleReject = useCallback(async (id, reason) => {
        await dispatch(HandlePayrollNovelties({ type: "REJECT", id, reason })).unwrap()
        setRejectConfirm(null)
    }, [dispatch])

    const handleDelete = useCallback(async (id) => {
        await dispatch(HandlePayrollNovelties({ type: "DELETE", id })).unwrap()
        setDeleteConfirm(null)
    }, [dispatch])

    const formatCurrency = (val) => {
        if (val === undefined || val === null) return '—'
        return `$ ${val.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return '—'
        return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    const statusConfig = {
        PENDING: { bg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: AlertTriangle, label: 'Pendiente' },
        APPLIED: { bg: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle, label: 'Aplicada' },
        REJECTED: { bg: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: XCircle, label: 'Rechazada' },
    }

    const sourceConfig = {
        MANUAL: { bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', label: 'Manual' },
        IMPORT: { bg: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', label: 'Importación' },
        BIOMETRIC: { bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400', label: 'Biométrico' },
        POS: { bg: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400', label: 'POS' },
        LEAVE: { bg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400', label: 'Licencia' },
        LOAN: { bg: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', label: 'Préstamo' },
        ADVANCE: { bg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400', label: 'Anticipo' },
    }

    if (isLoading && !novelties) {
        return <Loading />
    }

    if (error) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8">
                <div className="text-center text-red-500">
                    <p className="font-bold">Error cargando novedades</p>
                    <p className="text-sm text-gray-500">{error}</p>
                </div>
            </div>
        )
    }

    const totalCount = pagination?.total ?? novelties?.length ?? 0
    const filteredCount = novelties?.length ?? 0

    const table_headings = ["Empleado", "Período", "Concepto", "Cantidad", "Unidad", "Monto", "Estado", "Origen", "Acciones"]
    const table_layout = "grid-cols-2 sm:grid-cols-9"
    const hiddenCols = ["Período", "Concepto", "Unidad", "Origen"]

    return (
        <div className="w-full h-full flex flex-col gap-6 px-4 py-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#003DA5" }}>
                        Nómina Venezolana
                    </p>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl xl:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Novedades
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors duration-300"
                            style={{
                                background: isDark ? "rgba(0,61,165,0.12)" : "rgba(0,61,165,0.10)",
                                color: "#003DA5",
                                border: isDark ? "1px solid rgba(0,61,165,0.30)" : "1px solid rgba(0,61,165,0.25)"
                            }}>
                            {totalCount} total
                        </span>
                    </div>
                </div>

                {isReady && can("payroll", "create") && (
                    <button
                        onClick={() => { setEditNovelty(null); setShowFormModal(true); }}
                        className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 text-white flex items-center gap-2"
                        style={{ background: "#003DA5" }}
                    >
                        <FileText className="w-4 h-4" />
                        Nueva Novedad
                    </button>
                )}
            </div>

            {/* Divider */}
            <div className="h-px w-full transition-colors duration-300"
                style={{ background: isDark ? "rgba(0,61,165,0.08)" : "rgba(0,61,165,0.15)" }} />

            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                    <label className="text-xs font-semibold uppercase tracking-wider"
                        style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                        <Search className="w-3 h-3 inline mr-1" />
                        Buscar
                    </label>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        placeholder="Buscar por empleado, concepto..."
                        className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200
                            bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                            focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
                            dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                            dark:placeholder-[rgba(255,255,255,0.25)] dark:focus:border-[rgba(0,61,165,0.5)]`} />
                </div>

                {/* Period Filter */}
                <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                    <label className="text-xs font-semibold uppercase tracking-wider"
                        style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                        <Calendar className="w-3 h-3 inline mr-1" />
                        Período
                    </label>
                    <CustomSelect
                        value={periodFilter}
                        onValueChange={(val) => { setPeriodFilter(val); setCurrentPage(1); }}
                        options={periodOptions}
                        placeholder="Todos los períodos"
                        accentColor="blue"
                        searchPlaceholder="Buscar período..."
                    />
                </div>

                {/* Concept Filter */}
                <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                    <label className="text-xs font-semibold uppercase tracking-wider"
                        style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                        <Settings className="w-3 h-3 inline mr-1" />
                        Concepto
                    </label>
                    <CustomSelect
                        value={conceptFilter}
                        onValueChange={(val) => { setConceptFilter(val); setCurrentPage(1); }}
                        options={conceptOptions}
                        placeholder="Todos los conceptos"
                        accentColor="blue"
                        searchPlaceholder="Buscar concepto..."
                    />
                </div>

                {/* Status Filter */}
                <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
                    <label className="text-xs font-semibold uppercase tracking-wider"
                        style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                        <Filter className="w-3 h-3 inline mr-1" />
                        Estado
                    </label>
                    <CustomSelect
                        value={statusFilter}
                        onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
                        options={statusOptions}
                        placeholder="Todos los estados"
                        accentColor="blue"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="flex flex-col gap-3 flex-1 min-h-0">
                <ThemedListWrapper accent="blue">
                    <ThemedHeadingBar accent="blue" table_layout={table_layout} table_headings={table_headings} hiddenCols={hiddenCols} />
                </ThemedListWrapper>
                <ThemedListContainer accent="blue">
                    {filteredCount === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-300"
                                style={{ background: isDark ? "rgba(0,61,165,0.1)" : "rgba(0,61,165,0.1)" }}>
                                <FileText className="w-6 h-6 transition-colors duration-300" style={{ color: "#003DA5" }} />
                            </div>
                            <p className="text-sm font-medium transition-colors duration-300"
                                style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#9ca3af" }}>
                                {searchTerm || statusFilter !== "all" || periodFilter !== "all" || conceptFilter !== "all"
                                    ? "No se encontraron novedades con los filtros actuales"
                                    : "No hay novedades registradas"}
                            </p>
                        </div>
                    ) : (
                        novelties.map((novelty, index) => {
                            const s = statusConfig[novelty.status] || statusConfig.PENDING
                            const src = sourceConfig[novelty.source] || sourceConfig.MANUAL
                            const StatusIcon = s.icon

                            return (
                                <div
                                    key={novelty._id ?? index}
                                    className="grid grid-cols-2 sm:grid-cols-9 gap-2 px-3 py-3 items-center
                                        border-b last:border-b-0 transition-colors duration-150
                                        border-gray-100 hover:bg-blue-50/50 hover:-translate-y-0.5
                                        dark:border-[rgba(0,61,165,0.08)] dark:hover:bg-[rgba(0,61,165,0.04)]"
                                >
                                    {/* Empleado */}
                                    <div className="min-w-0 col-span-2 sm:col-span-1">
                                        <p className="text-sm font-semibold truncate text-gray-900 dark:text-white"
                                            title={`${novelty.employee?.firstname} ${novelty.employee?.lastname}`}>
                                            {novelty.employee?.firstname} {novelty.employee?.lastname}
                                        </p>
                                        <p className="text-xs truncate mt-0.5"
                                            style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }}>
                                            {novelty.employee?.department?.name || '—'}
                                        </p>
                                    </div>

                                    {/* Período */}
                                    <div className="hidden sm:block sm:col-span-1 min-w-0">
                                        <p className="text-sm font-medium truncate text-gray-900 dark:text-white"
                                            title={novelty.period?.name}>
                                            {novelty.period?.name || 'N/A'}
                                        </p>
                                        <p className="text-xs truncate mt-0.5"
                                            style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#6b7280" }}>
                                            {novelty.period?.start_date && novelty.period?.end_date
                                                ? `${new Date(novelty.period.start_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} - ${new Date(novelty.period.end_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}`
                                                : '—'}
                                        </p>
                                    </div>

                                    {/* Concepto */}
                                    <div className="hidden sm:block sm:col-span-1 min-w-0">
                                        <p className="text-sm font-medium truncate text-gray-900 dark:text-white"
                                            title={novelty.concept_code}>
                                            {novelty.concept_code}
                                        </p>
                                    </div>

                                    {/* Cantidad */}
                                    <div className="hidden sm:block sm:col-span-1 text-center text-gray-500 dark:text-gray-400">
                                        <p className="text-sm">{novelty.quantity}</p>
                                    </div>

                                    {/* Unidad */}
                                    <div className="hidden sm:block sm:col-span-1 text-center text-gray-500 dark:text-gray-400">
                                        <p className="text-sm">{novelty.unit}</p>
                                    </div>

                                    {/* Monto */}
                                    <div className="hidden sm:block sm:col-span-1 text-right">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {formatCurrency(novelty.amount)}
                                        </p>
                                    </div>

                                    {/* Estado */}
                                    <div className="hidden sm:block sm:col-span-1 text-center">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg}`}>
                                            <StatusIcon className="w-3 h-3" />
                                            {s.label}
                                        </span>
                                    </div>

                                    {/* Origen */}
                                    <div className="hidden sm:block sm:col-span-1 text-center">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${src.bg}`}>
                                            {src.label}
                                        </span>
                                    </div>

                                    {/* Acciones */}
                                    <div className="flex items-center justify-center gap-1.5 col-span-2 sm:col-span-1">
                                        {/* Ver Detalle */}
                                        {can("payroll", "read") && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setDetailNovelty(novelty); }}
                                                className="p-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                                                style={{
                                                    background: isDark ? "rgba(0,61,165,0.1)" : "rgba(0,61,165,0.1)",
                                                    color: "#003DA5"
                                                }}
                                                title="Ver detalle"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        )}

                                        {/* Editar - solo PENDING */}
                                        {novelty.status === "PENDING" && can("payroll", "update") && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setEditNovelty(novelty); setShowFormModal(true); }}
                                                className="p-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                                                style={{
                                                    background: isDark ? "rgba(59,130,246,0.1)" : "#dbeafe",
                                                    color: isDark ? "#93c5fd" : "#3b82f6"
                                                }}
                                                title="Editar"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                        )}

                                        {/* Aplicar - solo PENDING */}
                                        {novelty.status === "PENDING" && can("payroll", "update") && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setApplyConfirm(novelty._id); }}
                                                className="p-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                                                style={{
                                                    background: isDark ? "rgba(34,197,94,0.1)" : "#dcfce7",
                                                    color: isDark ? "#86efac" : "#22c55e"
                                                }}
                                                title="Aplicar novedad"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                            </button>
                                        )}

                                        {/* Rechazar - solo PENDING */}
                                        {novelty.status === "PENDING" && can("payroll", "update") && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setRejectConfirm(novelty); }}
                                                className="p-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                                                style={{
                                                    background: isDark ? "rgba(239,68,68,0.1)" : "#fee2e2",
                                                    color: isDark ? "#f87171" : "#dc2626"
                                                }}
                                                title="Rechazar novedad"
                                            >
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                        )}

                                        {/* Eliminar - solo PENDING */}
                                        {novelty.status === "PENDING" && can("payroll", "delete") && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setDeleteConfirm(novelty._id); }}
                                                className="p-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                                                style={{
                                                    background: isDark ? "rgba(107,114,128,0.1)" : "#f3f4f6",
                                                    color: isDark ? "#9ca3af" : "#6b7280"
                                                }}
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </ThemedListContainer>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            background: isDark ? "rgba(255,255,255,0.05)" : "#f3f4f6",
                            color: isDark ? "rgba(255,255,255,0.6)" : "#6b7280"
                        }}
                    >
                        <ChevronDown className="w-4 h-4 rotate-180" />
                    </button>
                    <span className="text-sm font-medium"
                        style={{ color: isDark ? "rgba(255,255,255,0.8)" : "#374151" }}>
                        Página {currentPage} de {pagination.pages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
                        disabled={currentPage === pagination.pages}
                        className="p-2 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            background: isDark ? "rgba(255,255,255,0.05)" : "#f3f4f6",
                            color: isDark ? "rgba(255,255,255,0.6)" : "#6b7280"
                        }}
                    >
                        <ChevronDown className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Create/Edit Modal */}
            <NoveltyFormModal
                open={showFormModal}
                onClose={() => { setShowFormModal(false); setEditNovelty(null); }}
                initialData={editNovelty}
                onSubmit={(data) => {
                    if (editNovelty) {
                        dispatch(HandlePayrollNovelties({ type: "UPDATE", id: editNovelty._id, data }))
                    } else {
                        dispatch(HandlePayrollNovelties({ type: "CREATE", data }))
                    }
                    setShowFormModal(false)
                    setEditNovelty(null)
                }}
                isSubmitting={isSubmitting}
            />

            {/* Detail Modal */}
            {detailNovelty && (
                <NoveltyDetailModal
                    novelty={detailNovelty}
                    onClose={() => setDetailNovelty(null)}
                    isDark={isDark}
                />
            )}

            {/* Apply Confirmation */}
            <ConfirmDialog
                open={!!applyConfirm}
                onClose={() => setApplyConfirm(null)}
                onConfirm={() => handleApply(applyConfirm)}
                title="¿Aplicar novedad?"
                message="Se aplicará la novedad al cálculo de nómina. El recibo del empleado se marcará para recálculo automático."
                confirmText="Aplicar"
                variant="primary"
            />

            {/* Reject Confirmation */}
            <RejectConfirmModal
                open={!!rejectConfirm}
                onClose={() => setRejectConfirm(null)}
                onConfirm={(id, reason) => handleReject(id, reason)}
                noveltyId={rejectConfirm?._id}
                isDark={isDark}
            />

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={() => handleDelete(deleteConfirm)}
                title="¿Eliminar novedad?"
                message="Esta acción no se puede deshacer. La novedad será eliminada permanentemente."
                confirmText="Eliminar"
                variant="danger"
            />
        </div>
    )
}

export default PayrollNoveltiesTab