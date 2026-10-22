import { X } from "lucide-react"
import { Calendar, DollarSign, Hash, HelpCircle } from "lucide-react"

export const PayrollPeriodFormFields = ({
    formData,
    errors,
    handleChange,
    isDark,
}) => {
    return (
        <>
            {/* Información Básica */}
            <fieldset className="space-y-4">
                <legend className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Información Básica
                </legend>

                <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nombre del Período <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Ej: Quincena 1 - Enero 2025"
                        className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200
                            bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                            focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                            dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                            dark:placeholder-[rgba(255,255,255,0.25)] dark:focus:border-[rgba(0,61,165,0.5)]
                            ${errors.name ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}`}
                    />
                    {errors.name && <p className="text-xs text-red-500 flex items-center gap-1"><X className="w-3 h-3" /> {errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Fecha de Inicio <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                                style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#9ca3af" }} />
                            <input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => handleChange("start_date", e.target.value)}
                                className={`w-full rounded-xl px-10 py-2.5 text-sm outline-none transition-all duration-200
                                    bg-gray-50 border border-gray-200 text-gray-900
                                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                                    dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                    dark:focus:border-[rgba(0,61,165,0.5)]
                                    ${errors.start_date ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}`}
                            />
                        </div>
                        {errors.start_date && <p className="text-xs text-red-500 flex items-center gap-1"><X className="w-3 h-3" /> {errors.start_date}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Fecha de Fin <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                                style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#9ca3af" }} />
                            <input
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => handleChange("end_date", e.target.value)}
                                className={`w-full rounded-xl px-10 py-2.5 text-sm outline-none transition-all duration-200
                                    bg-gray-50 border border-gray-200 text-gray-900
                                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                                    dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                    dark:focus:border-[rgba(0,61,165,0.5)]
                                    ${errors.end_date ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}`}
                            />
                        </div>
                        {errors.end_date && <p className="text-xs text-red-500 flex items-center gap-1"><X className="w-3 h-3" /> {errors.end_date}</p>}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Fecha de Pago <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                            style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#9ca3af" }} />
                        <input
                            type="date"
                            value={formData.payment_date}
                            onChange={(e) => handleChange("payment_date", e.target.value)}
                            className={`w-full rounded-xl px-10 py-2.5 text-sm outline-none transition-all duration-200
                                bg-gray-50 border border-gray-200 text-gray-900
                                focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                                dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                dark:focus:border-[rgba(0,61,165,0.5)]
                                ${errors.payment_date ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}`}
                        />
                    </div>
                    {errors.payment_date && <p className="text-xs text-red-500 flex items-center gap-1"><X className="w-3 h-3" /> {errors.payment_date}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Tipo de Período
                        </label>
                        <select
                            value={formData.period_type}
                            onChange={(e) => handleChange("period_type", e.target.value)}
                            className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200
                                bg-gray-50 border border-gray-200 text-gray-900
                                focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                                dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                dark:focus:border-[rgba(0,61,165,0.5)]`}>
                            <option value="NORMAL">Normal</option>
                            <option value="EXTRAORDINARY">Extraordinario</option>
                            <option value="VACATION">Vacaciones</option>
                            <option value="UTILIDADES">Utilidades</option>
                            <option value="SETTLEMENT">Liquidación</option>
                            <option value="ADJUSTMENT">Ajuste</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Frecuencia
                        </label>
                        <select
                            value={formData.period_frequency}
                            onChange={(e) => handleChange("period_frequency", e.target.value)}
                            className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200
                                bg-gray-50 border border-gray-200 text-gray-900
                                focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                                dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                dark:focus:border-[rgba(0,61,165,0.5)]`}>
                            <option value="WEEKLY">Semanal</option>
                            <option value="BIWEEKLY">Quincenal</option>
                            <option value="QUINCENAL">Quincenal (15 días)</option>
                            <option value="MONTHLY">Mensual</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Días del Período
                        </label>
                        <input
                            type="number"
                            value={formData.days_count}
                            onChange={(e) => handleChange("days_count", parseInt(e.target.value) || 0)}
                            min="1"
                            max="31"
                            className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200
                                bg-gray-50 border border-gray-200 text-gray-900
                                focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                                dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                dark:focus:border-[rgba(0,61,165,0.5)]
                                ${errors.days_count ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}`}
                        />
                        {errors.days_count && <p className="text-xs text-red-500 flex items-center gap-1"><X className="w-3 h-3" /> {errors.days_count}</p>}
                    </div>
                </div>
            </fieldset>

            {/* Configuración Avanzada */}
            <fieldset className="space-y-4 border-t border-gray-200 dark:border-[rgba(255,255,255,0.08)] pt-6">
                <legend className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Hash className="w-4 h-4" style={{ color: "#003DA5" }} />
                    Configuración Avanzada (Opcional)
                </legend>

                <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        Tasa de Cambio Fijada (BS/USD)
                        <HelpCircle className="w-4 h-4 text-gray-400" title="Si se especifica, se usará esta tasa para todos los cálculos del período en lugar de la tasa BCV del día" />
                    </label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                            style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#9ca3af" }} />
                        <input
                            type="number"
                            step="0.01"
                            value={formData.pinned_rate}
                            onChange={(e) => handleChange("pinned_rate", e.target.value ? parseFloat(e.target.value) : "")}
                            placeholder="Ej: 36.50"
                            className={`w-full rounded-xl px-10 py-2.5 text-sm outline-none transition-all duration-200
                                bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                                focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                                dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                dark:placeholder-[rgba(255,255,255,0.25)] dark:focus:border-[rgba(0,61,165,0.5)]`} />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nota de la Tasa Fijada
                    </label>
                    <textarea
                        value={formData.pinned_rate_note}
                        onChange={(e) => handleChange("pinned_rate_note", e.target.value)}
                        placeholder="Motivo de la tasa fijada, referencia oficial, etc."
                        rows={2}
                        className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200
                            bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 resize-none
                            focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                            dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                            dark:placeholder-[rgba(255,255,255,0.25)] dark:focus:border-[rgba(0,61,165,0.5)]`} />
                </div>
            </fieldset>
        </>
    )
}

export default PayrollPeriodFormFields