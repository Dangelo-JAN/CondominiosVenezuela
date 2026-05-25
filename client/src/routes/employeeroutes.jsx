import { EmployeeLogin } from "../pages/Employees/emplyoeelogin.jsx"
import { EmployeeDashboard } from "../pages/Employees/employeedashboard.jsx"
import { ProtectedRoutes } from "./protectedroutes.jsx"
import { ForgotPassword } from "../pages/Employees/forgotpassword.jsx"
import { ResetEmailConfirm } from "../pages/Employees/resetemailconfirm.jsx"
import { ResetPassword } from "../pages/Employees/resetpassword.jsx"
import { EntryPage } from "../pages/Employees/EntryPage.jsx"
import { EmployeeHomePage } from "../pages/Employees/Dashboard Childs/EmployeeHomePage.jsx"
import { EmployeeSchedulePage } from "../pages/Employees/Dashboard Childs/EmployeeSchedulePage.jsx"
import { EmployeeWorkPhotosPage } from "../pages/Employees/Dashboard Childs/EmployeeWorkPhotosPage.jsx"
import { EmployeeProfilePage } from "../pages/Employees/Dashboard Childs/EmployeeProfilePage.jsx"
import { EmployeeRequestspage } from "../pages/Employees/Dashboard Childs/EmployeeRequestspage.jsx"
import { EmployeeAbsencesPage } from "../pages/Employees/Dashboard Childs/EmployeeAbsencesPage.jsx"
import { EmployeeBitacorasPage } from "../pages/Employees/Dashboard Childs/bitacoraspage.jsx"
import { EmployeeAcceptInvitationPage } from "../pages/Employees/EmployeeAcceptInvitationPage.jsx"
// EmployeeVerifyEmailPage eliminado - ya no se usa (ver issue #013)

export const EmployeeRoutes = [
    {
        path: "/",
        element: <EntryPage />
    },
    {
        path: "/auth/employee/login",
        element: <EmployeeLogin />
    },
    {
        path: "/auth/employee/employee-dashboard",
        element: (
            <ProtectedRoutes>
                <EmployeeDashboard />
            </ProtectedRoutes>
        ),
        children: [
            {
                path: "/auth/employee/employee-dashboard/home",
                element: <EmployeeHomePage />
            },
            {
                path: "/auth/employee/employee-dashboard/schedule",
                element: <EmployeeSchedulePage />
            },
            {
                path: "/auth/employee/employee-dashboard/photos",
                element: <EmployeeWorkPhotosPage />
            },
            {
                path: "/auth/employee/employee-dashboard/profile",
                element: <EmployeeProfilePage />
            },
            {
                path: "/auth/employee/employee-dashboard/requests",
                element: <EmployeeRequestspage />
            },
            {
                path: "/auth/employee/employee-dashboard/absences",
                element: <EmployeeAbsencesPage />
            },
            {
                path: "/auth/employee/employee-dashboard/bitacoras",
                element: <EmployeeBitacorasPage />
            }
        ]
    },
    {
        path: "/auth/employee/forgot-password",
        element: <ForgotPassword />
    },
    {
        path: "/auth/employee/reset-email-confirmation",
        element: <ResetEmailConfirm />
    },
    {
        path: "/auth/employee/resetpassword/:token",
        element: <ResetPassword />
    },
    {
        path: "/auth/employee/accept-invitation/:token",
        element: <EmployeeAcceptInvitationPage />
    },
    // /auth/employee/verify-email eliminado - ya no se usa (ver issue #013)
]
