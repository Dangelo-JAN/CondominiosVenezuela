import { HandleGetHumanResources } from "../redux/Thunks/HRThunk.js"
import { useDispatch, useSelector } from "react-redux"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Loading } from "../components/common/loading.jsx"

export const HRProtectedRoutes = ({ children }) => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const HRState = useSelector((state) => state.HRReducer)
    const [isChecking, setIsChecking] = useState(true)
    const [authResult, setAuthResult] = useState(null)

    useEffect(() => {
        const checkAuth = async () => {
            setIsChecking(true)

            const loginRes  = await dispatch(HandleGetHumanResources({ apiroute: "CHECKLOGIN" }))
            const verifyRes = await dispatch(HandleGetHumanResources({ apiroute: "CHECK_VERIFY_EMAIL" }))

            // gologin:true significa sin token — no es un usuario inválido, es que no hay sesión
            const loginPayload  = loginRes.payload
            const verifyPayload = verifyRes.payload

            const isAuthenticated = loginPayload?.success === true && !loginPayload?.gologin
            const isVerified      = verifyPayload?.alreadyverified === true

            // Obtener datos del usuario HR actual
            if (isAuthenticated) {
                await dispatch(HandleGetHumanResources({ apiroute: "GET_HR_ME" }))
            }

            setAuthResult({ isAuthenticated, isVerified })
            setIsChecking(false)
        }
        checkAuth()
    }, [])

    useEffect(() => {
        if (isChecking || authResult === null) return

        if (!authResult.isAuthenticated) {
            navigate("/auth/HR/signup")
            return
        }

        if (authResult.isAuthenticated && !authResult.isVerified) {
            navigate("/auth/HR/reset-email-validation")
        }
    }, [isChecking, authResult])

    if (isChecking) return <Loading />

    return (authResult?.isAuthenticated && authResult?.isVerified) ? children : null
}
