import { useEffect, useState, useRef, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useIsDark } from "../../hooks/useIsDark.js"
import {
    HandleGetMyNotifications,
    HandleGetUnreadNotificationCount,
    HandleMarkNotificationRead,
    HandleMarkAllNotificationsRead
} from "../../redux/Thunks/HRNotificationsThunk.js"
import { Bell, BellDot, CheckCheck, ChevronRight, Clock, Loader2, RefreshCw } from "lucide-react"

const POLLING_INTERVAL = 30000 // 30 segundos

export const NotificationBell = () => {
    const isDark = useIsDark()
    const dispatch = useDispatch()
    const { notifications, unreadCount, isLoading } = useSelector((state) => state.HRNotificationsReducer)
    const [isOpen, setIsOpen] = useState(false)
    const [error, setError] = useState(null)
    const dropdownRef = useRef(null)
    const pollingRef = useRef(null)

    // Verificar si hay token HR (solo HR tiene notificaciones)
    const hasHRToken = !!localStorage.getItem("HRtoken")

    // Cargar notificaciones al montar
    const loadNotifications = useCallback(async () => {
        if (!hasHRToken) return
        try {
            setError(null)
            await Promise.all([
                dispatch(HandleGetMyNotifications()),
                dispatch(HandleGetUnreadNotificationCount())
            ])
        } catch (err) {
            setError("Error al cargar notificaciones")
        }
    }, [dispatch, hasHRToken])

    useEffect(() => {
        if (hasHRToken) {
            loadNotifications()
            // Polling cada 30s
            pollingRef.current = setInterval(loadNotifications, POLLING_INTERVAL)
            return () => {
                if (pollingRef.current) clearInterval(pollingRef.current)
            }
        }
    }, [hasHRToken, loadNotifications])

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleToggle = () => {
        if (!isOpen) {
            loadNotifications() // Refresh al abrir
        }
        setIsOpen(!isOpen)
    }

    const handleMarkRead = async (id) => {
        await dispatch(HandleMarkNotificationRead(id))
    }

    const handleMarkAllRead = async () => {
        await dispatch(HandleMarkAllNotificationsRead())
    }

    const getTimeAgo = (dateStr) => {
        const now = new Date()
        const date = new Date(dateStr)
        const diffMs = now - date
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return "Ahora"
        if (diffMins < 60) return `Hace ${diffMins} min`
        if (diffHours < 24) return `Hace ${diffHours}h`
        if (diffDays < 7) return `Hace ${diffDays}d`
        return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })
    }

    // No renderizar si no hay token HR
    if (!hasHRToken) return null

    const displayNotifications = notifications || []
    const hasUnread = unreadCount > 0

    return (
        <div ref={dropdownRef} className="relative">
            {/* Bell Button */}
            <button
                onClick={handleToggle}
                className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200
                    hover:bg-gray-100 dark:hover:bg-[rgba(255,255,255,0.07)]"
                title={hasUnread ? `${unreadCount} notificaciones sin leer` : "Sin notificaciones nuevas"}
            >
                {hasUnread ? (
                    <BellDot className="w-5 h-5"
                        style={{ color: isDark ? "#facc15" : "#ca8a04" }} />
                ) : (
                    <Bell className="w-5 h-5"
                        style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }} />
                )}

                {/* Badge */}
                {hasUnread && (
                    <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center
                        min-w-[18px] h-[18px] rounded-full text-[10px] font-bold text-white
                        bg-red-500 border-2 border-white dark:border-[#0f0f1a]">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl overflow-hidden shadow-2xl z-50
                    bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-[rgba(252,227,0,0.15)]">

                    {/* Dropdown Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b
                        border-gray-100 dark:border-[rgba(252,227,0,0.1)]">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                            Notificaciones
                        </h3>
                        {hasUnread && (
                            <button
                                onClick={handleMarkAllRead}
                                className="flex items-center gap-1 text-xs font-medium transition-colors"
                                style={{ color: isDark ? "#facc15" : "#ca8a04" }}>
                                <CheckCheck className="w-3.5 h-3.5" />
                                Leer todas
                            </button>
                        )}
                    </div>

                    {/* Dropdown Body */}
                    <div className="max-h-[360px] overflow-y-auto">
                        {isLoading && displayNotifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-2">
                                <Loader2 className="w-5 h-5 animate-spin"
                                    style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#9ca3af" }} />
                                <p className="text-xs"
                                    style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#9ca3af" }}>
                                    Cargando notificaciones...
                                </p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-3">
                                <p className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#6b7280" }}>
                                    {error}
                                </p>
                                <button onClick={loadNotifications}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                                        bg-gray-100 text-gray-700 hover:bg-gray-200
                                        dark:bg-[rgba(255,255,255,0.05)] dark:text-gray-300 dark:hover:bg-[rgba(255,255,255,0.1)]">
                                    <RefreshCw className="w-3 h-3" />
                                    Reintentar
                                </button>
                            </div>
                        ) : displayNotifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-2">
                                <Bell className="w-6 h-6"
                                    style={{ color: isDark ? "rgba(255,255,255,0.15)" : "#d1d5db" }} />
                                <p className="text-xs font-medium"
                                    style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#9ca3af" }}>
                                    No hay notificaciones nuevas
                                </p>
                            </div>
                        ) : (
                            displayNotifications.slice(0, 20).map((notif) => (
                                <div
                                    key={notif._id}
                                    onClick={() => {
                                        if (!notif.isRead) handleMarkRead(notif._id)
                                    }}
                                    className={`flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer
                                        border-b last:border-b-0
                                        border-gray-50 dark:border-[rgba(252,227,0,0.05)]
                                        ${notif.isRead
                                            ? "hover:bg-gray-50 dark:hover:bg-[rgba(255,255,255,0.02)]"
                                            : "bg-yellow-50/50 hover:bg-yellow-50 dark:bg-[rgba(252,227,0,0.04)] dark:hover:bg-[rgba(252,227,0,0.06)]"
                                        }`}
                                >
                                    {/* Unread indicator */}
                                    {!notif.isRead && (
                                        <div className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                                            style={{ background: "#ca8a04" }} />
                                    )}
                                    {notif.isRead && <div className="w-2 shrink-0" />}

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate text-gray-900 dark:text-white">
                                            {notif.title}
                                        </p>
                                        <p className="text-xs mt-0.5 line-clamp-2"
                                            style={{ color: isDark ? "rgba(255,255,255,0.55)" : "#6b7280" }}>
                                            {notif.message}
                                        </p>
                                        <div className="flex items-center gap-1 mt-1">
                                            <Clock className="w-3 h-3"
                                                style={{ color: isDark ? "rgba(255,255,255,0.25)" : "#9ca3af" }} />
                                            <p className="text-[10px]"
                                                style={{ color: isDark ? "rgba(255,255,255,0.25)" : "#9ca3af" }}>
                                                {getTimeAgo(notif.createdAt)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Read action */}
                                    {!notif.isRead && (
                                        <ChevronRight className="w-4 h-4 mt-1 shrink-0"
                                            style={{ color: isDark ? "rgba(255,255,255,0.2)" : "#d1d5db" }} />
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Dropdown Footer */}
                    {displayNotifications.length > 0 && (
                        <div className="px-4 py-2.5 border-t border-gray-100 dark:border-[rgba(252,227,0,0.1)]
                            bg-gray-50/50 dark:bg-[rgba(255,255,255,0.02)]">
                            <p className="text-[10px] text-center font-medium"
                                style={{ color: isDark ? "rgba(255,255,255,0.25)" : "#9ca3af" }}>
                                {displayNotifications.length > 20
                                    ? `Mostrando 20 de ${displayNotifications.length} notificaciones`
                                    : `${displayNotifications.length} notificaciones`}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
