export const APIsEndPoints = {
    LOGIN: "/api/auth/employee/login",
    LOGOUT: "/api/auth/employee/logout",
    CHECKELOGIN: "/api/auth/employee/check-login",
    GET_BY_EMPLOYEE: "/api/v1/employee/by-employee",
    FORGOT_PASSWORD: "/api/auth/employee/forgot-password",
    RESET_PASSWORD: (token) => `/api/auth/employee/reset-password/${token}`
}

export const HREndPoints = {
    SIGNUP: "/api/auth/HR/signup",
    CHECKLOGIN: "/api/auth/HR/check-login",
    GET_HR_ME: "/api/v1/HR/me",
    UPDATE_ME: "/api/v1/HR/update-me",
    LOGIN: "/api/auth/HR/login",
    LOGOUT: "/api/auth/HR/logout",
    VERIFY_EMAIL: "/api/auth/HR/verify-email",
    CHECK_VERIFY_EMAIL: "/api/auth/HR/check-verify-email",
    RESEND_VERIFY_EMAIL: "/api/auth/HR/resend-verify-email",
    FORGOT_PASSWORD: "/api/auth/HR/forgot-password",
    RESET_PASSWORD: (token) => `/api/auth/HR/reset-password/${token}`
}

export const DashboardEndPoints = {
    GETDATA: "/api/v1/dashboard/HR-dashboard"
}

export const HREmployeesPageEndPoints = {
    GETALL: "/api/v1/employee/all",
    ADDEMPLOYEE: "/api/auth/employee/signup",
    GETONE: (EMID) => `/api/v1/employee/by-HR/${EMID}`,
    DELETE: (EMID) => `/api/v1/employee/delete-employee/${EMID}`
}

export const HRDepartmentPageEndPoints = {
    GETALL: "/api/v1/department/all",
    CREATE: "/api/v1/department/create-department",
    UPDATE: "/api/v1/department/update-department",
    DELETE: "/api/v1/department/delete-department"
}

export const EmployeesIDsEndPoints = {
    GETALL: "/api/v1/employee/all-employees-ids",
}

export const HRLeavesEndPoints = {
    // Empleado
    GET_EMPLOYEE_LEAVES: "/api/v1/leave/employee-leaves",
    CREATE_LEAVE: "/api/v1/leave/create-leave",
    UPDATE_EMPLOYEE_LEAVE: "/api/v1/leave/employee-update-leave",
    DELETE_EMPLOYEE_LEAVE: (leaveID) => `/api/v1/leave/delete-leave/${leaveID}`,
    
    // HR
    GETALL: "/api/v1/leave/all",
    CREATE_BY_HR: "/api/v1/leave/hr-create-leave",
    UPDATE_BY_HR: "/api/v1/leave/hr-update-leave",
    DELETE_BY_HR: (leaveID) => `/api/v1/leave/hr-delete-leave/${leaveID}`,
    UPDATE_STATUS: "/api/v1/leave/HR-update-leave"
}

export const HRAbsencesEndPoints = {
    GETALL: "/api/v1/absence/all",
    GET_MY_ABSENCES: "/api/v1/absence/my-absences",
    GET_BY_EMPLOYEE: (employeeID) => `/api/v1/absence/employee/${employeeID}`,
    DELETE: (absenceID) => `/api/v1/absence/delete/${absenceID}`
}

// ── Bitácoras ──────────────────────────────────────────────────────────────
export const HRBitacorasEndPoints = {
    // Empleado
    CREATE: "/api/v1/bitacora/create",
    UPDATE: (id) => `/api/v1/bitacora/update/${id}`,
    GET_MY: "/api/v1/bitacora/my-bitacoras",

    // HR
    GET_ALL: "/api/v1/bitacora/all",
    GET_BY_ID: (id) => `/api/v1/bitacora/${id}`,
    DELETE: (id) => `/api/v1/bitacora/delete/${id}`
}

// ── Reportes Diarios/Semanales ─────────────────────────────────────────────
export const ReportEndPoints = {
    // HR
    GET_CURRENT: "/api/v1/report/current",
    GET_HISTORY: "/api/v1/report/history",
    GET_BY_WEEK: (isoYear, weekNumber) => `/api/v1/report/history/${isoYear}/${weekNumber}`,

    // Empleado (filtrado a su departamento en el server)
    GET_MY_REPORT: "/api/v1/report/my-report",
    // Empleado (histórico de SUS semanas cerradas — aislado por token)
    GET_MY_HISTORY: "/api/v1/report/my-history"
}

// ── Notificaciones In-App ──────────────────────────────────────────────────
export const HRNotificationsEndPoints = {
    GET_MY: "/api/v1/notification/my-notifications",
    UNREAD_COUNT: "/api/v1/notification/unread-count",
    MARK_READ: (id) => `/api/v1/notification/read/${id}`,
    MARK_ALL_READ: "/api/v1/notification/read-all",

    // Push Notifications (FCM)
    SUBSCRIBE: "/api/v1/push/subscribe",
    UNSUBSCRIBE: (token) => `/api/v1/push/unsubscribe/${encodeURIComponent(token)}`,
    TEST_PUSH: "/api/v1/push/test",
}

// ── Nómina Venezolana ───────────────────────────────────────────────────────
export const PayrollEndPoints = {
    // Períodos de nómina
    PERIODS_GETALL: "/api/v1/payroll-periods",
    PERIODS_GETONE: (id) => `/api/v1/payroll-periods/${id}`,
    PERIODS_CREATE: "/api/v1/payroll-periods",
    PERIODS_UPDATE: (id) => `/api/v1/payroll-periods/${id}`,
    PERIODS_DELETE: (id) => `/api/v1/payroll-periods/${id}`,
    PERIODS_CALCULATE: (id) => `/api/v1/payroll-periods/${id}/calculate`,
    PERIODS_APPROVE: (id) => `/api/v1/payroll-periods/${id}/approve`,
    PERIODS_PAY: (id) => `/api/v1/payroll-periods/${id}/pay`,
    PERIODS_CLOSE: (id) => `/api/v1/payroll-periods/${id}/close`,

    // Recibos de nómina
    RECEIPTS_GETALL: "/api/v1/payslips",
    RECEIPTS_GETONE: (id) => `/api/v1/payslips/${id}`,
    RECEIPTS_GET_EMPLOYEE: (employeeId) => `/api/v1/payslips/employee/${employeeId}`,
    RECEIPTS_RECALCULATE: (id) => `/api/v1/payslips/${id}/recalculate`,
    RECEIPTS_VOID: (id) => `/api/v1/payslips/${id}/void`,
    RECEIPTS_EXPORT: (id) => `/api/v1/payslips/${id}/export`,

    // Conceptos de nómina
    CONCEPTS_GETALL: "/api/v1/payroll-concepts",
    CONCEPTS_GETONE: (id) => `/api/v1/payroll-concepts/${id}`,
    CONCEPTS_CREATE: "/api/v1/payroll-concepts",
    CONCEPTS_UPDATE: (id) => `/api/v1/payroll-concepts/${id}`,
    CONCEPTS_DELETE: (id) => `/api/v1/payroll-concepts/${id}`,
    CONCEPTS_VALIDATE_FORMULA: "/api/v1/payroll-concepts/validate-formula",
    RECEIPT_TYPES_GETALL: "/api/v1/payroll-concepts/receipt-types",
    RECEIPT_TYPES_CREATE: "/api/v1/payroll-concepts/receipt-types",

    // Política y configuración
    POLICY_GET: "/api/v1/payroll-policy/policy",
    POLICY_UPDATE: "/api/v1/payroll-policy/policy",
    COMPANY_GET: "/api/v1/payroll-policy/company",
    COMPANY_UPDATE: "/api/v1/payroll-policy/company",

    // Novedades
    NOVELTIES_GETALL: "/api/v1/payroll-novelties",
    NOVELTIES_GETONE: (id) => `/api/v1/payroll-novelties/${id}`,
    NOVELTIES_CREATE: "/api/v1/payroll-novelties",
    NOVELTIES_UPDATE: (id) => `/api/v1/payroll-novelties/${id}`,
    NOVELTIES_DELETE: (id) => `/api/v1/payroll-novelties/${id}`,
    NOVELTIES_APPLY: (id) => `/api/v1/payroll-novelties/${id}/apply`,
    NOVELTIES_REJECT: (id) => `/api/v1/payroll-novelties/${id}/reject`,
    NOVELTIES_BULK_CREATE: "/api/v1/payroll-novelties/bulk-create",

    // Vacaciones
    VACATION_BALANCES_GETALL: "/api/v1/vacations/balances",
    VACATION_BALANCES_GETONE: (employeeId) => `/api/v1/vacations/balances/${employeeId}`,
    VACATION_REQUESTS_GETALL: "/api/v1/vacations/requests",
    VACATION_REQUESTS_GETONE: (id) => `/api/v1/vacations/requests/${id}`,
    VACATION_REQUESTS_CREATE: "/api/v1/vacations/requests",
    VACATION_REQUESTS_APPROVE: (id) => `/api/v1/vacations/requests/${id}/approve`,
    VACATION_REQUESTS_REJECT: (id) => `/api/v1/vacations/requests/${id}/reject`,
    VACATION_REQUESTS_PAY: (id) => `/api/v1/vacations/requests/${id}/pay`,
    HOLIDAYS_GETALL: "/api/v1/vacations/holidays",
    HOLIDAYS_CREATE: "/api/v1/vacations/holidays",
    HOLIDAYS_DELETE: (id) => `/api/v1/vacations/holidays/${id}`,

    // Prestaciones Sociales
    SOCIAL_BENEFITS_LEDGER_GETALL: "/api/v1/social-benefits/ledger",
    SOCIAL_BENEFITS_LEDGER_GET_EMPLOYEE: (employeeId) => `/api/v1/social-benefits/ledger/employee/${employeeId}`,
    SOCIAL_BENEFITS_SETTLEMENTS_CALCULATE: "/api/v1/social-benefits/settlements/calculate",
    SOCIAL_BENEFITS_SETTLEMENTS_CREATE: "/api/v1/social-benefits/settlements",
    SOCIAL_BENEFITS_SETTLEMENTS_GETALL: "/api/v1/social-benefits/settlements",
    SOCIAL_BENEFITS_SETTLEMENTS_GETONE: (id) => `/api/v1/social-benefits/settlements/${id}`,
    SOCIAL_BENEFITS_SETTLEMENTS_APPROVE: (id) => `/api/v1/social-benefits/settlements/${id}/approve`,
    SOCIAL_BENEFITS_SETTLEMENTS_PAY: (id) => `/api/v1/social-benefits/settlements/${id}/pay`,
    SOCIAL_BENEFITS_ACCRUAL_CALCULATE: "/api/v1/social-benefits/accrual/calculate",
    SOCIAL_BENEFITS_ACCRUAL_RECORD: "/api/v1/social-benefits/accrual/record",

    // Utilidades
    UTILIDADES_PERIODS_GETALL: "/api/v1/utilidades/periods",
    UTILIDADES_PERIODS_GETONE: (id) => `/api/v1/utilidades/periods/${id}`,
    UTILIDADES_PERIODS_CREATE: "/api/v1/utilidades/periods",
    UTILIDADES_PERIODS_CALCULATE: (id) => `/api/v1/utilidades/periods/${id}/calculate`,
    UTILIDADES_PERIODS_APPROVE: (id) => `/api/v1/utilidades/periods/${id}/approve`,
    UTILIDADES_PERIODS_PAY: (id) => `/api/v1/utilidades/periods/${id}/pay`,
    UTILIDADES_PAYMENTS_GETALL: "/api/v1/utilidades/payments",
    UTILIDADES_PAYMENTS_GETONE: (id) => `/api/v1/utilidades/payments/${id}`,
    UTILIDADES_PAYMENTS_PAY: (id) => `/api/v1/utilidades/payments/${id}/pay`,
}
