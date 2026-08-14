import { useState, useEffect } from "react"

/**
 * Hook reactivo para detectar el tema oscuro.
 * Observa cambios en el classList del <html> en tiempo real,
 * por lo que re-renderiza el componente cuando el usuario cambia el tema.
 *
 * FIX #033 (causa raíz): el estado inicial debe respetar el tema persistido en
 * localStorage ("ems-theme"), NO solo el DOM. Sin esto, al refrescar la página
 * el hook inicializaba en false porque la clase "dark" se agrega al DOM
 * DESPUÉS del mount (useEffect de useTheme), y el MutationObserver se registra
 * después de esa mutación → el tema guardado se perdía en cada refresco.
 */
export const useIsDark = () => {
    const [isDark, setIsDark] = useState(() => {
        if (typeof document === "undefined") return false
        const stored = localStorage.getItem("ems-theme")
        if (stored) return stored === "dark"
        return document.documentElement.classList.contains("dark")
    })

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDark(document.documentElement.classList.contains("dark"))
        })

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"]
        })

        return () => observer.disconnect()
    }, [])

    return isDark
}
