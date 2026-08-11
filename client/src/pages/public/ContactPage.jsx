import { useState } from "react"
import { useIsDark } from "../../hooks/useIsDark"
import { useToast } from "../../hooks/use-toast.js"
import { CustomSelect } from "../../components/ui/custom-select.jsx"
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
    dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
    dark:focus:border-[rgba(99,102,241,0.5)] dark:focus:bg-[rgba(99,102,241,0.06)] dark:focus:ring-0`

const labelCls = `text-xs font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 text-gray-500 dark:text-[rgba(255,255,255,0.5)]`

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
    const isDark = useIsDark()
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
        <div className={`min-h-screen ${isDark ? "bg-[#0a0a0f]" : "bg-gray-50"}`}>
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-10" />
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
                    <div className="text-center">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
                            ¿Cómo podemos ayudarte?
                        </h1>
                        <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto">
                            Gestiona tu condominio de forma inteligente con CondoVE SGC
                        </p>
                    </div>
                </div>
            </section>

            {/* Categorías de contacto */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {contactCategories.map((cat, idx) => (
                        <div
                            key={idx}
                            className={`group p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 cursor-pointer
                                ${isDark 
                                    ? "bg-[#1a1a2e] border-[rgba(99,102,241,0.15)] hover:border-[rgba(99,102,241,0.4)]" 
                                    : "bg-white border-gray-100 hover:border-blue-200 shadow-sm hover:shadow-lg"
                                }`}
                            onClick={() => {
                                setFormData(prev => ({ ...prev, inquiryType: cat.title }))
                                document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" })
                            }}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors
                                ${isDark 
                                    ? "bg-[rgba(99,102,241,0.1)] group-hover:bg-[rgba(99,102,241,0.2)]" 
                                    : "bg-blue-50 group-hover:bg-blue-100"
                                }`}>
                                <cat.icon className={`w-6 h-6 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
                            </div>
                            <h3 className={`text-lg font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                                {cat.title}
                            </h3>
                            <p className={`text-sm ${isDark ? "text-[rgba(255,255,255,0.5)]" : "text-gray-500"}`}>
                                {cat.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Formulario principal */}
            <section id="contact-form" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                <div className={`rounded-3xl p-6 sm:p-10 border
                    ${isDark 
                        ? "bg-[#1a1a2e] border-[rgba(99,102,241,0.15)]" 
                        : "bg-white border-gray-100 shadow-xl"
                    }`}>
                    <div className="mb-8">
                        <p className={`text-xs font-bold uppercase tracking-[0.2em] mb-2 ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                            Formulario de contacto
                        </p>
                        <h2 className={`text-2xl sm:text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
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
                                className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-[rgba(255,255,255,0.2)] dark:bg-[rgba(255,255,255,0.04)]"
                                disabled={isLoading}
                            />
                            <label 
                                htmlFor="privacyAccepted"
                                className={`text-sm ${isDark ? "text-[rgba(255,255,255,0.6)]" : "text-gray-600"}`}
                            >
                                Acepto la{" "}
                                <a href="#" className={`underline ${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}>
                                    Política de Privacidad
                                </a>{" "}
                                y el tratamiento de mis datos personales. *
                            </label>
                        </div>

                        {/* Botón submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-base font-bold text-white transition-all duration-300
                                bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700
                                disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_20px_rgba(99,102,241,0.25)] hover:shadow-[0_8px_25px_rgba(99,102,241,0.4)]"
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
            <section className={`py-16 ${isDark ? "bg-[#0f0f1a]" : "bg-white"}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className={`text-2xl sm:text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                            Otras formas de contactarnos
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        <div className={`text-center p-6 rounded-2xl ${isDark ? "bg-[#1a1a2e]" : "bg-gray-50"}`}>
                            <Mail className={`w-8 h-8 mx-auto mb-3 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
                            <h3 className={`font-semibold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>Email</h3>
                            <p className={`text-sm ${isDark ? "text-[rgba(255,255,255,0.5)]" : "text-gray-500"}`}>soporte@condo.ve</p>
                        </div>
                        <div className={`text-center p-6 rounded-2xl ${isDark ? "bg-[#1a1a2e]" : "bg-gray-50"}`}>
                            <Phone className={`w-8 h-8 mx-auto mb-3 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
                            <h3 className={`font-semibold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>Teléfono</h3>
                            <p className={`text-sm ${isDark ? "text-[rgba(255,255,255,0.5)]" : "text-gray-500"}`}>+58 XXX XXX XXXX</p>
                        </div>
                        <div className={`text-center p-6 rounded-2xl ${isDark ? "bg-[#1a1a2e]" : "bg-gray-50"}`}>
                            <Clock className={`w-8 h-8 mx-auto mb-3 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
                            <h3 className={`font-semibold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>Horario</h3>
                            <p className={`text-sm ${isDark ? "text-[rgba(255,255,255,0.5)]" : "text-gray-500"}`}>Lun-Vie 9:00-18:00</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                <div className="text-center mb-12">
                    <h2 className={`text-2xl sm:text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                        Preguntas frecuentes
                    </h2>
                </div>
                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <div
                            key={idx}
                            className={`rounded-2xl border overflow-hidden transition-all duration-300
                                ${isDark 
                                    ? "bg-[#1a1a2e] border-[rgba(99,102,241,0.15)]" 
                                    : "bg-white border-gray-100 shadow-sm"
                                }`}
                        >
                            <button
                                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                className={`w-full flex items-center justify-between p-5 text-left transition-colors
                                    ${isDark ? "hover:bg-[rgba(99,102,241,0.05)]" : "hover:bg-gray-50"}`}
                            >
                                <span className={`font-semibold pr-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                                    {faq.q}
                                </span>
                                {openFaq === idx ? (
                                    <ChevronUp className={`w-5 h-5 flex-shrink-0 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
                                ) : (
                                    <ChevronDown className={`w-5 h-5 flex-shrink-0 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
                                )}
                            </button>
                            {openFaq === idx && (
                                <div className={`px-5 pb-5 ${isDark ? "text-[rgba(255,255,255,0.6)]" : "text-gray-600"}`}>
                                    <p className="text-sm leading-relaxed">{faq.a}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className={`py-12 border-t ${isDark ? "bg-[#0a0a0f] border-[rgba(255,255,255,0.05)]" : "bg-gray-50 border-gray-100"}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
                        <div>
                            <h4 className={`font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Producto</h4>
                            <ul className={`space-y-2 text-sm ${isDark ? "text-[rgba(255,255,255,0.5)]" : "text-gray-500"}`}>
                                <li><a href="#" className="hover:text-blue-500 transition-colors">Características</a></li>
                                <li><a href="#" className="hover:text-blue-500 transition-colors">Precios</a></li>
                                <li><a href="#" className="hover:text-blue-500 transition-colors">Integraciones</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className={`font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Empresa</h4>
                            <ul className={`space-y-2 text-sm ${isDark ? "text-[rgba(255,255,255,0.5)]" : "text-gray-500"}`}>
                                <li><a href="#" className="hover:text-blue-500 transition-colors">Sobre nosotros</a></li>
                                <li><a href="#" className="hover:text-blue-500 transition-colors">Blog</a></li>
                                <li><a href="/contact" className="hover:text-blue-500 transition-colors">Contacto</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className={`font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Legal</h4>
                            <ul className={`space-y-2 text-sm ${isDark ? "text-[rgba(255,255,255,0.5)]" : "text-gray-500"}`}>
                                <li><a href="#" className="hover:text-blue-500 transition-colors">Privacidad</a></li>
                                <li><a href="#" className="hover:text-blue-500 transition-colors">Términos</a></li>
                                <li><a href="#" className="hover:text-blue-500 transition-colors">Cookies</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className={`pt-8 border-t text-center text-sm ${isDark ? "border-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.4)]" : "border-gray-200 text-gray-500"}`}>
                        <p>© {new Date().getFullYear()} CondoVE SGC. Todos los derechos reservados.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
