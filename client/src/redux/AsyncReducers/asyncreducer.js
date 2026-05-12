export const AsyncReducer = (builder, thunk) => {
    builder
        .addCase(thunk.pending, (state) => {
            state.isLoading = true;
            state.error.content = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
            state.isLoading = false;
            state.error.status = false;
            state.data = action.payload;
            if (action.payload.resetpassword) {
                state.isAuthenticated = false;
                state.isResetPasswords = action.payload.success
            }
            else {
                state.isAuthenticated = action.payload.success;
            }
        })
        .addCase(thunk.rejected, (state, action) => {
            if (action.payload.gologin) {
                state.isLoading = false;
                state.error.status = false;
                state.error.message = action.payload.message
                state.error.content = action.payload
            }
            else {
                state.isLoading = false;
                state.error.status = true;
                state.error.message = action.payload.message
                state.error.content = action.payload
            }
        });
};

export const HRAsyncReducer = (builder, thunk) => {
    builder
        .addCase(thunk.pending, (state) => {
            state.isLoading = true;
            state.error.content = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
            if (action.payload.type == "signup") {
                state.isSignUp = true
                state.isLoading = false;
                state.isAuthenticated = true
                state.isAuthourized = true
                state.isVerifiedEmailAvailable = true
                state.error.status = false;
                state.data = action.payload;
            }
            if ((action.payload.type == "checkHR") || (action.payload.type == "HRLogin") || (action.payload.type == "HRforgotpassword")) {
                state.isSignUp = true
                state.isLoading = false;
                state.isAuthenticated = true
                state.isAuthourized = true
                state.error.status = false;
                // Preserve existing data, only update role/permissions if provided
                state.data = {
                    ...state.data,
                    ...(action.payload.role && { role: action.payload.role }),
                    ...(action.payload.permissions && { permissions: action.payload.permissions })
                }
            }
            if (action.payload.type == "HRverifyemail") {
                state.isSignUp = true
                state.isLoading = false;
                state.isAuthenticated = true
                state.isAuthourized = true
                state.isVerifiedEmailAvailable = false
                state.isVerified = true
                state.error.status = false;
                state.data = action.payload;
            }
            if (action.payload.type == "HRcodeavailable") {
                state.isSignUp = true
                state.isLoading = false;
                state.isAuthenticated = true
                state.isAuthourized = true
                if (action.payload.alreadyverified) {
                    state.isVerified = true
                }
                else {
                    state.isVerified = false
                }
                state.isVerifiedEmailAvailable = true
                state.error.status = false;
                state.data = action.payload;
            }
            if (action.payload.resetpassword) {
                state.isSignUp = true
                state.isLoading = false;
                state.isAuthenticated = false;
                state.isResetPassword = true
                state.error.status = false;
                state.data = action.payload;
            }
            if (action.payload.type == "HRResendVerifyEmail") {
                state.isSignUp = true
                state.isLoading = false;
                state.isAuthenticated = true
                state.isVerifiedEmailAvailable = true
                state.error.status = false;
                state.data = action.payload;
            }
            if (action.payload.type == "HRMe") {
                state.isLoading = false;
                state.error.status = false;
                // Actualizar todos los campos del HR desde /me
                state.data = {
                    ...state.data,
                    ...action.payload.data
                }
            }
        })
        .addCase(thunk.rejected, (state, action) => {
            if (action.payload.type == "signup") {
                state.isSignUp = false
                state.isLoading = false;
                state.error.status = true;
                state.error.message = action.payload.message
                state.error.content = action.payload
            }
            if (action.payload.type == "HRcodeavailable") {
                state.isLoading = false;
                state.isAuthourized = true
                state.isVerified = false
                state.isVerifiedEmailAvailable = false
                state.error.status = false;
                state.error.content = action.payload
            }
            if (action.payload.gologin) {
                state.isSignUp = false
                state.isLoading = false;
                state.isAuthenticated = false
                state.error.status = false;
                state.error.message = action.payload.message
                state.error.content = action.payload
            }
            else {
                state.isLoading = false;
                state.error.status = true;
                state.error.message = action.payload.message
                state.error.content = action.payload
            }
        });
}

export const HRDashboardAsyncReducer = (builder, thunk) => {
    builder.addCase(thunk.pending, (state) => {
        state.isLoading = true;
        state.error.content = null;
    })
    builder.addCase(thunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error.status = false;
        state.data = action.payload.data;
        state.success = action.payload.success
    })
    builder.addCase(thunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error.status = true;
        state.error.message = action.payload.message
        state.error.content = action.payload;
    })
}

export const HREmployeesPageAsyncReducer = (builder, thunk) => {
    builder.addCase(thunk.pending, (state) => {
        state.isLoading = true;
        state.error.content = null;
    })
    builder.addCase(thunk.fulfilled, (state, action) => {
        if (action.payload.type === "AllEmployees") {
            state.isLoading = false;
            state.error.status = false;
            state.error.message = null
            state.error.content = null;
            state.data = action.payload.data;
            state.success = action.payload.success
            state.fetchData = false
        }
        else if (action.payload.type === "EmployeeCreate" || action.payload.type === "EmployeeDelete") {
            state.isLoading = false;
            state.error.status = false;
            state.error.message = null
            state.error.content = null;
            state.data = action.payload.data;
            state.success = action.payload.success;
            state.fetchData = true
        }
        else if (action.payload.type === "GetEmployee") {
            state.isLoading = false;
            state.error.status = false;
            state.error.message = null
            state.error.content = null;
            state.employeeData = action.payload.data
        }
    })
    builder.addCase(thunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error.status = true;
        state.error.message = action.payload.message
        state.success = action.payload.success;
        state.error.content = action.payload;
    })
}

export const HRDepartmentPageAsyncReducer = (builder, thunk) => {
    builder.addCase(thunk.pending, (state) => {
        state.isLoading = true;
        state.error.content = null;
    })
    builder.addCase(thunk.fulfilled, (state, action) => {
        if (action.payload.type === "AllDepartments") {
            state.isLoading = false;
            state.error.status = false;
            state.error.message = null
            state.error.content = null;
            state.data = action.payload.data;
            state.fetchData = false
            state.success.status = false
            state.success.message = null
            state.success.content = null
        }
        else if (
            action.payload.type === "CreateDepartment" ||
            action.payload.type === "DepartmentDelete" ||
            action.payload.type === "DepartmentEMUpdate" ||
            action.payload.type === "DepartmentDEUpdate" ||
            action.payload.type === "RemoveEmployeeDE"
        ) {
            state.isLoading = false;
            state.error.status = false;
            state.error.message = null
            state.error.content = null;
            state.success.status = action.payload.success;
            state.success.message = action.payload.message;
            state.success.content = action.payload;
            state.fetchData = true
        }
        else if (action.payload.type === "GetDepartment") {
            state.isLoading = false;
            state.error.status = false;
            state.error.message = null
            state.error.content = null;
            state.departmentData = action.payload.data
        }
    })
    builder.addCase(thunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error.status = true;
        state.error.message = action.payload.message
        state.success = action.payload.success;
        state.error.content = action.payload;
    })
}

export const EmployeesIDsAsyncReducer = (builder, thunk) => {
    builder.addCase(thunk.pending, (state) => {
        state.isLoading = true;
        state.error.content = null;
    })
    builder.addCase(thunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error.message = null;
        state.error.content = null
        state.error.status = false;
        state.data = action.payload.data;
    })
    builder.addCase(thunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error.status = true;
        state.error.message = action.payload.message
        state.error.content = action.payload
    })
}

// ── HR Work Photos ────────────────────────────────────────────────────────
export const HRWorkPhotoAsyncReducer = (builder, thunk) => {
    builder.addCase(thunk.pending, (state) => {
        state.isLoading = true
        state.error.content = null
    })
    builder.addCase(thunk.fulfilled, (state, action) => {
        state.isLoading = false
        state.error.status = false
        state.error.message = null
        state.error.content = null

        if (action.payload.type === "GetAll" || action.payload.type === "GetEmployee") {
            state.photos = action.payload.data
        }
        else if (action.payload.type === "Review") {
            state.photos = state.photos.map(p =>
                p._id === action.payload.data._id ? action.payload.data : p
            )
        }
        else if (action.payload.type === "Delete") {
            state.photos = state.photos.filter(p => p._id !== action.payload.photoID)
        }
    })
    builder.addCase(thunk.rejected, (state, action) => {
        state.isLoading = false
        state.error.status = true
        state.error.message = action.payload?.message
        state.error.content = action.payload
    })
}

// ── HR Schedule ───────────────────────────────────────────────────────────
export const HRScheduleAsyncReducer = (builder, thunk) => {
    builder.addCase(thunk.pending, (state) => {
        state.isLoading = true;
        state.error.content = null;
    })
    builder.addCase(thunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error.status = false;
        state.error.message = null;
        state.error.content = null;

        if (action.payload.type === "GetAll") {
            state.data = action.payload.data;
            state.fetchData = false;
        }
        else if (action.payload.type === "GetEmployee") {
            state.employeeSchedules = action.payload.data;
        }
        else if (action.payload.type === "Create") {
            state.data = [action.payload.data, ...(state.data || [])];
            state.fetchData = false;
            state.success.status = true;
            state.success.message = action.payload.message;
        }
        else if (action.payload.type === "Update") {
            state.data = (state.data || []).map(s =>
                s._id === action.payload.data._id ? action.payload.data : s
            );
            state.success.status = true;
            state.success.message = action.payload.message;
        }
        else if (action.payload.type === "Delete") {
            state.data = (state.data || []).filter(s => s._id !== action.payload.scheduleID);
            state.success.status = true;
            state.success.message = action.payload.message;
        }
    })
    builder.addCase(thunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error.status = true;
        state.error.message = action.payload?.message;
        state.error.content = action.payload;
    })
}

// ── Employee Dashboard ────────────────────────────────────────────────────
export const EmployeeDashboardAsyncReducer = (builder, thunk) => {
    builder.addCase(thunk.pending, (state) => {
        state.isLoading = true;
        state.error.content = null;
    })
    builder.addCase(thunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error.status = false;
        state.error.message = null
        state.error.content = null

        if (action.payload.type === "MyAttendance") {
            state.attendance = action.payload.data
            state.fetchData = false
        }
        else if (action.payload.type === "rejected") {
        }
        else if (action.payload.type === "CheckIn" || action.payload.type === "CheckOut") {
            state.attendance = action.payload.data
            state.fetchData = false
        }
        else if (action.payload.type === "MySchedules") {
            state.schedules = action.payload.data
        }
        else if (action.payload.type === "CompleteTask") {
            state.schedules = state.schedules.map(s =>
                s._id === action.payload.data._id ? action.payload.data : s
            )
        }
        else if (action.payload.type === "UploadPhoto") {
            state.photos = [action.payload.data, ...state.photos]
        }
        else if (action.payload.type === "MyPhotos") {
            state.photos = action.payload.data
        }
        else if (action.payload.type === "DeletePhoto") {
            state.photos = state.photos.filter(p => p._id !== action.payload.photoID)
        }
    })
    builder.addCase(thunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error.status = true;
        state.error.message = action.payload?.message
        state.error.content = action.payload
    })
}

// ── HR Leaves ────────────────────────────────────────────────────────────
export const HRLeavesAsyncReducer = (builder, thunk, thunkName) => {
    builder.addCase(thunk.pending, (state) => {
        state.isLoading = true;
        state.error.content = null;
    })
    builder.addCase(thunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error.status = false;
        state.error.message = null;
        state.error.content = null;

        const payload = action.payload;
        
        // Obtener mis solicitudes (empleado)
        if (thunkName === "HandleGetEmployeeLeaves") {
            state.data = payload?.data || null;
            state.fetchData = false;
        }
        // Obtener mis ausencias aprobadas (empleado)
        else if (thunkName === "HandleGetEmployeeAbsences") {
            // Handle both cases: wrapped in data or direct array
            state.absencesData = payload?.data || payload || null;
        }
        // Obtener todas las solicitudes (HR)
        else if (thunkName === "HandleGetHRLeaves") {
            state.data = payload?.data || null;
            state.fetchData = false;
        }
        // Crear solicitud (empleado o HR)
        else if (thunkName === "HandleCreateEmployeeLeave" || thunkName === "HandleCreateLeaveByHR") {
            state.isLoading = false;
            state.error.status = false;
            state.error.message = null;
            state.error.content = null;
            
            // Agregar al estado si la respuesta es exitosa
            if (payload.success && payload.data) {
                state.data = state.data ? [...state.data, payload.data] : [payload.data];
            }
            state.success.status = payload.success;
            state.success.message = payload.message;
        }
        // Actualizar solicitud (empleado o HR)
        else if (thunkName === "HandleUpdateEmployeeLeave" || thunkName === "HandleUpdateLeaveByHR") {
            state.data = (state.data || []).map(leave =>
                leave._id === payload.data._id ? payload.data : leave
            );
            state.success.status = true;
            state.success.message = payload.message;
        }
        // Eliminar solicitud (empleado o HR)
        else if (thunkName === "HandleDeleteEmployeeLeave" || thunkName === "HandleDeleteLeaveByHR") {
            state.data = (state.data || []).filter(leave => leave._id !== action.meta.arg);
            state.success.status = true;
            state.success.message = payload.message;
        }
        // Aprobar/Rechazar solicitud (HR)
        else if (thunkName === "HandleUpdateHRLeaveStatus") {
            state.data = (state.data || []).map(leave =>
                leave._id === payload.data._id ? payload.data : leave
            );
            state.success.status = true;
            state.success.message = payload.message;
        }
    })
    builder.addCase(thunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error.status = true;
        state.error.message = action.payload?.message;
        state.success.status = false;
        state.error.content = action.payload;
    })
}
