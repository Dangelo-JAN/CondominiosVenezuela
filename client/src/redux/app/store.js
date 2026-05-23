import { configureStore } from '@reduxjs/toolkit'
import EmployeeReducer from "../Slices/EmployeeSlice.js"
import HRReducer from '../Slices/HRSlice.js'
import DashbaordReducer from "../Slices/DashboardSlice.js"
import HREmployeesPageReducer from '../Slices/HREmployeesPageSlice.js'
import HRDepartmentPageReducer from '../Slices/HRDepartmentPageSlice.js'
import EMployeesIDReducer from '../Slices/EmployeesIDsSlice.js'
import EmployeeDashboardReducer from '../Slices/EmployeeDashboardSlice.js'
import HRScheduleReducer from '../Slices/HRScheduleSlice.js'
import HRWorkPhotoReducer from '../Slices/HRWorkPhotoSlice.js'
import HRProfilesReducer from '../Slices/HRProfilesSlice.js'
import HRLeavesReducer from '../Slices/HRLeavesSlice.js'
import HRBitacorasReducer from '../Slices/HRBitacorasSlice.js'
import HRNotificationsReducer from '../Slices/HRNotificationsSlice.js'

export const store = configureStore({
    reducer: {
        employeereducer: EmployeeReducer,
        HRReducer: HRReducer,
        dashboardreducer: DashbaordReducer,
        HREmployeesPageReducer: HREmployeesPageReducer,
        HRDepartmentPageReducer: HRDepartmentPageReducer,
        EMployeesIDReducer: EMployeesIDReducer,
        employeedashboardreducer: EmployeeDashboardReducer,
        HRScheduleReducer: HRScheduleReducer,
        HRWorkPhotoReducer: HRWorkPhotoReducer,
        HRProfilesReducer: HRProfilesReducer,
        HRLeavesReducer: HRLeavesReducer,
        HRBitacorasReducer: HRBitacorasReducer,
        HRNotificationsReducer: HRNotificationsReducer,
    }
})
