import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useMemo } from "react"
import { HandleHRLogout } from "../../redux/Thunks/HRThunk.js"
import { DashboardSidebar } from "./DashboardSidebar.jsx"
import { useHRAuth } from "../../hooks/useHRAuth.js"
import { Loading } from "../common/loading.jsx"

// ── Items del menú (se filtran según rol) ──────────────────────────────
const HR_NAV_ITEMS_ALL = [
    { label: "Dashboard",     path: "/HR/dashboard/dashboard-data", icon: "/assets/HR-Dashboard/dashboard.png" },
    { label: "Empleados",    path: "/HR/dashboard/employees",      icon: "/assets/HR-Dashboard/employee-2.png" },
    { label: "Departamentos", path: "/HR/dashboard/departments",   icon: "/assets/HR-Dashboard/department.png" },
    { label: "Horarios",      path: "/HR/dashboard/schedules",      icon: "/assets/HR-Dashboard/attendance.png" },
    { label: "Fotos",         path: "/HR/dashboard/work-photos",    icon: "/assets/HR-Dashboard/notice.png" },
    { label: "Nóminas",       path: null,                           icon: "/assets/HR-Dashboard/salary.png" },
    { label: "Avisos",        path: null,                           icon: "/assets/HR-Dashboard/notice.png" },
    { label: "Ausencias",     path: "/HR/dashboard/leaves",         icon: "/assets/HR-Dashboard/leave.png" },
    { label: "Asistencia",    path: null,                           icon: "/assets/HR-Dashboard/attendance.png" },
    { label: "Reclutamiento", path: null,                           icon: "/assets/HR-Dashboard/recruitment.png" },
    { label: "Entrevistas",   path: null,                           icon: "/assets/HR-Dashboard/interview-insights.png" },
    { label: "Solicitudes",   path: "/HR/dashboard/requests",       icon: "/assets/HR-Dashboard/request.png" },
    { label: "Perfiles HR",   path: "/HR/dashboard/hr-profiles",   icon: "/assets/HR-Dashboard/HR-profiles.png" },
]

export function HRdashboardSidebar() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { isViewer, isReady } = useHRAuth()

    // ── No renderizar hasta que los datos estén listos ────────────────
    // Esto asegura que role y permissions están disponibles antes de filtrar
    if (!isReady) {
        return <Loading />
    }

    // ── Filtrar items según rol ───────────────────────────────────────
    // HR-Viewer NO ve "Perfiles HR" (restricción de navegación)
    const navItems = useMemo(() => {
        return HR_NAV_ITEMS_ALL.filter(item => {
            // Ocultar "Perfiles HR" solo para HR-Viewer
            if (item.label === "Perfiles HR" && isViewer) {
                return false
            }
            return true
        })
    }, [isViewer])

    const handleLogout = () => {
        dispatch(HandleHRLogout()).finally(() => {
            navigate("/")
        })
    }

    return (
        <DashboardSidebar
            navItems={navItems}
            onLogout={handleLogout}
            appName="CondoVE SGC"
            appSubtitle="Panel HR"
        />
    )
}