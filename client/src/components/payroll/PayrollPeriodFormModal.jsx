import { useState, useEffect } from "react"
import { X, Calendar, CreditCard, DollarSign, Hash, HelpCircle } from "lucide-react"
import { useIsDark } from "../../hooks/useIsDark.js"

export const PayrollPeriodFormModal = ({ open, onClose, initialData, onSubmit }) => {
    const isDark = useIsDark()
    const [formData, setFormData] = useState({
        name: "",
        start_date: "",
        end_date: "",
        payment_date: "",
        period_type: "NORMAL",
        period_frequency: "QUINCENAL",
        days_count: 15,
        pinned_rate: "",
        pinned_rate_note: "",
    })
    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                start_date: initialData.start_date ? String(initialData.start_date).slice(0, 10) : "",
                end_date: initialData.end_date ? String(initialData.end_date).slice(0, 10) : "",
                payment_date: initialData.payment_date ? String(initialData.payment_date).slice(0, 10) : "",
                period_type: initialData.period_type || "NORMAL",
                period_frequency: initialData.period_frequency || "QUINCENAL",
                days_count: initialData.days_count || 15,
                pinned_rate: initialData.pinned_rate || "",
                pinned_rate_note: initialData.pinned_rate_note || "",
            })
        } else {
            setFormData({
                name: "",
                start_date: "",
                end_date: "",
                payment_date: "",
                period_type: "NORMAL",
                period_frequency: "QUINCENAL",
                days_count: 15,
                pinned_rate: "",
                pinned_rate_note: "",
            })
        }
        setErrors({})
    }, [initialData, open])

    const validate = () => {
        const newErrors = {}
        if (!formData.name.trim()) newErrors.name = "Nombre es requerido"
        if (!formData.start_date) newErrors.start_date = "Fecha de inicio es requerida"
        if (!formData.end_date) newErrors.end_date = "Fecha de fin es requerida"
        if (!formData.payment_date) newErrors.payment_date = "Fecha de pago es requerida"
        if (formData.days_count < 1) newErrors.days_count = "Días debe ser mayor a 0"
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return
        setIsSubmitting(true)
        try {
            await onSubmit(formData)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }))
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
            onClick={onClose}>
            <div className="w-full max-w-2xl rounded-2xl p-6 shadow-2xl animate-slide-up
                bg-white dark:bg-[#1a1a2e] border
                border-gray-200 dark:border-[rgba(255,255,255,0.08)] max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                            {initialData ? "Editar Período" : "Nuevo Período de Nómina"}
                        </h3>
                        <p className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#6b7280" }}>
                            {initialData ? "Modifica los datos del período" : "Configura un nuevo período para calcular la nómina"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl transition-all duration-200 hover:bg-gray-100 dark:hover:bg-[rgba(255,255,255,0.05)]"
                        style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#9ca3af" }}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
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
                                        dark:placeholder-[rgba(255,255,255,0.25)] dark:focus:border-[rgba(0,61,165,0.5)]`}
                                />
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
                                    dark:placeholder-[rgba(255,255,255,0.25)] dark:focus:border-[rgba(0,61,165,0.5)]`}>
                            </textarea>
                        </div>
                    </fieldset>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-[rgba(255,255,255,0.08)] pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                                bg-gray-100 text-gray-700 hover:bg-gray-200
                                dark:bg-[rgba(255,255,255,0.05)] dark:text-gray-300 dark:hover:bg-[rgba(255,255,255,0.1)]"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                            style={{ background: "#003DA5" }}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    {initialData ? "Actualizar" : "Crear"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}