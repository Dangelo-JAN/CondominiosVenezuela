import { Link } from "react-router-dom"
import { useState } from "react"
import {
    ArrowRight, BookOpen, Building2, CalendarCheck2, CalendarClock,
    CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Clock3,
    Database, Download, Fingerprint, Handshake, HelpCircle, KeyRound,
    Lock, Mail, Megaphone, Quote, ShieldCheck, Smartphone,
    Sparkles, TrendingUp, UserPlus, Users, Zap
} from "lucide-react"
import { useTheme } from "../../hooks/useTheme.js"
import { Footer } from "../../components/common/Footer.jsx"
import { PublicNavbar } from "../../components/common/PublicNavbar.jsx"
import { usePWAPrompt } from "../../contexts/PWAContext.jsx"

export const EntryPage = () => {
    const { isDark } = useTheme()
    const { installPrompt, isInstalled, handleInstall } = usePWAPrompt()
    const [testimonialIndex, setTestimonialIndex] = useState(0)
    const [testimonialVisible, setTestimonialVisible] = useState(true)
    const [openFaq, setOpenFaq] = useState(0)

    const resources = [
        {
            cover: "/assets/ebooks/guia-gestion-condominios.svg",
            title: "Guía práctica de gestión de condominios",
            desc: "Los fundamentos para administrar tu comunidad de forma moderna y eficiente."
        },
        {
            cover: "/assets/ebooks/control-asistencia.svg",
            title: "Control de asistencia para tu comunidad",
            desc: "Cómo digitalizar el registro de entradas y salidas de tu equipo."
        },
        {
            cover: "/assets/ebooks/comunicacion-equipo.svg",
            title: "Comunicación efectiva con tu equipo",
            desc: "Avisos y notificaciones que llegan a todos, al instante."
        }
    ]

    const faqs = [
        {
            q: "¿Qué es CondoVE SGC?",
            a: "Es un sistema de gestión condominial integral que centraliza el control de asistencia, los avisos y la comunicación interna en una sola plataforma, diseñada para el mercado venezolano."
        },
        {
            q: "¿Puedo usarlo aunque nunca haya usado software de gestión?",
            a: "Sí. El proceso de configuración es guiado: registras tu condominio, cargas los departamentos y empleados, e invitas a tu equipo por correo. En pocas semanas ya estás operando."
        },
        {
            q: "¿Cómo registran la asistencia los empleados?",
            a: "Desde la aplicación móvil con foto y geolocalización. El sistema detecta tardanzas, faltas y horas extra automáticamente y notifica en tiempo real."
        },
        {
            q: "¿La información de mi condominio está segura?",
            a: "Sí. Contamos con controles de seguridad alineados con SOC-2, cifrado de datos, copias de seguridad automáticas y acceso por roles (administrador, HR y empleado)."
        },
        {
            q: "¿Puedo probar la plataforma antes de decidir?",
            a: "Por supuesto. Agenda una demostración con nuestro equipo y pruébala con la asistencia de nuestros ingenieros, sin compromiso."
        }
    ]

    const partners = [
        "Colegio de Administradores",
        "Cámara Inmobiliaria",
        "Federación de Condominios",
        "Asociación de Administradores"
    ]

    const testimonials = [
        {
            quote: "Redujimos un 60% el tiempo que dedicábamos a controlar la asistencia. Ahora todo se registra desde el móvil y la nómina se calcula sola.",
            name: "María González",
            role: "Administradora · Res. Los Jardines, Caracas"
        },
        {
            quote: "Las notificaciones push nos permitieron comunicar avisos a los 40 empleados al instante. La comunidad está más informada que nunca.",
            name: "José Rodríguez",
            role: "Gerente General · Torre Ávila, Maracaibo"
        },
        {
            quote: "Pasamos de planillas de Excel a reportes en tiempo real. Hoy tomamos decisiones con datos, no con corazonadas.",
            name: "Carolina Pérez",
            role: "Administradora · Urb. El Cafetal, Valencia"
        }
    ]

    const changeTestimonial = (next) => {
        setTestimonialVisible(false)
        setTimeout(() => {
            next()
            setTestimonialVisible(true)
        }, 200)
    }

    const nextTestimonial = () => changeTestimonial(() => setTestimonialIndex(i => (i + 1) % testimonials.length))
    const prevTestimonial = () => changeTestimonial(() => setTestimonialIndex(i => (i - 1 + testimonials.length) % testimonials.length))

    const securityItems = [
        { icon: Lock, title: "SOC-2", desc: "Controles de seguridad alineados con estándares internacionales." },
        { icon: Database, title: "Copias de seguridad", desc: "Respaldo automático de toda la información del condominio." },
        { icon: KeyRound, title: "Roles y permisos", desc: "Acceso por perfil: administrador, HR y empleado." },
        { icon: ShieldCheck, title: "Cifrado de datos", desc: "Comunicación segura cifrada de extremo a extremo." }
    ]

    const facts = [
        {
            icon: Clock3,
            stat: "70%",
            title: "de los condominios aún lleva la asistencia en papel o Excel",
            desc: "El registro manual genera errores, retrasos y pérdida de información. CondoVE digitaliza todo el proceso.",
            cta: "Conocer la solución"
        },
        {
            icon: CalendarClock,
            stat: "40%",
            title: "menos errores en la gestión de horarios y tareas",
            desc: "La planificación de turnos y las tareas se organizan desde la app: horarios claros, rotaciones automáticas y avisos a tiempo, sin planillas ni papel.",
            cta: "Ver cómo funciona"
        }
    ]

    const features = [
        {
            icon: Fingerprint,
            title: "Control de Asistencia",
            img: "/assets/HR-Dashboard/attendance.png",
            desc: "Registra entradas y salidas con foto y geolocalización. Detecta tardanzas, faltas y horas extra al instante, directo desde el móvil."
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
        { icon: Building2, title: "Configura", desc: "Carga Departamentos, Empleados y Horarios." },
        { icon: Mail, title: "Invita", desc: "Tus empleados reciben su invitación por correo." },
        { icon: CalendarCheck2, title: "Gestiona", desc: "Asistencias y avisos en un solo lugar." },
        { icon: Smartphone, title: "Usa la app", desc: "El equipo registra su asistencia desde el móvil." },
        { icon: TrendingUp, title: "Mide", desc: "Reportes en tiempo real para decidir mejor." }
    ]

    return (
        <div className="min-h-screen flex flex-col transition-colors duration-300"
            style={{ background: isDark ? "#0f0f1a" : "#ffffff" }}>

            {/* Navbar */}
            <PublicNavbar />

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
                                color: isDark ? "#ffe45e" : "#6b5700"
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
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
                                color: isDark ? "#ffe45e" : "#6b5700"
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

            {/* ============ SECCIÓN: TESTIMONIOS ============ */}
            <section id="testimonios" className="border-t transition-colors duration-300"
                style={{ borderColor: isDark ? "rgba(0,61,165,0.25)" : "#dde5ff" }}>
                <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-20 py-16 sm:py-24 text-center">

                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold"
                        style={{
                            background: isDark ? "rgba(252,227,0,0.18)" : "#fffbd9",
                            color: isDark ? "#ffe45e" : "#6b5700"
                        }}>
                        <Quote className="w-4 h-4" />
                        Testimonios
                    </span>
                    <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight"
                        style={{ color: isDark ? "#ffffff" : "#111827" }}>
                        Administradores que{" "}
                        <span style={{ color: "#003DA5" }}>ya lo viven</span>
                    </h2>

                    {/* Carrusel */}
                    <div className="mt-10 sm:mt-14 relative">
                        <div className={`flex flex-col items-center gap-6 transition-opacity duration-200 ${testimonialVisible ? "opacity-100" : "opacity-0"}`}
                            key={testimonialIndex}>
                            <Quote className="w-10 h-10 sm:w-12 sm:h-12" style={{ color: isDark ? "#8fb2e8" : "#003DA5", opacity: 0.4 }} />
                            <blockquote className="text-lg sm:text-2xl font-medium leading-relaxed max-w-2xl"
                                style={{ color: isDark ? "rgba(255,255,255,0.85)" : "#1f2937" }}>
                                "{testimonials[testimonialIndex].quote}"
                            </blockquote>
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex items-center justify-center w-12 h-12 rounded-full text-white font-bold text-base"
                                    style={{ background: "linear-gradient(135deg, #003DA5, #00247D)" }}>
                                    {testimonials[testimonialIndex].name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                                </div>
                                <p className="text-sm font-bold" style={{ color: isDark ? "#ffffff" : "#111827" }}>
                                    {testimonials[testimonialIndex].name}
                                </p>
                                <p className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                    {testimonials[testimonialIndex].role}
                                </p>
                            </div>
                        </div>

                        {/* Controles */}
                        <button onClick={prevTestimonial} aria-label="Testimonio anterior"
                            className="absolute -left-2 sm:left-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full border transition-all hover:scale-105"
                            style={{
                                color: isDark ? "rgba(255,255,255,0.7)" : "#003DA5",
                                borderColor: isDark ? "rgba(0,61,165,0.40)" : "#c7d7f5",
                                background: isDark ? "rgba(0,61,165,0.18)" : "#ffffff"
                            }}>
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={nextTestimonial} aria-label="Testimonio siguiente"
                            className="absolute -right-2 sm:right-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full border transition-all hover:scale-105"
                            style={{
                                color: isDark ? "rgba(255,255,255,0.7)" : "#003DA5",
                                borderColor: isDark ? "rgba(0,61,165,0.40)" : "#c7d7f5",
                                background: isDark ? "rgba(0,61,165,0.18)" : "#ffffff"
                            }}>
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Dots */}
                    <div className="mt-8 flex items-center justify-center gap-2">
                        {testimonials.map((t, i) => (
                            <button key={t.name} onClick={() => changeTestimonial(() => setTestimonialIndex(i))}
                                aria-label={`Ver testimonio ${i + 1}`}
                                className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                                style={{
                                    background: i === testimonialIndex
                                        ? "#003DA5"
                                        : (isDark ? "rgba(255,255,255,0.25)" : "#c7d7f5"),
                                    transform: i === testimonialIndex ? "scale(1.3)" : "scale(1)"
                                }} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ============ SECCIÓN: SABÍAS QUE… ============ */}
            <section id="sabias-que" className="border-y transition-colors duration-300"
                style={{ background: isDark ? "rgba(0,61,165,0.10)" : "#f2f6ff", borderColor: isDark ? "rgba(0,61,165,0.25)" : "#dde5ff" }}>
                <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-20 py-16 sm:py-24">
                    <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold"
                            style={{
                                background: isDark ? "rgba(252,227,0,0.18)" : "#fffbd9",
                                color: isDark ? "#ffe45e" : "#6b5700"
                            }}>
                            <TrendingUp className="w-4 h-4" />
                            Sabías que…
                        </span>
                        <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight"
                            style={{ color: isDark ? "#ffffff" : "#111827" }}>
                            La gestión manual tiene{" "}
                            <span style={{ color: "#003DA5" }}>un costo oculto</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                        {facts.map(f => (
                            <div key={f.title}
                                className="flex flex-col rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                                style={{
                                    background: isDark ? "#0d0d18" : "#ffffff",
                                    borderColor: isDark ? "rgba(0,61,165,0.40)" : "#dde5ff"
                                }}>
                                {/* Cover con stat */}
                                <div className="relative flex items-center justify-center gap-4 px-6 py-10 overflow-hidden"
                                    style={{ background: "linear-gradient(135deg, #003DA5, #00247D)" }}>
                                    <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
                                    <f.icon className="w-10 h-10 text-white/80" />
                                    <span className="text-5xl sm:text-6xl font-extrabold text-white">{f.stat}</span>
                                </div>
                                <div className="flex flex-col flex-1 p-6 sm:p-8 gap-3">
                                    <h3 className="text-lg sm:text-xl font-bold leading-snug"
                                        style={{ color: isDark ? "#ffffff" : "#111827" }}>
                                        {f.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed flex-1"
                                        style={{ color: isDark ? "rgba(255,255,255,0.55)" : "#4b5563" }}>
                                        {f.desc}
                                    </p>
                                    <a href="#" className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all hover:gap-2.5"
                                        style={{ color: isDark ? "#8fb2e8" : "#003DA5" }}>
                                        {f.cta}
                                        <ArrowRight className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============ SECCIÓN: SEGURIDAD ============ */}
            <section id="seguridad" className="border-t transition-colors duration-300"
                style={{ borderColor: isDark ? "rgba(0,61,165,0.25)" : "#dde5ff" }}>
                <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-20 py-16 sm:py-20">
                    <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-14">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold"
                            style={{
                                background: isDark ? "rgba(252,227,0,0.18)" : "#fffbd9",
                                color: isDark ? "#ffe45e" : "#6b5700"
                            }}>
                            <ShieldCheck className="w-4 h-4" />
                            Seguridad y confianza
                        </span>
                        <h2 className="mt-5 text-3xl sm:text-4xl font-extrabold leading-tight"
                            style={{ color: isDark ? "#ffffff" : "#111827" }}>
                            Tu información,{" "}
                            <span style={{ color: "#003DA5" }}>protegida</span>
                        </h2>
                        <p className="mt-4 text-base sm:text-lg leading-relaxed"
                            style={{ color: isDark ? "rgba(255,255,255,0.55)" : "#4b5563" }}>
                            La seguridad no es un extra: es parte del diseño.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {securityItems.map(s => (
                            <div key={s.title}
                                className="flex flex-col items-center text-center gap-3 rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1"
                                style={{
                                    background: isDark ? "#0d0d18" : "#ffffff",
                                    borderColor: isDark ? "rgba(0,61,165,0.40)" : "#dde5ff"
                                }}>
                                <div className="flex items-center justify-center w-12 h-12 rounded-2xl text-white shadow-lg flex-shrink-0"
                                    style={{ background: "linear-gradient(135deg, #003DA5, #00247D)" }}>
                                    <s.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-sm font-bold" style={{ color: isDark ? "#ffffff" : "#111827" }}>
                                    {s.title}
                                </h3>
                                <p className="text-xs leading-relaxed"
                                    style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                    {s.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============ SECCIÓN: RECURSOS ============ */}
            <section id="recursos" className="border-y transition-colors duration-300"
                style={{ background: isDark ? "rgba(0,61,165,0.10)" : "#f2f6ff", borderColor: isDark ? "rgba(0,61,165,0.25)" : "#dde5ff" }}>
                <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-20 py-16 sm:py-24">
                    <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold"
                            style={{
                                background: isDark ? "rgba(252,227,0,0.18)" : "#fffbd9",
                                color: isDark ? "#ffe45e" : "#6b5700"
                            }}>
                            <BookOpen className="w-4 h-4" />
                            Recursos
                        </span>
                        <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight"
                            style={{ color: isDark ? "#ffffff" : "#111827" }}>
                            Aprende a gestionar{" "}
                            <span style={{ color: "#003DA5" }}>mejor tu comunidad</span>
                        </h2>
                        <p className="mt-4 text-base sm:text-lg leading-relaxed"
                            style={{ color: isDark ? "rgba(255,255,255,0.55)" : "#4b5563" }}>
                            Guías prácticas creadas por nuestro equipo para administradores venezolanos.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {resources.map(r => (
                            <div key={r.title}
                                className="group flex flex-col rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                                style={{
                                    background: isDark ? "#0d0d18" : "#ffffff",
                                    borderColor: isDark ? "rgba(0,61,165,0.40)" : "#dde5ff"
                                }}>
                                <div className="overflow-hidden flex-shrink-0">
                                    <img src={r.cover} alt={r.title}
                                        className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105" />
                                </div>
                                <div className="flex flex-col flex-1 p-5 gap-2.5">
                                    <h3 className="text-sm font-bold leading-snug"
                                        style={{ color: isDark ? "#ffffff" : "#111827" }}>
                                        {r.title}
                                    </h3>
                                    <p className="text-xs leading-relaxed flex-1"
                                        style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                        {r.desc}
                                    </p>
                                    <a href="#" className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all hover:gap-2.5"
                                        style={{ color: isDark ? "#8fb2e8" : "#003DA5" }}>
                                        <Download className="w-4 h-4" />
                                        Descargar
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============ SECCIÓN: CTA FINAL ============ */}
            <section id="pruebalo" className="px-5 sm:px-8 lg:px-20 py-16 sm:py-24">
                <div className="relative max-w-7xl mx-auto rounded-2xl overflow-hidden px-6 sm:px-12 py-14 sm:py-20 text-center shadow-2xl"
                    style={{ background: "linear-gradient(135deg, #003DA5, #00247D)" }}>
                    <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-16 w-72 h-72 rounded-full bg-[#FCE300]/20 blur-3xl" />
                    <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-6">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold text-[#003DA5]"
                            style={{ background: "#FCE300" }}>
                            <Sparkles className="w-4 h-4" />
                            Pruébalo
                        </span>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-white">
                            Tu condominio merece una{" "}
                            <span className="text-[#FCE300]">gestión inteligente</span>
                        </h2>
                        <p className="text-base sm:text-lg leading-relaxed text-white/70 max-w-xl">
                            Agenda una demostración con nuestros ejecutivos y pruébala con la asistencia de nuestros ingenieros.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                            <Link to="/auth/HR/signup" className="w-full sm:w-auto">
                                <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 text-base font-semibold rounded-xl
                                    transition-all duration-200 hover:scale-105"
                                    style={{ background: "#FCE300", color: "#003DA5", boxShadow: "0 8px 25px rgba(252,227,0,0.3)" }}>
                                    Empezar como HR-Admin
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </Link>
                            <Link to="/auth/employee/login" className="w-full sm:w-auto">
                                <button className="w-full sm:w-auto px-6 sm:px-8 py-3.5 text-base font-medium rounded-xl border text-white
                                    transition-all duration-200 hover:bg-white/10"
                                    style={{ borderColor: "rgba(255,255,255,0.4)" }}>
                                    Acceso Empleados
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============ SECCIÓN: FAQ ============ */}
            <section id="faq" className="border-t transition-colors duration-300"
                style={{ borderColor: isDark ? "rgba(0,61,165,0.25)" : "#dde5ff" }}>
                <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-20 py-16 sm:py-24">
                    <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-14">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold"
                            style={{
                                background: isDark ? "rgba(252,227,0,0.18)" : "#fffbd9",
                                color: isDark ? "#ffe45e" : "#6b5700"
                            }}>
                            <HelpCircle className="w-4 h-4" />
                            Preguntas Frecuentes
                        </span>
                        <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight"
                            style={{ color: isDark ? "#ffffff" : "#111827" }}>
                            Resolvemos tus{" "}
                            <span style={{ color: "#003DA5" }}>dudas</span>
                        </h2>
                    </div>

                    <div className="flex flex-col gap-3">
                        {faqs.map((f, i) => {
                            const isOpen = openFaq === i
                            return (
                                <div key={f.q}
                                    className="rounded-2xl border overflow-hidden transition-colors duration-200"
                                    style={{
                                        background: isDark ? "#0d0d18" : "#ffffff",
                                        borderColor: isOpen
                                            ? (isDark ? "rgba(252,227,0,0.38)" : "#fef499")
                                            : (isDark ? "rgba(0,61,165,0.40)" : "#dde5ff")
                                    }}>
                                    <button onClick={() => setOpenFaq(isOpen ? null : i)}
                                        aria-expanded={isOpen}
                                        className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 text-left"
                                        style={{ color: isDark ? "#ffffff" : "#111827" }}>
                                        <span className="text-sm sm:text-base font-semibold">{f.q}</span>
                                        <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                                            style={{ color: isDark ? "#8fb2e8" : "#003DA5" }} />
                                    </button>
                                    {isOpen && (
                                        <div className="px-5 sm:px-6 pb-5">
                                            <p className="text-sm leading-relaxed"
                                                style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#4b5563" }}>
                                                {f.a}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* ============ SECCIÓN: ALIANZAS ============ */}
            <section id="alianzas" className="border-y transition-colors duration-300"
                style={{ background: isDark ? "rgba(0,61,165,0.10)" : "#f2f6ff", borderColor: isDark ? "rgba(0,61,165,0.25)" : "#dde5ff" }}>
                <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-20 py-14 sm:py-16 text-center">
                    <p className="text-sm sm:text-base font-semibold flex items-center justify-center gap-2"
                        style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                        <Handshake className="w-5 h-5" style={{ color: isDark ? "#8fb2e8" : "#003DA5" }} />
                        Alianzas estratégicas del sector
                    </p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                        {partners.map(p => (
                            <span key={p}
                                className="px-4 py-2 rounded-full text-sm font-semibold border transition-colors duration-200"
                                style={{
                                    color: isDark ? "rgba(255,255,255,0.7)" : "#003DA5",
                                    borderColor: isDark ? "rgba(0,61,165,0.40)" : "#c7d7f5",
                                    background: isDark ? "rgba(0,61,165,0.18)" : "#f2f6ff"
                                }}>
                                {p}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer — componente reutilizable */}
            <Footer appName="SGC" appSubtitle="Sistema de Gestión Condominial" isDark={isDark} />
        </div>
    )
}
