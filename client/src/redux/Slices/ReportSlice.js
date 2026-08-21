import { createSlice } from "@reduxjs/toolkit"
import { ReportAsyncReducer } from "../AsyncReducers/asyncreducer.js"
import {
    HandleGetCurrentReport,
    HandleGetReportHistory,
    HandleGetSnapshotByWeek,
    HandleGetMyReport
} from "../Thunks/ReportThunk.js"

const ReportSlice = createSlice({
    name: "Report",
    initialState: {
        currentReport: null,   // Payload del reporte vigente (modo + daily + weekly)
        history: [],           // Snapshots cerrados (histórico inmutable, listado liviano)
        selectedSnapshot: null,// Snapshot completo de una semana específica
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
    }
})

export default ReportSlice.reducer
