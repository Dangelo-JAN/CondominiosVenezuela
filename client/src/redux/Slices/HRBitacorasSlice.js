import { createSlice } from "@reduxjs/toolkit"
import { HRBitacorasAsyncReducer } from "../AsyncReducers/asyncreducer.js"
import {
    HandleCreateBitacora,
    HandleUpdateBitacora,
    HandleGetMyBitacoras,
    HandleGetAllBitacoras,
    HandleDeleteBitacoraByHR
} from "../Thunks/HRBitacorasThunk.js"

const HRBitacorasSlice = createSlice({
    name: "HRBitacoras",
    initialState: {
        data: null,            // Array de bitácoras
        isLoading: false,
        success: false,        // Booleano (evita bug #B04)
        message: null,         // Mensaje de la operación
        error: {
            status: false,
            message: null,
            content: null
        }
    },
    extraReducers: (builder) => {
        // Empleado
        HRBitacorasAsyncReducer(builder, HandleCreateBitacora, "HandleCreateBitacora")
        HRBitacorasAsyncReducer(builder, HandleUpdateBitacora, "HandleUpdateBitacora")
        HRBitacorasAsyncReducer(builder, HandleGetMyBitacoras, "HandleGetMyBitacoras")

        // HR
        HRBitacorasAsyncReducer(builder, HandleGetAllBitacoras, "HandleGetAllBitacoras")
        HRBitacorasAsyncReducer(builder, HandleDeleteBitacoraByHR, "HandleDeleteBitacoraByHR")
    }
})

export default HRBitacorasSlice.reducer
