import { createContext, useContext, useState, useEffect } from "react"

const PWAContext = createContext(null)

export const PWAProvider = ({ children }) => {
    const [installPrompt, setInstallPrompt] = useState(null)
    const [isInstalled, setIsInstalled] = useState(false)

    useEffect(() => {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true)
        }
        const handler = (e) => { e.preventDefault(); setInstallPrompt(e) }
        window.addEventListener('beforeinstallprompt', handler)
        return () => window.removeEventListener('beforeinstallprompt', handler)
    }, [])

    const handleInstall = async () => {
        if (!installPrompt) return
        installPrompt.prompt()
        const { outcome } = await installPrompt.userChoice
        if (outcome === 'accepted') { setInstallPrompt(null); setIsInstalled(true) }
    }

    return (
        <PWAContext.Provider value={{ installPrompt, isInstalled, handleInstall }}>
            {children}
        </PWAContext.Provider>
    )
}

export const usePWAPrompt = () => {
    const context = useContext(PWAContext)
    if (!context) throw new Error("usePWAPrompt debe usarse dentro de un PWAProvider")
    return context
}
