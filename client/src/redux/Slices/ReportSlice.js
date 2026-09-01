import { createSlice } from "@reduxjs/toolkit"
import { ReportAsyncReducer } from "../AsyncReducers/asyncreducer.js"
import {
    HandleGetCurrentReport,
    HandleGetReportHistory,
    HandleGetSnapshotByWeek,
    HandleGetMyReport,
    HandleGetMyReportHistory
} from "../Thunks/ReportThunk.js"

const ReportSlice = createSlice({
    name: "Report",
    initialState: {
        currentReport: null,   // Payload del reporte vigente (modo + daily + weekly)
        history: [],           // Snapshots cerrados (histórico inmutable, listado liviano)
        selectedSnapshot: null,// Snapshot completo de una semana específica
        myHistory: [],         // MIS semanas cerradas (empleado — solo actividades propias)
        isLoading: false,
        success: false,
        message: null,
        error: {
            status: false,
            message: null,
            content: null
        }
    },
    extraReducers: (builder) => {
        ReportAsyncReducer(builder, HandleGetCurrentReport, "HandleGetCurrentReport")
        ReportAsyncReducer(builder, HandleGetMyReport, "HandleGetMyReport")
        ReportAsyncReducer(builder, HandleGetReportHistory, "HandleGetReportHistory")
        ReportAsyncReducer(builder, HandleGetSnapshotByWeek, "HandleGetSnapshotByWeek")
        ReportAsyncReducer(builder, HandleGetMyReportHistory, "HandleGetMyReportHistory")
    }
})

export default ReportSlice.reducer
