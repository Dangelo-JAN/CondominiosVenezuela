import { useEffect, useState, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useSearchParams } from "react-router-dom"
import { HandleHRWorkPhoto } from "../../../redux/Thunks/HRWorkPhotoThunk.js"
import { HandleGetHREmployees } from "../../../redux/Thunks/HREmployeesThunk.js"
import { HandleGetHRDepartments } from "../../../redux/Thunks/HRDepartmentPageThunk.js"
import { Loading } from "../../../components/common/loading.jsx"
import { useToast } from "@/hooks/use-toast"
import { useIsDark } from "../../../hooks/useIsDark.js"
import {
    ImageIcon, Trash2, Eye, CheckCircle2,
    Filter, Users, Building2, CalendarDays, RotateCcw
} from "lucide-react"
import { CustomSelect } from "../../../components/ui/custom-select.jsx"
import { WorkPhotoModal } from "../../../components/common/Dashboard/ReportActivityModals.jsx"

// ── Helper: Formatear fecha usando timezone del browser (fix timezone) ──
const formatDate = (d) => {
    if (!d) return ""
    const date = new Date(d)
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    return date.toLocaleDateString("es-ES", {
        timeZone: userTimezone,
        day: "numeric",
        month: "short",
        year: "numeric"
    })
}

const formatTime = (d) => {
    if (!d) return ""
    const date = new Date(d)
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    return date.toLocaleTimeString("es-ES", {
        timeZone: userTimezone,
        hour: "2-digit",
        minute: "2-digit"
    })
}

// ── Card de foto ───────────────────────────────────────────────────────────
const PhotoCard = ({ photo, onPreview, onDelete, onReview }) => {
    const { isDark } = useIsDark()

    return (
    <div className="group relative rounded-2xl overflow-hidden transition-all duration-300"
        style={{
            background: isDark ? "linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(255,255,255,0.02) 100%)" : "linear-gradient(135deg, #e0e7ff 0%, #ffffff 60%)",
            border: isDark ? "1px solid rgba(99,102,241,0.40)" : "1px solid #a5b4fc"
        }}>

        <div className="relative aspect-video overflow-hidden transition-colors duration-300"
            style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#f3f4f6" }}>
            <img
                src={photo.photourl}
                alt={photo.description || "Foto"}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0
                group-hover:opacity-100 transition-opacity duration-200"
                style={{ background: "rgba(0,0,0,0.45)" }}>
                <button
                    onClick={() => onPreview(photo)}
                    className="flex items-center justify-center w-9 h-9 rounded-xl
                        bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
                >
                    <Eye className="w-4 h-4 text-white" />
                </button>
                {!photo.reviewedby && (
                    <button
                        onClick={() => onReview(photo._id)}
                        className="flex items-center justify-center w-9 h-9 rounded-xl
                            bg-emerald-500/70 hover:bg-emerald-500/90 backdrop-blur-sm transition-colors"
                    >
                        <CheckCircle2 className="w-4 h-4 text-white" />
                    </button>
                )}
                <button
                    onClick={() => onDelete(photo._id)}
                    className="flex items-center justify-center w-9 h-9 rounded-xl
                        bg-red-500/70 hover:bg-red-500/90 backdrop-blur-sm transition-colors"
                >
                    <Trash2 className="w-4 h-4 text-white" />
                </button>
            </div>

            {photo.reviewedby && (
                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full
                    bg-emerald-500/80 backdrop-blur-sm">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                    <span className="text-[10px] font-semibold text-white">Revisado</span>
                </div>
            )}
        </div>

        <div className="px-3 py-2.5">
            <p className="text-xs font-semibold truncate transition-colors duration-300"
                style={{ color: isDark ? "#ffffff" : "#111827" }}>
                {photo.employee?.firstname} {photo.employee?.lastname}
            </p>
            <div className="flex items-center justify-between mt-0.5">
                <p className="text-base font-bold truncate flex-1 transition-colors duration-300"
                    style={{ color: isDark ? "#ffffff" : "#111827" }}>
                    {photo.description || "Sin descripción"}
                </p>
                {/* Fechas a la derecha: workdate grande + captureDate debajo */}
                <div className="flex flex-col items-end flex-shrink-0 ml-2">
                    <div className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" style={{ color: isDark ? "#ffffff" : "#111827" }} />
                        <span className="text-base font-bold" style={{ color: isDark ? "#ffffff" : "#111827" }}>
                            {formatDate(photo.workdate)}
                        </span>
                    </div>
                    {photo.captureDate && (
                        <span className="text-[10px] font-medium" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#9ca3af" }}>
                            Capturada: {formatDate(photo.captureDate)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    </div>
    )
}

// ── Página principal ──────────────────────────────────────────────────────
export const HRWorkPhotosPage = () => {
    const { isDark } = useIsDark()
    const dispatch = useDispatch()
    const { toast } = useToast()
    const [searchParams] = useSearchParams()
    const { photos, isLoading } = useSelector(s => s.HRWorkPhotoReducer)
    const employees = useSelector(s => s.HREmployeesPageReducer.data) || []
    const departments = useSelector(s => s.HRDepartmentPageReducer.data) || []

    const [previewPhoto, setPreviewPhoto] = useState(null)
    const [filters, setFilters] = useState(() => {
        // Fase 6 (R3): query params ?startDate=&endDate= desde los chips del reporte.
        // El filtro UI es por día (date); usamos startDate como día inicial.
        const start = searchParams.get("startDate")
        const day = start ? String(start).slice(0, 10) : ""
        return { department: "all", employee: "all", date: day }
    })

    useEffect(() => {
        // Fase 6 (R3): fetch server-side filtrado por rango (contrato Fase 2:
        // startDate/endDate en WorkPhoto.controller.js getAll).
        const from = searchParams.get("startDate")
        const to = searchParams.get("endDate")
        const params = from || to ? { startDate: from || undefined, endDate: to || undefined } : {}
        dispatch(HandleHRWorkPhoto({ type: "GetAll", data: { params } }))
        dispatch(HandleGetHREmployees({ apiroute: "GETALL" }))
        dispatch(HandleGetHRDepartments({ apiroute: "GETALL" }))
    }, [dispatch, searchParams])

    const handleDelete = async (photoID) => {
        const res = await dispatch(HandleHRWorkPhoto({ type: "Delete", data: { photoID } }))
        if (res.payload?.success) {
            toast({ variant: "success", title: "Foto eliminada" })
            setPreviewPhoto(null)
        } else {
            toast({ variant: "destructive", title: "Error", description: res.payload?.message })
        }
    }

    const handleReview = async (photoID) => {
        const res = await dispatch(HandleHRWorkPhoto({ type: "Review", data: { photoID } }))
        if (res.payload?.success) {
            toast({ variant: "success", title: "Foto marcada como revisada" })
            if (previewPhoto?._id === photoID) {
                setPreviewPhoto(res.payload.data)
            }
        } else {
            toast({ variant: "destructive", title: "Error", description: res.payload?.message })
        }
    }

    const resetFilters = () => setFilters({ department: "all", employee: "all", date: "" })

    // Empleados filtrados por departamento seleccionado
    const filteredEmployeeOptions = useMemo(() => {
        if (filters.department === "all") return employees
        return employees.filter(e =>
            e.department === filters.department ||
            e.department?._id === filters.department
        )
    }, [employees, filters.department])

    // Fotos filtradas
    const filteredPhotos = useMemo(() => {
        if (!photos) return []
        return photos.filter(photo => {
            const emp = photo.employee

            // Filtro por departamento
            if (filters.department !== "all") {
                const empDept = emp?.department?._id || emp?.department
                if (empDept !== filters.department) return false
            }

            // Filtro por empleado
            if (filters.employee !== "all") {
                const empID = emp?._id || emp
                if (empID !== filters.employee) return false
            }

            // Filtro por fecha (usar timezone del browser)
            if (filters.date) {
                const date = new Date(photo.workdate)
                const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
                const photoDateStr = date.toLocaleDateString("en-CA", { timeZone: userTimezone })
                if (photoDateStr !== filters.date) return false
            }

            return true
        })
    }, [photos, filters])

    const hasActiveFilters = filters.department !== "all" || filters.employee !== "all" || filters.date

    if (isLoading && (!photos || photos.length === 0)) return <Loading />

    return (
        <div className="flex flex-col w-full px-4 py-6 gap-6 overflow-y-auto
            bg-white dark:bg-[#0f0f1a] min-h-full">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-1
                        text-blue-500 dark:text-blue-400">
                        Gestión de personal
                    </p>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl xl:text-3xl font-bold tracking-tight
                            text-gray-900 dark:text-white">
                            Fotos de Trabajo
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold
                            bg-blue-50 text-blue-600 border border-blue-100
                            dark:bg-[rgba(99,102,241,0.12)] dark:text-blue-300
                            dark:border-[rgba(99,102,241,0.2)]">
                            {filteredPhotos.length} foto{filteredPhotos.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>
            </div>

            <div className="h-px w-full transition-colors duration-300" style={{ background: isDark ? "rgba(99,102,241,0.08)" : "#f3f4f6" }} />

            {/* Filtros */}
            <div className="rounded-2xl p-4 flex flex-col sm:flex-row gap-3 transition-colors duration-300"
                style={{
                    background: isDark ? "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(255,255,255,0.02) 100%)" : "linear-gradient(135deg, #e0e7ff 0%, #ffffff 60%)",
                    border: isDark ? "1px solid rgba(99,102,241,0.25)" : "1px solid #a5b4fc"
                }}>

                <div className="flex items-center gap-2 flex-shrink-0">
                    <Filter className="w-4 h-4 transition-colors duration-300" style={{ color: isDark ? "#003DA5" : "#4f46e5" }} />
                    <span className="text-xs font-semibold uppercase tracking-wider transition-colors duration-300"
                        style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                        Filtros
                    </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                    {/* Departamento */}
                    <div className="flex items-center gap-2 flex-1">
                        <Building2 className="w-4 h-4 flex-shrink-0 transition-colors duration-300" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#9ca3af" }} />
                        <CustomSelect
                            value={filters.department}
                            onValueChange={(val) => setFilters(p => ({ ...p, department: val, employee: "all" }))}
                            options={[
                                { value: "all", label: "Todos los departamentos" },
                                ...departments.map(dept => ({ value: dept._id, label: dept.name }))
                            ]}
                            accentColor="blue"
                            className="flex-1"
                        />
                    </div>

                    {/* Empleado */}
                    <div className="flex items-center gap-2 flex-1">
                        <Users className="w-4 h-4 flex-shrink-0 transition-colors duration-300" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#9ca3af" }} />
                        <CustomSelect
                            value={filters.employee}
                            onValueChange={(val) => setFilters(p => ({ ...p, employee: val }))}
                            options={[
                                { value: "all", label: "Todos los empleados" },
                                ...filteredEmployeeOptions.map(emp => ({
                                    value: emp._id,
                                    label: `${emp.firstname} ${emp.lastname}`
                                }))
                            ]}
                            accentColor="blue"
                            className="flex-1"
                        />
                    </div>

                    {/* Fecha */}
                    <div className="flex items-center gap-2 flex-1">
                        <CalendarDays className="w-4 h-4 flex-shrink-0 transition-colors duration-300" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#9ca3af" }} />
                        <input
                            type="date"
                            value={filters.date}
                            onChange={e => setFilters(p => ({ ...p, date: e.target.value }))}
                            className="input-field flex-1"
                        />
                    </div>

                    {/* Reset */}
                    {hasActiveFilters && (
                        <button
                            onClick={resetFilters}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold
                                border transition-colors duration-200 flex-shrink-0"
                            style={{
                                color: isDark ? "#9ca3af" : "#6b7280",
                                borderColor: isDark ? "rgba(255,255,255,0.08)" : "#d1d5db",
                                backgroundColor: isDark ? "transparent" : "#f9fafb"
                            }}
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Limpiar
                        </button>
                    )}
                </div>
            </div>

            {/* Galería */}
            {filteredPhotos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-300"
                        style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#f3f4f6" }}>
                        <ImageIcon className="w-7 h-7 transition-colors duration-300" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#9ca3af" }} />
                    </div>
                    <p className="text-base font-semibold transition-colors duration-300"
                        style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                        {hasActiveFilters ? "Sin resultados para los filtros aplicados" : "Sin fotos subidas aún"}
                    </p>
                    {hasActiveFilters && (
                        <button onClick={resetFilters}
                            className="text-sm font-medium transition-colors"
                            style={{ color: isDark ? "#818cf8" : "#003DA5" }}>
                            Limpiar filtros
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredPhotos.map(photo => (
                        <PhotoCard
                            key={photo._id}
                            photo={photo}
                            onPreview={setPreviewPhoto}
                            onDelete={handleDelete}
                            onReview={handleReview}
                        />
                    ))}
                </div>
            )}

            {/* Modal (reutilizado) */}
            <WorkPhotoModal
                open={!!previewPhoto}
                data={previewPhoto}
                onClose={() => setPreviewPhoto(null)}
                renderActions={() => (
                    <>
                        {!previewPhoto?.reviewedby && (
                            <button
                                onClick={() => handleReview(previewPhoto._id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                                    bg-emerald-500/80 hover:bg-emerald-500 text-white transition-colors"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Marcar revisada
                            </button>
                        )}
                        <button
                            onClick={() => handleDelete(previewPhoto._id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                                bg-red-500/80 hover:bg-red-500 text-white transition-colors"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Eliminar
                        </button>
                    </>
                )}
            />
        </div>
    )
}
