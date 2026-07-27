import { createAsyncThunk } from "@reduxjs/toolkit"
import { hrApiService } from "../apis/HRApiService"
import { HREndPoints } from "../apis/APIsEndpoints"
import { logoutHR } from "../Slices/HRSlice"

export const HandleGetHumanResources = createAsyncThunk("HandleGetHumanResources", async (HRData, { rejectWithValue }) => {
    try {
        const { apiroute } = HRData
        const response = await hrApiService.get(`${HREndPoints[apiroute]}`)
        return response.data
    } catch (error) {
        return rejectWithValue(error.response.data)
    }
})

export const HandlePostHumanResources = createAsyncThunk("HandlePostHumanResources", async (HRData, { rejectWithValue }) => {
    try {
        const { apiroute, data, type } = HRData

        if (type === "resetpassword") {
            const response = await hrApiService.post(`${HREndPoints.RESET_PASSWORD(apiroute)}`, data)
            return response.data
        }

        const response = await hrApiService.post(`${HREndPoints[apiroute]}`, data)

        if ((apiroute === "LOGIN" || apiroute === "SIGNUP") && response.data?.token) {
            localStorage.setItem("HRtoken", response.data.token)
        }

        return response.data
    } catch (error) {
        return rejectWithValue(error.response.data)
    }
})

export const HandleHRLogout = createAsyncThunk("HandleHRLogout", async (_, { dispatch, rejectWithValue }) => {
    try {
        const response = await hrApiService.post(HREndPoints["LOGOUT"], {})
        localStorage.removeItem("HRtoken")
        dispatch(logoutHR())
        return response.data
    } catch (error) {
        localStorage.removeItem("HRtoken")
        dispatch(logoutHR())
        return rejectWithValue(error?.response?.data)
    }
})

export const HandlePutHumanResources    = createAsyncThunk("HandlePutHumanResources",    async (HRData, { rejectWithValue }) => { })
export const HandlePatchHumanResources  = createAsyncThunk("HandlePatchHumanResources", async (HRData, { rejectWithValue }) => {
    try {
        const { Updatedata } = HRData
        const response = await hrApiService.patch(`${HREndPoints.UPDATE_ME}`, { Updatedata })
        return { ...response.data, type: "UpdateMyProfile" }
    } catch (error) {
        return rejectWithValue(error.response.data)
    }
})
export const HandleDeleteHumanResources = createAsyncThunk("HandleDeleteHumanResources", async (HRData, { rejectWithValue }) => { })
