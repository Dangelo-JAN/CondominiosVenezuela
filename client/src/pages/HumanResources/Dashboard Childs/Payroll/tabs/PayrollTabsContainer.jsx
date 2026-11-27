import { useState, useMemo } from "react"
import { useIsDark } from "../../../../../hooks/useIsDark.js"
import { Calendar, FileText, Settings, ClipboardList, CreditCard, Briefcase, Plane, PiggyBank, Coins } from "lucide-react"

const TABS = [
    { id: "periods", label: "Períodos", icon: Calendar },
    { id: "receipts", label: "Recibos", icon: FileText },
    { id: "concepts", label: "Conceptos", icon: Settings },
    { id: "policy", label: "Políticas", icon: ClipboardList },
    { id: "novelties", label: "Novedades", icon: CreditCard },
    { id: "vacations", label: "Vacaciones", icon: Plane },
    { id: "social-benefits", label: "Prestaciones", icon: Briefcase },
    { id: "utilities", label: "Utilidades", icon: Coins },
]

export const PayrollTabsContainer = ({ children }) => {
    const isDark = useIsDark()
    const [activeTab, setActiveTab] = useState("periods")

    return (
        <div className="w-full h-full flex flex-col bg-white dark:bg-[#0f0f1a]">
            {/* Tab Bar */}
            <div className="flex flex-wrap gap-1 px-4 py-3 border-b transition-colors duration-300"
                style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                {TABS.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap
                            ${activeTab === id
                                ? "text-white shadow-sm"
                                : "hover:bg-gray-100 dark:hover:bg-[rgba(255,255,255,0.05)]"}
                        `}
                        style={{
                            background: activeTab === id ? "#003DA5" : "transparent",
                            color: activeTab === id ? "#fff" : isDark ? "rgba(255,255,255,0.7)" : "#374151"
                        }}
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 min-h-0 overflow-hidden">
                {children(activeTab)}
            </div>
        </div>
    )
}

export default PayrollTabsContainer