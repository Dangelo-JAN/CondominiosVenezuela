import { createSlice } from "@reduxjs/toolkit"
import { HRNotificationsAsyncReducer } from "../AsyncReducers/asyncreducer.js"
import {
    HandleGetMyNotifications,
    HandleGetUnreadNotificationCount,
    HandleMarkNotificationRead,
    HandleMarkAllNotificationsRead
} from "../Thunks/HRNotificationsThunk.js"

const HRNotificationsSlice = createSlice({
    name: "HRNotifications",
    initialState: {
        notifications: null,   // Array de notificaciones
        unreadCount: 0,        // Conteo de no leídas
        isLoading: false,
        success: false,
        error: {
            status: false,
            message: null,
            content: null
        }
    },
    extraReducers: (builder) => {
        HRNotificationsAsyncReducer(builder, HandleGetMyNotifications, "HandleGetMyNotifications")
        HRNotificationsAsyncReducer(builder, HandleGetUnreadNotificationCount, "HandleGetUnreadNotificationCount")
        HRNotificationsAsyncReducer(builder, HandleMarkNotificationRead, "HandleMarkNotificationRead")
        HRNotificationsAsyncReducer(builder, HandleMarkAllNotificationsRead, "HandleMarkAllNotificationsRead")
    }
})

export default HRNotificationsSlice.reducer
