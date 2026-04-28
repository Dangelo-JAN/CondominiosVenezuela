import * as Dialog from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { useIsDark } from "../../../hooks/useIsDark.js"

// ── Tokens de Accent según Design System v4 (Venezuela) ───────────────────
const ACCENT_TOKENS = {
    blue: {
        lightBg: "#dbeafe",
        lightBorder: "#93c5fd",
        darkBg: "rgba(0,61,165,0.15)",
        darkBorder: "rgba(0,61,165,0.35)",
        color: "#003DA5",
    },
    yellow: {
        lightBg: "#fef9c3",
        lightBorder: "#fde047",
        darkBg: "rgba(252,227,0,0.15)",
        darkBorder: "rgba(252,227,0,0.35)",
        color: "#FCE300",
    },
    emerald: {
        lightBg: "#d1fae5",
        lightBorder: "#6ee7b7",
        darkBg: "rgba(16,185,129,0.15)",
        darkBorder: "rgba(16,185,129,0.35)",
        color: "#10b981",
    },
    cyan: {
        lightBg: "#cffafe",
        lightBorder: "#67e8f9",
        darkBg: "rgba(6,182,212,0.15)",
        darkBorder: "rgba(6,182,212,0.35)",
        color: "#06b6d4",
    },
    purple: {
        lightBg: "#ede9fe",
        lightBorder: "#c4b5fd",
        darkBg: "rgba(139,92,246,0.15)",
        darkBorder: "rgba(139,92,246,0.35)",
        color: "#8b5cf6",
    },
}

/**
 * ThemedModal - Componente genérico de modal según Design System v2
 * 
 * @param {boolean} open - Estado de apertura (controlado)
 * @param {function} onOpenChange - Callback de cambio de estado
 * @param {string} title - Título del modal
 * @param {string} accent - Color de acento ("blue" | "yellow" | "emerald" | "cyan" | "purple")
 * @param {ReactNode} children - Contenido del modal
 * @param {string} maxWidth - Ancho máximo (default: "max-w-lg")
 * @param {boolean} showCloseButton - Mostrar botón de cierre (default: true)
 * @param {ReactNode} footer - Sección de acciones (footer)
 */
export const ThemedModal = ({
    open,
    onOpenChange,
    title,
    accent = "blue",
    children,
    maxWidth = "max-w-lg",
    showCloseButton = true,
    footer,
}) => {
    const isDark = useIsDark()
    const tokens = ACCENT_TOKENS[accent] || ACCENT_TOKENS.blue

    // Estilos dinámicos según el tema
    const contentStyle = {
        backgroundColor: isDark ? "#0f0f1a" : "#ffffff",
        borderColor: isDark ? tokens.darkBorder : tokens.lightBorder,
    }

    const overlayStyle = {
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    }

    const titleStyle = {
        color: isDark ? "#ffffff" : "#111827",
    }

    const closeButtonStyle = {
        color: isDark ? "rgba(255, 255, 255, 0.5)" : "#9ca3af",
    }

    const labelStyle = {
        color: isDark ? "rgba(255, 255, 255, 0.6)" : "#6b7280",
    }

    const inputStyle = {
        backgroundColor: isDark ? "rgba(255, 255, 255, 0.04)" : "#f9fafb",
        borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#e5e7eb",
        color: isDark ? "#ffffff" : "#374151",
    }

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay 
                    className="fixed inset-0 backdrop-blur-sm z-50"
                    style={overlayStyle}
                />
                <Dialog.Content
                    className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full ${maxWidth} p-6 rounded-2xl z-50 shadow-xl max-h-[90vh] overflow-y-auto border`}
                    style={contentStyle}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <Dialog.Title 
                            className="text-xl font-bold"
                            style={titleStyle}
                        >
                            {title}
                        </Dialog.Title>
                        
                        {showCloseButton && (
                            <Dialog.Close asChild>
                                <button 
                                    className="p-1.5 rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-[rgba(255,255,255,0.08)]"
                                    style={closeButtonStyle}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </Dialog.Close>
                        )}
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                        {children}
                    </div>

                    {/* Footer */}
                    {footer && (
                        <div className="mt-6 pt-4 border-t"
                            style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb" }}
                        >
                            {footer}
                        </div>
                    )}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}

// Exportar tokens para uso externo si es necesario
export { ACCENT_TOKENS }

// Exportar función helper para obtener estilos de inputs según accent
export const getInputStyles = (accent, isDark) => {
    const tokens = ACCENT_TOKENS[accent] || ACCENT_TOKENS.blue
    return {
        bg: isDark ? "rgba(255,255,255,0.04)" : "#f9fafb",
        border: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb",
        focusBorder: isDark ? tokens.darkBorder : tokens.lightBorder,
        color: isDark ? "#ffffff" : "#374151",
        placeholder: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af",
    }
}