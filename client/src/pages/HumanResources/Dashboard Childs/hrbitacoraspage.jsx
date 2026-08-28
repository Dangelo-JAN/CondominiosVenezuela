import { ThemedListWrapper, ThemedHeadingBar, ThemedListContainer } from "../../../components/common/Dashboard/ListDesigns"
import { useEffect, useState, useMemo, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useSearchParams } from "react-router-dom"
import { HandleGetAllBitacoras, HandleDeleteBitacoraByHR } from "../../../redux/Thunks/HRBitacorasThunk.js"
import { Loading } from "../../../components/common/loading.jsx"
import { useIsDark } from "../../../hooks/useIsDark.js"
import { Calendar, Filter, Search, Trash2, Eye, ChevronDown, FileText, Clock, User } from "lucide-react"
import { CustomSelect } from "../../../components/ui/custom-select.jsx"
import { BitacoraDetailModal } from "../../../components/common/Dashboard/ReportActivityModals.jsx"

export const HRBitacorasPage = () => {
    const isDark = useIsDark()
    const dispatch = useDispatch()
    const [searchParams] = useSearchParams()
    const { data: bitacoras, isLoading } = useSelector((state) => state.HRBitacorasReducer)

    const [employeeFilter, setEmployeeFilter] = useState("all")
    const [searchTerm, setSearchTerm] = useState("")
    // Fase 6 (R3): inicializa el rango desde los query params ?startDate=&endDate=
    // que provienen de los chips del reporte. Se convierten de ISO a YYYY-MM-DD
    // para el UI (el fetch server-side usa los valores ISO originales).
    const [dateRange, setDateRange] = useState(() => {
        const from = searchParams.get("startDate")
        const to = searchParams.get("endDate")
        const norm = (v) => (v ? String(v).slice(0, 10) : "")
        return { start: norm(from), end: norm(to) }
    })
    const [selectedBitacora, setSelectedBitacora] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)

    const table_headings = ["Empleado", "Título", "Fecha", "Acciones"]

    useEffect(() => {
        // Fase 6 (R3): pasa los query params del reporte al fetch server-side
        // (contrato de la Fase 2: startDate/endDate en Bitacora.controller.js).
        const from = searchParams.get("startDate")
        const to = searchParams.get("endDate")
        dispatch(HandleGetAllBitacoras(from || to ? { startDate: from || undefined, endDate: to || undefined } : {}))
    }, [dispatch, searchParams])

    // Obtener lista única de empleados para el filtro
    const employees = useMemo(() => {
        if (!bitacoras) return []
        const empMap = new Map()
        bitacoras.forEach(b => {
            if (b.employee?._id) {
                empMap.set(b.employee._id, b.employee)
            }
        })
        return Array.from(empMap.values())
    }, [bitacoras])

    const filteredBitacoras = useMemo(() => {
        if (!bitacoras) return []

        return bitacoras.filter(b => {
            // Filter by employee
            if (employeeFilter !== "all" && b.employee?._id !== employeeFilter) return false

            // Filter by search term (title or content)
            if (searchTerm) {
                const term = searchTerm.toLowerCase()
                const titleMatch = b.title?.toLowerCase().includes(term)
                const contentMatch = b.content?.toLowerCase().includes(term)
                if (!titleMatch && !contentMatch) return false
            }

            // Filter by date range
            if (dateRange.start || dateRange.end) {
                const createdAt = new Date(b.createdAt)
                if (dateRange.start && createdAt < new Date(dateRange.start)) return false
                if (dateRange.end) {
                    const end = new Date(dateRange.end)
                    end.setHours(23, 59, 59, 999)
                    if (createdAt > end) return false
                }
            }

            return true
        })
    }, [bitacoras, employeeFilter, searchTerm, dateRange])

    const handleDelete = useCallback(async (id) => {
        await dispatch(HandleDeleteBitacoraByHR(id))
        setDeleteConfirm(null)
    }, [dispatch])

    const formatDate = (dateStr) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })
    }

    const getInitials = (emp) => {
        if (!emp) return "??"
        return `${(emp.firstname || "")[0] || ""}${(emp.lastname || "")[0] || ""}`.toUpperCase()
    }

    if (isLoading && !bitacoras) {
        return <Loading />
    }

    const totalCount = bitacoras?.length ?? 0
    const filteredCount = filteredBitacoras?.length ?? 0

    return (
        <div className="w-full h-full flex flex-col gap-6 px-4 py-6 bg-white dark:bg-[#0f0f1a]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                        style={{ color: isDark ? "#facc15" : "#ca8a04" }}>
                        Novedades del Equipo
                    </p>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl xl:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Bitácoras
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors duration-300"
                            style={{
                                background: isDark ? "rgba(252,227,0,0.12)" : "rgba(252,227,0,0.10)",
                                color: isDark ? "#facc15" : "#ca8a04",
                                border: isDark ? "1px solid rgba(252,227,0,0.30)" : "1px solid rgba(252,227,0,0.25)"
                            }}>
                            {totalCount} total
                        </span>
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="h-px w-full transition-colors duration-300"
                style={{ background: isDark ? "rgba(252,227,0,0.08)" : "#fef9c3" }} />

            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Employee Filter */}
                <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                    <label className="text-xs font-semibold uppercase tracking-wider"
                        style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                        <Filter className="w-3 h-3 inline mr-1" />
                        Empleado
                    </label>
                    <CustomSelect
                        value={employeeFilter}
                        onValueChange={(val) => setEmployeeFilter(val)}
                        options={[
                            { value: "all", label: "Todos los empleados" },
                            ...employees.map(emp => ({
                                value: emp._id,
                                label: `${emp.firstname} ${emp.lastname}`
                            }))
                        ]}
                        accentColor="yellow"
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
                        placeholder="Buscar por título o contenido..."
                        className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200
                            bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                            focus:border-yellow-400 focus:bg-white focus:ring-2 focus:ring-yellow-100
                            dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                            dark:placeholder-[rgba(255,255,255,0.25)] dark:focus:border-[rgba(252,227,0,0.5)]`}
                    />
                </div>

                {/* Date Range */}
                <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                    <label className="text-xs font-semibold uppercase tracking-wider"
                        style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                        <Calendar className="w-3 h-3 inline mr-1" />
                        Desde - Hasta
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className={`w-full rounded-xl px-3 py-2 text-sm outline-none transition-all duration-200
                                bg-gray-50 border border-gray-200 text-gray-900
                                focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100
                                dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                dark:focus:border-[rgba(252,227,0,0.5)]`}
                        />
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            className={`w-full rounded-xl px-3 py-2 text-sm outline-none transition-all duration-200
                                bg-gray-50 border border-gray-200 text-gray-900
                                focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100
                                dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                dark:focus:border-[rgba(252,227,0,0.5)]`}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="flex flex-col gap-3 flex-1 min-h-0">
                <ThemedListWrapper accent="yellow">
                    <ThemedHeadingBar accent="yellow" table_layout={"grid-cols-4"} table_headings={table_headings} />
                </ThemedListWrapper>
                <ThemedListContainer accent="yellow">
                    {filteredCount === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-300"
                                style={{ background: isDark ? "rgba(252,227,0,0.1)" : "#fef9c3" }}>
                                <FileText className="w-6 h-6 transition-colors duration-300"
                                    style={{ color: isDark ? "#facc15" : "#ca8a04" }} />
                            </div>
                            <p className="text-sm font-medium transition-colors duration-300"
                                style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#9ca3af" }}>
                                {searchTerm || employeeFilter || dateRange.start
                                    ? "No se encontraron bitácoras con los filtros actuales"
                                    : "No hay bitácoras registradas"}
                            </p>
                        </div>
                    ) : (
                        filteredBitacoras.map((bitacora, index) => (
                            <div
                                key={bitacora._id ?? index}
                                className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-3 py-3 items-center
                                    border-b last:border-b-0
                                    border-gray-100 hover:bg-yellow-50/50 hover:-translate-y-0.5 transition-all duration-150
                                    dark:border-[rgba(252,227,0,0.08)] dark:hover:bg-[rgba(252,227,0,0.04)]"
                            >
                                {/* Employee */}
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                                        style={{
                                            background: isDark ? "rgba(252,227,0,0.15)" : "#fef9c3",
                                            color: isDark ? "#facc15" : "#ca8a04"
                                        }}>
                                        {getInitials(bitacora.employee)}
                                    </div>
                                    <p className="text-sm font-semibold truncate text-gray-800 dark:text-white">
                                        {bitacora.employee
                                            ? `${bitacora.employee.firstname} ${bitacora.employee.lastname}`
                                            : "Empleado no encontrado"}
                                    </p>
                                </div>

                                {/* Title + Content preview */}
                                <div className="min-w-0">
                                    <p className="text-sm font-medium truncate text-gray-800 dark:text-white"
                                        title={bitacora.title}>
                                        {bitacora.title}
                                    </p>
                                    <p className="text-xs truncate mt-0.5"
                                        style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }}
                                        title={bitacora.content}>
                                        {bitacora.content}
                                    </p>
                                </div>

                                {/* Date */}
                                <div className="hidden sm:flex sm:items-center sm:justify-center">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3 h-3"
                                            style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }} />
                                        <p className="text-xs"
                                            style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#6b7280" }}>
                                            {formatDate(bitacora.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-center gap-2">
                                    {/* View detail */}
                                    <button
                                        onClick={() => setSelectedBitacora(bitacora)}
                                        className="p-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                                        style={{
                                            background: isDark ? "rgba(252,227,0,0.1)" : "#fef9c3",
                                            color: isDark ? "#facc15" : "#ca8a04"
                                        }}
                                        title="Ver detalle"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>

                                    {/* Delete */}
                                    <button
                                        onClick={() => setDeleteConfirm(bitacora._id)}
                                        className="p-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                                        style={{
                                            background: isDark ? "rgba(239,68,68,0.1)" : "#fee2e2",
                                            color: isDark ? "#f87171" : "#dc2626"
                                        }}
                                        title="Eliminar"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </ThemedListContainer>
            </div>

            {/* ── Detail Modal (reutilizado) ── */}
            <BitacoraDetailModal
                open={!!selectedBitacora}
                data={selectedBitacora}
                onClose={() => setSelectedBitacora(null)}
            />

            {/* ── Delete Confirmation ── */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                    onClick={() => setDeleteConfirm(null)}>
                    <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl
                        bg-white dark:bg-[#1a1a2e] border
                        border-gray-200 dark:border-[rgba(252,227,0,0.15)]"
                        onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            ¿Eliminar bitácora?
                        </h3>
                        <p className="text-sm mb-6" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                            Esta acción no se puede deshacer. La bitácora será eliminada permanentemente.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                                    bg-gray-100 text-gray-700 hover:bg-gray-200
                                    dark:bg-[rgba(255,255,255,0.05)] dark:text-gray-300 dark:hover:bg-[rgba(255,255,255,0.1)]"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 text-white"
                                style={{ background: "#dc2626", hover: { background: "#b91c1c" } }}
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
