import sgMail from '@sendgrid/mail'
import dotenv from 'dotenv'
dotenv.config()

// Debug: mostrar si la API key está configurada
console.log("[LOG SERVER] SendGrid config - API_KEY presente:", !!process.env.SENDGRID_API_KEY)
console.log("[LOG SERVER] SendGrid config - API_KEY primeros chars:", process.env.SENDGRID_API_KEY?.substring(0, 8) || "EMPTY")
console.log("[LOG SERVER] SendGrid config - SENDER_EMAIL:", process.env.SENDGRID_SENDER_EMAIL || "EMPTY")

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// Fallback: si SENDGRID_SENDER_EMAIL está vacío, usar valor por defecto
const getSenderEmail = () => {
    return process.env.SENDGRID_SENDER_EMAIL || 'noreply@condove.com'
}

export const sender = {
    email: getSenderEmail(),
    name: 'CondoVE SGC',
}

export { sgMail }
