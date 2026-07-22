import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { HandleGetHREmployees } from "../../../redux/Thunks/HREmployeesThunk.js"
import { Loading } from "../../../components/common/loading.jsx"
import { useIsDark } from "../../../hooks/useIsDark.js"
import { useHRAuth } from "../../../hooks/useHRAuth.js"
import { AddEmployeesDialogBox } from "../../../components/common/Dashboard/dialogboxes.jsx"
import { Users } from "lucide-react"
import { ThemedListWrapper, ThemedHeadingBar, ThemedListContainer, ListItems } from "../../../components/common/Dashboard/ListDesigns"

export const HREmployeesPage = () => {
    const isDark = useIsDark()
    const dispatch = useDispatch()
    const { isViewer: isHRViewer } = useHRAuth()
    const HREmployeesState = useSelector((state) => state.HREmployeesPageReducer)
    const table_headings = ["Full Name", "Email", "Department", "Contact Number", "Modify Employee"]
    const hiddenCols = ["Email", "Department", "Contact Number"]

    useEffect(() => {
        if (HREmployeesState.fetchData) {
            dispatch(HandleGetHREmployees({ apiroute: "GETALL" }))
        }
    }, [HREmployeesState.fetchData])

    useEffect(() => {
        dispatch(HandleGetHREmployees({ apiroute: "GETALL" }))
    }, [])

    if (HREmployeesState.isLoading) {
        return <Loading />
    }

    const employeeCount = HREmployeesState.data?.length ?? 0

    return (
        <div className="w-full h-full flex flex-col gap-6 px-4 py-6 bg-white dark:bg-[#0f0f1a]">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-500 dark:text-blue-400">
                        Gestión de personal
                    </p>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl xl:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Empleados
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors duration-300"
                            style={{
                                background: isDark ? "rgba(0,61,165,0.12)" : "rgba(0,61,165,0.10)",
                                color: isDark ? "#a5b4fc" : "#4f46e5",
                                border: isDark ? "1px solid rgba(99,102,241,0.30)" : "1px solid rgba(99,102,241,0.25)"
                            }}>
                            {employeeCount} total
                        </span>
                    </div>
                </div>
                {!isHRViewer && <AddEmployeesDialogBox />}
            </div>

            {/* Divider */}
            <div className="h-px w-full transition-colors duration-300" style={{ background: isDark ? "rgba(99,102,241,0.08)" : "#f3f4f6" }} />

            {/* Table */}
            <div className="flex flex-col gap-3 flex-1 min-h-0">
                <ThemedListWrapper accent="blue">
                    <ThemedHeadingBar 
                        accent="blue"
                        table_layout={"grid-cols-5"} 
                        table_headings={table_headings}
                        hiddenCols={hiddenCols}
                    />
                </ThemedListWrapper>
                <ThemedListContainer accent="blue">
                    {employeeCount === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-300"
                                style={{ background: isDark ? "rgba(99,102,241,0.1)" : "#e0e7ff" }}>
                                <Users className="w-6 h-6 transition-colors duration-300" style={{ color: isDark ? "#003DA5" : "#a5b4fc" }} />
                            </div>
                            <p className="text-sm font-medium transition-colors duration-300"
                                style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#9ca3af" }}>
                                No hay empleados registrados aún
                            </p>
                        </div>
                    ) : (
                        <ListItems TargetedState={HREmployeesState} hideDelete={isHRViewer} />
                    )}
                </ThemedListContainer>
            </div>
        </div>
    )
}
