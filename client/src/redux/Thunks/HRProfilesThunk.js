import { createAsyncThunk } from "@reduxjs/toolkit"
import { hrApiService } from "../apis/HRApiService"

const HRProfilesEndPoints = {
    GET_ALL:            "/api/v1/hr-profiles/all",
    INVITE:             "/api/v1/hr-profiles/invite",
    UPDATE_PERMISSIONS: "/api/v1/hr-profiles/update-permissions",
    UPDATE_ROLE:        "/api/v1/hr-profiles/update-role",
    TOGGLE_ACTIVE:      "/api/v1/hr-profiles/toggle-active",
    DELETE:             (hrID) => `/api/v1/hr-profiles/delete/${hrID}`,
}

export const HandleHRProfiles = createAsyncThunk(
    "HRProfiles/action",
    async (payload, { rejectWithValue }) => {
        try {
            const { type, data } = payload

            if (type === "GetAll") {
                const res = await hrApiService.get(HRProfilesEndPoints.GET_ALL)
                return { ...res.data, type: "GetAll" }
            }

            if (type === "Invite") {
                console.log("[LOG] HandleHRProfiles Invite - ENVIANDO DATOS:", data)
                const res = await hrApiService.post(HRProfilesEndPoints.INVITE, data)
                console.log("[LOG] HandleHRProfiles Invite - RESPUESTA:", res.data)
                return { ...res.data, type: "Invite" }
            }

            if (type === "UpdatePermissions") {
                const res = await hrApiService.patch(HRProfilesEndPoints.UPDATE_PERMISSIONS, data)
                return { ...res.data, type: "UpdatePermissions" }
            }

            if (type === "UpdateRole") {
                const res = await hrApiService.patch(HRProfilesEndPoints.UPDATE_ROLE, data)
                return { ...res.data, type: "UpdateRole" }
            }

            if (type === "ToggleActive") {
                const res = await hrApiService.patch(HRProfilesEndPoints.TOGGLE_ACTIVE, data)
                return { ...res.data, type: "ToggleActive" }
            }

            if (type === "Delete") {
                const res = await hrApiService.delete(HRProfilesEndPoints.DELETE(data.hrID))
                return { ...res.data, type: "Delete", hrID: data.hrID }
            }

        } catch (error) {
            console.error("[LOG] HandleHRProfiles - ERROR:", error.response?.data || error.message)
            return rejectWithValue(error.response?.data || { message: "Error desconocido" })
        }
    }
)
