import { Link } from "react-router-dom"
import { Sun, Moon } from "lucide-react"
import { useTheme } from "../../context/ThemeContext.jsx"
import { ContactSalesDialog } from "../common/ContactSalesDialog.jsx"

export const PublicNavbar = () => {
    const { isDark, toggleTheme } = useTheme()

    return (
        <nav className="flex items-center justify-between px-5 sm:px-8 py-4 sm:py-6 border-b transition-colors duration-300"
            style={{ borderColor: isDark ? "rgba(99,102,241,0.12)" : "#f3f4f6" }}>

            {/* Logo */}
            <Link to="/" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                <img
                    src="/icons/IsotipoMarca-CondoVe-64x64-solo.png"
                    alt="Logo CondoVe SGC"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-contain"
                />
                <span className="text-lg sm:text-2xl font-bold tracking-tight text-center sm:text-left"
                    style={{ color: isDark ? "#ffffff" : "#111827" }}>
                    CondoVE<span style={{ color: "#003DA5", fontSize: "0.65em", marginLeft: "0.15em" }}>SGC</span><span style={{ color: "#7c3aed" }}>.</span>
                </span>
            </Link>

            {/* Links */}
            <div className="hidden md:flex gap-8 text-sm font-medium"
                style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#4b5563" }}>
                <a href="#" className="hover:text-purple-500 transition-colors">Plataforma</a>
                <a href="#" className="hover:text-purple-500 transition-colors">Soluciones</a>
                <a href="#" className="hover:text-purple-500 transition-colors">Precios</a>
                <Link to="/contact" className="hover:text-purple-500 transition-colors">Contacto</Link>
            </div>

            {/* Acciones derecha */}
            <div className="flex items-center gap-2 sm:gap-3">
                {/* Contact Sales Modal */}
                <ContactSalesDialog />

                {/* Demo */}
                <Link to="/auth/HR/signup" className="hidden sm:block">
                    <button className="px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 hover:opacity-90"
                        style={{
                            borderColor: "#7c3aed", color: "#7c3aed",
                            background: isDark ? "rgba(124,58,237,0.08)" : "transparent"
                        }}>
                        Probar Demo
                    </button>
                </Link>

                {/* Toggle tema */}
                <button
                    onClick={toggleTheme}
                    className="flex items-center gap-2 px-2.5 sm:px-3 py-2 rounded-xl transition-all duration-200 border"
                    style={{
                        borderColor: isDark ? "rgba(99,102,241,0.2)" : "#e5e7eb",
                        background: isDark ? "rgba(99,102,241,0.08)" : "#f9fafb"
                    }}
                >
                    <div className="flex items-center justify-center w-5 h-5 rounded-lg"
                        style={{ background: isDark ? "rgba(99,102,241,0.15)" : "#fef3c7" }}>
                        {isDark
                            ? <Sun className="w-3.5 h-3.5 text-amber-400" />
                            : <Moon className="w-3.5 h-3.5 text-indigo-500" />
                        }
                    </div>
                    <span className="hidden sm:block text-xs font-medium"
                        style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                        {isDark ? "Claro" : "Oscuro"}
                    </span>
                    {/* Pill */}
                    <div className="flex-shrink-0 w-7 h-3.5 rounded-full relative transition-colors duration-300"
                        style={{ background: isDark ? "#003DA5" : "#e5e7eb" }}>
                        <div className="absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white shadow-sm transition-all duration-300"
                            style={{ left: isDark ? "15px" : "2px" }} />
                    </div>
                </button>
            </div>
        </nav>
    )
}
