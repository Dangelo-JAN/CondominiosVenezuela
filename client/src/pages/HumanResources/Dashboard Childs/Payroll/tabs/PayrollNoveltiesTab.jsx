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
import { Search, Filter, Calendar, FileText, ChevronDown, Eye, Edit, CheckCircle, XCircle, Trash2, RefreshCw, AlertTriangle, Download, Upload, Loader2, Settings, Upload as UploadIcon, FileSpreadsheet, X, AlertCircle, Check } from "lucide-react"

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

// --- BulkImportModal Component ---
const BulkImportModal = ({ open, onClose, isDark, periods, concepts, onImport }) => {
    const [file, setFile] = useState(null)
    const [fileError, setFileError] = useState(null)
    const [previewData, setPreviewData] = useState([])
    const [importing, setImporting] = useState(false)
    const [importResult, setImportResult] = useState(null)
    const [selectedPeriod, setSelectedPeriod] = useState("select")
    const [selectedConcept, setSelectedConcept] = useState("select")
    const [defaultValues, setDefaultValues] = useState({
        quantity: 1,
        unit: "BS",
        source: "IMPORT",
        description: ""
    })

    const formatDateShort = (dateStr) => {
        if (!dateStr) return ''
        return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    }
    const formatDateVeryShort = (dateStr) => {
        if (!dateStr) return ''
        return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
    }

    const periodOptions = useMemo(() => [
        { value: "select", label: "Seleccionar período por defecto..." },
        ...(periods?.map(p => ({ 
            value: p._id, 
            label: `${p.name} (${formatDateVeryShort(p.start_date)} - ${formatDateShort(p.end_date)})`
        })) || [])
    ], [periods])

    const conceptOptions = useMemo(() => [
        { value: "select", label: "Seleccionar concepto por defecto..." },
        ...(concepts?.filter(c => c.active && c.is_novelty_eligible).map(c => ({ value: c.code, label: `${c.code} - ${c.name}` })) || [])
    ], [concepts])

    const unitOptions = [
        { value: "DÍAS", label: "Días" },
        { value: "HORAS", label: "Horas" },
        { value: "UNIDADES", label: "Unidades" },
        { value: "%", label: "Porcentaje" },
        { value: "BS", label: "Bs." },
        { value: "USD", label: "USD" },
    ]

    const sourceOptions = [
        { value: "MANUAL", label: "Manual" },
        { value: "IMPORT", label: "Importación" },
        { value: "BIOMETRIC", label: "Biométrico" },
        { value: "POS", label: "POS" },
        { value: "LEAVE", label: "Licencia" },
        { value: "LOAN", label: "Préstamo" },
        { value: "ADVANCE", label: "Anticipo" },
    ]

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (!selectedFile) return

        const validTypes = ['text/csv', 'application/json', 'text/plain']
        const validExtensions = ['.csv', '.json']
        const fileName = selectedFile.name.toLowerCase()
        const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext))

        if (!validTypes.includes(selectedFile.type) && !hasValidExtension) {
            setFileError("Formato no válido. Use CSV o JSON.")
            setFile(null)
            return
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            setFileError("Archivo demasiado grande. Máximo 5MB.")
            setFile(null)
            return
        }

        setFileError(null)
        setFile(selectedFile)

        const reader = new FileReader()
        reader.onload = (event) => {
            try {
                let data = []
                const content = event.target.result
                
                if (fileName.endsWith('.csv')) {
                    const lines = content.split('\n').filter(l => l.trim())
                    if (lines.length < 2) throw new Error("CSV vacío o solo headers")
                    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
                    for (let i = 1; i < Math.min(lines.length, 11); i++) {
                        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
                        const row = {}
                        headers.forEach((h, idx) => row[h] = values[idx])
                        data.push(row)
                    }
                } else {
                    const json = JSON.parse(content)
                    data = Array.isArray(json) ? json.slice(0, 10) : [json]
                }
                
                setPreviewData(data)
            } catch (err) {
                setFileError(`Error al parsear archivo: ${err.message}`)
                setPreviewData([])
            }
        }
        reader.readAsText(selectedFile)
    }

    const handleImport = async () => {
        if (!file || !selectedPeriod || selectedPeriod === "select") {
            setFileError("Seleccione un archivo y un período por defecto")
            return
        }

        setImporting(true)
        setFileError(null)
        setImportResult(null)

        try {
            const content = await file.text()
            let noveltiesToImport = []

            if (file.name.toLowerCase().endsWith('.csv')) {
                const lines = content.split('\n').filter(l => l.trim())
                const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
                for (let i = 1; i < lines.length; i++) {
                    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
                    const row = {}
                    headers.forEach((h, idx) => row[h] = values[idx])
                    noveltiesToImport.push(row)
                }
            } else {
                const json = JSON.parse(content)
                noveltiesToImport = Array.isArray(json) ? json : [json]
            }

            // Transform and validate each row
            const transformedNovelties = noveltiesToImport.map((row, idx) => {
                const employeeId = row.employee_id || row.employee || row.employeeId
                const conceptCode = row.concept_code || row.concept || row.code
                const amount = parseFloat(row.amount || row.monto || row.valor || 0)
                const quantity = parseInt(row.quantity || row.cantidad || defaultValues.quantity)
                const unit = row.unit || row.unidad || defaultValues.unit
                const source = row.source || row.origen || defaultValues.source
                const description = row.description || row.descripcion || defaultValues.description
                const referenceId = row.reference_id || row.referenceId || row.ref_id
                const referenceModel = row.reference_model || row.referenceModel

                if (!employeeId) throw new Error(`Fila ${idx + 1}: Falta employee_id`)
                if (!conceptCode) throw new Error(`Fila ${idx + 1}: Falta concept_code`)
                if (isNaN(amount)) throw new Error(`Fila ${idx + 1}: Monto inválido`)

                return {
                    employee: employeeId,
                    period: selectedPeriod,
                    concept_code: conceptCode.toUpperCase(),
                    amount,
                    quantity: isNaN(quantity) ? defaultValues.quantity : quantity,
                    unit: unit || defaultValues.unit,
                    source: source || defaultValues.source,
                    description: description || '',
                    reference_id: referenceId || '',
                    reference_model: referenceModel || ''
                }
            })

            // Call the bulk create API
            const result = await onImport(transformedNovelties)
            
            setImportResult({
                success: true,
                created: result.created?.length || 0,
                errors: result.errors?.length || 0,
                details: result
            })
            
            // Clear form on success
            setFile(null)
            setPreviewData([])
            setSelectedPeriod("select")
            
        } catch (err) {
            setFileError(err.message || "Error al importar")
            setImportResult({ success: false, error: err.message })
        } finally {
            setImporting(false)
        }
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-4xl w-full max-h-[95vh] overflow-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b transition-colors duration-300"
                    style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.1)" }}>
                            <FileSpreadsheet className="w-5 h-5" style={{ color: "#003DA5" }} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Importar Novedades Masivas</h2>
                            <p className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                Suba un archivo CSV o JSON con múltiples novedades
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 max-h-[85vh] overflow-auto">
                    {importResult ? (
                        // Result View
                        <div className="space-y-4">
                            <div className={`p-4 rounded-xl flex items-center gap-3 ${importResult.success ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
                                <div className={`p-2 rounded-full ${importResult.success ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                                    {importResult.success ? (
                                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                        {importResult.success ? "Importación completada" : "Error en la importación"}
                                    </h3>
                                    {importResult.success && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {importResult.created} novedades creadas
                                            {importResult.errors > 0 && <span className="text-red-600">, {importResult.errors} errores</span>}
                                        </p>
                                    )}
                                    {!importResult.success && (
                                        <p className="text-sm text-red-600 dark:text-red-400">{importResult.error}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => { setImportResult(null); setFileError(null); }} className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all" style={{ background: "#003DA5" }}>
                                    Importar otro archivo
                                </button>
                                <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Import Form
                        <div className="space-y-6">
                            {/* File Upload */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                    Archivo <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept=".csv,.json"
                                        onChange={handleFileChange}
                                        className="sr-only"
                                        id="bulk-import-file"
                                        disabled={importing}
                                    />
                                    <label htmlFor="bulk-import-file" className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${fileError ? 'border-red-400' : 'hover:border-blue-400'}`}
                                        style={{ 
                                            background: fileError ? 'bg-red-50 dark:bg-red-900/20' : (isDark ? "rgba(255,255,255,0.02)" : "#f9fafb"),
                                            borderColor: fileError ? "#dc2626" : (isDark ? "rgba(255,255,255,0.12)" : "#e5e7eb")
                                        }}>
                                        <UploadIcon className="w-10 h-10 mb-3" style={{ color: fileError ? "#dc2626" : "#003DA5" }} />
                                        <p className="text-center text-gray-700 dark:text-gray-300">
                                            {file ? `Archivo seleccionado: ${file.name} (${(file.size/1024).toFixed(1)} KB)` : 'Arrastre o haga clic para subir archivo CSV/JSON'}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Máximo 5MB • CSV o JSON</p>
                                    </label>
                                </div>
                                {fileError && (
                                    <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" /> {fileError}
                                    </p>
                                )}
                            </div>

                            {/* Preview */}
                            {previewData.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                        <FileSpreadsheet className="w-4 h-4" style={{ color: "#003DA5" }} />
                                        Vista Previa (primeras 10 filas)
                                    </h3>
                                    <div className="overflow-x-auto rounded-lg border" style={{ borderColor: isDark ? "rgba(255,255,255,0.12)" : "#e5e7eb" }}>
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-gray-50 dark:bg-gray-800/50">
                                                    {Object.keys(previewData[0]).map(key => (
                                                        <th key={key} className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">{key}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {previewData.map((row, idx) => (
                                                    <tr key={idx} className="border-t" style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb" }}>
                                                        {Object.values(row).map((val, i) => (
                                                            <td key={i} className="px-3 py-2 text-gray-900 dark:text-white truncate max-w-xs">{val}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Default Values Configuration */}
                            <div className="border-t pt-6" style={{ borderColor: isDark ? "rgba(255,255,255,0.12)" : "#e5e7eb" }}>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Settings className="w-4 h-4" style={{ color: "#003DA5" }} />
                                    Valores por Defecto (se usan si el archivo no los incluye)
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* Period */}
                                    <div className="lg:col-span-2">
                                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                            Período <span className="text-red-500">*</span>
                                        </label>
                                        <CustomSelect
                                            value={selectedPeriod}
                                            onValueChange={setSelectedPeriod}
                                            options={periodOptions}
                                            placeholder="Seleccionar período..."
                                            accentColor="blue"
                                            disabled={importing}
                                        />
                                    </div>

                                    {/* Concept */}
                                    <div className="lg:col-span-2">
                                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                            Concepto por defecto
                                        </label>
                                        <CustomSelect
                                            value={selectedConcept}
                                            onValueChange={setSelectedConcept}
                                            options={conceptOptions}
                                            placeholder="Opcional: concepto por defecto"
                                            accentColor="blue"
                                            disabled={importing}
                                        />
                                    </div>

                                    {/* Quantity */}
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                            Cantidad
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            step="1"
                                            value={defaultValues.quantity}
                                            onChange={(e) => setDefaultValues({...defaultValues, quantity: parseInt(e.target.value) || 1})}
                                            className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200 text-right
                                                bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                                                focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
                                                dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                                dark:placeholder-[rgba(255,255,255,0.25)] dark:focus:border-[rgba(0,61,165,0.5)]`}
                                            disabled={importing}
                                        />
                                    </div>

                                    {/* Unit */}
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                            Unidad
                                        </label>
                                        <CustomSelect
                                            value={defaultValues.unit}
                                            onValueChange={(val) => setDefaultValues({...defaultValues, unit: val})}
                                            options={unitOptions}
                                            placeholder="Seleccionar unidad"
                                            accentColor="blue"
                                            disabled={importing}
                                        />
                                    </div>

                                    {/* Source */}
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                            Origen
                                        </label>
                                        <CustomSelect
                                            value={defaultValues.source}
                                            onValueChange={(val) => setDefaultValues({...defaultValues, source: val})}
                                            options={sourceOptions}
                                            placeholder="Seleccionar origen"
                                            accentColor="blue"
                                            disabled={importing}
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                            Descripción por defecto
                                        </label>
                                        <input
                                            type="text"
                                            value={defaultValues.description}
                                            onChange={(e) => setDefaultValues({...defaultValues, description: e.target.value})}
                                            placeholder="Descripción opcional..."
                                            className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200
                                                bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                                                focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
                                                dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                                dark:placeholder-[rgba(255,255,255,0.25)] dark:focus:border-[rgba(0,61,165,0.5)]`}
                                            disabled={importing}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Format Help */}
                            <div className="p-4 rounded-lg" style={{ background: isDark ? "rgba(0,61,165,0.08)" : "rgba(0,61,165,0.05)" }}>
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" style={{ color: "#003DA5" }} />
                                    Formato de Archivo Esperado
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">CSV (con headers):</p>
                                        <pre className="p-2 rounded bg-gray-100 dark:bg-gray-800 overflow-x-auto text-gray-900 dark:text-white">
{`employee_id,concept_code,amount,quantity,unit,source,description,reference_id,reference_model
EMP001,HE_DIURNA,500.00,2,HORAS,IMPORT,Horas extra mayo,,`
                                        }
                                        </pre>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">JSON (array de objetos):</p>
                                        <pre className="p-2 rounded bg-gray-100 dark:bg-gray-800 overflow-x-auto text-gray-900 dark:text-white">
{`[
  {
    "employee_id": "EMP001",
    "concept_code": "HE_DIURNA",
    "amount": 500.00,
    "quantity": 2,
    "unit": "HORAS",
    "source": "IMPORT"
  }
]`
                                        }
                                        </pre>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    Campos requeridos: <strong>employee_id</strong>, <strong>concept_code</strong>, <strong>amount</strong>. 
                                    Los demás usan valores por defecto.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                                <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                                    Cancelar
                                </button>
                                <button 
                                    onClick={handleImport} 
                                    disabled={importing || !file}
                                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    style={{ background: "#003DA5" }}
                                >
                                    {importing ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Importando...
                                        </>
                                    ) : (
                                        <>
                                            <FileSpreadsheet className="w-4 h-4" />
                                            Importar
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
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
    const [showBulkImportModal, setShowBulkImportModal] = useState(false)
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
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowBulkImportModal(true)}
                            className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 text-white flex items-center gap-2"
                            style={{ background: "#003DA5" }}
                            title="Importar novedades masivamente (CSV/JSON)"
                        >
                            <UploadIcon className="w-4 h-4" />
                            Importar
                        </button>
                        <button
                            onClick={() => { setEditNovelty(null); setShowFormModal(true); }}
                            className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 text-white flex items-center gap-2"
                            style={{ background: "#003DA5" }}
                        >
                            <FileText className="w-4 h-4" />
                            Nueva Novedad
                        </button>
                    </div>
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

            {/* Bulk Import Modal */}
            <BulkImportModal
                open={showBulkImportModal}
                onClose={() => setShowBulkImportModal(false)}
                isDark={isDark}
                periods={periods}
                concepts={concepts}
                onImport={async (novelties) => {
                    const result = await dispatch(HandlePayrollNovelties({ 
                        type: "BULK_CREATE", 
                        data: novelties 
                    })).unwrap()
                    return result
                }}
            />
        </div>
    )
}

export default PayrollNoveltiesTab