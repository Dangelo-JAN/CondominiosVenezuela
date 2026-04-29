import sgMail from '@sendgrid/mail'
import { ContactSales } from '../models/ContactSales.model.js'

// Inicialización única al cargar el módulo
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

// Sanitización básica contra XSS
const sanitize = (str) => String(str).replace(/[<>]/g, "").trim()

// Validación de email
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export const HandleContactSalesRequest = async (req, res) => {
    try {
        let { fullname, workemail, companyname, companysize, message } = req.body

        // Sanitizar
        fullname = sanitize(fullname || "")
        workemail = sanitize(workemail || "")
        companyname = sanitize(companyname || "")
        companysize = sanitize(companysize || "")
        message = sanitize(message || "")

        // Validar campos requeridos
        if (!fullname || !workemail || !companyname || !companysize || !message) {
            return res.status(400).json({
                success: false,
                message: "Todos los campos son obligatorios."
            })
        }

        // Validar formato de email
        if (!isValidEmail(workemail)) {
            return res.status(400).json({
                success: false,
                message: "El formato del correo electrónico es inválido."
            })
        }

        // Guardar en MongoDB — operación crítica
        const contact = await ContactSales.create({
            fullname, workemail, companyname, companysize, message
        })

        // Enviar email — operación secundaria, no bloquea el éxito
        if (process.env.SENDGRID_API_KEY) {
            try {
                await sgMail.send({
                    to: process.env.SENDGRID_SENDER_EMAIL,
                    from: { email: process.env.SENDGRID_SENDER_EMAIL, name: "CondoVE SGC" },
                    subject: `🚀 Nuevo Contacto de Ventas: ${companyname} (${companysize} empleados)`,
                    text: `Nuevo cliente potencial:\n\nNombre: ${fullname}\nEmail: ${workemail}\nEmpresa: ${companyname}\nTamaño: ${companysize}\nMensaje:\n${message}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                            <h2>🚀 Nuevo Cliente Potencial - Contacto a Ventas</h2>
                            <p>Un visitante ha solicitado una demostración:</p>
                            <table style="width: 100%; max-width: 600px; border-collapse: collapse; margin-top: 15px;">
                                <tr>
                                    <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 30%;">Nombre:</td>
                                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${fullname}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
                                    <td style="padding: 10px; border-bottom: 1px solid #eee;">
                                        <a href="mailto:${workemail}" style="color: #6366f1;">${workemail}</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Empresa:</td>
                                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${companyname}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Tamaño:</td>
                                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${companysize}</td>
                                </tr>
                            </table>
                            <div style="margin-top: 20px; padding: 15px; background: #f9fafb; border-left: 4px solid #6366f1; border-radius: 4px;">
                                <h4 style="margin-top: 0; color: #111827;">Mensaje:</h4>
                                <p style="white-space: pre-wrap; margin-bottom: 0;">${message}</p>
                            </div>
                            <p style="margin-top: 30px; font-size: 12px; color: #9ca3af;">
                                Generado automáticamente por CondoVE SGC.
                            </p>
                        </div>
                    `
                })
            } catch (emailError) {
                // El email falló pero el contacto ya está guardado — no afecta al usuario
                console.error("Error enviando email de contacto:", emailError.response?.body || emailError.message)
            }
        } else {
            console.warn("SENDGRID_API_KEY no configurado — contacto guardado en BD sin email.")
        }

        return res.status(201).json({
            success: true,
            message: "Mensaje enviado correctamente.",
            data: contact
        })

    } catch (error) {
        console.error("Error en HandleContactSalesRequest:", error)
        return res.status(500).json({
            success: false,
            message: "Error interno del servidor."
        })
    }
}
