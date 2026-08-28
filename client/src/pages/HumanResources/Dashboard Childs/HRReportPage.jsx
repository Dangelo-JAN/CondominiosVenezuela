import { ThemedListWrapper, ThemedHeadingBar, ThemedListContainer } from "../../../components/common/Dashboard/ListDesigns"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import {
    HandleGetCurrentReport,
    HandleGetReportHistory,
    HandleGetSnapshotByWeek
} from "../../../redux/Thunks/ReportThunk.js"
import { Loading } from "../../../components/common/loading.jsx"
import { useIsDark } from "../../../hooks/useIsDark.js"
import {
    ClipboardList, Lock, Eye, X, CalendarDays, Users,
    ChevronRight, FileText
} from "lucide-react"
import {
    ReportModeBadge, ReportTotalsBar, EmployeeActivityGroup,
    ReportEmptyState, PreliminaryBanner, YELLOW
} from "../../../components/common/Dashboard/ReportComponents.jsx"
import {
    BitacoraDetailModal, WorkPhotoModal
} from "../../../components/common/Dashboard/ReportActivityModals.jsx"

const formatDateLong = (dateStr) => {
    if (!dateStr) return "--"
    return new Date(dateStr).toLocaleDateString("es-ES", {
        weekday: "short", day: "2-digit", month: "short", year: "numeric"
    })
}

export const HRReportPage = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const isDark = useIsDark()
    const y = YELLOW(isDark)

    const { currentReport, history, selectedSnapshot, isLoading } = useSelector(s => s.reportreducer)

    const [detailLoading, setDetailLoading] = useState(false)
    const [showDetail, setShowDetail] = useState(false)
    // Modal de detalle de actividad (R3): { type, activity } | null
    const [activeActivity, setActiveActivity] = useState(null)

    useEffect(() => {
        dispatch(HandleGetCurrentReport())
        dispatch(HandleGetReportHistory())
    }, [dispatch])

    const openSnapshotDetail = async (isoYear, weekNumber) => {
        setDetailLoading(true)
        setShowDetail(true)
        await dispatch(HandleGetSnapshotByWeek({ isoYear, weekNumber }))
        setDetailLoading(false)
    }

    const daily = currentReport?.daily
    const weekly = currentReport?.weekly

    if (isLoading && !currentReport) return <Loading />

    // ── Navegación a páginas destino con filtros URL-driven (R3) ──
    // Los query params (?from=&to=) los leen las páginas destino (Fase 6).
    const navigateChip = (key, windowInfo) => {
        const from = windowInfo?.start
        const to = windowInfo?.end
        const qs = from ? `?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}` : ""
        switch (key) {
            case "bitacoras":
                navigate(`/HR/dashboard/bitacoras${qs}`)
                break
            case "photos":
                navigate(`/HR/dashboard/work-photos${qs}`)
                break
            case "tasks":
                // Página de horarios: filtra por día de la ventana
                navigate(`/HR/dashboard/schedules?day=${encodeURIComponent(windowInfo?.label ?? "")}`)
                break
            case "checkIns":
            case "horas":
                // Sin página destino o no navegable — sin acción
                break
            default:
                break
        }
    }

    // Apertura del modal de detalle según el tipo de actividad
    const handleActivityClick = (activity) => {
        setActiveActivity({ type: activity.type, data: activity })
    }

    return (
        <div className="w-full h-full flex flex-col gap-6 px-4 py-6 overflow-y-auto bg-white dark:bg-[#0f0f1a]">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: y.text }}>
                        Actividades del Equipo
                    </p>
                    <h1 className="text-2xl xl:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Reportes
                    </h1>
                </div>
                {currentReport && <ReportModeBadge mode={currentReport.mode} />}
            </div>

            <div className="h-px w-full" style={{ background: y.divider }} />

            {/* ══ SEMANA ACTUAL (en vivo) ══ */}
            <div className="flex flex-col gap-4">

                {/* Banner preliminar Vie–Dom */}
                {currentReport?.banner && <PreliminaryBanner banner={currentReport.banner} />}

                {/* Sección diaria */}
                <section className="rounded-2xl p-5 flex flex-col gap-4 transition-colors duration-300"
                    style={{
                        background: isDark ? "rgba(255,255,255,0.04)" : "#ffffff",
                        border: `1px solid ${isDark ? "rgba(255,255,255,0.10)" : "#fef08a"}`
                    }}>
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4" style={{ color: y.text }} />
                            <h2 className="text-base font-bold text-gray-900 dark:text-white">
                                {currentReport?.mode === "WEEK_START"
                                    ? "Semana iniciando"
                                    : `Actividades${currentReport?.dailyWindow?.label ? ` del ${currentReport.dailyWindow.label}` : ""}`}
                            </h2>
                        </div>
                        {currentReport?.dailyWindow && (
                            <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg"
                                style={{ background: y.bgSoft, color: isDark ? "rgba(255,255,255,0.45)" : "#a16207" }}>
                                {formatDateLong(currentReport.dailyWindow.start)}
                            </span>
                        )}
                    </div>

                    {!daily || currentReport?.mode === "WEEK_START" ? (
                        <ReportEmptyState
                            title="La semana está iniciando"
                            message="El reporte diario se activa a partir del primer día registrado de la semana."
                        />
                    ) : daily.employees.length === 0 || (
                        daily.totals.bitacoras + daily.totals.tasksCompleted +
                        daily.totals.workPhotos + daily.totals.checkIns
                    ) === 0 ? (
                        <ReportEmptyState
                            title="Sin actividades registradas"
                            message={`No hay actividades del equipo${currentReport?.dailyWindow?.label ? ` el ${currentReport.dailyWindow.label.toLowerCase()}` : ""}.`}
                        />
                    ) : (
                        <>
                            <ReportTotalsBar totals={daily.totals} onChipClick={key => navigateChip(key, currentReport.dailyWindow)} />
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                {daily.employees.map(emp => (
                                    <EmployeeActivityGroup key={String(emp.employee)} employee={emp} onActivityClick={handleActivityClick} />
                                ))}
                            </div>
                        </>
                    )}
                </section>

                {/* Sección semanal preliminar (solo Vie–Dom) */}
                {weekly && (
                    <section className="rounded-2xl p-5 flex flex-col gap-4 transition-colors duration-300"
                        style={{
                            background: isDark ? "rgba(252,227,0,0.04)" : "linear-gradient(135deg, #fefce8 0%, #ffffff 70%)",
                            border: `1px solid ${isDark ? "rgba(252,227,0,0.25)" : "#fef08a"}`
                        }}>
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-2">
                                <ClipboardList className="w-4 h-4" style={{ color: y.text }} />
                                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                                    Resumen semanal preliminar
                                </h2>
                            </div>
                            {currentReport?.weeklyWindow && (
                                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                                    style={{ background: y.bg, color: y.text, border: y.border }}>
                                    Semana {currentReport.weeklyWindow.weekNumber} · {currentReport.weeklyWindow.isoYear}
                                </span>
                            )}
                        </div>
                        <ReportTotalsBar totals={weekly.totals} onChipClick={key => navigateChip(key, currentReport.weeklyWindow)} />
                        {weekly.employees.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                {weekly.employees.map(emp => (
                                    <EmployeeActivityGroup key={String(emp.employee)} employee={emp} maxActivities={6} onActivityClick={handleActivityClick} />
                                ))}
                            </div>
                        ) : (
                            <ReportEmptyState
                                title="Sin datos aún"
                                message="Aún no hay actividades registradas esta semana."
                            />
                        )}
                    </section>
                )}
            </div>

            {/* ══ HISTÓRICO (snapshots inmutables) ══ */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" style={{ color: y.text }} />
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">Histórico semanal</h2>
                    <span className="text-[10px] font-medium uppercase tracking-wider"
                        style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#9ca3af" }}>
                        Cerrado · Auditado
                    </span>
                </div>

                <ThemedListWrapper accent="yellow">
                    <ThemedHeadingBar accent="yellow" table_layout={"grid-cols-5"}
                        table_headings={["Semana", "Período", "Totales", "Estado", "Acciones"]} />
                </ThemedListWrapper>
                <ThemedListContainer accent="yellow">
                    {(history?.length ?? 0) === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <FileText className="w-8 h-8" style={{ color: isDark ? "rgba(255,255,255,0.2)" : "#d1d5db" }} />
                            <p className="text-sm font-medium" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#9ca3af" }}>
                                Aún no hay semanas cerradas. El primer snapshot se genera el próximo lunes a las 3:00 AM.
                            </p>
                        </div>
                    ) : (
                        history.map(snap => (
                            <div key={`${snap.isoYear}-${snap.weekNumber}`}
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
                                        W{snap.weekNumber} · {snap.isoYear}
                                    </p>
                                </div>
                                {/* Período */}
                                <p className="text-xs truncate" style={{ color: isDark ? "rgba(255,255,255,0.45)" : "#6b7280" }}>
                                    {formatDateLong(snap.weekStart)} — {formatDateLong(snap.weekEnd)}
                                </p>
                                {/* Totales */}
                                <div className="hidden sm:flex items-center gap-2 flex-wrap">
                                    <MiniStat value={snap.totals?.bitacoras ?? 0} label="bit." isDark={isDark} y={y} />
                                    <MiniStat value={snap.totals?.tasksCompleted ?? 0} label="tar." isDark={isDark} y={y} />
                                    <MiniStat value={snap.totals?.checkIns ?? 0} label="ent." isDark={isDark} y={y} />
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
                                    onClick={() => openSnapshotDetail(snap.isoYear, snap.weekNumber)}
                                    className="justify-self-end inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold hover:-translate-y-0.5 transition-all duration-200"
                                    style={{ background: y.bg, color: y.text }}
                                    title="Ver detalle del snapshot">
                                    Ver <ChevronRight className="w-3 h-3" />
                                </button>
                            </div>
                        ))
                    )}
                </ThemedListContainer>
            </div>

            {/* ══ MODAL DETALLE SNAPSHOT ══ */}
            {showDetail && (
                <SnapshotDetailModal
                    loading={detailLoading}
                    snapshot={selectedSnapshot}
                    onClose={() => setShowDetail(false)}
                    onActivityClick={handleActivityClick}
                />
            )}

            {/* ══ MODAL DETALLE DE ACTIVIDAD (R3) ══ */}
            {activeActivity?.type === "bitacora" && (
                <BitacoraDetailModal
                    open
                    data={{
                        title: activeActivity.data.title ?? "Bitácora",
                        content: activeActivity.data.description || "Sin contenido adicional en el resumen.",
                        createdAt: activeActivity.data.date,
                        images: [],
                        videos: []
                    }}
                    onClose={() => setActiveActivity(null)}
                />
            )}
            {activeActivity?.type === "work_photo" && (
                <WorkPhotoModal
                    open
                    data={{
                        photourl: activeActivity.data.meta?.photourl,
                        description: activeActivity.data.title,
                        workdate: activeActivity.data.date
                    }}
                    showEmployee={false}
                    onClose={() => setActiveActivity(null)}
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

// ── Modal: detalle completo e inmutable de una semana cerrada ──────────────
const SnapshotDetailModal = ({ loading, snapshot, onClose, onActivityClick }) => {
    const isDark = useIsDark()
    const y = YELLOW(isDark)

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
                                {snapshot ? `Reporte Semana ${snapshot.weekNumber} · ${snapshot.isoYear}` : "Cargando..."}
                            </p>
                            {snapshot && (
                                <p className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#6b7280" }}>
                                    {formatDateLong(snapshot.weekStart)} — {formatDateLong(snapshot.weekEnd)} · Snapshot inmutable
                                </p>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-4 overflow-y-auto flex flex-col gap-4">
                    {loading && !snapshot ? (
                        <Loading />
                    ) : snapshot ? (
                        <>
                            {/* Totales globales */}
                            <ReportTotalsBar totals={snapshot.totals} />

                            {/* Por departamento */}
                            {snapshot.byDepartment?.length > 0 && (
                                <div className="flex flex-col gap-2">
                                    <p className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
                                        style={{ color: isDark ? "rgba(255,255,255,0.45)" : "#6b7280" }}>
                                        <Users className="w-3.5 h-3.5" /> Por departamento
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {snapshot.byDepartment.map((d, i) => (
                                            <div key={d.departmentId ?? i} className="rounded-xl p-3"
                                                style={{
                                                    background: isDark ? "rgba(255,255,255,0.05)" : "#fafafa",
                                                    border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#f3f4f6"}`
                                                }}>
                                                <p className="text-xs font-semibold text-gray-800 dark:text-white mb-1 truncate">
                                                    {d.departmentName}
                                                </p>
                                                <p className="text-[10px]" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }}>
                                                    {d.totals.bitacoras} bitácoras · {d.totals.tasksCompleted} tareas · {d.totals.checkIns} entradas
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Resumen por empleado */}
                            {snapshot.employeesResumen?.length > 0 && (
                                <div className="flex flex-col gap-3">
                                    {snapshot.employeesResumen.map(emp => (
                                        <EmployeeActivityGroup key={String(emp.employee)} employee={{
                                            employee: emp.employee,
                                            employeeName: emp.employeeName,
                                            departmentName: emp.departmentName,
                                            totals: emp.totals,
                                            activities: emp.activities ?? []
                                        }} onActivityClick={onActivityClick} />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-sm text-center py-8"
                            style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }}>
                            No se pudo cargar el snapshot.
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
