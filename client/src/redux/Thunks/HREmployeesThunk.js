import { createAsyncThunk } from "@reduxjs/toolkit"
import { hrApiService } from "../apis/HRApiService"
import { HREmployeesPageEndPoints } from "../apis/APIsEndpoints"

export const HandleGetHREmployees = createAsyncThunk('HandleGetHREmployees', async (HREmployeeData, { rejectWithValue }) => {
    try {
        const { apiroute } = HREmployeeData
        const response = await hrApiService.get(`${HREmployeesPageEndPoints[apiroute]}`)
        return response.data
    } catch (error) {
        return rejectWithValue(error.response.data)
    }
})

export const HandlePostHREmployees = createAsyncThunk('HandlePostHREmploy', async (HREmployeeData, { rejectWithValue }) => {
    try {
        const { apiroute, data } = HREmployeeData
        console.log("[LOG THUNK] HandlePostHREmployees - apiroute:", apiroute)
        console.log("[LOG THUNK] HandlePostHREmployees - ENVIANDO DATOS:", data)
        
        const endpoint = HREmployeesPageEndPoints[apiroute]
        console.log("[LOG THUNK] HandlePostHREmployees - endpoint:", endpoint)
        
        const response = await hrApiService.post(endpoint, data)
        
        console.log("[LOG THUNK] HandlePostHREmployees - RESPUESTA STATUS:", response.status)
        console.log("[LOG THUNK] HandlePostHREmployees - RESPUESTA DATA:", response.data)
        return response.data
    } catch (error) {
        console.error("[LOG THUNK] HandlePostHREmployees - ERROR:", error.response?.data || error.message)
        return rejectWithValue(error.response.data)
    }
})

export const HandleDeleteHREmployees = createAsyncThunk("HandleDeleteHREmployees", async (HREmployeeData, { rejectWithValue }) => {
    try {
        const { apiroute } = HREmployeeData
        const RouteArray = apiroute.split(".")
        if (RouteArray.length > 0) {
            const response = await hrApiService.delete(`${HREmployeesPageEndPoints[RouteArray[0]](RouteArray[1])}`)
            return response.data
        }
    } catch (error) {
        return rejectWithValue(error.response.data)
    }
})
