import { Link, useLocation } from "react-router-dom";
import { Sun, Moon, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { useIsDark } from "../../hooks/useIsDark.js";
import { ContactSalesDialog } from "./ContactSalesDialog.jsx";

export const CommonPublicNavbar = ({ 
    showDemoButton = true, 
    showLinks = true, 
    showInstallButton = true, 
    installPrompt: propInstallPrompt = null,
    isInstalled: propIsInstalled = false,
    onInstall: propOnInstall = null
}) => {
    const location = useLocation();
    const { isDark: initialIsDark, toggleTheme: originalToggleTheme } = useIsDark();
    const [isDark, setIsDark] = useState(initialIsDark);

    // Escuchar cambios en localStorage para mantener sincronizado el estado
    useEffect(() => {
        const handleStorageChange = () => {
            const stored = localStorage.getItem("ems-theme");
            const newIsDark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
            setIsDark(newIsDark);
        };

        // Escuchar cambios en localStorage
        window.addEventListener('storage', handleStorageChange);
        
        // Cleanup
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // Actualizar el estado local cuando cambia el valor inicial
    useEffect(() => {
        setIsDark(initialIsDark);
    }, [initialIsDark]);

    const toggleTheme = () => {
        originalToggleTheme();
    };
    
    // Manejar el estado del PWA si no se proporciona externamente
    const [internalInstallPrompt, setInternalInstallPrompt] = useState(null);
    const [internalIsInstalled, setInternalIsInstalled] = useState(false);

    const installPrompt = propInstallPrompt !== null ? propInstallPrompt : internalInstallPrompt;
    const isInstalled = propIsInstalled !== false ? propIsInstalled : internalIsInstalled;

    const handleInstall = propOnInstall || (() => {
        if (!installPrompt) return;
        installPrompt.prompt();
        installPrompt.userChoice.then(({ outcome }) => {
            if (outcome === 'accepted') {
                setInternalInstallPrompt(null);
                setInternalIsInstalled(true);
            }
        });
    });

    useEffect(() => {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setInternalIsInstalled(true);
        }
        
        if (!propInstallPrompt) { // Solo registrar el evento si no se proporciona externamente
            const handler = (e) => {
                e.preventDefault();
                setInternalInstallPrompt(e);
            };
            
            window.addEventListener('beforeinstallprompt', handler);
            return () => window.removeEventListener('beforeinstallprompt', handler);
        }
    }, [propInstallPrompt]);

    return (
        <nav className="flex items-center justify-between px-5 sm:px-8 py-4 sm:py-6 border-b transition-colors duration-300"
            style={{ borderColor: isDark ? "rgba(0,61,165,0.25)" : "#dde5ff" }}>

            {/* Logo - texto debajo en móvil */}
            <Link to="/" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                <img
                    src="/icons/IsotipoMarca-CondoVe-64x64-solo.png"
                    alt="Logo CondoVe SGC"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-contain"
                />
                <span className="text-lg sm:text-2xl font-bold tracking-tight text-center sm:text-left"
                    style={{ color: isDark ? "#ffffff" : "#111827" }}>
                    CondoVE<span style={{ color: "#003DA5", fontSize: "0.65em", marginLeft: "0.15em" }}>SGC</span><span style={{ color: "#FCE300" }}>.</span>
                </span>
            </Link>

            {/* Links — ocultos en móvil */}
            {showLinks && (
                <div className="hidden md:flex gap-8 text-sm font-medium"
                    style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#4b5563" }}>
                    <a href="#" className="hover:text-blue-600 transition-colors">Plataforma</a>
                    <a href="#" className="hover:text-blue-600 transition-colors">Soluciones</a>
                    <a href="#" className="hover:text-blue-600 transition-colors">Precios</a>
                    <Link 
                      to="/contact" 
                      className={`transition-colors ${
                          location.pathname === '/contact' 
                              ? 'text-blue-600 font-semibold' 
                              : 'hover:text-blue-600'
                      }`}
                    >
                      Contacto
                    </Link>
                </div>
            )}

            {/* Acciones derecha */}
            <div className="flex items-center gap-2 sm:gap-3">
                
                {/* Contact Sales Modal */}
                <ContactSalesDialog />

                {/* Demo */}
                {showDemoButton && (
                    <Link to="/auth/HR/signup" className="hidden sm:block">
                        <button className="px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 hover:opacity-90"
                            style={{
                                borderColor: "#003DA5", color: "#003DA5",
                                background: isDark ? "rgba(0,61,165,0.20)" : "transparent"
                            }}>
                            Probar Demo
                        </button>
                    </Link>
                )}

                {/* Toggle tema */}
                <button
                    onClick={toggleTheme}
                    className="flex items-center gap-2 px-2.5 sm:px-3 py-2 rounded-xl transition-all duration-200 border"
                    style={{
                        borderColor: isDark ? "rgba(0,61,165,0.40)" : "#e5e7eb",
                        background: isDark ? "rgba(0,61,165,0.18)" : "#f9fafb"
                    }}
                >
                    <div className="flex items-center justify-center w-5 h-5 rounded-lg"
                        style={{ background: isDark ? "rgba(0,61,165,0.30)" : "#fef9c3" }}>
                        {isDark
                            ? <Sun className="w-3.5 h-3.5 text-yellow-400" />
                            : <Moon className="w-3.5 h-3.5 text-blue-600" />
                        }
                    </div>
                    <span className="hidden sm:block text-xs font-medium"
                        style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                        {isDark ? "Claro" : "Oscuro"}
                    </span>
                    {/* Pill */}
                    <div className="flex-shrink-0 w-7 h-3.5 rounded-full relative transition-colors duration-300"
                        style={{ background: isDark ? "#003DA5" : "#d9e2f2" }}>
                        <div className="absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white shadow-sm transition-all duration-300"
                            style={{ left: isDark ? "15px" : "2px" }} />
                    </div>
                </button>

                {/* Instalar PWA */}
                {showInstallButton && installPrompt && !isInstalled && (
                    <button onClick={handleInstall}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                        style={{ background: "linear-gradient(135deg, #003DA5, #00247D)" }}>
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:block">Instalar</span>
                    </button>
                )}
            </div>
        </nav>
    );
};