import { HumanResources } from "../models/HR.model.js"

// ── Verificar rol (compatibilidad con código existente) ───────────────────
export const RoleAuthorization = (...AuthRoles) => {
    return (req, res, next) => {
        if (!AuthRoles.includes(req.Role)) {
            return res.status(403).json({
                success: false,
                message: "No tienes autorización para acceder a esta ruta"
            })
        }
        next()
    }
}

// ── Verificar permiso granular ────────────────────────────────────────────
// Uso: PermissionCheck("employees", "create")
// Uso: PermissionCheck("schedules", "delete")
export const PermissionCheck = (module, action) => {
    return async (req, res, next) => {
        console.log("[LOG SERVER] PermissionCheck - módulo:", module, "acción:", action, "role:", req.Role)
        
        try {
            // HR-Admin siempre tiene acceso total
            if (req.Role === "HR-Admin") {
                console.log("[LOG SERVER] PermissionCheck - HR-Admin, acceso concedido")
                return next()
            }

            const hr = await HumanResources.findOne({
                _id: req.HRid,
                organizationID: req.ORGID,
                isactive: true
            })

            if (!hr) {
                console.log("[LOG SERVER] PermissionCheck - HR no encontrado o inactivo")
                return res.status(403).json({
                    success: false,
                    message: "Perfil HR no encontrado o inactivo"
                })
            }

            const modulePerms = hr.permissions?.[module]

            if (!modulePerms || !modulePerms[action]) {
                console.log("[LOG SERVER] PermissionCheck - permiso denegado:", module, action)
                return res.status(403).json({
                    success: false,
                    message: `No tienes permiso para ${action} en ${module}`,
                    permission_denied: true
                })
            }

            console.log("[LOG SERVER] PermissionCheck - acceso concedido")
            next()
        } catch (error) {
            console.log("[LOG SERVER] PermissionCheck - error:", error.message)
            return res.status(500).json({
                success: false,
                message: "Error verificando permisos",
                error
            })
        }
    }
}

// ── Verificar que es HR-Admin (para rutas exclusivas de Admin) ────────────
export const AdminOnly = (req, res, next) => {
    if (req.Role !== "HR-Admin") {
        return res.status(403).json({
            success: false,
            message: "Esta acción es exclusiva del HR-Admin"
        })
    }
    next()
}
