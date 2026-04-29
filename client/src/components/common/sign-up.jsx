import { ErrorPopup } from "./error-popup"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { Zap, ArrowRight, User, Mail, Phone, Lock, Building2, Globe, AtSign, FileText } from "lucide-react"

const InputField = ({ id, name, type = "text", label, icon: Icon, value, onChange, autoComplete, placeholder }) => (
    <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "rgba(255,255,255,0.45)" }}>
            {label}
        </label>
        <div className="relative">
            {Icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Icon className="w-4 h-4" style={{ color: "rgba(0,61,165,0.6)" }} />
                </div>
            )}
            <input
                id={id}
                name={name}
                type={type}
                required
                autoComplete={autoComplete}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full rounded-xl py-2.5 text-sm transition-all duration-200 outline-none"
                style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.9)",
                    paddingLeft: Icon ? "2.5rem" : "0.875rem",
                    paddingRight: "0.875rem",
                }}
                onFocus={e => {
                    e.target.style.border = "1px solid rgba(0,61,165,0.5)"
                    e.target.style.background = "rgba(0,61,165,0.06)"
                    e.target.style.boxShadow = "0 0 0 3px rgba(0,61,165,0.1)"
                }}
                onBlur={e => {
                    e.target.style.border = "1px solid rgba(255,255,255,0.08)"
                    e.target.style.background = "rgba(255,255,255,0.04)"
                    e.target.style.boxShadow = "none"
                }}
            />
        </div>
    </div>
)

export const SignUP = ({ handlesignupform, handlesubmitform, stateformdata, errorpopup }) => {
    const employeestate = useSelector((state) => state.HRReducer)

    return (
        <div className="min-h-screen w-full flex flex-col"
            style={{ background: "linear-gradient(160deg, #0a0a14 0%, #0d0d1c 50%, #0a0a14 100%)" }}
        >
            {/* Background grid */}
            <div className="fixed inset-0 pointer-events-none" style={{
                backgroundImage: "linear-gradient(rgba(0,61,165,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,61,165,0.03) 1px, transparent 1px)",
                backgroundSize: "48px 48px"
            }} />

            {/* Glow blobs */}
            <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(0,61,165,0.08) 0%, transparent 70%)" }} />
            <div className="fixed bottom-0 right-1/4 w-96 h-96 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)" }} />

            {/* Navbar */}
            <nav className="relative z-10 flex items-center justify-between px-8 py-5"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
            >
                <Link to="/" className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl"
                        style={{ background: "linear-gradient(135deg, #003DA5, #8b5cf6)" }}
                    >
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white font-bold text-lg tracking-tight">
                        EMS<span style={{ color: "#003DA5" }}>.</span>
                    </span>
                </Link>

                <div className="flex items-center gap-3">
                    <span className="text-sm hidden sm:block" style={{ color: "rgba(255,255,255,0.35)" }}>
                        ¿Ya tienes cuenta?
                    </span>
                    <Link to="/auth/HR/login">
                        <button className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                            style={{
                                background: "rgba(0,61,165,0.12)",
                                border: "1px solid rgba(0,61,165,0.25)",
                                color: "#a5b4fc"
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = "rgba(0,61,165,0.2)"
                                e.currentTarget.style.borderColor = "rgba(0,61,165,0.4)"
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = "rgba(0,61,165,0.12)"
                                e.currentTarget.style.borderColor = "rgba(0,61,165,0.25)"
                            }}
                        >
                            Iniciar sesión
                        </button>
                    </Link>
                </div>
            </nav>

            {/* Error popups */}
            {employeestate.error.status && <ErrorPopup error={employeestate.error.message} />}
            {errorpopup && <ErrorPopup error={"Las contraseñas no coinciden. Inténtalo de nuevo."} />}

            {/* Main content */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-10">

                {/* Header */}
                <div className="text-center mb-8 max-w-lg">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs font-semibold uppercase tracking-wider"
                        style={{
                            background: "rgba(0,61,165,0.1)",
                            border: "1px solid rgba(0,61,165,0.2)",
                            color: "#a5b4fc"
                        }}
                    >
                        <Zap className="w-3 h-3" />
                        Registro HR-Admin
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
                        Crea tu cuenta
                        <span style={{ color: "#003DA5" }}> gratis.</span>
                    </h1>
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
                        Gestiona tu equipo, nóminas y asistencia desde una sola plataforma.
                    </p>
                </div>

                {/* Form card */}
                <div className="w-full max-w-3xl rounded-2xl p-6 sm:p-8"
                    style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        boxShadow: "0 24px 80px rgba(0,0,0,0.4)"
                    }}
                >
                    {/* Section: Personal */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-5 h-5 rounded-md flex items-center justify-center"
                                style={{ background: "rgba(0,61,165,0.2)" }}>
                                <User className="w-3 h-3" style={{ color: "#003DA5" }} />
                            </div>
                            <p className="text-xs font-bold uppercase tracking-widest"
                                style={{ color: "rgba(255,255,255,0.3)" }}>
                                Datos personales
                            </p>
                            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField id="firstname" name="firstname" label="Nombre" icon={User}
                                value={stateformdata.firstname} onChange={handlesignupform}
                                autoComplete="given-name" placeholder="Juan" />
                            <InputField id="lastname" name="lastname" label="Apellido" icon={User}
                                value={stateformdata.lastname} onChange={handlesignupform}
                                autoComplete="family-name" placeholder="Pérez" />
                            <InputField id="email" name="email" type="email" label="Correo electrónico" icon={Mail}
                                value={stateformdata.email} onChange={handlesignupform}
                                autoComplete="email" placeholder="juan@empresa.com" />
                            <InputField id="contactnumber" name="contactnumber" type="number" label="Teléfono" icon={Phone}
                                value={stateformdata.contactnumber} onChange={handlesignupform}
                                autoComplete="tel" placeholder="+1 234 567 890" />
                            <InputField id="textpassword" name="textpassword" type="text" label="Contraseña" icon={Lock}
                                value={stateformdata.textpassword} onChange={handlesignupform}
                                autoComplete="new-password" placeholder="Mínimo 8 caracteres" />
                            <InputField id="password" name="password" type="password" label="Confirmar contraseña" icon={Lock}
                                value={stateformdata.password} onChange={handlesignupform}
                                autoComplete="new-password" placeholder="Repite la contraseña" />
                        </div>
                    </div>

                    {/* Section: Organization */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-5 h-5 rounded-md flex items-center justify-center"
                                style={{ background: "rgba(139,92,246,0.2)" }}>
                                <Building2 className="w-3 h-3" style={{ color: "#8b5cf6" }} />
                            </div>
                            <p className="text-xs font-bold uppercase tracking-widest"
                                style={{ color: "rgba(255,255,255,0.3)" }}>
                                Datos de la organización
                            </p>
                            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField id="name" name="name" label="Nombre de la organización" icon={Building2}
                                value={stateformdata.name} onChange={handlesignupform}
                                autoComplete="organization" placeholder="Mi Empresa S.A." />
                            <InputField id="contactnumber2" name="contactnumber" type="number" label="Teléfono corporativo" icon={Phone}
                                value={stateformdata.contactnumber} onChange={handlesignupform}
                                autoComplete="tel" placeholder="+1 234 567 890" />
                            <div className="sm:col-span-2">
                                <InputField id="description" name="description" label="Descripción" icon={FileText}
                                    value={stateformdata.description} onChange={handlesignupform}
                                    autoComplete="off" placeholder="Breve descripción de la organización" />
                            </div>
                            <InputField id="OrganizationURL" name="OrganizationURL" label="URL corporativa" icon={Globe}
                                value={stateformdata.OrganizationURL} onChange={handlesignupform}
                                autoComplete="url" placeholder="https://miempresa.com" />
                            <InputField id="OrganizationMail" name="OrganizationMail" type="email" label="Correo corporativo" icon={AtSign}
                                value={stateformdata.OrganizationMail} onChange={handlesignupform}
                                autoComplete="email" placeholder="contacto@miempresa.com" />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        onClick={handlesubmitform}
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-200"
                        style={{
                            background: "linear-gradient(135deg, #003DA5, #8b5cf6)",
                            boxShadow: "0 8px 24px rgba(0,61,165,0.3)"
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,61,165,0.45)"
                            e.currentTarget.style.transform = "translateY(-1px)"
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,61,165,0.3)"
                            e.currentTarget.style.transform = "translateY(0)"
                        }}
                    >
                        Crear cuenta
                        <ArrowRight className="w-4 h-4" />
                    </button>

                    {/* Sign in link */}
                    <div className="flex items-center justify-center gap-2 mt-4">
                        <span className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                            ¿Ya tienes una cuenta?
                        </span>
                        <Link to="/auth/HR/login">
                            <button
                                className="text-sm font-semibold transition-colors duration-200"
                                style={{ color: "#a5b4fc" }}
                                onMouseEnter={e => e.currentTarget.style.color = "#003DA5"}
                                onMouseLeave={e => e.currentTarget.style.color = "#a5b4fc"}
                            >
                                Iniciar sesión →
                            </button>
                        </Link>
                    </div>

                    {/* Terms */}
                    <p className="text-center text-xs mt-4" style={{ color: "rgba(255,255,255,0.2)" }}>
                        Al registrarte aceptas nuestros{" "}
                        <span style={{ color: "rgba(0,61,165,0.7)", cursor: "pointer" }}>
                            Términos de uso
                        </span>{" "}
                        y{" "}
                        <span style={{ color: "rgba(0,61,165,0.7)", cursor: "pointer" }}>
                            Política de privacidad
                        </span>
                    </p>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 py-6 text-center"
                style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
                    © {new Date().getFullYear()} Employee Management System. Todos los derechos reservados.
                </p>
            </footer>
        </div>
    )
}
