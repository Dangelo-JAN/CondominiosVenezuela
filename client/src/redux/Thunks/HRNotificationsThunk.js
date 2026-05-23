import { createAsyncThunk } from "@reduxjs/toolkit"
import { hrApiService } from "../apis/HRApiService"
import { HRNotificationsEndPoints } from "../apis/APIsEndpoints"

// Obtener notificaciones del HR logueado
export const HandleGetMyNotifications = createAsyncThunk(
    'HandleGetMyNotifications',
    async (_, { rejectWithValue }) => {
        try {
            const response = await hrApiService.get(HRNotificationsEndPoints.GET_MY)
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message)
        }
    }
)

// Obtener conteo de notificaciones no leídas
export const HandleGetUnreadNotificationCount = createAsyncThunk(
    'HandleGetUnreadNotificationCount',
    async (_, { rejectWithValue }) => {
        try {
            const response = await hrApiService.get(HRNotificationsEndPoints.UNREAD_COUNT)
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message)
        }
    }
)

// Marcar una notificación como leída
export const HandleMarkNotificationRead = createAsyncThunk(
    'HandleMarkNotificationRead',
    async (notificationID, { rejectWithValue }) => {
        try {
            const response = await hrApiService.patch(HRNotificationsEndPoints.MARK_READ(notificationID))
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message)
        }
    }
)

// Marcar todas las notificaciones como leídas
export const HandleMarkAllNotificationsRead = createAsyncThunk(
    'HandleMarkAllNotificationsRead',
    async (_, { rejectWithValue }) => {
        try {
            const response = await hrApiService.patch(HRNotificationsEndPoints.MARK_ALL_READ)
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message)
        }
    }
)
