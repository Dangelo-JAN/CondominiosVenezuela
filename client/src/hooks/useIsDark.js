import { useState, useEffect } from "react";

/**
 * Hook reactivo para detectar el tema oscuro.
 *
 * FUENTE DE VERDAD ÚNICA: la clase "dark" en el <html>.
 *
 * - Lee el tema inicial respetando esta prioridad: localStorage ("ems-theme")
 *   → clase "dark" del <html> → preferencia del sistema (matchMedia).
 * - Observa en tiempo real los cambios de la clase "dark" del <html> mediante
 *   MutationObserver, por lo que re-renderiza el componente cuando cualquier
 *   otra fuente (p.ej. useTheme) cambia el tema en el DOM.
 * - Al cambiar, escribe la clase "dark" y persiste en localStorage para que el
 *   resto de la aplicación quede sincronizado.
 *
 * Esto evita el bug de desincronización donde Tailwind dark: classes cambian
 * pero los estilos inline isDark se quedan stale (causa raíz del bug #034).
 */
export const useIsDark = () => {
    const [isDark, setIsDark] = useState(() => {
        if (typeof document === "undefined") return false
        const stored = localStorage.getItem("ems-theme")
        if (stored) return stored === "dark"
        if (document.documentElement.classList.contains("dark")) return true
        return window.matchMedia("(prefers-color-scheme: dark)").matches
    })

    // Observar el classList del <html> en tiempo real para mantenerse
    // sincronizado con cualquier cambio externo (incluido useTheme).
    useEffect(() => {
        if (typeof document === "undefined") return

        const root = document.documentElement

        // Estado de sincronización para evitar reintradas cuando nosotros
        // mismos escribimos la clase (el observer setearía el mismo valor).
        let isApplying = false

        const observer = new MutationObserver(() => {
            if (isApplying) return
            const hasDarkClass = root.classList.contains("dark")
            setIsDark(hasDarkClass)
        })

        observer.observe(root, { attributes: true, attributeFilter: ["class"] })

        return () => {
            isApplying = true
            observer.disconnect()
        }
    }, [])

    // Aplicar el tema al DOM y persistirlo. Se guarda en una variable para que
    // el observer no se dispare a sí mismo en bucle infinito.
    useEffect(() => {
        if (typeof document === "undefined") return
        const root = document.documentElement
        const isDarkClassPresent = root.classList.contains("dark")

        // Solo tocar el DOM si realmente cambió para evitar reintradas.
        if (isDark && !isDarkClassPresent) {
            root.classList.add("dark")
        } else if (!isDark && isDarkClassPresent) {
            root.classList.remove("dark")
        }
        localStorage.setItem("ems-theme", isDark ? "dark" : "light")
    }, [isDark])

    const toggleTheme = () => setIsDark(prev => !prev)

    return { isDark, toggleTheme }
}
