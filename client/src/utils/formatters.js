export const formatCurrency = (amount, currency = 'VES') => {
    if (amount === null || amount === undefined || isNaN(amount)) return '—'
    return new Intl.NumberFormat('es-VE', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount)
}

export const formatDate = (dateString) => {
    if (!dateString) return '—'
    try {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('es-VE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date)
    } catch {
        return '—'
    }
}

export const formatDateTime = (dateString) => {
    if (!dateString) return '—'
    try {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('es-VE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date)
    } catch {
        return '—'
    }
}