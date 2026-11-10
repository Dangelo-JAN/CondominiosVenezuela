import { useEffect, useState, useCallback, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useIsDark } from "../../hooks/useIsDark.js"
import { HandlePayrollNovelties } from "../../redux/Thunks/PayrollThunk.js"
import { hrApiService } from "../../redux/apis/HRApiService"
import { HREmployeesPageEndPoints } from "../../redux/apis/APIsEndpoints"
import { CustomSelect } from "../ui/custom-select.jsx"
import { CreditCard, AlertTriangle, CheckCircle, XCircle, Loader2, HelpCircle, User, Calendar, Settings } from "lucide-react"

export const NoveltyFormModal = ({
    open,
    onClose,
    initialData,
    onSubmit,
    isSubmitting = false
}) => {
    const isDark = useIsDark()
    const dispatch = useDispatch()

    // Selectors for dropdown options
    const { data: periods } = useSelector((state) => state.payrollReducer.periods)
    const { data: concepts } = useSelector((state) => state.payrollReducer.concepts)
    const [employees, setEmployees] = useState([])
    const [employeesLoading, setEmployeesLoading] = useState(true)

    // Fetch employees on mount
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await hrApiService.get(HREmployeesPageEndPoints.GETALL)
                if (response.data?.success && response.data?.data) {
                    setEmployees(response.data.data)
                }
            } catch (error) {
                console.error("Error fetching employees:", error)
            } finally {
                setEmployeesLoading(false)
            }
        }
        fetchEmployees()
    }, [])

    // ===== FORM STATE =====
    const [formData, setFormData] = useState({
        employee: "",
        period: "",
        concept_code: "",
        amount: 0,
        quantity: 1,
        unit: "BS",
        description: "",
        source: "MANUAL",
        reference_id: "",
        reference_model: ""
    })

    const [errors, setErrors] = useState({})
    const [touched, setTouched] = useState({})

    // ===== OPTIONS (memoized) =====
    const unitOptions = useMemo(() => [
        { value: "DÍAS", label: "Días" },
        { value: "HORAS", label: "Horas" },
        { value: "UNIDADES", label: "Unidades" },
        { value: "%", label: "Porcentaje" },
        { value: "BS", label: "Bs." },
        { value: "USD", label: "USD" },
    ], [])

    const sourceOptions = useMemo(() => [
        { value: "MANUAL", label: "Manual" },
        { value: "IMPORT", label: "Importación" },
        { value: "BIOMETRIC", label: "Biométrico" },
        { value: "POS", label: "POS" },
        { value: "LEAVE", label: "Licencia" },
        { value: "LOAN", label: "Préstamo" },
        { value: "ADVANCE", label: "Anticipo" },
    ], [])

    const periodOptions = useMemo(() => [
        { value: "", label: "Seleccionar período..." },
        ...(periods?.map(p => ({ value: p._id, label: `${p.name} (${new Date(p.start_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} - ${new Date(p.end_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }))}`)) || [])
    ], [periods])

    const conceptOptions = useMemo(() => [
        { value: "", label: "Seleccionar concepto..." },
        ...(concepts?.filter(c => c.active && c.is_novelty_eligible).map(c => ({ value: c.code, label: `${c.code} - ${c.name} (${c.kind})` })) || [])
    ], [concepts])

    const employeeOptions = useMemo(() => [
        { value: "", label: employeesLoading ? "Cargando empleados..." : "Seleccionar empleado..." },
        ...(employees?.map(e => ({ value: e._id, label: `${e.firstname} ${e.lastname} (${e.department?.name || 'Sin depto'})` })) || [])
    ], [employees, employeesLoading])

    // ===== INITIALIZE FORM =====
    const isEditing = !!initialData
    const isEditingExisting = isEditing && initialData._id

    // Fields that cannot be edited after creation
    const lockedFields = ["employee", "period", "concept_code"]

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...formData,
                ...initialData,
                employee: initialData.employee?._id || initialData.employee || "",
                period: initialData.period?._id || initialData.period || "",
                concept_code: initialData.concept_code || "",
            })
            setErrors({})
            setTouched({})
        } else {
            setFormData({
                employee: "",
                period: "",
                concept_code: "",
                amount: 0,
                quantity: 1,
                unit: "BS",
                description: "",
                source: "MANUAL",
                reference_id: "",
                reference_model: ""
            })
            setErrors({})
            setTouched({})
        }
    }, [initialData, open])

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
            case "employee":
                if (!value) newErrors.employee = "Empleado es requerido"
                break
            case "period":
                if (!value) newErrors.period = "Período es requerido"
                break
            case "concept_code":
                if (!value) newErrors.concept_code = "Concepto es requerido"
                break
            case "amount":
                if (value === "" || value === null) newErrors.amount = "Monto es requerido"
                else if (isNaN(value)) newErrors.amount = "Debe ser un número"
                break
            case "quantity":
                if (value === "" || value === null) newErrors.quantity = "Cantidad es requerida"
                else if (isNaN(value) || Number(value) <= 0) newErrors.quantity = "Debe ser número > 0"
                break
            case "unit":
                if (!value) newErrors.unit = "Unidad es requerida"
                break
        }
        setErrors(newErrors)
        return !newErrors[field]
    }

    const validateForm = () => {
        const newErrors = {}
        let isValid = true

        if (!formData.employee) { newErrors.employee = "Empleado es requerido"; isValid = false }
        if (!formData.period) { newErrors.period = "Período es requerido"; isValid = false }
        if (!formData.concept_code) { newErrors.concept_code = "Concepto es requerido"; isValid = false }
        if (formData.amount === "" || formData.amount === null) { newErrors.amount = "Monto es requerido"; isValid = false }
        else if (isNaN(formData.amount)) { newErrors.amount = "Debe ser un número"; isValid = false }
        if (formData.quantity === "" || formData.quantity === null) { newErrors.quantity = "Cantidad es requerida"; isValid = false }
        else if (isNaN(formData.quantity) || Number(formData.quantity) <= 0) { newErrors.quantity = "Debe ser número > 0"; isValid = false }
        if (!formData.unit) { newErrors.unit = "Unidad es requerida"; isValid = false }

        setErrors(newErrors)
        setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}))
        return isValid
    }

    const handleFormSubmit = (e) => {
        e.preventDefault()
        if (!validateForm()) return
        const submitData = {
            ...formData,
            amount: Number(formData.amount) || 0,
            quantity: Number(formData.quantity) || 1,
        }
        // Don't send locked fields when editing
        if (isEditingExisting) {
            lockedFields.forEach(f => delete submitData[f])
        }
        onSubmit(submitData)
    }

    // ===== EARLY RETURN =====
    if (!open) return null

    // ===== RENDER =====
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-2xl w-full max-h-[95vh] overflow-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b transition-colors duration-300"
                    style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.1)" }}>
                            <CreditCard className="w-5 h-5" style={{ color: "#003DA5" }} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {isEditing ? "Editar Novedad" : "Nueva Novedad"}
                            </h2>
                            <p className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                {isEditing ? "Modificar novedad de nómina" : "Crear nueva novedad para cálculo de nómina"}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <XCircle className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleFormSubmit} className="p-4 max-h-[85vh] overflow-auto">
                    {/* Required Fields Section */}
                    <fieldset className="mb-6" disabled={isEditingExisting}>
                        <legend className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Settings className="w-4 h-4" style={{ color: "#003DA5" }} />
                            Datos Requeridos
                        </legend>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Employee */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                                    style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                    Empleado <span className="text-red-500">*</span>
                                </label>
                                <CustomSelect
                                    value={formData.employee}
                                    onValueChange={(val) => handleChange("employee", val)}
                                    options={employeeOptions}
                                    placeholder="Seleccionar empleado..."
                                    accentColor="blue"
                                    disabled={isEditingExisting}
                                />
                                {touched.employee && errors.employee && (
                                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        {errors.employee}
                                    </p>
                                )}
                                {isEditingExisting && (
                                    <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                        <HelpCircle className="w-3 h-3" />
                                        No editable tras crear la novedad
                                    </p>
                                )}
                            </div>

                            {/* Period */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                                    style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                    Período de Nómina <span className="text-red-500">*</span>
                                </label>
                                <CustomSelect
                                    value={formData.period}
                                    onValueChange={(val) => handleChange("period", val)}
                                    options={periodOptions}
                                    placeholder="Seleccionar período..."
                                    accentColor="blue"
                                    disabled={isEditingExisting}
                                />
                                {touched.period && errors.period && (
                                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        {errors.period}
                                    </p>
                                )}
                                {isEditingExisting && (
                                    <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                        <HelpCircle className="w-3 h-3" />
                                        No editable tras crear la novedad
                                    </p>
                                )}
                            </div>

                            {/* Concept */}
                            <div className="sm:col-span-2 lg:col-span-2">
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                                    style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                    Concepto <span className="text-red-500">*</span>
                                    <HelpCircle className="w-3 h-3 inline ml-1 text-gray-400 cursor-help"
                                        title="Solo conceptos activos y elegibles para novedades" />
                                </label>
                                <CustomSelect
                                    value={formData.concept_code}
                                    onValueChange={(val) => handleChange("concept_code", val)}
                                    options={conceptOptions}
                                    placeholder="Seleccionar concepto elegible..."
                                    accentColor="blue"
                                    disabled={isEditingExisting}
                                />
                                {touched.concept_code && errors.concept_code && (
                                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        {errors.concept_code}
                                    </p>
                                )}
                                {isEditingExisting && (
                                    <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                        <HelpCircle className="w-3 h-3" />
                                        No editable tras crear la novedad
                                    </p>
                                )}
                            </div>
                        </div>
                    </fieldset>

                    {/* Amount & Quantity Section */}
                    <fieldset className="mb-6">
                        <legend className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <CreditCard className="w-4 h-4" style={{ color: "#003DA5" }} />
                            Valores
                        </legend>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Amount */}
                            <div className="lg:col-span-2">
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                                    style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                    Monto <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={(e) => handleChange("amount", e.target.value === "" ? "" : Number(e.target.value))}
                                    onBlur={() => handleBlur("amount")}
                                    placeholder="0.00"
                                    className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200 text-right
                                        bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                                        focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
                                        dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                        dark:placeholder-[rgba(255,255,255,0.25)] dark:focus:border-[rgba(0,61,165,0.5)]
                                        ${touched.amount && errors.amount ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}`}
                                />
                                {touched.amount && errors.amount && (
                                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        {errors.amount}
                                    </p>
                                )}
                            </div>

                            {/* Quantity */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                                    style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                    Cantidad <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="1"
                                    min="1"
                                    value={formData.quantity}
                                    onChange={(e) => handleChange("quantity", e.target.value === "" ? "" : Number(e.target.value))}
                                    onBlur={() => handleBlur("quantity")}
                                    placeholder="1"
                                    className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200 text-right
                                        bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                                        focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
                                        dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                        dark:placeholder-[rgba(255,255,255,0.25)] dark:focus:border-[rgba(0,61,165,0.5)]
                                        ${touched.quantity && errors.quantity ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}`}
                                />
                                {touched.quantity && errors.quantity && (
                                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        {errors.quantity}
                                    </p>
                                )}
                            </div>

                            {/* Unit */}
                            <div className="lg:col-span-2">
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                                    style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                    Unidad <span className="text-red-500">*</span>
                                </label>
                                <CustomSelect
                                    value={formData.unit}
                                    onValueChange={(val) => handleChange("unit", val)}
                                    options={unitOptions}
                                    placeholder="Seleccionar unidad..."
                                    accentColor="blue"
                                />
                                {touched.unit && errors.unit && (
                                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        {errors.unit}
                                    </p>
                                )}
                            </div>

                            {/* Source */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                                    style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                    Origen
                                </label>
                                <CustomSelect
                                    value={formData.source}
                                    onValueChange={(val) => handleChange("source", val)}
                                    options={sourceOptions}
                                    placeholder="Seleccionar origen..."
                                    accentColor="blue"
                                />
                            </div>
                        </div>
                    </fieldset>

                    {/* Description Section */}
                    <fieldset className="mb-6">
                        <legend className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Settings className="w-4 h-4" style={{ color: "#003DA5" }} />
                            Descripción y Referencias
                        </legend>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Description */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                                    style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                    Descripción
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleChange("description", e.target.value)}
                                    rows={3}
                                    placeholder="Detalle de la novedad (opcional)..."
                                    className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200
                                        bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                                        focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
                                        dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                        dark:placeholder-[rgba(255,255,255,0.25)] dark:focus:border-[rgba(0,61,165,0.5)]`}
                                />
                            </div>

                            {/* Reference ID */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                                    style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                    ID Referencia
                                </label>
                                <input
                                    type="text"
                                    value={formData.reference_id}
                                    onChange={(e) => handleChange("reference_id", e.target.value)}
                                    placeholder="ID externo (opcional)"
                                    className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200
                                        bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                                        focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
                                        dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                        dark:placeholder-[rgba(255,255,255,0.25)] dark:focus:border-[rgba(0,61,165,0.5)]`}
                                />
                            </div>

                            {/* Reference Model */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                                    style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                                    Modelo Referencia
                                </label>
                                <input
                                    type="text"
                                    value={formData.reference_model}
                                    onChange={(e) => handleChange("reference_model", e.target.value)}
                                    placeholder="Nombre del modelo (opcional)"
                                    className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200
                                        bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                                        focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
                                        dark:bg-[rgba(255,255,255,0.04)] dark:border-[rgba(255,255,255,0.08)] dark:text-white
                                        dark:placeholder-[rgba(255,255,255,0.25)] dark:focus:border-[rgba(0,61,165,0.5)]`}
                                />
                            </div>
                        </div>
                    </fieldset>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t"
                        style={{ borderColor: isDark ? "rgba(0,61,165,0.15)" : "rgba(0,61,165,0.2)" }}>
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
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
                                    {isEditing ? "Actualizar" : "Crear"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default NoveltyFormModal