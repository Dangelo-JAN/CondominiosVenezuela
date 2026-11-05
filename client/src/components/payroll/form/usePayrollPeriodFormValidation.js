import { useState, useCallback } from "react"

export const usePayrollPeriodFormValidation = () => {
    const [errors, setErrors] = useState({})

    const validate = useCallback((formData) => {
        const newErrors = {}
        if (!formData.name?.trim()) newErrors.name = "Nombre es requerido"
        if (!formData.start_date) newErrors.start_date = "Fecha de inicio es requerida"
        if (!formData.end_date) newErrors.end_date = "Fecha de fin es requerida"
        if (!formData.payment_date) newErrors.payment_date = "Fecha de pago es requerida"
        if (formData.days_count < 1) newErrors.days_count = "Días debe ser mayor a 0"
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }, [])

    const clearError = useCallback((field) => {
        setErrors(prev => ({ ...prev, [field]: null }))
    }, [])

    const clearAllErrors = useCallback(() => {
        setErrors({})
    }, [])

    const setFieldError = useCallback((field, message) => {
        setErrors(prev => ({ ...prev, [field]: message }))
    }, [])

    return {
        errors,
        validate,
        clearError,
        clearAllErrors,
        setFieldError,
    }
}

export default usePayrollPeriodFormValidation