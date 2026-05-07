import jwt from 'jsonwebtoken'
import { HumanResources } from '../models/HR.model.js'

export const VerifyEmployeeToken = (req, res, next) => {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null

    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized access", gologin: true })
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        
        if (!decoded) {
            return res.status(403).json({ success: false, message: "Unauthenticated employee", gologin: true })
        }
        
        // Verificar que tiene EMid (empleado)
        if (!decoded.EMid) {
            return res.status(403).json({ success: false, message: "Cuenta HR inactiva o no encontrada", gologin: true })
        }
        
        req.EMPID  = decoded.EMid
        req.EMrole = decoded.EMrole
        req.ORGID  = decoded.ORGID
        next()
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error", error: error })
    }
}

export const VerifyhHRToken = async (req, res, next) => {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null

    console.log("[LOG SERVER] VerifyhHRToken - token presente:", !!token)

    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized access", gologin: true })
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        console.log("[LOG SERVER] VerifyhHRToken - token decodificado:", decoded.HRid, decoded.HRrole)

        if (!decoded) {
            return res.status(403).json({ success: false, message: "Unauthenticated HR", gologin: true })
        }

        // Verificar que el HR sigue activo
        const hr = await HumanResources.findOne({ _id: decoded.HRid, organizationID: decoded.ORGID })
        if (!hr || !hr.isactive) {
            console.log("[LOG SERVER] VerifyhHRToken - HR no encontrado o inactivo")
            return res.status(403).json({ success: false, message: "Cuenta HR inactiva o no encontrada", gologin: true })
        }

        req.HRid  = decoded.HRid
        req.ORGID = decoded.ORGID
        req.Role  = decoded.HRrole
        next()
    } catch (error) {
        console.log("[LOG SERVER] VerifyhHRToken - error:", error.message)
        return res.status(500).json({ success: false, message: "Internal server error", error: error })
    }
}
