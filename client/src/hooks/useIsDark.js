import { useState, useEffect } from "react";

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
 *
 * FIX deploy: en el primer deploy (sin localStorage), se agrega matchMedia como
 * fallback para que useIsDark y useTheme initén el mismo valor desde el inicio,
 * evitando el race condition donde Tailwind dark: classes están activas pero
 * los estilos inline isDark están en light.
 */
export const useIsDark = () => {
    const [isDark, setIsDark] = useState(() => {
        if (typeof document === "undefined") return false
        const stored = localStorage.getItem("ems-theme")
        if (stored) return stored === "dark"
        if (document.documentElement.classList.contains("dark")) return true
        return window.matchMedia("(prefers-color-scheme: dark)").matches
    })

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
        localStorage.setItem("ems-theme", isDark ? "dark" : "light");
    }, [isDark]);

    const toggleTheme = () => setIsDark(prev => !prev);

    return { isDark, toggleTheme };
};
