import { useEffect, useState, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useIsDark } from "../../../hooks/useIsDark.js"
import { Loading } from "../../../components/common/loading.jsx"
import { HandleGetEmployeeAbsences } from "../../../redux/Thunks/HRLeavesThunk.js"
import { Calendar, CheckCircle } from "lucide-react"
import {
    ThemedListWrapper,
    ThemedHeadingBar,
    ThemedListContainer,
} from "../../../components/common/Dashboard/ListDesigns.jsx"

const ACCENT = "cyan"

const CYAN = {
    lightBg: "#cffafe",
    lightBorder: "#67e8f9",
    darkBg: "rgba(6,182,212,.15)",
    darkBorder: "rgba(6,182,212,.35)",
    color: "#06b6d4",
}

export const EmployeeAbsencesPage = () => {
    const isDark = useIsDark()
    const dispatch = useDispatch()
    const HRLeavesState = useSelector((state) => state.HRLeavesReducer)
    
    const table_headings = ["Tipo", "Fechas", "Días", "Estado"]
    
    useEffect(() => {
        dispatch(HandleGetEmployeeAbsences())
    }, [])

    const absences = useMemo(() => {
        return HRLeavesState.absencesData || []
    }, [HRLeavesState.absencesData])

    const formatDateRange = (start, end) => {
        const startDate = new Date(start).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })
        const endDate = new Date(end).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })
        return `${startDate} - ${endDate}`
    }

    const calculateDays = (start, end) => {
        const startDate = new Date(start)
        const endDate = new Date(end)
        const diffTime = Math.abs(endDate - startDate)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
        return diffDays
    }

    if (HRLeavesState.isLoading) {
        return <Loading />
    }

    const absencesCount = absences?.length ?? 0
    
    return (
        <div className="w-full h-full flex flex-col gap-6 px-4 py-6 overflow-y-auto bg-white dark:bg-[#0f0f1a]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: isDark ? CYAN.color : "#0891b2" }}>
                        Mis Ausencias
                    </p>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl xl:text-3xl font-bold tracking-tight" style={{ color: isDark ? "#fff" : "#111827" }}>
                            Registro de Ausencias
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                            style={{ background: isDark ? "rgba(6,182,212,0.12)" : "rgba(6,182,212,0.10)", color: isDark ? "#22d3ee" : "#0891b2" }}>
                            {absencesCount} total
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border" style={{ background: isDark ? "rgba(6,182,212,0.05)" : "#ecfeff", borderColor: isDark ? CYAN.darkBorder : CYAN.lightBorder }}>
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: isDark ? CYAN.color : "#0891b2" }}>Total Ausencias</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: isDark ? "#fff" : "#111827" }}>{absencesCount}</p>
                </div>
                <div className="p-4 rounded-xl border" style={{ background: isDark ? "rgba(16,185,129,0.05)" : "#ecfdf5", borderColor: isDark ? "rgba(16,185,129,0.2)" : "#6ee7b7" }}>
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: isDark ? "#34d399" : "#059669" }}>Días Totales</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: isDark ? "#fff" : "#111827" }}>
                        {absences.reduce((acc, a) => acc + calculateDays(a.startdate, a.enddate), 0)}
                    </p>
                </div>
                <div className="p-4 rounded-xl border" style={{ background: isDark ? "rgba(99,102,241,0.05)" : "#eef2ff", borderColor: isDark ? "rgba(99,102,241,0.2)" : "#c7d2fe" }}>
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: isDark ? "#818cf8" : "#003DA5" }}>Este Mes</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: isDark ? "#fff" : "#111827" }}>
                        {absences.filter(a => {
                            const now = new Date()
                            const start = new Date(a.startdate)
                            return start.getMonth() === now.getMonth() && start.getFullYear() === now.getFullYear()
                        }).reduce((acc, a) => acc + calculateDays(a.startdate, a.enddate), 0)}
                    </p>
                </div>
            </div>

            {/* Divider */}
            <div className="h-px w-full" style={{ background: isDark ? "rgba(6,182,212,0.08)" : "#f3f4f6" }} />

            {/* Table */}
            <div className="flex flex-col gap-3 flex-1 overflow-auto">
                <ThemedListWrapper accent={ACCENT}>
                    <ThemedHeadingBar accent={ACCENT} table_layout={"grid-cols-4"} table_headings={table_headings} />
                </ThemedListWrapper>
                <ThemedListContainer accent={ACCENT}>
                    {absencesCount === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-300"
                                style={{ background: isDark ? "rgba(6,182,212,0.1)" : "#cffafe" }}>
                                <Calendar className="w-6 h-6 transition-colors duration-300" 
                                    style={{ color: isDark ? "#06b6d4" : "#67e8f9" }} />
                            </div>
                            <p className="text-sm font-medium transition-colors duration-300"
                                style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#9ca3af" }}>
                                No tienes ausencias registradas
                            </p>
                        </div>
                    ) : (
                        absences.map((absence, index) => (
                            <div
                                key={absence._id ?? index}
                                className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-3 py-3 items-center border-b last:border-b-0"
                                style={{ borderColor: isDark ? "rgba(6,182,212,0.08)" : "#f3f4f6" }}
                            >
                                {/* Tipo */}
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold truncate" style={{ color: isDark ? "#fff" : "#374151" }}>
                                        {absence.leavetype}
                                    </p>
                                </div>

                                {/* Fechas */}
                                <div className="min-w-0">
                                    <p className="text-sm truncate" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                        {formatDateRange(absence.startdate, absence.enddate)}
                                    </p>
                                </div>

                                {/* Días */}
                                <div className="min-w-0">
                                    <p className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                        {calculateDays(absence.startdate, absence.enddate)} día(s)
                                    </p>
                                </div>

                                {/* Estado */}
                                <div className="flex justify-center">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                                        style={{ 
                                            background: isDark ? "rgba(16,185,129,0.12)" : "rgba(16,185,129,0.10)", 
                                            color: isDark ? "#34d399" : "#059669",
                                            border: `1px solid ${isDark ? "rgba(16,185,129,0.30)" : "rgba(16,185,129,0.25)"}`
                                        }}>
                                        <CheckCircle className="w-3 h-3" />
                                        Aprobado
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </ThemedListContainer>
            </div>
        </div>
    )
}