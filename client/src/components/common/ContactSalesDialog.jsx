import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog"
import { useToast } from "../../hooks/use-toast.js"
import { Mail, CheckCircle2, Rocket, Building2, User, MessageSquare } from "lucide-react"
import axios from "axios"
import { CustomSelect } from "../ui/custom-select.jsx"

// ✅ Fix 1 — usar VITE_EMPLOYEE_API que ya apunta al backend correcto
const API_URL = import.meta.env.VITE_BACKEND_API

const inputCls = `w-full rounded-xl px-3 py-2.5 sm:py-2 text-sm outline-none transition-all duration-200
    bg-gray-50 border border-gray-200 text-gray-900
    focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
    dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
    dark:focus:border-[rgba(99,102,241,0.5)] dark:focus:bg-[rgba(99,102,241,0.06)] dark:focus:ring-0`

const labelCls = `text-xs font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 text-gray-500 dark:text-[rgba(255,255,255,0.5)]`

export const ContactSalesDialog = () => {
    const { toast } = useToast()
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        fullname: "",
        workemail: "",
        companyname: "",
        companysize: "",
        message: ""
    })

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (Object.values(formData).some(v => !v)) {
            toast({
                variant: "destructive",
                title: "Campos incompletos",
                description: "Completa todos los campos."
            })
            return
        }

        setIsLoading(true)
        try {
            // ✅ Fix 2 — ruta correcta /api/v1/contact/sales
            const response = await axios.post(`${API_URL}/api/v1/contact/sales`, formData)

            if (response.data.success) {
                toast({
                    variant: "success",
                    title: "¡Mensaje Enviado!",
                    description: "Nuestro equipo de ventas se contactará contigo pronto.",
                })
                setFormData({ fullname: "", workemail: "", companyname: "", companysize: "", message: "" })
                setIsOpen(false)
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Ocurrió un error al enviar el formulario."
            toast({
                variant: "destructive",
                title: "Error de Envío",
                description: errorMsg,
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button className="relative group flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300
                    text-white bg-[#111827] hover:bg-[#1f2937] border border-gray-800 shadow-xl shadow-gray-900/10
                    dark:bg-[#ffffff] dark:hover:bg-gray-100 dark:text-[#111827] dark:border-white/90 dark:shadow-white/10
                    hover:-translate-y-0.5"
                >
                    <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                        <Rocket className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        Hablemos
                    </span>
                    <div className="absolute inset-0 rounded-full blur-md bg-gradient-to-r from-blue-500/30 to-purple-500/30 dark:from-blue-400/40 dark:to-purple-400/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
            </DialogTrigger>

            <DialogContent className="max-w-[400px] sm:max-w-[550px] md:max-w-[650px] w-[calc(100%-24px)] mx-auto p-0 overflow-hidden
                bg-white border border-gray-100 shadow-2xl rounded-3xl
                dark:bg-[#0f0f1a] dark:border-[rgba(99,102,241,0.15)]
                [&>button]:text-gray-500 [&>button]:dark:text-white [&>button]:dark:hover:text-white
                [&>button]:dark:bg-[rgba(255,255,255,0.08)] [&>button]:dark:hover:bg-[rgba(255,255,255,0.15)]
                [&>button]:rounded-full [&>button]:p-1">

                <div className="flex flex-col md:flex-row h-full">
                    {/* Left Side Branding */}
                    <div className="hidden md:flex flex-col justify-between w-[240px] p-8 text-white relative overflow-hidden shrink-0"
                        style={{ background: "linear-gradient(135deg, #0d0d18, #1a1a2e)" }}>
                        <div className="absolute -top-16 -left-16 w-32 h-32 rounded-full bg-blue-500/20 blur-3xl" />
                        <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full bg-purple-500/10 blur-3xl" />
                        <div className="relative z-10 flex flex-col gap-4">
                            <span className="text-2xl font-bold tracking-tight">
                                CondoVE<span className="text-blue-500" style={{ fontSize: "0.7em", marginLeft: "0.1em" }}>SGC</span>.
                            </span>
                            <h3 className="text-lg font-bold leading-tight mt-4 text-[rgba(255,255,255,0.9)]">
                                Potencia a tu equipo como los líderes de la industria
                            </h3>
                            <p className="text-sm font-medium text-[rgba(255,255,255,0.5)] mt-2 leading-relaxed">
                                Cuéntanos sobre tus necesidades y nuestro equipo se contactará contigo para una demostración personalizada.
                            </p>
                        </div>
                        <div className="relative z-10 flex items-center gap-2 mt-8 text-xs font-semibold text-[rgba(255,255,255,0.4)] uppercase tracking-wider">
                            <CheckCircle2 className="w-4 h-4 text-blue-400" />
                            Soporte 24/7 Premium
                        </div>
                    </div>

                    {/* Right Side Form */}
                    <div className="flex-1 p-6 sm:p-8 max-h-[85vh] overflow-y-auto">
                        <div className="mb-6 md:mb-8">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-2">
                                Contacto Comercial
                            </p>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
                                Hablemos de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">tu empresa</span>
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-[rgba(255,255,255,0.4)] mt-2 md:hidden">
                                Cuéntanos sobre tus necesidades y te contactaremos a la brevedad.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                <div className="flex flex-col">
                                    <label htmlFor="fullname" className={labelCls}>
                                        <User className="w-3.5 h-3.5" /> Nombre Completo
                                    </label>
                                    <input type="text" id="fullname" name="fullname"
                                        placeholder="Ej. Jane Doe"
                                        value={formData.fullname} onChange={handleChange}
                                        className={inputCls} disabled={isLoading} />
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="workemail" className={labelCls}>
                                        <Mail className="w-3.5 h-3.5" /> Correo Laboral
                                    </label>
                                    <input type="email" id="workemail" name="workemail"
                                        placeholder="jane@empresa.com"
                                        value={formData.workemail} onChange={handleChange}
                                        className={inputCls} disabled={isLoading} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                <div className="flex flex-col">
                                    <label htmlFor="companyname" className={labelCls}>
                                        <Building2 className="w-3.5 h-3.5" /> Empresa
                                    </label>
                                    <input type="text" id="companyname" name="companyname"
                                        placeholder="Nombre de tu empresa"
                                        value={formData.companyname} onChange={handleChange}
                                        className={inputCls} disabled={isLoading} />
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="companysize" className={labelCls}>
                                        Tamaño Equipo
                                    </label>
                                    <CustomSelect
                                        value={formData.companysize}
                                        onValueChange={(val) => setFormData(p => ({ ...p, companysize: val }))}
                                        options={[
                                            { value: "1-50", label: "1 - 50 empleados" },
                                            { value: "51-200", label: "51 - 200 empleados" },
                                            { value: "201-500", label: "201 - 500 empleados" },
                                            { value: "500+", label: "Más de 500 empleados" }
                                        ]}
                                        placeholder="Selecciona un rango"
                                        disabled={isLoading}
                                        accentColor="blue"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="message" className={labelCls}>
                                    <MessageSquare className="w-3.5 h-3.5" /> ¿Cómo podemos ayudarte?
                                </label>
                                <textarea id="message" name="message" rows={4}
                                    placeholder="Cuéntanos brevemente sobre tus retos actuales..."
                                    value={formData.message} onChange={handleChange}
                                    className={`${inputCls} resize-none`}
                                    disabled={isLoading} />
                            </div>

                            <div className="pt-2">
                                <button type="submit" disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 rounded-xl text-base sm:text-sm font-bold text-white transition-all duration-300
                                        bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700
                                        disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_20px_rgba(99,102,241,0.25)] hover:shadow-[0_8px_25px_rgba(99,102,241,0.4)]">
                                    {isLoading ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Enviando...
                                        </>
                                    ) : "Solicitar Demostración"}
                                </button>
                                <p className="text-center text-[10px] sm:text-xs text-gray-400 dark:text-[rgba(255,255,255,0.3)] mt-4">
                                    Al continuar, aceptas nuestras <a href="#" className="underline hover:text-blue-500">Políticas de Privacidad</a>.
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
