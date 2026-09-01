import { useState } from "react"
import { Link } from "react-router-dom"
import { useIsDark } from "../../hooks/useIsDark.js"
import { useToast } from "../../hooks/use-toast.js"
import { CustomSelect } from "../../components/ui/custom-select.jsx"
import { Footer } from "../../components/common/Footer.jsx"
import { PublicNavbar } from "../../components/common/PublicNavbar.jsx"
import { 
    Building2, 
    Users, 
    Truck, 
    Headphones, 
    Rocket, 
    Handshake,
    Mail,
    Phone,
    Clock,
    ChevronDown,
    ChevronUp
} from "lucide-react"
import axios from "axios"

const API_URL = import.meta.env.VITE_BACKEND_API

const inputCls = `w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200
    bg-gray-50 border border-gray-200 text-gray-900
    focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
    dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.12)] dark:text-white
    dark:focus:border-[rgba(142,178,232,0.6)] dark:focus:bg-[rgba(0,61,165,0.08)] dark:focus:ring-0`

const labelCls = `text-xs font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 text-gray-500 dark:text-[rgba(255,255,255,0.65)]`

// Categorías de contacto
const contactCategories = [
    { icon: Building2, title: "Administradores", desc: "Gestiona tu condominio con herramientas profesionales" },
    { icon: Users, title: "Residentes", desc: "Accede a servicios y comunícate con tu administración" },
    { icon: Truck, title: "Proveedores", desc: "Ofrece tus servicios a condominios de Venezuela" },
    { icon: Headphones, title: "Soporte técnico", desc: "¿Tienes problemas? Estamos aquí para ayudarte" },
    { icon: Rocket, title: "Ventas/Demo", desc: "Descubre cómo CondoVE SGC puede transformar tu gestión" },
    { icon: Handshake, title: "Alianzas", desc: "Construyamos juntos el futuro de la gestión condominial" }
]

// Preguntas frecuentes
const faqs = [
    {
        q: "¿Qué es CondoVE SGC?",
        a: "CondoVE SGC es un Sistema de Gestión Condominial integral diseñado para optimizar la administración de condominios en Venezuela. Permite gestionar residentes, pagos, mantenimiento, comunicaciones y más desde una sola plataforma."
    },
    {
        q: "¿Cuánto cuesta el sistema?",
        a: "Ofrecemos planes flexibles adaptados al tamaño de tu condominio. Contáctanos para una cotización personalizada basada en tus necesidades específicas."
    },
    {
        q: "¿Cómo funciona la implementación?",
        a: "El proceso es simple: 1) Contacto inicial, 2) Demostración personalizada, 3) Configuración del sistema, 4) Capacitación del equipo, 5) Soporte continuo. Todo el proceso toma entre 1-2 semanas."
    },
    {
        q: "¿Tienen soporte técnico?",
        a: "Sí, ofrecemos soporte técnico 24/7 por múltiples canales: chat en vivo, email, teléfono y WhatsApp. Nuestro equipo está siempre disponible para ayudarte."
    },
    {
        q: "¿Se integra con otros sistemas?",
        a: "CondoVE SGC cuenta con API abierta para integraciones. Podemos conectarnos con sistemas de pagos, contabilidad y otros servicios que utilice tu condominio."
    },
    {
        q: "¿Es seguro el sistema?",
        a: "Absolutamente. Utilizamos encriptación de grado bancario, backups automáticos diarios y cumplimos con los estándares más altos de seguridad de la industria."
    }
]

export const ContactPage = () => {
    const { isDark } = useIsDark()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [openFaq, setOpenFaq] = useState(null)
    
    const [formData, setFormData] = useState({
        inquiryType: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        companyName: "",
        website: "",
        country: "",
        message: "",
        privacyAccepted: false
    })

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validación de campos requeridos
        if (!formData.inquiryType || !formData.firstName || !formData.lastName || 
            !formData.email || !formData.companyName || !formData.country || !formData.message) {
            toast({
                variant: "destructive",
                title: "Campos incompletos",
                description: "Por favor completa todos los campos obligatorios."
            })
            return
        }

        // Validación de privacidad
        if (!formData.privacyAccepted) {
            toast({
                variant: "destructive",
                title: "Política de privacidad",
                description: "Debes aceptar la política de privacidad para continuar."
            })
            return
        }

        setIsLoading(true)
        try {
            const response = await axios.post(`${API_URL}/api/v1/contact/general`, formData)

            if (response.data.success) {
                toast({
                    variant: "success",
                    title: "¡Mensaje Enviado!",
                    description: "Nos pondremos en contacto contigo pronto."
                })
                // Reset form
                setFormData({
                    inquiryType: "",
                    firstName: "",
                    lastName: "",
                    email: "",
                    phone: "",
                    companyName: "",
                    website: "",
                    country: "",
                    message: "",
                    privacyAccepted: false
                })
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Ocurrió un error al enviar el formulario."
            toast({
                variant: "destructive",
                title: "Error de Envío",
                description: errorMsg
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col transition-colors duration-300"
            style={{ background: isDark ? "#0f0f1a" : "#ffffff" }}>

            {/* Navbar */}
            <PublicNavbar />

            {/* Hero Section */}
            <section className="relative overflow-hidden px-5 sm:px-8 lg:px-20 py-16 sm:py-24">
                {/* Decorative blobs */}
                <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
                    style={{ background: isDark ? "#8fb2e8" : "#d9e2f2" }} />
                <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
                    style={{ background: isDark ? "#8fb2e8" : "#bfdbfe", animationDelay: "700ms" }} />

                <div className="relative max-w-4xl mx-auto text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6"
                        style={{ 
                            background: isDark ? "rgba(0,61,165,0.25)" : "#d9e2f2", 
                            color: isDark ? "#8fb2e8" : "#003DA5" 
                        }}>
                        <Mail className="w-4 h-4" />
                        Contáctanos
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6"
                        style={{ color: isDark ? "#ffffff" : "#111827" }}>
                        ¿Cómo podemos{" "}
                        <span style={{ color: isDark ? "#8fb2e8" : "#003DA5" }} className="italic">ayudarte</span>?
                    </h1>
                    <p className="text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto"
                        style={{ color: isDark ? "rgba(255,255,255,0.55)" : "#4b5563" }}>
                        Gestiona tu condominio de forma inteligente con CondoVE SGC. 
                        Estamos aquí para resolver tus dudas.
                    </p>
                </div>
            </section>

            {/* Categorías de contacto */}
            <section className="px-5 sm:px-8 lg:px-20 pb-12">
                <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {contactCategories.map((cat, idx) => (
                        <div
                            key={idx}
                            className="group p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                            style={{
                                background: isDark ? "#1a1a2e" : "#ffffff",
                                borderColor: isDark ? "rgba(0,61,165,0.25)" : "#d9e2f2"
                            }}
                            onClick={() => {
                                setFormData(prev => ({ ...prev, inquiryType: cat.title }))
                                document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" })
                            }}
                        >
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors"
                                style={{ 
                                    background: isDark ? "rgba(0,61,165,0.18)" : "#d9e2f2"
                                }}>
                                <cat.icon className="w-6 h-6" style={{ color: isDark ? "#8fb2e8" : "#003DA5" }} />
                            </div>
                            <h3 className="text-lg font-bold mb-2"
                                style={{ color: isDark ? "#ffffff" : "#111827" }}>
                                {cat.title}
                            </h3>
                            <p className="text-sm"
                                style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#4b5563" }}>
                                {cat.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Formulario principal */}
            <section id="contact-form" className="px-5 sm:px-8 lg:px-20 py-12 sm:py-16">
                <div className="max-w-4xl mx-auto rounded-3xl p-6 sm:p-10 border"
                    style={{
                        background: isDark ? "#1a1a2e" : "#ffffff",
                        borderColor: isDark ? "rgba(0,61,165,0.25)" : "#d9e2f2"
                    }}>
                    <div className="mb-8">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2"
                            style={{ color: isDark ? "#8fb2e8" : "#003DA5" }}>
                            Formulario de contacto
                        </p>
                        <h2 className="text-2xl sm:text-3xl font-bold"
                            style={{ color: isDark ? "#ffffff" : "#111827" }}>
                            Envíanos un mensaje
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Tipo de consulta */}
                        <div>
                            <label className={labelCls}>Tipo de consulta *</label>
                            <CustomSelect
                                value={formData.inquiryType}
                                onValueChange={(val) => setFormData(p => ({ ...p, inquiryType: val }))}
                                options={[
                                    { value: "Administradores", label: "Administrador de condominio" },
                                    { value: "Residentes", label: "Residente" },
                                    { value: "Proveedores", label: "Proveedor" },
                                    { value: "Soporte técnico", label: "Soporte técnico" },
                                    { value: "Ventas/Demo", label: "Ventas/Demo" },
                                    { value: "Alianzas", label: "Alianzas estratégicas" },
                                    { value: "Otro", label: "Otro" }
                                ]}
                                placeholder="Selecciona una opción"
                                disabled={isLoading}
                                accentColor="blue"
                            />
                        </div>

                        {/* Nombre y Apellido */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                                <label htmlFor="firstName" className={labelCls}>Nombre *</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    placeholder="Tu nombre"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className={inputCls}
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <label htmlFor="lastName" className={labelCls}>Apellido *</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    placeholder="Tu apellido"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className={inputCls}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Email y Teléfono */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                                <label htmlFor="email" className={labelCls}>Email *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="tu@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={inputCls}
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <label htmlFor="phone" className={labelCls}>Teléfono</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    placeholder="+58 XXX XXX XXXX"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={inputCls}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Empresa y Website */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                                <label htmlFor="companyName" className={labelCls}>Condominio/Empresa *</label>
                                <input
                                    type="text"
                                    id="companyName"
                                    name="companyName"
                                    placeholder="Nombre del condominio"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    className={inputCls}
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <label htmlFor="website" className={labelCls}>Website</label>
                                <input
                                    type="url"
                                    id="website"
                                    name="website"
                                    placeholder="https://..."
                                    value={formData.website}
                                    onChange={handleChange}
                                    className={inputCls}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* País */}
                        <div>
                            <label htmlFor="country" className={labelCls}>País *</label>
                            <input
                                type="text"
                                id="country"
                                name="country"
                                placeholder="Tu país"
                                value={formData.country}
                                onChange={handleChange}
                                className={inputCls}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Mensaje */}
                        <div>
                            <label htmlFor="message" className={labelCls}>Mensaje *</label>
                            <textarea
                                id="message"
                                name="message"
                                rows={5}
                                placeholder="¿Cómo podemos ayudarte?"
                                value={formData.message}
                                onChange={handleChange}
                                className={`${inputCls} resize-none`}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Checkbox de privacidad */}
                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                id="privacyAccepted"
                                name="privacyAccepted"
                                checked={formData.privacyAccepted}
                                onChange={handleChange}
                                className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-[rgba(142,178,232,0.4)] dark:bg-[rgba(0,61,165,0.18)]"
                                disabled={isLoading}
                            />
                            <label 
                                htmlFor="privacyAccepted"
                                className="text-sm"
                                style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#4b5563" }}
                            >
                                Acepto la{" "}
                                <a href="#" className="underline hover:opacity-80" style={{ color: isDark ? "#8fb2e8" : "#003DA5" }}>
                                    Política de Privacidad
                                </a>{" "}
                                y el tratamiento de mis datos personales. *
                            </label>
                        </div>

                        {/* Botón submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-base font-semibold text-white transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                background: "linear-gradient(135deg, #003DA5, #00247D)",
                                boxShadow: "0 8px 25px rgba(0,61,165,0.3)"
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Enviando...
                                </>
                            ) : "Enviar mensaje"}
                        </button>
                    </form>
                </div>
            </section>

            {/* Información de contacto */}
            <section className="px-5 sm:px-8 lg:px-20 py-12"
                style={{ background: isDark ? "#1a1a2e" : "#f9fafb" }}>
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl sm:text-3xl font-bold"
                            style={{ color: isDark ? "#ffffff" : "#111827" }}>
                            Otras formas de contactarnos
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        <div className="text-center p-6 rounded-2xl border"
                            style={{
                                background: isDark ? "#0f0f1a" : "#ffffff",
                                borderColor: isDark ? "rgba(0,61,165,0.25)" : "#d9e2f2"
                            }}>
                            <Mail className="w-8 h-8 mx-auto mb-3" style={{ color: isDark ? "#8fb2e8" : "#003DA5" }} />
                            <h3 className="font-semibold mb-1"
                                style={{ color: isDark ? "#ffffff" : "#111827" }}>Email</h3>
                            <p className="text-sm"
                                style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#4b5563" }}>soporte@condo.ve</p>
                        </div>
                        <div className="text-center p-6 rounded-2xl border"
                            style={{
                                background: isDark ? "#0f0f1a" : "#ffffff",
                                borderColor: isDark ? "rgba(0,61,165,0.25)" : "#d9e2f2"
                            }}>
                            <Phone className="w-8 h-8 mx-auto mb-3" style={{ color: isDark ? "#8fb2e8" : "#003DA5" }} />
                            <h3 className="font-semibold mb-1"
                                style={{ color: isDark ? "#ffffff" : "#111827" }}>Teléfono</h3>
                            <p className="text-sm"
                                style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#4b5563" }}>+58 XXX XXX XXXX</p>
                        </div>
                        <div className="text-center p-6 rounded-2xl border"
                            style={{
                                background: isDark ? "#0f0f1a" : "#ffffff",
                                borderColor: isDark ? "rgba(0,61,165,0.25)" : "#d9e2f2"
                            }}>
                            <Clock className="w-8 h-8 mx-auto mb-3" style={{ color: isDark ? "#8fb2e8" : "#003DA5" }} />
                            <h3 className="font-semibold mb-1"
                                style={{ color: isDark ? "#ffffff" : "#111827" }}>Horario</h3>
                            <p className="text-sm"
                                style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#4b5563" }}>Lun-Vie 9:00-18:00</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="px-5 sm:px-8 lg:px-20 py-12 sm:py-16">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl sm:text-3xl font-bold"
                            style={{ color: isDark ? "#ffffff" : "#111827" }}>
                            Preguntas frecuentes
                        </h2>
                    </div>
                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <div
                                key={idx}
                                className="rounded-2xl border overflow-hidden transition-all duration-300"
                                style={{
                                    background: isDark ? "#1a1a2e" : "#ffffff",
                                    borderColor: isDark ? "rgba(0,61,165,0.25)" : "#d9e2f2"
                                }}
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                    className="w-full flex items-center justify-between p-5 text-left transition-colors"
                                    style={{ 
                                        background: isDark 
                                            ? (openFaq === idx ? "rgba(0,61,165,0.08)" : "transparent") 
                                            : (openFaq === idx ? "#d9e2f2" : "transparent")
                                    }}
                                >
                                    <span className="font-semibold pr-4"
                                        style={{ color: isDark ? "#ffffff" : "#111827" }}>
                                        {faq.q}
                                    </span>
                                    {openFaq === idx ? (
                                        <ChevronUp className="w-5 h-5 flex-shrink-0" style={{ color: isDark ? "#8fb2e8" : "#003DA5" }} />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 flex-shrink-0" style={{ color: isDark ? "#8fb2e8" : "#003DA5" }} />
                                    )}
                                </button>
                                {openFaq === idx && (
                                    <div className="px-5 pb-5"
                                        style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#4b5563" }}>
                                        <p className="text-sm leading-relaxed">{faq.a}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer appName="SGC" appSubtitle="Sistema de Gestión Condominial" isDark={isDark} />
        </div>
    )
}
