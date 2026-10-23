import { useEffect, useState, useMemo, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useSearchParams } from "react-router-dom"
import { HandlePayrollPeriods } from "../../../../../redux/Thunks/PayrollThunk.js"
import { Loading } from "../../../../../components/common/loading.jsx"
import { useIsDark } from "../../../../../hooks/useIsDark.js"
import { useHRAuth } from "../../../../../hooks/useHRAuth.js"
import { Calendar, Filter, Search, Calculator, CheckCircle, DollarSign, XCircle, ChevronDown, FileText, Clock, ArrowRight, RefreshCw } from "lucide-react"
import { CustomSelect } from "../../../../../components/ui/custom-select.jsx"
import { ConfirmDialog } from "../../../../../components/common/ConfirmDialog.jsx"
import { ThemedListWrapper, ThemedHeadingBar, ThemedListContainer } from "../../../../../components/common/Dashboard/ListDesigns"
import { PayrollPeriodFormModal } from "../../../../../components/payroll/PayrollPeriodFormModal.jsx"

export const PayrollPeriodsTab = () => {
    const isDark = useIsDark()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { data: periods, isLoading, error, pagination } = useSelector((state) => state.payrollReducer.periods)
    const { data: periodDetail, isLoading: detailLoading } = useSelector((state) => state.payrollReducer.period)

    // Permisos del HR actual
    const { can, isReady } = useHRAuth()

    const [statusFilter, setStatusFilter] = useState("all")
    const [searchTerm, setSearchTerm] = useState("")
    const [dateRange, setDateRange] = useState(() => {
        const from = searchParams.get("startDate")
        const to = searchParams.get("endDate")
        const norm = (v) => (v ? String(v).slice(0, 10) : "")
        return { start: norm(from), end: norm(to) }
    })
    const [currentPage, setCurrentPage] = useState(1)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editPeriod, setEditPeriod] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const [approveConfirm, setApproveConfirm] = useState(null)
    const [payConfirm, setPayConfirm] = useState(null)
    const [closeConfirm, setCloseConfirm] = useState(null)

    const table_headings = ["Período", "Fechas", "Estado", "Empleados", "Acciones"]

    const statusColors = {
        DRAFT: { bg: isDark ? "rgba(107,114,128,0.15)" : "#f3f4f6", text: isDark ? "#9ca3af" : "#6b7280", icon: FileText },
        CALCULATED: { bg: isDark ? "rgba(59,130,246,0.15)" : "#dbeafe", text: isDark ? "#93c5fd" : "#3b82f6", icon: Calculator },
        APPROVED: { bg: isDark ? "rgba(34,197,94,0.15)" : "#dcfce7", text: isDark ? "#86efac" : "#22c55e", icon: CheckCircle },
        PAID: { bg: isDark ? "rgba(251,191,36,0.15)" : "#fef3c7", text: isDark ? "#fcd34d" : "#f59e0b", icon: DollarSign },
        CLOSED: { bg: isDark ? "rgba(107,114,128,0.15)" : "#f3f4f6", text: isDark ? "#9ca3af" : "#6b7280", icon: XCircle },
    }

    useEffect(() => {
        const params = { page: currentPage, status: statusFilter !== "all" ? statusFilter : undefined }
        dispatch(HandlePayrollPeriods({ type: "GETALL", ...params }))
    }, [dispatch, currentPage, statusFilter])

    const handleDelete = useCallback(async (id) => {
        await dispatch(HandlePayrollPeriods({ type: "DELETE", id }))
        setDeleteConfirm(null)
    }, [dispatch])

    const handleApprove = useCallback(async (id) => {
        await dispatch(HandlePayrollPeriods({ type: "APPROVE", id }))
        setApproveConfirm(null)
    }, [dispatch])

    const handlePay = useCallback(async (id) => {
        await dispatch(HandlePayrollPeriods({ type: "PAY", id }))
        setPayConfirm(null)
    }, [dispatch])

    const handleClose = useCallback(async (id) => {
        await dispatch(HandlePayrollPeriods({ type: "CLOSE", id }))
        setCloseConfirm(null)
    }, [dispatch])

    const formatDate = (dateStr) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })
    }

    const formatDateRange = (start, end) => {
        return `${formatDate(start)} - ${formatDate(end)}`
    }

    const StatusBadge = ({ status }) => {
        const config = statusColors[status] || statusColors.DRAFT
        const Icon = config.icon
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors duration-300"
                style={{ background: config.bg, color: config.text }}>
            <Icon className="w-3 h-3" />
            {status}
        </span>
        )
    }

    if (isLoading && !periods) {
        return <Loading />
    }

    const totalCount = pagination?.total ?? periods?.length ?? 0
    const filteredCount = periods?.length ?? 0

    return (
        <div className="w-full h-full flex flex-col gap-6 px-4 py-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                        style={{ color: isDark ? "#003DA5" : "#003DA5" }}>
                        Nómina Venezolana
                    </p>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl xl:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Períodos de Nómina
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
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 text-white flex items-center gap-2"
                        style={{ background: "#003DA5" }}
                    >
                        <FileText className="w-4 h-4" />
                        Nuevo Período
                    </button>
                )}
            </div>

            {/* Divider */}
            <div className="h-px w-full transition-colors duration-300"
                style={{ background: isDark ? "rgba(0,61,165,0.08)" : "rgba(0,61,165,0.15)" }} />

            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Status Filter */}
                <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                    <label className="text-xs font-semibold uppercase tracking-wider"
                        style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                        <Filter className="w-3 h-3 inline mr-1" />
                        Estado
                    </label>
                    <CustomSelect
                        value={statusFilter}
                        onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
                        options={[
                            { value: "all", label: "Todos los estados" },
                            { value: "DRAFT", label: "Borrador" },
                            { value: "CALCULATED", label: "Calculado" },
                            { value: "APPROVED", label: "Aprobado" },
                            { value: "PAID", label: "Pagado" },
                            { value: "CLOSED", label: "Cerrado" },
                        ]}
                        accentColor="blue"
                    />
                </div>

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
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por nombre..."
                        className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200
                            bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                            focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
                            dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                            dark:placeholder-[rgba(255,255,255,0.25)] dark:focus:border-[rgba(0,61,165,0.5)]`} />
                </div>

                {/* Date Range */}
                <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                    <label className="text-xs font-semibold uppercase tracking-wider"
                        style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                        <Calendar className="w-3 h-3 inline mr-1" />
                        Fecha Inicio - Fin
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className={`w-full rounded-xl px-3 py-2 text-sm outline-none transition-all duration-200
                                bg-gray-50 border border-gray-200 text-gray-900
                                focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                                dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                dark:focus:border-[rgba(0,61,165,0.5)]`} />
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            className={`w-full rounded-xl px-3 py-2 text-sm outline-none transition-all duration-200
                                bg-gray-50 border border-gray-200 text-gray-900
                                focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                                dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                dark:focus:border-[rgba(0,61,165,0.5)]`} />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="flex flex-col gap-3 flex-1 min-h-0">
                <ThemedListWrapper accent="blue">
                    <ThemedHeadingBar accent="blue" table_layout="grid-cols-5" table_headings={table_headings} />
                </ThemedListWrapper>
                <ThemedListContainer accent="blue">
                    {filteredCount === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-300"
                                style={{ background: isDark ? "rgba(0,61,165,0.1)" : "rgba(0,61,165,0.1)" }}>
                                <FileText className="w-6 h-6 transition-colors duration-300"
                                    style={{ color: "#003DA5" }} />
                            </div>
                            <p className="text-sm font-medium transition-colors duration-300"
                                style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#9ca3af" }}>
                                {searchTerm || statusFilter !== "all" || dateRange.start
                                    ? "No se encontraron períodos con los filtros actuales"
                                    : "No hay períodos de nómina registrados"}
                            </p>
                        </div>
                    ) : (
                        periods.map((period, index) => {
                            return (
                                <div
                                    key={period._id ?? index}
                                    className="grid grid-cols-2 sm:grid-cols-5 gap-2 px-3 py-3 items-center
                                        border-b last:border-b-0
                                        border-gray-100 hover:bg-blue-50/50 hover:-translate-y-0.5 transition-all duration-150
                                        dark:border-[rgba(0,61,165,0.08)] dark:hover:bg-[rgba(0,61,165,0.04)]"
                                >
                                    {/* Period Name */}
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold truncate text-gray-800 dark:text-white"
                                            title={period.name}>
                                            {period.name}
                                        </p>
                                        <p className="text-xs truncate mt-0.5"
                                            style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }}>
                                            {period.period_type} • {period.period_frequency} • {period.days_count} días
                                        </p>
                                    </div>

                                    {/* Date Range */}
                                    <div className="hidden sm:flex sm:items-center sm:justify-center min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3"
                                                style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }} />
                                            <p className="text-xs"
                                                style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#6b7280" }}>
                                                {formatDateRange(period.start_date, period.end_date)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="hidden sm:flex sm:items-center sm:justify-center">
                                        <StatusBadge status={period.status} />
                                    </div>

                                    {/* Employees Count / Net Total */}
                                    <div className="hidden lg:flex lg:items-center lg:justify-center">
                                        <p className="text-xs font-medium"
                                            style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#4b5563" }}>
                                            {period.receipts_count || 0} recibos
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-center gap-2">
                                        {/* Calculate */}
                                        {period.status === "DRAFT" && can("payroll", "calculate") && (
                                            <button
                                                onClick={() => dispatch(HandlePayrollPeriods({ type: "CALCULATE", id: period._id }))}
                                                disabled={detailLoading}
                                                className="p-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                                                style={{
                                                    background: isDark ? "rgba(59,130,246,0.1)" : "#dbeafe",
                                                    color: isDark ? "#93c5fd" : "#3b82f6"
                                                }}
                                                title="Calcular nómina"
                                            >
                                                <Calculator className="w-4 h-4" />
                                            </button>
                                        )}

                                        {/* Approve */}
                                        {period.status === "CALCULATED" && can("payroll", "approve") && (
                                            <button
                                                onClick={() => setApproveConfirm(period._id)}
                                                disabled={detailLoading}
                                                className="p-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                                                style={{
                                                    background: isDark ? "rgba(34,197,94,0.1)" : "#dcfce7",
                                                    color: isDark ? "#86efac" : "#22c55e"
                                                }}
                                                title="Aprobar nómina"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                            </button>
                                        )}

                                        {/* Pay */}
                                        {period.status === "APPROVED" && can("payroll", "pay") && (
                                            <button
                                                onClick={() => setPayConfirm(period._id)}
                                                disabled={detailLoading}
                                                className="p-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                                                style={{
                                                    background: isDark ? "rgba(251,191,36,0.1)" : "#fef3c7",
                                                    color: isDark ? "#fcd34d" : "#f59e0b"
                                                }}
                                                title="Marcar como pagado"
                                            >
                                                <DollarSign className="w-4 h-4" />
                                            </button>
                                        )}

                                        {/* Close */}
                                        {period.status === "PAID" && can("payroll", "close") && (
                                            <button
                                                onClick={() => setCloseConfirm(period._id)}
                                                disabled={detailLoading}
                                                className="p-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                                                style={{
                                                    background: isDark ? "rgba(107,114,128,0.1)" : "#f3f4f6",
                                                    color: isDark ? "#9ca3af" : "#6b7280"
                                                }}
                                                title="Cerrar período"
                                            >
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                        )}

                                        {/* View Receipts */}
                                        {can("payroll", "read") && (
                                            <button
                                                onClick={() => navigate(`/human-resources/payroll/periods/${period._id}/receipts`)}
                                                className="p-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                                                style={{
                                                    background: isDark ? "rgba(0,61,165,0.1)" : "rgba(0,61,165,0.1)",
                                                    color: "#003DA5"
                                                }}
                                                title="Ver recibos"
                                            >
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        )}

                                        {/* Edit */}
                                        {period.status === "DRAFT" && can("payroll", "update") && (
                                            <button
                                                onClick={() => setEditPeriod(period)}
                                                className="p-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                                                style={{
                                                    background: isDark ? "rgba(255,255,255,0.05)" : "#f3f4f6",
                                                    color: isDark ? "rgba(255,255,255,0.6)" : "#6b7280"
                                                }}
                                                title="Editar"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                            </button>
                                        )}

                                        {/* Delete */}
                                        {period.status === "DRAFT" && can("payroll", "delete") && (
                                            <button
                                                onClick={() => setDeleteConfirm(period._id)}
                                                className="p-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                                                style={{
                                                    background: isDark ? "rgba(239,68,68,0.1)" : "#fee2e2",
                                                    color: isDark ? "#f87171" : "#dc2626"
                                                }}
                                                title="Eliminar"
                                            >
                                                <XCircle className="w-4 h-4" />
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
            {pagination?.pages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-xl transition-all duration-200 disabled:opacity-50"
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
                        className="p-2 rounded-xl transition-all duration-200 disabled:opacity-50"
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
            <PayrollPeriodFormModal
                open={showCreateModal || !!editPeriod}
                onClose={() => { setShowCreateModal(false); setEditPeriod(null); }}
                initialData={editPeriod}
                onSubmit={(data) => {
                    if (editPeriod) {
                        dispatch(HandlePayrollPeriods({ type: "UPDATE", id: editPeriod._id, data }))
                    } else {
                        dispatch(HandlePayrollPeriods({ type: "CREATE", data }))
                    }
                    setShowCreateModal(false)
                    setEditPeriod(null)
                }}
            />

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={() => handleDelete(deleteConfirm)}
                title="¿Eliminar período?"
                message="Esta acción no se puede deshacer. El período será eliminado permanentemente."
                confirmText="Eliminar"
                variant="danger"
            />

            {/* Approve Confirmation */}
            <ConfirmDialog
                open={!!approveConfirm}
                onClose={() => setApproveConfirm(null)}
                onConfirm={() => handleApprove(approveConfirm)}
                title="¿Aprobar nómina?"
                message="Se aprobará el cálculo de la nómina. Una vez aprobada, se generará el asiento contable y no se podrán modificar los cálculos."
                confirmText="Aprobar"
                variant="primary"
            />

            {/* Pay Confirmation */}
            <ConfirmDialog
                open={!!payConfirm}
                onClose={() => setPayConfirm(null)}
                onConfirm={() => handlePay(payConfirm)}
                title="¿Marcar como pagado?"
                message="Se marcará el período como pagado. Se generarán los archivos bancarios y se enviarán las boletas por email."
                confirmText="Confirmar pago"
                variant="primary"
            />

            {/* Close Confirmation */}
            <ConfirmDialog
                open={!!closeConfirm}
                onClose={() => setCloseConfirm(null)}
                onConfirm={() => handleClose(closeConfirm)}
                title="¿Cerrar período?"
                message="Se cerrará el período de nómina. No se podrán realizar más acciones sobre este período."
                confirmText="Cerrar"
                variant="secondary"
            />
        </div>
    )
}

export default PayrollPeriodsTab