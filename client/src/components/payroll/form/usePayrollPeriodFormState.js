import { useState, useEffect, useCallback } from "react"

export const usePayrollPeriodFormState = ({ initialData, onSubmit }) => {
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
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Initialize form data when initialData changes
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
    }, [initialData])

    const handleChange = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }, [])

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await onSubmit(formData)
        } finally {
            setIsSubmitting(false)
        }
    }, [formData, onSubmit])

    const resetForm = useCallback(() => {
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
    }, [])

    return {
        formData,
        setFormData,
        isSubmitting,
        handleChange,
        handleSubmit,
        resetForm,
    }
}

export default usePayrollPeriodFormState