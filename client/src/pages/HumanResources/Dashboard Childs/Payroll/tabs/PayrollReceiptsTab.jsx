import { useEffect, useState, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useSearchParams } from "react-router-dom"
import { HandlePayrollReceipts } from "../../../../../redux/Thunks/PayrollThunk.js"
import { useIsDark } from "../../../../../hooks/useIsDark.js"
import { useHRAuth } from "../../../../../hooks/useHRAuth.js"
import { formatCurrency, formatDate } from "@/utils/formatters.js"

export const PayrollReceiptsTab = () => {
    const isDark = useIsDark()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { data: receipts, isLoading, error, pagination } = useSelector((state) => state.payrollReducer.receipts)

    const [statusFilter, setStatusFilter] = useState("all")
    const [searchTerm, setSearchTerm] = useState("")
    const [employeeFilter, setEmployeeFilter] = useState("")
    const [periodFilter, setPeriodFilter] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedReceipt, setSelectedReceipt] = useState(null)
    const [showDetailModal, setShowDetailModal] = useState(false)

    useEffect(() => {
        const params = { 
            page: currentPage, 
            status: statusFilter !== "all" ? statusFilter : undefined,
            period: periodFilter || undefined,
            employee: employeeFilter || undefined,
            search: searchTerm || undefined
        }
        dispatch(HandlePayrollReceipts({ type: "GETALL", ...params }))
    }, [dispatch, currentPage, statusFilter, periodFilter, employeeFilter, searchTerm])

    const handleViewDetail = useCallback((receipt) => {
        setSelectedReceipt(receipt)
        setShowDetailModal(true)
    }, [])

    const formatDate = (dateStr) => {
        if (!dateStr) return '—'
        const date = new Date(dateStr)
        return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })
    }

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
            <div className="p-4 border-b" style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                <div className="flex flex-wrap gap-4 items-center mb-4">
                    <div className="flex-1 max-w-md">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border transition-colors focus:outline-none focus:ring-2"
                            style={{ 
                                borderColor: isDark ? "rgba(0,61,165,0.3)" : "rgba(0,61,165,0.2)",
                                background: isDark ? "rgba(0,0,0,0.2)" : "white",
                                color: isDark ? "white" : "black"
                            }}
                            placeholder="Buscar recibos..."
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 rounded-xl border w-48"
                            style={{ 
                                borderColor: isDark ? "rgba(0,61,165,0.3)" : "rgba(0,61,165,0.2)",
                                background: isDark ? "rgba(0,0,0,0.2)" : "white",
                                color: isDark ? "white" : "black"
                            }}
                        >
                            <option value="all">Todos los estados</option>
                            <option value="DRAFT">Borrador</option>
                            <option value="CALCULATED">Calculado</option>
                            <option value="APPROVED">Aprobado</option>
                            <option value="PAID">Pagado</option>
                            <option value="VOIDED">Anulado</option>
                        </select>
                        <select
                            value={periodFilter}
                            onChange={(e) => setPeriodFilter(e.target.value)}
                            className="px-3 py-2 rounded-xl border w-56"
                            style={{ 
                                borderColor: isDark ? "rgba(0,61,165,0.3)" : "rgba(0,61,165,0.2)",
                                background: isDark ? "rgba(0,0,0,0.2)" : "white",
                                color: isDark ? "white" : "black"
                            }}
                        >
                            <option value="">Todos los períodos</option>
                        </select>
                    </div>
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Filtrar por empleado..."
                        value={employeeFilter}
                        onChange={(e) => setEmployeeFilter(e.target.value)}
                        className="px-4 py-2 rounded-xl border w-64"
                        style={{ 
                            borderColor: isDark ? "rgba(0,61,165,0.3)" : "rgba(0,61,165,0.2)",
                            background: isDark ? "rgba(0,0,0,0.2)" : "white",
                            color: isDark ? "white" : "black"
                        }}
                    />
                </div>
            </div>

            {/* Tabla de recibos */}
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">Cargando recibos...</div>
                </div>
            ) : error ? (
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center text-red-500">
                        <p className="font-bold">Error cargando recibos</p>
                        <p className="text-sm text-gray-500">{error}</p>
                    </div>
                </div>
            ) : !receipts || receipts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: isDark ? "rgba(0,61,165,0.1)" : "rgba(0,61,165,0.1)" }}>
                        <svg className="w-8 h-8" style={{ color: "#003DA5" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sin recibos</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">No hay recibos de nómina registrados</p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full" role="table">
                            <thead>
                                <tr className="border-b" style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Empleado</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Período</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipo</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ingresos</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Deducciones</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Neto</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha Pago</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: isDark ? "rgba(0,61,165,0.1)" : "rgba(0,61,165,0.1)" }}>
                                {receipts.map((receipt) => (
                                    <tr key={receipt._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors">
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {receipt.employee?.firstname} {receipt.employee?.lastname}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {receipt.employee?.department?.name || '—'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {receipt.period?.name || 'N/A'}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {receipt.period?.start_date && receipt.period?.end_date 
                                                    ? `${new Date(receipt.period.start_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} - ${new Date(receipt.period.end_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}`
                                                    : '—'}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                {receipt.tipo_recibo || 'NORMAL'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-green-600 dark:text-green-400">
                                            {receipt.total_income_ves !== undefined ? `$ ${(receipt.total_income_ves).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-right text-red-600 dark:text-red-400">
                                            {receipt.total_deductions_ves !== undefined ? `$ ${(receipt.total_deductions_ves).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">
                                            {receipt.net_pay_ves !== undefined ? `$ ${(receipt.net_pay_ves).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                receipt.status === 'PAID' ? 'bg-green-100 text-green-800' :
                                                receipt.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                receipt.status === 'CALCULATED' ? 'bg-yellow-100 text-yellow-800' :
                                                receipt.status === 'VOIDED' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {receipt.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                                            {receipt.payment_date ? new Date(receipt.payment_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleViewDetail(receipt); }}
                                                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                    aria-label="Ver detalle"
                                                >
                                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542 7z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    {pagination && pagination.pages > 1 && (
                        <div className="flex items-center justify-between px-4 py-4 border-t" style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Mostrando {((currentPage - 1) * 20) + 1} - {Math.min(currentPage * 20, pagination.total)} de {pagination.total} recibos
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                        background: isDark ? "rgba(0,61,165,0.2)" : "rgba(0,61,165,0.1)",
                                        color: "#003DA5"
                                    }}
                                >
                                    Anterior
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
                                    disabled={currentPage === pagination.pages}
                                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                        background: isDark ? "rgba(0,61,165,0.2)" : "rgba(0,61,165,0.1)",
                                        color: "#003DA5"
                                    }}
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
            
            {/* Modal detalle */}
            {showDetailModal && selectedReceipt && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setShowDetailModal(false); setSelectedReceipt(null); }}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-xl font-bold">Detalle del Recibo</h2>
                            <button onClick={() => { setShowDetailModal(false); setSelectedReceipt(null); }} className="p-2 rounded-lg hover:bg-gray-100">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-4 max-h-[70vh] overflow-auto">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <p className="text-sm text-gray-500">Período</p>
                                    <p className="font-medium">{selectedReceipt.period?.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Fecha Pago</p>
                                    <p className="font-medium">{selectedReceipt.payment_date ? new Date(selectedReceipt.payment_date).toLocaleDateString('es-ES') : 'Pendiente'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Estado</p>
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                        selectedReceipt.status === 'PAID' ? 'bg-green-100 text-green-800' :
                                        selectedReceipt.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                        selectedReceipt.status === 'CALCULATED' ? 'bg-yellow-100 text-yellow-800' :
                                        selectedReceipt.status === 'VOIDED' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {selectedReceipt.status}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Empleado</p>
                                    <p className="font-medium">{selectedReceipt.employee?.firstname} {selectedReceipt.employee?.lastname}</p>
                                </div>
                            </div>
                            
                            <h3 className="font-semibold mb-3">Conceptos</h3>
                            <div className="overflow-x-auto mb-6">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700">
                                            <th className="text-left p-2">Concepto</th>
                                            <th className="text-right p-2">Tipo</th>
                                            <th className="text-right p-2">Cantidad</th>
                                            <th className="text-right p-2">Monto (VES)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedReceipt.lines?.map((line, idx) => (
                                            <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                                                <td className="py-2">{line.concept_name}</td>
                                                <td className="py-2 text-right">
                                                    <span className={`inline-flex px-2 py-0.5 rounded text-xs ${line.kind === 'INCOME' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {line.kind}
                                                    </span>
                                                </td>
                                                <td className="py-2 text-right">{line.quantity}</td>
                                                <td className="py-2 text-right font-medium">${(line.amount_ves || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                <div>
                                    <p className="text-sm text-gray-500">Total Ingresos</p>
                                    <p className="font-bold text-lg">${(selectedReceipt.total_income_ves || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Deducciones</p>
                                    <p className="font-bold text-lg text-red-600">${(selectedReceipt.total_deductions_ves || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Neto a Pagar</p>
                                    <p className="font-bold text-xl">${(selectedReceipt.net_pay_ves || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</p>
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <button onClick={() => { setShowDetailModal(false); setSelectedReceipt(null); }} className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PayrollReceiptsTab