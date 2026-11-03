import { useEffect, useState, useCallback, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useSearchParams } from "react-router-dom"
import { HandlePayrollReceipts } from "../../../../../redux/Thunks/PayrollThunk.js"
import { useIsDark } from "../../../../../hooks/useIsDark.js"
import { useHRAuth } from "../../../../../hooks/useHRAuth.js"
import { CustomSelect } from "../../../../../components/ui/custom-select.jsx"
import { ThemedListWrapper, ThemedHeadingBar, ThemedListContainer } from "../../../../../components/common/Dashboard/ListDesigns"
import { ConfirmDialog } from "../../../../../components/common/ConfirmDialog.jsx"
import { Search, Filter, Calendar, FileText, ChevronDown, Eye, Download, RefreshCw, XCircle, Loader2, FileJson, FileSpreadsheet } from "lucide-react"

// --- ReceiptDetailModal Component ---
const ReceiptDetailModal = ({ receipt, onClose, isDark, onExportJson, onExportCsv }) => {
    // Helpers inside modal (since they're no longer global)
    const formatCurrency = (val) => {
        if (val === undefined || val === null) return '—'
        return `$ ${val.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return '—'
        return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    const statusConfig = {
        PAID: { bg: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Pagado' },
        APPROVED: { bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400', label: 'Aprobado' },
        CALCULATED: { bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', label: 'Calculado' },
        VOIDED: { bg: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', label: 'Anulado' },
        DRAFT: { bg: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400', label: 'Borrador' },
    }

    const typeConfig = {
        NORMAL: { bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', label: 'Nómina Normal' },
        VACATION: { bg: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', label: 'Vacaciones' },
        UTILIDADES: { bg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Utilidades' },
        SOCIAL_BENEFITS: { bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400', label: 'Prestaciones Sociales' },
        SETTLEMENT: { bg: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', label: 'Liquidación' },
    }

    const s = statusConfig[receipt.status] || statusConfig.DRAFT
    const t = typeConfig[receipt.tipo_recibo] || typeConfig.NORMAL

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b transition-colors duration-300"
                    style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.1)" }}>
                            <FileText className="w-5 h-5" style={{ color: "#003DA5" }} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Detalle del Recibo</h2>
                            <p className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                {receipt.employee?.firstname} {receipt.employee?.lastname} • {receipt.period?.name}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg}`}>
                            {s.label}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${t.bg}`}>
                            {t.label}
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
                            <p className="text-sm text-gray-500 dark:text-gray-400">Período</p>
                            <p className="font-medium text-gray-900 dark:text-white">{receipt.period?.name || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Fecha Pago</p>
                            <p className="font-medium text-gray-900 dark:text-white">{receipt.payment_date ? formatDate(receipt.payment_date) : 'Pendiente'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Empleado</p>
                            <p className="font-medium text-gray-900 dark:text-white">{receipt.employee?.firstname} {receipt.employee?.lastname}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Departamento</p>
                            <p className="font-medium text-gray-900 dark:text-white">{receipt.employee?.department?.name || '—'}</p>
                        </div>
                    </div>

                    {/* Conceptos Table */}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5" style={{ color: "#003DA5" }} />
                        Conceptos del Recibo
                    </h3>
                    <div className="overflow-x-auto mb-6">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b transition-colors duration-300"
                                    style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider"
                                        style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>Concepto</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider"
                                        style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>Tipo</th>
                                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider"
                                        style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>Cantidad</th>
                                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider"
                                        style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>Monto (VES)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {receipt.lines?.map((line, idx) => (
                                    <tr key={idx} className="border-b transition-colors duration-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                        style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.1)" }}>
                                    <td className="px-3 py-2 text-gray-900 dark:text-white">{line.concept_name}</td>
                                    <td className="px-3 py-2 text-center">
                                        <span className={`inline-flex px-2 py-0.5 rounded text-xs ${
                                            line.kind === 'INCOME' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>
                                            {line.kind === 'INCOME' ? 'Ingreso' : 'Deducción'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-right text-gray-500 dark:text-gray-400">{line.quantity}</td>
                                    <td className="px-3 py-2 text-right font-medium text-gray-900 dark:text-white">${(line.amount_ves || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</td>
                                </tr>
                                ))}
                                {(!receipt.lines || receipt.lines.length === 0) && (
                                    <tr>
                                        <td colSpan={4} className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">No hay conceptos registrados</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Totales */}
                    <div className="grid grid-cols-3 gap-4 p-4 rounded-xl transition-colors duration-300"
                        style={{ 
                            background: isDark ? "rgba(255,255,255,0.04)" : "#f9fafb",
                            border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.05)"
                        }}>
                        <div className="text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Ingresos</p>
                            <p className="font-bold text-lg text-green-600 dark:text-green-400">{formatCurrency(receipt.total_income_ves)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Deducciones</p>
                            <p className="font-bold text-lg text-red-600 dark:text-red-400">{formatCurrency(receipt.total_deductions_ves)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Neto a Pagar</p>
                            <p className="font-bold text-xl text-gray-900 dark:text-white">{formatCurrency(receipt.net_pay_ves)}</p>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-2 pt-4 border-t mt-6"
                        style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                        <button 
                            onClick={onExportJson} 
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                            style={{
                                background: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.1)",
                                color: "#003DA5",
                                border: isDark ? "1px solid rgba(0,61,165,0.3)" : "1px solid rgba(0,61,165,0.2)"
                            }}
                            title="Exportar JSON"
                        >
                            <FileJson className="w-4 h-4" />
                            JSON
                        </button>
                        <button 
                            onClick={onExportCsv} 
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                            style={{
                                background: isDark ? "rgba(34,197,94,0.15)" : "rgba(34,197,94,0.1)",
                                color: "#22c55e",
                                border: isDark ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(34,197,94,0.2)"
                            }}
                            title="Exportar CSV"
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            CSV
                        </button>
                        <button onClick={onClose} className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export const PayrollReceiptsTab = () => {
    const isDark = useIsDark()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { data: receipts, isLoading, error, pagination } = useSelector((state) => state.payrollReducer.receipts)
    const { data: periods } = useSelector((state) => state.payrollReducer.periods)
    const { can, isReady } = useHRAuth()

    const [statusFilter, setStatusFilter] = useState("all")
    const [searchTerm, setSearchTerm] = useState("")
    const [employeeFilter, setEmployeeFilter] = useState("")
    const [periodFilter, setPeriodFilter] = useState("")
    const [typeFilter, setTypeFilter] = useState("all")
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedReceipt, setSelectedReceipt] = useState(null)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const [voidConfirm, setVoidConfirm] = useState(null)
    const [recalculateConfirm, setRecalculateConfirm] = useState(null)

    // --- Helper Functions (inside component) ---
    const formatCurrency = (val) => {
        if (val === undefined || val === null) return '—'
        return `$ ${val.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return '—'
        return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    // Export function with useCallback (inside component where dispatch is available)
    const handleExport = useCallback(async (receiptId, format = 'json') => {
        try {
            const result = await dispatch(HandlePayrollReceipts({ 
                type: "EXPORT", 
                id: receiptId, 
                format 
            })).unwrap()
            
            if (result.success && result.data) {
                const dataStr = format === 'csv' 
                    ? convertToCSV(result.data)
                    : JSON.stringify(result.data, null, 2)
                const mimeType = format === 'csv' ? 'text/csv' : 'application/json'
                const extension = format === 'csv' ? 'csv' : 'json'
                
                const blob = new Blob([dataStr], { type: mimeType })
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `recibo-${receiptId}.${extension}`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                window.URL.revokeObjectURL(url)
            } else {
                throw new Error(result.message || 'Error en la exportación')
            }
        } catch (error) {
            console.error('Export error:', error)
            alert(`Error al exportar: ${error.message || 'Error desconocido'}`)
        }
    }, [dispatch])

    // Helper to convert receipt data to CSV (inside component where formatDate is available)
    const convertToCSV = (data) => {
        const lines = []
        lines.push(['Campo', 'Valor'])
        lines.push(['Período', data.period?.name || 'N/A'])
        lines.push(['Empleado', `${data.employee?.firstname || ''} ${data.employee?.lastname || ''}`.trim()])
        lines.push(['Departamento', data.employee?.department?.name || '—'])
        lines.push(['Estado', data.status])
        lines.push(['Tipo Recibo', data.tipo_recibo || 'NORMAL'])
        lines.push(['Fecha Pago', data.payment_date ? formatDate(data.payment_date) : 'Pendiente'])
        lines.push(['Total Ingresos (VES)', data.total_income_ves || 0])
        lines.push(['Total Deducciones (VES)', data.total_deductions_ves || 0])
        lines.push(['Neto a Pagar (VES)', data.net_pay_ves || 0])
        lines.push([])
        lines.push(['Conceptos'])
        lines.push(['Concepto', 'Tipo', 'Cantidad', 'Monto (VES)'])
        
        data.lines?.forEach(line => {
            lines.push([
                line.concept_name,
                line.kind === 'INCOME' ? 'Ingreso' : 'Deducción',
                line.quantity,
                line.amount_ves || 0
            ])
        })
        
        return lines.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
    }

    // Memoized period options for CustomSelect
    const periodOptions = useMemo(() => [
        { value: "all", label: "Todos los períodos" },
        ...(periods?.map(p => ({ value: p._id, label: p.name })) || [])
    ], [periods])

    // Receipt type options
    const typeOptions = useMemo(() => [
        { value: "all", label: "Todos los tipos" },
        { value: "NORMAL", label: "Nómina Normal" },
        { value: "VACATION", label: "Vacaciones" },
        { value: "UTILIDADES", label: "Utilidades" },
        { value: "SOCIAL_BENEFITS", label: "Prestaciones Sociales" },
        { value: "SETTLEMENT", label: "Liquidación" },
    ], [])

    const statusOptions = useMemo(() => [
        { value: "all", label: "Todos los estados" },
        { value: "DRAFT", label: "Borrador" },
        { value: "CALCULATED", label: "Calculado" },
        { value: "APPROVED", label: "Aprobado" },
        { value: "PAID", label: "Pagado" },
        { value: "VOIDED", label: "Anulado" },
    ], [])

    useEffect(() => {
        const params = { 
            page: currentPage, 
            status: statusFilter !== "all" ? statusFilter : undefined,
            period: periodFilter !== "all" ? periodFilter : undefined,
            employee: employeeFilter || undefined,
            search: searchTerm || undefined,
            tipo_recibo: typeFilter !== "all" ? typeFilter : undefined
        }
        dispatch(HandlePayrollReceipts({ type: "GETALL", ...params }))
    }, [dispatch, currentPage, statusFilter, periodFilter, employeeFilter, searchTerm, typeFilter])

    const handleViewDetail = useCallback((receipt) => {
        setSelectedReceipt(receipt)
        setShowDetailModal(true)
    }, [])

    const handleVoid = useCallback(async (id) => {
        await dispatch(HandlePayrollReceipts({ type: "VOID", id }))
        setVoidConfirm(null)
    }, [dispatch])

    const handleRecalculate = useCallback(async (id) => {
        await dispatch(HandlePayrollReceipts({ type: "RECALCULATE", id }))
        setRecalculateConfirm(null)
    }, [dispatch])

    const handleDelete = useCallback(async (id) => {
        // Note: No DELETE endpoint for receipts, using VOID instead
        await dispatch(HandlePayrollReceipts({ type: "VOID", id, reason: "Eliminado desde UI" }))
        setDeleteConfirm(null)
    }, [dispatch])

    if (error) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8">
                <div className="text-center text-red-500">
                    <p className="font-bold">Error cargando recibos</p>
                    <p className="text-sm text-gray-500">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full h-full flex flex-col">
            {/* Header con filtros */}
            <div className="p-4 border-b transition-colors duration-300"
                style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
                    {/* Search */}
                    <div className="flex-1 max-w-md lg:max-w-none">
                        <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block"
                            style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                            <Search className="w-3 h-3 inline mr-1" />
                            Buscar
                        </label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar recibos..."
                            className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-200
                                bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                                focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
                                dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                dark:placeholder-[rgba(255,255,255,0.25)] dark:focus:border-[rgba(0,61,165,0.5)]`} />
                    </div>

                    {/* Filters Row */}
                    <div className="flex flex-wrap gap-3 items-end w-full lg:w-auto">
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
                                placeholder="Filtrar estado"
                                accentColor="blue"
                                searchPlaceholder="Buscar estado..."
                            />
                        </div>

                        {/* Type Filter */}
                        <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
                            <label className="text-xs font-semibold uppercase tracking-wider"
                                style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                <FileText className="w-3 h-3 inline mr-1" />
                                Tipo Recibo
                            </label>
                            <CustomSelect
                                value={typeFilter}
                                onValueChange={(val) => { setTypeFilter(val); setCurrentPage(1); }}
                                options={typeOptions}
                                placeholder="Filtrar tipo"
                                accentColor="blue"
                                searchPlaceholder="Buscar tipo..."
                            />
                        </div>

                        {/* Period Filter */}
                        <div className="flex flex-col gap-1.5 flex-1 min-w-[180px]">
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

                        {/* Employee Filter */}
                        <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
                            <label className="text-xs font-semibold uppercase tracking-wider"
                                style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                <Search className="w-3 h-3 inline mr-1" />
                                Empleado
                            </label>
                            <input
                                type="text"
                                placeholder="Filtrar por empleado..."
                                value={employeeFilter}
                                onChange={(e) => setEmployeeFilter(e.target.value)}
                                className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-200
                                    bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                                    focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
                                    dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                    dark:placeholder-[rgba(255,255,255,0.25)] dark:focus:border-[rgba(0,61,165,0.5)]`} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 min-h-0 flex flex-col">
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                            <p className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                Cargando recibos...
                            </p>
                        </div>
                    </div>
                ) : !receipts || receipts.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center transition-colors duration-300"
                            style={{ background: isDark ? "rgba(0,61,165,0.1)" : "rgba(0,61,165,0.1)" }}>
                            <FileText className="w-8 h-8 transition-colors duration-300"
                                style={{ color: "#003DA5" }} />
                        </div>
                        <div className="text-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sin recibos</h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                {searchTerm || statusFilter !== "all" || typeFilter !== "all" || periodFilter !== "all" || employeeFilter
                                    ? "No se encontraron recibos con los filtros actuales"
                                    : "No hay recibos de nómina registrados"}
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <ThemedListWrapper accent="blue">
                            <ThemedHeadingBar 
                                accent="blue" 
                                table_layout="grid-cols-2 sm:grid-cols-9" 
                                table_headings={["Empleado", "Período", "Tipo", "Ingresos", "Deducciones", "Neto", "Estado", "Fecha Pago", "Acciones"]}
                                hiddenCols={["Período", "Tipo", "Deducciones", "Fecha Pago"]}
                            />
                        </ThemedListWrapper>
                        <ThemedListContainer accent="blue">
                            {receipts.map((receipt, index) => (
                                <div
                                    key={receipt._id ?? index}
                                    className="grid grid-cols-2 sm:grid-cols-9 gap-2 px-3 py-3 items-center
                                        border-b last:border-b-0 transition-colors duration-150
                                        border-gray-100 hover:bg-blue-50/50 hover:-translate-y-0.5
                                        dark:border-[rgba(255,255,255,0.08)] dark:hover:bg-[rgba(0,61,165,0.04)]"
                                >
                                    {/* Empleado */}
                                    <div className="min-w-0 col-span-2 sm:col-span-1">
                                        <p className="text-sm font-semibold truncate text-gray-900 dark:text-white"
                                            title={`${receipt.employee?.firstname} ${receipt.employee?.lastname}`}>
                                            {receipt.employee?.firstname} {receipt.employee?.lastname}
                                        </p>
                                        <p className="text-xs truncate mt-0.5"
                                            style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }}>
                                            {receipt.employee?.department?.name || '—'}
                                        </p>
                                    </div>

                                    {/* Período */}
                                    <div className="hidden sm:block sm:col-span-1 min-w-0">
                                        <p className="text-sm font-medium truncate text-gray-900 dark:text-white"
                                            title={receipt.period?.name}>
                                            {receipt.period?.name || 'N/A'}
                                        </p>
                                        <p className="text-xs truncate mt-0.5"
                                            style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#6b7280" }}>
                                            {receipt.period?.start_date && receipt.period?.end_date 
                                                ? `${new Date(receipt.period.start_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} - ${new Date(receipt.period.end_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}`
                                                : '—'}
                                        </p>
                                    </div>

                                    {/* Tipo */}
                                    <div className="hidden sm:block sm:col-span-1">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors duration-300"
                                            style={{ 
                                                background: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.1)",
                                                color: "#003DA5",
                                                border: isDark ? "1px solid rgba(0,61,165,0.3)" : "1px solid rgba(0,61,165,0.2)"
                                            }}>
                                            {receipt.tipo_recibo || 'NORMAL'}
                                        </span>
                                    </div>

                                    {/* Ingresos */}
                                    <div className="hidden sm:block sm:col-span-1 text-right">
                                        <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                            {receipt.total_income_ves !== undefined 
                                                ? `$ ${(receipt.total_income_ves).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                                                : '—'}
                                        </p>
                                    </div>

                                    {/* Deducciones */}
                                    <div className="hidden sm:block sm:col-span-1 text-right">
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            {receipt.total_deductions_ves !== undefined 
                                                ? `$ ${(receipt.total_deductions_ves).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                                                : '—'}
                                        </p>
                                    </div>

                                    {/* Neto */}
                                    <div className="col-span-2 sm:col-span-1 text-right sm:text-right">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                                            {receipt.net_pay_ves !== undefined 
                                                ? `$ ${(receipt.net_pay_ves).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                                                : '—'}
                                        </p>
                                    </div>

                                    {/* Estado */}
                                    <div className="hidden sm:block sm:col-span-1 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold transition-colors duration-300 ${
                                            receipt.status === 'PAID' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                            receipt.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                            receipt.status === 'CALCULATED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                            receipt.status === 'VOIDED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                        }`}>
                                            {receipt.status}
                                        </span>
                                    </div>

                                    {/* Fecha Pago */}
                                    <div className="hidden sm:block sm:col-span-1 text-center text-gray-500 dark:text-gray-400">
                                        <p className="text-sm">
                                            {receipt.payment_date ? formatDate(receipt.payment_date) : '—'}
                                        </p>
                                    </div>

                                    {/* Acciones */}
                                    <div className="flex items-center justify-center gap-1.5 col-span-2 sm:col-span-1">
                                        {/* Ver Detalle */}
                                        {can("payroll", "read") && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleViewDetail(receipt); }}
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

                                        {/* Exportar */}
                                        {can("payroll", "read") && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleExport(receipt._id, 'json'); }}
                                                className="p-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                                                style={{
                                                    background: isDark ? "rgba(34,197,94,0.1)" : "#dcfce7",
                                                    color: isDark ? "#86efac" : "#22c55e"
                                                }}
                                                title="Exportar JSON"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                        )}

                                        {/* Recalcular */}
                                        {isReady && can("payroll", "calculate") && 
                                         (receipt.status === "DRAFT" || receipt.status === "CALCULATED") && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setRecalculateConfirm(receipt._id); }}
                                                className="p-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                                                style={{
                                                    background: isDark ? "rgba(59,130,246,0.1)" : "#dbeafe",
                                                    color: isDark ? "#93c5fd" : "#3b82f6"
                                                }}
                                                title="Recalcular recibo"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                            </button>
                                        )}

                                        {/* Anular */}
                                        {isReady && can("payroll", "void") && 
                                         receipt.status !== "PAID" && receipt.status !== "VOIDED" && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setVoidConfirm(receipt._id); }}
                                                className="p-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                                                style={{
                                                    background: isDark ? "rgba(239,68,68,0.1)" : "#fee2e2",
                                                    color: isDark ? "#f87171" : "#dc2626"
                                                }}
                                                title="Anular recibo"
                                            >
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </ThemedListContainer>

                        {/* Paginación */}
                        {pagination && pagination.pages > 1 && (
                            <div className="flex items-center justify-center gap-2 px-4 py-4 border-t transition-colors duration-300"
                                style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Mostrando {((currentPage - 1) * 20) + 1} - {Math.min(currentPage * 20, pagination.total)} de {pagination.total} recibos
                                </div>
                                <div className="flex gap-2">
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
                                    <span className="px-3 text-sm font-medium"
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
                            </div>
                        )}
                    </>
                )}

            {/* Modals */}
            {showDetailModal && selectedReceipt && (
                <ReceiptDetailModal
                    receipt={selectedReceipt}
                    onClose={() => { setShowDetailModal(false); setSelectedReceipt(null); }}
                    isDark={isDark}
                    onExportJson={() => handleExport(selectedReceipt._id, 'json')}
                    onExportCsv={() => handleExport(selectedReceipt._id, 'csv')}
                />
            )}

            <ConfirmDialog
                open={!!voidConfirm}
                onClose={() => setVoidConfirm(null)}
                onConfirm={() => handleVoid(voidConfirm)}
                title="¿Anular recibo?"
                message="Esta acción marcará el recibo como ANULADO. Se registrará el motivo y no se podrá revertir."
                confirmText="Anular"
                variant="danger"
            />

            <ConfirmDialog
                open={!!recalculateConfirm}
                onClose={() => setRecalculateConfirm(null)}
                onConfirm={() => handleRecalculate(recalculateConfirm)}
                title="¿Recalcular recibo?"
                message="Se recalcularán todos los conceptos del recibo basándose en la configuración actual del período. Esto sobrescribirá los valores actuales."
                confirmText="Recalcular"
                variant="primary"
            />

            <ConfirmDialog
                open={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={() => handleDelete(deleteConfirm)}
                title="¿Eliminar recibo?"
                message="Esta acción anulará el recibo permanentemente. No se puede deshacer."
                confirmText="Eliminar"
                variant="danger"
            />
        </div>
    </div>
    )
}

export default PayrollReceiptsTab