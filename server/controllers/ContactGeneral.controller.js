import sgMail from '@sendgrid/mail'
import { ContactGeneral } from '../models/ContactGeneral.model.js'
import { CONTACT_GENERAL_TEMPLATE } from '../sendgrid/emailtemplates.js'

// Inicialización única al cargar el módulo
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

// Sanitización básica contra XSS
const sanitize = (str) => String(str).replace(/[<>]/g, "").trim()

// Validación de email
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export const HandleContactGeneralRequest = async (req, res) => {
    try {
        let {
            inquiryType,
            firstName,
            lastName,
            email,
            phone,
            companyName,
            website,
            country,
            message,
            privacyAccepted
        } = req.body

        // Sanitizar campos de texto
        firstName = sanitize(firstName || "")
        lastName = sanitize(lastName || "")
        email = sanitize(email || "")
        phone = sanitize(phone || "")
        companyName = sanitize(companyName || "")
        website = sanitize(website || "")
        country = sanitize(country || "")
        message = sanitize(message || "")

        // Validar campos requeridos
        if (!inquiryType || !firstName || !lastName || !email || !companyName || !country || !message) {
            return res.status(400).json({
                success: false,
                message: "Todos los campos obligatorios deben estar completos."
            })
        }

        // Validar formato de email
        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "El formato del correo electrónico es inválido."
            })
        }

        // Validar que aceptó privacidad
        if (!privacyAccepted) {
            return res.status(400).json({
                success: false,
                message: "Debe aceptar la política de privacidad para continuar."
            })
        }

        // Guardar en MongoDB — operación crítica
        const contact = await ContactGeneral.create({
            inquiryType,
            firstName,
            lastName,
            email,
            phone,
            companyName,
            website,
            country,
            message,
            privacyAccepted
        })

        // Enviar email — operación secundaria, no bloquea el éxito
        if (process.env.SENDGRID_API_KEY) {
            try {
                await sgMail.send({
                    to: process.env.SENDGRID_SENDER_EMAIL,
                    from: { email: process.env.SENDGRID_SENDER_EMAIL, name: "CondoVE SGC" },
                    subject: `📩 Nuevo Contacto General: ${inquiryType} — ${companyName}`,
                    html: CONTACT_GENERAL_TEMPLATE
                        .replace(/{inquiryType}/g, inquiryType)
                        .replace(/{firstName}/g, firstName)
                        .replace(/{lastName}/g, lastName)
                        .replace(/{email}/g, email)
                        .replace(/{phone}/g, phone || "No proporcionado")
                        .replace(/{companyName}/g, companyName)
                        .replace(/{website}/g, website || "No proporcionado")
                        .replace(/{country}/g, country)
                        .replace(/{message}/g, message)
                })
            } catch (emailError) {
                // El email falló pero el contacto ya está guardado — no afecta al usuario
                console.error("Error enviando email de contacto general:", emailError.response?.body || emailError.message)
            }
        } else {
            console.warn("SENDGRID_API_KEY no configurado — contacto guardado en BD sin email.")
        }

        return res.status(201).json({
            success: true,
            message: "Mensaje enviado correctamente. Nos pondremos en contacto contigo pronto.",
            data: contact
        })

    } catch (error) {
        console.error("Error en HandleContactGeneralRequest:", error)
        return res.status(500).json({
            success: false,
            message: "Error interno del servidor."
        })
    }
}
