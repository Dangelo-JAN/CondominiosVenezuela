import { useEffect } from "react"
import { X, AlertTriangle, CheckCircle } from "lucide-react"
import { useIsDark } from "../../hooks/useIsDark.js"

export const ConfirmDialog = ({ open, onClose, onConfirm, title, message, confirmText = "Confirmar", variant = "danger" }) => {
    const isDark = useIsDark()

    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden"
        }
        return () => {
            document.body.style.overflow = "unset"
        }
    }, [open])

    if (!open) return null

    const variantStyles = {
        danger: {
            icon: AlertTriangle,
            iconColor: isDark ? "#f87171" : "#dc2626",
            confirmBg: isDark ? "#dc2626" : "#dc2626",
            confirmHover: isDark ? "#b91c1c" : "#b91c1c"
        },
        warning: {
            icon: AlertTriangle,
            iconColor: isDark ? "#fcd34d" : "#f59e0b",
            confirmBg: isDark ? "#f59e0b" : "#f59e0b",
            confirmHover: isDark ? "#d97706" : "#d97706"
        },
        info: {
            icon: CheckCircle,
            iconColor: isDark ? "#93c5fd" : "#3b82f6",
            confirmBg: isDark ? "#3b82f6" : "#3b82f6",
            confirmHover: isDark ? "#2563eb" : "#2563eb"
        }
    }

    const style = variantStyles[variant]

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
            onClick={onClose}>
            <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl animate-slide-up
                bg-white dark:bg-[#1a1a2e] border
                border-gray-200 dark:border-[rgba(255,255,255,0.08)]"
                onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${style.iconColor}15` }}>
                        <style.icon className="w-5 h-5" style={{ color: style.iconColor }} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            {title}
                        </h3>
                        <p className="text-sm mb-6"
                            style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#6b7280" }}>
                            {message}
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                                    bg-gray-100 text-gray-700 hover:bg-gray-200
                                    dark:bg-[rgba(255,255,255,0.05)] dark:text-gray-300 dark:hover:bg-[rgba(255,255,255,0.1)]"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={onConfirm}
                                className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all duration-200"
                                style={{ background: style.confirmBg }}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}