/**
 * @name ProtectedHRRoute
 * @description Componente wrapper para proteger rutas HR según rol.
 *              Redirige automáticamente a dashboard si el rol no tiene acceso.
 * 
 * @param {ReactNode} children - Componente children a renderizar si tiene acceso
 * @param {string[]} allowedRoles - Roles que tienen acceso a la ruta (ej: ["HR-Admin", "HR-Manager"])
 * @param {Array<[string, string]>} allowedPermissions - Permisos requeridos [[module, action], ...]
 * @param {string} redirectTo - Ruta de redirección si no tiene acceso (default: dashboard)
 * 
 * @example
 * // Proteger ruta solo para Admin y Manager
 * <ProtectedHRRoute allowedRoles={["HR-Admin", "HR-Manager"]}>
 *   <HRProfilesPage />
 * </ProtectedHRRoute>
 * 
 * // Proteger ruta con permisos específicos
 * <ProtectedHRRoute allowedPermissions={[["employees", "create"], ["employees", "read"]]}>
 *   <EmployeesPage />
 * </ProtectedHRRoute>
 */

import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"
import { useHRAuth } from "../../hooks/useHRAuth.js"
import { Loading } from "../common/loading.jsx"

/**
 * Componente de protección de rutas HR
 * Verifica rol y/o permisos antes de renderizar children
 */
export const ProtectedHRRoute = ({
    children,
    allowedRoles = [],
    allowedPermissions = [],
    redirectTo = "/HR/dashboard/dashboard-data"
}) => {
    const navigate = useNavigate()
    const location = useLocation()
    const { role, isAdmin, can } = useHRAuth()
    
    // Estado para manejar carga inicial (evitar flash de contenido)
    const [isChecking, setIsChecking] = useState(true)
    
    // Obtener datos del HR para verificar si están cargados
    const HRData = useSelector(s => s.HRReducer?.data)
    
    useEffect(() => {
        // Verificar que los datos del HR estén disponibles
        if (!HRData) {
            setIsChecking(true)
            return
        }
        
        // Verificar que el rol esté disponible
        if (!role) {
            setIsChecking(true)
            return
        }
        
        // Ya tenemos los datos,可以进行验证
        setIsChecking(false)
    }, [HRData, role])
    
    // Verificar acceso
    useEffect(() => {
        // No verificar mientras estamos cargando datos
        if (isChecking) return
        
        // Si no hay rol, no verificar (redirigir a login)
        if (!role) {
            navigate("/auth/HR/login")
            return
        }
        
        // HR-Admin siempre tiene acceso (bypass)
        if (isAdmin) {
            return // Permitir acceso
        }
        
        // Verificar roles permitidos
        if (allowedRoles.length > 0) {
            if (!allowedRoles.includes(role)) {
                // Rol no permitido, redirigir
                console.log(`[LOG] ProtectedHRRoute - Acceso denegado. Rol: ${role}, Roles permitidos: ${allowedRoles.join(", ")}`)
                navigate(redirectTo)
                return
            }
        }
        
        // Verificar permisos requeridos
        if (allowedPermissions.length > 0) {
            const hasAllPermissions = allowedPermissions.every(([module, action]) => can(module, action))
            
            if (!hasAllPermissions) {
                // No tiene todos los permisos requeridos, redirigir
                console.log(`[LOG] ProtectedHRRoute - Permisos insuficientes. Rol: ${role}`)
                navigate(redirectTo)
                return
            }
        }
        
        // Si llegó aquí, tiene acceso
        console.log(`[LOG] ProtectedHRRoute - Acceso concedido. Rol: ${role}`)
        
    }, [isChecking, role, isAdmin, allowedRoles, allowedPermissions, navigate, redirectTo, can])
    
    // Mostrar loading mientras verificamos datos
    if (isChecking) {
        return <Loading />
    }
    
    // Verificar acceso final antes de renderizar
    // Si llegó aquí con datos cargados, verificar una última vez
    if (!role) {
        return <Loading />
    }
    
    // HR-Admin siempre tiene acceso
    if (isAdmin) {
        return children
    }
    
    // Verificar roles
    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        return <Loading /> // Mostrar loading mientras redirige
    }
    
    // Verificar permisos
    if (allowedPermissions.length > 0) {
        const hasAllPermissions = allowedPermissions.every(([module, action]) => can(module, action))
        if (!hasAllPermissions) {
            return <Loading /> // Mostrar loading mientras redirige
        }
    }
    
    // Tiene acceso, renderizar children
    return children
}

// ── Exportación por defecto ──────────────────────────────────────────────
export default ProtectedHRRoute