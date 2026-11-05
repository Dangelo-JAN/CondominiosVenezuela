import express from 'express'
import {
    HandleEmployeeSignup, HandleEmployeeVerifyEmail, HandleEmployeeLogout,
    HandleEmployeeLogin, HandleEmployeeForgotPassword, HandleEmployeeSetPassword,
    HandleResetEmployeeVerifyEmail, HandleEmployeeCheck, HandleEmployeeCheckVerifyEmail,
    HandleAcceptEmployeeInvitation
} from '../controllers/EmployeeAuth.controller.js'
import { VerifyEmployeeToken, VerifyhHRToken } from '../middlewares/Auth.middleware.js'
import { PermissionCheck } from '../middlewares/RoleAuth.middleware.js'

const router = express.Router()

// Crear empleado requiere permiso de create en employees
router.post("/signup", VerifyhHRToken, PermissionCheck("employees", "create"), HandleEmployeeSignup)
// Aceptar invitación de empleado (público - sin auth)
router.post("/accept-invitation/:token", HandleAcceptEmployeeInvitation)
router.post("/verify-email", VerifyEmployeeToken, HandleEmployeeVerifyEmail)
router.post("/resend-verify-email", VerifyEmployeeToken, HandleResetEmployeeVerifyEmail)
router.post("/login", HandleEmployeeLogin)
router.post("/logout", HandleEmployeeLogout)
router.post("/forgot-password", VerifyEmployeeToken, HandleEmployeeForgotPassword)
router.post("/reset-password/:token", HandleEmployeeSetPassword)
router.get("/check-verify-email", VerifyEmployeeToken, HandleEmployeeCheckVerifyEmail)

export default router
