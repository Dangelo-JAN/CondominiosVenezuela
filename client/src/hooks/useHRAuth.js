/**
 * @name useHRAuth
 * @description Hook personalizado para acceder a los permisos y rol del HR autenticado.
 * 
 * @returns {Object} {
 *   role: string,          // "HR-Admin" | "HR-Manager" | "HR-Viewer"
 *   permissions: Object,  // { employees: {...}, departments: {...}, ... }
 *   isAdmin: boolean,
 *   isManager: boolean,
 *   isViewer: boolean,
 *   can: Function        // (module: string, action: string) => boolean
 * }
 * 
 * @example
 * const { role, isViewer, can } = useHRAuth()
 * if (isViewer) { /* restringido /* }
 * if (can("employees", "create")) { /* tiene permiso /* }
 */

import { useMemo } from "react"
import { useSelector } from "react-redux"

export const useHRAuth = () => {
    // ── Obtener datos del HRReducer ───────────────────────────────────
    const role       = useSelector(s => s.HRReducer?.data?.role)
    const permissions = useSelector(s => s.HRReducer?.data?.permissions)
    
    // ── Computar helpers de rol ───────────────────────────────────────
    const isAdmin   = role === "HR-Admin"
    const isManager = role === "HR-Manager"
    const isViewer  = role === "HR-Viewer"
    
    // ── Función can memoizada ─────────────────────────────────────────
    const can = useMemo(() => {
        return (module, action) => {
            // HR-Admin tiene todos los permisos
            if (isAdmin) return true
            
            // Si no hay permissions, denegar (excepto read)
            if (!permissions || typeof permissions !== "object") {
                return false
            }
            
            // Verificar que el módulo y acción existan
            if (!module || !action) return false
            
            const modulePerms = permissions[module]
            if (!modulePerms || typeof modulePerms !== "object") return false
            
            // Retornar el valor booleano del permiso específico
            return modulePerms[action] === true
        }
    }, [isAdmin, permissions])
    
    // ── Retornar datos y helpers ───────────────────────────────────────
    return {
        role: role || null,
        permissions: permissions || {},
        isAdmin,
        isManager,
        isViewer,
        can,
        canCreate: (module) => can(module, "create"),
        canUpdate: (module) => can(module, "update"),
        canDelete: (module) => can(module, "delete"),
        canRead:   (module) => can(module, "read"),
    }
}

export default useHRAuth