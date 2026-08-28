import { useIsDark } from "../../../hooks/useIsDark.js"
import { X, Image as ImageIcon, Video, ExternalLink, CheckCircle2 } from "lucide-react"
import { YELLOW } from "./ReportComponents.jsx"

/**
 * ReportActivityModals — Modales presentacionales reutilizables (R3).
 *
 * Componentes "tontos": NO hacen fetch ni lógica de negocio; solo reciben
 * `{ open, data, onClose }` y renderizan. Reutilizados entre las páginas de
 * reportes (HR/Empleado) y las páginas de detalle (bitácoras / fotos).
 *
 * Convención:
 *   open   → controla si se muestra (cuando `open && data`)
 *   data   → objeto con el contenido a mostrar
 *   onClose→ callback al cerrar
 */

const formatDate = (dateStr) => {
    if (!dateStr) return ""
    return new Date(dateStr).toLocaleDateString("es-ES", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    })
}

// ── Detalle de una Bitácora ────────────────────────────────────────────────
// Uso: <BitacoraDetailModal open={!!data} data={data} onClose={close} />
// `data`: { title, content, createdAt, updatedAt, employee:{firstname,lastname}, images:[], videos:[] }
// `renderFooter`: (opcional) función que devuelve el JSX del footer (p.ej. acciones de edición).
export const BitacoraDetailModal = ({ open, data, onClose, renderFooter }) => {
    const isDark = useIsDark()
    const y = YELLOW(isDark)
    if (!open || !data) return null

    const emp = data.employee || {}
    const authorName = [emp.firstname, emp.lastname].filter(Boolean).join(" ")
    const hasAuthor = !!authorName
    const initials = `${(emp.firstname || "")[0] || ""}${(emp.lastname || "")[0] || ""}`.toUpperCase() || "?"
    const isEdited = data.updatedAt && data.updatedAt !== data.createdAt

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={onClose}>
            <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col
                bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-[rgba(252,227,0,0.15)]"
                onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b
                    border-gray-100 dark:border-[rgba(252,227,0,0.1)]">
                    <div className="flex items-center gap-3 min-w-0">
                        {hasAuthor ? (
                            <>
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                                    style={{ background: y.bg, color: y.text }}>
                                    {initials}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                        {authorName}
                                    </p>
                                    <p className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#6b7280" }}>
                                        {formatDate(data.createdAt)}{isEdited ? " (editado)" : ""}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="min-w-0">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                                    {data.title}
                                </h2>
                                <p className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#6b7280" }}>
                                    {formatDate(data.createdAt)}{isEdited ? " (editado)" : ""}
                                </p>
                            </div>
                        )}
                    </div>
                    <button onClick={onClose}
                        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors flex-shrink-0">
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
                    {hasAuthor && (
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {data.title}
                        </h2>
                    )}
                    <div className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-[rgba(255,255,255,0.8)]">
                        {data.content}
                    </div>

                    {/* Images */}
                    {data.images?.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" style={{ color: y.text }} />
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[rgba(255,255,255,0.4)]">
                                    {data.images.length} imagen(es)
                                </p>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {data.images.map((url, i) => (
                                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                                        className="block rounded-xl overflow-hidden border border-gray-200 dark:border-[rgba(255,255,255,0.1)]
                                            hover:opacity-90 transition-opacity group relative">
                                        <img src={url} alt={`Imagen ${i + 1}`} className="w-full h-32 object-cover" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all">
                                            <ExternalLink className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Videos */}
                    {data.videos?.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Video className="w-4 h-4" style={{ color: y.text }} />
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[rgba(255,255,255,0.4)]">
                                    {data.videos.length} video(s)
                                </p>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {data.videos.map((url, i) => (
                                    <video key={i} src={url} controls playsInline preload="metadata"
                                        className="w-full h-32 object-cover rounded-xl border border-gray-200 dark:border-[rgba(255,255,255,0.1)] bg-black" />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer (opcional: acciones de la página) */}
                {renderFooter && (
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t
                        border-gray-100 dark:border-[rgba(252,227,0,0.1)]">
                        {renderFooter()}
                    </div>
                )}
            </div>
        </div>
    )
}

// ── Vista previa de una foto de trabajo ────────────────────────────────────
// Uso: <WorkPhotoModal open={!!data} data={data} onClose={close} />
// `data`: { photourl, description, workdate, captureDate, reviewedby, reviewedat,
//           employee:{firstname,lastname} }
// `renderActions`: (opcional) JSX de acciones contextuales (p.ej. review/delete HR).
// `showEmployee`: (opcional) mostrar nombre del empleado en la barra de info (default true).
export const WorkPhotoModal = ({ open, data, onClose, renderActions, showEmployee = true }) => {
    if (!open || !data) return null

    const emp = data.employee || {}
    const authorName = [emp.firstname, emp.lastname].filter(Boolean).join(" ")

    const formatLocal = (d, withTime = false) => {
        if (!d) return ""
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        return new Date(d).toLocaleDateString("es-ES", {
            timeZone: userTimezone,
            day: "numeric",
            month: "short",
            year: "numeric",
            ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {})
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.85)" }}
            onClick={onClose}>
            <div className="relative max-w-3xl w-full rounded-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}>

                <img
                    src={data.photourl}
                    alt={data.description || "Foto de trabajo"}
                    className="w-full object-contain max-h-[65vh]"
                />

                {/* Info bar */}
                <div className="px-5 py-4 flex items-center justify-between gap-4"
                    style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
                    <div className="flex flex-col gap-0.5 min-w-0">
                        {showEmployee && authorName && (
                            <p className="text-sm font-semibold text-white truncate">{authorName}</p>
                        )}
                        <p className="text-xs text-white/50">
                            {data.description || "Sin descripción"}
                        </p>
                        <p className="text-lg font-bold text-white mt-1">
                            {formatLocal(data.workdate)}
                        </p>
                        {data.captureDate && (
                            <p className="text-xs text-white/60">
                                Capturada: {formatLocal(data.captureDate)}
                            </p>
                        )}
                        {data.reviewedby && (
                            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5">
                                <CheckCircle2 className="w-3 h-3" />
                                Revisado el {formatLocal(data.reviewedat)}
                            </p>
                        )}
                    </div>
                    {renderActions && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {renderActions()}
                        </div>
                    )}
                </div>

                {/* Close button */}
                <button onClick={onClose}
                    className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-full
                        bg-black/50 hover:bg-black/70 transition-colors">
                    <X className="w-4 h-4 text-white" />
                </button>
            </div>
        </div>
    )
}
