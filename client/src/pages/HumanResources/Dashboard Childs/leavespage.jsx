import { ThemedListWrapper, ThemedHeadingBar, ThemedListContainer } from "../../../components/common/Dashboard/ListDesigns"
import { useEffect, useState, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { HandleGetHRLeaves, HandleUpdateHRLeaveStatus } from "../../../redux/Thunks/HRLeavesThunk.js"
import { HandleGetHREmployees } from "../../../redux/Thunks/HREmployeesThunk.js"
import { Loading } from "../../../components/common/loading.jsx"
import { useIsDark } from "../../../hooks/useIsDark.js"
import { LeaveActionsDialogBox } from "../../../components/common/Dashboard/dialogboxes.jsx"
import { Calendar, Filter, ChevronDown, CheckCircle, XCircle, Clock } from "lucide-react"

export const HRLeavesPage = () => {
    const isDark = useIsDark()
    const dispatch = useDispatch()
    const HRLeavesState = useSelector((state) => state.HRLeavesReducer)
    const HREmployeesState = useSelector((state) => state.HREmployeesPageReducer)
    
    const [employeeFilter, setEmployeeFilter] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [dateRange, setDateRange] = useState({ start: "", end: "" })
    
    const table_headings = ["Empleado", "Fechas", "Razón", "Estado"]
    
    useEffect(() => {
        dispatch(HandleGetHRLeaves())
        dispatch(HandleGetHREmployees({ apiroute: "GETALL" }))
    }, [])

    const filteredLeaves = useMemo(() => {
        if (!HRLeavesState.data) return []
        
        return HRLeavesState.data.filter(leave => {
            // Filter by employee
            if (employeeFilter && leave.employee?._id !== employeeFilter) return false
            
            // Filter by status
            if (statusFilter !== "all" && leave.status !== statusFilter) return false
            
            // Filter by date range
            if (dateRange.start || dateRange.end) {
                const leaveStart = new Date(leave.startdate)
                if (dateRange.start && leaveStart < new Date(dateRange.start)) return false
                if (dateRange.end && leaveStart > new Date(dateRange.end)) return false
            }
            
            return true
        })
    }, [HRLeavesState.data, employeeFilter, statusFilter, dateRange])

    const getStatusBadge = (status) => {
        const statusConfig = {
            Pending: {
                bg: isDark ? "rgba(245,158,11,0.12)" : "rgba(245,158,11,0.10)",
                border: isDark ? "rgba(245,158,11,0.30)" : "rgba(245,158,11,0.25)",
                color: isDark ? "#fbbf24" : "#d97706",
                icon: Clock
            },
            Approved: {
                bg: isDark ? "rgba(16,185,129,0.12)" : "rgba(16,185,129,0.10)",
                border: isDark ? "rgba(16,185,129,0.30)" : "rgba(16,185,129,0.25)",
                color: isDark ? "#34d399" : "#059669",
                icon: CheckCircle
            },
            Rejected: {
                bg: isDark ? "rgba(239,68,68,0.12)" : "rgba(239,68,68,0.10)",
                border: isDark ? "rgba(239,68,68,0.30)" : "rgba(239,68,68,0.25)",
                color: isDark ? "#f87171" : "#dc2626",
                icon: XCircle
            }
        }
        
        const config = statusConfig[status] || statusConfig.Pending
        const Icon = config.icon
        
        return (
            <span 
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ background: config.bg, color: config.color, border: `1px solid ${config.border}` }}
            >
                <Icon className="w-3 h-3" />
                {status === "Pending" ? "Pendiente" : status === "Approved" ? "Aprobado" : "Rechazado"}
            </span>
        )
    }

    const formatDateRange = (start, end) => {
        const startDate = new Date(start).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })
        const endDate = new Date(end).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })
        return `${startDate} - ${endDate}`
    }

    if (HRLeavesState.isLoading) {
        return <Loading />
    }

    const leavesCount = filteredLeaves?.length ?? 0
    
    return (
        <div className="w-full h-full flex flex-col gap-6 px-4 py-6 overflow-y-auto bg-white dark:bg-[#0f0f1a]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" 
                        style={{ color: isDark ? "#22d3ee" : "#0891b2" }}>
                        Control de Permisos
                    </p>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl xl:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Ausencias
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors duration-300"
                            style={{
                                background: isDark ? "rgba(6,182,212,0.12)" : "rgba(6,182,212,0.10)",
                                color: isDark ? "#22d3ee" : "#0891b2",
                                border: isDark ? "1px solid rgba(6,182,212,0.30)" : "1px solid rgba(6,182,212,0.25)"
                            }}>
                            {leavesCount} total
                        </span>
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="h-px w-full transition-colors duration-300" 
                style={{ background: isDark ? "rgba(6,182,212,0.08)" : "#f3f4f6" }} />

            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Employee Filter */}
                <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                    <label className="text-xs font-semibold uppercase tracking-wider" 
                        style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                        <Filter className="w-3 h-3 inline mr-1" />
                        Empleado
                    </label>
                    <div className="relative">
                        <select 
                            value={employeeFilter}
                            onChange={(e) => setEmployeeFilter(e.target.value)}
                            className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200 appearance-none
                                bg-gray-50 border border-gray-200 text-gray-900
                                focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100
                                dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                dark:focus:border-[rgba(6,182,212,0.5)] dark:focus:bg-[rgba(6,182,212,0.06)]`}
                        >
                            <option value="">Todos los empleados</option>
                            {HREmployeesState.data?.map(emp => (
                                <option key={emp._id} value={emp._id}>
                                    {emp.firstname} {emp.lastname}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" 
                            style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }} />
                    </div>
                </div>

                {/* Status Filter */}
                <div className="flex flex-col gap-1.5 w-full lg:w-48">
                    <label className="text-xs font-semibold uppercase tracking-wider" 
                        style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                        Estado
                    </label>
                    <div className="relative">
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200 appearance-none
                                bg-gray-50 border border-gray-200 text-gray-900
                                focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100
                                dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                dark:focus:border-[rgba(6,182,212,0.5)] dark:focus:bg-[rgba(6,182,212,0.06)]`}
                        >
                            <option value="all">Todos</option>
                            <option value="Pending">Pendiente</option>
                            <option value="Approved">Aprobado</option>
                            <option value="Rejected">Rechazado</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" 
                            style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }} />
                    </div>
                </div>

                {/* Date Range */}
                <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                    <label className="text-xs font-semibold uppercase tracking-wider" 
                        style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                        <Calendar className="w-3 h-3 inline mr-1" />
                        Desde - Hasta
                    </label>
                    <div className="flex gap-2">
                        <input 
                            type="date" 
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className={`w-full rounded-xl px-3 py-2 text-sm outline-none transition-all duration-200
                                bg-gray-50 border border-gray-200 text-gray-900
                                focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100
                                dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                dark:focus:border-[rgba(6,182,212,0.5)]`}
                        />
                        <input 
                            type="date" 
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            className={`w-full rounded-xl px-3 py-2 text-sm outline-none transition-all duration-200
                                bg-gray-50 border border-gray-200 text-gray-900
                                focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100
                                dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                dark:focus:border-[rgba(6,182,212,0.5)]`}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="flex flex-col gap-3 flex-1 overflow-auto">
                <ThemedListWrapper accent="cyan">
                    <ThemedHeadingBar accent="cyan" table_layout={"grid-cols-4"} table_headings={table_headings} />
                </ThemedListWrapper>
                <ThemedListContainer accent="cyan">
                    {leavesCount === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-300"
                                style={{ background: isDark ? "rgba(6,182,212,0.1)" : "#cffafe" }}>
                                <Calendar className="w-6 h-6 transition-colors duration-300" 
                                    style={{ color: isDark ? "#06b6d4" : "#67e8f9" }} />
                            </div>
                            <p className="text-sm font-medium transition-colors duration-300"
                                style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#9ca3af" }}>
                                No hay solicitudes de ausencia
                            </p>
                        </div>
                    ) : (
                        filteredLeaves.map((leave, index) => (
                            <div
                                key={leave._id ?? index}
                                className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-3 py-3 items-center
                                    border-b last:border-b-0
                                    border-gray-100 hover:bg-cyan-50/50 transition-colors duration-150
                                    dark:border-[rgba(6,182,212,0.08)] dark:hover:bg-[rgba(6,182,212,0.04)]"
                            >
                                {/* Employee */}
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                                        style={{ 
                                            background: isDark ? "rgba(6,182,212,0.15)" : "#cffafe",
                                            color: isDark ? "#22d3ee" : "#0891b2"
                                        }}>
                                        {leave.employee?.firstname?.slice(0,1).toUpperCase()}{leave.employee?.lastname?.slice(0,1).toUpperCase()}
                                    </div>
                                    <p className="text-sm font-semibold truncate text-gray-800 dark:text-white">
                                        {leave.employee ? `${leave.employee.firstname} ${leave.employee.lastname}` : "Empleado no encontrado"}
                                    </p>
                                </div>

                                {/* Dates */}
                                <div className="min-[250px]:hidden sm:flex sm:justify-center sm:items-center">
                                    <p className="text-sm text-gray-500 dark:text-[rgba(255,255,255,0.4)]">
                                        {formatDateRange(leave.startdate, leave.enddate)}
                                    </p>
                                </div>

                                {/* Reason */}
                                <div className="hidden sm:block min-w-0">
                                    <p className="text-sm truncate text-gray-500 dark:text-[rgba(255,255,255,0.4)]" title={leave.reason}>
                                        {leave.reason}
                                    </p>
                                </div>

                                {/* Status */}
                                <div className="flex justify-center">
                                    {getStatusBadge(leave.status)}
                                </div>
                            </div>
                        ))
                    )}
                </ThemedListContainer>
            </div>
        </div>
    )
}