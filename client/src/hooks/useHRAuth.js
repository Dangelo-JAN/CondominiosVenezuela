/**
 * @name useHRAuth
 * @description Hook personalizado para acceder a los permisos y rol del HR autenticado.
 *              Utiliza los datos del HRReducer que ahora incluye permissions del endpoint GET /api/v1/HR/me
 * 
 * @returns {Object} {
 *   role: string,          // "HR-Admin" | "HR-Manager" | "HR-Viewer"
 *   permissions: Object,   // { employees: {...}, departments: {...}, ... }
 *   isAdmin: boolean,
 *   isManager: boolean,
 *   isViewer: boolean,
 *   can: Function          // (module: string, action: string) => boolean
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
    // ── Obtener datos directamente del HRReducer ────────────────────────
    // HRReducer.data viene del endpoint GET /api/v1/HR/me que ahora incluye permissions
    const role       = useSelector(s => s.HRReducer?.data?.role)
    const permissions = useSelector(s => s.HRReducer?.data?.permissions)
    
    // ── Memoización para computar helpers ────────────────────────────────
    const authData = useMemo(() => {
        const isAdmin   = role === "HR-Admin"
        const isManager = role === "HR-Manager"
        const isViewer  = role === "HR-Viewer"
        
        /**
         * Verifica si el HR actual tiene permiso para una acción específica
         * HR-Admin siempre tiene todos los permisos (bypass automático)
         * HR-Manager y HR-Viewer consultan permissions[module][action]
         * 
         * @param {string} module - Nombre del módulo (ej: "employees", "departments")
         * @param {string} action - Acción a verificar (ej: "create", "read", "update", "delete")
         * @returns {boolean} true si tiene permiso, false si no
         */
        const can = (module, action) => {
            // HR-Admin tiene todos los permisos
            if (isAdmin) return true
            
            // Verificar que el módulo y acción existan
            if (!module || !action) return false
            
            // Verificar que las estructuras de permisos existan
            if (!permissions || typeof permissions !== "object") return false
            
            const modulePerms = permissions[module]
            if (!modulePerms || typeof modulePerms !== "object") return false
            
            // Retornar el valor booleano del permiso específico
            return modulePerms[action] === true
        }
        
        return {
            isAdmin,
            isManager,
            isViewer,
            can
        }
    }, [role, permissions])
    
    // ── Retornar datos y helpers ───────────────────────────────────────────
    return {
        // ── Datos principales ─────────────────────────────────────────────
        role: role || null,
        permissions: permissions || {},
        
        // ── Helpers de rol ────────────────────────────────────────────────
        isAdmin:   authData.isAdmin,
        isManager: authData.isManager,
        isViewer:  authData.isViewer,
        
        // ── Función de verificación de permisos ───────────────────────────
        can: authData.can,
        
        // ── Helpers rápidos ───────────────────────────────────────────────
        canCreate: (module) => authData.can(module, "create"),
        canUpdate: (module) => authData.can(module, "update"),
        canDelete: (module) => authData.can(module, "delete"),
        canRead:   (module) => authData.can(module, "read"),
    }
}

// ── Exportación por defecto ──────────────────────────────────────────────
export default useHRAuth