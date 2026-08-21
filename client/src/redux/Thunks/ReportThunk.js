import { createAsyncThunk } from "@reduxjs/toolkit"
import { hrApiService } from "../apis/HRApiService"
import { employeeApiService } from "../apis/EmployeeApiService"
import { ReportEndPoints } from "../apis/APIsEndpoints"

// ============ HR ============

// Reporte vigente (matriz temporal: WEEK_START / DAILY / WEEKLY_LIVE) — toda la organización
export const HandleGetCurrentReport = createAsyncThunk(
    'HandleGetCurrentReport',
    async (_, { rejectWithValue }) => {
        try {
            const response = await hrApiService.get(ReportEndPoints.GET_CURRENT)
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message)
        }
    }
)

// Histórico de snapshots cerrados (listado liviano, máx 52 semanas)
export const HandleGetReportHistory = createAsyncThunk(
    'HandleGetReportHistory',
    async (_, { rejectWithValue }) => {
        try {
            const response = await hrApiService.get(ReportEndPoints.GET_HISTORY)
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message)
        }
    }
)

// Snapshot completo e inmutable de una semana específica
export const HandleGetSnapshotByWeek = createAsyncThunk(
    'HandleGetSnapshotByWeek',
    async ({ isoYear, weekNumber }, { rejectWithValue }) => {
        try {
            const response = await hrApiService.get(ReportEndPoints.GET_BY_WEEK(isoYear, weekNumber))
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message)
        }
    }
)

// ============ EMPLEADO ============

// Reporte vigente filtrado al departamento del empleado autenticado
export const HandleGetMyReport = createAsyncThunk(
    'HandleGetMyReport',
    async (_, { rejectWithValue }) => {
        try {
            const response = await employeeApiService.get(ReportEndPoints.GET_MY_REPORT)
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message)
        }
    }
)
