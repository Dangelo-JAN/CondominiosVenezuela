import { Link } from "react-router-dom"
import {
    ArrowRight, ShieldCheck, Users, Zap, Download, Sun, Moon,
    Fingerprint, Wallet, BarChart3, Megaphone, Smartphone, UserPlus,
    Building2, Mail, CalendarCheck2, TrendingUp, CheckCircle2
} from "lucide-react"
import { useState, useEffect } from "react"
import { useTheme } from "../../hooks/useTheme.js"
import { useIsDark } from "../../hooks/useIsDark.js"
import { ContactSalesDialog } from "../../components/common/ContactSalesDialog.jsx"
import { Footer } from "../../components/common/Footer.jsx"

export const EntryPage = () => {
    const { toggleTheme } = useTheme()
    const isDark = useIsDark()
    const [installPrompt, setInstallPrompt] = useState(null)
    const [isInstalled, setIsInstalled] = useState(false)

    const features = [
        {
            icon: Fingerprint,
            title: "Control de Asistencia",
            img: "/assets/HR-Dashboard/attendance.png",
            desc: "Registra entradas y salidas con foto y geolocalización. Detecta tardanzas, faltas y horas extra al instante, directo desde el móvil."
        },
        {
            icon: Wallet,
            title: "Nómina Inteligente",
            img: "/assets/HR-Dashboard/Salary.png",
            desc: "Calcula la nómina de tu condominio automáticamente: sueldos, bonificaciones y deducciones sin errores ni planillas complicadas."
        },
        {
            icon: BarChart3,
            title: "Reportes en Tiempo Real",
            img: "/assets/HR-Dashboard/dashboard.png",
            desc: "Métricas clave de asistencia, ausencias y costos laborales en pantallas en vivo, para tomar mejores decisiones más rápido."
        },
        {
            icon: Megaphone,
            title: "Comunicación y Avisos",
            img: "/assets/HR-Dashboard/notice.png",
            desc: "Publica avisos y notificaciones push para toda la comunidad. Nadie se pierde la información importante del condominio."
        },
        {
            icon: Smartphone,
            title: "App para Empleados",
            img: "/assets/HR-Dashboard/request.png",
            desc: "Solicitudes de ausencia, revisión de horarios y comunicación desde el móvil. El empleado siempre conectado con la administración."
        },
        {
            icon: ShieldCheck,
            title: "Integración y Seguridad",
            img: "/assets/HR-Dashboard/HR-profiles.png",
            desc: "Controles de seguridad alineados con SOC-2, cifrado de datos y perfiles con permisos por rol para proteger la información."
        }
    ]

    const steps = [
        { icon: UserPlus, title: "Regístrate", desc: "Crea la cuenta de tu condominio en minutos." },
        { icon: Building2, title: "Configura", desc: "Carga edificios, departamentos y empleados." },
        { icon: Mail, title: "Invita", desc: "Tus empleados reciben su invitación por correo." },
        { icon: CalendarCheck2, title: "Gestiona", desc: "Asistencia, nómina y avisos en un solo lugar." },
        { icon: Smartphone, title: "Usa la app", desc: "El equipo registra su asistencia desde el móvil." },
        { icon: TrendingUp, title: "Mide", desc: "Reportes en tiempo real para decidir mejor." }
    ]

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
                style={{ borderColor: isDark ? "rgba(0,61,165,0.25)" : "#dde5ff" }}>

                {/* Logo - texto debajo en móvil */}
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                    <img
                        src="/icons/IsotipoMarca-CondoVe-64x64-solo.png"
                        alt="Logo CondoVe SGC"
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-contain"
                    />
                    <span className="text-lg sm:text-2xl font-bold tracking-tight text-center sm:text-left"
                        style={{ color: isDark ? "#ffffff" : "#111827" }}>
                        CondoVE<span style={{ color: "#003DA5", fontSize: "0.65em", marginLeft: "0.15em" }}>SGC</span><span style={{ color: "#FCE300" }}>.</span>
                    </span>
                </div>

                {/* Links — ocultos en móvil */}
                <div className="hidden md:flex gap-8 text-sm font-medium"
                    style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#4b5563" }}>
                    <a href="#" className="hover:text-blue-600 transition-colors">Plataforma</a>
                    <a href="#" className="hover:text-blue-600 transition-colors">Soluciones</a>
                    <a href="#" className="hover:text-blue-600 transition-colors">Precios</a>
                </div>

                {/* Acciones derecha */}
                <div className="flex items-center gap-2 sm:gap-3">

                    {/* Contact Sales Modal */}
                    <ContactSalesDialog />

                    {/* Demo */}
                    <Link to="/auth/HR/signup" className="hidden sm:block">
                        <button className="px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 hover:opacity-90"
                            style={{
                                borderColor: "#003DA5", color: "#003DA5",
                                background: isDark ? "rgba(0,61,165,0.20)" : "transparent"
                            }}>
                            Probar Demo
                        </button>
                    </Link>

                    {/* Toggle tema */}
                    <button
                        onClick={toggleTheme}
                        className="flex items-center gap-2 px-2.5 sm:px-3 py-2 rounded-xl transition-all duration-200 border"
                        style={{
                            borderColor: isDark ? "rgba(0,61,165,0.40)" : "#e5e7eb",
                            background: isDark ? "rgba(0,61,165,0.18)" : "#f9fafb"
                        }}
                    >
                        <div className="flex items-center justify-center w-5 h-5 rounded-lg"
                            style={{ background: isDark ? "rgba(0,61,165,0.30)" : "#fef9c3" }}>
                            {isDark
                                ? <Sun className="w-3.5 h-3.5 text-yellow-400" />
                                : <Moon className="w-3.5 h-3.5 text-blue-600" />
                            }
                        </div>
                        <span className="hidden sm:block text-xs font-medium"
                            style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                            {isDark ? "Claro" : "Oscuro"}
                        </span>
                        {/* Pill */}
                        <div className="flex-shrink-0 w-7 h-3.5 rounded-full relative transition-colors duration-300"
                            style={{ background: isDark ? "#003DA5" : "#d9e2f2" }}>
                            <div className="absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white shadow-sm transition-all duration-300"
                                style={{ left: isDark ? "15px" : "2px" }} />
                        </div>
                    </button>

                    {/* Instalar PWA */}
                    {installPrompt && !isInstalled && (
                        <button onClick={handleInstall}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                            style={{ background: "linear-gradient(135deg, #003DA5, #00247D)" }}>
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
                        style={{ background: isDark ? "rgba(0,61,165,0.25)" : "#d9e2f2", color: isDark ? "#8fb2e8" : "#003DA5" }}>
                        <ShieldCheck className="w-4 h-4" />
                        Sistema de Gestión Condominial
                    </div>

                    {/* Título */}
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight"
                        style={{ color: isDark ? "#ffffff" : "#111827" }}>
                        Gestiona tu equipo de forma{" "}
                        <span style={{ color: "#003DA5" }} className="italic">inteligente.</span>
                    </h1>

                    {/* Descripción */}
                    <p className="text-base sm:text-xl leading-relaxed"
                        style={{ color: isDark ? "rgba(255,255,255,0.55)" : "#4b5563" }}>
                        Optimiza el control de asistencia, nómina y comunicación interna en una sola plataforma.
                        Diseñada para condominios modernos que buscan eficiencia y transparencia.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-center lg:justify-start">
                        <Link to="/auth/HR/signup" className="w-full sm:w-auto">
                            <button className="w-full sm:w-auto flex items-center justify-center gap-2
                                px-6 sm:px-8 py-3.5 sm:py-4 text-base sm:text-lg font-semibold rounded-xl
                                text-white transition-all duration-200 hover:opacity-90 hover:scale-105"
                                style={{
                                    background: "linear-gradient(135deg, #003DA5, #00247D)",
                                    boxShadow: "0 8px 25px rgba(0,61,165,0.35)"
                                }}>
                                Empezar como HR-Admin
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </Link>
                        <Link to="/auth/employee/login" className="w-full sm:w-auto">
                            <button className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 text-base sm:text-lg font-medium
                                rounded-xl transition-colors underline decoration-blue-300"
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
                                    ? "rgba(0,61,165,0.18)"
                                    : "linear-gradient(135deg, rgba(0,61,165,0.06), rgba(0,36,125,0.06))",
                                borderColor: isDark ? "rgba(0,61,165,0.40)" : "#dde5ff"
                            }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: "linear-gradient(135deg, #003DA5, #00247D)" }}>
                                <Zap className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold"
                                    style={{ color: isDark ? "#ffffff" : "#111827" }}>
                                    Instala SGC en tu móvil
                                </p>
                                <p className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#6b7280" }}>
                                    Accede rápido desde tu pantalla de inicio
                                </p>
                            </div>
                            <button onClick={handleInstall}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                                    text-white flex-shrink-0 transition-all hover:opacity-90"
                                style={{ background: "linear-gradient(135deg, #003DA5, #00247D)" }}>
                                <Download className="w-3.5 h-3.5" />
                                Instalar
                            </button>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="pt-6 sm:pt-8 flex flex-wrap justify-center lg:justify-start gap-6 sm:gap-8 border-t"
                        style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "#dde5ff" }}>
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
                            <Users className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "#003DA5" }} />
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
                        style={{ background: isDark ? "#003DA5" : "#d9e2f2" }} />
                    <div className="absolute -bottom-10 -right-10 w-48 sm:w-64 h-48 sm:h-64 rounded-full
                        mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
                        style={{ background: isDark ? "#00247D" : "#bfdbfe", animationDelay: "700ms" }} />

                    <div className="relative rounded-2xl shadow-2xl overflow-hidden
                        transform hover:-rotate-1 transition-transform duration-500 border"
                        style={{
                            background: isDark ? "#0d0d18" : "#ffffff",
                            borderColor: isDark ? "rgba(0,61,165,0.40)" : "#dde5ff"
                        }}>
                        <div className="p-2 flex gap-1.5 border-b"
                            style={{
                                background: isDark ? "#1a1a2e" : "#f9fafb",
                                borderColor: isDark ? "rgba(255,255,255,0.08)" : "#dde5ff"
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

            {/* ============ SECCIÓN: CARACTERÍSTICAS ============ */}
            <section id="caracteristicas" className="border-t transition-colors duration-300"
                style={{ borderColor: isDark ? "rgba(0,61,165,0.25)" : "#dde5ff" }}>
                <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-20 py-16 sm:py-24">

                    {/* Encabezado de sección */}
                    <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold"
                            style={{
                                background: isDark ? "rgba(252,227,0,0.18)" : "#fffbd9",
                                color: isDark ? "#ffe45e" : "#8a7600"
                            }}>
                            <Zap className="w-4 h-4" />
                            Hecho para condominios modernos
                        </span>
                        <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight"
                            style={{ color: isDark ? "#ffffff" : "#111827" }}>
                            Todo lo que tu comunidad necesita,{" "}
                            <span style={{ color: "#003DA5" }}>en un solo lugar</span>
                        </h2>
                        <p className="mt-4 text-base sm:text-lg leading-relaxed"
                            style={{ color: isDark ? "rgba(255,255,255,0.55)" : "#4b5563" }}>
                            Desde el control de asistencia hasta la nómina y la comunicación interna:
                            herramientas diseñadas para simplificar la gestión de tu condominio.
                        </p>
                    </div>

                    {/* Grid de features */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {features.map((f, i) => (
                            <div key={f.title}
                                className="group relative flex flex-col rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                                style={{
                                    background: isDark ? "#0d0d18" : "#ffffff",
                                    borderColor: isDark ? "rgba(0,61,165,0.40)" : "#dde5ff",
                                    boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.04)"
                                }}>
                                {/* Imagen del feature */}
                                <div className="relative h-44 overflow-hidden flex-shrink-0"
                                    style={{ background: isDark ? "#1a1a2e" : "#f2f6ff" }}>
                                    <img src={f.img} alt={f.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    {/* Badge número */}
                                    <div className="absolute top-3 left-3 flex items-center justify-center w-9 h-9 rounded-xl text-sm font-bold text-white shadow-lg"
                                        style={{ background: "linear-gradient(135deg, #003DA5, #00247D)" }}>
                                        {i + 1}
                                    </div>
                                </div>
                                {/* Contenido */}
                                <div className="flex flex-col flex-1 p-5 sm:p-6 gap-2.5">
                                    <div className="flex items-center gap-2">
                                        <f.icon className="w-5 h-5 flex-shrink-0" style={{ color: isDark ? "#8fb2e8" : "#003DA5" }} />
                                        <h3 className="text-lg sm:text-xl font-bold leading-snug"
                                            style={{ color: isDark ? "#ffffff" : "#111827" }}>
                                            {f.title}
                                        </h3>
                                    </div>
                                    <p className="text-sm leading-relaxed flex-1"
                                        style={{ color: isDark ? "rgba(255,255,255,0.55)" : "#4b5563" }}>
                                        {f.desc}
                                    </p>
                                    <a href="#" className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all hover:gap-2.5"
                                        style={{ color: isDark ? "#8fb2e8" : "#003DA5" }}>
                                        Conocer más
                                        <ArrowRight className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============ SECCIÓN: CÓMO FUNCIONA ============ */}
            <section id="como-funciona" className="border-y transition-colors duration-300"
                style={{ background: isDark ? "rgba(0,61,165,0.10)" : "#f2f6ff", borderColor: isDark ? "rgba(0,61,165,0.25)" : "#dde5ff" }}>
                <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-20 py-16 sm:py-24">

                    <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold"
                            style={{
                                background: isDark ? "rgba(252,227,0,0.18)" : "#fffbd9",
                                color: isDark ? "#ffe45e" : "#8a7600"
                            }}>
                            <CheckCircle2 className="w-4 h-4" />
                            ¿Cómo funciona?
                        </span>
                        <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight"
                            style={{ color: isDark ? "#ffffff" : "#111827" }}>
                            En pocas semanas tu condominio{" "}
                            <span style={{ color: "#003DA5" }}>funciona en CondoVE</span>
                        </h2>
                        <p className="mt-4 text-base sm:text-lg leading-relaxed"
                            style={{ color: isDark ? "rgba(255,255,255,0.55)" : "#4b5563" }}>
                            Un proceso simple y guiado para que administres tu comunidad sin complicaciones.
                        </p>
                    </div>

                    {/* Pasos */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8 sm:gap-6">
                        {steps.map((s, i) => (
                            <div key={s.title} className="relative flex flex-col items-center text-center gap-3">
                                {/* Conector desktop */}
                                {i < steps.length - 1 && (
                                    <div className="hidden xl:block absolute top-6 left-[calc(50%+28px)] w-[calc(100%-56px)] h-0.5 rounded-full"
                                        style={{ background: isDark ? "rgba(0,61,165,0.40)" : "#c7d7f5" }} />
                                )}
                                <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl text-white font-extrabold text-lg shadow-lg flex-shrink-0"
                                    style={{ background: "linear-gradient(135deg, #003DA5, #00247D)" }}>
                                    {i + 1}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <s.icon className="w-4 h-4 flex-shrink-0" style={{ color: isDark ? "#8fb2e8" : "#003DA5" }} />
                                    <h3 className="text-sm font-bold" style={{ color: isDark ? "#ffffff" : "#111827" }}>
                                        {s.title}
                                    </h3>
                                </div>
                                <p className="text-xs leading-relaxed max-w-[220px]"
                                    style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                    {s.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer — componente reutilizable */}
            <Footer appName="SGC" appSubtitle="Sistema de Gestión Condominial" isDark={isDark} />
        </div>
    )
}
