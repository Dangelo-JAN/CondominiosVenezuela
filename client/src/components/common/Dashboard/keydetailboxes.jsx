import { useIsDark } from "../../../hooks/useIsDark.js"

export const KeyDetailsBox = ({ image, dataname, data }) => {
    const labelMap = {
        employees: "Empleados",
        departments: "Departamentos",
        leaves: "Ausencias",
        requestes: "Solicitudes"
    }

    const colorMap = {
        employees: {
            accent: "#003DA5",
            lightBg: "#e0e7ff", lightBorder: "#a5b4fc",
            darkBg: "rgba(99,102,241,0.18)", darkBorder: "rgba(99,102,241,0.4)",
            glow: "rgba(99,102,241,0.15)", iconBg: "#c7d2fe", darkIconBg: "rgba(99,102,241,0.25)"
        },
        departments: {
            accent: "#8b5cf6",
            lightBg: "#ede9fe", lightBorder: "#c4b5fd",
            darkBg: "rgba(139,92,246,0.18)", darkBorder: "rgba(139,92,246,0.4)",
            glow: "rgba(139,92,246,0.15)", iconBg: "#ddd6fe", darkIconBg: "rgba(139,92,246,0.25)"
        },
        leaves: {
            accent: "#0891b2",
            lightBg: "#cffafe", lightBorder: "#67e8f9",
            darkBg: "rgba(8,145,178,0.18)", darkBorder: "rgba(8,145,178,0.4)",
            glow: "rgba(8,145,178,0.15)", iconBg: "#a5f3fc", darkIconBg: "rgba(8,145,178,0.25)"
        },
        requestes: {
            accent: "#d97706",
            lightBg: "#fef3c7", lightBorder: "#fcd34d",
            darkBg: "rgba(217,119,6,0.18)", darkBorder: "rgba(217,119,6,0.4)",
            glow: "rgba(217,119,6,0.15)", iconBg: "#fde68a", darkIconBg: "rgba(217,119,6,0.25)"
        }
    }

    const colors = colorMap[dataname] || colorMap.employees
    const label = labelMap[dataname] || dataname

    const isDark = useIsDark()

    const cardBg = isDark
        ? `linear-gradient(135deg, ${colors.darkBg} 0%, rgba(255,255,255,0.02) 100%)`
        : `linear-gradient(135deg, ${colors.lightBg} 0%, #ffffff 60%)`

    const cardBorder = isDark ? colors.darkBorder : colors.lightBorder
    const iconBg = isDark ? colors.darkIconBg : colors.iconBg
    const iconBorder = isDark ? colors.darkBorder : colors.lightBorder

    return (
        <div
            className="group relative rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden"
            style={{
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                boxShadow: isDark
                    ? `0 4px 24px ${colors.glow}, inset 0 1px 0 rgba(255,255,255,0.05)`
                    : `0 2px 12px ${colors.glow}, 0 1px 3px rgba(0,0,0,0.06)`
            }}
        >
            <div
                className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                style={{ background: colors.accent }}
            />

            <div className="relative flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <p className="text-3xl xl:text-4xl font-bold tracking-tight"
                        style={{ color: colors.accent }}>
                        {data !== undefined && data !== "" ? data : "—"}
                    </p>
                    <p className="text-xs font-semibold uppercase tracking-widest"
                        style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)" }}>
                        {label}
                    </p>
                </div>

                <div
                    className="flex items-center justify-center w-12 h-12 rounded-xl transition-transform duration-300 group-hover:scale-110"
                    style={{ background: iconBg, border: `1px solid ${iconBorder}` }}
                >
                    <img
                        src={image}
                        alt={label}
                        className="w-6 h-6 object-contain"
                        style={{
                            filter: isDark
                                ? "brightness(0) saturate(100%) invert(1)"
                                : `brightness(0) saturate(100%) invert(25%) sepia(80%) saturate(600%) hue-rotate(220deg)`
                        }}
                    />
                </div>
            </div>

            <div
                className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500 rounded-full"
                style={{ background: `linear-gradient(90deg, ${colors.accent}, transparent)` }}
            />
        </div>
    )
}
