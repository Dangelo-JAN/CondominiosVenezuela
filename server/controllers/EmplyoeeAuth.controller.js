import { Employee } from "../models/Employee.model.js"
import bcrypt from 'bcrypt'
import { GenerateVerificationToken } from "../utils/generateVerificationToken.js"
import { SendVerificationEmail, SendWelcomeEmail, SendForgotPasswordEmail, SendResetPasswordConfimation, SendEmployeeInvitationEmail } from "../sendgrid/emails.js"
import { GenerateJwtTokenAndSetCookiesEmployee } from "../utils/generatejwttokenandsetcookies.js"
import crypto from "crypto"
import { Organization } from "../models/Organization.model.js"
import { Attendance } from "../models/Attendance.model.js"

export const HandleEmplyoeeSignup = async (req, res) => {
    const { firstname, lastname, email, password, contactnumber } = req.body
    
    console.log("[LOG SERVER] HandleEmplyoeeSignup - datos recibidos:", { firstname, lastname, email, hasPassword: !!password, contactnumber })
    
    try {
        if (!firstname || !lastname || !email || !contactnumber) {
            console.log("[LOG SERVER] HandleEmplyoeeSignup - ERROR: campos requeridos faltantes")
            throw new Error("All Fields are required")
        }

        const organization = await Organization.findOne({ _id: req.ORGID })

        if (!organization) {
            console.log("[LOG SERVER] HandleEmplyoeeSignup - ERROR: organización no encontrada")
            return res.status(404).json({ success: false, message: "Organization or Company not found" })
        }

        try {
            // El HR siempre crea empleados con password - se envía correo de invitación para activar
            const hashedPassword = await bcrypt.hash(password, 10)
            
            // Crear token de invitación
            const invitationtoken = crypto.randomBytes(32).toString("hex")
            const invitationtokenexpires = Date.now() + 1000 * 60 * 60 * 48 // 48 horas
            
            console.log("[LOG SERVER] HandleEmplyoeeSignup - creando empleado con invitationtoken")

            const newEmployee = await Employee.create({
                firstname, lastname, email, password: hashedPassword, contactnumber,
                role: "Employee",
                invitationtoken,
                invitationtokenexpires,
                isverified: false,
                isactive: false, // Inactivo hasta que active su cuenta con el token de invitación
                organizationID: organization._id
            })

            // Auto-inicializar asistencia al crear el empleado
            const newAttendance = await Attendance.create({
                employee: newEmployee._id,
                status: "Not Specified",
                organizationID: organization._id
            })
            newEmployee.attendance = newAttendance._id
            await newEmployee.save()

            organization.employees.push(newEmployee._id)
            await organization.save()

            // Enviar correo de invitación (el empleado debe activar su cuenta)
            const inviteURL = `${process.env.CLIENT_URL}/auth/employee/accept-invitation/${invitationtoken}`
            await SendEmployeeInvitationEmail(email, firstname, inviteURL, organization.name)

            return res.status(201).json({ 
                success: true, 
                message: "Empleado registrado. Se envió un correo de verificación.",
                data: {
                    _id: newEmployee._id,
                    firstname: newEmployee.firstname,
                    lastname: newEmployee.lastname,
                    email: newEmployee.email,
                    isverified: newEmployee.isverified
                },
                type: "EmployeeCreate" 
            })
        } catch (error) {
            res.status(400).json({ success: false, message: "Oops! Something went wrong", error: error })
        }

    } catch (error) {
        res.status(400).json({ success: false, message: "All Fields are required" })
    }
}

export const HandleEmplyoeeVerifyEmail = async (req, res) => {
    const { verificationcode } = req.body
    
    try {
        // Buscar por código sin filtrar por organización (ruta pública)
        const ValidateEmployee = await Employee.findOne({
            verificationtoken: verificationcode,
            verificationtokenexpires: { $gt: Date.now() }
        })

        if (!ValidateEmployee) {
            return res.status(404).json({ success: false, message: "Invalid or Expired Verifiation Code" })
        }

        ValidateEmployee.isverified = true
        ValidateEmployee.verificationtoken = undefined
        ValidateEmployee.verificationtokenexpires = undefined
        await ValidateEmployee.save()

        const SendWelcomeEmailStatus = await SendWelcomeEmail(ValidateEmployee.email, ValidateEmployee.firstname, ValidateEmployee.lastname)
        return res.status(200).json({ success: true, message: "Employee Email verified successfully", validatedEmployee: ValidateEmployee, SendWelcomeEmailStatus })
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleResetEmplyoeeVerifyEmail = async (req, res) => {
    const { email } = req.body
    try {
        const employee = await Employee.findOne({ email: email })

        if (!employee.email) {
            return res.status(404).json({ success: false, message: "Employee Email Does Not Exist, Please Enter Valid Email Address" })
        }

        if (employee.isverified) {
            return res.status(404).json({ success: false, message: "Employee Email Already verified" })
        }

        const verificationcode = GenerateVerificationToken(6)
        employee.verificationtoken = verificationcode
        employee.verificationtokenexpires = Date.now() + 24 * 60 * 60 * 1000
        await employee.save()

        const SendVerificationEmailStatus = await SendVerificationEmail(email, verificationcode)
        return res.status(200).json({ success: true, message: "Verification email sent successfully", SendVerificationEmailStatus })
    } catch (error) {
        res.status(500).json({ success: false, message: "internal error", error: error })
    }
}

export const HandleEmplyoeeLogin = async (req, res) => {
    const { email, password } = req.body
    try {
        const employee = await Employee.findOne({ email: email })

        if (!employee) {
            return res.status(404).json({ success: false, message: "Invalid Credentials, Please Enter Correct One" })
        }

        // Verificar si el empleado está activo
        if (!employee.isactive) {
            return res.status(403).json({ success: false, message: "Cuenta inactiva. Debes aceptar la invitación primero." })
        }

        // Verificar si el email está verificado (solo si tiene verificationtoken)
        if (!employee.isverified && employee.verificationtoken) {
            return res.status(403).json({ success: false, message: "Debes verificar tu correo electrónico antes de iniciar sesión." })
        }

        const isMatch = await bcrypt.compare(password, employee.password)

        if (!isMatch) {
            return res.status(404).json({ success: false, message: "Invalid Credentials, Please Enter Correct One" })
        }

        const token = GenerateJwtTokenAndSetCookiesEmployee(res, employee._id, employee.role, employee.organizationID)
        employee.lastlogin = new Date()
        await employee.save()

        return res.status(200).json({ success: true, message: "Emplyoee Login Successfull", token })
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleEmployeeCheck = async (req, res) => {
    try {
        const employee = await Employee.findOne({ _id: req.EMPID, organizationID: req.ORGID })
        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" })
        }
        return res.status(200).json({ success: true, message: "Employee Already Logged In" })
    } catch (error) {
        return res.status(500).json({ success: false, error: error, message: "internal error" })
    }
}

export const HandleEmplyoeeLogout = async (req, res) => {
    try {
        return res.status(200).json({ success: true, message: "Logged out successfully" })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server Error" })
    }
}

export const HandleEmplyoeeForgotPassword = async (req, res) => {
    const { email } = req.body
    try {
        const employee = await Employee.findOne({ email: email, organizationID: req.ORGID })

        if (!employee) {
            return res.status(401).json({ success: false, message: "Employee Email Does Not Exist, Please Enter Correct One" })
        }

        const resetToken = crypto.randomBytes(25).toString('hex')
        const resetTokenExpires = Date.now() + 1000 * 60 * 60

        employee.resetpasswordtoken = resetToken
        employee.resetpasswordexpires = resetTokenExpires
        await employee.save()

        const URL = `${process.env.CLIENT_URL}/auth/employee/resetpassword/${resetToken}`
        const SendForgotPasswordEmailStatus = await SendForgotPasswordEmail(email, URL)
        return res.status(200).json({ success: true, message: "Reset Password Email Sent Successfully", SendForgotPasswordEmailStatus })
    } catch (error) {
        res.status(500).json({ success: false, message: "internal server error", error: error })
    }
}

export const HandleEmplyoeeSetPassword = async (req, res) => {
    const { token } = req.params
    const { password } = req.body
    try {
        const employee = await Employee.findOne({ resetpasswordtoken: token, resetpasswordexpires: { $gt: Date.now() } })

        if (!employee) {
            return res.status(404).json({ success: false, message: "Invalid or Expired Reset Password Token", resetpassword: false })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        employee.password = hashedPassword
        employee.resetpasswordtoken = undefined
        employee.resetpasswordexpires = undefined
        await employee.save()

        const SendResetPasswordConfimationStatus = await SendResetPasswordConfimation(employee.email)
        return res.status(200).json({ success: true, message: "Password Reset Successful", SendResetPasswordConfimationStatus, resetpassword: true })
    } catch (error) {
        res.status(500).json({ success: false, message: "internal server error", error: error })
    }
}

export const HandleEmployeeCheckVerifyEmail = async (req, res) => {
    try {
        const employee = await Employee.findOne({ _id: req.EMPID, organizationID: req.ORGID })

        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found", type: "Employeecodeavailable" })
        }

        if (employee.isverified) {
            return res.status(200).json({ success: false, message: "Employee Already Verified", type: "Employeecodeavailable" })
        }

        if ((employee.verificationtoken) && (employee.verificationtokenexpires > Date.now())) {
            return res.status(200).json({ success: true, message: "Verification Code is Still Valid", type: "Employeecodeavailable" })
        }

        return res.status(200).json({ success: false, message: "Invalid or Expired Verification Code", type: "Employeecodeavailable" })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

// ── Aceptar invitación de empleado (público) ─────────────────────────────────
export const HandleAcceptEmployeeInvitation = async (req, res) => {
    try {
        const { token } = req.params
        const { password, contactnumber } = req.body

        console.log("[LOG DEBUG] HandleAcceptEmployeeInvitation - token recibido:", token)
        console.log("[LOG DEBUG] HandleAcceptEmployeeInvitation - password presente:", !!password)
        console.log("[LOG DEBUG] HandleAcceptEmployeeInvitation - contactnumber presente:", !!contactnumber)

        // Buscar empleado por invitationtoken
        const employee = await Employee.findOne({
            invitationtoken: token,
            invitationtokenexpires: { $gt: Date.now() }
        })

        console.log("[LOG DEBUG] HandleAcceptEmployeeInvitation - resultado búsqueda:", employee ? "ENCONTRADO" : "NO ENCONTRADO")
        
        if (employee) {
            console.log("[LOG DEBUG] - email:", employee.email)
            console.log("[LOG DEBUG] - isverified:", employee.isverified)
            console.log("[LOG DEBUG] - isactive:", employee.isactive)
            console.log("[LOG DEBUG] - invitationtokenexpires:", employee.invitationtokenexpires)
        }

        if (!employee) {
            return res.status(404).json({ success: false, message: "Invitación inválida o expirada" })
        }

        // Actualizar campos - password y contactnumber son opcionales
        // Si se envían, se actualizan; si no, se mantienen los existentes
        if (password) {
            employee.password = await bcrypt.hash(password, 10)
        }
        if (contactnumber) {
            employee.contactnumber = contactnumber
        }
        
        // Siempre activar el empleado
        employee.isverified = true
        employee.isactive = true
        employee.invitationtoken = undefined
        employee.invitationtokenexpires = undefined
        await employee.save()

        console.log("[LOG DEBUG] HandleAcceptEmployeeInvitation - empleado activado")
        console.log("[LOG DEBUG] - isverified:", employee.isverified)
        console.log("[LOG DEBUG] - isactive:", employee.isactive)

        const jwtToken = GenerateJwtTokenAndSetCookiesEmployee(res, employee._id, employee.role, employee.organizationID)

        return res.status(200).json({
            success: true,
            message: "Invitación aceptada exitosamente",
            type: "EmployeeLogin",
            token: jwtToken
        })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error })
    }
}
