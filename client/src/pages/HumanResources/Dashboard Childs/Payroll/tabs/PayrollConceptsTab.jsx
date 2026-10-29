import { useIsDark } from "../../../../../hooks/useIsDark.js"
import { Settings, Construction } from "lucide-react"

export const PayrollConceptsTab = () => {
    const isDark = useIsDark()

    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: isDark ? "rgba(0,61,165,0.1)" : "rgba(0,61,165,0.1)" }}>
                <Settings className="w-8 h-8" style={{ color: "#003DA5" }} />
            </div>
            <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Conceptos de Nómina</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">En desarrollo</p>
            </div>
            <Construction className="w-6 h-6 text-gray-400" />
        </div>
    )
}

export default PayrollConceptsTab