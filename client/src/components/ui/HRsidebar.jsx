import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { HandleHRLogout } from "../../redux/Thunks/HRThunk.js"
import { DashboardSidebar } from "./DashboardSidebar.jsx"

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
    
    // ── Obtener rol directamente del HRReducer ───────────────────────
    // El rol viene del CHECKLOGIN o GET_HR_ME, ambos establecen HRReducer.data.role
    const role = useSelector(s => s.HRReducer?.data?.role)
    
    // ── Determinar si es HR-Viewer ───────────────────────────────────
    const isViewer = role === "HR-Viewer"
    
    // ── Filtrar items según rol ───────────────────────────────────────
    // Si es HR-Viewer, ocultar "Perfiles HR"
    const navItems = isViewer 
        ? HR_NAV_ITEMS_ALL.filter(item => item.label !== "Perfiles HR")
        : HR_NAV_ITEMS_ALL

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