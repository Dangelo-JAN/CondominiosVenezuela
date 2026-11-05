import { useEffect } from "react"
import { RouterProvider } from "react-router-dom"
import { useDispatch } from "react-redux"
import { router } from "./routes/AppRoutes.jsx"
import { PWAProvider } from "./contexts/PWAContext.jsx"
import { HandleHRCheck } from "./redux/Thunks/HRThunk.js"

function App() {
    const dispatch = useDispatch()

    // ── Inicialización: si hay token HR, verificar sesión y poblar permissions ──
    useEffect(() => {
        const token = localStorage.getItem("HRtoken")
        if (token) {
            dispatch(HandleHRCheck())
        }
    }, [dispatch])

    return (
        <PWAProvider>
            <RouterProvider router={router} future={{
                v7_startTransition: true,
            }} />
        </PWAProvider>
    )
}

export default App
