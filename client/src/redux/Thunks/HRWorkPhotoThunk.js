import { createAsyncThunk } from "@reduxjs/toolkit"
import { hrApiService } from "../apis/HRApiService"

const WorkPhotoEndPoints = {
    GET_ALL:         "/api/v1/workphoto/all",
    GET_EMPLOYEE:    (employeeID) => `/api/v1/workphoto/employee/${employeeID}`,
    REVIEW:          "/api/v1/workphoto/review",
    DELETE:          (photoID) => `/api/v1/workphoto/hr-delete/${photoID}`,
}

export const HandleHRWorkPhoto = createAsyncThunk(
    "HRWorkPhoto/action",
    async (payload, { rejectWithValue }) => {
        try {
            const { type, data } = payload

            if (type === "GetAll") {
                // Fase 6 (R3): data.params (opcional) → startDate/endDate
                const params = data?.params || {}
                const res = await hrApiService.get(WorkPhotoEndPoints.GET_ALL, { params })
                return { ...res.data, type: "GetAll" }
            }

            if (type === "GetEmployee") {
                const res = await hrApiService.get(WorkPhotoEndPoints.GET_EMPLOYEE(data.employeeID))
                return { ...res.data, type: "GetEmployee" }
            }

            if (type === "Review") {
                const res = await hrApiService.patch(WorkPhotoEndPoints.REVIEW, data)
                return { ...res.data, type: "Review" }
            }

            if (type === "Delete") {
                const res = await hrApiService.delete(WorkPhotoEndPoints.DELETE(data.photoID))
                return { ...res.data, type: "Delete", photoID: data.photoID }
            }

        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Error desconocido" })
        }
    }
)
