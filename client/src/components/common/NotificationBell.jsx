import { useEffect, useState, useRef, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useIsDark } from "../../hooks/useIsDark.js"
import {
    HandleGetMyNotifications,
    HandleGetUnreadNotificationCount,
    HandleMarkNotificationRead,
    HandleMarkAllNotificationsRead
} from "../../redux/Thunks/HRNotificationsThunk.js"
import { onMessageListener } from "../../services/firebase.js"
import { usePushNotifications } from "../../hooks/usePushNotifications.js"
import {
    Bell, BellDot, CheckCheck, ChevronRight, Clock, Loader2, RefreshCw,
    BellRing, BellOff, X, Send, Smartphone
} from "lucide-react"
import { hrApiService } from "../../redux/apis/HRApiService.js"
import { HRNotificationsEndPoints } from "../../redux/apis/APIsEndpoints.js"

const POLLING_INTERVAL = 30000 // 30 segundos

export const NotificationBell = () => {
    const isDark = useIsDark()
    const dispatch = useDispatch()
    const { notifications, unreadCount, isLoading } = useSelector((state) => state.HRNotificationsReducer)
    const [isOpen, setIsOpen] = useState(false)
    const [error, setError] = useState(null)
    const [showPushModal, setShowPushModal] = useState(false)
    const [pushToast, setPushToast] = useState(null) // { title, message } para foreground pushes
    const dropdownRef = useRef(null)
    const pollingRef = useRef(null)
    const toastTimeoutRef = useRef(null)

    // Hook de push notifications (ya está activado desde DashboardLayout, aquí solo consultamos estado)
    const {
        permission: pushPermission,
        token: pushToken,
        isSubscribing,
        error: pushError,
        subscribe,
        unsubscribe,
        isSupported: isPushSupportedBrowser,
    } = usePushNotifications(false) // Desactivamos el auto-init, ya lo maneja DashboardLayout

    // Verificar si hay token HR (solo HR tiene notificaciones)
    const hasHRToken = !!localStorage.getItem("HRtoken")

    // ── Cargar notificaciones ────────────────────────────────────────────────
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

    // ── Polling inicial ──────────────────────────────────────────────────────
    useEffect(() => {
        if (hasHRToken) {
            loadNotifications()
            pollingRef.current = setInterval(loadNotifications, POLLING_INTERVAL)
            return () => {
                if (pollingRef.current) clearInterval(pollingRef.current)
            }
        }
    }, [hasHRToken, loadNotifications])

    // ── Escuchar mensajes en foreground (push mientras la app está visible) ──
    useEffect(() => {
        if (!hasHRToken) return

        const unsubscribeMessage = onMessageListener().then((payload) => {
            if (!payload) return // Messaging no disponible

            // Recargar notificaciones inmediatamente (sin esperar polling)
            loadNotifications()

            // Mostrar toast temporal
            const title = payload.notification?.title || payload.data?.title || "Nueva notificación"
            const body = payload.notification?.body || payload.data?.body || ""
            setPushToast({ title, body })

            // Auto-ocultar toast después de 5s
            if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
            toastTimeoutRef.current = setTimeout(() => setPushToast(null), 5000)
        })

        return () => {
            // Cleanup del listener (onMessage no tiene unsubscribe nativo,
            // pero al desmontar el componente se libera)
        }
    }, [hasHRToken, loadNotifications])

    // ── Cerrar dropdown al hacer click fuera ─────────────────────────────────
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
                setShowPushModal(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleToggle = () => {
        if (!isOpen) {
            loadNotifications()
            setShowPushModal(false)
        }
        setIsOpen(!isOpen)
    }

    const handleMarkRead = async (id) => {
        await dispatch(HandleMarkNotificationRead(id))
    }

    const handleMarkAllRead = async () => {
        await dispatch(HandleMarkAllNotificationsRead())
    }

    // ── Activar/desactivar push ──────────────────────────────────────────────
    const handleEnablePush = async () => {
        const newToken = await subscribe()
        if (newToken) {
            setShowPushModal(false)
        }
    }

    const handleDisablePush = async () => {
        await unsubscribe()
        setShowPushModal(false)
    }

    // ── Enviar push de prueba ────────────────────────────────────────────────
    const handleTestPush = async () => {
        try {
            const resp = await hrApiService.post(HRNotificationsEndPoints.TEST_PUSH)
            const data = resp.data
            if (data?.success) {
                alert(`✅ ${data.message}`)
            } else {
                alert(`⚠️ ${data?.message || "No se pudo enviar el push"}`)
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message || "Error de conexion"
            alert(`❌ Error al enviar push de prueba: ${msg}`)
        }
    }

    // ── Helper: tiempo relativo ──────────────────────────────────────────────
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

    // ── No renderizar si no hay token HR ─────────────────────────────────────
    if (!hasHRToken) return null

    const displayNotifications = notifications || []
    const hasUnread = unreadCount > 0

    // ── Push status ─────────────────────────────────────────────────────────
    const isPushGranted = pushPermission === "granted" && pushToken
    const isPushDenied = pushPermission === "denied"
    const isPushDefault = pushPermission === "default" || (!pushToken && pushPermission !== "denied")

    return (
        <div ref={dropdownRef} className="relative">
            {/* ── Toast de push en foreground ── */}
            {pushToast && (
                <div className="absolute top-full right-0 mt-2 w-72 rounded-xl overflow-hidden shadow-xl z-50
                    animate-in slide-in-from-top-2 fade-in duration-300
                    bg-yellow-50 border border-yellow-200
                    dark:bg-[rgba(252,227,0,0.08)] dark:border-[rgba(252,227,0,0.2)]">
                    <div className="flex items-start gap-2 p-3">
                        <BellRing className="w-4 h-4 mt-0.5 shrink-0"
                            style={{ color: isDark ? "#facc15" : "#ca8a04" }} />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                                {pushToast.title}
                            </p>
                            <p className="text-[11px] mt-0.5 text-gray-600 dark:text-[rgba(255,255,255,0.55)] line-clamp-2">
                                {pushToast.message}
                            </p>
                        </div>
                        <button onClick={() => setPushToast(null)}
                            className="shrink-0 p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/5">
                            <X className="w-3 h-3" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#9ca3af" }} />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Bell Button ── */}
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

            {/* ── Dropdown ── */}
            {isOpen && (
                // En mobile (< sm): fixed centrado para evitar overflow del viewport.
                // En desktop (sm+): absolute right-0 anclado al botón.
                <div className="fixed left-4 right-4 top-24 z-50
                    sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2
                    sm:w-96
                    rounded-2xl overflow-hidden shadow-2xl
                    bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-[rgba(252,227,0,0.15)]">

                    {/* Dropdown Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b
                        border-gray-100 dark:border-[rgba(252,227,0,0.1)]">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                            Notificaciones
                        </h3>
                        <div className="flex items-center gap-2">
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
                    </div>

                    {/* Dropdown Body */}
                    <div className="max-h-[60vh] sm:max-h-[320px] overflow-y-auto">
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

                    {/* ── Push Notification Status Bar ── */}
                    {isPushSupportedBrowser !== false && (
                        <div className="border-t border-gray-100 dark:border-[rgba(252,227,0,0.1)]">
                            <button
                                onClick={() => setShowPushModal(!showPushModal)}
                                className="w-full flex items-center justify-between px-4 py-2.5 text-xs transition-colors
                                    hover:bg-gray-50 dark:hover:bg-[rgba(255,255,255,0.02)]"
                            >
                                <div className="flex items-center gap-2">
                                    {isPushGranted ? (
                                        <>
                                            <BellRing className="w-3.5 h-3.5"
                                                style={{ color: isDark ? "#4ade80" : "#16a34a" }} />
                                            <span className="font-medium"
                                                style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#6b7280" }}>
                                                Push activado
                                            </span>
                                        </>
                                    ) : isPushDenied ? (
                                        <>
                                            <BellOff className="w-3.5 h-3.5"
                                                style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#9ca3af" }} />
                                            <span className="font-medium"
                                                style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }}>
                                                Push bloqueado
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <Bell className="w-3.5 h-3.5"
                                                style={{ color: isDark ? "#facc15" : "#ca8a04" }} />
                                            <span className="font-medium"
                                                style={{ color: isDark ? "#facc15" : "#ca8a04" }}>
                                                Activar notificaciones push
                                            </span>
                                        </>
                                    )}
                                </div>
                                <ChevronRight className="w-3 h-3"
                                    style={{ color: isDark ? "rgba(255,255,255,0.2)" : "#9ca3af" }} />
                            </button>

                            {/* ── Push Modal (inline dentro del dropdown) ── */}
                            {showPushModal && (
                                <div className="px-4 pb-3 border-t border-gray-50 dark:border-[rgba(252,227,0,0.05)]">
                                    <div className="pt-3 space-y-2">
                                        {/* Estado */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-medium"
                                                style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }}>
                                                Estado
                                            </span>
                                            <span className="text-[11px] font-semibold"
                                                style={{
                                                    color: isPushGranted
                                                        ? (isDark ? "#4ade80" : "#16a34a")
                                                        : isPushDenied
                                                            ? (isDark ? "#ef4444" : "#dc2626")
                                                            : (isDark ? "#facc15" : "#ca8a04")
                                                }}>
                                                {isPushGranted ? "✅ Activado" : isPushDenied ? "❌ Bloqueado" : "⏸ Inactivo"}
                                            </span>
                                        </div>

                                        {/* Navegador soportado */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-medium"
                                                style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }}>
                                                Dispositivo
                                            </span>
                                            <span className="text-[11px] flex items-center gap-1"
                                                style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                                <Smartphone className="w-3 h-3" />
                                                Web (FCM)
                                            </span>
                                        </div>

                                        {/* Error */}
                                        {pushError && (
                                            <p className="text-[10px] text-red-500 dark:text-red-400">
                                                {pushError}
                                            </p>
                                        )}

                                        {/* Acciones */}
                                        <div className="flex gap-2 pt-1">
                                            {!isPushGranted ? (
                                                <button
                                                    onClick={handleEnablePush}
                                                    disabled={isSubscribing || isPushDenied}
                                                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                                                        ${isPushDenied
                                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-[rgba(255,255,255,0.03)]"
                                                            : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:bg-[rgba(252,227,0,0.1)] dark:text-yellow-300 dark:hover:bg-[rgba(252,227,0,0.15)]"
                                                        }`}
                                                >
                                                    {isSubscribing ? (
                                                        <><Loader2 className="w-3 h-3 animate-spin" /> Activando...</>
                                                    ) : isPushDenied ? (
                                                        "Bloqueado por el navegador"
                                                    ) : (
                                                        <><BellRing className="w-3 h-3" /> Activar</>
                                                    )}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleDisablePush}
                                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                                                        bg-gray-100 text-gray-600 hover:bg-gray-200
                                                        dark:bg-[rgba(255,255,255,0.05)] dark:text-gray-400 dark:hover:bg-[rgba(255,255,255,0.1)]"
                                                >
                                                    <BellOff className="w-3 h-3" />
                                                    Desactivar
                                                </button>
                                            )}
                                            {isPushGranted && (
                                                <button
                                                    onClick={handleTestPush}
                                                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                                                        bg-blue-50 text-blue-600 hover:bg-blue-100
                                                        dark:bg-[rgba(59,130,246,0.1)] dark:text-blue-400 dark:hover:bg-[rgba(59,130,246,0.15)]"
                                                >
                                                    <Send className="w-3 h-3" />
                                                    Probar
                                                </button>
                                            )}
                                        </div>

                                        {/* Hint para push denegado */}
                                        {isPushDenied && (
                                            <p className="text-[10px] leading-relaxed"
                                                style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#9ca3af" }}>
                                                Para reactivar, ve a la configuración de tu navegador →
                                                Permisos → Notificaciones → Permitir "Condominios Venezuela".
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Dropdown Footer */}
                    {displayNotifications.length > 0 && (
                        <div className="px-4 py-2 border-t border-gray-100 dark:border-[rgba(252,227,0,0.1)]
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
