import { KeyDetailBoxContentWrapper } from "../../../components/common/Dashboard/contentwrappers.jsx"
import { SalaryChart } from "../../../components/common/Dashboard/salarychart.jsx"
import { DataTable } from "../../../components/common/Dashboard/datatable.jsx"
import { useEffect } from "react"
import { HandleGetDashboard } from "../../../redux/Thunks/DashboardThunk.js"
import { useDispatch, useSelector } from "react-redux"
import { Loading } from "../../../components/common/loading.jsx"
import { useIsDark } from "../../../hooks/useIsDark.js"

export const HRDashboardPage = () => {
    const isDark = useIsDark()
    const DashboardState = useSelector((state) => state.dashboardreducer)
    const dispatch = useDispatch()

    const DataArray = [
        { image: "/assets/HR-Dashboard/employee-2.png", dataname: "employees",   path: "/HR/dashboard/employees" },
        { image: "/assets/HR-Dashboard/department.png",  dataname: "departments", path: "/HR/dashboard/departments" },
        { image: "/assets/HR-Dashboard/leave.png",       dataname: "leaves",      path: "/HR/dashboard/leaves" },
        { image: "/assets/HR-Dashboard/request.png",     dataname: "requestes",   path: "/HR/dashboard/requestes" }
    ]

    useEffect(() => {
        dispatch(HandleGetDashboard({ apiroute: "GETDATA" }))
    }, [])

    if (DashboardState.isLoading) return <Loading />

    const now = new Date()
    const timeGreeting = now.getHours() < 12
        ? "Buenos días" : now.getHours() < 18
        ? "Buenas tardes" : "Buenas noches"

    return (
        <div className="flex flex-col h-full w-full px-4 py-6 gap-6 overflow-y-auto
            bg-white dark:bg-[#0f0f1a]">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-1
                        text-blue-500 dark:text-blue-400">
                        Panel de Control
                    </p>
                    <h1 className="text-2xl xl:text-3xl font-bold tracking-tight
                        text-gray-900 dark:text-white">
                        {timeGreeting} 👋
                    </h1>
                    <p className="text-sm mt-1 text-gray-400 dark:text-gray-500">
                        {now.toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl self-start sm:self-auto transition-colors duration-300"
                    style={{ background: isDark ? "rgba(99,102,241,0.2)" : "#e0e7ff", border: isDark ? "1px solid rgba(99,102,241,0.4)" : "1px solid #a5b4fc" }}>
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-blue-400" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                    </span>
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-300">En vivo</span>
                </div>
            </div>

            <KeyDetailBoxContentWrapper imagedataarray={DataArray} data={DashboardState.data} />

            <div className="flex items-center gap-3">
                <div className="h-px flex-1 transition-colors duration-300" style={{ background: isDark ? "rgba(99,102,241,0.15)" : "#f3f4f6" }} />
                <span className="text-xs font-semibold uppercase tracking-widest transition-colors duration-300" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#9ca3af" }}>
                    Analíticas
                </span>
                <div className="h-px flex-1 transition-colors duration-300" style={{ background: isDark ? "rgba(99,102,241,0.15)" : "#f3f4f6" }} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
                <div className="rounded-2xl overflow-hidden transition-all duration-300"
                    style={{ 
                        background: isDark ? "linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(255,255,255,0.02) 100%)" : "linear-gradient(135deg, #e0e7ff 0%, #ffffff 60%)",
                        border: isDark ? "1px solid rgba(99,102,241,0.40)" : "1px solid #a5b4fc",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.06)" 
                    }}>
                    <SalaryChart balancedata={DashboardState.data} />
                </div>
                <div className="rounded-2xl overflow-hidden transition-all duration-300"
                    style={{ 
                        background: isDark ? "linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(255,255,255,0.02) 100%)" : "linear-gradient(135deg, #e0e7ff 0%, #ffffff 60%)",
                        border: isDark ? "1px solid rgba(99,102,241,0.40)" : "1px solid #a5b4fc",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.06)" 
                    }}>
                    <DataTable noticedata={DashboardState.data} />
                </div>
            </div>
        </div>
    )
}
