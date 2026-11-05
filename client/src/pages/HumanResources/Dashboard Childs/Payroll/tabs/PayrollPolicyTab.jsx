import { useEffect, useState, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { HandlePayrollPolicy } from "../../../../../redux/Thunks/PayrollThunk.js"
import { useIsDark } from "../../../../../hooks/useIsDark.js"
import { useHRAuth } from "../../../../../hooks/useHRAuth.js"
import { Loader2, Settings, AlertCircle, CheckCircle, Edit, ChevronRight, Save, X } from "lucide-react"

const SECTIONS = [
    {
        id: "legal_rates",
        label: "Tasas Legales",
        icon: Settings,
        model: "policy",
        fields: [
            { key: "minimum_wage_ves", label: "Salario Mínimo (VES)", type: "number", step: 0.01, min: 0, help: "Salario mínimo mensual vigente en VES" },
            { key: "ivss_employee_rate", label: "IVSS Empleado (%)", type: "number", step: 0.01, min: 0, max: 100, help: "Aporte del empleado al IVSS (4% por defecto)" },
            { key: "ivss_employer_rate", label: "IVSS Patronal (%)", type: "number", step: 0.01, min: 0, max: 100, help: "Aporte del empleador al IVSS (9% por defecto)" },
            { key: "ivss_salary_cap_multiplier", label: "Tope IVSS (x salario mínimo)", type: "number", step: 1, min: 1, help: "Múltiplo del salario mínimo para tope de cotización IVSS (5x por defecto)" },
            { key: "faov_employee_rate", label: "FAOV Empleado (%)", type: "number", step: 0.01, min: 0, max: 100, help: "Aporte del empleado al FAOV (1% por defecto)" },
            { key: "faov_employer_rate", label: "FAOV Patronal (%)", type: "number", step: 0.01, min: 0, max: 100, help: "Aporte del empleador al FAOV (2% por defecto)" },
            { key: "faov_employer_base_formula", label: "Base FAOV Patronal", type: "select", options: ["SALARIO_MENSUAL", "SALARIO_DIARIO", "SALARIO_INTEGRAL"], help: "Fórmula base para cálculo aporte patronal FAOV" },
            { key: "rpe_employee_rate", label: "RPE Empleado (%)", type: "number", step: 0.01, min: 0, max: 100, help: "Aporte del empleado al RPE (0.5% por defecto)" },
            { key: "rpe_employer_rate", label: "RPE Patronal (%)", type: "number", step: 0.01, min: 0, max: 100, help: "Aporte del empleador al RPE (2% por defecto)" },
            { key: "lppss_rate", label: "LPSSS (%)", type: "number", step: 0.01, min: 0, max: 100, help: "Ley Orgánica de Prevención, Condiciones y Medio Ambiente de Trabajo (9% por defecto)" },
            { key: "imii_usd", label: "IMII (USD)", type: "number", step: 0.01, min: 0, help: "Ingreso Mínimo Indexado en USD (130 USD por defecto)" },
            { key: "inces_employer_rate", label: "INCES Patronal (%)", type: "number", step: 0.01, min: 0, max: 100, help: "Aporte del empleador al INCES (2% por defecto)" },
            { key: "cestaticket_amount_usd", label: "Cestaticket (USD)", type: "number", step: 0.01, min: 0, help: "Valor diario del cestaticket en USD (40 USD por defecto)" },
            { key: "ut_value_ves", label: "UT (VES)", type: "number", step: 0.01, min: 0, help: "Valor de la Unidad Tributaria en VES (9 VES por defecto)" },
            { key: "exchange_rate_source", label: "Fuente Tasa Cambio", type: "select", options: ["BCV", "PARALELO", "MANUAL"], help: "Fuente oficial para tasa de cambio" },
        ]
    },
    {
        id: "payout_factors",
        label: "Factores de Pago",
        icon: Settings,
        model: "policy",
        fields: [
            { key: "holiday_payout_factor", label: "Factor Día Festivo", type: "number", step: 0.01, min: 1, help: "Multiplicador para pago de días festivos (1.5x por defecto)" },
            { key: "rest_day_payout_factor", label: "Factor Día Descanso", type: "number", step: 0.01, min: 1, help: "Multiplicador para pago de días de descanso (1.5x por defecto)" },
            { key: "overtime_day_factor", label: "Factor Horas Extra Diurnas", type: "number", step: 0.01, min: 1, help: "Multiplicador para horas extra diurnas (1.5x por defecto)" },
            { key: "overtime_night_factor", label: "Factor Horas Extra Nocturnas", type: "number", step: 0.01, min: 1, help: "Multiplicador para horas extra nocturnas (1.5x por defecto)" },
            { key: "night_bonus_rate", label: "Bono Nocturno (%)", type: "number", step: 0.01, min: 0, max: 100, help: "Porcentaje adicional por trabajo nocturno (30% por defecto)" },
        ]
    },
    {
        id: "vacations",
        label: "Vacaciones",
        icon: Settings,
        model: "policy",
        fields: [
            { key: "vacation_days_base", label: "Días Base Vacaciones", type: "number", step: 1, min: 0, help: "Días de vacaciones base al cumplir 1 año (15 por defecto)" },
            { key: "vacation_days_per_year", label: "Días Adicionales por Año", type: "number", step: 1, min: 0, help: "Días extra por cada año adicional de servicio (1 por defecto)" },
            { key: "vacation_days_max", label: "Máximo Días Vacaciones", type: "number", step: 1, min: 0, help: "Tope máximo de días de vacaciones (30 por defecto)" },
            { key: "vacation_bonus_days_base", label: "Días Base Bono Vacacional", type: "number", step: 1, min: 0, help: "Días base para cálculo del bono vacacional (15 por defecto)" },
            { key: "vacation_bonus_days_per_year", label: "Días Bono por Año", type: "number", step: 1, min: 0, help: "Días extra de bono por cada año adicional (1 por defecto)" },
            { key: "vacation_bonus_days_max", label: "Máximo Días Bono Vacacional", type: "number", step: 1, min: 0, help: "Tope máximo de días de bono vacacional (30 por defecto)" },
            { key: "min_service_months", label: "Antigüedad Mínima (meses)", type: "number", step: 1, min: 1, help: "Meses de servicio mínimos para derecho a vacaciones (12 por defecto)" },
            { key: "pay_rest_days", label: "Pagar Días Descanso en Vacaciones", type: "boolean", help: "Incluir pago de días de descanso durante vacaciones" },
            { key: "pay_holidays", label: "Pagar Festivos en Vacaciones", type: "boolean", help: "Incluir pago de días festivos durante vacaciones" },
            { key: "accrual_mode", label: "Modo Acumulación", type: "select", options: ["ANNUAL", "MONTHLY", "DAILY"], help: "Modo de acumulación de días de vacaciones" },
            { key: "vacation_salary_basis", label: "Base Salarial Vacaciones", type: "select", options: ["LAST_SALARY", "AVERAGE_3M", "AVERAGE_6M", "BEST_YEAR"], help: "Base para cálculo salarial de vacaciones" },
            { key: "vacation_salary_source", label: "Fuente Salarial", type: "select", options: ["BASE_SALARY", "TOTAL_SALARY"], help: "Usar salario base o salario total para vacaciones" },
            { key: "cestaticket_pay_on_vacation", label: "Cestaticket en Vacaciones", type: "boolean", help: "Pagar cestaticket durante período vacacional" },
            { key: "cestaticket_separate_period", label: "Cestaticket Período Separado", type: "boolean", help: "Pagar cestaticket en período separado al vacacional" },
        ]
    },
    {
        id: "salary_split",
        label: "Split Salarial",
        icon: Settings,
        model: "both",
        fields: [
            { key: "salary_split_mode", label: "Modo Split", type: "select", options: ["MIXTO", "BASE_COMPLEMENT", "TOTAL_BASE"], help: "Modo de división salarial: Mixto, Base+Complemento, Total Base" },
            { key: "split_percentage_base", label: "% Base en Split Mixto", type: "number", step: 0.01, min: 0, max: 100, help: "Porcentaje asignado a salario base en modo mixto (60% por defecto)" },
        ]
    },
    {
        id: "general_config",
        label: "Configuración General",
        icon: Settings,
        model: "both",
        fields: [
            { key: "rest_weekdays", label: "Días de Descanso (0=Dom...6=Sáb)", type: "text", help: "Array JSON de días de descanso, ej: [5,6] para Sábado/Domingo" },
            { key: "seniority_cap_years", label: "Tope Antigüedad (años)", type: "number", step: 1, min: 0, help: "Años máximos para cálculo de antigüedad/prestaciones (30 por defecto)" },
            { key: "include_cestaticket_in_benefits", label: "Incluir Cestaticket en Prestaciones", type: "boolean", help: "Considerar cestaticket para cálculo de prestaciones sociales" },
            { key: "include_commissions_in_benefits", label: "Incluir Comisiones en Prestaciones", type: "boolean", help: "Considerar comisiones para cálculo de prestaciones sociales" },
            { key: "include_bonuses_in_benefits", label: "Incluir Bonos en Prestaciones", type: "boolean", help: "Considerar bonos para cálculo de prestaciones sociales" },
            { key: "include_overtime_in_benefits", label: "Incluir Horas Extra en Prestaciones", type: "boolean", help: "Considerar horas extra para cálculo de prestaciones sociales" },
            { key: "include_utilidades_in_benefits", label: "Incluir Utilidades en Prestaciones", type: "boolean", help: "Considerar utilidades para cálculo de prestaciones sociales" },
        ]
    }
]

const formatValue = (value, field) => {
    if (value === null || value === undefined) return "—"
    if (field.type === "boolean") return value ? "Sí" : "No"
    if (field.type === "number" && field.key?.includes("rate") || field.key?.includes("factor") || field.key?.includes("percentage") || field.key?.includes("bonus")) {
        return `${value}%`
    }
    if (field.type === "number" && (field.key?.includes("_usd") || field.key?.includes("_ves") || field.key?.includes("cestaticket") || field.key?.includes("imii") || field.key?.includes("minimum_wage") || field.key?.includes("ut_value"))) {
        const currency = field.key?.includes("_usd") || field.key?.includes("cestaticket") || field.key?.includes("imii") ? "USD" : "VES"
        return `${currency} ${value.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    if (field.type === "number") {
        return value.toLocaleString('es-VE')
    }
    if (field.key === "rest_weekdays" && Array.isArray(value)) {
        const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
        return value.map(d => days[d]).join(", ")
    }
    return String(value)
}

const getFieldConfig = (field, isDark) => {
    const baseInput = `w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
        focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
        dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
        dark:placeholder-[rgba(255,255,255,0.25)] dark:focus:border-[rgba(0,61,165,0.5)]`

    if (field.type === "select") {
        return { component: "select", className: baseInput }
    }
    if (field.type === "boolean") {
        return { component: "checkbox", className: "w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 dark:border-[rgba(255,255,255,0.2)] dark:bg-[rgba(255,255,255,0.04)]" }
    }
    return { component: "input", className: baseInput, inputType: field.type === "number" ? "number" : "text" }
}

export const PayrollPolicyTab = () => {
    const isDark = useIsDark()
    const dispatch = useDispatch()
    const { can, isReady } = useHRAuth()

    const policy = useSelector((state) => state.payrollReducer.policy.data)
    const companyConfig = useSelector((state) => state.payrollReducer.companyConfig.data)
    const policyLoading = useSelector((state) => state.payrollReducer.policy.isLoading)
    const companyLoading = useSelector((state) => state.payrollReducer.companyConfig.isLoading)
    const policyError = useSelector((state) => state.payrollReducer.policy.error)
    const companyError = useSelector((state) => state.payrollReducer.companyConfig.error)

    const [expandedSection, setExpandedSection] = useState(null)
    const [editSection, setEditSection] = useState(null)
    const [formData, setFormData] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState(null)
    const [hasChanges, setHasChanges] = useState(false)

    useEffect(() => {
        dispatch(HandlePayrollPolicy({ type: "POLICY_GET" }))
        dispatch(HandlePayrollPolicy({ type: "COMPANY_GET" }))
    }, [dispatch])

    useEffect(() => {
        if (policy && companyConfig) {
            const initial = { ...policy, ...companyConfig }
            setFormData(initial)
        }
    }, [policy, companyConfig])

    const getModelData = (model) => {
        if (model === "policy") return policy
        if (model === "company") return companyConfig
        return { ...policy, ...companyConfig }
    }

    const getSectionData = (section) => {
        const modelData = getModelData(section.model)
        return section.fields.map(f => ({
            ...f,
            value: modelData?.[f.key]
        }))
    }

    const handleInputChange = (sectionId, fieldKey, value) => {
        setFormData(prev => ({ ...prev, [fieldKey]: value }))
        setHasChanges(true)
    }

    const handleSubmit = async (sectionId) => {
        const section = SECTIONS.find(s => s.id === sectionId)
        if (!section) return

        setIsSubmitting(true)
        setSubmitError(null)

        try {
            const sectionData = getSectionData(section)
            const payload = {}
            sectionData.forEach(f => {
                if (formData[f.key] !== undefined) {
                    payload[f.key] = formData[f.key]
                }
            })

            const endpointType = section.model === "company" ? "COMPANY_UPDATE" : "POLICY_UPDATE"
            await dispatch(HandlePayrollPolicy({ type: endpointType, data: payload })).unwrap()

            setEditSection(null)
            setHasChanges(false)
        } catch (error) {
            setSubmitError(error.message || "Error al guardar")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = () => {
        if (policy && companyConfig) {
            setFormData({ ...policy, ...companyConfig })
        }
        setEditSection(null)
        setHasChanges(false)
        setSubmitError(null)
    }

    if (policyError || companyError) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8">
                <div className="text-center text-red-500">
                    <p className="font-bold">Error cargando políticas</p>
                    <p className="text-sm text-gray-500">{policyError || companyError}</p>
                </div>
            </div>
        )
    }

    const isLoading = policyLoading || companyLoading

    return (
        <div className="w-full h-full flex flex-col gap-6 px-4 py-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#003DA5" }}>
                        Nómina Venezolana
                    </p>
                    <h1 className="text-2xl xl:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Políticas de Nómina
                    </h1>
                </div>

                {isReady && can("payroll", "update") && hasChanges && (
                    <button
                        onClick={() => setEditSection("all")}
                        disabled={isSubmitting}
                        className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 text-white flex items-center gap-2"
                        style={{ background: "#003DA5" }}
                    >
                        <Save className="w-4 h-4" />
                        Guardar Todo
                    </button>
                )}
            </div>

            {/* Divider */}
            <div className="h-px w-full transition-colors duration-300"
                style={{ background: isDark ? "rgba(0,61,165,0.08)" : "rgba(0,61,165,0.15)" }} />

            {/* Content */}
            <div className="flex-1 min-h-0 overflow-auto">
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                            <p className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                Cargando políticas...
                            </p>
                        </div>
                    </div>
                ) : !policy && !companyConfig ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center transition-colors duration-300"
                            style={{ background: isDark ? "rgba(0,61,165,0.1)" : "rgba(0,61,165,0.1)" }}>
                            <Settings className="w-8 h-8 transition-colors duration-300" style={{ color: "#003DA5" }} />
                        </div>
                        <div className="text-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sin configuración</h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                No se encontró configuración de políticas de nómina
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {SECTIONS.map((section) => {
                            const sectionData = getSectionData(section)
                            const isEditing = editSection === section.id || editSection === "all"
                            const Icon = section.icon

                            return (
                                <div
                                    key={section.id}
                                    className={`bg-white dark:bg-[#0f0f1a] rounded-2xl border transition-all duration-200
                                        ${isEditing ? "ring-2 ring-blue-500/50 shadow-lg" : "hover:shadow-md"}
                                    `}
                                    style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}
                                >
                                    {/* Section Header */}
                                    <div className="flex items-center justify-between p-4 border-b transition-colors duration-300"
                                        style={{ borderColor: isDark ? "rgba(0,61,165,0.1)" : "rgba(0,61,165,0.15)" }}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                                style={{ background: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.1)" }}>
                                                <Icon className="w-5 h-5" style={{ color: "#003DA5" }} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {section.label}
                                                </h3>
                                                <p className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                                    {section.fields.length} campos
                                                </p>
                                            </div>
                                        </div>
                                        {isReady && can("payroll", "update") && !isEditing && (
                                            <button
                                                onClick={() => setEditSection(section.id)}
                                                className="p-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                                                style={{
                                                    background: isDark ? "rgba(0,61,165,0.1)" : "rgba(0,61,165,0.1)",
                                                    color: "#003DA5"
                                                }}
                                                title="Editar sección"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Section Content */}
                                    <div className="p-4">
                                        {isEditing ? (
                                            <div className="space-y-4">
                                                {sectionData.map((field) => {
                                                    const config = getFieldConfig(field, isDark)

                                                    return (
                                                        <div key={field.key} className="flex flex-col gap-1.5">
                                                            <label className="flex items-center gap-2 text-sm font-medium"
                                                                style={{ color: isDark ? "rgba(255,255,255,0.8)" : "#374151" }}>
                                                                <span>{field.label}</span>
                                                                {field.help && (
                                                                    <span className="text-[10px] px-1.5 py-0.5 rounded"
                                                                        style={{
                                                                            background: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.1)",
                                                                            color: "#003DA5",
                                                                            border: isDark ? "1px solid rgba(0,61,165,0.3)" : "1px solid rgba(0,61,165,0.2)"
                                                                        }}
                                                                        title={field.help}
                                                                    >
                                                                        ?
                                                                    </span>
                                                                )}
                                                            </label>

                                                            {config.component === "select" && (
                                                                <select
                                                                    value={formData[field.key] ?? ""}
                                                                    onChange={(e) => handleInputChange(section.id, field.key, e.target.value)}
                                                                    disabled={isSubmitting}
                                                                    className={config.className}
                                                                >
                                                                    <option value="">Seleccionar...</option>
                                                                    {field.options?.map(opt => (
                                                                        <option key={opt} value={opt}>{opt}</option>
                                                                    ))}
                                                                </select>
                                                            )}

                                                            {config.component === "input" && (
                                                                <input
                                                                    type={config.inputType}
                                                                    value={formData[field.key] ?? ""}
                                                                    onChange={(e) => {
                                                                        let val = e.target.value
                                                                        if (field.type === "number") {
                                                                            val = val === "" ? "" : parseFloat(val)
                                                                        }
                                                                        handleInputChange(section.id, field.key, val)
                                                                    }}
                                                                    step={field.step}
                                                                    min={field.min}
                                                                    max={field.max}
                                                                    disabled={isSubmitting}
                                                                    className={config.className}
                                                                    placeholder={field.placeholder}
                                                                />
                                                            )}

                                                            {config.component === "checkbox" && (
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={formData[field.key] ?? false}
                                                                        onChange={(e) => handleInputChange(section.id, field.key, e.target.checked)}
                                                                        disabled={isSubmitting}
                                                                        className={config.className}
                                                                    />
                                                                    <span className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#6b7280" }}>
                                                                        {field.help}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}

                                                {/* Submit buttons for single section edit */}
                                                {editSection !== "all" && (
                                                    <div className="flex justify-end gap-2 pt-4 border-t"
                                                        style={{ borderColor: isDark ? "rgba(0,61,165,0.1)" : "rgba(0,61,165,0.15)" }}>
                                                        {submitError && (
                                                            <div className="flex items-center gap-1.5 text-sm text-red-500 mr-auto">
                                                                <AlertCircle className="w-4 h-4" />
                                                                {submitError}
                                                            </div>
                                                        )}
                                                        <button
                                                            onClick={handleCancel}
                                                            disabled={isSubmitting}
                                                            className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                                                            style={{
                                                                background: isDark ? "rgba(255,255,255,0.05)" : "#f3f4f6",
                                                                color: isDark ? "rgba(255,255,255,0.6)" : "#6b7280"
                                                            }}
                                                        >
                                                            Cancelar
                                                        </button>
                                                        <button
                                                            onClick={() => handleSubmit(section.id)}
                                                            disabled={isSubmitting}
                                                            className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 text-white flex items-center gap-2"
                                                            style={{ background: "#003DA5" }}
                                                        >
                                                            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                                            Guardar
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {sectionData.map((field) => (
                                                    <div key={field.key} className="flex items-center justify-between py-2 border-b last:border-b-0"
                                                        style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
                                                        <div className="flex flex-col gap-0.5 min-w-0">
                                                            <span className="text-sm font-medium truncate"
                                                                style={{ color: isDark ? "rgba(255,255,255,0.8)" : "#374151" }}>
                                                                {field.label}
                                                            </span>
                                                            {field.help && (
                                                                <span className="text-xs truncate" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }}>
                                                                    {field.help}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-sm font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap ml-4 shrink-0">
                                                            {formatValue(formData[field.key] ?? field.value, field)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}

                        {/* Submit buttons for "Guardar Todo" mode */}
                        {editSection === "all" && (
                            <div className="lg:col-span-2 xl:col-span-3">
                                <div className="bg-white dark:bg-[#0f0f1a] rounded-2xl border p-4"
                                    style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-sm" style={{ color: isDark ? "rgba(255,255,255,0.7)" : "#4b5563" }}>
                                            <AlertCircle className="w-5 h-5 text-amber-500" />
                                            <span>Editando todas las secciones. Los cambios se guardarán en lote.</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleCancel}
                                                disabled={isSubmitting}
                                                className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                                                style={{
                                                    background: isDark ? "rgba(255,255,255,0.05)" : "#f3f4f6",
                                                    color: isDark ? "rgba(255,255,255,0.6)" : "#6b7280"
                                                }}
                                            >
                                                <X className="w-4 h-4 inline mr-1" />
                                                Cancelar Todo
                                            </button>
                                            <button
                                                onClick={() => SECTIONS.forEach(s => handleSubmit(s.id))}
                                                disabled={isSubmitting}
                                                className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 text-white flex items-center gap-2"
                                                style={{ background: "#003DA5" }}
                                            >
                                                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                                <Save className="w-4 h-4" />
                                                Guardar Todo
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default PayrollPolicyTab