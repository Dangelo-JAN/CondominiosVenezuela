import { ThemedListWrapper, ThemedHeadingBar, ThemedListContainer } from "../../../components/common/Dashboard/ListDesigns"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { HandleGetMyReportHistory } from "../../../redux/Thunks/ReportThunk.js"
import { Loading } from "../../../components/common/loading.jsx"
import { useIsDark } from "../../../hooks/useIsDark.js"
import { Lock, Eye, X, ChevronRight, FileText, ShieldCheck } from "lucide-react"
import {
    ReportTotalsBar, EmployeeActivityGroup,
    ReportEmptyState, YELLOW
} from "../../../components/common/Dashboard/ReportComponents.jsx"

const formatDateLong = (dateStr) => {
    if (!dateStr) return "--"
    return new Date(dateStr).toLocaleDateString("es-ES", {
        weekday: "short", day: "2-digit", month: "short", year: "numeric"
    })
}

// ── Mis Reportes: histórico de MIS semanas cerradas (solo actividades propias).
// El server extrae únicamente la entrada del empleado autenticado del snapshot —
// los datos de otros empleados nunca salen de la API (aislamiento por token).
export const EmployeeReportsPage = () => {
    const dispatch = useDispatch()
    const isDark = useIsDark()
    const y = YELLOW(isDark)

    const { myHistory, isLoading } = useSelector(s => s.reportreducer)
    const [selectedWeek, setSelectedWeek] = useState(null)

    useEffect(() => {
        dispatch(HandleGetMyReportHistory())
    }, [dispatch])

    if (isLoading && myHistory.length === 0) return <Loading />

    return (
        <div className="w-full h-full flex flex-col gap-6 px-4 py-6 overflow-y-auto bg-white dark:bg-[#0f0f1a]">

            {/* ── Header ── */}
            <div className="flex flex-col gap-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: y.text }}>
                    Mi Historial
                </p>
                <h1 className="text-2xl xl:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Mis Reportes
                </h1>
                <div className="flex items-center gap-1.5 mt-1">
                    <ShieldCheck className="w-3.5 h-3.5" style={{ color: isDark ? "#34d399" : "#059669" }} />
                    <p className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#6b7280" }}>
                        Solo tú puedes ver estas semanas cerradas. Los reportes de otros empleados son privados.
                    </p>
                </div>
            </div>

            <div className="h-px w-full" style={{ background: y.divider }} />

            {/* ══ LISTA DE SEMANAS CERRADAS ══ */}
            <ThemedListWrapper accent="yellow">
                <ThemedHeadingBar accent="yellow" table_layout={"grid-cols-5"}
                    table_headings={["Semana", "Período", "Mis Totales", "Estado", "Acciones"]} />
            </ThemedListWrapper>
            <ThemedListContainer accent="yellow">
                {(myHistory?.length ?? 0) === 0 ? (
                    <ReportEmptyState
                        title="Aún no hay semanas cerradas"
                        message="Tu primer reporte semanal se generará el próximo lunes a las 3:00 AM, cerrando la semana anterior."
                    />
                ) : (
                    myHistory.map(week => (
                        <div key={`${week.isoYear}-${week.weekNumber}`}
                            className="grid grid-cols-2 sm:grid-cols-5 gap-2 px-3 py-3 items-center border-b last:border-b-0
                                border-gray-100 hover:bg-yellow-50/50 transition-all duration-150
                                dark:border-[rgba(252,227,0,0.08)] dark:hover:bg-[rgba(252,227,0,0.04)]">
                            {/* Semana */}
                            <div className="flex items-center gap-2 min-w-0">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ background: y.bg, color: y.text }}>
                                    <Lock className="w-3.5 h-3.5" />
                                </div>
                                <p className="text-sm font-semibold text-gray-800 dark:text-white">
                                    W{week.weekNumber} · {week.isoYear}
                                </p>
                            </div>
                            {/* Período */}
                            <p className="text-xs truncate" style={{ color: isDark ? "rgba(255,255,255,0.45)" : "#6b7280" }}>
                                {formatDateLong(week.weekStart)} — {formatDateLong(week.weekEnd)}
                            </p>
                            {/* Mis totales */}
                            <div className="hidden sm:flex items-center gap-2 flex-wrap">
                                <MiniStat value={week.myTotals?.bitacoras ?? 0} label="bit." isDark={isDark} y={y} />
                                <MiniStat value={week.myTotals?.tasksCompleted ?? 0} label="tar." isDark={isDark} y={y} />
                                <MiniStat value={week.myTotals?.checkIns ?? 0} label="ent." isDark={isDark} y={y} />
                            </div>
                            {/* Estado */}
                            <div className="hidden sm:flex">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                    style={{ background: isDark ? "rgba(16,185,129,0.12)" : "#d1fae5", color: isDark ? "#34d399" : "#059669" }}>
                                    <Lock className="w-2.5 h-2.5" /> Cerrado
                                </span>
                            </div>
                            {/* Acción */}
                            <button
                                onClick={() => setSelectedWeek(week)}
                                className="justify-self-end inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold hover:-translate-y-0.5 transition-all duration-200"
                                style={{ background: y.bg, color: y.text }}
                                title="Ver mis actividades de la semana">
                                Ver <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                    ))
                )}
            </ThemedListContainer>

            {/* ══ MODAL DETALLE SEMANA PROPIA ══ */}
            {selectedWeek && (
                <MyWeekDetailModal
                    week={selectedWeek}
                    onClose={() => setSelectedWeek(null)}
                />
            )}
        </div>
    )
}

const MiniStat = ({ value, label, isDark, y }) => (
    <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold"
        style={{ background: y.bgSoft, color: y.text }}>
        {value} {label}
    </span>
)

// ── Modal: detalle inmutable de UNA semana propia (datos ya cargados en la lista) ──
const MyWeekDetailModal = ({ week, onClose }) => {
    const isDark = useIsDark()
    const y = YELLOW(isDark)
    const hasActivities = (week.myActivities?.length ?? 0) > 0

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={onClose}>
            <div className="w-full max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col
                bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-[rgba(252,227,0,0.15)]"
                onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b
                    border-gray-100 dark:border-[rgba(252,227,0,0.1)]">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ background: y.bg, color: y.text }}>
                            <Lock className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                Mi Reporte · Semana {week.weekNumber} · {week.isoYear}
                            </p>
                            <p className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#6b7280" }}>
                                {formatDateLong(week.weekStart)} — {formatDateLong(week.weekEnd)} · Snapshot inmutable
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-4 overflow-y-auto flex flex-col gap-4">
                    <ReportTotalsBar totals={week.myTotals} />
                    {hasActivities ? (
                        <EmployeeActivityGroup employee={{
                            employee: "self",
                            employeeName: "Mis actividades",
                            departmentName: null,
                            totals: week.myTotals,
                            activities: week.myActivities
                        }} maxActivities={99} />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 gap-3">
                            <FileText className="w-8 h-8" style={{ color: isDark ? "rgba(255,255,255,0.2)" : "#d1d5db" }} />
                            <p className="text-sm font-medium" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#9ca3af" }}>
                                No registraste actividades en esta semana.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end px-6 py-3 border-t border-gray-100 dark:border-[rgba(252,227,0,0.1)]">
                    <button onClick={onClose}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold hover:-translate-y-0.5 transition-all duration-200"
                        style={{ background: y.bg, color: y.text }}>
                        <Eye className="w-3.5 h-3.5" /> Cerrar
                    </button>
                </div>
            </div>
        </div>
    )
}
