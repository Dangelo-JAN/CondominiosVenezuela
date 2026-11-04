import { useEffect, useState, useCallback, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useIsDark } from "../../hooks/useIsDark.js"
import { HandlePayrollConcepts } from "../../redux/Thunks/PayrollThunk.js"
import { CustomSelect } from "../ui/custom-select.jsx"
import { Settings, AlertTriangle, CheckCircle, XCircle, Loader2, Zap, Database, Calculator, FileText, HelpCircle } from "lucide-react"

export const ConceptFormModal = ({
    open,
    onClose,
    initialData,
    receiptTypes = [],
    onSubmit,
    isSubmitting = false
}) => {
    const isDark = useIsDark()
    const dispatch = useDispatch()
    const { data: concepts } = useSelector((state) => state.payrollReducer.concepts)

    // ===== FORM STATE =====
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        description: "",
        kind: "INCOME",
        computation_method: "FIXED_AMOUNT",
        value: 0,
        currency_id: "",
        formula: "",
        system_params: {},
        calculation_base: "GROSS",
        behavior: "FIXED",
        rules: {},
        incidences: [],
        is_salary_incidence: false,
        is_system: false,
        is_novelty_eligible: true,
        deducts_from_base_salary: false,
        adds_to_complement: false,
        replaces_base_salary: false,
        tipo_recibo: "",
        receipt_order: 0,
        show_on_payslip: true,
        appears_on_receipt: true,
        show_even_if_zero: false,
        unit_label: "BS",
        active: true
    })

    const [errors, setErrors] = useState({})
    const [formulaValidation, setFormulaValidation] = useState(null)
    const [validatingFormula, setValidatingFormula] = useState(false)
    const [touched, setTouched] = useState({})

    // ===== OPTIONS (memoized) =====
    const kindOptions = useMemo(() => [
        { value: "INCOME", label: "Ingresos" },
        { value: "DEDUCTION", label: "Deducciones" },
        { value: "EMPLOYER_COST", label: "Costos Patronales" },
        { value: "INFORMATIONAL", label: "Informativos" },
    ], [])

    const computationMethodOptions = useMemo(() => [
        { value: "FIXED_AMOUNT", label: "Monto Fijo" },
        { value: "PERCENTAGE_OF_BASIC", label: "% del Básico" },
        { value: "DYNAMIC_FORMULA", label: "Fórmula Dinámica" },
        { value: "TABLE", label: "Tabla" },
        { value: "EXTERNAL_API", label: "API Externa" },
    ], [])

    const calculationBaseOptions = useMemo(() => [
        { value: "GROSS", label: "Bruto" },
        { value: "BASE_SALARY", label: "Salario Base" },
        { value: "NET", label: "Neto" },
        { value: "TAXABLE", label: "Gravable" },
        { value: "UT", label: "UT" },
        { value: "CUSTOM", label: "Personalizada" },
    ], [])

    const behaviorOptions = useMemo(() => [
        { value: "FIXED", label: "Fijo" },
        { value: "VARIABLE", label: "Variable" },
        { value: "NOVELTY", label: "Novedad" },
        { value: "OVERTIME", label: "Horas Extra" },
        { value: "BONUS", label: "Bono" },
        { value: "COMMISSION", label: "Comisión" },
        { value: "ALLOWANCE", label: "Asignación" },
    ], [])

    const unitLabelOptions = useMemo(() => [
        { value: "DÍAS", label: "Días" },
        { value: "HORAS", label: "Horas" },
        { value: "UNIDADES", label: "Unidades" },
        { value: "%", label: "Porcentaje" },
        { value: "BS", label: "Bs." },
        { value: "USD", label: "USD" },
    ], [])

    const incidencesOptions = useMemo(() => [
        { value: "IVSS", label: "IVSS" },
        { value: "FAOV", label: "FAOV" },
        { value: "RPE", label: "RPE" },
        { value: "INCES", label: "INCES" },
        { value: "LPPSS", label: "LPPSS" },
        { value: "BANVIH", label: "BANVIH" },
        { value: "PRESTACIONES", label: "Prestaciones" },
        { value: "VACACIONES", label: "Vacaciones" },
        { value: "UTILIDADES", label: "Utilidades" },
        { value: "CESTATICKET", label: "Cestaticket" },
        { value: "ISLR", label: "ISLR" },
    ], [])

    // ===== INITIALIZE FORM =====
    useEffect(() => {
        if (initialData) {
            setFormData({
                ...formData,
                ...initialData,
                system_params: initialData.system_params || {},
                rules: initialData.rules || {},
                incidences: initialData.incidences || [],
            })
            setFormulaValidation(null)
        } else {
            setFormData({
                code: "",
                name: "",
                description: "",
                kind: "INCOME",
                computation_method: "FIXED_AMOUNT",
                value: 0,
                currency_id: "",
                formula: "",
                system_params: {},
                calculation_base: "GROSS",
                behavior: "FIXED",
                rules: {},
                incidences: [],
                is_salary_incidence: false,
                is_system: false,
                is_novelty_eligible: true,
                deducts_from_base_salary: false,
                adds_to_complement: false,
                replaces_base_salary: false,
                tipo_recibo: "",
                receipt_order: 0,
                show_on_payslip: true,
                appears_on_receipt: true,
                show_even_if_zero: false,
                unit_label: "BS",
                active: true
            })
            setErrors({})
            setFormulaValidation(null)
            setTouched({})
        }
    }, [initialData, open])

    // ===== FORMULA VALIDATION =====
    const validateFormula = useCallback(async (formulaValue) => {
        if (!formulaValue || formulaValue.trim() === "") {
            setFormulaValidation({ valid: true, message: "" })
            return
        }

        setValidatingFormula(true)
        try {
            const result = await dispatch(HandlePayrollConcepts({ 
                type: "VALIDATE_FORMULA", 
                formula: formulaValue 
            })).unwrap()
            setFormulaValidation(result.data)
        } catch (error) {
            setFormulaValidation({ valid: false, error: error?.message || "Error validando fórmula" })
        } finally {
            setValidatingFormula(false)
        }
    }, [dispatch])

    useEffect(() => {
        if (formData.computation_method === "DYNAMIC_FORMULA") {
            const timer = setTimeout(() => validateFormula(formData.formula), 500)
            return () => clearTimeout(timer)
        } else {
            setFormulaValidation(null)
        }
    }, [formData.formula, formData.computation_method, validateFormula])

    // ===== HANDLERS =====
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }))
        setTouched(prev => ({ ...prev, [field]: true }))
    }

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }))
        validateField(field, formData[field])
    }

    const validateField = (field, value) => {
        const newErrors = { ...errors }
        switch (field) {
            case "code":
                if (!value?.trim()) newErrors.code = "Código es requerido"
                else if (!/^[A-Z0-9_]+$/.test(value)) newErrors.code = "Solo mayúsculas, números y guión bajo"
                else if (!initialData && concepts?.some(c => c.code === value.toUpperCase())) newErrors.code = "Ya existe un concepto con este código"
                break
            case "name":
                if (!value?.trim()) newErrors.name = "Nombre es requerido"
                else if (value.length < 3) newErrors.name = "Mínimo 3 caracteres"
                break
            case "kind":
                if (!value) newErrors.kind = "Tipo es requerido"
                break
            case "computation_method":
                if (!value) newErrors.computation_method = "Método es requerido"
                break
            case "value":
                if (["FIXED_AMOUNT", "PERCENTAGE_OF_BASIC"].includes(formData.computation_method)) {
                    if (value === "" || value === null) newErrors.value = "Valor es requerido"
                    else if (isNaN(value)) newErrors.value = "Debe ser un número"
                    else if (formData.computation_method === "PERCENTAGE_OF_BASIC" && (value < 0 || value > 100)) newErrors.value = "Porcentaje debe ser entre 0 y 100"
                }
                break
            case "formula":
                if (formData.computation_method === "DYNAMIC_FORMULA" && !value?.trim()) newErrors.formula = "Fórmula es requerida"
                break
            case "receipt_order":
                if (value === "" || value === null) newErrors.receipt_order = "Orden es requerido"
                else if (isNaN(value) || value < 0) newErrors.receipt_order = "Debe ser número >= 0"
                break
        }
        setErrors(newErrors)
        return !newErrors[field]
    }

    const validateForm = () => {
        const newErrors = {}
        let isValid = true

        if (!formData.code?.trim()) { newErrors.code = "Código es requerido"; isValid = false }
        else if (!/^[A-Z0-9_]+$/.test(formData.code)) { newErrors.code = "Solo mayúsculas, números y guión bajo"; isValid = false }
        else if (!initialData && concepts?.some(c => c.code === formData.code.toUpperCase())) { newErrors.code = "Ya existe un concepto con este código"; isValid = false }

        if (!formData.name?.trim()) { newErrors.name = "Nombre es requerido"; isValid = false }
        else if (formData.name.length < 3) { newErrors.name = "Mínimo 3 caracteres"; isValid = false }

        if (!formData.kind) { newErrors.kind = "Tipo es requerido"; isValid = false }
        if (!formData.computation_method) { newErrors.computation_method = "Método es requerido"; isValid = false }

        if (["FIXED_AMOUNT", "PERCENTAGE_OF_BASIC"].includes(formData.computation_method)) {
            if (formData.value === "" || formData.value === null) { newErrors.value = "Valor es requerido"; isValid = false }
            else if (isNaN(formData.value)) { newErrors.value = "Debe ser un número"; isValid = false }
            else if (formData.computation_method === "PERCENTAGE_OF_BASIC" && (formData.value < 0 || formData.value > 100)) { newErrors.value = "Porcentaje debe ser entre 0 y 100"; isValid = false }
        }

        if (formData.computation_method === "DYNAMIC_FORMULA") {
            if (!formData.formula?.trim()) { newErrors.formula = "Fórmula es requerida"; isValid = false }
            else if (formulaValidation && !formulaValidation.valid) { newErrors.formula = formulaValidation.error || "Fórmula inválida"; isValid = false }
        }

        if (formData.receipt_order === "" || formData.receipt_order === null) { newErrors.receipt_order = "Orden es requerido"; isValid = false }
        else if (isNaN(formData.receipt_order) || formData.receipt_order < 0) { newErrors.receipt_order = "Debe ser número >= 0"; isValid = false }

        if (initialData?.is_system) { newErrors.general = "No se pueden modificar conceptos del sistema"; isValid = false }

        setErrors(newErrors)
        setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}))
        return isValid
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!validateForm()) return
        const submitData = {
            ...formData,
            code: formData.code.toUpperCase(),
            value: Number(formData.value) || 0,
            receipt_order: Number(formData.receipt_order) || 0,
            system_params: formData.system_params || {},
            rules: formData.rules || {},
            incidences: formData.incidences || [],
        }
        onSubmit(submitData)
    }

    // ===== EARLY RETURN - CRITICAL: must be after hooks but before heavy computation =====
    if (!open) return null

    // ===== RENDER HELPERS (inside render, after early return) =====
    const getKindConfig = (kind) => {
        const configs = {
            INCOME: { bg: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: Calculator, label: 'Ingreso' },
            DEDUCTION: { bg: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: XCircle, label: 'Deducción' },
            EMPLOYER_COST: { bg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400', icon: Database, label: 'Costo Patronal' },
            INFORMATIONAL: { bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: FileText, label: 'Informativo' },
        }
        return configs[kind] || configs.INFORMATIONAL
    }

    const kindConfig = getKindConfig(formData.kind)
    const KindIcon = kindConfig.icon
    const isSystemConcept = initialData?.is_system === true
    const isEditing = !!initialData

    // ===== RENDER =====
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-4xl w-full max-h-[95vh] overflow-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b transition-colors duration-300"
                    style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.1)" }}>
                            <Settings className="w-5 h-5" style={{ color: "#003DA5" }} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {isEditing ? "Editar Concepto" : "Nuevo Concepto"}
                            </h2>
                            <p className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                {isEditing ? "Modificar configuración del concepto" : "Crear nuevo concepto de nómina venezolana"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${kindConfig.bg}`}>
                            <KindIcon className="w-3 h-3" />
                            {kindConfig.label}
                        </span>
                        {isSystemConcept && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold
                                bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                <Database className="w-3 h-3" />
                                Sistema (Solo lectura)
                            </span>
                        )}
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <XCircle className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-4 max-h-[85vh] overflow-auto">
                    {/* General Info Section */}
                    <fieldset className="mb-6" disabled={isSystemConcept}>
                        <legend className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Settings className="w-4 h-4" style={{ color: "#003DA5" }} />
                            Información General
                        </legend>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Code */}
                            <div className="sm:col-span-1">
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                                    style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                    Código <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => handleChange("code", e.target.value.toUpperCase())}
                                    onBlur={() => handleBlur("code")}
                                    placeholder="EJ: BASE, HE_DIURNA, IVSS_EMPLEADO"
                                    className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200 font-mono
                                        bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                                        focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
                                        dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                        dark:placeholder-[rgba(255,255,255,0.25)] dark:focus:border-[rgba(0,61,165,0.5)]
                                        ${touched.code && errors.code ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}`}
                                    disabled={isEditing || isSystemConcept}
                                />
                                {touched.code && errors.code && (
                                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        {errors.code}
                                    </p>
                                )}
                                <p className="mt-1 text-xs" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }}>
                                    Solo mayúsculas, números y guión bajo. Inmutable tras crear.
                                </p>
                            </div>

                            {/* Name */}
                            <div className="sm:col-span-2 lg:col-span-2">
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                                    style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                    Nombre <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    onBlur={() => handleBlur("name")}
                                    placeholder="Ej: Salario Base, Horas Extra Diurnas, IVSS Empleado"
                                    className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200
                                        bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                                        focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
                                        dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                        dark:placeholder-[rgba(255,255,255,0.25)] dark:focus:border-[rgba(0,61,165,0.5)]
                                        ${touched.name && errors.name ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}`}
                                    disabled={isSystemConcept}
                                />
                                {touched.name && errors.name && (
                                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="lg:col-span-3">
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                                    style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                    Descripción
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleChange("description", e.target.value)}
                                    rows={2}
                                    placeholder="Descripción opcional del concepto..."
                                    className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200
                                        bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                                        focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
                                        dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                        dark:placeholder-[rgba(255,255,255,0.25)] dark:focus:border-[rgba(0,61,165,0.5)]`}
                                    disabled={isSystemConcept}
                                />
                            </div>

                            {/* Kind */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                                    style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                    Tipo de Concepto <span className="text-red-500">*</span>
                                </label>
                                <CustomSelect
                                    value={formData.kind}
                                    onValueChange={(val) => handleChange("kind", val)}
                                    options={kindOptions}
                                    placeholder="Seleccionar tipo"
                                    accentColor="blue"
                                    disabled={isSystemConcept}
                                />
                                {touched.kind && errors.kind && (
                                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        {errors.kind}
                                    </p>
                                )}
                            </div>

                            {/* Computation Method */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                                    style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                    Método de Cálculo <span className="text-red-500">*</span>
                                </label>
                                <CustomSelect
                                    value={formData.computation_method}
                                    onValueChange={(val) => handleChange("computation_method", val)}
                                    options={computationMethodOptions}
                                    placeholder="Seleccionar método"
                                    accentColor="blue"
                                    disabled={isSystemConcept}
                                />
                                {touched.computation_method && errors.computation_method && (
                                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        {errors.computation_method}
                                    </p>
                                )}
                            </div>

                            {/* Value (for FIXED_AMOUNT and PERCENTAGE_OF_BASIC) */}
                            {(formData.computation_method === "FIXED_AMOUNT" || formData.computation_method === "PERCENTAGE_OF_BASIC") && (
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                                        style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                        Valor <span className="text-red-500">*</span>
                                        {formData.computation_method === "PERCENTAGE_OF_BASIC" && (
                                            <HelpCircle className="w-3 h-3 inline ml-1 text-gray-400 cursor-help"
                                                title="Porcentaje del salario base (0-100)" />
                                        )}
                                    </label>
                                    <input
                                        type="number"
                                        step={formData.computation_method === "PERCENTAGE_OF_BASIC" ? "0.01" : "0.01"}
                                        value={formData.value}
                                        onChange={(e) => handleChange("value", e.target.value === "" ? "" : Number(e.target.value))}
                                        onBlur={() => handleBlur("value")}
                                        placeholder={formData.computation_method === "PERCENTAGE_OF_BASIC" ? "Ej: 5.00 (5%)" : "Ej: 100.00"}
                                        className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200 text-right
                                            bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                                            focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
                                            dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                            dark:placeholder-[rgba(255,255,255,0.25)] dark:focus:border-[rgba(0,61,165,0.5)]
                                            ${touched.value && errors.value ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}`}
                                        disabled={isSystemConcept}
                                    />
                                    {touched.value && errors.value && (
                                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3" />
                                            {errors.value}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Formula (for DYNAMIC_FORMULA) */}
                            {formData.computation_method === "DYNAMIC_FORMULA" && (
                                <div className="lg:col-span-3">
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                                        style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                        Fórmula Dinámica <span className="text-red-500">*</span>
                                        <HelpCircle className="w-3 h-3 inline ml-1 text-gray-400 cursor-help"
                                            title="Variables: SALARIO_PERIOD, SUELDO_BASE_DIARIO, DIAS_EFECTIVOS, H_EXTRA_DIURNA, H_EXTRA_NOCTURNA, H_EXTRA_FERIADO, H_EXTRA_DESCANSO, IVSS_BASE, FAOV_BASE, minimum_wage_ves, ivss_employee_rate, faov_employee_rate, inces_employee_rate, islr_retention" />
                                    </label>
                                    <div className="relative">
                                        <textarea
                                            value={formData.formula}
                                            onChange={(e) => handleChange("formula", e.target.value)}
                                            onBlur={() => handleBlur("formula")}
                                            rows={4}
                                            placeholder="Ej: H_EXTRA_DIURNA * SUELDO_BASE_HORA * 1.5"
                                            className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200 font-mono
                                                bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                                                focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
                                                dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                                dark:placeholder-[rgba(255,255,255,0.25)] dark:focus:border-[rgba(0,61,165,0.5)]
                                                ${touched.formula && errors.formula ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}
                                                pr-12`}
                                            disabled={isSystemConcept}
                                        />
                                        {validatingFormula && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                                            </div>
                                        )}
                                        {formulaValidation && !validatingFormula && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                {formulaValidation.valid ? (
                                                    <CheckCircle className="w-4 h-4 text-green-500" title="Fórmula válida" />
                                                ) : (
                                                    <XCircle className="w-4 h-4 text-red-500" title={formulaValidation.error || "Fórmula inválida"} />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {touched.formula && errors.formula && (
                                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3" />
                                            {errors.formula}
                                        </p>
                                    )}
                                    {formulaValidation && !formulaValidation.valid && !errors.formula && (
                                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3" />
                                            {formulaValidation.error}
                                        </p>
                                    )}
                                    <p className="mt-1 text-xs" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }}>
                                        Variables: SALARIO_PERIOD, SUELDO_BASE_DIARIO, DIAS_EFECTIVOS, H_EXTRA_DIURNA, H_EXTRA_NOCTURNA, H_EXTRA_FERIADO, H_EXTRA_DESCANSO, IVSS_BASE, FAOV_BASE, minimum_wage_ves, ivss_employee_rate, faov_employee_rate, inces_employee_rate, islr_retention
                                    </p>
                                </div>
                            )}

                            {/* System Params (for TABLE, EXTERNAL_API) */}
                            {(formData.computation_method === "TABLE" || formData.computation_method === "EXTERNAL_API") && (
                                <div className="lg:col-span-3">
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                                        style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                        Parámetros del Sistema (JSON)
                                    </label>
                                    <textarea
                                        value={JSON.stringify(formData.system_params, null, 2)}
                                        onChange={(e) => {
                                            try {
                                                handleChange("system_params", JSON.parse(e.target.value))
                                            } catch {
                                                // Invalid JSON, keep current
                                            }
                                        }}
                                        rows={4}
                                        placeholder='{"key": "value"}'
                                        className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200 font-mono
                                            bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                                            focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
                                            dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                            dark:placeholder-[rgba(255,255,255,0.25)] dark:focus:border-[rgba(0,61,165,0.5)]`}
                                        disabled={isSystemConcept}
                                    />
                                </div>
                            )}

                            {/* Calculation Base */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                                    style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                    Base de Cálculo
                                </label>
                                <CustomSelect
                                    value={formData.calculation_base}
                                    onValueChange={(val) => handleChange("calculation_base", val)}
                                    options={calculationBaseOptions}
                                    placeholder="Seleccionar base"
                                    accentColor="blue"
                                    disabled={isSystemConcept}
                                />
                            </div>

                            {/* Behavior */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                                    style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                    Comportamiento
                                </label>
                                <CustomSelect
                                    value={formData.behavior}
                                    onValueChange={(val) => handleChange("behavior", val)}
                                    options={behaviorOptions}
                                    placeholder="Seleccionar comportamiento"
                                    accentColor="blue"
                                    disabled={isSystemConcept}
                                />
                            </div>

                            {/* Receipt Order */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                                    style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                    Orden en Recibo <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.receipt_order}
                                    onChange={(e) => handleChange("receipt_order", e.target.value === "" ? "" : Number(e.target.value))}
                                    onBlur={() => handleBlur("receipt_order")}
                                    placeholder="0"
                                    className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200 text-right
                                        bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                                        focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
                                        dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                        dark:placeholder-[rgba(255,255,255,0.25)] dark:focus:border-[rgba(0,61,165,0.5)]
                                        ${touched.receipt_order && errors.receipt_order ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}`}
                                    disabled={isSystemConcept}
                                />
                                {touched.receipt_order && errors.receipt_order && (
                                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        {errors.receipt_order}
                                    </p>
                                )}
                            </div>

                            {/* Receipt Type */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                                    style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                    Tipo de Recibo
                                </label>
                                <CustomSelect
                                    value={formData.tipo_recibo}
                                    onValueChange={(val) => handleChange("tipo_recibo", val)}
                                    options={[
                                        { value: "", label: "Sin asignar (usa default)" },
                                        ...(receiptTypes || []).map(rt => ({ value: rt._id, label: `${rt.code} - ${rt.name}` }))
                                    ]}
                                    placeholder="Seleccionar tipo"
                                    accentColor="blue"
                                    disabled={isSystemConcept}
                                />
                            </div>

                            {/* Unit Label */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                                    style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                    Unidad
                                </label>
                                <CustomSelect
                                    value={formData.unit_label}
                                    onValueChange={(val) => handleChange("unit_label", val)}
                                    options={unitLabelOptions}
                                    placeholder="Seleccionar unidad"
                                    accentColor="blue"
                                    disabled={isSystemConcept}
                                />
                            </div>

                            {/* Active */}
                            <div className="flex items-end">
                                <div className="flex items-center gap-2 w-full">
                                    <input
                                        type="checkbox"
                                        id="active"
                                        checked={formData.active}
                                        onChange={(e) => handleChange("active", e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        disabled={isSystemConcept}
                                    />
                                    <label htmlFor="active" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                                        Activo
                                    </label>
                                </div>
                            </div>
                        </div>
                    </fieldset>

                    {/* Incidences Section */}
                    <fieldset className="mb-6" disabled={isSystemConcept}>
                        <legend className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Zap className="w-4 h-4" style={{ color: "#003DA5" }} />
                            Incidencias (Afecta bases de cálculo)
                        </legend>
                        <div className="flex flex-wrap gap-2">
                            {incidencesOptions.map(opt => (
                                <label key={opt.value} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer"
                                    style={{
                                        borderColor: formData.incidences?.includes(opt.value) ? "#003DA5" : (isDark ? "rgba(255,255,255,0.12)" : "#e5e7eb"),
                                        background: formData.incidences?.includes(opt.value) ? "rgba(0,61,165,0.1)" : (isDark ? "rgba(255,255,255,0.04)" : "#f9fafb"),
                                        color: formData.incidences?.includes(opt.value) ? "#003DA5" : "inherit"
                                    }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.incidences?.includes(opt.value)}
                                        onChange={(e) => {
                                            const newIncidences = formData.incidences || []
                                            if (e.target.checked) handleChange("incidences", [...newIncidences, opt.value])
                                            else handleChange("incidences", newIncidences.filter(i => i !== opt.value))
                                        }}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium">{opt.label}</span>
                                </label>
                            ))}
                        </div>
                        <p className="mt-2 text-xs" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }}>
                            Define en qué bases de cálculo incide este concepto (ej: IVSS, FAOV, Prestaciones, etc.)
                        </p>
                    </fieldset>

                    {/* Flags Section */}
                    <fieldset className="mb-6" disabled={isSystemConcept}>
                        <legend className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Database className="w-4 h-4" style={{ color: "#003DA5" }} />
                            Configuración Avanzada
                        </legend>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="is_salary_incidence" checked={formData.is_salary_incidence} onChange={(e) => handleChange("is_salary_incidence", e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <label htmlFor="is_salary_incidence" className="text-sm text-gray-700 dark:text-gray-300">Incide en salario (base prestaciones/vacaciones/utilidades)</label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="is_novelty_eligible" checked={formData.is_novelty_eligible} onChange={(e) => handleChange("is_novelty_eligible", e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <label htmlFor="is_novelty_eligible" className="text-sm text-gray-700 dark:text-gray-300">Elegible para novedades</label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="deducts_from_base_salary" checked={formData.deducts_from_base_salary} onChange={(e) => handleChange("deducts_from_base_salary", e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <label htmlFor="deducts_from_base_salary" className="text-sm text-gray-700 dark:text-gray-300">Descuenta del salario base</label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="adds_to_complement" checked={formData.adds_to_complement} onChange={(e) => handleChange("adds_to_complement", e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <label htmlFor="adds_to_complement" className="text-sm text-gray-700 dark:text-gray-300">Suma al complemento salarial</label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="replaces_base_salary" checked={formData.replaces_base_salary} onChange={(e) => handleChange("replaces_base_salary", e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <label htmlFor="replaces_base_salary" className="text-sm text-gray-700 dark:text-gray-300">Reemplaza salario base</label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="show_on_payslip" checked={formData.show_on_payslip} onChange={(e) => handleChange("show_on_payslip", e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <label htmlFor="show_on_payslip" className="text-sm text-gray-700 dark:text-gray-300">Mostrar en boleta</label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="appears_on_receipt" checked={formData.appears_on_receipt} onChange={(e) => handleChange("appears_on_receipt", e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <label htmlFor="appears_on_receipt" className="text-sm text-gray-700 dark:text-gray-300">Aparece en recibo</label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="show_even_if_zero" checked={formData.show_even_if_zero} onChange={(e) => handleChange("show_even_if_zero", e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <label htmlFor="show_even_if_zero" className="text-sm text-gray-700 dark:text-gray-300">Mostrar aunque sea cero</label>
                            </div>
                            {isEditing && !isSystemConcept && (
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="is_system" checked={formData.is_system} onChange={(e) => handleChange("is_system", e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    <label htmlFor="is_system" className="text-sm text-amber-600 dark:text-amber-400">Concepto de sistema (⚠️ inmutable)</label>
                                </div>
                            )}
                        </div>
                    </fieldset>

                    {/* General Error */}
                    {errors.general && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                            <p className="text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                {errors.general}
                            </p>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t"
                        style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            Cancelar
                        </button>
                        {!isSystemConcept && (
                            <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center gap-2" style={{ background: "#003DA5" }}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        {isEditing ? "Actualizar" : "Crear"}
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ConceptFormModal