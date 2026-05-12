/**
 * @name ProtectedHRRoute
 * @description Componente wrapper para proteger rutas HR según rol.
 *              Espera a que useHRAuth tenga datos completos (isReady: true)
 *              antes de verificar permisos y redirigir si es necesario.
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
import { Loading } from "../common/loading.jsx"

/**
 * Componente de protección de rutas HR
 * Verifica rol antes de renderizar children
 * Solo redirige cuando los datos están completamente cargados (isReady)
 */
export const ProtectedHRRoute = ({
    children,
    allowedRoles = [],
    redirectTo = "/HR/dashboard/dashboard-data"
}) => {
    const navigate = useNavigate()
    const { role, isAdmin, isReady } = useHRAuth()
    
    useEffect(() => {
        // Solo verificar cuando los datos están completamente cargados
        if (!isReady) return
        
        // Si no hay rol después de cargar, no hacer nada (el auth flow se encarga)
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
    
    // Mostrar loading mientras esperamos que los datos estén listos
    // Esto evita mostrar contenido antes de poder verificar permisos
    if (!isReady) {
        return <Loading />
    }
    
    // Verificar acceso final
    if (!role) {
        // No hay rol, algo salió mal — mostrar loading
        return <Loading />
    }
    
    // HR-Admin siempre tiene acceso
    if (isAdmin) {
        return children
    }
    
    // Verificar roles permitidos
    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        // Rol no permitido, redirigir — mostrar loading brevemente
        return <Loading />
    }
    
    // Tiene acceso, renderizar children
    return children
}

// ── Exportación por defecto ──────────────────────────────────────────────
export default ProtectedHRRoute