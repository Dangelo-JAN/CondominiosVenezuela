import { createAsyncThunk } from "@reduxjs/toolkit"
import { hrApiService } from "../apis/HRApiService"
import { employeeApiService } from "../apis/EmployeeApiService"
import { PayrollEndPoints } from "../apis/APIsEndpoints"

// ─── PERÍODOS DE NÓMINA ───
export const HandlePayrollPeriods = createAsyncThunk("HandlePayrollPeriods", async (args, { rejectWithValue }) => {
    try {
        const { type, id, data, page = 1, limit = 20, status } = args || {}

        switch (type) {
            case "GETALL": {
                const params = new URLSearchParams()
                if (status) params.append("status", status)
                params.append("page", page)
                params.append("limit", limit)
                const response = await hrApiService.get(`${PayrollEndPoints.PERIODS_GETALL}?${params}`)
                return { ...response.data, type: "GETALL" }
            }
            case "GETONE": {
                const response = await hrApiService.get(PayrollEndPoints.PERIODS_GETONE(id))
                return { ...response.data, type: "GETONE" }
            }
            case "CREATE": {
                const response = await hrApiService.post(PayrollEndPoints.PERIODS_CREATE, data)
                return { ...response.data, type: "CREATE" }
            }
            case "UPDATE": {
                const response = await hrApiService.put(PayrollEndPoints.PERIODS_UPDATE(id), data)
                return { ...response.data, type: "UPDATE" }
            }
            case "DELETE": {
                const response = await hrApiService.delete(PayrollEndPoints.PERIODS_DELETE(id))
                return { ...response.data, type: "DELETE", periodID: id }
            }
            case "CALCULATE": {
                const response = await hrApiService.post(PayrollEndPoints.PERIODS_CALCULATE(id), {})
                return { ...response.data, type: "CALCULATE" }
            }
            case "APPROVE": {
                const response = await hrApiService.post(PayrollEndPoints.PERIODS_APPROVE(id), {})
                return { ...response.data, type: "APPROVE" }
            }
            case "PAY": {
                const response = await hrApiService.post(PayrollEndPoints.PERIODS_PAY(id), {})
                return { ...response.data, type: "PAY" }
            }
            case "CLOSE": {
                const response = await hrApiService.post(PayrollEndPoints.PERIODS_CLOSE(id), {})
                return { ...response.data, type: "CLOSE" }
            }
            default:
                throw new Error("Tipo de operación inválida")
        }
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

// ─── RECIBOS DE NÓMINA ───
export const HandlePayrollReceipts = createAsyncThunk("HandlePayrollReceipts", async (args, { rejectWithValue }) => {
    try {
        const { type, id, employeeId, period, status, page = 1, limit = 20, reason, format = 'json' } = args || {}

        switch (type) {
            case "GETALL": {
                const params = new URLSearchParams()
                if (period) params.append("period", period)
                if (status) params.append("status", status)
                params.append("page", page)
                params.append("limit", limit)
                const response = await hrApiService.get(`${PayrollEndPoints.RECEIPTS_GETALL}?${params}`)
                return { ...response.data, type: "GETALL" }
            }
            case "GETONE": {
                const response = await hrApiService.get(PayrollEndPoints.RECEIPTS_GETONE(id))
                return { ...response.data, type: "GETONE" }
            }
            case "GET_EMPLOYEE": {
                const params = new URLSearchParams()
                if (period) params.append("period", period)
                if (status) params.append("status", status)
                const response = await hrApiService.get(`${PayrollEndPoints.RECEIPTS_GET_EMPLOYEE(employeeId)}?${params}`)
                return { ...response.data, type: "GET_EMPLOYEE" }
            }
            case "GET_ME": {
                const response = await employeeApiService.get(PayrollEndPoints.RECEIPTS_GET_ME)
                return { ...response.data, type: "GET_ME" }
            }
            case "RECALCULATE": {
                const response = await hrApiService.post(PayrollEndPoints.RECEIPTS_RECALCULATE(id), {})
                return { ...response.data, type: "RECALCULATE" }
            }
            case "VOID": {
                const response = await hrApiService.post(PayrollEndPoints.RECEIPTS_VOID(id), { reason })
                return { ...response.data, type: "VOID" }
            }
            case "EXPORT": {
                const params = new URLSearchParams()
                params.append("format", format)
                const response = await hrApiService.get(`${PayrollEndPoints.RECEIPTS_EXPORT(id)}?${params}`)
                return { ...response.data, type: "EXPORT" }
            }
            default:
                throw new Error("Tipo de operación inválida")
        }
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

// ─── CONCEPTOS DE NÓMINA ───
export const HandlePayrollConcepts = createAsyncThunk("HandlePayrollConcepts", async (args, { rejectWithValue }) => {
    try {
        const { type, id, data, kind, active, page = 1, limit = 50, formula } = args || {}

        switch (type) {
            case "GETALL": {
                const params = new URLSearchParams()
                if (kind) params.append("kind", kind)
                if (active !== undefined) params.append("active", active)
                params.append("page", page)
                params.append("limit", limit)
                const response = await hrApiService.get(`${PayrollEndPoints.CONCEPTS_GETALL}?${params}`)
                return { ...response.data, type: "GETALL" }
            }
            case "GETONE": {
                const response = await hrApiService.get(PayrollEndPoints.CONCEPTS_GETONE(id))
                return { ...response.data, type: "GETONE" }
            }
            case "CREATE": {
                const response = await hrApiService.post(PayrollEndPoints.CONCEPTS_CREATE, data)
                return { ...response.data, type: "CREATE" }
            }
            case "UPDATE": {
                const response = await hrApiService.put(PayrollEndPoints.CONCEPTS_UPDATE(id), data)
                return { ...response.data, type: "UPDATE" }
            }
            case "DELETE": {
                const response = await hrApiService.delete(PayrollEndPoints.CONCEPTS_DELETE(id))
                return { ...response.data, type: "DELETE", conceptID: id }
            }
            case "VALIDATE_FORMULA": {
                const response = await hrApiService.post(PayrollEndPoints.CONCEPTS_VALIDATE_FORMULA, { formula })
                return { ...response.data, type: "VALIDATE_FORMULA" }
            }
            case "RECEIPT_TYPES": {
                const response = await hrApiService.get(PayrollEndPoints.RECEIPT_TYPES_GETALL)
                return { ...response.data, type: "RECEIPT_TYPES" }
            }
            case "CREATE_RECEIPT_TYPE": {
                const response = await hrApiService.post(PayrollEndPoints.RECEIPT_TYPES_CREATE, data)
                return { ...response.data, type: "CREATE_RECEIPT_TYPE" }
            }
            default:
                throw new Error("Tipo de operación inválida")
        }
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

// ─── POLÍTICA Y CONFIGURACIÓN ───
export const HandlePayrollPolicy = createAsyncThunk("HandlePayrollPolicy", async (args, { rejectWithValue }) => {
    try {
        const { type, data } = args || {}

        switch (type) {
            case "POLICY_GET": {
                const response = await hrApiService.get(PayrollEndPoints.POLICY_GET)
                return { ...response.data, type: "POLICY_GET" }
            }
            case "POLICY_UPDATE": {
                const response = await hrApiService.put(PayrollEndPoints.POLICY_UPDATE, data)
                return { ...response.data, type: "POLICY_UPDATE" }
            }
            case "COMPANY_GET": {
                const response = await hrApiService.get(PayrollEndPoints.COMPANY_GET)
                return { ...response.data, type: "COMPANY_GET" }
            }
            case "COMPANY_UPDATE": {
                const response = await hrApiService.put(PayrollEndPoints.COMPANY_UPDATE, data)
                return { ...response.data, type: "COMPANY_UPDATE" }
            }
            default:
                throw new Error("Tipo de operación inválida")
        }
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

// ─── NOVEDADES ───
export const HandlePayrollNovelties = createAsyncThunk("HandlePayrollNovelties", async (args, { rejectWithValue }) => {
    try {
        const { type, id, data, period, employee, concept_code, status, page = 1, limit = 50, reason } = args || {}

        switch (type) {
            case "GETALL": {
                const params = new URLSearchParams()
                if (period) params.append("period", period)
                if (employee) params.append("employee", employee)
                if (concept_code) params.append("concept_code", concept_code)
                if (status) params.append("status", status)
                params.append("page", page)
                params.append("limit", limit)
                const response = await hrApiService.get(`${PayrollEndPoints.NOVELTIES_GETALL}?${params}`)
                return { ...response.data, type: "GETALL" }
            }
            case "GETONE": {
                const response = await hrApiService.get(PayrollEndPoints.NOVELTIES_GETONE(id))
                return { ...response.data, type: "GETONE" }
            }
            case "CREATE": {
                const response = await hrApiService.post(PayrollEndPoints.NOVELTIES_CREATE, data)
                return { ...response.data, type: "CREATE" }
            }
            case "UPDATE": {
                const response = await hrApiService.put(PayrollEndPoints.NOVELTIES_UPDATE(id), data)
                return { ...response.data, type: "UPDATE" }
            }
            case "DELETE": {
                const response = await hrApiService.delete(PayrollEndPoints.NOVELTIES_DELETE(id))
                return { ...response.data, type: "DELETE", noveltyID: id }
            }
            case "APPLY": {
                const response = await hrApiService.post(PayrollEndPoints.NOVELTIES_APPLY(id), {})
                return { ...response.data, type: "APPLY" }
            }
            case "REJECT": {
                const response = await hrApiService.post(PayrollEndPoints.NOVELTIES_REJECT(id), { reason })
                return { ...response.data, type: "REJECT" }
            }
            case "BULK_CREATE": {
                const response = await hrApiService.post(PayrollEndPoints.NOVELTIES_BULK_CREATE, { novelties: data })
                return { ...response.data, type: "BULK_CREATE" }
            }
            default:
                throw new Error("Tipo de operación inválida")
        }
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

// ─── VACACIONES ───
export const HandleVacations = createAsyncThunk("HandleVacations", async (args, { rejectWithValue }) => {
    try {
        const { type, id, data, employeeId, page = 1, limit = 20, status, payment_date, period_id } = args || {}

        switch (type) {
            case "BALANCES_GETALL": {
                const params = new URLSearchParams()
                if (employeeId) params.append("employee", employeeId)
                params.append("page", page)
                params.append("limit", limit)
                const response = await hrApiService.get(`${PayrollEndPoints.VACATION_BALANCES_GETALL}?${params}`)
                return { ...response.data, type: "BALANCES_GETALL" }
            }
            case "BALANCES_GETONE": {
                const response = await hrApiService.get(PayrollEndPoints.VACATION_BALANCES_GETONE(employeeId))
                return { ...response.data, type: "BALANCES_GETONE" }
            }
            case "REQUESTS_GETALL": {
                const params = new URLSearchParams()
                if (employeeId) params.append("employee", employeeId)
                if (status) params.append("status", status)
                params.append("page", page)
                params.append("limit", limit)
                const response = await hrApiService.get(`${PayrollEndPoints.VACATION_REQUESTS_GETALL}?${params}`)
                return { ...response.data, type: "REQUESTS_GETALL" }
            }
            case "REQUESTS_GETONE": {
                const response = await hrApiService.get(PayrollEndPoints.VACATION_REQUESTS_GETONE(id))
                return { ...response.data, type: "REQUESTS_GETONE" }
            }
            case "REQUESTS_CREATE": {
                const response = await hrApiService.post(PayrollEndPoints.VACATION_REQUESTS_CREATE, data)
                return { ...response.data, type: "REQUESTS_CREATE" }
            }
            case "REQUESTS_APPROVE": {
                const response = await hrApiService.post(PayrollEndPoints.VACATION_REQUESTS_APPROVE(id), {})
                return { ...response.data, type: "REQUESTS_APPROVE" }
            }
            case "REQUESTS_REJECT": {
                const response = await hrApiService.post(PayrollEndPoints.VACATION_REQUESTS_REJECT(id), { reason })
                return { ...response.data, type: "REQUESTS_REJECT" }
            }
            case "REQUESTS_PAY": {
                const response = await hrApiService.post(PayrollEndPoints.VACATION_REQUESTS_PAY(id), { payment_date, period_id })
                return { ...response.data, type: "REQUESTS_PAY" }
            }
            case "HOLIDAYS_GETALL": {
                const params = new URLSearchParams()
                if (data?.year) params.append("year", data.year)
                if (data?.type) params.append("type", data.type)
                const response = await hrApiService.get(`${PayrollEndPoints.HOLIDAYS_GETALL}?${params}`)
                return { ...response.data, type: "HOLIDAYS_GETALL" }
            }
            case "HOLIDAYS_CREATE": {
                const response = await hrApiService.post(PayrollEndPoints.HOLIDAYS_CREATE, data)
                return { ...response.data, type: "HOLIDAYS_CREATE" }
            }
            case "HOLIDAYS_DELETE": {
                const response = await hrApiService.delete(PayrollEndPoints.HOLIDAYS_DELETE(id))
                return { ...response.data, type: "HOLIDAYS_DELETE", holidayID: id }
            }
            default:
                throw new Error("Tipo de operación inválida")
        }
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

// ─── PRESTACIONES SOCIALES ───
export const HandleSocialBenefits = createAsyncThunk("HandleSocialBenefits", async (args, { rejectWithValue }) => {
    try {
        const { type, id, data, employeeId, contractId, page = 1, limit = 20, period_start, period_end, payment_date, payment_method, bank_reference, amount, days_accrued, daily_salary, settlement_date, cause, notes } = args || {}

        switch (type) {
            case "LEDGER_GETALL": {
                const params = new URLSearchParams()
                if (employeeId) params.append("employee", employeeId)
                if (contractId) params.append("contract", contractId)
                if (data?.entry_type) params.append("entry_type", data.entry_type)
                params.append("page", page)
                params.append("limit", limit)
                const response = await hrApiService.get(`${PayrollEndPoints.SOCIAL_BENEFITS_LEDGER_GETALL}?${params}`)
                return { ...response.data, type: "LEDGER_GETALL" }
            }
            case "LEDGER_GET_EMPLOYEE": {
                const response = await hrApiService.get(PayrollEndPoints.SOCIAL_BENEFITS_LEDGER_GET_EMPLOYEE(employeeId))
                return { ...response.data, type: "LEDGER_GET_EMPLOYEE" }
            }
            case "SETTLEMENTS_CALCULATE": {
                const response = await hrApiService.post(PayrollEndPoints.SOCIAL_BENEFITS_SETTLEMENTS_CALCULATE, { contract_id, settlement_date, cause })
                return { ...response.data, type: "SETTLEMENTS_CALCULATE" }
            }
            case "SETTLEMENTS_CREATE": {
                const response = await hrApiService.post(PayrollEndPoints.SOCIAL_BENEFITS_SETTLEMENTS_CREATE, { contract_id, settlement_date, cause, notes })
                return { ...response.data, type: "SETTLEMENTS_CREATE" }
            }
            case "SETTLEMENTS_GETALL": {
                const params = new URLSearchParams()
                if (contractId) params.append("contract", contractId)
                if (data?.status) params.append("status", data.status)
                params.append("page", page)
                params.append("limit", limit)
                const response = await hrApiService.get(`${PayrollEndPoints.SOCIAL_BENEFITS_SETTLEMENTS_GETALL}?${params}`)
                return { ...response.data, type: "SETTLEMENTS_GETALL" }
            }
            case "SETTLEMENTS_GETONE": {
                const response = await hrApiService.get(PayrollEndPoints.SOCIAL_BENEFITS_SETTLEMENTS_GETONE(id))
                return { ...response.data, type: "SETTLEMENTS_GETONE" }
            }
            case "SETTLEMENTS_APPROVE": {
                const response = await hrApiService.post(PayrollEndPoints.SOCIAL_BENEFITS_SETTLEMENTS_APPROVE(id), {})
                return { ...response.data, type: "SETTLEMENTS_APPROVE" }
            }
            case "SETTLEMENTS_PAY": {
                const response = await hrApiService.post(PayrollEndPoints.SOCIAL_BENEFITS_SETTLEMENTS_PAY(id), { payment_date, payment_method, bank_reference })
                return { ...response.data, type: "SETTLEMENTS_PAY" }
            }
            case "ACCRUAL_CALCULATE": {
                const params = new URLSearchParams()
                params.append("employee_id", employeeId)
                params.append("period_start", period_start)
                params.append("period_end", period_end)
                const response = await hrApiService.get(`${PayrollEndPoints.SOCIAL_BENEFITS_ACCRUAL_CALCULATE}?${params}`)
                return { ...response.data, type: "ACCRUAL_CALCULATE" }
            }
            case "ACCRUAL_RECORD": {
                const response = await hrApiService.post(PayrollEndPoints.SOCIAL_BENEFITS_ACCRUAL_RECORD, { employee_id, contract_id, period_start, period_end, amount, days_accrued, daily_salary })
                return { ...response.data, type: "ACCRUAL_RECORD" }
            }
            default:
                throw new Error("Tipo de operación inválida")
        }
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})

// ─── UTILIDADES ───
export const HandleUtilidades = createAsyncThunk("HandleUtilidades", async (args, { rejectWithValue }) => {
    try {
        const { type, id, data, year, status, page = 1, limit = 20, payment_date, exchange_rate, method } = args || {}

        switch (type) {
            case "PERIODS_GETALL": {
                const params = new URLSearchParams()
                if (year) params.append("year", year)
                if (status) params.append("status", status)
                params.append("page", page)
                params.append("limit", limit)
                const response = await hrApiService.get(`${PayrollEndPoints.UTILIDADES_PERIODS_GETALL}?${params}`)
                return { ...response.data, type: "PERIODS_GETALL" }
            }
            case "PERIODS_GETONE": {
                const response = await hrApiService.get(PayrollEndPoints.UTILIDADES_PERIODS_GETONE(id))
                return { ...response.data, type: "PERIODS_GETONE" }
            }
            case "PERIODS_CREATE": {
                const response = await hrApiService.post(PayrollEndPoints.UTILIDADES_PERIODS_CREATE, data)
                return { ...response.data, type: "PERIODS_CREATE" }
            }
            case "PERIODS_CALCULATE": {
                const response = await hrApiService.post(PayrollEndPoints.UTILIDADES_PERIODS_CALCULATE(id), {})
                return { ...response.data, type: "PERIODS_CALCULATE" }
            }
            case "PERIODS_APPROVE": {
                const response = await hrApiService.post(PayrollEndPoints.UTILIDADES_PERIODS_APPROVE(id), {})
                return { ...response.data, type: "PERIODS_APPROVE" }
            }
            case "PERIODS_PAY": {
                const response = await hrApiService.post(PayrollEndPoints.UTILIDADES_PERIODS_PAY(id), { payment_date, exchange_rate, method })
                return { ...response.data, type: "PERIODS_PAY" }
            }
            case "PAYMENTS_GETALL": {
                const params = new URLSearchParams()
                if (id) params.append("period", id)
                if (data?.employee) params.append("employee", data.employee)
                if (data?.status) params.append("status", data.status)
                params.append("page", page)
                params.append("limit", limit)
                const response = await hrApiService.get(`${PayrollEndPoints.UTILIDADES_PAYMENTS_GETALL}?${params}`)
                return { ...response.data, type: "PAYMENTS_GETALL" }
            }
            case "PAYMENTS_GETONE": {
                const response = await hrApiService.get(PayrollEndPoints.UTILIDADES_PAYMENTS_GETONE(id))
                return { ...response.data, type: "PAYMENTS_GETONE" }
            }
            case "PAYMENTS_PAY": {
                const response = await hrApiService.post(PayrollEndPoints.UTILIDADES_PAYMENTS_PAY(id), { payment_date, exchange_rate })
                return { ...response.data, type: "PAYMENTS_PAY" }
            }
            default:
                throw new Error("Tipo de operación inválida")
        }
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message })
    }
})