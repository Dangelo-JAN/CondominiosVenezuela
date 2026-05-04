import { ErrorPopup } from "./error-popup"
import { Link } from "react-router-dom"
import { Zap, ArrowRight, Mail, Lock, ShieldCheck } from "lucide-react"

const InputField = ({ id, name, type = "text", label, icon: Icon, value, onChange, autoComplete, placeholder, extra }) => (
    <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
            <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {label}
            </label>
            {extra}
        </div>
        <div className="relative">
            {Icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Icon className="w-4 h-4 text-blue-400" />
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
                className="w-full rounded-xl py-3 text-sm text-gray-900 outline-none transition-all duration-200"
                style={{
                    background: "#f8f8ff",
                    border: "1.5px solid #e5e7f0",
                    paddingLeft: Icon ? "2.6rem" : "0.875rem",
                    paddingRight: "0.875rem",
                }}
                onFocus={e => {
                    e.target.style.border = "1.5px solid #003DA5"
                    e.target.style.background = "#f5f5ff"
                    e.target.style.boxShadow = "0 0 0 3px rgba(0,61,165,0.1)"
                }}
                onBlur={e => {
                    e.target.style.border = "1.5px solid #e5e7f0"
                    e.target.style.background = "#f8f8ff"
                    e.target.style.boxShadow = "none"
                }}
            />
        </div>
    </div>
)

export const SignIn = ({ image, handlesigninform, handlesigninsubmit, targetedstate, statevalue, redirectpath }) => {
    return (
        <div className="min-h-screen w-full flex flex-col bg-white">

            {/* Subtle top gradient */}
            <div className="fixed inset-0 pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,61,165,0.07) 0%, transparent 70%)"
                }}
            />

            {/* Navbar */}
            <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-gray-100">
                <Link to="/" className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl"
                        style={{ background: "linear-gradient(135deg, #003DA5, #8b5cf6)" }}
                    >
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-gray-900">
                        CondoVE<span className="text-blue-500" style={{ fontSize: "0.75em", marginLeft: "0.1em" }}>SGC</span><span className="text-blue-600">.</span>
                    </span>
                </Link>

                <div className="flex items-center gap-3">
                    <span className="text-sm hidden sm:block text-gray-400">¿No tienes cuenta?</span>
                    <Link to="/auth/HR/signup">
                        <button className="px-4 py-2 rounded-xl text-sm font-semibold text-blue-600 transition-all duration-200 border border-blue-200 hover:bg-blue-50 hover:border-blue-300">
                            Registrarse
                        </button>
                    </Link>
                </div>
            </nav>

            {/* Error */}
            {targetedstate.error.status && <ErrorPopup error={targetedstate.error.message} />}

            {/* Main */}
            <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

                    {/* Left — Branding */}
                    <div className="flex-1 flex flex-col gap-6 text-center lg:text-left max-w-md">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider self-center lg:self-start"
                            style={{
                                background: "rgba(0,61,165,0.08)",
                                border: "1px solid rgba(0,61,165,0.18)",
                                color: "#003DA5"
                            }}
                        >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Acceso seguro
                        </div>

                        <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
                            Bienvenido de
                            <br />
                            <span className="text-blue-600 italic">vuelta.</span>
                        </h1>

                        <p className="text-gray-500 text-base leading-relaxed">
                            Accede a tu panel de HR para gestionar empleados, nóminas y asistencia en tiempo real.
                        </p>

                        {/* Stats */}
                        <div className="flex gap-8 justify-center lg:justify-start pt-2 border-t border-gray-100">
                            <div>
                                <p className="text-xl font-bold text-gray-900">+10k</p>
                                <p className="text-xs text-gray-400 font-medium italic">Usuarios activos</p>
                            </div>
                            <div>
                                <p className="text-xl font-bold text-gray-900">99.9%</p>
                                <p className="text-xs text-gray-400 font-medium italic">Uptime</p>
                            </div>
                            <div>
                                <p className="text-xl font-bold text-gray-900">24/7</p>
                                <p className="text-xs text-gray-400 font-medium italic">Soporte</p>
                            </div>
                        </div>
                    </div>

                    {/* Right — Form card */}
                    <div className="w-full max-w-sm">
                        <div className="rounded-2xl p-8"
                            style={{
                                background: "#fff",
                                border: "1px solid #ebebf5",
                                boxShadow: "0 20px 60px rgba(0,61,165,0.08), 0 4px 16px rgba(0,0,0,0.04)"
                            }}
                        >
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-1">Iniciar sesión</h2>
                                <p className="text-sm text-gray-400">Ingresa tus credenciales para continuar</p>
                            </div>

                            <form className="flex flex-col gap-4" onSubmit={handlesigninsubmit}>
                                <InputField
                                    id="email"
                                    name="email"
                                    type="email"
                                    label="Correo electrónico"
                                    icon={Mail}
                                    value={statevalue.email}
                                    onChange={handlesigninform}
                                    autoComplete="email"
                                    placeholder="juan@empresa.com"
                                />

                                <InputField
                                    id="password"
                                    name="password"
                                    type="password"
                                    label="Contraseña"
                                    icon={Lock}
                                    value={statevalue.password}
                                    onChange={handlesigninform}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    extra={
                                        <Link to={redirectpath}
                                            className="text-xs font-semibold text-blue-500 hover:text-blue-700 transition-colors">
                                            ¿Olvidaste tu contraseña?
                                        </Link>
                                    }
                                />

                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 mt-2"
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
                                    Ingresar
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </form>

                            {/* Sign up link */}
                            <div className="flex items-center justify-center gap-2 mt-5 pt-5 border-t border-gray-100">
                                <span className="text-sm text-gray-400">¿No tienes cuenta?</span>
                                <Link to="/auth/HR/signup"
                                    className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                                    Regístrate gratis →
                                </Link>
                            </div>
                        </div>

                        {/* Trust note */}
                        <p className="text-center text-xs text-gray-300 mt-4">
                            Tus datos están protegidos con cifrado SSL de 256 bits.
                        </p>
                    </div>

                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 py-6 text-center border-t border-gray-50">
                <p className="text-xs text-gray-300">
                    © {new Date().getFullYear()} Sistema de Gestión Condominial. Todos los derechos reservados.
                </p>
            </footer>
        </div>
    )
}
