import { HumanResources, DEFAULT_PERMISSIONS } from "../models/HR.model.js"
import { Organization } from "../models/Organization.model.js"
import { SendInvitationEmail } from "../sendgrid/emails.js"
import crypto from "crypto"
import bcrypt from "bcrypt"
import { GenerateJwtTokenAndSetCookiesHR } from "../utils/generatejwttokenandsetcookies.js"

// ── HR-Admin: Invitar nuevo HR ────────────────────────────────────────────
export const HandleInviteHR = async (req, res) => {
    try {
        const { email, role, firstname, lastname } = req.body
        
        console.log("[LOG SERVER] HandleInviteHR - datos recibidos:", { email, role, firstname, lastname, orgID: req.ORGID, hrID: req.HRid })

        if (!email || !role || !firstname || !lastname) {
            console.log("[LOG SERVER] HandleInviteHR - ERROR: campos requeridos faltantes")
            return res.status(400).json({ success: false, message: "Todos los campos son requeridos" })
        }

        if (!["HR-Manager", "HR-Viewer"].includes(role)) {
            console.log("[LOG SERVER] HandleInviteHR - ERROR: rol inválido:", role)
            return res.status(400).json({ success: false, message: "Rol inválido — solo HR-Manager o HR-Viewer" })
        }

        const existing = await HumanResources.findOne({ email })
        if (existing) {
            console.log("[LOG SERVER] HandleInviteHR - ERROR: email ya existe:", email)
            return res.status(400).json({ success: false, message: "Ya existe un HR con ese email" })
        }

        console.log("[LOG SERVER] HandleInviteHR - creando invitación para:", email)
        const invitationtoken = crypto.randomBytes(32).toString("hex")
        const invitationtokenexpires = Date.now() + 1000 * 60 * 60 * 48 // 48 horas

        // Crear HR con permisos por defecto del rol — sin password aún
        const newHR = await HumanResources.create({
            firstname,
            lastname,
            email,
            password: await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 10), // temp password
            contactnumber: "pendiente",
            role,
            permissions: DEFAULT_PERMISSIONS[role],
            organizationID: req.ORGID,
            invitedby: req.HRid,
            invitationtoken,
            invitationtokenexpires,
            isverified: false,
            isactive: false // inactivo hasta que acepte la invitación
        })

        const organization = await Organization.findById(req.ORGID)
        organization.HRs.push(newHR._id)
        await organization.save()

        console.log("[LOG SERVER] HandleInviteHR - HR creado, enviando correo a:", email)
        
        const inviteURL = `${process.env.CLIENT_URL}/auth/HR/accept-invitation/${invitationtoken}`
        await SendInvitationEmail(email, firstname, inviteURL, role)
        
        console.log("[LOG SERVER] HandleInviteHR - correo enviado exitosamente a:", email)

        return res.status(201).json({
            success: true,
            message: `Invitación enviada a ${email}`,
            data: {
                _id: newHR._id,
                firstname: newHR.firstname,
                lastname: newHR.lastname,
                email: newHR.email,
                role: newHR.role,
                isactive: newHR.isactive
            }
        })

    } catch (error) {
        console.error("[LOG SERVER] HandleInviteHR - ERROR:", error.message)
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
    }
}

// ── Aceptar invitación (público) ──────────────────────────────────────────
export const HandleAcceptInvitation = async (req, res) => {
    try {
        const { token } = req.params
        const { password, contactnumber } = req.body

        if (!password || !contactnumber) {
            return res.status(400).json({ success: false, message: "Contraseña y teléfono son requeridos" })
        }

        const hr = await HumanResources.findOne({
            invitationtoken: token,
            invitationtokenexpires: { $gt: Date.now() }
        })

        if (!hr) {
            return res.status(404).json({ success: false, message: "Invitación inválida o expirada" })
        }

        hr.password = await bcrypt.hash(password, 10)
        hr.contactnumber = contactnumber
        hr.isverified = true
        hr.isactive = true
        hr.invitationtoken = undefined
        hr.invitationtokenexpires = undefined
        await hr.save()

        const jwtToken = GenerateJwtTokenAndSetCookiesHR(res, hr._id, hr.role, hr.organizationID)

        return res.status(200).json({
            success: true,
            message: "Invitación aceptada exitosamente",
            type: "HRLogin",
            token: jwtToken
        })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error })
    }
}

// ── HR-Admin: Obtener todos los HR de la organización ─────────────────────
export const HandleGetAllHRProfiles = async (req, res) => {
    try {
        const hrs = await HumanResources.find({ organizationID: req.ORGID })
            .select("-password -verificationtoken -resetpasswordtoken -invitationtoken")
            .populate("invitedby", "firstname lastname")
            .sort({ createdAt: -1 })

        return res.status(200).json({
            success: true,
            message: "Perfiles HR obtenidos exitosamente",
            data: hrs
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error })
    }
}

// ── HR-Admin: Actualizar permisos de un HR ────────────────────────────────
export const HandleUpdateHRPermissions = async (req, res) => {
    try {
        const { hrID, permissions } = req.body

        if (!hrID || !permissions) {
            return res.status(400).json({ success: false, message: "hrID y permissions son requeridos" })
        }

        // No se pueden modificar los permisos de otro HR-Admin
        const targetHR = await HumanResources.findOne({ _id: hrID, organizationID: req.ORGID })

        if (!targetHR) {
            return res.status(404).json({ success: false, message: "HR no encontrado" })
        }

        if (targetHR.role === "HR-Admin") {
            return res.status(403).json({ success: false, message: "No se pueden modificar los permisos de un HR-Admin" })
        }

        targetHR.permissions = { ...targetHR.permissions.toObject(), ...permissions }
        await targetHR.save()

        return res.status(200).json({
            success: true,
            message: "Permisos actualizados exitosamente",
            data: targetHR
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error })
    }
}

// ── HR-Admin: Cambiar rol de un HR ────────────────────────────────────────
export const HandleUpdateHRRole = async (req, res) => {
    try {
        const { hrID, role } = req.body

        if (!hrID || !role) {
            return res.status(400).json({ success: false, message: "hrID y role son requeridos" })
        }

        if (!["HR-Admin", "HR-Manager", "HR-Viewer"].includes(role)) {
            return res.status(400).json({ success: false, message: "Rol inválido" })
        }

        const targetHR = await HumanResources.findOne({ _id: hrID, organizationID: req.ORGID })

        if (!targetHR) {
            return res.status(404).json({ success: false, message: "HR no encontrado" })
        }

        // No pueden modificarse a sí mismos
        if (targetHR._id.toString() === req.HRid.toString()) {
            return res.status(403).json({ success: false, message: "No puedes cambiar tu propio rol" })
        }

        targetHR.role = role
        // Al cambiar rol, resetear permisos a los defaults del nuevo rol
        targetHR.permissions = DEFAULT_PERMISSIONS[role]
        await targetHR.save()

        return res.status(200).json({
            success: true,
            message: "Rol actualizado exitosamente",
            data: targetHR
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error })
    }
}

// ── HR-Admin: Activar/Desactivar HR ──────────────────────────────────────
export const HandleToggleHRActive = async (req, res) => {
    try {
        const { hrID } = req.body

        if (!hrID) {
            return res.status(400).json({ success: false, message: "hrID es requerido" })
        }

        const targetHR = await HumanResources.findOne({ _id: hrID, organizationID: req.ORGID })

        if (!targetHR) {
            return res.status(404).json({ success: false, message: "HR no encontrado" })
        }

        if (targetHR.role === "HR-Admin") {
            return res.status(403).json({ success: false, message: "No se puede desactivar a un HR-Admin" })
        }

        if (targetHR._id.toString() === req.HRid.toString()) {
            return res.status(403).json({ success: false, message: "No puedes desactivarte a ti mismo" })
        }

        targetHR.isactive = !targetHR.isactive
        await targetHR.save()

        return res.status(200).json({
            success: true,
            message: `HR ${targetHR.isactive ? "activado" : "desactivado"} exitosamente`,
            data: targetHR
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error })
    }
}

// ── HR-Admin: Eliminar HR ─────────────────────────────────────────────────
export const HandleDeleteHRProfile = async (req, res) => {
    try {
        const { hrID } = req.params

        const targetHR = await HumanResources.findOne({ _id: hrID, organizationID: req.ORGID })

        if (!targetHR) {
            return res.status(404).json({ success: false, message: "HR no encontrado" })
        }

        if (targetHR.role === "HR-Admin") {
            return res.status(403).json({ success: false, message: "No se puede eliminar a un HR-Admin" })
        }

        if (targetHR._id.toString() === req.HRid.toString()) {
            return res.status(403).json({ success: false, message: "No puedes eliminarte a ti mismo" })
        }

        const organization = await Organization.findById(req.ORGID)
        organization.HRs = organization.HRs.filter(id => id.toString() !== hrID)
        await organization.save()

        await targetHR.deleteOne()

        return res.status(200).json({
            success: true,
            message: "Perfil HR eliminado exitosamente"
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error })
    }
}
