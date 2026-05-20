import {
    INVITATION_HR_TEMPLATE,
    INVITATION_EMPLOYEE_TEMPLATE,
    VERIFICATION_EMAIL_TEMPLATE,
    WELCOME_HR_TEMPLATE,
    WELCOME_EMPLOYEE_TEMPLATE,
    PASSWORD_RESET_REQUEST_TEMPLATE,
    PASSWORD_RESET_SUCCESS_TEMPLATE
} from "./emailtemplates.js"
import { sgMail, sender } from "./sendgrid.config.js"

// ── Helper interno ────────────────────────────────────────────────────────
const sendMail = async ({ to, subject, html }) => {
    try {
        await sgMail.send({
            from: { email: sender.email, name: sender.name },
            to,
            subject,
            html,
        })
        return true
    } catch (error) {
        console.error("Error enviando email:", error.message)
        if (error.response) {
            console.error("SendGrid error body:", error.response.body)
        }
        return false
    }
}

// ── Invitación HR ─────────────────────────────────────────────────────────
export const SendInvitationEmail = async (email, firstname, inviteURL, cargo) => {
    return sendMail({
        to: email,
        subject: "Te han invitado a unirte a CondoVE SGC",
        html: INVITATION_HR_TEMPLATE
            .replace("{name}", firstname)
            .replace("{role}", cargo)
            .replace(/{inviteURL}/g, inviteURL),
    })
}

// ── Invitación Empleado ─────────────────────────────────────────────────────────
export const SendEmployeeInvitationEmail = async (email, firstname, inviteURL, companyName) => {
    return sendMail({
        to: email,
        subject: "Te han invitado a unirte al equipo",
        html: INVITATION_EMPLOYEE_TEMPLATE
            .replace(/{name}/g, firstname)
            .replace(/{companyName}/g, companyName)
            .replace(/{inviteURL}/g, inviteURL),
    })
}

// ── Verificación de email ─────────────────────────────────────────────────
export const SendVerificationEmail = async (email, verificationcode) => {
    return sendMail({
        to: email,
        subject: "Verifica tu correo electrónico — CondoVE SGC",
        html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationcode),
    })
}

// ── Bienvenida ────────────────────────────────────────────────────────────
export const SendWelcomeEmail = async (email, firstname, lastname, role) => {
    const name = `${firstname} ${lastname}`

    if (role === "HR-Admin") {
        return sendMail({
            to: email,
            subject: "¡Bienvenido a CondoVE SGC! Tu cuenta está lista",
            html: WELCOME_HR_TEMPLATE.replace("{name}", name),
        })
    } else {
        return sendMail({
            to: email,
            subject: "¡Bienvenido al equipo! Tu cuenta está lista",
            html: WELCOME_EMPLOYEE_TEMPLATE.replace("{name}", name),
        })
    }
}

// ── Recuperar contraseña ──────────────────────────────────────────────────
export const SendForgotPasswordEmail = async (email, resetURL) => {
    return sendMail({
        to: email,
        subject: "Restablecer contraseña — CondoVE SGC",
        html: PASSWORD_RESET_REQUEST_TEMPLATE.replace(/{resetURL}/g, resetURL),
    })
}

// ── Confirmación de contraseña restablecida ───────────────────────────────
export const SendResetPasswordConfimation = async (email) => {
    return sendMail({
        to: email,
        subject: "Contraseña restablecida exitosamente — CondoVE SGC",
        html: PASSWORD_RESET_SUCCESS_TEMPLATE,
    })
}
