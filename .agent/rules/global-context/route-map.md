---
trigger: always_on
---

# 🗺️ Mapa de Rutas

## Rutas Públicas
| Ruta | Descripción |
|------|-------------|
| `/` | Landing page |
| `/auth/HR/signup` | Registro HR |
| `/auth/employee/login` | Login empleado |

## Portal HR (Protegido)
| Ruta | Descripción |
|------|-------------|
| `/HR/dashboard/employees` | Gestión de Personal |
| `/HR/dashboard/departments` | Estructura de Departamentos |
| `/HR/dashboard/leaves` | Ausencias |
| `/HR/dashboard/requests` | Solicitudes |
| `/HR/dashboard/hr-profile` | Mi Perfil (autoedición) |
| `/HR/dashboard/bitacoras` | Novedades / Bitácoras |
| `/HR/dashboard/reports` | Reportes de Actividad (semana actual + histórico snapshots 🔒) |

## Portal Empleado (Protegido)
| Ruta | Descripción |
|------|-------------|
| `/auth/employee/employee-dashboard/home` | Inicio (asistencia, tareas, actividades del depto) |
| `/auth/employee/employee-dashboard/schedule` | Mi Horario |
| `/auth/employee/employee-dashboard/photos` | Mis Fotos de Trabajo |
| `/auth/employee/employee-dashboard/profile` | Mi Perfil |
| `/auth/employee/employee-dashboard/requests` | Solicitudes |
| `/auth/employee/employee-dashboard/absences` | Ausencias |
| `/auth/employee/employee-dashboard/bitacoras` | Mis Bitácoras |
| `/auth/employee/employee-dashboard/reports` | Mis Reportes Semanales (aislado por token 🔒) |

## API Reportes (`/api/v1/report`)
| Endpoint | Auth | Descripción |
|----------|------|-------------|
| `GET /current` | HR + PermissionCheck("bitacoras","read") | Reporte vigente org completa (matriz temporal) |
| `GET /history` | HR + permiso | Histórico liviano de snapshots cerrados (máx 52) |
| `GET /history/:isoYear/:weekNumber` | HR + permiso | Snapshot completo e inmutable |
| `GET /my-report` | EmployeeToken | Reporte vigente depto-scoped |
| `GET /my-history` | EmployeeToken | SUS semanas cerradas (solo su entrada del snapshot) |
| `GET /cron/close-week` | Sin auth (cron-job.org) | Cierra semana anterior para todas las orgs (idempotente) |
