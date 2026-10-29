import { X } from "lucide-react"
import { useIsDark } from "../../hooks/useIsDark.js"
import { PayrollPeriodFormFields } from "./form/PayrollPeriodFormFields.jsx"
import { usePayrollPeriodFormState } from "./form/usePayrollPeriodFormState.js"
import { usePayrollPeriodFormValidation } from "./form/usePayrollPeriodFormValidation.js"

export const PayrollPeriodFormModal = ({ open, onClose, initialData, onSubmit }) => {
    const isDark = useIsDark()

    // Separated concerns
    const { formData, isSubmitting, handleChange, handleSubmit, resetForm } = usePayrollPeriodFormState({
        initialData,
        onSubmit,
    })
    const { errors, validate, clearError } = usePayrollPeriodFormValidation()

    // Wrap handleChange to clear errors on change
    const handleChangeWithClear = (field, value) => {
        handleChange(field, value)
        if (errors[field]) clearError(field)
    }

    // Override validate to use the one from validation hook
    const handleSubmitWithValidate = (e) => {
        if (!validate(formData)) return
        handleSubmit(e)
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

                <form onSubmit={handleSubmitWithValidate} className="space-y-6">
                    <PayrollPeriodFormFields
                        formData={formData}
                        errors={errors}
                        handleChange={handleChangeWithClear}
                        isDark={isDark}
                    />

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

export default PayrollPeriodFormModal