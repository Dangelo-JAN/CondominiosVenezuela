export const Footer = ({ appName = "CondoVE SGC", appSubtitle = "Sistema de Gestión Condominial" }) => {
    // Leer el tema directamente del DOM (sincronizado por el hook useTheme de EntryPage)
    const isDark = document.documentElement.classList.contains("dark")

    return (
        <footer className="border-t transition-colors duration-300"
            style={{ borderColor: isDark ? "rgba(99,102,241,0.08)" : "#f3f4f6" }}>
            <div className="px-5 sm:px-8 lg:px-20 py-8 sm:py-10">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

                    {/* Logo y descripción */}
                    <div className="flex flex-col items-center sm:items-start gap-2">
                        <div className="flex items-center gap-2">
                            <img
                                src="/icons/IsotipoMarca-CondoVe-logo-32x32.png"
                                alt="Logo"
                                className="w-8 h-8 rounded-lg object-contain"
                            />
                            <span className="text-base font-bold"
                                style={{ color: isDark ? "#ffffff" : "#111827" }}>
                                {/* SGC en azul (#003DA5) con mismo tamaño que el resto */}
                                {appName === "SGC" ? (
                                    <span style={{ color: "#003DA5" }}>SGC</span>
                                ) : appName.includes("CondoVE") && appName.includes("SGC") ? (
                                    <>
                                        CondoVE<span style={{ color: "#003DA5" }}>SGC</span>
                                    </>
                                ) : (
                                    appName
                                )}
                                <span style={{ color: "#7c3aed" }}>.</span>
                            </span>
                        </div>
                        <p className="text-xs text-center sm:text-left"
                            style={{ color: isDark ? "#4b5563" : "rgba(255,255,255,0.5)" }}>
                            {appSubtitle}
                        </p>
                    </div>

                    {/* Links */}
                    <div className="flex items-center gap-6 text-sm font-medium"
                        style={{ color: isDark ? "#4b5563" : "rgba(255,255,255,0.5)" }}>
                        <a href="#" className="hover:text-purple-500 transition-colors">Privacidad</a>
                        <a href="#" className="hover:text-purple-500 transition-colors">Términos</a>
                        <a href="#" className="hover:text-purple-500 transition-colors">Soporte</a>
                    </div>

                    {/* Copyright */}
                    <p className="text-xs hover:text-purple-500 transition-colors cursor-default"
                        style={{ color: isDark ? "#4b5563" : "rgba(255,255,255,0.5)" }}>
                        © {new Date().getFullYear()} {appName}. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </footer>
    )
}
