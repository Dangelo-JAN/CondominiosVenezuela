import { HRDepartmentTabs } from "../../../components/common/Dashboard/departmentTabs"
import { CreateDepartmentDialogBox } from "../../../components/common/Dashboard/dialogboxes"
import { Building2 } from "lucide-react"
import { useIsDark } from "../../../hooks/useIsDark"
import { useHRAuth } from "../../../hooks/useHRAuth"

export const HRDepartmentPage = () => {
    const isDark = useIsDark();
    const { isViewer: isHRViewer } = useHRAuth();

    return (
        <div className="w-full h-full flex flex-col gap-6 px-4 py-6 overflow-y-auto bg-white dark:bg-[#0f0f1a]">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-purple-500 dark:text-purple-400">
                        Estructura organizacional
                    </p>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl xl:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Departamentos
                        </h1>
                    </div>
                </div>
                {!isHRViewer && <CreateDepartmentDialogBox />}
            </div>

            {/* Divider */}
            <div className="h-px w-full" style={{ backgroundColor: isDark ? 'rgba(139,92,246,0.12)' : '#f3f4f6' }} />

            {/* Tabs content */}
            <HRDepartmentTabs />
        </div>
    )
}
