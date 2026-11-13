import { useEffect, useState, useCallback, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useSearchParams } from "react-router-dom"
import { HandleUtilidades } from "../../../../../redux/Thunks/PayrollThunk.js"
import { HandlePayrollPeriods } from "../../../../../redux/Thunks/PayrollThunk.js"
import { Loading } from "../../../../../components/common/loading.jsx"
import { useIsDark } from "../../../../../hooks/useIsDark.js"
import { useHRAuth } from "../../../../../hooks/useHRAuth.js"
import { CustomSelect } from "../../../../../components/ui/custom-select.jsx"
import { ConfirmDialog } from "../../../../../components/common/ConfirmDialog.jsx"
import { ThemedListWrapper, ThemedHeadingBar, ThemedListContainer } from "../../../../../components/common/Dashboard/ListDesigns"
import {
    Calendar, FileText, Filter, Search, Plus, Eye, CheckCircle, XCircle, DollarSign, Trash2, RefreshCw,
    AlertTriangle, Settings, ChevronDown, ChevronUp, CreditCard, Building2, Coins, Receipt, List,
    ArrowRight, ArrowLeft, Download, Upload, History, HelpCircle, Info, Calendar as CalendarIcon, Handshake,
    Calculator, ClipboardList, BarChart2, Users, Activity, SlidersHorizontal, Clock
} from "lucide-react"

// ──────────────────────────────────────────────────────────────────────────────
// CONSTANTES Y OPCIONES — Definidas en scope principal ANTES de render functions
// (Bug Prevention #4: Variable Scope en Render Functions)
// ──────────────────────────────────────────────────────────────────────────────

const SUB_TABS = [
    { id: "periods", label: "Períodos", icon: CalendarIcon },
    { id: "payments", label: "Pagos", icon: CreditCard },
    { id: "calculation", label: "Cálculo", icon: Calculator },
]

const PERIOD_STATUS_OPTIONS = [
    { value: "select", label: "Todos los estados" },
    { value: "OPEN", label: "Abierto" },
    { value: "CALCULATING", label: "Calculando" },
    { value: "CALCULATED", label: "Calculado" },
    { value: "APPROVED", label: "Aprobado" },
    { value: "PAID", label: "Pagado" },
    { value: "CLOSED", label: "Cerrado" },
]

const PERIOD_STATUS_CONFIG = {
    OPEN: { bg: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", label: "Abierto", icon: Clock },
    CALCULATING: { bg: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", label: "Calculando", icon: RefreshCw },
    CALCULATED: { bg: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400", label: "Calculado", icon: CheckCircle },
    APPROVED: { bg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400", label: "Aprobado", icon: CheckCircle },
    PAID: { bg: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", label: "Pagado", icon: DollarSign },
    CLOSED: { bg: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400", label: "Cerrado", icon: XCircle },
}

const PAYMENT_STATUS_OPTIONS = [
    { value: "select", label: "Todos los estados" },
    { value: "PENDING", label: "Pendiente" },
    { value: "PAID", label: "Pagado" },
    { value: "VOIDED", label: "Anulado" },
]

const PAYMENT_STATUS_CONFIG = {
    PENDING: { bg: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", label: "Pendiente", icon: Clock },
    PAID: { bg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400", label: "Pagado", icon: CheckCircle },
    VOIDED: { bg: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", label: "Anulado", icon: XCircle },
}

const DISTRIBUTION_METHOD_OPTIONS = [
    { value: "MIXED_50_50", label: "Mixto 50/50 (Días + Salario)" },
    { value: "DAYS_ONLY", label: "Solo Días Trabajados" },
    { value: "SALARY_ONLY", label: "Solo Salario Promedio" },
]

// ──────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ──────────────────────────────────────────────────────────────────────────────

export const PayrollUtilitiesTab = () => {
    const isDark = useIsDark()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const { hasPermission } = useHRAuth()

    // ─── Redux Selectors — KEY CORRECTA: payrollReducer (Bug Prevention #1) ───
    const utilidadesPeriods = useSelector(state => state.payrollReducer.utilidadesPeriods)
    const utilidadesPeriod = useSelector(state => state.payrollReducer.utilidadesPeriod)
    const utilidadesPayments = useSelector(state => state.payrollReducer.utilidadesPayments)
    const utilidadesPayment = useSelector(state => state.payrollReducer.utilidadesPayment)

    // ─── Estado Local ───
    const [activeSubTab, setActiveSubTab] = useState("periods")
    const [searchTerm, setSearchTerm] = useState("")
    const [periodFilters, setPeriodFilters] = useState({ year: "", status: "select" })
    const [paymentFilters, setPaymentFilters] = useState({ period: "select", status: "select", employee: "select" })
    const [calculationParams, setCalculationParams] = useState({
        year: new Date().getFullYear(),
        netProfitVes: "",
        distributionMethod: "MIXED_50_50",
    })

    // Modales
    const [periodDetailModal, setPeriodDetailModal] = useState({ open: false, period: null })
    const [periodFormModal, setPeriodFormModal] = useState({ open: false, editing: null })
    const [calculatePreviewModal, setCalculatePreviewModal] = useState({ open: false, period: null, preview: null })
    const [paymentDetailModal, setPaymentDetailModal] = useState({ open: false, payment: null })
    const [confirmDialog, setConfirmDialog] = useState({ open: false, title: "", message: "", onConfirm: null, variant: "danger" })

    // ─── Helpers de formato — Definidos ANTES de callbacks (Bug Prevention #3) ───
    const formatDate = useCallback((dateStr) => {
        if (!dateStr) return "—"
        return new Date(dateStr).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })
    }, [])

    const formatCurrency = useCallback((val) => {
        if (val === undefined || val === null) return "—"
        return `$ ${val.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }, [])

    const getPeriodStatusConfig = useCallback((status) => PERIOD_STATUS_CONFIG[status] || PERIOD_STATUS_CONFIG.OPEN, [])
    const getPaymentStatusConfig = useCallback((status) => PAYMENT_STATUS_CONFIG[status] || PAYMENT_STATUS_CONFIG.PENDING, [])

    // ─── Build Params — useCallback ANTES de useEffect (Bug Prevention #3) ───
    const buildPeriodParams = useCallback(() => {
        const params = {}
        if (periodFilters.year) params.year = periodFilters.year
        if (periodFilters.status !== "select") params.status = periodFilters.status
        return params
    }, [periodFilters])

    const buildPaymentParams = useCallback(() => {
        const params = {}
        if (paymentFilters.period !== "select") params.period = paymentFilters.period
        if (paymentFilters.status !== "select") params.status = paymentFilters.status
        if (paymentFilters.employee !== "select") params.employee = paymentFilters.employee
        return params
    }, [paymentFilters])

    // ─── useEffect — DESPUÉS de callbacks (Bug Prevention #3) ───
    useEffect(() => {
        const params = buildPeriodParams()
        dispatch(HandleUtilidades({ type: "PERIODS_GETALL", ...params }))
    }, [dispatch, buildPeriodParams])

    useEffect(() => {
        if (paymentFilters.period !== "select") {
            const params = buildPaymentParams()
            dispatch(HandleUtilidades({ type: "PAYMENTS_GETALL", ...params }))
        }
    }, [dispatch, buildPaymentParams, paymentFilters.period])

    // Cargar períodos para selects
    useEffect(() => {
        dispatch(HandleUtilidades({ type: "PERIODS_GETALL", page: 1, limit: 100 }))
    }, [dispatch])

    // ─── Handlers — useCallback para estabilidad ───
    const handlePeriodFilterChange = useCallback((key, value) => {
        setPeriodFilters(prev => ({ ...prev, [key]: value }))
    }, [])

    const handlePaymentFilterChange = useCallback((key, value) => {
        setPaymentFilters(prev => ({ ...prev, [key]: value }))
    }, [])

    const handleSearchChange = useCallback((value) => {
        setSearchTerm(value)
    }, [])

    const openPeriodDetail = useCallback((period) => {
        setPeriodDetailModal({ open: true, period })
    }, [])

    const openPeriodForm = useCallback((editing = null) => {
        setPeriodFormModal({ open: true, editing })
    }, [])

    const openCalculatePreview = useCallback(async (period) => {
        try {
            const result = await dispatch(HandleUtilidades({ type: "PERIODS_CALCULATE", id: period._id })).unwrap()
            setCalculatePreviewModal({ open: true, period, preview: result.data })
        } catch (error) {
            console.error("Error calculando preview:", error)
        }
    }, [dispatch])

    const handleCalculate = useCallback(async (period) => {
        setConfirmDialog({
            open: true,
            title: "Calcular Utilidades",
            message: `¿Calcular distribución de utilidades para el período ${period.year}? Se generará el preview para revisión antes de confirmar.`,
            onConfirm: () => openCalculatePreview(period),
            variant: "primary"
        })
    }, [openCalculatePreview])

    const handleApprove = useCallback((period) => {
        setConfirmDialog({
            open: true,
            title: "Aprobar Período",
            message: `¿Aprobar el período de utilidades ${period.year}? Esta acción no se puede deshacer.`,
            onConfirm: () => dispatch(HandleUtilidades({ type: "PERIODS_APPROVE", id: period._id })),
            variant: "success"
        })
    }, [dispatch])

    const handlePayPeriod = useCallback((period) => {
        setConfirmDialog({
            open: true,
            title: "Pagar Utilidades",
            message: `¿Marcar como pagado el período ${period.year}? Se generarán los recibos correspondientes.`,
            onConfirm: () => dispatch(HandleUtilidades({ type: "PERIODS_PAY", id: period._id, data: { payment_date: new Date().toISOString().split("T")[0] } })),
            variant: "success"
        })
    }, [dispatch])

    const handleDeletePeriod = useCallback((period) => {
        setConfirmDialog({
            open: true,
            title: "Eliminar Período",
            message: `¿Eliminar el período ${period.year}? Esta acción es irreversible y solo es posible si el estado es "Abierto".`,
            onConfirm: () => dispatch(HandleUtilidades({ type: "PERIODS_DELETE", id: period._id })),
            variant: "danger"
        })
    }, [dispatch])

    const openPaymentDetail = useCallback((payment) => {
        setPaymentDetailModal({ open: true, payment })
    }, [])

    const handlePayPayment = useCallback((payment) => {
        setConfirmDialog({
            open: true,
            title: "Marcar como Pagado",
            message: `¿Marcar el pago de utilidades para ${payment.employee?.firstname} ${payment.employee?.lastname} como pagado?`,
            onConfirm: () => dispatch(HandleUtilidades({ type: "PAYMENTS_PAY", id: payment._id, data: { payment_date: new Date().toISOString().split("T")[0] } })),
            variant: "success"
        })
    }, [dispatch])

    const handleCalculationParamChange = useCallback((key, value) => {
        setCalculationParams(prev => ({ ...prev, [key]: value }))
    }, [])

    const handleRunCalculation = useCallback(async () => {
        if (!calculationParams.netProfitVes) return
        setConfirmDialog({
            open: true,
            title: "Ejecutar Cálculo",
            message: `¿Calcular distribución de utilidades para ${calculationParams.year} con utilidad neta de ${formatCurrency(calculationParams.netProfitVes)}?`,
            onConfirm: async () => {
                try {
                    // Simular cálculo sin persistir - usar endpoint de cálculo
                    const result = await dispatch(HandleUtilidades({
                        type: "PERIODS_CALCULATE_SIMULATE",
                        data: calculationParams
                    })).unwrap()
                    setCalculatePreviewModal({ open: true, period: { year: calculationParams.year }, preview: result.data })
                } catch (error) {
                    console.error("Error en simulación:", error)
                }
            },
            variant: "primary"
        })
    }, [calculationParams, dispatch, formatCurrency])

    // ─── Render Functions — Options ya definidas en scope principal (Bug Prevention #4) ───
    const renderPeriodsTab = useCallback(() => {
        const periodOptions = useMemo(() => [
            { value: "select", label: "Seleccionar período..." },
            ...(utilidadesPeriods.data?.map(p => ({ value: p._id, label: `${p.year} (${p.status})` })) || [])
        ], [utilidadesPeriods.data])

        return (
            <div className="w-full h-full flex flex-col p-4 gap-4 overflow-auto">
                {/* Header con stats rápidas */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Períodos de Utilidades</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Gestión de períodos anuales de reparto de utilidades (15% LOTTT Art. 146-154)</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {hasPermission("payroll", "create") && (
                            <button
                                onClick={() => openPeriodForm()}
                                className="px-4 py-2 rounded-xl text-sm font-medium text-white flex items-center gap-2 transition-colors"
                                style={{ background: "#003DA5" }}
                            >
                                <Plus className="w-4 h-4" /> Nuevo Período
                            </button>
                        )}
                    </div>
                </div>

                {/* Filtros */}
                <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl border transition-colors"
                    style={{
                        background: isDark ? "rgba(0,61,165,0.05)" : "rgba(0,61,165,0.03)",
                        borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)"
                    }}>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                            Año
                        </label>
                        <input
                            type="number"
                            value={periodFilters.year}
                            onChange={(e) => handlePeriodFilterChange("year", e.target.value)}
                            placeholder="Ej: 2024"
                            className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200
                                bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                                focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
                                dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                dark:placeholder-[rgba(255,255,255,0.25)] dark:focus:border-[rgba(0,61,165,0.5)]`}
                        />
                    </div>
                    <div className="flex-1 min-w-[180px]">
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                            Estado
                        </label>
                        <CustomSelect
                            value={periodFilters.status}
                            onValueChange={(val) => handlePeriodFilterChange("status", val)}
                            options={PERIOD_STATUS_OPTIONS}
                            placeholder="Todos los estados"
                            accentColor="blue"
                        />
                    </div>
                    <div className="flex-1 min-w-[250px]">
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                            Buscar
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder="Buscar por año, estado..."
                                className={`w-full rounded-xl px-10 py-2.5 text-sm outline-none transition-all duration-200
                                    bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                                    focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
                                    dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                    dark:placeholder-[rgba(255,255,255,0.25)] dark:focus:border-[rgba(0,61,165,0.5)]`}
                            />
                        </div>
                    </div>
                </div>

                {/* Lista de Períodos */}
                <ThemedListWrapper accent="blue">
                    <ThemedHeadingBar
                        table_layout="sm:grid-cols-7"
                        table_headings={["Año", "Estado", "Utilidad Neta", "Distribuible", "Empleados", "Fecha Cálculo", "Acciones"]}
                        accent="blue"
                    />
                    <ThemedListContainer accent="blue">
                        {utilidadesPeriods.isLoading ? (
                            <div className="flex items-center justify-center h-32">
                                <Loading />
                            </div>
                        ) : utilidadesPeriods.data?.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-32 gap-2 text-gray-500 dark:text-gray-400">
                                <CalendarIcon className="w-10 h-10 opacity-50" />
                                <p>No hay períodos de utilidades registrados</p>
                                {hasPermission("payroll", "create") && (
                                    <button onClick={() => openPeriodForm()} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                                        Crear el primero
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                {utilidadesPeriods.data?.map((period, index) => {
                                    const statusConfig = getPeriodStatusConfig(period.status)
                                    const StatusIcon = statusConfig.icon
                                    const canCalculate = period.status === "OPEN" && hasPermission("payroll", "calculate")
                                    const canApprove = period.status === "CALCULATED" && hasPermission("payroll", "approve")
                                    const canPay = (period.status === "APPROVED" || period.status === "CALCULATED") && hasPermission("payroll", "pay")
                                    const canDelete = period.status === "OPEN" && hasPermission("payroll", "delete")

                                    return (
                                        <div
                                            key={period._id ?? index}
                                            className="grid min-[250px]:grid-cols-2 sm:grid-cols-7 gap-2 px-3 py-3 items-center
                                                border-b last:border-b-0 transition-colors duration-150
                                                border-[#dde5ff] dark:border-[rgba(255,255,255,0.08)]
                                                hover:bg-[#e0f2fe] dark:hover:bg-[rgba(0,61,165,0.08)]"
                                        >
                                            {/* Año */}
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold"
                                                    style={{
                                                        background: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.1)",
                                                        color: "#003DA5"
                                                    }}>
                                                    <CalendarIcon className="w-4 h-4" />
                                                </div>
                                                <p className="text-sm font-semibold truncate text-gray-900 dark:text-white">
                                                    {period.year}
                                                </p>
                                            </div>

                                            {/* Estado */}
                                            <div className="min-[250px]:hidden sm:flex sm:justify-center">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig.bg}`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {statusConfig.label}
                                                </span>
                                            </div>

                                            {/* Utilidad Neta */}
                                            <div className="min-[250px]:hidden sm:flex sm:justify-center">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {formatCurrency(period.net_profit_ves)}
                                                </p>
                                            </div>

                                            {/* Distribuible */}
                                            <div className="min-[250px]:hidden sm:flex sm:justify-center">
                                                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                                                    {formatCurrency(period.distributable_amount_ves)}
                                                </p>
                                            </div>

                                            {/* Empleados */}
                                            <div className="min-[250px]:hidden sm:flex sm:justify-center">
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {period.total_employees_eligible || 0}
                                                </p>
                                            </div>

                                            {/* Fecha Cálculo */}
                                            <div className="min-[250px]:hidden sm:flex sm:justify-center">
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {period.calculation_date ? formatDate(period.calculation_date) : "—"}
                                                </p>
                                            </div>

                                            {/* Acciones */}
                                            <div className="flex justify-center items-center gap-1.5">
                                                <button
                                                    onClick={() => openPeriodDetail(period)}
                                                    className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-blue-600 dark:text-blue-400"
                                                    title="Ver detalle"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {canCalculate && (
                                                    <button
                                                        onClick={() => handleCalculate(period)}
                                                        className="p-2 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-colors text-cyan-600 dark:text-cyan-400"
                                                        title="Calcular"
                                                    >
                                                        <Calculator className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {canApprove && (
                                                    <button
                                                        onClick={() => handleApprove(period)}
                                                        className="p-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors text-emerald-600 dark:text-emerald-400"
                                                        title="Aprobar"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {canPay && (
                                                    <button
                                                        onClick={() => handlePayPeriod(period)}
                                                        className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-blue-600 dark:text-blue-400"
                                                        title="Pagar"
                                                    >
                                                        <DollarSign className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button
                                                        onClick={() => handleDeletePeriod(period)}
                                                        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-red-600 dark:text-red-400"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </>
                        )}
                    </ThemedListContainer>
                </ThemedListWrapper>

                {/* Paginación */}
                {utilidadesPeriods.pagination?.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        <button
                            onClick={() => dispatch(HandleUtilidades({ type: "PERIODS_GETALL", ...buildPeriodParams(), page: utilidadesPeriods.pagination.page - 1 }))}
                            disabled={utilidadesPeriods.pagination.page <= 1}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#f3f4f6", color: isDark ? "#fff" : "#374151" }}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Página {utilidadesPeriods.pagination.page} de {utilidadesPeriods.pagination.totalPages}
                        </span>
                        <button
                            onClick={() => dispatch(HandleUtilidades({ type: "PERIODS_GETALL", ...buildPeriodParams(), page: utilidadesPeriods.pagination.page + 1 }))}
                            disabled={utilidadesPeriods.pagination.page >= utilidadesPeriods.pagination.totalPages}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#f3f4f6", color: isDark ? "#fff" : "#374151" }}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        )
    }, [
        isDark,
        utilidadesPeriods,
        periodFilters,
        searchTerm,
        hasPermission,
        formatCurrency,
        formatDate,
        getPeriodStatusConfig,
        handlePeriodFilterChange,
        handleSearchChange,
        openPeriodDetail,
        handleCalculate,
        handleApprove,
        handlePayPeriod,
        handleDeletePeriod,
        openPeriodForm,
        dispatch,
        buildPeriodParams
    ])

    const renderPaymentsTab = useCallback(() => {
        const periodOptions = useMemo(() => [
            { value: "select", label: "Seleccionar período..." },
            ...(utilidadesPeriods.data?.map(p => ({ value: p._id, label: `${p.year} (${p.status})` })) || [])
        ], [utilidadesPeriods.data])

        return (
            <div className="w-full h-full flex flex-col p-4 gap-4 overflow-auto">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pagos de Utilidades</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Detalle de pagos individuales por empleado y período</p>
                    </div>
                </div>

                {/* Filtros */}
                <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl border transition-colors"
                    style={{
                        background: isDark ? "rgba(0,61,165,0.05)" : "rgba(0,61,165,0.03)",
                        borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)"
                    }}>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                            Período <span className="text-red-500">*</span>
                        </label>
                        <CustomSelect
                            value={paymentFilters.period}
                            onValueChange={(val) => handlePaymentFilterChange("period", val)}
                            options={periodOptions}
                            placeholder="Seleccionar período..."
                            accentColor="blue"
                        />
                    </div>
                    <div className="flex-1 min-w-[180px]">
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                            Estado
                        </label>
                        <CustomSelect
                            value={paymentFilters.status}
                            onValueChange={(val) => handlePaymentFilterChange("status", val)}
                            options={PAYMENT_STATUS_OPTIONS}
                            placeholder="Todos los estados"
                            accentColor="blue"
                        />
                    </div>
                    <div className="flex-1 min-w-[250px]">
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                            Buscar
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder="Buscar por empleado, monto..."
                                className={`w-full rounded-xl px-10 py-2.5 text-sm outline-none transition-all duration-200
                                    bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                                    focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
                                    dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                    dark:placeholder-[rgba(255,255,255,0.25)] dark:focus:border-[rgba(0,61,165,0.5)]`}
                            />
                        </div>
                    </div>
                </div>

                {paymentFilters.period === "select" && (
                    <div className="flex flex-col items-center justify-center h-32 gap-2 text-gray-500 dark:text-gray-400">
                        <CreditCard className="w-10 h-10 opacity-50" />
                        <p>Seleccione un período para ver los pagos</p>
                    </div>
                )}

                {paymentFilters.period !== "select" && (
                    <ThemedListWrapper accent="blue">
                        <ThemedHeadingBar
                            table_layout="sm:grid-cols-7"
                            table_headings={["Empleado", "Días Trab.", "Salario Prom.", "Bruto", "ISLR", "Neto", "Estado", "Acciones"]}
                            accent="blue"
                        />
                        <ThemedListContainer accent="blue">
                            {utilidadesPayments.isLoading ? (
                                <div className="flex items-center justify-center h-32">
                                    <Loading />
                                </div>
                            ) : utilidadesPayments.data?.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-32 gap-2 text-gray-500 dark:text-gray-400">
                                    <CreditCard className="w-10 h-10 opacity-50" />
                                    <p>No hay pagos registrados para este período</p>
                                </div>
                            ) : (
                                <>
                                    {utilidadesPayments.data?.map((payment, index) => {
                                        const statusConfig = getPaymentStatusConfig(payment.status)
                                        const StatusIcon = statusConfig.icon
                                        const canPay = payment.status === "PENDING" && hasPermission("payroll", "pay")

                                        return (
                                            <div
                                                key={payment._id ?? index}
                                                className="grid min-[250px]:grid-cols-2 sm:grid-cols-8 gap-2 px-3 py-3 items-center
                                                    border-b last:border-b-0 transition-colors duration-150
                                                    border-[#dde5ff] dark:border-[rgba(255,255,255,0.08)]
                                                    hover:bg-[#e0f2fe] dark:hover:bg-[rgba(0,61,165,0.08)]"
                                            >
                                                {/* Empleado */}
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                                                        style={{
                                                            background: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.1)",
                                                            color: "#003DA5"
                                                        }}>
                                                        {payment.employee?.firstname?.slice(0, 1).toUpperCase()}{payment.employee?.lastname?.slice(0, 1).toUpperCase()}
                                                    </div>
                                                    <p className="text-sm font-semibold truncate text-gray-900 dark:text-white">
                                                        {payment.employee?.firstname} {payment.employee?.lastname}
                                                    </p>
                                                </div>

                                                {/* Días Trabajados */}
                                                <div className="min-[250px]:hidden sm:flex sm:justify-center">
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {payment.days_worked || 0}
                                                    </p>
                                                </div>

                                                {/* Salario Promedio */}
                                                <div className="min-[250px]:hidden sm:flex sm:justify-center">
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {formatCurrency(payment.daily_rate_ves)}
                                                    </p>
                                                </div>

                                                {/* Bruto */}
                                                <div className="min-[250px]:hidden sm:flex sm:justify-center">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {formatCurrency(payment.gross_amount_ves)}
                                                    </p>
                                                </div>

                                                {/* ISLR */}
                                                <div className="min-[250px]:hidden sm:flex sm:justify-center">
                                                    <p className="text-sm text-red-600 dark:text-red-400">
                                                        {formatCurrency(payment.islr_retention_ves)}
                                                    </p>
                                                </div>

                                                {/* Neto */}
                                                <div className="min-[250px]:hidden sm:flex sm:justify-center">
                                                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                                                        {formatCurrency(payment.net_amount_ves)}
                                                    </p>
                                                </div>

                                                {/* Estado */}
                                                <div className="min-[250px]:hidden sm:flex sm:justify-center">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig.bg}`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {statusConfig.label}
                                                    </span>
                                                </div>

                                                {/* Acciones */}
                                                <div className="flex justify-center items-center gap-1.5">
                                                    <button
                                                        onClick={() => openPaymentDetail(payment)}
                                                        className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-blue-600 dark:text-blue-400"
                                                        title="Ver detalle"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    {canPay && (
                                                        <button
                                                            onClick={() => handlePayPayment(payment)}
                                                            className="p-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors text-emerald-600 dark:text-emerald-400"
                                                            title="Marcar como pagado"
                                                        >
                                                            <DollarSign className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </>
                            )}
                        </ThemedListContainer>
                    </ThemedListWrapper>
                )}
            </div>
        )
    }, [
        isDark,
        utilidadesPeriods.data,
        utilidadesPayments,
        paymentFilters,
        searchTerm,
        hasPermission,
        formatCurrency,
        getPaymentStatusConfig,
        handlePaymentFilterChange,
        handleSearchChange,
        openPaymentDetail,
        handlePayPayment
    ])

    const renderCalculationTab = useCallback(() => {
        return (
            <div className="w-full h-full flex flex-col p-4 gap-4 overflow-auto">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Simulador de Cálculo de Utilidades</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Preview de distribución del 15% de utilidades netas según LOTTT Art. 146-154</p>
                    </div>
                </div>

                {/* Formulario de Parámetros */}
                <div className="flex flex-wrap items-end gap-4 p-4 rounded-xl border transition-colors"
                    style={{
                        background: isDark ? "rgba(0,61,165,0.05)" : "rgba(0,61,165,0.03)",
                        borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)"
                    }}>
                    <div className="flex-1 min-w-[150px]">
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                            Año
                        </label>
                        <input
                            type="number"
                            value={calculationParams.year}
                            onChange={(e) => handleCalculationParamChange("year", parseInt(e.target.value) || new Date().getFullYear())}
                            min="2020"
                            max={new Date().getFullYear() + 1}
                            className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200
                                bg-gray-50 border border-gray-200 text-gray-900
                                focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
                                dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                dark:focus:border-[rgba(0,61,165,0.5)]`}
                        />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                            Utilidad Neta (VES) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={calculationParams.netProfitVes}
                            onChange={(e) => handleCalculationParamChange("netProfitVes", e.target.value)}
                            placeholder="Ej: 1000000"
                            className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200
                                bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                                focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
                                dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                dark:placeholder-[rgba(255,255,255,0.25)] dark:focus:border-[rgba(0,61,165,0.5)]`}
                        />
                    </div>
                    <div className="flex-1 min-w-[250px]">
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                            Método de Distribución
                        </label>
                        <CustomSelect
                            value={calculationParams.distributionMethod}
                            onValueChange={(val) => handleCalculationParamChange("distributionMethod", val)}
                            options={DISTRIBUTION_METHOD_OPTIONS}
                            placeholder="Seleccionar método"
                            accentColor="blue"
                        />
                    </div>
                    <div className="flex items-end gap-2">
                        <button
                            onClick={handleRunCalculation}
                            disabled={!calculationParams.netProfitVes || parseFloat(calculationParams.netProfitVes) <= 0}
                            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ background: "#003DA5" }}
                        >
                            <Calculator className="w-4 h-4" />
                            Calcular Preview
                        </button>
                    </div>
                </div>

                {/* Info del método seleccionado */}
                <div className="p-4 rounded-xl border transition-colors"
                    style={{
                        background: isDark ? "rgba(0,61,165,0.08)" : "rgba(0,61,165,0.05)",
                        borderColor: isDark ? "rgba(0,61,165,0.2)" : "rgba(0,61,165,0.15)"
                    }}>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4" style={{ color: "#003DA5" }} />
                        Método de Distribución: {DISTRIBUTION_METHOD_OPTIONS.find(m => m.value === calculationParams.distributionMethod)?.label}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="p-3 rounded-lg" style={{ background: isDark ? "rgba(16,185,129,0.1)" : "#f0fdf4" }}>
                            <p className="text-xs text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">50% por Días</p>
                            <p className="font-semibold text-emerald-900 dark:text-emerald-300">
                                {calculationParams.distributionMethod === "DAYS_ONLY" ? "100%" : calculationParams.distributionMethod === "SALARY_ONLY" ? "0%" : "50%"}
                            </p>
                        </div>
                        <div className="p-3 rounded-lg" style={{ background: isDark ? "rgba(6,182,212,0.1)" : "#ecfeff" }}>
                            <p className="text-xs text-cyan-700 dark:text-cyan-400 uppercase tracking-wider">50% por Salario</p>
                            <p className="font-semibold text-cyan-900 dark:text-cyan-300">
                                {calculationParams.distributionMethod === "SALARY_ONLY" ? "100%" : calculationParams.distributionMethod === "DAYS_ONLY" ? "0%" : "50%"}
                            </p>
                        </div>
                        <div className="p-3 rounded-lg" style={{ background: isDark ? "rgba(245,158,11,0.1)" : "#fef3c7" }}>
                            <p className="text-xs text-yellow-700 dark:text-yellow-400 uppercase tracking-wider">Base Legal</p>
                            <p className="font-semibold text-yellow-900 dark:text-yellow-300">LOTTT Art. 146-154</p>
                        </div>
                    </div>
                </div>

                {/* Placeholder para resultados */}
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                        <Calculator className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="text-lg">Ingrese los parámetros y presione "Calcular Preview"</p>
                        <p className="text-sm mt-1">El resultado mostrará la distribución estimada por empleado con retención ISLR</p>
                    </div>
                </div>
            </div>
        )
    }, [isDark, calculationParams, handleCalculationParamChange, handleRunCalculation])

    // ─── Render Principal ───
    return (
        <div className="w-full h-full flex flex-col bg-white dark:bg-[#0f0f1a]">
            {/* Sub-tab Bar */}
            <div className="flex flex-wrap gap-1 px-4 py-3 border-b transition-colors duration-300"
                style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                {SUB_TABS.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveSubTab(id)}
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
                    </button>
                ))}
            </div>

            {/* Sub-tab Content */}
            <div className="flex-1 min-h-0 overflow-hidden">
                {activeSubTab === "periods" && renderPeriodsTab()}
                {activeSubTab === "payments" && renderPaymentsTab()}
                {activeSubTab === "calculation" && renderCalculationTab()}
            </div>

            {/* Modales - Se implementarán en Fases 2-5 */}
            {periodDetailModal.open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setPeriodDetailModal({ open: false, period: null })}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                            <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            <p>PeriodDetailModal - Se implementa en Fase 2</p>
                        </div>
                    </div>
                </div>
            )}

            {periodFormModal.open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setPeriodFormModal({ open: false, editing: null })}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full animate-slide-up" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                            <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            <p>PeriodFormModal - Se implementa en Fase 2</p>
                        </div>
                    </div>
                </div>
            )}

            {calculatePreviewModal.open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setCalculatePreviewModal({ open: false, period: null, preview: null })}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                            <Calculator className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            <p>CalculatePreviewModal - Se implementa en Fase 3/5</p>
                        </div>
                    </div>
                </div>
            )}

            {paymentDetailModal.open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setPaymentDetailModal({ open: false, payment: null })}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                            <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            <p>PaymentDetailModal - Se implementa en Fase 4</p>
                        </div>
                    </div>
                </div>
            )}

            {confirmDialog.open && (
                <ConfirmDialog
                    open={confirmDialog.open}
                    onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
                    title={confirmDialog.title}
                    message={confirmDialog.message}
                    onConfirm={confirmDialog.onConfirm}
                    variant={confirmDialog.variant}
                />
            )}
        </div>
    )
}

export default PayrollUtilitiesTab