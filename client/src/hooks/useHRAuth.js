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

// ── Default Permissions (mirror de server/models/HR.model.js) ────────────────
const DEFAULT_PERMISSIONS = {
    "HR-Admin": {
        employees:   { create: true,  read: true, update: true,  delete: true  },
        departments: { create: true,  read: true, update: true,  delete: true  },
        schedules:   { create: true,  read: true, update: true,  delete: true  },
        photos:      { create: true,  read: true, update: true,  delete: true  },
        salaries:    { create: true,  read: true, update: true,  delete: true  },
        notices:     { create: true,  read: true, update: true,  delete: true  },
        leaves:      { create: true,  read: true, update: true,  delete: true  },
        requests:    { create: true,  read: true, update: true,  delete: true  },
        attendance:  { create: true,  read: true, update: true,  delete: true  },
        recruitment: { create: true,  read: true, update: true,  delete: true  },
        interviews:  { create: true,  read: true, update: true,  delete: true  },
        hrprofiles:  { create: true,  read: true, update: true,  delete: true  },
        bitacoras:   { create: false, read: true, update: false, delete: true  },
        payroll:     { create: true,  read: true, update: true,  delete: true  },
    },
    "HR-Manager": {
        employees:   { create: true,  read: true, update: true,  delete: true  },
        departments: { create: true,  read: true, update: true,  delete: true  },
        schedules:   { create: true,  read: true, update: true,  delete: true  },
        photos:      { create: true,  read: true, update: true,  delete: true  },
        salaries:    { create: true,  read: true, update: true,  delete: true  },
        notices:     { create: true,  read: true, update: true,  delete: true  },
        leaves:      { create: true,  read: true, update: true,  delete: true  },
        requests:    { create: true,  read: true, update: true,  delete: true  },
        attendance:  { create: true,  read: true, update: true,  delete: true  },
        recruitment: { create: true,  read: true, update: true,  delete: true  },
        interviews:  { create: true,  read: true, update: true,  delete: true  },
        hrprofiles:  { create: false, read: true, update: false, delete: false },
        bitacoras:   { create: false, read: true, update: false, delete: false },
        payroll:     { create: true,  read: true, update: true,  delete: true  },
    },
    "HR-Viewer": {
        employees:   { create: false, read: true, update: false, delete: false },
        departments: { create: false, read: true, update: false, delete: false },
        schedules:   { create: false, read: true, update: false, delete: false },
        photos:      { create: false, read: true, update: false, delete: false },
        salaries:    { create: false, read: true, update: false, delete: false },
        notices:     { create: false, read: true, update: false, delete: false },
        leaves:      { create: false, read: true, update: false, delete: false },
        requests:    { create: false, read: true, update: false, delete: false },
        attendance:  { create: false, read: true, update: false, delete: false },
        recruitment: { create: false, read: true, update: false, delete: false },
        interviews:  { create: false, read: true, update: false, delete: false },
        hrprofiles:  { create: false, read: false, update: false, delete: false },
        bitacoras:   { create: false, read: true,  update: false, delete: false },
        payroll:     { create: false, read: true, update: false, delete: false },
    }
}

export const useHRAuth = () => {
    // ── Obtener datos del HRReducer ───────────────────────────────────
    const role       = useSelector(s => s.HRReducer?.data?.role)
    const permissions = useSelector(s => s.HRReducer?.data?.permissions)
    
    // ── Computar helpers de rol ───────────────────────────────────────
    const isAdmin   = role === "HR-Admin"
    const isManager = role === "HR-Manager"
    const isViewer  = role === "HR-Viewer"
    
    // ── Fallback a defaults por rol si permissions no cargó aún ────────
    const effectivePermissions = useMemo(() => {
        if (permissions && typeof permissions === "object" && Object.keys(permissions).length > 0) {
            return permissions
        }
        return role ? DEFAULT_PERMISSIONS[role] || {} : {}
    }, [permissions, role])
    
    // ── Función can memoizada ─────────────────────────────────────────
    const can = useMemo(() => {
        return (module, action) => {
            // HR-Admin tiene todos los permisos
            if (isAdmin) return true
            
            // Verificar que el módulo y acción existan
            if (!module || !action) return false
            
            const modulePerms = effectivePermissions[module]
            if (!modulePerms || typeof modulePerms !== "object") return false
            
            // Retornar el valor booleano del permiso específico
            return modulePerms[action] === true
        }
    }, [isAdmin, effectivePermissions])
    
    // ── isReady: true cuando role está definido (no es null/undefined) ─
    const isReady = role !== null && role !== undefined
    
    // ── Retornar datos y helpers ───────────────────────────────────────
    return {
        role: role || null,
        permissions: effectivePermissions,
        isAdmin,
        isManager,
        isViewer,
        isReady,
        can,
        canCreate: (module) => can(module, "create"),
        canUpdate: (module) => can(module, "update"),
        canDelete: (module) => can(module, "delete"),
        canRead:   (module) => can(module, "read"),
    }
}

export default useHRAuth