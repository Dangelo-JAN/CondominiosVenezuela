import { createAsyncThunk } from "@reduxjs/toolkit"
import { hrApiService } from "../apis/HRApiService"
import { employeeApiService } from "../apis/EmployeeApiService"
import { HRBitacorasEndPoints } from "../apis/APIsEndpoints"

// ============ EMPLEADO ============

// Crear bitácora (empleado)
export const HandleCreateBitacora = createAsyncThunk(
    'HandleCreateBitacora',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await employeeApiService.post(HRBitacorasEndPoints.CREATE, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message)
        }
    }
)

// Actualizar bitácora propia (empleado)
export const HandleUpdateBitacora = createAsyncThunk(
    'HandleUpdateBitacora',
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            const response = await employeeApiService.patch(HRBitacorasEndPoints.UPDATE(id), formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message)
        }
    }
)

// Obtener mis bitácoras (empleado)
export const HandleGetMyBitacoras = createAsyncThunk(
    'HandleGetMyBitacoras',
    async (_, { rejectWithValue }) => {
        try {
            const response = await employeeApiService.get(HRBitacorasEndPoints.GET_MY)
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message)
        }
    }
)


// ============ HR ============

// Obtener todas las bitácoras (HR)
export const HandleGetAllBitacoras = createAsyncThunk(
    'HandleGetAllBitacoras',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await hrApiService.get(HRBitacorasEndPoints.GET_ALL, { params })
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message)
        }
    }
)

// Eliminar bitácora (HR - soft-delete)
export const HandleDeleteBitacoraByHR = createAsyncThunk(
    'HandleDeleteBitacoraByHR',
    async (bitacoraID, { rejectWithValue }) => {
        try {
            const response = await hrApiService.delete(HRBitacorasEndPoints.DELETE(bitacoraID))
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message)
        }
    }
)
