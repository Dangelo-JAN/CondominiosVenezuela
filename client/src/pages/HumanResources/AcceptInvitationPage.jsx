import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { hrApiService } from "../../redux/apis/HRApiService"
import { Zap, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react"
import LoadingBar from "react-top-loading-bar"
import { useRef } from "react"

export const AcceptInvitationPage = () => {
    const { token } = useParams()
    const navigate = useNavigate()
    const loadingbar = useRef(null)

    const [form, setForm] = useState({ password: "", confirmpassword: "", contactnumber: "" })
    const [showPassword, setShowPassword] = useState(false)
    const [status, setStatus] = useState("idle") // idle | loading | success | error
    const [errorMsg, setErrorMsg] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (form.password !== form.confirmpassword) {
            setErrorMsg("Las contraseñas no coinciden")
            return
        }
        if (form.password.length < 8) {
            setErrorMsg("La contraseña debe tener al menos 8 caracteres")
            return
        }
        if (!form.contactnumber) {
            setErrorMsg("El número de contacto es requerido")
            return
        }

        setStatus("loading")
        setErrorMsg("")
        loadingbar.current?.continuousStart()

        try {
            const res = await hrApiService.post(`/api/v1/hr-profiles/accept-invitation/${token}`, {
                password: form.password,
                contactnumber: form.contactnumber
            })

            if (res.data?.success) {
                // Guardar token en localStorage
                if (res.data?.token) {
                    localStorage.setItem("HRtoken", res.data.token)
                }
                loadingbar.current?.complete()
                setStatus("success")
                setTimeout(() => navigate("/HR/dashboard/dashboard-data"), 2000)
            } else {
                setErrorMsg(res.data?.message || "Error al aceptar la invitación")
                setStatus("error")
                loadingbar.current?.complete()
            }
        } catch (error) {
            setErrorMsg(error.response?.data?.message || "Invitación inválida o expirada")
            setStatus("error")
            loadingbar.current?.complete()
        }
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#0f0f1a] flex items-center justify-center p-4">
            <LoadingBar ref={loadingbar} />

            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex flex-col items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            EMS<span className="text-blue-500">.</span>
                        </h1>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                            Acepta tu invitación para unirte al equipo
                        </p>
                    </div>
                </div>

                {/* Card */}
                <div className="rounded-2xl p-6 flex flex-col gap-5
                    bg-white border border-gray-100 shadow-xl shadow-gray-100/50
                    dark:bg-[#0d0d18] dark:border-[rgba(99,102,241,0.15)]
                    dark:shadow-[0_8px_32px_rgba(99,102,241,0.08)]">

                    {status === "success" ? (
                        <div className="flex flex-col items-center gap-3 py-6">
                            <div className="w-14 h-14 rounded-full flex items-center justify-center
                                bg-emerald-50 dark:bg-[rgba(16,185,129,0.1)]">
                                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                            </div>
                            <p className="text-base font-bold text-gray-900 dark:text-white">
                                ¡Bienvenido al equipo!
                            </p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
                                Tu cuenta fue activada. Redirigiendo al dashboard...
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-1
                                    text-blue-500 dark:text-blue-400">
                                    Configurar cuenta
                                </p>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                    Completa tu registro
                                </h2>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    Define tu contraseña para activar tu cuenta EMS
                                </p>
                            </div>

                            {/* Teléfono */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-semibold uppercase tracking-wider
                                    text-gray-400 dark:text-gray-500">
                                    Número de contacto
                                </label>
                                <input
                                    type="tel"
                                    placeholder="Ej: +58 412 1234567"
                                    value={form.contactnumber}
                                    onChange={e => setForm(p => ({ ...p, contactnumber: e.target.value }))}
                                    className="input-field w-full"
                                    required
                                />
                            </div>

                            {/* Contraseña */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-semibold uppercase tracking-wider
                                    text-gray-400 dark:text-gray-500">
                                    Contraseña
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Mínimo 8 caracteres"
                                        value={form.password}
                                        onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                        className="input-field w-full pr-10"
                                        required
                                    />
                                    <button type="button"
                                        onClick={() => setShowPassword(p => !p)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2
                                            text-gray-400 hover:text-gray-600 transition-colors">
                                        {showPassword
                                            ? <EyeOff className="w-4 h-4" />
                                            : <Eye    className="w-4 h-4" />
                                        }
                                    </button>
                                </div>
                            </div>

                            {/* Confirmar contraseña */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-semibold uppercase tracking-wider
                                    text-gray-400 dark:text-gray-500">
                                    Confirmar contraseña
                                </label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Repite tu contraseña"
                                    value={form.confirmpassword}
                                    onChange={e => setForm(p => ({ ...p, confirmpassword: e.target.value }))}
                                    className="input-field w-full"
                                    required
                                />
                            </div>

                            {/* Error */}
                            {errorMsg && (
                                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl
                                    bg-red-50 border border-red-100
                                    dark:bg-[rgba(239,68,68,0.08)] dark:border-[rgba(239,68,68,0.2)]">
                                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                    <p className="text-xs text-red-500 dark:text-red-400">{errorMsg}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={status === "loading"}
                                className="w-full py-3 rounded-xl text-sm font-semibold text-white
                                    transition-all duration-200 hover:opacity-90 disabled:opacity-50
                                    disabled:cursor-not-allowed mt-1"
                                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                            >
                                {status === "loading" ? "Activando cuenta..." : "Activar mi cuenta"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
