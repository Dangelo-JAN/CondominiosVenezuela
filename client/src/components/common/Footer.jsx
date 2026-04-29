import { Zap } from "lucide-react"
import { useTheme } from "../../hooks/useTheme.js"

export const Footer = () => {
    const { isDark } = useTheme()

    return (
        <footer className="border-t transition-colors duration-300"
            style={{ borderColor: isDark ? "rgba(99,102,241,0.08)" : "#f3f4f6" }}>
            <div className="px-5 sm:px-8 lg:px-20 py-8 sm:py-10">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

                    {/* Logo y descripción */}
                    <div className="flex flex-col items-center sm:items-start gap-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ background: "linear-gradient(135deg, #7c3aed, #003DA5)" }}>
                                <Zap className="text-white w-4 h-4" />
                            </div>
                            <span className="text-base font-bold"
                                style={{ color: isDark ? "#ffffff" : "#111827" }}>
                                EMS<span style={{ color: "#7c3aed" }}>.</span>
                            </span>
                        </div>
                        <p className="text-xs text-center sm:text-left"
                            style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#9ca3af" }}>
                            Employee Management System
                        </p>
                    </div>

                    {/* Links */}
                    <div className="flex items-center gap-6 text-xs font-medium"
                        style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#9ca3af" }}>
                        <a href="#" className="hover:text-purple-500 transition-colors">Privacidad</a>
                        <a href="#" className="hover:text-purple-500 transition-colors">Términos</a>
                        <a href="#" className="hover:text-purple-500 transition-colors">Soporte</a>
                    </div>

                    {/* Copyright */}
                    <p className="text-xs"
                        style={{ color: isDark ? "rgba(255,255,255,0.25)" : "#9ca3af" }}>
                        © {new Date().getFullYear()} EMS. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </footer>
    )
}
