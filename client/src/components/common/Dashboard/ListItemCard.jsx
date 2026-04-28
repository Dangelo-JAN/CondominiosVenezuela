import { useIsDark } from "../../../hooks/useIsDark.js"
import { ChevronDown, ChevronUp } from "lucide-react"

// ── Tokens de acento para ListItemCard ────────────────────────────────
const ACCENT_TOKENS = {
    blue: {
        lightBg: "#dbeafe",
        lightBorder: "#93c5fd",
        darkBg: "rgba(0,61,165,0.15)",
        darkBorder: "rgba(0,61,165,0.35)",
        color: "#003DA5",
        hoverLight: "#e0f2fe",
        hoverDark: "rgba(0,61,165,0.08)",
    },
    yellow: {
        lightBg: "#fef9c3",
        lightBorder: "#fde047",
        darkBg: "rgba(252,227,0,0.15)",
        darkBorder: "rgba(252,227,0,0.35)",
        color: "#FCE300",
        hoverLight: "#fef9c3",
        hoverDark: "rgba(252,227,0,0.08)",
    },
    emerald: {
        lightBg: "#d1fae5",
        lightBorder: "#6ee7b7",
        darkBg: "rgba(16,185,129,0.15)",
        darkBorder: "rgba(16,185,129,0.35)",
        color: "#10b981",
        hoverLight: "#ecfdf5",
        hoverDark: "rgba(16,185,129,0.08)",
    },
    cyan: {
        lightBg: "#cffafe",
        lightBorder: "#67e8f9",
        darkBg: "rgba(6,182,212,0.15)",
        darkBorder: "rgba(6,182,212,0.35)",
        color: "#06b6d4",
        hoverLight: "#ecfeff",
        hoverDark: "rgba(6,182,212,0.08)",
    },
    purple: {
        lightBg: "#ede9fe",
        lightBorder: "#c4b5fd",
        darkBg: "rgba(139,92,246,0.15)",
        darkBorder: "rgba(139,92,246,0.35)",
        color: "#8b5cf6",
        hoverLight: "#f5f3ff",
        hoverDark: "rgba(139,92,246,0.08)",
    },
}

// ── ListItemCard: Componente genérico para cards de lista ─────────────
// Cumple con Design System v2 - sección 3 (Cards y Contenedores)
export const ListItemCard = ({
    accent = "blue",
    title,
    description,
    badge,
    actions,
    headerMeta, // Información adicional en el header (empleado, fechas, etc.)
    isOpen,
    onToggle,
    children,
    className = "",
}) => {
    const isDark = useIsDark()
    const t = ACCENT_TOKENS[accent] || ACCENT_TOKENS.blue

    // Estilos según Design System sección 3
    // Fondo mínimo oscuro = 0.05, Borde mínimo oscuro = 0.12
    const cardBg = isDark
        ? `linear-gradient(135deg, ${t.darkBg} 0%, rgba(255,255,255,0.02) 100%)`
        : "linear-gradient(135deg, #ffffff 0%, #ffffff 60%)"
    
    const cardBorder = isDark ? t.darkBorder : `1px solid ${t.lightBorder}`

    // Jerarquía de texto según Design System sección 4
    const titleColor = isDark ? "#ffffff" : "#111827"
    const descColor = isDark ? "rgba(255,255,255,0.5)" : "#6b7280"
    const metaColor = isDark ? "rgba(255,255,255,0.35)" : "#9ca3af"

    return (
        <div
            className={`rounded-2xl overflow-hidden border transition-all duration-200 ${className}`}
            style={{
                background: cardBg,
                border: cardBorder,
            }}
        >
            {/* Header de la card */}
            <div className="flex items-start justify-between px-4 py-3 gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p
                            className="text-sm font-bold truncate"
                            style={{ color: titleColor }}
                        >
                            {title}
                        </p>
                        {badge}
                    </div>
                    {description && (
                        <p
                            className="text-xs line-clamp-1 mb-1"
                            style={{ color: descColor }}
                        >
                            {description}
                        </p>
                    )}
                    {/* Meta información adicional (empleado, fechas, etc.) */}
                    {headerMeta && (
                        <div className="mt-1" style={{ color: metaColor }}>
                            {headerMeta}
                        </div>
                    )}
                </div>

                {/* Acciones y Toggle */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    {actions}
                    {onToggle && (
                        <button
                            onClick={onToggle}
                            className="p-1.5 rounded-lg transition-colors duration-150"
                            style={{ color: metaColor }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.background = isDark
                                    ? "rgba(255,255,255,0.06)"
                                    : "#f3f4f6")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.background = "transparent")
                            }
                        >
                            {isOpen ? (
                                <ChevronUp className="w-4 h-4" />
                            ) : (
                                <ChevronDown className="w-4 h-4" />
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Contenido expandable */}
            {isOpen && children && (
                <div
                    className="border-t px-4 py-3"
                    style={{
                        borderColor: isDark
                            ? "rgba(255,255,255,0.04)"
                            : "#f3f4f6",
                    }}
                >
                    {children}
                </div>
            )}
        </div>
    )
}

// ── Badge de estado para usar con ListItemCard ────────────────────────
export const StatusBadge = ({ active, activeLabel = "Activo", inactiveLabel = "Inactivo" }) => {
    const isDark = useIsDark()

    const activeStyles = {
        bg: isDark ? "rgba(16,185,129,0.15)" : "#d1fae5",
        border: isDark ? "rgba(16,185,129,0.3)" : "#6ee7b7",
        color: isDark ? "#34d399" : "#065f46",
    }

    const inactiveStyles = {
        bg: isDark ? "rgba(255,255,255,0.07)" : "#f3f4f6",
        border: isDark ? "rgba(255,255,255,0.12)" : "#d1d5db",
        color: isDark ? "rgba(255,255,255,0.4)" : "#6b7280",
    }

    const styles = active ? activeStyles : inactiveStyles

    return (
        <span
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border"
            style={{
                background: styles.bg,
                borderColor: styles.border,
                color: styles.color,
            }}
        >
            <span
                className={`w-1.5 h-1.5 rounded-full ${
                    active
                        ? "bg-emerald-400"
                        : isDark
                        ? "bg-gray-600"
                        : "bg-gray-300"
                }`}
            />
            {active ? activeLabel : inactiveLabel}
        </span>
    )
}

// ── Avatar con iniciales para usar con ListItemCard ────────────────────
export const InitialsAvatar = ({ firstname, lastname, accent = "blue" }) => {
    const isDark = useIsDark()
    const t = ACCENT_TOKENS[accent] || ACCENT_TOKENS.blue

    const avatarBg = isDark ? t.darkBg : t.lightBg
    const avatarColor = isDark ? t.color : "#374151"
    const avatarBorder = isDark ? t.darkBorder : t.lightBorder

    return (
        <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold border"
            style={{
                background: avatarBg,
                color: avatarColor,
                borderColor: avatarBorder,
            }}
        >
            {firstname?.[0]?.toUpperCase()}{lastname?.[0]?.toUpperCase()}
        </div>
    )
}
