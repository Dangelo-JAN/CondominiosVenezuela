import { useEffect, useState, useMemo, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { HandlePayrollConcepts } from "../../../../../redux/Thunks/PayrollThunk.js"
import { useIsDark } from "../../../../../hooks/useIsDark.js"
import { useHRAuth } from "../../../../../hooks/useHRAuth.js"
import { CustomSelect } from "../../../../../components/ui/custom-select.jsx"
import { ConfirmDialog } from "../../../../../components/common/ConfirmDialog.jsx"
import { ThemedListWrapper, ThemedHeadingBar, ThemedListContainer } from "../../../../../components/common/Dashboard/ListDesigns"
import { ConceptFormModal } from "../../../../../components/payroll/ConceptFormModal.jsx"
import { Search, Filter, ChevronDown, Settings, Edit, Trash2, AlertTriangle, CheckCircle, XCircle, Loader2, FileText, Calculator, Database, Zap } from "lucide-react"

export const PayrollConceptsTab = () => {
    const isDark = useIsDark()
    const dispatch = useDispatch()
    const { data: concepts, isLoading, error, pagination } = useSelector((state) => state.payrollReducer.concepts)
    const { data: receiptTypes, isLoading: typesLoading } = useSelector((state) => state.payrollReducer.receiptTypes)
    const { can, isReady } = useHRAuth()

    const [kindFilter, setKindFilter] = useState("all")
    const [activeFilter, setActiveFilter] = useState("all")
    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [showFormModal, setShowFormModal] = useState(false)
    const [editConcept, setEditConcept] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const kindOptions = useMemo(() => [
        { value: "all", label: "Todos los tipos" },
        { value: "INCOME", label: "Ingresos" },
        { value: "DEDUCTION", label: "Deducciones" },
        { value: "EMPLOYER_COST", label: "Costos Patronales" },
        { value: "INFORMATIONAL", label: "Informativos" },
    ], [])

    const activeOptions = useMemo(() => [
        { value: "all", label: "Todos" },
        { value: "true", label: "Activos" },
        { value: "false", label: "Inactivos" },
    ], [])

    const computationMethodOptions = useMemo(() => [
        { value: "FIXED_AMOUNT", label: "Monto Fijo" },
        { value: "PERCENTAGE_OF_BASIC", label: "% del Básico" },
        { value: "DYNAMIC_FORMULA", label: "Fórmula Dinámica" },
        { value: "TABLE", label: "Tabla" },
        { value: "EXTERNAL_API", label: "API Externa" },
    ], [])

    const calculationBaseOptions = useMemo(() => [
        { value: "GROSS", label: "Bruto" },
        { value: "BASE_SALARY", label: "Salario Base" },
        { value: "NET", label: "Neto" },
        { value: "TAXABLE", label: "Gravable" },
        { value: "UT", label: "UT" },
        { value: "CUSTOM", label: "Personalizada" },
    ], [])

    const behaviorOptions = useMemo(() => [
        { value: "FIXED", label: "Fijo" },
        { value: "VARIABLE", label: "Variable" },
        { value: "NOVELTY", label: "Novedad" },
        { value: "OVERTIME", label: "Horas Extra" },
        { value: "BONUS", label: "Bono" },
        { value: "COMMISSION", label: "Comisión" },
        { value: "ALLOWANCE", label: "Asignación" },
    ], [])

    const unitLabelOptions = useMemo(() => [
        { value: "DÍAS", label: "Días" },
        { value: "HORAS", label: "Horas" },
        { value: "UNIDADES", label: "Unidades" },
        { value: "%", label: "Porcentaje" },
        { value: "BS", label: "Bs." },
        { value: "USD", label: "USD" },
    ], [])

    useEffect(() => {
        dispatch(HandlePayrollConcepts({ type: "GETALL", page: currentPage, kind: kindFilter !== "all" ? kindFilter : undefined, active: activeFilter !== "all" ? activeFilter : undefined, limit: 50 }))
        dispatch(HandlePayrollConcepts({ type: "RECEIPT_TYPES" }))
    }, [dispatch, currentPage, kindFilter, activeFilter])

    const handleDelete = useCallback(async (id) => {
        await dispatch(HandlePayrollConcepts({ type: "DELETE", id }))
        setDeleteConfirm(null)
    }, [dispatch])

    const handleSubmit = useCallback(async (data) => {
        setIsSubmitting(true)
        try {
            if (editConcept) {
                await dispatch(HandlePayrollConcepts({ type: "UPDATE", id: editConcept._id, data })).unwrap()
            } else {
                await dispatch(HandlePayrollConcepts({ type: "CREATE", data })).unwrap()
            }
            setShowFormModal(false)
            setEditConcept(null)
        } catch (error) {
            // Error handled by modal's internal validation
            console.error("Error submitting concept:", error)
        } finally {
            setIsSubmitting(false)
        }
    }, [dispatch, editConcept])

    const formatKindBadge = (kind) => {
        const configs = {
            INCOME: { bg: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: Calculator, label: 'Ingreso' },
            DEDUCTION: { bg: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: XCircle, label: 'Deducción' },
            EMPLOYER_COST: { bg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400', icon: Database, label: 'Costo Patronal' },
            INFORMATIONAL: { bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: FileText, label: 'Informativo' },
        }
        return configs[kind] || configs.INFORMATIONAL
    }

    const formatMethodBadge = (method) => {
        const configs = {
            FIXED_AMOUNT: { bg: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400', label: 'Monto Fijo' },
            PERCENTAGE_OF_BASIC: { bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', label: '% Básico' },
            DYNAMIC_FORMULA: { bg: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', label: 'Fórmula' },
            TABLE: { bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400', label: 'Tabla' },
            EXTERNAL_API: { bg: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400', label: 'API' },
        }
        return configs[method] || configs.FIXED_AMOUNT
    }

    if (error) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8">
                <div className="text-center text-red-500">
                    <p className="font-bold">Error cargando conceptos</p>
                    <p className="text-sm text-gray-500">{error}</p>
                </div>
            </div>
        )
    }

    const table_headings = ["Código", "Nombre", "Tipo", "Método", "Base", "Orden", "Estado", "Acciones"]
    const table_layout = "grid-cols-2 sm:grid-cols-8"
    const hiddenCols = ["Método", "Base", "Orden"]

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
                            Conceptos de Nómina
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors duration-300"
                            style={{
                                background: isDark ? "rgba(0,61,165,0.12)" : "rgba(0,61,165,0.10)",
                                color: "#003DA5",
                                border: isDark ? "1px solid rgba(0,61,165,0.30)" : "1px solid rgba(0,61,165,0.25)"
                            }}>
                            {pagination?.total ?? concepts?.length ?? 0} total
                        </span>
                    </div>
                </div>

                {isReady && can("payroll", "create") && (
                    <button
                        onClick={() => { setEditConcept(null); setShowFormModal(true); }}
                        className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 text-white flex items-center gap-2"
                        style={{ background: "#003DA5" }}
                    >
                        <Settings className="w-4 h-4" />
                        Nuevo Concepto
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
                        placeholder="Buscar por código o nombre..."
                        className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200
                            bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                            focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
                            dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                            dark:placeholder-[rgba(255,255,255,0.25)] dark:focus:border-[rgba(0,61,165,0.5)]`} />
                </div>

                {/* Kind Filter */}
                <div className="flex flex-col gap-1.5 flex-1 min-w-[180px]">
                    <label className="text-xs font-semibold uppercase tracking-wider"
                        style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                        <Filter className="w-3 h-3 inline mr-1" />
                        Tipo Concepto
                    </label>
                    <CustomSelect
                        value={kindFilter}
                        onValueChange={(val) => { setKindFilter(val); setCurrentPage(1); }}
                        options={kindOptions}
                        placeholder="Todos los tipos"
                        accentColor="blue"
                        searchPlaceholder="Buscar tipo..."
                    />
                </div>

                {/* Active Filter */}
                <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
                    <label className="text-xs font-semibold uppercase tracking-wider"
                        style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                        <Filter className="w-3 h-3 inline mr-1" />
                        Estado
                    </label>
                    <CustomSelect
                        value={activeFilter}
                        onValueChange={(val) => { setActiveFilter(val); setCurrentPage(1); }}
                        options={activeOptions}
                        placeholder="Todos"
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
                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                <p className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                    Cargando conceptos...
                                </p>
                            </div>
                        </div>
                    ) : !concepts || concepts.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center transition-colors duration-300"
                                style={{ background: isDark ? "rgba(0,61,165,0.1)" : "rgba(0,61,165,0.1)" }}>
                                <Settings className="w-8 h-8 transition-colors duration-300" style={{ color: "#003DA5" }} />
                            </div>
                            <div className="text-center">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sin conceptos</h2>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">
                                    {searchTerm || kindFilter !== "all" || activeFilter !== "all"
                                        ? "No se encontraron conceptos con los filtros actuales"
                                        : "No hay conceptos de nómina registrados"}
                                </p>
                            </div>
                        </div>
                    ) : (
                        concepts.map((concept, index) => {
                            const kindConfig = formatKindBadge(concept.kind)
                            const methodConfig = formatMethodBadge(concept.computation_method)
                            const KindIcon = kindConfig.icon
                            const MethodIcon = methodConfig.icon

                            return (
                                <div
                                    key={concept._id ?? index}
                                    className="grid grid-cols-2 sm:grid-cols-8 gap-2 px-3 py-3 items-center
                                        border-b last:border-b-0
                                        border-gray-100 hover:bg-blue-50/50 hover:-translate-y-0.5 transition-all duration-150
                                        dark:border-[rgba(0,61,165,0.08)] dark:hover:bg-[rgba(0,61,165,0.04)]"
                                >
                                    {/* Código */}
                                    <div className="min-w-0 col-span-2 sm:col-span-1">
                                        <p className="text-sm font-mono font-semibold truncate text-gray-900 dark:text-white"
                                            title={concept.code}>
                                            {concept.code}
                                        </p>
                                        {concept.is_system && (
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
                                                style={{
                                                    background: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.1)",
                                                    color: "#003DA5",
                                                    border: isDark ? "1px solid rgba(0,61,165,0.3)" : "1px solid rgba(0,61,165,0.2)"
                                                }}>
                                                <Database className="w-2.5 h-2.5" /> Sistema
                                            </span>
                                        )}
                                    </div>

                                    {/* Nombre */}
                                    <div className="col-span-2 sm:col-span-2 min-w-0">
                                        <p className="text-sm font-medium truncate text-gray-900 dark:text-white"
                                            title={concept.name}>
                                            {concept.name}
                                        </p>
                                        {concept.description && (
                                            <p className="text-xs truncate mt-0.5"
                                                style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }}>
                                                {concept.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Tipo (Kind) */}
                                    <div className="hidden sm:block sm:col-span-1">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${kindConfig.bg}`}>
                                            <KindIcon className="w-3 h-3" />
                                            {kindConfig.label}
                                        </span>
                                    </div>

                                    {/* Método de Cálculo */}
                                    <div className="hidden sm:block sm:col-span-1">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${methodConfig.bg}`}>
                                            <MethodIcon className="w-3 h-3" />
                                            {methodConfig.label}
                                        </span>
                                    </div>

                                    {/* Base de Cálculo */}
                                    <div className="hidden sm:block sm:col-span-1">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                                            bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                                            {concept.calculation_base}
                                        </span>
                                    </div>

                                    {/* Orden */}
                                    <div className="hidden lg:block lg:col-span-1 text-center text-gray-500 dark:text-gray-400">
                                        <p className="text-sm font-mono">{concept.receipt_order || 0}</p>
                                    </div>

                                    {/* Estado (Active) */}
                                    <div className="hidden sm:block sm:col-span-1 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold transition-colors duration-300 ${
                                            concept.active
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                        }`}>
                                            {concept.active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>

                                    {/* Acciones */}
                                    <div className="flex items-center justify-center gap-1.5 col-span-2 sm:col-span-1">
                                        {/* Ver/Editar */}
                                        {can("payroll", "read") && (
                                            <button
                                                onClick={() => { setEditConcept(concept); setShowFormModal(true); }}
                                                className="p-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                                                style={{
                                                    background: isDark ? "rgba(0,61,165,0.1)" : "rgba(0,61,165,0.1)",
                                                    color: "#003DA5"
                                                }}
                                                title={concept.is_system ? "Ver (solo lectura)" : "Editar"}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                        )}

                                        {/* Eliminar */}
                                        {isReady && can("payroll", "delete") && !concept.is_system && (
                                            <button
                                                onClick={() => setDeleteConfirm(concept._id)}
                                                className="p-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                                                style={{
                                                    background: isDark ? "rgba(239,68,68,0.1)" : "#fee2e2",
                                                    color: isDark ? "#f87171" : "#dc2626"
                                                }}
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}

                                        {/* Indicador sistema */}
                                        {concept.is_system && (
                                            <span className="p-2 rounded-xl" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#f3f4f6" }} title="Concepto del sistema (no editable)">
                                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                            </span>
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

            {/* Create/Edit Modal - ConceptFormModal */}
            <ConceptFormModal
                open={showFormModal}
                onClose={() => { setShowFormModal(false); setEditConcept(null); }}
                initialData={editConcept}
                receiptTypes={receiptTypes || []}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            />

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={() => handleDelete(deleteConfirm)}
                title="¿Eliminar concepto?"
                message="Esta acción no se puede deshacer. El concepto será eliminado permanentemente."
                confirmText="Eliminar"
                variant="danger"
            />
        </div>
    )
}

export default PayrollConceptsTab