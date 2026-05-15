import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { NavLink } from "react-router-dom"
import { LogOut } from "lucide-react"

export function DashboardSidebar({ navItems = [], onLogout, appName = "CondoVE SGC", appSubtitle = "Panel" }) {
    const { setOpenMobile, isMobile } = useSidebar()

    const handleNavClick = () => {
        if (isMobile) setOpenMobile(false)
    }

    return (
        <Sidebar
            className="border-none"
            style={{ background: "transparent" }}
        >
            <div
                className="flex h-full flex-col border-r"
                style={{
                    background: "var(--sidebar-bg, #ffffff)",
                    borderColor: "var(--sidebar-border, #f3f4f6)"
                }}
            >
                {/* Inject CSS variables based on dark class */}
                <style>{`
                    :root {
                        --sidebar-bg: #ffffff;
                        --sidebar-border: #f3f4f6;
                    }
                    .dark {
                        --sidebar-bg: #0d0d18;
                        --sidebar-border: rgba(99,102,241,0.12);
                    }
                `}</style>

                {/* Logo */}
                <div
                    className="flex items-center gap-3 px-5 py-5 border-b"
                    style={{ borderColor: "var(--sidebar-border)" }}
                >
                    <div className="w-9 h-9 rounded-xl flex-shrink-0 overflow-hidden">
                        <img 
                            src="/icons/IsotipoMarca-CondoVe-logo-32x32.png" 
                            alt="CondoVe Logo" 
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div>
                        <p className="font-bold text-base tracking-tight leading-none text-gray-900 dark:text-white">
                            {appName}<span className="text-blue-500">.</span>
                        </p>
                        <p className="text-xs mt-0.5 text-gray-400 dark:text-[rgba(255,255,255,0.3)]">
                            {appSubtitle}
                        </p>
                    </div>
                </div>

                {/* Nav label */}
                <div className="px-5 pt-5 pb-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em]
                        text-gray-300 dark:text-[rgba(255,255,255,0.25)]">
                        Navegación
                    </p>
                </div>

                {/* Nav items */}
                <SidebarContent className="flex-1 overflow-y-auto px-3 pb-3">
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu className="flex flex-col gap-1">
                                {navItems.map((item) => (
                                    <SidebarMenuItem key={item.label}>
                                        {item.path ? (
                                            <NavLink
                                                to={item.path}
                                                onClick={handleNavClick}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
                                                style={({ isActive }) => isActive ? {
                                                    background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))",
                                                    border: "1px solid rgba(99,102,241,0.25)",
                                                    boxShadow: "0 2px 12px rgba(99,102,241,0.1)"
                                                } : {
                                                    border: "1px solid transparent"
                                                }}
                                            >
                                                {({ isActive }) => (
                                                    <>
                                                        <div
                                                            className="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0 transition-colors duration-200"
                                                            style={{ background: isActive ? "rgba(99,102,241,0.2)" : "rgba(0,0,0,0.05)" }}
                                                        >
                                                            <img
                                                                src={item.icon}
                                                                alt={item.label}
                                                                className="w-4 h-4 object-contain"
                                                                style={{
                                                                    filter: isActive
                                                                        ? "brightness(0) saturate(100%) invert(45%) sepia(80%) saturate(600%) hue-rotate(220deg)"
                                                                        : "brightness(0) saturate(100%) invert(60%)"
                                                                }}
                                                            />
                                                        </div>
                                                        <span
                                                            className="text-sm font-medium"
                                                            style={{ color: isActive ? "#003DA5" : undefined }}
                                                        >
                                                            {!isActive && (
                                                                <span className="text-gray-500 dark:text-[rgba(255,255,255,0.45)]">
                                                                    {item.label}
                                                                </span>
                                                            )}
                                                            {isActive && item.label}
                                                        </span>
                                                        {isActive && (
                                                            <div className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0 bg-blue-500" />
                                                        )}
                                                    </>
                                                )}
                                            </NavLink>
                                        ) : (
                                            <div
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-not-allowed opacity-40"
                                                style={{ border: "1px solid transparent" }}
                                            >
                                                <div
                                                    className="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0"
                                                    style={{ background: "rgba(0,0,0,0.05)" }}
                                                >
                                                    <img
                                                        src={item.icon}
                                                        alt={item.label}
                                                        className="w-4 h-4 object-contain"
                                                        style={{ filter: "brightness(0) saturate(100%) invert(60%)" }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium text-gray-400 dark:text-[rgba(255,255,255,0.35)]">
                                                    {item.label}
                                                </span>
                                                <span className="ml-auto text-[9px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0
                                                    bg-blue-50 text-blue-400 border border-blue-100
                                                    dark:bg-[rgba(99,102,241,0.1)] dark:text-[rgba(99,102,241,0.6)] dark:border-[rgba(99,102,241,0.15)]">
                                                    Soon
                                                </span>
                                            </div>
                                        )}
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                {/* Footer — Logout */}
                <div
                    className="px-3 py-4 border-t"
                    style={{ borderColor: "var(--sidebar-border)" }}
                >
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer
                            border border-transparent
                            hover:bg-red-50 hover:border-red-100
                            dark:hover:bg-[rgba(239,68,68,0.08)] dark:hover:border-[rgba(239,68,68,0.2)]"
                    >
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0
                            bg-red-50 dark:bg-[rgba(239,68,68,0.1)]">
                            <LogOut className="w-4 h-4 text-red-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-400 dark:text-[rgba(255,255,255,0.35)]">
                            Cerrar sesión
                        </span>
                    </button>
                </div>
            </div>
        </Sidebar>
    )
}
