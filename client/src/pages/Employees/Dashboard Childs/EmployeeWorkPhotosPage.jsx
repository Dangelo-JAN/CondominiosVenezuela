import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { HandleEmployeeDashboard } from "../../../redux/Thunks/EmployeeDashboardThunk.js"
import { Loading } from "../../../components/common/loading.jsx"
import { useToast } from "@/hooks/use-toast"
import {
    Camera, Upload, Trash2, X, ImageIcon,
    CalendarDays, AlertCircle, Eye, CheckCircle2
} from "lucide-react"
import { useIsDark } from "../../../hooks/useIsDark.js"

const formatDate = (dateStr) => {
    if (!dateStr) return ""
    return new Date(dateStr).toLocaleDateString("es-ES", {
        day: "numeric", month: "short", year: "numeric"
    })
}

const formatTime = (dateStr) => {
    if (!dateStr) return ""
    return new Date(dateStr).toLocaleTimeString("es-ES", {
        hour: "2-digit", minute: "2-digit"
    })
}

// ── Modal de vista previa ─────────────────────────────────────────────────
const PhotoModal = ({ photo, onClose }) => {
    if (!photo) return null
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.85)" }}
            onClick={onClose}
        >
            <div
                className="relative max-w-3xl w-full rounded-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <img
                    src={photo.photourl}
                    alt={photo.description || "Foto de trabajo"}
                    className="w-full object-contain max-h-[75vh]"
                />
                <div className="absolute top-3 right-3">
                    <button
                        onClick={onClose}
                        className="flex items-center justify-center w-8 h-8 rounded-full
                            bg-black/50 hover:bg-black/70 transition-colors duration-150"
                    >
                        <X className="w-4 h-4 text-white" />
                    </button>
                </div>
                {(photo.description || photo.workdate) && (
                    <div className="absolute bottom-0 left-0 right-0 px-4 py-3"
                        style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.7) 0%, transparent 100%)" }}>
                        {photo.description && (
                            <p className="text-sm text-white font-medium">{photo.description}</p>
                        )}
                        {photo.workdate && (
                            <p className="text-xs text-white/60 mt-0.5">{formatDate(photo.workdate)}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

// ── Card de foto ──────────────────────────────────────────────────────────
const PhotoCard = ({ photo, onDelete, onPreview }) => {
    const isDark = useIsDark()

    return (
    <div className="group relative rounded-2xl overflow-hidden transition-all duration-300"
        style={{
            background: isDark ? "linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(255,255,255,0.02) 100%)" : "linear-gradient(135deg, #e0e7ff 0%, #ffffff 60%)",
            border: isDark ? "1px solid rgba(99,102,241,0.40)" : "1px solid #a5b4fc"
        }}>

        {/* Imagen */}
        <div className="relative aspect-video overflow-hidden transition-colors duration-300"
            style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#f3f4f6" }}>
            <img
                src={photo.photourl}
                alt={photo.description || "Foto de trabajo"}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Overlay con acciones */}
            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0
                group-hover:opacity-100 transition-opacity duration-200"
                style={{ background: "rgba(0,0,0,0.45)" }}>
                <button
                    onClick={() => onPreview(photo)}
                    className="flex items-center justify-center w-9 h-9 rounded-xl
                        bg-white/20 hover:bg-white/30 transition-colors duration-150 backdrop-blur-sm"
                >
                    <Eye className="w-4 h-4 text-white" />
                </button>
                <button
                    onClick={() => onDelete(photo._id)}
                    className="flex items-center justify-center w-9 h-9 rounded-xl
                        bg-red-500/70 hover:bg-red-500/90 transition-colors duration-150 backdrop-blur-sm"
                >
                    <Trash2 className="w-4 h-4 text-white" />
                </button>
            </div>

            {/* Badge revisado */}
            {photo.reviewedby && (
                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full
                    bg-emerald-500/80 backdrop-blur-sm">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                    <span className="text-[10px] font-semibold text-white">Revisado</span>
                </div>
            )}
        </div>

        {/* Info */}
        <div className="px-3 py-2.5 flex items-center justify-between gap-2">
            <p className="text-xs font-medium truncate flex-1 transition-colors duration-300"
                style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                {photo.description || "Sin descripción"}
            </p>
            <div className="flex items-center gap-1 flex-shrink-0">
                <CalendarDays className="w-3 h-3 transition-colors duration-300" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#9ca3af" }} />
                <span className="text-[11px] transition-colors duration-300" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#9ca3af" }}>
                    {formatDate(photo.workdate)}
                </span>
            </div>
        </div>
    </div>
    )
}

// ── Componente principal ──────────────────────────────────────────────────
export const EmployeeWorkPhotosPage = () => {
    const isDark = useIsDark()
    const dispatch = useDispatch()
    const { toast } = useToast()
    const { photos, isLoading } = useSelector(s => s.employeedashboardreducer)

    const fileInputRef = useRef(null)
    const [previewPhoto, setPreviewPhoto] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [form, setForm] = useState({ description: "", workdate: "", previewUrl: "", file: null })
    const [showUploadPanel, setShowUploadPanel] = useState(false)

    useEffect(() => {
        dispatch(HandleEmployeeDashboard({ type: "MyPhotos" }))
    }, [])

    // Convertir archivo a base64
    const toBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
    })

    const handleFileChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (!file.type.startsWith("image/")) {
            toast({ variant: "destructive", title: "Archivo inválido", description: "Solo se permiten imágenes" })
            return
        }
        if (file.size > 10 * 1024 * 1024) {
            toast({ variant: "destructive", title: "Archivo muy grande", description: "El tamaño máximo es 10MB" })
            return
        }
        const base64 = await toBase64(file)
        setForm(p => ({ ...p, file, previewUrl: base64 }))
        setShowUploadPanel(true)
    }

    const handleUpload = async () => {
        if (!form.file || !form.workdate) {
            toast({ variant: "destructive", title: "Campos requeridos", description: "Selecciona una imagen y la fecha del trabajo" })
            return
        }
        setUploading(true)
        const base64 = await toBase64(form.file)
        const res = await dispatch(HandleEmployeeDashboard({
            type: "UploadPhoto",
            data: { photo: base64, description: form.description, workdate: form.workdate }
        }))
        setUploading(false)
        if (res.payload?.success) {
            toast({ variant: "success", title: "Foto subida", description: "Tu foto fue guardada exitosamente" })
            setForm({ description: "", workdate: "", previewUrl: "", file: null })
            setShowUploadPanel(false)
            if (fileInputRef.current) fileInputRef.current.value = ""
        } else {
            toast({ variant: "destructive", title: "Error al subir", description: res.payload?.message })
        }
    }

    const handleDelete = async (photoID) => {
        const res = await dispatch(HandleEmployeeDashboard({
            type: "DeletePhoto",
            data: { photoID }
        }))
        if (res.payload?.success) {
            toast({ variant: "success", title: "Foto eliminada" })
        } else {
            toast({ variant: "destructive", title: "Error", description: res.payload?.message })
        }
    }

    const handleCancelUpload = () => {
        setForm({ description: "", workdate: "", previewUrl: "", file: null })
        setShowUploadPanel(false)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    if (isLoading && (!photos || photos.length === 0)) return <Loading />

    return (
        <div className="flex flex-col w-full px-4 py-6 gap-6 overflow-y-auto
            bg-white dark:bg-[#0f0f1a] min-h-full">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-1
                        text-blue-500 dark:text-blue-400">
                        Mis Fotos
                    </p>
                    <h1 className="text-2xl xl:text-3xl font-bold tracking-tight
                        text-gray-900 dark:text-white">
                        Fotos de Trabajo
                    </h1>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                        Sube fotos de las labores realizadas durante tu jornada
                    </p>
                </div>

                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl self-start sm:self-auto
                        text-sm font-semibold text-white transition-all duration-200
                        hover:opacity-90 active:scale-95"
                    style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                >
                    <Camera className="w-4 h-4" />
                    Subir foto
                </button>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>

            {/* Panel de subida */}
            {showUploadPanel && (
                <div className="rounded-2xl p-5 flex flex-col sm:flex-row gap-4 transition-colors duration-300"
                    style={{
                        background: isDark ? "linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(255,255,255,0.02) 100%)" : "linear-gradient(135deg, #e0e7ff 0%, #ffffff 60%)",
                        border: isDark ? "1px solid rgba(99,102,241,0.40)" : "1px solid #a5b4fc"
                    }}>

                    {/* Preview */}
                    <div className="w-full sm:w-48 h-40 rounded-xl overflow-hidden flex-shrink-0 transition-colors duration-300"
                        style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#f3f4f6" }}>
                        {form.previewUrl ? (
                            <img src={form.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                            </div>
                        )}
                    </div>

                    {/* Formulario */}
                    <div className="flex flex-col gap-3 flex-1">
                        <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-semibold uppercase tracking-wider
                                text-gray-400 dark:text-gray-500">
                                Descripción (opcional)
                            </label>
                            <input
                                type="text"
                                placeholder="Ej: Limpieza del área común..."
                                value={form.description}
                                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                className="px-3 py-2 rounded-xl text-sm outline-none transition-colors duration-150
                                    bg-white border border-gray-200 text-gray-900 placeholder-gray-300
                                    focus:border-blue-300 focus:ring-2 focus:ring-blue-100
                                    dark:bg-[rgba(255,255,255,0.05)] dark:border-[rgba(255,255,255,0.08)]
                                    dark:text-white dark:placeholder-[rgba(255,255,255,0.2)]
                                    dark:focus:border-[rgba(99,102,241,0.4)] dark:focus:ring-[rgba(99,102,241,0.1)]"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-semibold uppercase tracking-wider
                                text-gray-400 dark:text-gray-500">
                                Fecha del trabajo *
                            </label>
                            <input
                                type="date"
                                value={form.workdate}
                                max={new Date().toISOString().split("T")[0]}
                                onChange={e => setForm(p => ({ ...p, workdate: e.target.value }))}
                                className="px-3 py-2 rounded-xl text-sm outline-none transition-colors duration-150
                                    bg-white border border-gray-200 text-gray-900
                                    focus:border-blue-300 focus:ring-2 focus:ring-blue-100
                                    dark:bg-[rgba(255,255,255,0.05)] dark:border-[rgba(255,255,255,0.08)]
                                    dark:text-white dark:focus:border-[rgba(99,102,241,0.4)]
                                    dark:focus:ring-[rgba(99,102,241,0.1)]"
                            />
                        </div>

                        <div className="flex gap-2 mt-auto">
                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                                    text-white transition-all duration-200 disabled:opacity-50
                                    disabled:cursor-not-allowed"
                                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                            >
                                <Upload className="w-4 h-4" />
                                {uploading ? "Subiendo..." : "Confirmar"}
                            </button>
                            <button
                                onClick={handleCancelUpload}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                                    border transition-all duration-200
                                    text-gray-500 border-gray-200 hover:bg-gray-100
                                    dark:text-gray-400 dark:border-[rgba(255,255,255,0.08)]
                                    dark:hover:bg-[rgba(255,255,255,0.05)]"
                            >
                                <X className="w-4 h-4" />
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Galería */}
            {!photos || photos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-300"
                        style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#f3f4f6" }}>
                        <ImageIcon className="w-7 h-7 text-gray-300 dark:text-gray-600" />
                    </div>
                    <p className="text-base font-semibold text-gray-400 dark:text-gray-500">
                        Sin fotos subidas aún
                    </p>
                    <p className="text-sm text-gray-300 dark:text-gray-700 text-center max-w-xs">
                        Sube fotos de tus labores para que tu supervisor pueda verlas
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {photos.map(photo => (
                        <PhotoCard
                            key={photo._id}
                            photo={photo}
                            onDelete={handleDelete}
                            onPreview={setPreviewPhoto}
                        />
                    ))}
                </div>
            )}

            {/* Modal de preview */}
            <PhotoModal photo={previewPhoto} onClose={() => setPreviewPhoto(null)} />
        </div>
    )
}
