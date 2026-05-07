import axios from 'axios'

const HR_PUBLIC = [
    "/api/auth/HR/login",
    "/api/auth/HR/signup",
    "/api/auth/HR/forgot-password",
    "reset-password",
]

export const hrApiService = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_API,
    headers: { 'Content-Type': 'application/json' },
})

// Interceptor para agregar headers anti-caché a todas las peticiones
hrApiService.interceptors.request.use((config) => {
    const url = config.url || ""
    const isPublic = HR_PUBLIC.some(route => url.includes(route))
    
    console.log("[LOG API REQUEST]", config.method, url, "isPublic:", isPublic)
    
    // Agregar token si no es ruta pública
    if (!isPublic) {
        const token = localStorage.getItem("HRtoken")
        console.log("[LOG API REQUEST] Token presente:", !!token)
        if (token) config.headers.Authorization = `Bearer ${token}`
    }
    
    // Agregar query param anti-caché a peticiones GET para evitar 304
    if (config.method === 'get') {
        const separator = config.url.includes('?') ? '&' : '?'
        config.url = `${config.url}${separator}_t=${Date.now()}`
    }
    
    return config
})

// Interceptor para capturar TODAS las respuestas (incl errores)
hrApiService.interceptors.response.use(
    (response) => {
        console.log("[LOG API RESPONSE]", response.config.method, response.config.url, "=>", response.status, response.data?.success)
        return response
    },
    (error) => {
        console.error("[LOG API ERROR]", error.config?.method, error.config?.url, "=>", error.response?.status, error.response?.data || error.message)
        return Promise.reject(error)
    }
)
