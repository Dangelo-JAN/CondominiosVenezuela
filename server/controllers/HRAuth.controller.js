import { HumanResources, CARGO_TO_ROLE, DEFAULT_PERMISSIONS } from "../models/HR.model.js"
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import mongoose from 'mongoose'
import { GenerateJwtTokenAndSetCookiesHR } from "../utils/generatejwttokenandsetcookies.js"
import { SendVerificationEmail, SendWelcomeEmail, SendForgotPasswordEmail, SendResetPasswordConfimation } from "../sendgrid/emails.js"
import { GenerateVerificationToken } from "../utils/generateVerificationToken.js"
import { Organization } from "../models/Organization.model.js"
import { PayrollCompany } from "../models/payroll/PayrollCompany.model.js"
import { sanitizeRif } from "../models/Organization.model.js"

export const HandleHRSignup = async (req, res) => {
    // Usar transacción MongoDB para atomicidad: Organization + PayrollCompany o rollback total
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const { 
            firstname, lastname, email, password, contactnumber, 
            name, description, OrganizationURL, OrganizationMail,
            organizationRif  // NUEVO: RIF obligatorio para crear PayrollCompany válida
        } = req.body

        if (!name || !description || !OrganizationURL || !OrganizationMail) {
            throw new Error("All Fields are required")
        }

        if (!firstname || !lastname || !email || !password || !contactnumber) {
            throw new Error("All Fields are required")
        }

        // NUEVO: Validar RIF obligatorio para nueva organización
        if (!organizationRif) {
            throw new Error("RIF de la organización es requerido (obligatorio para nómina venezolana)")
        }

        // Normalizar RIF: solo alphanumeric, uppercase
        const sanitizedRif = sanitizeRif(organizationRif)
        
        // Validar formato RIF venezolano (J/V/E/G + 8-9 dígitos)
        const rifRegex = /^[JVEG][0-9]{8,9}$/
        if (!rifRegex.test(sanitizedRif)) {
            throw new Error("RIF inválido. Formato: J314188305 (letra J/V/E/G + 8-9 dígitos, sin guiones)")
        }

        const organization = await Organization.findOne({ name: name, OrganizationURL: OrganizationURL, OrganizationMail: OrganizationMail })
        const HR = await HumanResources.findOne({ email: email })

        if (HR) {
            await session.abortTransaction()
            await session.endSession()
            return res.status(400).json({ success: false, message: "HR already exists, please go to the login page or create new HR", type: "signup" })
        }

        if (!organization && !HR) {
            // NUEVA ORGANIZACIÓN: Transacción atómica Organization + PayrollCompany
            
            // 1. Crear Organization con RIF sanitizado
            const newOrganization = await Organization.create([{
                name, description, OrganizationURL, OrganizationMail,
                rif: sanitizedRif
            }], { session })

            const orgId = newOrganization[0]._id

            // 2. Verificar duplicado PayrollCompany (por organizationID único)
            const existingCompany = await PayrollCompany.findOne({ organizationID: orgId }).session(session)
            if (existingCompany) {
                await session.abortTransaction()
                await session.endSession()
                throw new Error("La organización ya tiene configuración de nómina (PayrollCompany)")
            }

            // 3. Crear PayrollCompany con datos heredados de Organization + defaults venezolanos
            const payrollDefaults = {
                organizationID: orgId,
                rif: sanitizedRif,                    // ← Heredado de Organization (sanitizado)
                email: OrganizationMail,              // ← Heredado de Organization
                name: name,                           // ← Nombre del edificio/condominio
                // Configuración nómina venezolana (defaults del modelo)
                salary_split_mode: 'MIXTO',
                split_percentage_base: 60.00,
                cestaticket_amount_usd: 40.00,
                cestaticket_payment_day: 15,
                cestaticket_package_mode: 'INTEGRADO',
                vacation_days_base: 15,
                vacation_days_per_year: 1,
                vacation_days_max: 30,
                vacation_bonus_days_base: 15,
                vacation_bonus_days_per_year: 1,
                vacation_bonus_days_max: 30,
                exchange_rate_source: 'BCV',
                rest_weekdays: [5, 6],
                minimum_wage_ves: 130.00,
                ut_value_ves: 9.00,
                imii_usd: 130.00,
                ivss_employee_rate: 4.00,
                ivss_employer_rate: 9.00,
                ivss_salary_cap_multiplier: 5,
                faov_employee_rate: 1.00,
                faov_employer_rate: 2.00,
                rpe_employee_rate: 0.50,
                rpe_employer_rate: 2.00,
                lppss_rate: 9.00,
                inces_employer_rate: 2.00,
                holiday_payout_factor: 1.50,
                rest_day_payout_factor: 1.50,
                overtime_day_factor: 1.50,
                overtime_night_factor: 1.50,
                night_bonus_rate: 0.30,
                min_service_months: 12,
                pay_rest_days: true,
                pay_holidays: true,
                accrual_mode: 'ANNUAL',
                vacation_salary_basis: 'LAST_SALARY',
                vacation_salary_source: 'TOTAL_SALARY',
                cestaticket_pay_on_vacation: true,
                cestaticket_separate_period: false,
                seniority_cap_years: 30,
                include_cestaticket_in_benefits: true,
                include_commissions_in_benefits: true,
                include_bonuses_in_benefits: true,
                include_overtime_in_benefits: true,
                include_utilidades_in_benefits: true,
                faov_employer_base_formula: 'SALARIO_MENSUAL',
                vacation_cestaticket_label: 'CESTATICKET VACACIONAL',
                active_modules: ['payroll', 'vacations', 'social_benefits', 'utilidades'],
                banavih_patron_number: '',
                inces_number: '',
                faov_number: '',
                ivss_number: '',
                address: '',
                phone: '',
                logo: '',
                colors: {
                    primary: '#003DA5',
                    secondary: '#FCE300'
                }
            }

            await PayrollCompany.create([payrollDefaults], { session })

            // 4. Crear HR (Presidente)
            const hashedpassword = await bcrypt.hash(password, 10)
            const verificationcode = GenerateVerificationToken(6)

            const newHR = await HumanResources.create([{
                firstname, lastname, email, password: hashedpassword, contactnumber,
                role: "HR-Admin", cargo: "Presidente", organizationID: orgId,
                verificationtoken: verificationcode,
                verificationtokenexpires: Date.now() + 24 * 60 * 60 * 1000
            }], { session })

            // 5. Vincular HR a Organization
            await Organization.findByIdAndUpdate(orgId, { 
                $push: { HRs: newHR[0]._id } 
            }, { session })

            // 6. Commit transacción
            await session.commitTransaction()
            await session.endSession()

            const token = GenerateJwtTokenAndSetCookiesHR(res, newHR[0]._id, newHR[0].role, orgId)
            const VerificationEmailStatus = await SendVerificationEmail(email, verificationcode)
            return res.status(201).json({
                success: true, message: "Organization Created Successfully & HR Registered Successfully & PayrollCompany Created",
                VerificationEmailStatus, type: "signup", HRid: newHR[0]._id, token,
                verificationcode: verificationcode
            })
        }

        if (organization && !HR) {
            // ORGANIZACIÓN EXISTENTE: Unirse a organización existente
            // Verificar si ya existe PayrollCompany
            const existingCompany = await PayrollCompany.findOne({ organizationID: organization._id }).session(session)
            if (!existingCompany) {
                await session.abortTransaction()
                await session.endSession()
                return res.status(400).json({ 
                    success: false, 
                    message: "La organización no tiene configuración de nómina completa. Contacte al administrador.", 
                    type: "signup",
                    code: "COMPANY_NOT_CONFIGURED"
                })
            }

            // Verificar si ya existe un Presidente en la organización
            const existingPresidente = await HumanResources.findOne({
                organizationID: organization._id,
                cargo: "Presidente"
            }).session(session)

            // Si ya existe un Presidente, el nuevo usuario será Viewer (General)
            const newCargo = existingPresidente ? "General" : "Presidente"
            const newRole = CARGO_TO_ROLE[newCargo]

            const hashedpassword = await bcrypt.hash(password, 10)
            const verificationcode = GenerateVerificationToken(6)

            const newHR = await HumanResources.create([{
                firstname, lastname, email, password: hashedpassword, contactnumber,
                role: newRole, cargo: newCargo, organizationID: organization._id,
                verificationtoken: verificationcode,
                verificationtokenexpires: Date.now() + 24 * 60 * 60 * 1000,
                permissions: DEFAULT_PERMISSIONS[newRole]
            }], { session })

            await Organization.findByIdAndUpdate(organization._id, { 
                $push: { HRs: newHR[0]._id } 
            }, { session })

            await session.commitTransaction()
            await session.endSession()

            const token = GenerateJwtTokenAndSetCookiesHR(res, newHR[0]._id, newHR[0].role, organization._id)
            const VerificationEmailStatus = await SendVerificationEmail(email, verificationcode)
            return res.status(201).json({
                success: true, message: "HR Registered Successfully",
                type: "signup", VerificationEmailStatus, HRid: newHR[0]._id, token,
                verificationcode: verificationcode
            })
        }

    } catch (error) {
        await session.abortTransaction()
        await session.endSession()
        return res.status(500).json({ success: false, message: error.message, type: "signup" })
    }
}

export const HandleHRVerifyEmail = async (req, res) => {
    const { verificationcode } = req.body
    try {
        const HR = await HumanResources.findOne({ verificationtoken: verificationcode, organizationID: req.ORGID, verificationtokenexpires: { $gt: Date.now() } })

        if (!HR) {
            return res.status(401).json({ success: false, message: "Invalid or Expired Verifiation Code", type: "HRverifyemail" })
        }

        HR.isverified = true
        HR.verificationtoken = undefined
        HR.verificationtokenexpires = undefined
        await HR.save()

        const SendWelcomeEmailStatus = await SendWelcomeEmail(HR.email, HR.firstname, HR.lastname, HR.role)
        return res.status(200).json({ success: true, message: "Email Verified successfully", SendWelcomeEmailStatus, type: "HRverifyemail" })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message, type: "HRverifyemail" })
    }
}

export const HandleHRLogin = async (req, res) => {
    const { email, password } = req.body
    try {
        const HR = await HumanResources.findOne({ email: email })

        if (!HR) {
            return res.status(400).json({ success: false, message: "Invaild Credentials, Please Add Correct One", type: "HRLogin" })
        }

        const isMatch = await bcrypt.compare(password, HR.password)

        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invaild Credentials, Please Add Correct One", type: "HRLogin" })
        }

        const token = GenerateJwtTokenAndSetCookiesHR(res, HR._id, HR.role, HR.organizationID)
        HR.lastlogin = new Date()
        await HR.save()

        return res.status(200).json({
            success: true,
            message: "HR Login Successfull",
            type: "HRLogin",
            token,
            HRid: HR._id,
            firstname: HR.firstname,
            lastname: HR.lastname,
            email: HR.email,
            role: HR.role,
            cargo: HR.cargo,
            isverified: HR.isverified,
            permissions: HR.permissions ? HR.permissions.toObject() : {}
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error, type: "HRLogin" })
    }
}

export const HandleHRLogout = async (req, res) => {
    try {
        return res.status(200).json({ success: true, message: "HR Logged Out Successfully" })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server Error", error: error })
    }
}

export const HandleHRCheck = async (req, res) => {
    try {
        const HR = await HumanResources.findOne({ _id: req.HRid, organizationID: req.ORGID })
        if (!HR) {
            return res.status(404).json({ success: false, message: "HR not found", type: "checkHR" })
        }

        // Devolver datos del HR incluyendo cargo, rol y permisos
        return res.status(200).json({
            success: true,
            message: "HR Already Logged In",
            type: "checkHR",
            HRid: HR._id,
            firstname: HR.firstname,
            lastname: HR.lastname,
            email: HR.email,
            role: HR.role,
            cargo: HR.cargo,
            isverified: HR.isverified,
            permissions: HR.permissions ? HR.permissions.toObject() : {}
        })
    } catch (error) {
        return res.status(500).json({ success: false, error: error, message: "internal error", type: "checkHR" })
    }
}

export const HandleHRForgotPassword = async (req, res) => {
    const { email } = req.body
    try {
        const HR = await HumanResources.findOne({ email: email, organizationID: req.ORGID, _id: req.HRid })

        if (!HR) {
            return res.status(404).json({ success: false, message: "HR Email Does Not Exist Please Enter Correct One", type: "HRforgotpassword" })
        }

        const resetToken = crypto.randomBytes(25).toString('hex')
        const resetTokenExpires = Date.now() + 1000 * 60 * 60

        HR.resetpasswordtoken = resetToken
        HR.resetpasswordexpires = resetTokenExpires
        await HR.save()

        const URL = `${process.env.CLIENT_URL}/auth/HR/resetpassword/${resetToken}`
        const SendResetPasswordEmailStatus = await SendForgotPasswordEmail(email, URL)
        return res.status(200).json({ success: true, message: "Reset Password Email Sent Successfully", SendResetPasswordEmailStatus, type: "HRforgotpassword" })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error, type: "HRforgotpassword" })
    }
}

export const HandleHRResetPassword = async (req, res) => {
    const { token } = req.params
    const { password } = req.body
    try {
        const HR = await HumanResources.findOne({ resetpasswordtoken: token, resetpasswordexpires: { $gt: Date.now() } })

        if (!HR) {
            return res.status(401).json({ success: false, message: "Invalid or Expired Reset Password Token", resetpassword: false })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        HR.password = hashedPassword
        HR.resetpasswordtoken = undefined
        HR.resetpasswordexpires = undefined
        await HR.save()

        const SendPasswordResetEmailStatus = await SendResetPasswordConfimation(HR.email)
        return res.status(200).json({ success: true, message: "Password Reset Successfully", SendPasswordResetEmailStatus, resetpassword: true })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error, resetpassword: false })
    }
}

export const HandleHRResetverifyEmail = async (req, res) => {
    const { email } = req.body
    try {
        const HR = await HumanResources.findOne({ email: email, _id: req.HRid, organizationID: req.ORGID })

        if (!HR) {
            return res.status(404).json({ success: false, message: "HR Email Does Not Exist, Please Enter Correct Email", type: "HRResendVerifyEmail" })
        }

        if (HR.isverified) {
            return res.status(400).json({ success: false, message: "HR Email is already Verified", type: "HRResendVerifyEmail" })
        }

        const verificationcode = GenerateVerificationToken(6)
        HR.verificationtoken = verificationcode
        HR.verificationtokenexpires = Date.now() + 24 * 60 * 60 * 1000
        await HR.save()

        const SendVerificationEmailStatus = await SendVerificationEmail(email, verificationcode)
        return res.status(200).json({
            success: true, message: "Verification Email Sent Successfully",
            SendVerificationEmailStatus, type: "HRResendVerifyEmail",
            verificationcode: verificationcode
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleHRcheckVerifyEmail = async (req, res) => {
    try {
        const HR = await HumanResources.findOne({ _id: req.HRid, organizationID: req.ORGID })

        if (HR.isverified) {
            return res.status(200).json({ sucess: true, message: "HR Already Verified", type: "HRcodeavailable", alreadyverified: true })
        }

        if ((HR.verificationtoken) && (HR.verificationtokenexpires > Date.now())) {
            return res.status(200).json({ success: true, message: "Verification Code is Still Valid", type: "HRcodeavailable" })
        }

        return res.status(404).json({ success: false, message: "Invalid or Expired Verification Code", type: "HRcodeavailable" })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error, type: "HRcodeavailable" })
    }
}
