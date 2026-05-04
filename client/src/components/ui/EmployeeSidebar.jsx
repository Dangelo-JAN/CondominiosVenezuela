import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { HandlePostEmployees } from "../../redux/Thunks/EmployeeThunk.js"
import { logoutEmployee } from "../../redux/Slices/EmployeeSlice.js"
import { resetDashboardState } from "../../redux/Slices/EmployeeDashboardSlice.js"
import { DashboardSidebar } from "./DashboardSidebar.jsx"

const EMPLOYEE_NAV_ITEMS = [
    { label: "Inicio", path: "/auth/employee/employee-dashboard/home", icon: "/assets/HR-Dashboard/dashboard.png" },
    { label: "Mi Horario", path: "/auth/employee/employee-dashboard/schedule", icon: "/assets/HR-Dashboard/attendance.png" },
    { label: "Mis Fotos", path: "/auth/employee/employee-dashboard/photos", icon: "/assets/HR-Dashboard/notice.png" },
    { label: "Mi Perfil", path: "/auth/employee/employee-dashboard/profile", icon: "/assets/HR-Dashboard/employee-2.png" },
    { label: "Mis Nóminas", path: null, icon: "/assets/HR-Dashboard/salary.png" },
    { label: "Ausencias", path: "/auth/employee/employee-dashboard/absences", icon: "/assets/HR-Dashboard/leave.png" },
    { label: "Solicitudes", path: "/auth/employee/employee-dashboard/requests", icon: "/assets/HR-Dashboard/request.png" },
]

export function EmployeeDashboardSidebar() {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleLogout = () => {
        dispatch(HandlePostEmployees({ apiroute: "LOGOUT" }))
            .finally(() => {
                dispatch(logoutEmployee())
                dispatch(resetDashboardState())
                navigate("/")
            })
    }

    return (
        <DashboardSidebar
            navItems={EMPLOYEE_NAV_ITEMS}
            onLogout={handleLogout}
            appName="CondoVE SGC"
            appSubtitle="Panel de Empleado"
        />
    )
}
