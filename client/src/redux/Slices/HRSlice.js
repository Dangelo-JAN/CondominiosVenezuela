import { createSlice } from "@reduxjs/toolkit";
import { HRAsyncReducer } from "../AsyncReducers/asyncreducer.js";
import { HandlePostHumanResources, HandleGetHumanResources, HandlePatchHumanResources } from "../Thunks/HRThunk.js";

const HRSlice = createSlice({
    name: "HumanResources",
    initialState: {
        data: null,
        isLoading: false,
        isAuthenticated: false,
        isSignUp: false,
        isAuthourized: false,
        isVerified: false,
        isVerifiedEmailAvailable : false, 
        isResetPassword: false,
        error: {
            status: false,  
            message: null,
            content: null
        }
    },
    reducers: {
        // ✅ Acción síncrona para resetear todo el estado al hacer logout
        logoutHR: (state) => {
            state.data = null
            state.isLoading = false
            state.isAuthenticated = false
            state.isSignUp = false
            state.isAuthourized = false
            state.isVerified = false
            state.isVerifiedEmailAvailable = false
            state.isResetPassword = false
            state.error = { status: false, message: null, content: null }
        }
    },
    extraReducers: (builder) => {
        HRAsyncReducer(builder, HandlePostHumanResources)
        HRAsyncReducer(builder, HandleGetHumanResources)

        // ── HandlePatchHumanResources (profile update) ──────────────────────
        builder
            .addCase(HandlePatchHumanResources.pending, (state) => {
                state.isLoading = true
                state.error.content = null
            })
            .addCase(HandlePatchHumanResources.fulfilled, (state, action) => {
                state.isLoading = false
                state.error.status = false
                // Merge updated profile data into existing state.data
                if (action.payload.data) {
                    state.data = { ...state.data, ...action.payload.data }
                }
            })
            .addCase(HandlePatchHumanResources.rejected, (state, action) => {
                state.isLoading = false
                state.error.status = true
                state.error.message = action.payload?.message
                state.error.content = action.payload
            })
    }
})

export const { logoutHR } = HRSlice.actions  // ✅ línea faltante
export default HRSlice.reducer
