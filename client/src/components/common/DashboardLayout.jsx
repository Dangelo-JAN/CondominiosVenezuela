import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Outlet } from "react-router-dom"
import { PanelLeft, Sun, Moon } from "lucide-react"
import { useTheme } from "../../hooks/useTheme.js"
import { usePushNotifications } from "../../hooks/usePushNotifications.js"
import { NotificationBell } from "./NotificationBell.jsx"

export const DashboardLayout = ({ sidebar }) => {
    const { isDark, toggleTheme } = useTheme()

    // Iniciar notificaciones push FCM solo para HR
    const hasHRToken = !!localStorage.getItem("HRtoken")
    usePushNotifications(hasHRToken)

    return (
        <SidebarProvider>
            <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-[#0f0f1a]">

                {/* Sidebar */}
                {sidebar}

                {/* Main content */}
                <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

                    {/* Topbar */}
                    <div className="flex items-center px-4 py-3 border-b
                        border-gray-100 dark:border-[rgba(99,102,241,0.12)]
                        bg-white dark:bg-[#0d0d18]">

                        <div className="flex items-center gap-3">
                            <SidebarTrigger className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200
                                text-gray-500 hover:text-gray-900 hover:bg-gray-100
                                dark:text-[rgba(255,255,255,0.4)] dark:hover:text-white dark:hover:bg-[rgba(255,255,255,0.07)]">
                                <PanelLeft className="w-4 h-4" />
                            </SidebarTrigger>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                CondoVE<span className="text-blue-500" style={{ fontSize: "0.7em", marginLeft: "0.1em" }}>SGC</span>.
                            </p>
                        </div>

                        <div className="flex-1" />

                        {/* Notification Bell */}
                        <div className="mr-2">
                            <NotificationBell />
                        </div>

                        <div className="mr-4">
                            <button
                                onClick={toggleTheme}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer
                                    border border-transparent
                                    hover:bg-gray-50 hover:border-gray-100
                                    dark:hover:bg-[rgba(255,255,255,0.05)] dark:hover:border-[rgba(255,255,255,0.08)]"
                            >
                                <div className="flex items-center justify-center w-6 h-6 rounded-lg
                                    bg-amber-50 dark:bg-[rgba(99,102,241,0.1)] transition-colors duration-300">
                                    {isDark
                                        ? <Sun className="w-3.5 h-3.5 text-amber-400" />
                                        : <Moon className="w-3.5 h-3.5 text-blue-400" />
                                    }
                                </div>
                                <span className="hidden sm:block text-xs font-medium
                                    text-gray-400 dark:text-[rgba(255,255,255,0.35)]">
                                    {isDark ? "Modo claro" : "Modo oscuro"}
                                </span>

                                {/* Toggle pill — inline styles para evitar purge de Tailwind en producción */}
                                <div
                                    className="flex-shrink-0 w-8 h-4 rounded-full relative transition-colors duration-300"
                                    style={{ background: isDark ? "#003DA5" : "#e5e7eb" }}
                                >
                                    <div
                                        className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-300"
                                        style={{ left: isDark ? "18px" : "2px" }}
                                    />
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Page content */}
                    <div className="flex-1 overflow-y-auto">
                        <Outlet />
                    </div>
                </div>
            </div>
        </SidebarProvider>
    )
}
