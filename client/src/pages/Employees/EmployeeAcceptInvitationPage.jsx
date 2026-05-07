import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { employeeApiService } from "../../redux/apis/EmployeeApiService.js"
import { Zap, CheckCircle2, AlertCircle } from "lucide-react"
import LoadingBar from "react-top-loading-bar"
import { useRef } from "react"

export const EmployeeAcceptInvitationPage = () => {
    const { token } = useParams()
    const navigate = useNavigate()
    const loadingbar = useRef(null)

    const [status, setStatus] = useState("idle") // idle | loading | success | error
    const [errorMsg, setErrorMsg] = useState("")

    const handleActivate = async () => {
        setStatus("loading")
        setErrorMsg("")
        loadingbar.current?.continuousStart()

        try {
            // Enviar cuerpo vacío - el HR ya proporcionó password y teléfono
            const res = await employeeApiService.post(`/api/auth/employee/accept-invitation/${token}`, {})

            if (res.data?.success) {
                // Guardar token en localStorage si existe
                if (res.data?.token) {
                    localStorage.setItem("EmployeeToken", res.data.token)
                }
                loadingbar.current?.complete()
                setStatus("success")
                setTimeout(() => navigate("/auth/employee/employee-dashboard/home"), 2000)
            } else {
                setErrorMsg(res.data?.message || "Error al activar la invitación")
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
                        style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            CondoVE<span className="text-blue-500" style={{ fontSize: "0.7em", marginLeft: "0.1em" }}>SGC</span>.
                        </h1>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                            Tu cuenta está lista para ser activada
                        </p>
                    </div>
                </div>

                {/* Card */}
                <div className="rounded-2xl p-6 flex flex-col gap-5
                    bg-white border border-gray-100 shadow-xl shadow-gray-100/50
                    dark:bg-[#0d0d18] dark:border-[rgba(16,185,129,0.15)]
                    dark:shadow-[0_8px_32px_rgba(16,185,129,0.08)]">

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
                        <div className="flex flex-col gap-4">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-1
                                    text-emerald-500 dark:text-emerald-400">
                                    Activación de cuenta
                                </p>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                    Activa tu cuenta
                                </h2>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    Tu coordinador HR ya ha registrado tu información. Solo necesitas activar tu cuenta para comenzar.
                                </p>
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
                                type="button"
                                onClick={handleActivate}
                                disabled={status === "loading"}
                                className="w-full py-3 rounded-xl text-sm font-semibold text-white
                                    transition-all duration-200 hover:opacity-90 disabled:opacity-50
                                    disabled:cursor-not-allowed mt-1"
                                style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                            >
                                {status === "loading" ? "Activando cuenta..." : "Activar mi cuenta"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}