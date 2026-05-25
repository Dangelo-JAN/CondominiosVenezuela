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

// ── Notificaciones In-App ──────────────────────────────────────────────────
export const HRNotificationsEndPoints = {
    GET_MY: "/api/v1/notification/my-notifications",
    UNREAD_COUNT: "/api/v1/notification/unread-count",
    MARK_READ: (id) => `/api/v1/notification/read/${id}`,
    MARK_ALL_READ: "/api/v1/notification/read-all"
}
