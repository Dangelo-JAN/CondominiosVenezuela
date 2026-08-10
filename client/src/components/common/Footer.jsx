export const Footer = ({ appName = "CondoVE SGC", appSubtitle = "Sistema de Gestión Condominial", isDark = false }) => {
    return (
        <footer className="border-t transition-colors duration-300"
            style={{ borderColor: isDark ? "rgba(0,61,165,0.25)" : "#dde5ff" }}>
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
                                <span style={{ color: "#FCE300" }}>.</span>
                            </span>
                        </div>
                        <p className="text-xs text-center sm:text-left"
                            style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                            {appSubtitle}
                        </p>
                    </div>

                    {/* Links */}
                    <div className="flex items-center gap-6 text-sm font-medium"
                        style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#4b5563" }}>
                        <a href="#" className="hover:text-blue-600 transition-colors">Privacidad</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">Términos</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">Soporte</a>
                    </div>

                    {/* Copyright */}
                    <p className="text-xs hover:text-blue-600 transition-colors cursor-default"
                        style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#4b5563" }}>
                        © {new Date().getFullYear()} {appName}. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </footer>
    )
}
