import { useState, useEffect } from "react"

export const useTheme = () => {
    const [isDark, setIsDark] = useState(() => {
        // Check localStorage first, then system preference
        const stored = localStorage.getItem("ems-theme")
        if (stored) return stored === "dark"
        return window.matchMedia("(prefers-color-scheme: dark)").matches
    })

    useEffect(() => {
        const root = document.documentElement
        if (isDark) {
            root.classList.add("dark")
        } else {
            root.classList.remove("dark")
        }
        localStorage.setItem("ems-theme", isDark ? "dark" : "light")
    }, [isDark])

    const toggleTheme = () => setIsDark(prev => !prev)

    return { isDark, toggleTheme }
}
