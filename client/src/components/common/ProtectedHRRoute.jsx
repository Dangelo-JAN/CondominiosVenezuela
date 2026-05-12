/**
 * @name ProtectedHRRoute
 * @description Componente wrapper para proteger rutas HR según rol.
 *              Solo verifica permisos cuando el usuario está logueado (role disponible).
 * 
 * @param {ReactNode} children - Componente children a renderizar si tiene acceso
 * @param {string[]} allowedRoles - Roles que tienen acceso a la ruta (ej: ["HR-Admin", "HR-Manager"])
 * @param {string} redirectTo - Ruta de redirección si no tiene acceso (default: dashboard)
 * 
 * @example
 * // Proteger ruta solo para Admin y Manager
 * <ProtectedHRRoute allowedRoles={["HR-Admin", "HR-Manager"]}>
 *   <HRProfilesPage />
 * </ProtectedHRRoute>
 */

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useHRAuth } from "../../hooks/useHRAuth.js"

/**
 * Componente de protección de rutas HR
 * Verifica rol antes de renderizar children
 * Solo redirige cuando el usuario está logueado (role disponible)
 */
export const ProtectedHRRoute = ({
    children,
    allowedRoles = [],
    redirectTo = "/HR/dashboard/dashboard-data"
}) => {
    const navigate = useNavigate()
    const { role, isAdmin, isReady } = useHRAuth()
    
    useEffect(() => {
        // Solo verificar cuando estamos "listos" (usuario logueado)
        if (!isReady) return
        
        // Si no hay rol después de estar listo, algo salió mal — no redirigir aquí
        // El sistema de auth se encarga de esto
        if (!role) return
        
        // HR-Admin siempre tiene acceso (bypass)
        if (isAdmin) return
        
        // Verificar roles permitidos
        if (allowedRoles.length > 0) {
            if (!allowedRoles.includes(role)) {
                // Rol no permitido, redirigir
                console.log(`[LOG] ProtectedHRRoute - Acceso denegado. Rol: ${role}, Roles permitidos: ${allowedRoles.join(", ")}`)
                navigate(redirectTo, { replace: true })
                return
            }
        }
        
        console.log(`[LOG] ProtectedHRRoute - Acceso concedido. Rol: ${role}`)
        
    }, [isReady, role, isAdmin, allowedRoles, navigate, redirectTo])
    
    // Si no estamos listos, no mostrar nada (el auth flow maneja la redirección)
    if (!isReady) {
        return null
    }
    
    // Si no hay rol, no renderizar (evitar acceso no autorizado)
    if (!role) {
        return null
    }
    
    // HR-Admin siempre tiene acceso
    if (isAdmin) {
        return children
    }
    
    // Verificar roles permitidos
    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        // Rol no permitido — null mientras redirige
        return null
    }
    
    // Tiene acceso, renderizar children
    return children
}

// ── Exportación por defecto ──────────────────────────────────────────────
export default ProtectedHRRoute