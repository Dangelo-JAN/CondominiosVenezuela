import { Link } from "react-router-dom"
import { ArrowRight, ShieldCheck, Users, Zap, Download, Sun, Moon } from "lucide-react"
import { useState, useEffect } from "react"
import { useTheme } from "../../hooks/useTheme.js"
import { ContactSalesDialog } from "../../components/common/ContactSalesDialog.jsx"
import { Footer } from "../../components/common/Footer.jsx"

export const EntryPage = () => {
    const { isDark, toggleTheme } = useTheme()
    const [installPrompt, setInstallPrompt] = useState(null)
    const [isInstalled, setIsInstalled] = useState(false)

    useEffect(() => {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true)
        }
        const handler = (e) => { e.preventDefault(); setInstallPrompt(e) }
        window.addEventListener('beforeinstallprompt', handler)
        return () => window.removeEventListener('beforeinstallprompt', handler)
    }, [])

    const handleInstall = async () => {
        if (!installPrompt) return
        installPrompt.prompt()
        const { outcome } = await installPrompt.userChoice
        if (outcome === 'accepted') { setInstallPrompt(null); setIsInstalled(true) }
    }

    return (
        <div className="min-h-screen flex flex-col transition-colors duration-300"
            style={{ background: isDark ? "#0f0f1a" : "#ffffff" }}>

            {/* Navbar */}
            <nav className="flex items-center justify-between px-5 sm:px-8 py-4 sm:py-6 border-b transition-colors duration-300"
                style={{ borderColor: isDark ? "rgba(99,102,241,0.12)" : "#f3f4f6" }}>

                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, #7c3aed, #003DA5)" }}>
                        <Zap className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-xl sm:text-2xl font-bold tracking-tight"
                        style={{ color: isDark ? "#ffffff" : "#111827" }}>
                        EMS<span style={{ color: "#7c3aed" }}>.</span>
                    </span>
                </div>

                {/* Links — ocultos en móvil */}
                <div className="hidden md:flex gap-8 text-sm font-medium"
                    style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#4b5563" }}>
                    <a href="#" className="hover:text-purple-500 transition-colors">Plataforma</a>
                    <a href="#" className="hover:text-purple-500 transition-colors">Soluciones</a>
                    <a href="#" className="hover:text-purple-500 transition-colors">Precios</a>
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

                    {/* Instalar PWA */}
                    {installPrompt && !isInstalled && (
                        <button onClick={handleInstall}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                            style={{ background: "linear-gradient(135deg, #003DA5, #8b5cf6)" }}>
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:block">Instalar</span>
                        </button>
                    )}
                </div>
            </nav>

            {/* Hero */}
            <main className="flex-1 flex flex-col lg:flex-row items-center justify-between
                px-5 sm:px-8 lg:px-20 py-10 sm:py-12 gap-10 sm:gap-12">

                <div className="flex-1 flex flex-col gap-6 sm:gap-8 max-w-2xl w-full text-center lg:text-left">

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium self-center lg:self-start"
                        style={{ background: isDark ? "rgba(124,58,237,0.12)" : "#f3e8ff", color: "#7c3aed" }}>
                        <ShieldCheck className="w-4 h-4" />
                        Sistema de Gestión Empresarial N°1
                    </div>

                    {/* Título */}
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight"
                        style={{ color: isDark ? "#ffffff" : "#111827" }}>
                        Gestiona tu equipo de forma{" "}
                        <span style={{ color: "#7c3aed" }} className="italic">inteligente.</span>
                    </h1>

                    {/* Descripción */}
                    <p className="text-base sm:text-xl leading-relaxed"
                        style={{ color: isDark ? "rgba(255,255,255,0.55)" : "#4b5563" }}>
                        Optimiza el control de asistencia, nómina y comunicación interna en una sola plataforma.
                        Diseñada para equipos modernos que buscan eficiencia y transparencia.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-center lg:justify-start">
                        <Link to="/auth/HR/signup" className="w-full sm:w-auto">
                            <button className="w-full sm:w-auto flex items-center justify-center gap-2
                                px-6 sm:px-8 py-3.5 sm:py-4 text-base sm:text-lg font-semibold rounded-xl
                                text-white transition-all duration-200 hover:opacity-90 hover:scale-105"
                                style={{
                                    background: "linear-gradient(135deg, #7c3aed, #003DA5)",
                                    boxShadow: "0 8px 25px rgba(124,58,237,0.3)"
                                }}>
                                Empezar como HR-Admin
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </Link>
                        <Link to="/auth/employee/login" className="w-full sm:w-auto">
                            <button className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 text-base sm:text-lg font-medium
                                rounded-xl transition-colors underline decoration-purple-300"
                                style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#4b5563" }}>
                                Acceso Empleados
                            </button>
                        </Link>
                    </div>

                    {/* Banner PWA móvil */}
                    {installPrompt && !isInstalled && (
                        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border"
                            style={{
                                background: isDark
                                    ? "rgba(99,102,241,0.08)"
                                    : "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.06))",
                                borderColor: "rgba(99,102,241,0.2)"
                            }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: "linear-gradient(135deg, #003DA5, #8b5cf6)" }}>
                                <Zap className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold"
                                    style={{ color: isDark ? "#ffffff" : "#111827" }}>
                                    Instala EMS en tu móvil
                                </p>
                                <p className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#6b7280" }}>
                                    Accede rápido desde tu pantalla de inicio
                                </p>
                            </div>
                            <button onClick={handleInstall}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                                    text-white flex-shrink-0 transition-all hover:opacity-90"
                                style={{ background: "linear-gradient(135deg, #003DA5, #8b5cf6)" }}>
                                <Download className="w-3.5 h-3.5" />
                                Instalar
                            </button>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="pt-6 sm:pt-8 flex flex-wrap justify-center lg:justify-start gap-6 sm:gap-8 border-t"
                        style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6" }}>
                        <div>
                            <p className="text-xl sm:text-2xl font-bold"
                                style={{ color: isDark ? "#ffffff" : "#111827" }}>+10k</p>
                            <p className="text-xs sm:text-sm font-medium italic"
                                style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#6b7280" }}>
                                Usuarios activos
                            </p>
                        </div>
                        <div>
                            <p className="text-xl sm:text-2xl font-bold"
                                style={{ color: isDark ? "#ffffff" : "#111827" }}>99.9%</p>
                            <p className="text-xs sm:text-sm font-medium italic"
                                style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#6b7280" }}>
                                Uptime garantizado
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "#7c3aed" }} />
                            <p className="text-xs sm:text-sm font-medium italic"
                                style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#6b7280" }}>
                                Soporte 24/7
                            </p>
                        </div>
                    </div>
                </div>

                {/* Imagen mockup — oculta en móvil pequeño */}
                <div className="hidden sm:block flex-1 relative w-full max-w-xl lg:max-w-none">
                    <div className="absolute -top-10 -left-10 w-48 sm:w-64 h-48 sm:h-64 rounded-full
                        mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
                        style={{ background: isDark ? "#4f46e5" : "#ddd6fe" }} />
                    <div className="absolute -bottom-10 -right-10 w-48 sm:w-64 h-48 sm:h-64 rounded-full
                        mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
                        style={{ background: isDark ? "#7c3aed" : "#bfdbfe", animationDelay: "700ms" }} />

                    <div className="relative rounded-2xl shadow-2xl overflow-hidden
                        transform hover:-rotate-1 transition-transform duration-500 border"
                        style={{
                            background: isDark ? "#0d0d18" : "#ffffff",
                            borderColor: isDark ? "rgba(99,102,241,0.2)" : "#e5e7eb"
                        }}>
                        <div className="p-2 flex gap-1.5 border-b"
                            style={{
                                background: isDark ? "#1a1a2e" : "#f9fafb",
                                borderColor: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb"
                            }}>
                            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                        </div>
                        <img
                            src="/assets/Welcome.png"
                            alt=""
                            className="w-full object-cover p-4"
                        />
                    </div>
                </div>
            </main>

            {/* Footer — componente reutilizable */}
            <Footer />
        </div>
    )
}
