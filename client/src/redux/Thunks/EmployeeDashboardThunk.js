import { createAsyncThunk } from "@reduxjs/toolkit"
import { employeeApiService } from "../apis/EmployeeApiService"

const EmployeeEndPoints = {
    MY_ATTENDANCE:  "/api/v1/attendance/my-attendance",
    CHECKIN:        "/api/v1/attendance/checkin",
    CHECKOUT:       "/api/v1/attendance/checkout",
    MY_SCHEDULES:   "/api/v1/schedule/my-schedules",
    COMPLETE_TASK:  "/api/v1/schedule/complete-task",
    UPLOAD_PHOTO:   "/api/v1/workphoto/upload",
    MY_PHOTOS:      "/api/v1/workphoto/my-photos",
    DELETE_PHOTO:   (photoID) => `/api/v1/workphoto/delete/${photoID}`,
}

export const HandleEmployeeDashboard = createAsyncThunk(
    "employeeDashboard/action",
    async (payload, { rejectWithValue }) => {
        try {
            const { type, data } = payload

            if (type === "MyAttendance") {
                const res = await employeeApiService.get(EmployeeEndPoints.MY_ATTENDANCE)
                return { ...res.data, type: "MyAttendance" }
            }

            if (type === "CheckIn") {
                const res = await employeeApiService.patch(EmployeeEndPoints.CHECKIN, {})
                return { ...res.data, type: "CheckIn" }
            }

            if (type === "CheckOut") {
                const res = await employeeApiService.patch(EmployeeEndPoints.CHECKOUT, {})
                return { ...res.data, type: "CheckOut" }
            }

            if (type === "MySchedules") {
                const res = await employeeApiService.get(EmployeeEndPoints.MY_SCHEDULES)
                return { ...res.data, type: "MySchedules" }
            }

            if (type === "CompleteTask") {
                const res = await employeeApiService.patch(EmployeeEndPoints.COMPLETE_TASK, data)
                return { ...res.data, type: "CompleteTask" }
            }

            if (type === "UploadPhoto") {
                // Si es FormData, no setear Content-Type para que el browser agregue el multipart boundary
                const headers = payload.isFormData ? { "Content-Type": "multipart/form-data" } : {}
                const res = await employeeApiService.post(EmployeeEndPoints.UPLOAD_PHOTO, data, { headers })
                return { ...res.data, type: "UploadPhoto" }
            }

            if (type === "MyPhotos") {
                const res = await employeeApiService.get(EmployeeEndPoints.MY_PHOTOS)
                return { ...res.data, type: "MyPhotos" }
            }

            if (type === "DeletePhoto") {
                const { photoID } = data
                const res = await employeeApiService.delete(EmployeeEndPoints.DELETE_PHOTO(photoID))
                return { ...res.data, type: "DeletePhoto", photoID }
            }

        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Error desconocido" })
        }
    }
)
