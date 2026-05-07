import { createAsyncThunk } from '@reduxjs/toolkit'
import { employeeApiService } from '../apis/EmployeeApiService'
import { APIsEndPoints } from '../apis/APIsEndpoints.js'

export const HandleGetEmployees = createAsyncThunk("handleGetEmployees", async (EmployeeData, { rejectWithValue }) => {
    try {
        const { apiroute } = EmployeeData
        const response = await employeeApiService.get(`${APIsEndPoints[apiroute]}`)
        return response.data
    } catch (error) {
        return rejectWithValue(error.response.data)
    }
})

export const HandlePostEmployees = createAsyncThunk("HandlePostEmployees", async (EmployeeData, { rejectWithValue }) => {
    try {
        const { apiroute, data, type } = EmployeeData

        if (type === "resetpassword") {
            const response = await employeeApiService.post(`${APIsEndPoints.RESET_PASSWORD(apiroute)}`, data)
            return response.data
        }

        const response = await employeeApiService.post(`${APIsEndPoints[apiroute]}`, data)

        if (apiroute === "LOGIN" && response.data?.token) {
            localStorage.setItem("EMtoken", response.data.token)
        }

        if (apiroute === "LOGOUT") {
            localStorage.removeItem("EMtoken")
        }

        return response.data
    } catch (error) {
        return rejectWithValue(error.response.data)
    }
})

export const HandlePutEmployees = createAsyncThunk("HandlePutEmployees", async (EmployeeData, { rejectWithValue }) => {
    try {
        const { apiroute, data } = EmployeeData
        const response = await employeeApiService.put(`${APIsEndPoints[apiroute]}`, data)
        return response.data
    } catch (error) {
        return rejectWithValue(error.response.data)
    }
})

export const HandlePatchEmployees = createAsyncThunk("HandlePatchEmployees", async (EmployeeData, { rejectWithValue }) => {
    try {
        const { apiroute, data } = EmployeeData
        const response = await employeeApiService.patch(`${APIsEndPoints[apiroute]}`, data)
        return response.data
    } catch (error) {
        return rejectWithValue(error.response.data)
    }
})

export const HandleDeleteEmployees = createAsyncThunk("HandleDeleteEmployees", async (EmployeeData, { rejectWithValue }) => {
    try {
        const { apiroute } = EmployeeData
        const response = await employeeApiService.delete(`${APIsEndPoints[apiroute]}`)
        return response.data
    } catch (error) {
        return rejectWithValue(error.response.data)
    }
})

// HandleEmployeeVerifyEmail eliminado - ya no se usa (ver issue #013)
