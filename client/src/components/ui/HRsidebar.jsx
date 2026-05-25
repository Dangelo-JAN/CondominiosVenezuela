import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { HandleHRLogout } from "../../redux/Thunks/HRThunk.js"
import { DashboardSidebar } from "./DashboardSidebar.jsx"

const HR_NAV_ITEMS = [
    { label: "Dashboard",     path: "/HR/dashboard/dashboard-data", icon: "/assets/HR-Dashboard/dashboard.png" },
    { label: "Empleados",     path: "/HR/dashboard/employees",       icon: "/assets/HR-Dashboard/employee-2.png" },
    { label: "Departamentos", path: "/HR/dashboard/departments",     icon: "/assets/HR-Dashboard/department.png" },
    { label: "Horarios",      path: "/HR/dashboard/schedules",       icon: "/assets/HR-Dashboard/attendance.png" },
    { label: "Fotos",         path: "/HR/dashboard/work-photos",     icon: "/assets/HR-Dashboard/notice.png" },
    { label: "Nóminas",       path: null,                            icon: "/assets/HR-Dashboard/salary.png" },
    { label: "Avisos",        path: null,                            icon: "/assets/HR-Dashboard/notice.png" },
    { label: "Ausencias",     path: "/HR/dashboard/leaves",         icon: "/assets/HR-Dashboard/leave.png" },
    { label: "Asistencia",    path: null,                            icon: "/assets/HR-Dashboard/attendance.png" },
    { label: "Reclutamiento", path: null,                            icon: "/assets/HR-Dashboard/recruitment.png" },
    { label: "Entrevistas",   path: null,                            icon: "/assets/HR-Dashboard/interview-insights.png" },
    { label: "Solicitudes",   path: "/HR/dashboard/requests",       icon: "/assets/HR-Dashboard/request.png" },
    { label: "Bitácoras",     path: "/HR/dashboard/bitacoras",      icon: "/assets/HR-Dashboard/notice.png" },
    { label: "Perfiles HR",   path: "/HR/dashboard/hr-profiles",    icon: "/assets/HR-Dashboard/HR-profiles.png" },
]

export function HRdashboardSidebar() {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleLogout = () => {
        dispatch(HandleHRLogout()).finally(() => {
            navigate("/")
        })
    }

    return (
        <DashboardSidebar
            navItems={HR_NAV_ITEMS}
            onLogout={handleLogout}
            appName="CondoVE SGC"
            appSubtitle="Panel Junta de Condominio"
        />
    )
}
