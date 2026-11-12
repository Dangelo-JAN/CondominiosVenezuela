import { useEffect, useState, useCallback, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useSearchParams } from "react-router-dom"
import { HandleSocialBenefits } from "../../../../../redux/Thunks/PayrollThunk.js"
import { HandlePayrollPeriods } from "../../../../../redux/Thunks/PayrollThunk.js"
import { Loading } from "../../../../../components/common/loading.jsx"
import { useIsDark } from "../../../../../hooks/useIsDark.js"
import { useHRAuth } from "../../../../../hooks/useHRAuth.js"
import { CustomSelect } from "../../../../../components/ui/custom-select.jsx"
import { ConfirmDialog } from "../../../../../components/common/ConfirmDialog.jsx"
import { ThemedListWrapper, ThemedHeadingBar, ThemedListContainer } from "../../../../../components/common/Dashboard/ListDesigns"
import {
    Briefcase, BookOpen, Calculator, Filter, Search, Plus, Eye, CheckCircle, XCircle, DollarSign, Trash2, RefreshCw,
    AlertTriangle, Settings, ChevronDown, ChevronUp, FileText, Clock, CreditCard, Building2, Coins, Receipt, List,
    ArrowRight, ArrowLeft, Download, Upload, History, HelpCircle, Info, Calendar, Handshake
} from "lucide-react"

// ──────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTES: Modales
// ──────────────────────────────────────────────────────────────────────────────

// --- LedgerDetailModal ---
const LedgerDetailModal = ({ entry, onClose, isDark }) => {
    const formatDate = (dateStr) => {
        if (!dateStr) return '—'
        return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    }
    const formatCurrency = (val) => {
        if (val === undefined || val === null) return '—'
        return `$ ${val.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

    if (!entry) return null

    const entryTypeConfig = {
        ACCRUAL: { label: 'Devengado', icon: Coins, color: 'emerald', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
        SETTLEMENT: { label: 'Liquidación', icon: Calculator, color: 'blue', bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
        ADJUSTMENT: { label: 'Ajuste', icon: Settings, color: 'yellow', bg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
        PAYMENT: { label: 'Pago', icon: DollarSign, color: 'cyan', bg: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400' },
    }

    const config = entryTypeConfig[entry.entry_type] || entryTypeConfig.ACCRUAL
    const EntryIcon = config.icon

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b transition-colors duration-300"
                    style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.1)" }}>
                            <EntryIcon className="w-5 h-5" style={{ color: "#003DA5" }} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Detalle Entrada Prestaciones</h2>
                            <p className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                {entry.employee?.firstname} {entry.employee?.lastname}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-4 max-h-[70vh] overflow-auto">
                    {/* Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Empleado</p>
                            <p className="font-medium text-gray-900 dark:text-white">{entry.employee?.firstname} {entry.employee?.lastname}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Código</p>
                            <p className="font-medium text-gray-900 dark:text-white">{entry.employee?.employee_code || '—'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Departamento</p>
                            <p className="font-medium text-gray-900 dark:text-white">{entry.employee?.department?.name || '—'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Fecha</p>
                            <p className="font-medium text-gray-900 dark:text-white">{formatDate(entry.entry_date || entry.createdAt)}</p>
                        </div>
                    </div>

                    {/* Entry Details */}
                    <div className="mb-6 p-4 rounded-xl transition-colors duration-300"
                        style={{
                            background: isDark ? "rgba(0,61,165,0.08)" : "rgba(0,61,165,0.05)",
                            border: isDark ? "1px solid rgba(0,61,165,0.2)" : "1px solid rgba(0,61,165,0.15)"
                        }}>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <EntryIcon className="w-5 h-5" style={{ color: "#003DA5" }} />
                            Información de la Entrada
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-3 rounded-lg" style={{ background: isDark ? `rgba(16,185,129,0.15)` : "#d1fae5" }}>
                                <p className="text-xs text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Tipo</p>
                                <p className="text-lg font-bold text-emerald-900 dark:text-emerald-300">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg}`}>
                                        <EntryIcon className="w-3 h-3" />
                                        {config.label}
                                    </span>
                                </p>
                            </div>
                            <div className="p-3 rounded-lg" style={{ background: isDark ? "rgba(245,158,11,0.15)" : "#fef3c7" }}>
                                <p className="text-xs text-yellow-700 dark:text-yellow-400 uppercase tracking-wider">Monto</p>
                                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-300">{formatCurrency(entry.amount)}</p>
                            </div>
                            <div className="p-3 rounded-lg" style={{ background: isDark ? "rgba(6,182,212,0.15)" : "#cffafe" }}>
                                <p className="text-xs text-cyan-700 dark:text-cyan-400 uppercase tracking-wider">Días Devengados</p>
                                <p className="text-2xl font-bold text-cyan-900 dark:text-cyan-300">{entry.days_accrued || 0}</p>
                            </div>
                            <div className="p-3 rounded-lg" style={{ background: isDark ? "rgba(0,61,165,0.15)" : "#dbeafe" }}>
                                <p className="text-xs text-blue-700 dark:text-blue-400 uppercase tracking-wider">Salario Diario</p>
                                <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">{formatCurrency(entry.daily_salary)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Period Info */}
                    {entry.period_start && entry.period_end && (
                        <div className="mb-6 p-4 rounded-xl transition-colors duration-300"
                            style={{
                                background: isDark ? "rgba(255,255,255,0.04)" : "#f9fafb",
                                border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.05)"
                            }}>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <Calendar className="w-5 h-5" style={{ color: "#003DA5" }} />
                                Período de Devengo
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Fecha Inicio</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(entry.period_start)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Fecha Fin</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(entry.period_end)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Contrato</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{entry.contract?.contract_number || entry.contract?._id?.slice(-8) || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Causa</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{entry.cause || entry.reason || '—'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Related Settlement */}
                    {entry.settlement && (
                        <div className="mb-6 p-4 rounded-xl transition-colors duration-300"
                            style={{
                                background: isDark ? "rgba(6,182,212,0.08)" : "#ecfeff",
                                border: isDark ? "1px solid rgba(6,182,212,0.2)" : "1px solid rgba(6,182,212,0.15)"
                            }}>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <Receipt className="w-5 h-5" style={{ color: "#06b6d4" }} />
                                Liquidación Asociada
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Estado</p>
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
                                        ${entry.settlement.status === 'PAID' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                          entry.settlement.status === 'APPROVED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                          entry.settlement.status === 'REJECTED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                        {entry.settlement.status}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Monto Liquidado</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(entry.settlement.total_amount)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Fecha Liquidación</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(entry.settlement.settlement_date)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Causa</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{entry.settlement.cause || '—'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Description/Notes */}
                    {(entry.description || entry.notes) && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Observaciones</h3>
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{entry.description || entry.notes}</p>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-2 pt-4 border-t"
                        style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                        <button onClick={onClose} className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// --- SettlementDetailModal ---
const SettlementDetailModal = ({ settlement, onClose, isDark }) => {
    const formatDate = (dateStr) => {
        if (!dateStr) return '—'
        return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    }
    const formatCurrency = (val) => {
        if (val === undefined || val === null) return '—'
        return `$ ${val.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

    const statusConfig = {
        PENDING: { bg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Pendiente', icon: Clock },
        APPROVED: { bg: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Aprobada', icon: CheckCircle },
        REJECTED: { bg: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', label: 'Rechazada', icon: XCircle },
        PAID: { bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', label: 'Pagada', icon: DollarSign },
    }

    const causeConfig = {
        RESIGNATION: { label: 'Renuncia Voluntaria', icon: ArrowRight },
        DISMISSAL: { label: 'Despido Justificado', icon: XCircle },
        UNJUSTIFIED_DISMISSAL: { label: 'Despido Injustificado', icon: AlertTriangle },
        CONTRACT_END: { label: 'Fin de Contrato', icon: FileText },
        MUTUAL_AGREEMENT: { label: 'Acuerdo Mutuo', icon: Handshake },
        DEATH: { label: 'Fallecimiento', icon: Building2 },
        DISABILITY: { label: 'Invalidez', icon: HelpCircle },
    }

    if (!settlement) return null

    const s = statusConfig[settlement.status] || statusConfig.PENDING
    const c = causeConfig[settlement.cause] || causeConfig.RESIGNATION
    const StatusIcon = s.icon
    const CauseIcon = c.icon

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b transition-colors duration-300"
                    style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.1)" }}>
                            <Calculator className="w-5 h-5" style={{ color: "#003DA5" }} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Detalle de Liquidación</h2>
                            <p className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                {settlement.employee?.firstname} {settlement.employee?.lastname} • {c.label}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg}`}>
                            <StatusIcon className="w-3 h-3" />
                            {s.label}
                        </span>
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-4 max-h-[70vh] overflow-auto">
                    {/* Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Empleado</p>
                            <p className="font-medium text-gray-900 dark:text-white">{settlement.employee?.firstname} {settlement.employee?.lastname}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Departamento</p>
                            <p className="font-medium text-gray-900 dark:text-white">{settlement.employee?.department?.name || '—'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Causa</p>
                            <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                                <CauseIcon className="w-4 h-4" style={{ color: "#003DA5" }} />
                                {c.label}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Fecha Liquidación</p>
                            <p className="font-medium text-gray-900 dark:text-white">{formatDate(settlement.settlement_date)}</p>
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="mb-6 p-4 rounded-xl transition-colors duration-300"
                        style={{
                            background: isDark ? "rgba(0,61,165,0.08)" : "rgba(0,61,165,0.05)",
                            border: isDark ? "1px solid rgba(0,61,165,0.2)" : "1px solid rgba(0,61,165,0.15)"
                        }}>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Coins className="w-5 h-5" style={{ color: "#003DA5" }} />
                            Resumen Económico
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="p-3 rounded-lg" style={{ background: isDark ? "rgba(16,185,129,0.15)" : "#d1fae5" }}>
                                <p className="text-xs text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Antigüedad (días)</p>
                                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-300">{settlement.seniority_days || 0}</p>
                            </div>
                            <div className="p-3 rounded-lg" style={{ background: isDark ? "rgba(6,182,212,0.15)" : "#cffafe" }}>
                                <p className="text-xs text-cyan-700 dark:text-cyan-400 uppercase tracking-wider">Salario Diario</p>
                                <p className="text-xl font-bold text-cyan-900 dark:text-cyan-300">{formatCurrency(settlement.daily_salary)}</p>
                            </div>
                            <div className="p-3 rounded-lg" style={{ background: isDark ? "rgba(245,158,11,0.15)" : "#fef3c7" }}>
                                <p className="text-xs text-yellow-700 dark:text-yellow-400 uppercase tracking-wider">Prestaciones</p>
                                <p className="text-xl font-bold text-yellow-900 dark:text-yellow-300">{formatCurrency(settlement.benefits_amount)}</p>
                            </div>
                            <div className="p-3 rounded-lg" style={{ background: isDark ? "rgba(239,68,68,0.15)" : "#fee2e2" }}>
                                <p className="text-xs text-red-700 dark:text-red-400 uppercase tracking-wider">Deducciones</p>
                                <p className="text-xl font-bold text-red-900 dark:text-red-300">{formatCurrency(settlement.deductions_amount)}</p>
                            </div>
                            <div className="p-3 rounded-lg" style={{ background: isDark ? "rgba(0,61,165,0.15)" : "#dbeafe" }}>
                                <p className="text-xs text-blue-700 dark:text-blue-400 uppercase tracking-wider">TOTAL</p>
                                <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">{formatCurrency(settlement.total_amount)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Breakdown */}
                    {settlement.breakdown && Object.keys(settlement.breakdown).length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Desglose de Cálculo</h3>
                            <div className="space-y-2">
                                {Object.entries(settlement.breakdown).map(([key, value]) => (
                                    <div key={key} className="flex items-center justify-between p-3 rounded-lg border transition-colors"
                                        style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb" }}>
                                        <span className="font-medium text-gray-900 dark:text-white capitalize">{key.replace(/_/g, ' ')}</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Status History */}
                    <div className="mb-6 p-4 rounded-xl transition-colors duration-300"
                        style={{
                            background: isDark ? "rgba(255,255,255,0.04)" : "#f9fafb",
                            border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.05)"
                        }}>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Historial de Estado</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: isDark ? "rgba(255,255,255,0.02)" : "#f3f4f6" }}>
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">1</div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Liquidación Creada</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(settlement.createdAt)}</p>
                                </div>
                            </div>
                            {settlement.approved_at && (
                                <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: isDark ? "rgba(16,185,129,0.08)" : "#f0fdf4" }}>
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">2</div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Aprobada</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(settlement.approved_at)} por {settlement.approved_by?.firstname} {settlement.approved_by?.lastname}</p>
                                    </div>
                                </div>
                            )}
                            {settlement.rejected_at && (
                                <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: isDark ? "rgba(239,68,68,0.08)" : "#fef2f2" }}>
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">2</div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Rechazada</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(settlement.rejected_at)} por {settlement.rejected_by?.firstname} {settlement.rejected_by?.lastname}</p>
                                        {settlement.rejection_reason && <p className="text-sm text-red-600 dark:text-red-400 mt-1">Motivo: {settlement.rejection_reason}</p>}
                                    </div>
                                </div>
                            )}
                            {settlement.paid_at && (
                                <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: isDark ? "rgba(6,182,212,0.08)" : "#ecfeff" }}>
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400">3</div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Pagada</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(settlement.paid_at)}</p>
                                        {settlement.payment_method && <p className="text-sm text-cyan-600 dark:text-cyan-400 mt-1">Método: {settlement.payment_method}{settlement.bank_reference ? ` • Ref: ${settlement.bank_reference}` : ''}</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    {settlement.notes && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Notas</h3>
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{settlement.notes}</p>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-2 pt-4 border-t"
                        style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                        <button onClick={onClose} className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// --- SettlementFormModal ---
const SettlementFormModal = ({ open, onClose, onSubmit, onCalculate, isDark, employees, contracts, editingSettlement = null, calculating = false }) => {
    const [formData, setFormData] = useState({
        employee: "select",
        contract: "select",
        settlement_date: "",
        cause: "RESIGNATION",
        notes: ""
    })
    const [errors, setErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)
    const [calculationPreview, setCalculationPreview] = useState(null)

    const causeOptions = [
        { value: "RESIGNATION", label: "Renuncia Voluntaria" },
        { value: "DISMISSAL", label: "Despido Justificado" },
        { value: "UNJUSTIFIED_DISMISSAL", label: "Despido Injustificado" },
        { value: "CONTRACT_END", label: "Fin de Contrato" },
        { value: "MUTUAL_AGREEMENT", label: "Acuerdo Mutuo" },
        { value: "DEATH", label: "Fallecimiento" },
        { value: "DISABILITY", label: "Invalidez" },
    ]

    const employeeOptions = useMemo(() => [
        { value: "select", label: "Seleccionar empleado..." },
        ...(employees?.map(e => ({ value: e._id, label: `${e.firstname} ${e.lastname} (${e.employee_code || e.email})` })) || [])
    ], [employees])

    const contractOptions = useMemo(() => {
        const selectedEmployee = employees?.find(e => e._id === formData.employee)
        if (!selectedEmployee?.contracts) return [{ value: "select", label: "Seleccionar empleado primero..." }]
        return [
            { value: "select", label: "Seleccionar contrato..." },
            ...selectedEmployee.contracts.map(c => ({ value: c._id, label: `${c.contract_number} (${c.position?.name || c.position})` }))
        ]
    }, [employees, formData.employee])

    useEffect(() => {
        if (open) {
            if (editingSettlement) {
                setFormData({
                    employee: editingSettlement.employee?._id || editingSettlement.employee || "select",
                    contract: editingSettlement.contract?._id || editingSettlement.contract || "select",
                    settlement_date: editingSettlement.settlement_date ? editingSettlement.settlement_date.split('T')[0] : "",
                    cause: editingSettlement.cause || "RESIGNATION",
                    notes: editingSettlement.notes || ""
                })
            } else {
                setFormData({ employee: "select", contract: "select", settlement_date: "", cause: "RESIGNATION", notes: "" })
            }
            setCalculationPreview(null)
            setErrors({})
        }
    }, [open, editingSettlement, employees])

    const validate = () => {
        const newErrors = {}
        if (!formData.employee || formData.employee === "select") newErrors.employee = "Empleado es requerido"
        if (!formData.contract || formData.contract === "select") newErrors.contract = "Contrato es requerido"
        if (!formData.settlement_date) newErrors.settlement_date = "Fecha de liquidación es requerida"
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleCalculate = async (e) => {
        e.preventDefault()
        if (!formData.contract || formData.contract === "select") {
            setErrors({ contract: "Seleccione un contrato para calcular" })
            return
        }
        if (!formData.settlement_date) {
            setErrors({ settlement_date: "Fecha de liquidación es requerida para calcular" })
            return
        }
        try {
            setErrors({})
            const result = await onCalculate({ contract_id: formData.contract, settlement_date: formData.settlement_date, cause: formData.cause })
            setCalculationPreview(result)
        } catch (err) {
            setErrors({ calculate: err.message || "Error al calcular liquidación" })
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return
        setSubmitting(true)
        try {
            await onSubmit(formData)
            onClose()
        } catch (err) {
            setErrors({ submit: err.message || "Error al guardar" })
        } finally {
            setSubmitting(false)
        }
    }

    if (!open) return null

    const formatCurrency = (val) => {
        if (val === undefined || val === null) return '—'
        return `$ ${val.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl animate-slide-up max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b transition-colors duration-300"
                        style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.1)" }}>
                                <Calculator className="w-5 h-5" style={{ color: "#003DA5" }} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {editingSettlement ? "Editar Liquidación" : "Nueva Liquidación de Prestaciones"}
                            </h2>
                        </div>
                        <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="p-4 space-y-4 max-h-[70vh] overflow-auto">
                        {errors.submit && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                                {errors.submit}
                            </div>
                        )}

                        {/* Employee */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                Empleado <span className="text-red-500">*</span>
                            </label>
                            <CustomSelect
                                value={formData.employee}
                                onValueChange={(val) => setFormData({...formData, employee: val, contract: "select"})}
                                options={employeeOptions}
                                placeholder="Seleccionar empleado..."
                                accentColor="blue"
                                disabled={submitting || calculating || !!editingSettlement}
                            />
                            {errors.employee && <p className="mt-1 text-xs text-red-500">{errors.employee}</p>}
                        </div>

                        {/* Contract */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                Contrato <span className="text-red-500">*</span>
                            </label>
                            <CustomSelect
                                value={formData.contract}
                                onValueChange={(val) => setFormData({...formData, contract: val})}
                                options={contractOptions}
                                placeholder="Seleccionar contrato..."
                                accentColor="blue"
                                disabled={submitting || calculating || !!editingSettlement}
                            />
                            {errors.contract && <p className="mt-1 text-xs text-red-500">{errors.contract}</p>}
                        </div>

                        {/* Settlement Date */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                Fecha de Liquidación <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={formData.settlement_date}
                                onChange={(e) => setFormData({...formData, settlement_date: e.target.value, calculationPreview: null})}
                                className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200
                                    bg-gray-50 border border-gray-200 text-gray-900
                                    focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
                                    dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                    dark:focus:border-[rgba(0,61,165,0.5)]
                                    ${errors.settlement_date ? 'border-red-400' : ''}`}
                            />
                            {errors.settlement_date && <p className="mt-1 text-xs text-red-500">{errors.settlement_date}</p>}
                        </div>

                        {/* Cause */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                Causa de Liquidación
                            </label>
                            <CustomSelect
                                value={formData.cause}
                                onValueChange={(val) => setFormData({...formData, cause: val})}
                                options={causeOptions}
                                placeholder="Seleccionar causa..."
                                accentColor="blue"
                                disabled={submitting || calculating}
                            />
                        </div>

                        {/* Calculate Button */}
                        {!editingSettlement && (
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={handleCalculate}
                                    disabled={calculating || !formData.contract || formData.contract === "select" || !formData.settlement_date}
                                    className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    style={{ background: "#003DA5" }}
                                >
                                    {calculating ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Calculando...
                                        </>
                                    ) : (
                                        <>
                                            <Calculator className="w-4 h-4" />
                                            Calcular Liquidación
                                        </>
                                    )}
                                </button>
                                {errors.calculate && <p className="mt-1 text-xs text-red-500">{errors.calculate}</p>}
                            </div>
                        )}

                        {/* Calculation Preview */}
                        {calculationPreview && (
                            <div className="p-4 rounded-xl border transition-colors duration-300"
                                style={{
                                    background: isDark ? "rgba(16,185,129,0.1)" : "#f0fdf4",
                                    borderColor: isDark ? "rgba(16,185,129,0.3)" : "#86efac"
                                }}>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                                    <CheckCircle className="w-5 h-5" />
                                    Preview del Cálculo
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                                    <div className="p-2 rounded-lg bg-white dark:bg-gray-800">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Antigüedad</p>
                                        <p className="font-bold text-emerald-700 dark:text-emerald-400">{calculationPreview.seniority_days || 0} días</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-white dark:bg-gray-800">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Salario Diario</p>
                                        <p className="font-bold text-cyan-700 dark:text-cyan-400">{formatCurrency(calculationPreview.daily_salary)}</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-white dark:bg-gray-800">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Prestaciones</p>
                                        <p className="font-bold text-yellow-700 dark:text-yellow-400">{formatCurrency(calculationPreview.benefits_amount)}</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-white dark:bg-gray-800">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Deducciones</p>
                                        <p className="font-bold text-red-700 dark:text-red-400">{formatCurrency(calculationPreview.deductions_amount)}</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-white dark:bg-gray-800">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">TOTAL</p>
                                        <p className="font-bold text-blue-700 dark:text-blue-400 text-lg">{formatCurrency(calculationPreview.total_amount)}</p>
                                    </div>
                                </div>
                                {calculationPreview.breakdown && (
                                    <div className="mt-3 pt-3 border-t text-xs"
                                        style={{ borderColor: isDark ? "rgba(16,185,129,0.2)" : "#86efac" }}>
                                        <p className="font-medium text-gray-900 dark:text-white mb-2">Desglose:</p>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                            {Object.entries(calculationPreview.breakdown).map(([key, value]) => (
                                                <div key={key} className="flex justify-between p-2 rounded bg-white dark:bg-gray-800">
                                                    <span className="capitalize text-gray-600 dark:text-gray-400">{key.replace(/_/g, ' ')}</span>
                                                    <span className="font-semibold">{formatCurrency(value)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Notes */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                Notas
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                rows={3}
                                placeholder="Notas u observaciones..."
                                className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200
                                    bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                                    focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
                                    dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                    dark:placeholder-[rgba(255,255,255,0.25)] dark:focus:border-[rgba(0,61,165,0.5)]`}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                                Cancelar
                            </button>
                            <button type="submit" disabled={submitting || calculating} className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" style={{ background: "#003DA5" }}>
                                {submitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Calculator className="w-4 h-4" />
                                        {editingSettlement ? "Actualizar" : "Crear"}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

// --- AccrualFormModal ---
const AccrualFormModal = ({ open, onClose, onCalculate, onRecord, isDark, employees, calculating = false, recording = false }) => {
    const [formData, setFormData] = useState({
        employee: "select",
        contract: "select",
        period_start: "",
        period_end: ""
    })
    const [errors, setErrors] = useState({})
    const [calculationPreview, setCalculationPreview] = useState(null)

    const employeeOptions = useMemo(() => [
        { value: "select", label: "Seleccionar empleado..." },
        ...(employees?.map(e => ({ value: e._id, label: `${e.firstname} ${e.lastname} (${e.employee_code || e.email})` })) || [])
    ], [employees])

    const contractOptions = useMemo(() => {
        const selectedEmployee = employees?.find(e => e._id === formData.employee)
        if (!selectedEmployee?.contracts) return [{ value: "select", label: "Seleccionar empleado primero..." }]
        return [
            { value: "select", label: "Seleccionar contrato..." },
            ...selectedEmployee.contracts.map(c => ({ value: c._id, label: `${c.contract_number} (${c.position?.name || c.position})` }))
        ]
    }, [employees, formData.employee])

    useEffect(() => {
        if (open) {
            setFormData({ employee: "select", contract: "select", period_start: "", period_end: "" })
            setCalculationPreview(null)
            setErrors({})
        }
    }, [open, employees])

    const validate = () => {
        const newErrors = {}
        if (!formData.employee || formData.employee === "select") newErrors.employee = "Empleado es requerido"
        if (!formData.contract || formData.contract === "select") newErrors.contract = "Contrato es requerido"
        if (!formData.period_start) newErrors.period_start = "Fecha inicio es requerida"
        if (!formData.period_end) newErrors.period_end = "Fecha fin es requerida"
        if (formData.period_start && formData.period_end && new Date(formData.period_start) > new Date(formData.period_end)) {
            newErrors.period_end = "Fecha fin debe ser posterior a fecha inicio"
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleCalculate = async (e) => {
        e.preventDefault()
        if (!validate()) return
        try {
            setErrors({})
            const result = await onCalculate({
                employee_id: formData.employee,
                contract_id: formData.contract,
                period_start: formData.period_start,
                period_end: formData.period_end
            })
            setCalculationPreview(result)
        } catch (err) {
            setErrors({ calculate: err.message || "Error al calcular devengado" })
        }
    }

    const handleRecord = async (e) => {
        e.preventDefault()
        if (!calculationPreview) {
            setErrors({ record: "Primero debe calcular el devengado" })
            return
        }
        try {
            setErrors({})
            await onRecord({
                employee_id: formData.employee,
                contract_id: formData.contract,
                period_start: formData.period_start,
                period_end: formData.period_end,
                amount: calculationPreview.amount,
                days_accrued: calculationPreview.days_accrued,
                daily_salary: calculationPreview.daily_salary
            })
            onClose()
        } catch (err) {
            setErrors({ record: err.message || "Error al registrar devengado" })
        }
    }

    if (!open) return null

    const formatCurrency = (val) => {
        if (val === undefined || val === null) return '—'
        return `$ ${val.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg animate-slide-up max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
                <form>
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b transition-colors duration-300"
                        style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.1)" }}>
                                <Coins className="w-5 h-5" style={{ color: "#003DA5" }} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Calcular y Registrar Devengado</h2>
                        </div>
                        <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="p-4 space-y-4 max-h-[70vh] overflow-auto">
                        {errors.calculate && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                                {errors.calculate}
                            </div>
                        )}
                        {errors.record && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                                {errors.record}
                            </div>
                        )}

                        {/* Employee */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                Empleado <span className="text-red-500">*</span>
                            </label>
                            <CustomSelect
                                value={formData.employee}
                                onValueChange={(val) => setFormData({...formData, employee: val, contract: "select", calculationPreview: null})}
                                options={employeeOptions}
                                placeholder="Seleccionar empleado..."
                                accentColor="blue"
                                disabled={calculating || recording}
                            />
                            {errors.employee && <p className="mt-1 text-xs text-red-500">{errors.employee}</p>}
                        </div>

                        {/* Contract */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                Contrato <span className="text-red-500">*</span>
                            </label>
                            <CustomSelect
                                value={formData.contract}
                                onValueChange={(val) => setFormData({...formData, contract: val, calculationPreview: null})}
                                options={contractOptions}
                                placeholder="Seleccionar contrato..."
                                accentColor="blue"
                                disabled={calculating || recording}
                            />
                            {errors.contract && <p className="mt-1 text-xs text-red-500">{errors.contract}</p>}
                        </div>

                        {/* Period Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                    Fecha Inicio <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.period_start}
                                    onChange={(e) => setFormData({...formData, period_start: e.target.value, calculationPreview: null})}
                                    className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200
                                        bg-gray-50 border border-gray-200 text-gray-900
                                        focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
                                        dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                        dark:focus:border-[rgba(0,61,165,0.5)]
                                        ${errors.period_start ? 'border-red-400' : ''}`}
                                />
                                {errors.period_start && <p className="mt-1 text-xs text-red-500">{errors.period_start}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                    Fecha Fin <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.period_end}
                                    onChange={(e) => setFormData({...formData, period_end: e.target.value, calculationPreview: null})}
                                    className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200
                                        bg-gray-50 border border-gray-200 text-gray-900
                                        focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
                                        dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                        dark:focus:border-[rgba(0,61,165,0.5)]
                                        ${errors.period_end ? 'border-red-400' : ''}`}
                                />
                                {errors.period_end && <p className="mt-1 text-xs text-red-500">{errors.period_end}</p>}
                            </div>
                        </div>

                        {/* Calculate Button */}
                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={handleCalculate}
                                disabled={calculating || !validate()}
                                className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                style={{ background: "#003DA5" }}
                            >
                                {calculating ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Calculando...
                                    </>
                                ) : (
                                    <>
                                        <Calculator className="w-4 h-4" />
                                        Calcular Devengado
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Calculation Preview */}
                        {calculationPreview && (
                            <div className="p-4 rounded-xl border transition-colors duration-300"
                                style={{
                                    background: isDark ? "rgba(16,185,129,0.1)" : "#f0fdf4",
                                    borderColor: isDark ? "rgba(16,185,129,0.3)" : "#86efac"
                                }}>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                                    <CheckCircle className="w-5 h-5" />
                                    Preview del Cálculo
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
                                    <div className="p-2 rounded-lg bg-white dark:bg-gray-800">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Días Devengados</p>
                                        <p className="font-bold text-emerald-700 dark:text-emerald-400">{calculationPreview.days_accrued || 0}</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-white dark:bg-gray-800">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Salario Diario</p>
                                        <p className="font-bold text-cyan-700 dark:text-cyan-400">{formatCurrency(calculationPreview.daily_salary)}</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-white dark:bg-gray-800">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Monto Total</p>
                                        <p className="font-bold text-yellow-700 dark:text-yellow-400">{formatCurrency(calculationPreview.amount)}</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-white dark:bg-gray-800">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Entrada Tipo</p>
                                        <p className="font-bold text-blue-700 dark:text-blue-400">ACCRUAL</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleRecord}
                                    disabled={recording}
                                    className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    style={{ background: "#10b981" }}
                                >
                                    {recording ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Registrando...
                                        </>
                                    ) : (
                                        <>
                                            <Coins className="w-4 h-4" />
                                            Registrar Devengado
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}

// ──────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ──────────────────────────────────────────────────────────────────────────────

const SUB_TABS = [
    { id: "ledger", label: "Libro", icon: BookOpen, description: "Registro de entradas de prestaciones por empleado" },
    { id: "settlements", label: "Liquidaciones", icon: Calculator, description: "Cálculo, creación, aprobación y pago de liquidaciones" },
    { id: "accrual", label: "Devengado", icon: Coins, description: "Cálculo y registro de prestaciones devengadas por período" },
]

export const PayrollSocialBenefitsTab = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const isDark = useIsDark()
    const { user } = useHRAuth()

    // Subtab state
    const [activeSubTab, setActiveSubTab] = useState("ledger")

    // Redux State
    const socialBenefitsLedger = useSelector(state => state.Payroll.socialBenefitsLedger)
    const socialBenefitsLedgerEmployee = useSelector(state => state.Payroll.socialBenefitsLedgerEmployee)
    const settlements = useSelector(state => state.Payroll.settlements)
    const settlement = useSelector(state => state.Payroll.settlement)
    const settlementCalculation = useSelector(state => state.Payroll.settlementCalculation)
    const accrualCalculation = useSelector(state => state.Payroll.accrualCalculation)

    // Local State
    const [ledgerPage, setLedgerPage] = useState(1)
    const [ledgerFilters, setLedgerFilters] = useState({ employee: "", entry_type: "" })
    const [settlementsPage, setSettlementsPage] = useState(1)
    const [settlementsFilters, setSettlementsFilters] = useState({ contract: "", status: "" })
    const [selectedLedgerEntry, setSelectedLedgerEntry] = useState(null)
    const [selectedSettlement, setSelectedSettlement] = useState(null)
    const [showSettlementForm, setShowSettlementForm] = useState(false)
    const [editingSettlement, setEditingSettlement] = useState(null)
    const [showAccrualForm, setShowAccrualForm] = useState(false)
    const [employees, setEmployees] = useState([])
    const [calculating, setCalculating] = useState(false)
    const [recording, setRecording] = useState(false)

    // Load employees for selects
    useEffect(() => {
        // TODO: Fetch employees with contracts for selects
        // For now, we'll use the data from ledger/settlements
    }, [])

    // Load initial data
    useEffect(() => {
        dispatch(HandleSocialBenefits({ type: "LEDGER_GETALL", page: ledgerPage, limit: 20, ...ledgerFilters }))
        dispatch(HandleSocialBenefits({ type: "SETTLEMENTS_GETALL", page: settlementsPage, limit: 20, ...settlementsFilters }))
    }, [dispatch, ledgerPage, ledgerFilters, settlementsPage, settlementsFilters])

    // Extract employees from ledger data for selects
    const employeeOptions = useMemo(() => {
        const seen = new Set()
        const opts = [{ value: "select", label: "Todos los empleados" }]
        socialBenefitsLedger.data?.forEach(entry => {
            if (entry.employee?._id && !seen.has(entry.employee._id)) {
                seen.add(entry.employee._id)
                opts.push({ value: entry.employee._id, label: `${entry.employee.firstname} ${entry.employee.lastname}` })
            }
        })
        return opts
    }, [socialBenefitsLedger.data])

    const formatCurrency = (val) => {
        if (val === undefined || val === null) return '—'
        return `$ ${val.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return '—'
        return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    // ─── Handlers ───
    const handleLedgerFilterChange = (key, value) => {
        setLedgerFilters(prev => ({ ...prev, [key]: value }))
        setLedgerPage(1)
    }

    const handleSettlementsFilterChange = (key, value) => {
        setSettlementsFilters(prev => ({ ...prev, [key]: value }))
        setSettlementsPage(1)
    }

    const handleViewLedgerEntry = (entry) => setSelectedLedgerEntry(entry)
    const handleViewSettlement = (s) => setSelectedSettlement(s)

    const handleNewSettlement = () => {
        setEditingSettlement(null)
        setShowSettlementForm(true)
    }

    const handleEditSettlement = (s) => {
        setEditingSettlement(s)
        setShowSettlementForm(true)
    }

    const handleCalculateSettlement = async (data) => {
        setCalculating(true)
        try {
            const result = await dispatch(HandleSocialBenefits({ type: "SETTLEMENTS_CALCULATE", ...data })).unwrap()
            return result.data
        } finally {
            setCalculating(false)
        }
    }

    const handleCreateSettlement = async (data) => {
        await dispatch(HandleSocialBenefits({ type: "SETTLEMENTS_CREATE", ...data })).unwrap()
        setShowSettlementForm(false)
        setEditingSettlement(null)
    }

    const handleApproveSettlement = async (id) => {
        await dispatch(HandleSocialBenefits({ type: "SETTLEMENTS_APPROVE", id })).unwrap()
    }

    const handlePaySettlement = async (id, paymentData) => {
        await dispatch(HandleSocialBenefits({ type: "SETTLEMENTS_PAY", id, ...paymentData })).unwrap()
    }

    const handleRejectSettlement = async (id, reason) => {
        // TODO: Implement reject endpoint if available
        console.log("Reject settlement", id, reason)
    }

    const handleCalculateAccrual = async (data) => {
        setCalculating(true)
        try {
            const result = await dispatch(HandleSocialBenefits({ type: "ACCRUAL_CALCULATE", ...data })).unwrap()
            return result.data
        } finally {
            setCalculating(false)
        }
    }

    const handleRecordAccrual = async (data) => {
        setRecording(true)
        try {
            await dispatch(HandleSocialBenefits({ type: "ACCRUAL_RECORD", ...data })).unwrap()
        } finally {
            setRecording(false)
        }
    }

    // ─── Render Subtab Content ───
    const renderLedgerTab = () => (
        <div className="w-full h-full flex flex-col">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 p-4 bg-white dark:bg-[#1a1a2e] border-b transition-colors duration-300"
                style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                <div className="flex-1 min-w-[200px]">
                    <CustomSelect
                        value={ledgerFilters.employee}
                        onValueChange={(val) => handleLedgerFilterChange('employee', val)}
                        options={employeeOptions}
                        placeholder="Filtrar por empleado..."
                        accentColor="blue"
                    />
                </div>
                <div className="min-w-[180px]">
                    <CustomSelect
                        value={ledgerFilters.entry_type}
                        onValueChange={(val) => handleLedgerFilterChange('entry_type', val)}
                        options={[
                            { value: "", label: "Todos los tipos" },
                            { value: "ACCRUAL", label: "Devengado" },
                            { value: "SETTLEMENT", label: "Liquidación" },
                            { value: "ADJUSTMENT", label: "Ajuste" },
                            { value: "PAYMENT", label: "Pago" },
                        ]}
                        placeholder="Tipo de entrada..."
                        accentColor="blue"
                    />
                </div>
                <button
                    onClick={() => dispatch(HandleSocialBenefits({ type: "LEDGER_GETALL", page: ledgerPage, limit: 20, ...ledgerFilters }))}
                    disabled={socialBenefitsLedger.isLoading}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                    style={{ background: "#003DA5" }}
                >
                    <RefreshCw className={`w-4 h-4 ${socialBenefitsLedger.isLoading ? 'animate-spin' : ''}`} />
                    Actualizar
                </button>
            </div>

            {/* List */}
            <div className="flex-1 min-h-0 overflow-hidden">
                <ThemedListWrapper accent="blue">
                    <ThemedHeadingBar
                        table_layout="sm:grid-cols-6"
                        table_headings={["Empleado", "Tipo", "Monto", "Días", "Fecha", "Acciones"]}
                        accent="blue"
                    />
                    <ThemedListContainer accent="blue">
                        {socialBenefitsLedger.isLoading ? (
                            <div className="flex items-center justify-center h-64">
                                <Loading />
                            </div>
                        ) : socialBenefitsLedger.data && socialBenefitsLedger.data.length > 0 ? (
                            <>
                                {socialBenefitsLedger.data.map((entry, index) => (
                                    <div
                                        key={entry._id ?? index}
                                        className="grid min-[250px]:grid-cols-2 sm:grid-cols-6 gap-2 px-3 py-3 items-center
                                            border-b last:border-b-0 transition-colors duration-150
                                            border-[#dde5ff] dark:border-[rgba(255,255,255,0.08)]
                                            hover:bg-[#e0f2fe] dark:hover:bg-[rgba(0,61,165,0.08)]"
                                    >
                                        {/* Employee */}
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold
                                                bg-blue-100 text-blue-700
                                                dark:bg-[rgba(0,61,165,0.25)] dark:text-blue-300
                                                border border-blue-200 dark:border-[rgba(0,61,165,0.4)]">
                                                {entry.employee?.firstname?.slice(0, 1).toUpperCase()}{entry.employee?.lastname?.slice(0, 1).toUpperCase()}
                                            </div>
                                            <p className="text-sm font-semibold truncate text-gray-900 dark:text-white">
                                                {`${entry.employee?.firstname} ${entry.employee?.lastname}`}
                                            </p>
                                        </div>

                                        {/* Type */}
                                        <div className="min-[250px]:hidden sm:flex sm:justify-center sm:items-center min-w-0">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold
                                                ${entry.entry_type === 'ACCRUAL' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-[rgba(16,185,129,0.15)] dark:text-emerald-400 dark:border-[rgba(16,185,129,0.3)]' :
                                                  entry.entry_type === 'SETTLEMENT' ? 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-[rgba(0,61,165,0.15)] dark:text-blue-400 dark:border-[rgba(0,61,165,0.3)]' :
                                                  entry.entry_type === 'PAYMENT' ? 'bg-cyan-100 text-cyan-700 border border-cyan-200 dark:bg-[rgba(6,182,212,0.15)] dark:text-cyan-400 dark:border-[rgba(6,182,212,0.3)]' :
                                                  'bg-yellow-100 text-yellow-700 border border-yellow-200 dark:bg-[rgba(245,158,11,0.15)] dark:text-yellow-400 dark:border-[rgba(245,158,11,0.3)]'}`}>
                                                {entry.entry_type === 'ACCRUAL' && <Coins className="w-3 h-3" />}
                                                {entry.entry_type === 'SETTLEMENT' && <Calculator className="w-3 h-3" />}
                                                {entry.entry_type === 'PAYMENT' && <DollarSign className="w-3 h-3" />}
                                                {entry.entry_type === 'ADJUSTMENT' && <Settings className="w-3 h-3" />}
                                                {entry.entry_type}
                                            </span>
                                        </div>

                                        {/* Amount */}
                                        <div className="hidden sm:block text-center font-mono text-sm font-semibold text-gray-900 dark:text-white">
                                            {formatCurrency(entry.amount)}
                                        </div>

                                        {/* Days */}
                                        <div className="hidden sm:block text-center text-sm text-gray-600 dark:text-[rgba(255,255,255,0.55)]">
                                            {entry.days_accrued || 0}
                                        </div>

                                        {/* Date */}
                                        <div className="hidden sm:block text-center text-sm text-gray-600 dark:text-[rgba(255,255,255,0.55)]">
                                            {formatDate(entry.entry_date || entry.createdAt)}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex justify-center items-center gap-2">
                                            <button
                                                onClick={() => handleViewLedgerEntry(entry)}
                                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
                                                title="Ver detalle"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-center p-8">
                                <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Sin entradas de prestaciones</h3>
                                <p className="text-gray-500 dark:text-gray-400">No hay registros en el libro de prestaciones</p>
                            </div>
                        )}
                    </ThemedListContainer>
                </ThemedListWrapper>

                {/* Pagination */}
                {socialBenefitsLedger.pagination?.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 p-4 border-t"
                        style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                        <button
                            onClick={() => setLedgerPage(p => Math.max(1, p - 1))}
                            disabled={ledgerPage === 1 || socialBenefitsLedger.isLoading}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="px-3 py-1.5 text-sm font-medium text-gray-900 dark:text-white">
                            Página {ledgerPage} de {socialBenefitsLedger.pagination.totalPages}
                        </span>
                        <button
                            onClick={() => setLedgerPage(p => Math.min(socialBenefitsLedger.pagination.totalPages, p + 1))}
                            disabled={ledgerPage === socialBenefitsLedger.pagination.totalPages || socialBenefitsLedger.isLoading}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )

    const renderSettlementsTab = () => (
        <div className="w-full h-full flex flex-col">
            {/* Header with Actions */}
            <div className="flex flex-wrap gap-3 p-4 bg-white dark:bg-[#1a1a2e] border-b transition-colors duration-300"
                style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                <div className="flex-1 min-w-[200px]">
                    <CustomSelect
                        value={settlementsFilters.contract}
                        onValueChange={(val) => handleSettlementsFilterChange('contract', val)}
                        options={[
                            { value: "", label: "Todos los contratos" },
                            ...(settlements.data?.flatMap(s => s.contract ? [{ value: s.contract._id, label: s.contract.contract_number }] : []) || [])
                        ]}
                        placeholder="Filtrar por contrato..."
                        accentColor="blue"
                    />
                </div>
                <div className="min-w-[180px]">
                    <CustomSelect
                        value={settlementsFilters.status}
                        onValueChange={(val) => handleSettlementsFilterChange('status', val)}
                        options={[
                            { value: "", label: "Todos los estados" },
                            { value: "PENDING", label: "Pendiente" },
                            { value: "APPROVED", label: "Aprobada" },
                            { value: "PAID", label: "Pagada" },
                            { value: "REJECTED", label: "Rechazada" },
                        ]}
                        placeholder="Estado..."
                        accentColor="blue"
                    />
                </div>
                <button
                    onClick={handleNewSettlement}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all duration-200 flex items-center gap-2"
                    style={{ background: "#003DA5" }}
                >
                    <Plus className="w-4 h-4" />
                    Nueva Liquidación
                </button>
                <button
                    onClick={() => dispatch(HandleSocialBenefits({ type: "SETTLEMENTS_GETALL", page: settlementsPage, limit: 20, ...settlementsFilters }))}
                    disabled={settlements.isLoading}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                >
                    <RefreshCw className={`w-4 h-4 ${settlements.isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* List */}
            <div className="flex-1 min-h-0 overflow-hidden">
                <ThemedListWrapper accent="blue">
                    <ThemedHeadingBar
                        table_layout="sm:grid-cols-7"
                        table_headings={["Empleado", "Causa", "Estado", "Total", "Fecha", "Acciones"]}
                        accent="blue"
                    />
                    <ThemedListContainer accent="blue">
                        {settlements.isLoading ? (
                            <div className="flex items-center justify-center h-64">
                                <Loading />
                            </div>
                        ) : settlements.data && settlements.data.length > 0 ? (
                            <>
                                {settlements.data.map((s, index) => (
                                    <div
                                        key={s._id ?? index}
                                        className="grid min-[250px]:grid-cols-2 sm:grid-cols-7 gap-2 px-3 py-3 items-center
                                            border-b last:border-b-0 transition-colors duration-150
                                            border-[#dde5ff] dark:border-[rgba(255,255,255,0.08)]
                                            hover:bg-[#e0f2fe] dark:hover:bg-[rgba(0,61,165,0.08)]"
                                    >
                                        {/* Employee */}
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold
                                                bg-blue-100 text-blue-700
                                                dark:bg-[rgba(0,61,165,0.25)] dark:text-blue-300
                                                border border-blue-200 dark:border-[rgba(0,61,165,0.4)]">
                                                {s.employee?.firstname?.slice(0, 1).toUpperCase()}{s.employee?.lastname?.slice(0, 1).toUpperCase()}
                                            </div>
                                            <p className="text-sm font-semibold truncate text-gray-900 dark:text-white">
                                                {`${s.employee?.firstname} ${s.employee?.lastname}`}
                                            </p>
                                        </div>

                                        {/* Cause */}
                                        <div className="min-[250px]:hidden sm:flex sm:justify-center sm:items-center min-w-0">
                                            <span className="text-sm text-gray-600 dark:text-[rgba(255,255,255,0.55)] truncate max-w-[150px]">
                                                {s.cause?.replace(/_/g, ' ')}
                                            </span>
                                        </div>

                                        {/* Status */}
                                        <div className="hidden sm:block text-center">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
                                                ${s.status === 'PAID' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                  s.status === 'APPROVED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                                  s.status === 'REJECTED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                                {s.status}
                                            </span>
                                        </div>

                                        {/* Total */}
                                        <div className="hidden sm:block text-center font-mono text-sm font-semibold text-gray-900 dark:text-white">
                                            {formatCurrency(s.total_amount)}
                                        </div>

                                        {/* Date */}
                                        <div className="hidden sm:block text-center text-sm text-gray-600 dark:text-[rgba(255,255,255,0.55)]">
                                            {formatDate(s.settlement_date)}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex justify-center items-center gap-1">
                                            <button
                                                onClick={() => handleViewSettlement(s)}
                                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
                                                title="Ver detalle"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            {s.status === 'PENDING' && (
                                                <>
                                                    <button
                                                        onClick={() => handleEditSettlement(s)}
                                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-blue-600 dark:text-blue-400"
                                                        title="Editar"
                                                    >
                                                        <Settings className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleApproveSettlement(s._id)}
                                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-emerald-600 dark:text-emerald-400"
                                                        title="Aprobar"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handlePaySettlement(s._id, { payment_date: new Date().toISOString().split('T')[0], payment_method: 'TRANSFER' })}
                                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-cyan-600 dark:text-cyan-400"
                                                        title="Pagar"
                                                    >
                                                        <DollarSign className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {}}
                                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-red-600 dark:text-red-400"
                                                        title="Rechazar"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-center p-8">
                                <Calculator className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Sin liquidaciones</h3>
                                <p className="text-gray-500 dark:text-gray-400">No hay liquidaciones registradas</p>
                            </div>
                        )}
                    </ThemedListContainer>
                </ThemedListWrapper>

                {/* Pagination */}
                {settlements.pagination?.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 p-4 border-t"
                        style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                        <button
                            onClick={() => setSettlementsPage(p => Math.max(1, p - 1))}
                            disabled={settlementsPage === 1 || settlements.isLoading}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="px-3 py-1.5 text-sm font-medium text-gray-900 dark:text-white">
                            Página {settlementsPage} de {settlements.pagination.totalPages}
                        </span>
                        <button
                            onClick={() => setSettlementsPage(p => Math.min(settlements.pagination.totalPages, p + 1))}
                            disabled={settlementsPage === settlements.pagination.totalPages || settlements.isLoading}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )

    const renderAccrualTab = () => (
        <div className="w-full h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-wrap gap-3 p-4 bg-white dark:bg-[#1a1a2e] border-b transition-colors duration-300"
                style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Coins className="w-5 h-5" style={{ color: "#003DA5" }} />
                        Calcular y Registrar Devengado de Prestaciones
                    </h3>
                </div>
                <button
                    onClick={() => setShowAccrualForm(true)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all duration-200 flex items-center gap-2"
                    style={{ background: "#10b981" }}
                >
                    <Coins className="w-4 h-4" />
                    Nuevo Devengado
                </button>
            </div>

            {/* Recent Accruals List */}
            <div className="flex-1 min-h-0 overflow-hidden">
                <ThemedListWrapper accent="blue">
                    <ThemedHeadingBar
                        table_layout="sm:grid-cols-6"
                        table_headings={["Empleado", "Período", "Días", "Salario Diario", "Monto", "Fecha Registro"]}
                        accent="blue"
                    />
                    <ThemedListContainer accent="blue">
                        {/* Filter to show only ACCRUAL entries from ledger */}
                        {socialBenefitsLedger.isLoading ? (
                            <div className="flex items-center justify-center h-64">
                                <Loading />
                            </div>
                        ) : socialBenefitsLedger.data && socialBenefitsLedger.data.filter(e => e.entry_type === 'ACCRUAL').length > 0 ? (
                            <>
                                {socialBenefitsLedger.data.filter(e => e.entry_type === 'ACCRUAL').map((entry, index) => (
                                    <div
                                        key={entry._id ?? index}
                                        className="grid min-[250px]:grid-cols-2 sm:grid-cols-6 gap-2 px-3 py-3 items-center
                                            border-b last:border-b-0 transition-colors duration-150
                                            border-[#dde5ff] dark:border-[rgba(255,255,255,0.08)]
                                            hover:bg-[#e0f2fe] dark:hover:bg-[rgba(0,61,165,0.08)]"
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold
                                                bg-emerald-100 text-emerald-700
                                                dark:bg-[rgba(16,185,129,0.25)] dark:text-emerald-300
                                                border border-emerald-200 dark:border-[rgba(16,185,129,0.4)]">
                                                {entry.employee?.firstname?.slice(0, 1).toUpperCase()}{entry.employee?.lastname?.slice(0, 1).toUpperCase()}
                                            </div>
                                            <p className="text-sm font-semibold truncate text-gray-900 dark:text-white">
                                                {`${entry.employee?.firstname} ${entry.employee?.lastname}`}
                                            </p>
                                        </div>
                                        <div className="min-[250px]:hidden sm:flex sm:justify-center sm:items-center min-w-0">
                                            {entry.period_start && entry.period_end ? (
                                                <span className="text-sm text-gray-600 dark:text-[rgba(255,255,255,0.55)]">
                                                    {formatDate(entry.period_start)} - {formatDate(entry.period_end)}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-gray-400">—</span>
                                            )}
                                        </div>
                                        <div className="hidden sm:block text-center text-sm font-medium text-emerald-700 dark:text-emerald-400">
                                            {entry.days_accrued || 0}
                                        </div>
                                        <div className="hidden sm:block text-center font-mono text-sm text-cyan-700 dark:text-cyan-400">
                                            {formatCurrency(entry.daily_salary)}
                                        </div>
                                        <div className="hidden sm:block text-center font-mono text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                                            {formatCurrency(entry.amount)}
                                        </div>
                                        <div className="hidden sm:block text-center text-sm text-gray-600 dark:text-[rgba(255,255,255,0.55)]">
                                            {formatDate(entry.createdAt)}
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-center p-8">
                                <Coins className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Sin devengados registrados</h3>
                                <p className="text-gray-500 dark:text-gray-400">Calcule y registre el primer devengado de prestaciones</p>
                            </div>
                        )}
                    </ThemedListContainer>
                </ThemedListWrapper>
            </div>
        </div>
    )

    // ─── Main Render ───
    const renderSubTabContent = () => {
        switch (activeSubTab) {
            case "ledger": return renderLedgerTab()
            case "settlements": return renderSettlementsTab()
            case "accrual": return renderAccrualTab()
            default: return renderLedgerTab()
        }
    }

    return (
        <div className="w-full h-full flex flex-col bg-white dark:bg-[#0f0f1a]">
            {/* Sub-tabs Bar */}
            <div className="flex flex-wrap gap-1 px-4 py-3 border-b transition-colors duration-300"
                style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                {SUB_TABS.map(({ id, label, icon: Icon, description }) => (
                    <button
                        key={id}
                        onClick={() => setActiveSubTab(id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap
                            ${activeSubTab === id
                                ? "text-white shadow-sm"
                                : "hover:bg-gray-100 dark:hover:bg-[rgba(255,255,255,0.05)]"}
                        `}
                        style={{
                            background: activeSubTab === id ? "#003DA5" : "transparent",
                            color: activeSubTab === id ? "#fff" : isDark ? "rgba(255,255,255,0.7)" : "#374151"
                        }}
                        title={description}
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                    </button>
                ))}
            </div>

            {/* Sub-tab Content */}
            <div className="flex-1 min-h-0 overflow-hidden">
                {renderSubTabContent()}
            </div>

            {/* Modals */}
            {selectedLedgerEntry && (
                <LedgerDetailModal
                    entry={selectedLedgerEntry}
                    onClose={() => setSelectedLedgerEntry(null)}
                    isDark={isDark}
                />
            )}

            {selectedSettlement && (
                <SettlementDetailModal
                    settlement={selectedSettlement}
                    onClose={() => setSelectedSettlement(null)}
                    isDark={isDark}
                />
            )}

            <SettlementFormModal
                open={showSettlementForm}
                onClose={() => { setShowSettlementForm(false); setEditingSettlement(null); }}
                onSubmit={handleCreateSettlement}
                onCalculate={handleCalculateSettlement}
                isDark={isDark}
                employees={employees}
                contracts={[]}
                editingSettlement={editingSettlement}
                calculating={calculating}
            />

            <AccrualFormModal
                open={showAccrualForm}
                onClose={() => setShowAccrualForm(false)}
                onCalculate={handleCalculateAccrual}
                onRecord={handleRecordAccrual}
                isDark={isDark}
                employees={employees}
                calculating={calculating}
                recording={recording}
            />
        </div>
    )
}

export default PayrollSocialBenefitsTab