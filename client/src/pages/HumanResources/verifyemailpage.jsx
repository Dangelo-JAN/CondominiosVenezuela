import { Verify_Email_Component } from "../../components/common/verify-email.jsx"
import { useState, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { HandlePostHumanResources, HandleGetHumanResources } from "../../redux/Thunks/HRThunk.js"
import LoadingBar from 'react-top-loading-bar'
import { useNavigate } from 'react-router-dom'
import { Mail, Copy, CheckCircle2 } from "lucide-react"

export const VerifyEmailPage = () => {
    const HRState = useSelector((state) => state.HRReducer)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const loadingbar = useRef(null)
    const [verificationcode, setverificationcode] = useState("")
    const [copied, setCopied] = useState(false)

    // Guardar el código en ref al montar — persiste aunque Redux se actualice
    const fallbackCode = useRef(HRState.data?.verificationcode || null).current

    const handleCodeValue = (value) => {
        setverificationcode(value)
    }

    const handleOTPsubmit = () => {
        loadingbar.current?.continuousStart()
        dispatch(HandlePostHumanResources({ apiroute: "VERIFY_EMAIL", data: { verificationcode } }))
    }

    const handleCopyCode = () => {
        if (fallbackCode) {
            navigator.clipboard.writeText(fallbackCode)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    useEffect(() => {
        if (!HRState.isVerified) {
            dispatch(HandleGetHumanResources({ apiroute: "CHECK_VERIFY_EMAIL" }))
        }

        if ((!HRState.isVerified) && (!HRState.isVerifiedEmailAvailable) && (HRState.error.content)) {
            navigate("/auth/HR/reset-email-validation")
        }

        if (HRState.isVerified) {
            loadingbar.current?.complete()
            navigate("/HR/dashboard/dashboard-data")
        }
    }, [HRState.isVerified, HRState.isVerifiedEmailAvailable, HRState.error.content])

    useEffect(() => {
        return () => loadingbar.current?.complete()
    }, [])

    return (
        <>
            <LoadingBar ref={loadingbar} />

            <Verify_Email_Component
                handleCodeValue={handleCodeValue}
                value={verificationcode}
                handleOTPsubmit={handleOTPsubmit}
            />

            {/* Fallback — mostrar código si el email puede tardar */}
            {fallbackCode && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50
                    w-full max-w-sm mx-4">
                    <div className="rounded-2xl p-4 flex flex-col gap-3
                        bg-white border border-blue-100 shadow-xl shadow-blue-100/50
                        dark:bg-[#0d0d18] dark:border-[rgba(99,102,241,0.2)]
                        dark:shadow-[0_8px_32px_rgba(99,102,241,0.1)]">

                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
                                bg-blue-50 dark:bg-[rgba(99,102,241,0.1)]">
                                <Mail className="w-4 h-4 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-700 dark:text-white">
                                    ¿No recibiste el correo?
                                </p>
                                <p className="text-[11px] text-gray-400 dark:text-gray-500">
                                    Los correos Gmail pueden tardar hasta 2 horas
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl
                            bg-blue-50 border border-blue-100
                            dark:bg-[rgba(99,102,241,0.08)] dark:border-[rgba(99,102,241,0.15)]">
                            <span className="text-lg font-bold tracking-[0.25em] text-blue-600 dark:text-blue-400
                                font-mono">
                                {fallbackCode}
                            </span>
                            <button
                                onClick={handleCopyCode}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold
                                    transition-all duration-200
                                    bg-blue-500 text-white hover:bg-blue-600
                                    dark:bg-blue-500 dark:hover:bg-blue-600"
                            >
                                {copied
                                    ? <><CheckCircle2 className="w-3.5 h-3.5" /> Copiado</>
                                    : <><Copy className="w-3.5 h-3.5" /> Copiar</>
                                }
                            </button>
                        </div>

                        <p className="text-[10px] text-center text-gray-400 dark:text-gray-600">
                            Este código es válido por 24 horas
                        </p>
                    </div>
                </div>
            )}
        </>
    )
}
