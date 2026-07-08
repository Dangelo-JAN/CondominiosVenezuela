import { useEffect, useState, useMemo, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useIsDark } from "../../../hooks/useIsDark.js"
import { Loading } from "../../../components/common/loading.jsx"
import {
    HandleCreateBitacora,
    HandleUpdateBitacora,
    HandleGetMyBitacoras
} from "../../../redux/Thunks/HRBitacorasThunk.js"
import { FileText, Plus, Edit, Image as ImageIcon, Video, X, Clock, ExternalLink } from "lucide-react"

const MAX_IMAGES = 5
const MAX_VIDEOS = 3

export const EmployeeBitacorasPage = () => {
    const isDark = useIsDark()
    const dispatch = useDispatch()
    const { data: bitacoras, isLoading, success, message } = useSelector((state) => state.HRBitacorasReducer)

    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [selectedFiles, setSelectedFiles] = useState([])
    const [previews, setPreviews] = useState([])
    const [existingImages, setExistingImages] = useState([])
    const [selectedVideoFiles, setSelectedVideoFiles] = useState([])
    const [videoPreviews, setVideoPreviews] = useState([])
    const [existingVideos, setExistingVideos] = useState([])
    const [submitting, setSubmitting] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [viewingBitacora, setViewingBitacora] = useState(null)

    useEffect(() => {
        dispatch(HandleGetMyBitacoras())
    }, [dispatch])

    // Reset success message after timeout
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                // The success auto-resets on next action via reducer
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [success])

    const openCreateForm = () => {
        setEditingId(null)
        setTitle("")
        setContent("")
        setSelectedFiles([])
        setPreviews([])
        setExistingImages([])
        setSelectedVideoFiles([])
        setVideoPreviews([])
        setExistingVideos([])
        setShowForm(true)
    }

    const openEditForm = (bitacora) => {
        setEditingId(bitacora._id)
        setTitle(bitacora.title)
        setContent(bitacora.content)
        setSelectedFiles([])
        setPreviews([])
        setExistingImages(bitacora.images || [])
        setSelectedVideoFiles([])
        setVideoPreviews([])
        setExistingVideos(bitacora.videos || [])
        setShowForm(true)
    }

    const closeForm = () => {
        setShowForm(false)
        setEditingId(null)
        setTitle("")
        setContent("")
        setSelectedFiles([])
        setPreviews([])
        setExistingImages([])
        setSelectedVideoFiles([])
        setVideoPreviews([])
        setExistingVideos([])
        setIsUploading(false)
    }

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || [])
        const totalImages = (editingId ? existingImages.length : 0) + (selectedFiles.length + files.length)
        if (totalImages > MAX_IMAGES) {
            alert(`Máximo ${MAX_IMAGES} imágenes por bitácora`)
            return
        }
        setSelectedFiles(prev => [...prev, ...files].slice(0, MAX_IMAGES - (editingId ? existingImages.length : 0)))

        // Generate previews
        const newPreviews = files.map(file => URL.createObjectURL(file))
        setPreviews(prev => [...prev, ...newPreviews].slice(0, MAX_IMAGES - (editingId ? existingImages.length : 0)))
    }

    const handleVideoFileChange = (e) => {
        const files = Array.from(e.target.files || [])
        const totalVideos = (editingId ? existingVideos.length : 0) + (selectedVideoFiles.length + files.length)
        if (totalVideos > MAX_VIDEOS) {
            alert(`Máximo ${MAX_VIDEOS} videos por bitácora`)
            return
        }
        setSelectedVideoFiles(prev => [...prev, ...files].slice(0, MAX_VIDEOS - (editingId ? existingVideos.length : 0)))

        // Generate video previews (URLs for playback)
        const newPreviews = files.map(file => URL.createObjectURL(file))
        setVideoPreviews(prev => [...prev, ...newPreviews].slice(0, MAX_VIDEOS - (editingId ? existingVideos.length : 0)))
    }

    const removeNewImage = (index) => {
        URL.revokeObjectURL(previews[index])
        setSelectedFiles(prev => prev.filter((_, i) => i !== index))
        setPreviews(prev => prev.filter((_, i) => i !== index))
    }

    const removeExistingImage = (index) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index))
    }

    const removeNewVideo = (index) => {
        URL.revokeObjectURL(videoPreviews[index])
        setSelectedVideoFiles(prev => prev.filter((_, i) => i !== index))
        setVideoPreviews(prev => prev.filter((_, i) => i !== index))
    }

    const removeExistingVideo = (index) => {
        setExistingVideos(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!title.trim() || !content.trim()) return

        setSubmitting(true)
        setIsUploading(true)
        try {
            const formData = new FormData()
            formData.append("title", title.trim())
            formData.append("content", content.trim())

            // Add existing images that should be kept (for edit mode)
            if (editingId) {
                formData.append("keepImages", JSON.stringify(existingImages))
            }

            // Add new image files
            selectedFiles.forEach(file => {
                formData.append("images", file)
            })

            // Add existing videos that should be kept (for edit mode)
            if (editingId) {
                formData.append("keepVideos", JSON.stringify(existingVideos))
            }

            // Add new video files
            selectedVideoFiles.forEach(file => {
                formData.append("videos", file)
            })

            if (editingId) {
                await dispatch(HandleUpdateBitacora({ id: editingId, formData }))
            } else {
                await dispatch(HandleCreateBitacora(formData))
            }
            dispatch(HandleGetMyBitacoras())
            closeForm()
        } catch (err) {
            console.error("Error submitting bitacora:", err)
        } finally {
            setSubmitting(false)
            setIsUploading(false)
        }
    }

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

    // Input styles matching the employee page pattern
    const inputCls = `w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200
        bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
        focus:border-yellow-400 focus:bg-white focus:ring-2 focus:ring-yellow-100
        dark:bg-[rgba(255,255,255,0.05)] dark:border-[rgba(255,255,255,0.12)] dark:text-white dark:placeholder-[rgba(255,255,255,0.4)]
        dark:focus:border-[rgba(252,227,0,0.5)] dark:focus:bg-[rgba(252,227,0,0.06)]`

    const labelStyle = {
        color: isDark ? "rgba(255,255,255,0.6)" : "#6b7280",
        fontSize: "10px",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.08em"
    }

    if (isLoading && !bitacoras) {
        return <Loading />
    }

    const myBitacoras = bitacoras || []

    return (
        <div className="w-full h-full flex flex-col gap-6 px-4 py-6 overflow-y-auto bg-white dark:bg-[#0f0f1a]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                        style={{ color: isDark ? "#facc15" : "#ca8a04" }}>
                        Mis Novedades
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
                            {myBitacoras.length} total
                        </span>
                    </div>
                </div>
                <button
                    onClick={openCreateForm}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 text-white"
                    style={{ background: "#ca8a04" }}
                >
                    <Plus className="w-4 h-4" />
                    Nueva Bitácora
                </button>
            </div>

            {/* Divider */}
            <div className="h-px w-full transition-colors duration-300"
                style={{ background: isDark ? "rgba(252,227,0,0.08)" : "#fef9c3" }} />

            {/* Success Message */}
            {success && message && (
                <div className="px-4 py-3 rounded-xl text-sm font-medium
                    bg-green-50 border border-green-200 text-green-700
                    dark:bg-[rgba(16,185,129,0.1)] dark:border-[rgba(16,185,129,0.2)] dark:text-green-400">
                    {message}
                </div>
            )}

            {/* Bitacoras List */}
            <div className="flex flex-col gap-3 flex-1 overflow-auto">
                {myBitacoras.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-300"
                            style={{ background: isDark ? "rgba(252,227,0,0.1)" : "#fef9c3" }}>
                            <FileText className="w-6 h-6 transition-colors duration-300"
                                style={{ color: isDark ? "#facc15" : "#ca8a04" }} />
                        </div>
                        <p className="text-sm font-medium transition-colors duration-300"
                            style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#9ca3af" }}>
                            No has creado bitácoras aún
                        </p>
                        <button
                            onClick={openCreateForm}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 text-white"
                            style={{ background: "#ca8a04" }}
                        >
                            <Plus className="w-4 h-4" />
                            Crear primera bitácora
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {myBitacoras.map((bitacora) => (
                            <div
                                key={bitacora._id}
                                className="rounded-2xl p-4 transition-all duration-200 hover:-translate-y-1 border cursor-pointer
                                    bg-white border-gray-200 hover:shadow-md hover:border-yellow-200
                                    dark:bg-[rgba(255,255,255,0.02)] dark:border-[rgba(252,227,0,0.1)]
                                    dark:hover:bg-[rgba(252,227,0,0.04)] dark:hover:border-[rgba(252,227,0,0.25)]"
                                onClick={() => setViewingBitacora(bitacora)}
                            >
                                {/* Card header */}
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2">
                                        {bitacora.title}
                                    </h3>
                                    <div className="flex gap-1 shrink-0">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); openEditForm(bitacora) }}
                                            className="p-1.5 rounded-lg transition-all duration-200 hover:-translate-y-0.5"
                                            style={{
                                                background: isDark ? "rgba(252,227,0,0.1)" : "#fef9c3",
                                                color: isDark ? "#facc15" : "#ca8a04"
                                            }}
                                            title="Editar"
                                        >
                                            <Edit className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Content preview */}
                                <p className="text-xs leading-relaxed line-clamp-3 mb-3"
                                    style={{ color: isDark ? "rgba(255,255,255,0.55)" : "#6b7280" }}>
                                    {bitacora.content}
                                </p>

                                {/* Footer: date + images count + videos count */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3 h-3"
                                            style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#9ca3af" }} />
                                        <p className="text-xs"
                                            style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#9ca3af" }}>
                                            {formatDate(bitacora.createdAt)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {bitacora.images?.length > 0 && (
                                            <div className="flex items-center gap-1">
                                                <ImageIcon className="w-3 h-3"
                                                    style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#9ca3af" }} />
                                                <p className="text-xs"
                                                    style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#9ca3af" }}>
                                                    {bitacora.images.length}
                                                </p>
                                            </div>
                                        )}
                                        {bitacora.videos?.length > 0 && (
                                            <div className="flex items-center gap-1">
                                                <Video className="w-3 h-3"
                                                    style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#9ca3af" }} />
                                                <p className="text-xs"
                                                    style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#9ca3af" }}>
                                                    {bitacora.videos.length}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Create/Edit Modal ── */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                    onClick={closeForm}>
                    <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col
                        bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-[rgba(252,227,0,0.15)]"
                        onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b
                            border-gray-100 dark:border-[rgba(252,227,0,0.1)]">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                {editingId ? "Editar Bitácora" : "Nueva Bitácora"}
                            </h2>
                            <button onClick={closeForm}
                                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form id="bitacora-form" onSubmit={handleSubmit}
                            className="px-6 py-4 space-y-5 overflow-y-auto flex-1">
                            {/* Title */}
                            <div className="flex flex-col gap-1.5">
                                <label style={labelStyle}>Título</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="¿Qué título tiene tu novedad?"
                                    required
                                    className={inputCls}
                                />
                            </div>

                            {/* Content */}
                            <div className="flex flex-col gap-1.5">
                                <label style={labelStyle}>Contenido</label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Escribe tu novedad aquí..."
                                    required
                                    rows={6}
                                    className={`${inputCls} resize-none min-h-[120px]`}
                                />
                            </div>

                            {/* Images */}
                            <div className="flex flex-col gap-1.5">
                                <label style={labelStyle}>
                                    Imágenes ({editingId ? existingImages.length : 0 + selectedFiles.length}/{MAX_IMAGES})
                                </label>

                                {/* Existing images (edit mode) */}
                                {editingId && existingImages.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {existingImages.map((url, i) => (
                                            <div key={`exist-${i}`} className="relative group">
                                                <img src={url} alt={`Imagen ${i + 1}`}
                                                    className="w-20 h-20 rounded-xl object-cover border border-gray-200 dark:border-[rgba(255,255,255,0.1)]" />
                                                <button type="button" onClick={() => removeExistingImage(i)}
                                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white
                                                        flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* New file previews */}
                                {previews.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {previews.map((preview, i) => (
                                            <div key={`new-${i}`} className="relative group">
                                                <img src={preview} alt={`Preview ${i + 1}`}
                                                    className="w-20 h-20 rounded-xl object-cover border border-gray-200 dark:border-[rgba(255,255,255,0.1)]" />
                                                <button type="button" onClick={() => removeNewImage(i)}
                                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white
                                                        flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Upload button */}
                                {(editingId ? existingImages.length : 0) + selectedFiles.length < MAX_IMAGES && (
                                    <label className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                                        cursor-pointer transition-all duration-200 hover:-translate-y-0.5
                                        bg-gray-100 text-gray-700 hover:bg-gray-200
                                        dark:bg-[rgba(255,255,255,0.05)] dark:text-gray-300 dark:hover:bg-[rgba(255,255,255,0.1)]`}>
                                        <ImageIcon className="w-4 h-4" />
                                        Agregar imágenes
                                        <input type="file" multiple accept="image/*" onChange={handleFileChange}
                                            className="hidden" />
                                    </label>
                                )}
                                <p className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#9ca3af" }}>
                                    Formatos: JPG, PNG, WEBP. Máximo 10MB c/u.
                                </p>
                            </div>

                            {/* Videos */}
                            <div className="flex flex-col gap-1.5">
                                <label style={labelStyle}>
                                    Videos ({editingId ? existingVideos.length : 0 + selectedVideoFiles.length}/{MAX_VIDEOS})
                                </label>

                                {/* Existing videos (edit mode) */}
                                {editingId && existingVideos.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {existingVideos.map((url, i) => (
                                            <div key={`exist-vid-${i}`} className="relative group">
                                                <video src={url} muted preload="metadata"
                                                    className="w-20 h-20 rounded-xl object-cover border border-gray-200 dark:border-[rgba(255,255,255,0.1)] bg-black" />
                                                <button type="button" onClick={() => removeExistingVideo(i)}
                                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white
                                                        flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* New video previews */}
                                {videoPreviews.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {videoPreviews.map((preview, i) => (
                                            <div key={`new-vid-${i}`} className="relative group">
                                                <video src={preview} muted preload="metadata"
                                                    className="w-20 h-20 rounded-xl object-cover border border-gray-200 dark:border-[rgba(255,255,255,0.1)] bg-black" />
                                                <button type="button" onClick={() => removeNewVideo(i)}
                                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white
                                                        flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Upload button */}
                                {(editingId ? existingVideos.length : 0) + selectedVideoFiles.length < MAX_VIDEOS && (
                                    <label className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                                        cursor-pointer transition-all duration-200 hover:-translate-y-0.5
                                        bg-gray-100 text-gray-700 hover:bg-gray-200
                                        dark:bg-[rgba(255,255,255,0.05)] dark:text-gray-300 dark:hover:bg-[rgba(255,255,255,0.1)]`}>
                                        <Video className="w-4 h-4" />
                                        Agregar videos
                                        <input type="file" multiple accept="video/*" onChange={handleVideoFileChange}
                                            className="hidden" />
                                    </label>
                                )}
                                <p className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#9ca3af" }}>
                                    Formatos: MP4, WebM, MOV. Máximo 50MB c/u.
                                </p>
                            </div>
                        </form>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t
                            border-gray-100 dark:border-[rgba(252,227,0,0.1)]">
                            <button type="button" onClick={closeForm}
                                className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                                    bg-gray-100 text-gray-700 hover:bg-gray-200
                                    dark:bg-[rgba(255,255,255,0.05)] dark:text-gray-300 dark:hover:bg-[rgba(255,255,255,0.1)]">
                                Cancelar
                            </button>
                            <button type="submit" form="bitacora-form"
                                disabled={submitting || isUploading || !title.trim() || !content.trim()}
                                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5
                                    text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:-translate-y-0"
                                style={{ background: "#ca8a04" }}>
                                {isUploading ? "Subiendo..." : submitting ? "Guardando..." : editingId ? "Actualizar" : "Publicar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── View Detail Modal ── */}
            {viewingBitacora && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                    onClick={() => setViewingBitacora(null)}>
                    <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col
                        bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-[rgba(252,227,0,0.15)]"
                        onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b
                            border-gray-100 dark:border-[rgba(252,227,0,0.1)]">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                {viewingBitacora.title}
                            </h2>
                            <button onClick={() => setViewingBitacora(null)}
                                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
                            <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5"
                                    style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }} />
                                <p className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#6b7280" }}>
                                    {formatDate(viewingBitacora.createdAt)}
                                    {viewingBitacora.updatedAt !== viewingBitacora.createdAt && " (editado)"}
                                </p>
                            </div>

                            <div className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-[rgba(255,255,255,0.8)]">
                                {viewingBitacora.content}
                            </div>

                            {/* Images */}
                            {viewingBitacora.images?.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4"
                                            style={{ color: isDark ? "#facc15" : "#ca8a04" }} />
                                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[rgba(255,255,255,0.4)]">
                                            {viewingBitacora.images.length} imagen(es)
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {viewingBitacora.images.map((url, i) => (
                                            <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                                                className="block rounded-xl overflow-hidden border border-gray-200 dark:border-[rgba(255,255,255,0.1)]
                                                    hover:opacity-90 transition-opacity group relative">
                                                <img src={url} alt={`Imagen ${i + 1}`}
                                                    className="w-full h-32 object-cover" />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all">
                                                    <ExternalLink className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Videos */}
                            {viewingBitacora.videos?.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Video className="w-4 h-4"
                                            style={{ color: isDark ? "#facc15" : "#ca8a04" }} />
                                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[rgba(255,255,255,0.4)]">
                                            {viewingBitacora.videos.length} video(s)
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {viewingBitacora.videos.map((url, i) => (
                                            <video key={i} src={url} controls playsInline preload="metadata"
                                                className="w-full h-32 object-cover rounded-xl border border-gray-200 dark:border-[rgba(255,255,255,0.1)] bg-black" />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t
                            border-gray-100 dark:border-[rgba(252,227,0,0.1)]">
                            <button onClick={() => { setViewingBitacora(null); openEditForm(viewingBitacora) }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
                                style={{
                                    background: isDark ? "rgba(252,227,0,0.12)" : "#fef9c3",
                                    color: isDark ? "#facc15" : "#ca8a04"
                                }}>
                                <Edit className="w-4 h-4" />
                                Editar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
