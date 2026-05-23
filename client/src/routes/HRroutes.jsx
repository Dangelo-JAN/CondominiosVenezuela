import { HRSignupPage } from "../pages/HumanResources/HRSignup"
import { HRLogin } from "../pages/HumanResources/HRlogin"
import { HRDashbaord } from "../pages/HumanResources/HRdashbaord"
import { VerifyEmailPage } from "../pages/HumanResources/verifyemailpage.jsx"
import { HRForgotPasswordPage } from "../pages/HumanResources/forgotpassword.jsx"
import { ResetMailConfirmPage } from "../pages/HumanResources/resetmailconfirm.jsx"
import { ResetHRPasswordPage } from "../pages/HumanResources/resetpassword.jsx"
import { ResetHRVerifyEmailPage } from "../pages/HumanResources/resetemail.jsx"
import { HRDashboardPage } from "../pages/HumanResources/Dashboard Childs/dashboardpage.jsx"
import { HRProtectedRoutes } from "./HRprotectedroutes.jsx"
import { HREmployeesPage } from "../pages/HumanResources/Dashboard Childs/employeespage.jsx"
import { HRDepartmentPage } from "../pages/HumanResources/Dashboard Childs/departmentpage.jsx"
import { HRSchedulePage } from "../pages/HumanResources/Dashboard Childs/HRSchedulePage.jsx"
import { HRWorkPhotosPage } from "../pages/HumanResources/Dashboard Childs/HRWorkPhotosPage.jsx"
import { HRProfilesPage } from "../pages/HumanResources/Dashboard Childs/HRProfilesPage.jsx"
import { AcceptInvitationPage } from "../pages/HumanResources/AcceptInvitationPage.jsx"
import { HRLeavesPage } from "../pages/HumanResources/Dashboard Childs/leavespage.jsx"
import { HRRequestspage } from "../pages/HumanResources/Dashboard Childs/HRRequestspage.jsx"
import { HRBitacorasPage } from "../pages/HumanResources/Dashboard Childs/hrbitacoraspage.jsx"

export const HRRoutes = [
    {
        path: "/auth/HR/accept-invitation/:token",
        element: <AcceptInvitationPage />
    },
    {
        path: "/auth/HR/signup",
        element: <HRSignupPage />
    },
    {
        path: "/auth/HR/login",
        element: <HRLogin />
    },
    {
        path: "/HR/dashboard",
        element: (
            <HRProtectedRoutes>
                <HRDashbaord />
            </HRProtectedRoutes>
        ),
        children: [
            {
                path: "/HR/dashboard/dashboard-data",
                element: <HRDashboardPage />
            },
            {
                path: "/HR/dashboard/employees",
                element: <HREmployeesPage />
            },
            {
                path: "/HR/dashboard/departments",
                element: <HRDepartmentPage />
            },
            {
                path: "/HR/dashboard/schedules",
                element: <HRSchedulePage />
            },
            {
                path: "/HR/dashboard/leaves",
                element: <HRLeavesPage />
            },
            {
                path: "/HR/dashboard/requests",
                element: <HRRequestspage />
            },
            {
                path: "/HR/dashboard/work-photos",
                element: <HRWorkPhotosPage />
            },
            {
                path: "/HR/dashboard/hr-profiles",
                element: <HRProfilesPage />
            },
            {
                path: "/HR/dashboard/bitacoras",
                element: <HRBitacorasPage />
            }
        ]
    },
    {
        path: "/auth/HR/verify-email",
        element: <VerifyEmailPage />
    },
    {
        path: "/auth/HR/reset-email-validation",
        element: <ResetHRVerifyEmailPage />
    },
    {
        path: "/auth/HR/forgot-password",
        element: <HRForgotPasswordPage />
    },
    {
        path: "/auth/HR/reset-email-confirmation",
        element: <ResetMailConfirmPage />
    },
    {
        path: "/auth/HR/resetpassword/:token",
        element: <ResetHRPasswordPage />
    },
]
