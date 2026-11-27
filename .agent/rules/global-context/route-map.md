---
trigger: always_on
---

# 🗺️ Mapa de Rutas

## Rutas Públicas
|| Ruta | Descripción ||
||------|-------------|
|| `/` | Landing page ||
|| `/auth/HR/signup` | Registro HR ||
|| `/auth/employee/login` | Login empleado ||

## Portal HR (Protegido)
|| Ruta | Descripción ||
||------|-------------|
|| `/HR/dashboard/employees` | Gestión de Personal ||
|| `/HR/dashboard/departments` | Estructura de Departamentos ||
|| `/HR/dashboard/leaves` | Ausencias ||
|| `/HR/dashboard/requests` | Solicitudes ||
|| `/HR/dashboard/hr-profile` | Mi Perfil (autoedición) ||
|| `/HR/dashboard/bitacoras` | Novedades / Bitácoras ||
|| `/HR/dashboard/work-photos` | Fotos de Trabajo (destino chip `photos`) ||
|| `/HR/dashboard/schedules` | Horarios ||
|| `/HR/dashboard/reports` | Reportes de Actividad (semana actual + histórico snapshots 🔒) ||
|| `/HR/dashboard/payroll` | Gestión de Nómina (períodos, recibos, conceptos, políticas) ||

## Portal Empleado (Protegido)
|| Ruta | Descripción ||
||------|-------------|
|| `/auth/employee/employee-dashboard/home` | Inicio (asistencia, tareas, actividades del depto) ||
|| `/auth/employee/employee-dashboard/schedule` | Mi Horario ||
|| `/auth/employee/employee-dashboard/photos` | Mis Fotos de Trabajo ||
|| `/auth/employee/employee-dashboard/profile` | Mi Perfil ||
|| `/auth/employee/employee-dashboard/requests` | Solicitudes ||
|| `/auth/employee/employee-dashboard/absences` | Ausencias ||
|| `/auth/employee/employee-dashboard/bitacoras` | Mis Bitácoras ||
|| `/auth/employee/employee-dashboard/reports` | Mis Reportes Semanales (aislado por token 🔒) ||

> **Convención de navegación (chips de reportes):** las rutas destino aceptan `?startDate=&endDate=` (fechas ISO de la ventana del reporte) y `schedule...?day=` para filtrar al montar. Aplicar en cualquier página que sea destino de un chip de `ReportTotalsBar`.

## API Nómina (`/api/v1/payroll`)
|| Endpoint | Auth | Descripción ||
||----------|------|-------------|
|| `GET /periods` | HR + PermissionCheck("payroll","read") | Listar períodos de nómina ||
|| `POST /periods` | HR + PermissionCheck("payroll","write") | Crear período de nómina ||
|| `GET /periods/:id` | HR + PermissionCheck("payroll","read") | Obtener período por ID ||
|| `PUT /periods/:id` | HR + PermissionCheck("payroll","write") | Actualizar período ||
|| `POST /periods/:id/calculate` | HR + PermissionCheck("payroll","calculate") | Calcular nómina del período ||
|| `POST /periods/:id/approve` | HR + PermissionCheck("payroll","approve") | Aprobar nómina del período ||
|| `POST /periods/:id/pay` | HR + PermissionCheck("payroll","pay") | Pagar nómina del período ||
|| `POST /periods/:id/recalculate` | HR + PermissionCheck("payroll","calculate") | Recalcular nómina del período ||
|| `GET /periods/:id/export` | HR + PermissionCheck("payroll","export") | Exportar nómina a Excel ||
|| `GET /receipts` | HR + PermissionCheck("payroll","read") | Listar recibos de nómina ||
|| `GET /receipts/:id` | HR + PermissionCheck("payroll","read") | Obtener recibo por ID ||
|| `GET /concepts` | HR + PermissionCheck("payroll","read") | Listar conceptos de nómina ||
|| `POST /concepts` | HR + PermissionCheck("payroll","write") | Crear concepto de nómina ||
|| `GET /concepts/:id` | HR + PermissionCheck("payroll","read") | Obtener concepto por ID ||
|| `PUT /concepts/:id` | HR + PermissionCheck("payroll","write") | Actualizar concepto ||
|| `GET /policies` | HR + PermissionCheck("payroll","read") | Listar políticas de nómina ||
|| `POST /policies` | HR + PermissionCheck("payroll","write") | Crear política de nómina ||
|| `GET /policies/:id` | HR + PermissionCheck("payroll","read") | Obtener política por ID ||
|| `PUT /policies/:id` | HR + PermissionCheck("payroll","write") | Actualizar política ||
|| `GET /novelties` | HR + PermissionCheck("payroll","read") | Listar novedades de nómina ||
|| `POST /novelties` | HR + PermissionCheck("payroll","write") | Crear novedad de nómina ||
|| `GET /vacations/balances` | HR + PermissionCheck("payroll","read") | Saldos de vacaciones ||
|| `POST /vacations/requests` | HR + PermissionCheck("payroll","write") | Solicitud de vacaciones ||
|| `GET /social-benefits/ledger` | HR + PermissionCheck("payroll","read") | Libro de prestaciones sociales ||
|| `GET /utilidades/periods` | HR + PermissionCheck("payroll","read") | Períodos de utilidades ||

## API Reportes (`/api/v1/report`)
|| Endpoint | Auth | Descripción ||
||----------|------|-------------|
|| `GET /current` | HR + PermissionCheck("bitacoras","read") | Reporte vigente org completa (matriz temporal) ||
|| `GET /history` | HR + permiso | Histórico liviano de snapshots cerrados (máx 52) ||
|| `GET /history/:isoYear/:weekNumber` | HR + permiso | Snapshot completo e inmutable ||
|| `GET /my-report` | EmployeeToken | Reporte vigente depto-scoped ||
|| `GET /my-history` | EmployeeToken | SUS semanas cerradas (solo su entrada del snapshot) ||
|| `GET /cron/close-week` | Sin auth (cron-job.org) | Cierra semana anterior para todas las orgs (idempotente) ||