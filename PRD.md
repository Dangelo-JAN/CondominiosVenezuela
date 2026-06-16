# 🇻🇪 Condominios Venezuela SGC — Product Requirements Document (PRD)

> **Versión:** 1.0.0  
> **Fecha:** 2026-06-10  
> **Estado:** 🟢 Activo — En Desarrollo Continuo  
> **Repositorio:** `condominios-venezuela` (anteriormente EMS)  
> **Lema:** *"Gestiona tu equipo de forma inteligente"*

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Visión y Estrategia de Producto](#2-visión-y-estrategia-de-producto)
3. [Arquitectura del Sistema](#3-arquitectura-del-sistema)
4. [Stack Tecnológico](#4-stack-tecnológico)
5. [Modelo de Datos](#5-modelo-de-datos)
6. [Módulos Funcionales](#6-módulos-funcionales)
7. [API REST — Endpoints Completos](#7-api-rest--endpoints-completos)
8. [Sistema de Roles y Permisos](#8-sistema-de-roles-y-permisos)
9. [Flujo de Autenticación](#9-flujo-de-autenticación)
10. [UI/UX y Sistema de Diseño](#10-uiux-y-sistema-de-diseño)
11. [Infraestructura y DevOps](#11-infraestructura-y-devops)
12. [Seguridad](#12-seguridad)
13. [Integraciones Externas](#13-integraciones-externas)
14. [Roadmap y Estado Actual](#14-roadmap-y-estado-actual)
15. [Métricas de Éxito (KPI)](#15-métricas-de-éxito-kpi)
16. [Glosario](#16-glosario)

---

## 1. Resumen Ejecutivo

**Condominios Venezuela SGC** (Sistema de Gestión Condominial) es una plataforma empresarial B2B SaaS diseñada específicamente para el mercado venezolano de administración de condominios. Proporciona un ecosistema completo para la gestión de recursos humanos, control de asistencia, nómina, comunicación interna, programación de tareas, y tracking visual del trabajo mediante fotos geoetiquetadas.

El sistema opera bajo un modelo **multi-tenant** (una organización por instancia), con **dos portales diferenciados**: un dashboard administrativo para el personal de Recursos Humanos (Junta de Condominio) con roles granulares (Admin, Manager, Viewer), y un dashboard operativo para empleados con funcionalidades de autogestión.

El producto se encuentra en estado **activo** con 24 tareas completadas, y está desplegado en producción en Vercel (frontend) + Render (backend) con MongoDB Atlas como base de datos.

---

## 2. Visión y Estrategia de Producto

### 2.1 Declaración de Visión
> *"Ser la plataforma #1 de gestión condominial en Venezuela, empoderando a las juntas de condominio con herramientas inteligentes para administrar su talento humano con eficiencia, transparencia y control total."*

### 2.2 Problema que Resuelve
- **Fragmentación administrativa:** Los condominios venezolanos gestionan empleados, nóminas, horarios y asistencia en sistemas desconectados (Excel, papel, WhatsApp).
- **Falta de transparencia:** No hay trazabilidad del trabajo realizado por los empleados del condominio.
- **Control de asistencia deficiente:** Métodos manuales y no verificables para registrar entrada/salida.
- **Comunicación ineficiente:** Avisos y notificaciones que no llegan de forma oportuna.

### 2.3 Propuesta de Valor
| Dimensión | Valor |
|:---|:---|
| **Unificación** | Una sola plataforma para HR, asistencia, nómina, horarios, comunicación |
| **Transparencia** | Fotos geoetiquetadas con metadatos EXIF, trazabilidad completa |
| **Control granular** | RBAC con permisos a nivel de módulo y acción (CRUD) |
| **Automatización** | Registro automático de ausencias vía cron, notificaciones push FCM |
| **Multi-tenencia** | Aislamiento completo de datos por organización |
| **Mobile-first** | PWA instalable, diseño responsive, notificaciones push |

### 2.4 Público Objetivo
| Persona | Descripción | Necesidades Clave |
|:---|:---|:---|
| **Presidente / Vicepresidente** (HR-Admin) | Líder de la junta de condominio | Control total, KPIs globales, gestión de nómina |
| **Secretario / Coordinador** (HR-Manager) | Administrador del día a día | Gestión de empleados, horarios, solicitudes |
| **Propietario** (HR-Viewer) | Miembro de la junta | Visibilidad de operaciones, solo lectura |
| **Empleado** | Personal de mantenimiento/limpieza/seguridad | Marcar asistencia, ver horarios, subir fotos |

---

## 3. Arquitectura del Sistema

### 3.1 Diagrama de Arquitectura General

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Vercel)                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │              React 18 + Vite 5                     │  │
│  │  ┌──────┐ ┌──────────┐ ┌────────┐ ┌───────────┐  │  │
│  │  │Router│ │  Redux   │ │  Hooks │ │ Component │  │  │
│  │  │ v6   │ │  Toolkit │ │customs │ │    UI     │  │  │
│  │  └──────┘ └──────────┘ └────────┘ └───────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
│                        │ HTTP/REST                       │
│                        ▼                                 │
│              ┌─────────────────┐                         │
│              │  Firebase Auth  │ ←── Cliente Firebase    │
│              └─────────────────┘                         │
└──────────────────────┬──────────────────────────────────┘
                       │ Proxy Vercel Rewrites
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  SERVER (Render)                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │       Node.js + Express 4                          │  │
│  │  ┌──────────┐ ┌─────────┐ ┌──────────────────┐   │  │
│  │  │  Routes  │ │   JWT   │ │   Middleware      │   │  │
│  │  │  (23)    │ │   Auth  │ │ Auth, Roles,      │   │  │
│  │  │          │ │         │ │ Upload (Multer)   │   │  │
│  │  └────┬─────┘ └─────────┘ └──────────────────┘   │  │
│  │       ▼                                            │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │  │
│  │  │Controllers│ │ Services │ │    SendGrid      │   │  │
│  │  │   (24)    │ │FCM, Cron │ │    Emails (6)    │   │  │
│  │  └──────────┘ └──────────┘ └──────────────────┘   │  │
│  └───────────────────────────────────────────────────┘  │
│                        │ Mongoose ODM                    │
│                        ▼                                 │
│              ┌─────────────────┐                         │
│              │  MongoDB Atlas  │                         │
│              │  21 colecciones  │                         │
│              └─────────────────┘                         │
└──────────────────────────────────────────────────────────┘
      │                        │                      │
      ▼                        ▼                      ▼
┌──────────┐        ┌────────────────┐      ┌──────────────┐
│Cloudinary│        │  Firebase FCM  │      │  cron-job.org │
│ (Fotos)  │        │ (Push Notif)   │      │ (Cron Jobs)  │
└──────────┘        └────────────────┘      └──────────────┘
```

### 3.2 Principios Arquitectónicos
1. **Separación estricta:** `client/` (React) y `server/` (Express) como proyectos independientes
2. **Estado global centralizado:** Redux Toolkit como fuente de verdad para UI
3. **Autenticación desacoplada:** Firebase Auth (client) + JWT con doble verificación (server)
4. **Aislamiento multi-tenant:** Todos los modelos referencian `organizationID`
5. **API RESTful:** Endpoints organizados por recurso con versionado (`/api/v1/`)

---

## 4. Stack Tecnológico

### 4.1 Frontend (`client/`)

| Categoría | Tecnología | Versión | Propósito |
|:---|:---|:---:|:---|
| **Framework** | React | 18.3.1 | UI declarativa basada en componentes |
| **Build Tool** | Vite | 5.4.10 | Bundler ultrarrápido con HMR |
| **Routing** | React Router DOM | 6.28.0 | Enrutamiento SPA con nested routes |
| **State Management** | Redux Toolkit | 2.3.0 | Estado global + thunks asíncronos |
| **Estilos** | Tailwind CSS | 3.4.15 | Utility-first CSS con modo oscuro |
| **UI Library** | Radix UI (8 primitivas) | 1.x | Componentes accesibles headless |
| **Iconos** | Lucide React | 0.460.0 | Iconos SVG consistentes |
| **Gráficos** | Recharts | 2.13.3 | Dashboard analytics y charts |
| **Tablas** | TanStack Table | 8.20.5 | Tablas con sorting/filtering |
| **Editor Rich Text** | TipTap | 3.20.1 | Editor WYSIWYG para bitácoras |
| **Animaciones** | TailwindCSS Animate | 1.x | Animaciones CSS declarativas |
| **HTTP Client** | Axios | 1.7.7 | Peticiones con interceptores |
| **Testing** | Vitest | 4.1.2 | Tests unitarios rápidos |
| **PWA** | Firebase Messaging | 12.13.0 | Notificaciones push + service worker |
| **OTP Input** | Input OTP | 1.4.1 | Verificación de email con código |
| **Class Utils** | clsx + tailwind-merge + cva | — | Composición de clases condicionales |

### 4.2 Backend (`server/`)

| Categoría | Tecnología | Versión | Propósito |
|:---|:---|:---:|:---|
| **Runtime** | Node.js | — | Servidor JavaScript asíncrono |
| **Framework** | Express | 4.21.1 | API REST con middleware pipeline |
| **ODM** | Mongoose | 8.8.1 | Modelado y validación de datos MongoDB |
| **Database** | MongoDB Atlas | — | Base de datos NoSQL en la nube |
| **Auth** | JWT (jsonwebtoken) | 9.0.2 | Tokens de sesión |
| **Encryption** | Bcrypt | 5.1.1 | Hashing de contraseñas |
| **File Upload** | Multer | 2.1.1 | Upload de archivos multipart |
| **Image Storage** | Cloudinary SDK | 2.9.0 | Almacenamiento y transformación de imágenes |
| **Email** | SendGrid Mail | 8.1.6 | Envío transaccional de emails |
| **FCM** | Firebase Admin | 13.10.0 | Push notifications |
| **Cron** | node-cron | — | Tareas programadas |
| **Cookies** | cookie-parser | 1.4.7 | Parseo de cookies |
| **Validation** | Mongoose validators | — | Validación a nivel de esquema |
| **Testing** | Jest + Supertest | 30.3.0 | Tests de integración |
| **DB Testing** | mongodb-memory-server | 11.0.1 | MongoDB en memoria para tests |

### 4.3 DevOps & CI/CD

| Herramienta | Propósito |
|:---|:---|
| **Vercel** | Deploy del frontend con rewrites API |
| **Render** | Deploy del backend Node.js |
| **GitHub Actions** | CI: verificación de merge source (`check-merge-source.yml`) |
| **Git Flow** | Feature branches → `dev` → PR → `dev` → `main` (deploy) |
| **Firebase Console** | Gestión de proyecto FCM, credenciales |

---

## 5. Modelo de Datos

### 5.1 Diagrama de Entidades y Relaciones

```
Organization (1)
  ├── HumanResources (N) — Personal administrativo HR
  │     └── PushSubscription (N) — Tokens FCM por dispositivo
  ├── Employee (N) — Trabajadores del condominio
  │     ├── Schedule (N) — Horarios con tareas diarias
  │     ├── Leave (N) — Solicitudes de permiso
  │     ├── Absence (N) — Registros de ausencia
  │     ├── Attendance (1) — Control de asistencia con logs
  │     ├── WorkPhoto (N) — Fotos de trabajo geoetiquetadas
  │     ├── Salary (N) — Historial de nómina
  │     ├── GenerateRequest (N) — Solicitudes internas
  │     ├── Bitacora (N) — Bitácoras diarias
  │     └── Notice (N) — Avisos dirigidos
  ├── Department (N) — Departamentos/áreas
  │     ├── Employee (N) — Empleados del depto
  │     ├── HumanResources (N) — HRs del depto
  │     └── Notice (N) — Avisos del depto
  ├── Balance (N) — Estados financieros
  ├── Recruitment (N) — Vacantes
  │     └── Applicant (N) — Postulantes
  │           └── InterviewInsight (1) — Resultado de entrevista
  ├── CorporateCalendar (N) — Eventos corporativos
  ├── Notification (N) — Notificaciones in-app
  └── ContactSales (N) — Leads de ventas
```

### 5.2 Esquemas Detallados

#### 5.2.1 Organization
| Campo | Tipo | Restricciones |
|:---|:---|:---|
| `name` | String | `required`, `unique` |
| `description` | String | `required` |
| `employees` | [ObjectId] | ref: "Employee" |
| `HRs` | [ObjectId] | ref: "HumanResources" |
| `OrganizationURL` | String | `required`, `unique` |
| `OrganizationMail` | String | `required`, `unique` |
| `timestamps` | — | createdAt, updatedAt |

#### 5.2.2 HumanResources (HR)
| Campo | Tipo | Restricciones |
|:---|:---|:---|
| `firstname` | String | `required` |
| `lastname` | String | `required` |
| `email` | String | `required`, `unique`, validación regex |
| `password` | String | `required` (bcrypt hashed) |
| `contactnumber` | String | `required` |
| `role` | String | enum: "HR-Admin" \| "HR-Manager" \| "HR-Viewer" |
| `cargo` | String | enum: "Presidente" \| "Vice Presidente" \| "Secretario" \| "Coordinador" \| "Propietario" \| "General" |
| `permissions` | Embedded | Permisos CRUD por módulo (13 módulos) |
| `invitedby` | ObjectId | ref: "HumanResources" |
| `invitationtoken` | String | Para flujo de invitación |
| `invitationtokenexpires` | Date | Expiración a 48h |
| `isactive` | Boolean | default: true |
| `isverified` | Boolean | default: false |
| `department` | ObjectId | ref: "Department" |
| `organizationID` | ObjectId | ref: "Organization" |

**Estructura de Permisos:**
```javascript
{
  employees:      { create: Boolean, read: Boolean, update: Boolean, delete: Boolean },
  departments:    { ... },
  schedules:      { ... },
  photos:         { ... },
  salaries:       { ... },
  notices:        { ... },
  leaves:         { ... },
  requests:       { ... },
  attendance:     { ... },
  recruitment:    { ... },
  interviews:     { ... },
  hrprofiles:     { ... },
  bitacoras:      { ... }
}
```

**Mapeo Cargo → Rol:**
| Cargo | Rol Asignado |
|:---|:---|
| Presidente | HR-Admin |
| Vice Presidente | HR-Admin |
| Secretario | HR-Manager |
| Coordinador | HR-Manager |
| Propietario | HR-Viewer |
| General | HR-Viewer |

#### 5.2.3 Employee
| Campo | Tipo | Restricciones |
|:---|:---|:---|
| `firstname` | String | `required` |
| `lastname` | String | `required` |
| `email` | String | `required`, `unique`, validación regex |
| `password` | String | `required` (bcrypt hashed) |
| `contactnumber` | String | `required` |
| `role` | String | enum: "HR-Admin" \| "Employee" |
| `department` | ObjectId | ref: "Department" (single, enforced) |
| `invitationtoken` | String | Para flujo de invitación |
| `invitedby` | ObjectId | ref: "HumanResources" |
| `isactive` | Boolean | default: true |
| `isverified` | Boolean | default: false |
| `attendance` | ObjectId | ref: "Attendance" (1:1) |
| `notice` | [ObjectId] | ref: "Notice" |
| `salary` | [ObjectId] | ref: "Salary" |
| `leaverequest` | [ObjectId] | ref: "Leave" |
| `generaterequest` | [ObjectId] | ref: "GenerateRequest" |
| `organizationID` | ObjectId | ref: "Organization" |

#### 5.2.4 Department
| Campo | Tipo | Restricciones |
|:---|:---|:---|
| `name` | String | `required` |
| `description` | String | `required` |
| `employees` | [ObjectId] | ref: "Employee" |
| `HumanResources` | [ObjectId] | ref: "HumanResources" |
| `notice` | [ObjectId] | ref: "Notice" |
| `organizationID` | ObjectId | ref: "Organization" |
| **Index** | `{ name: 1, organizationID: 1 }` | **unique: true** |

#### 5.2.5 Schedule
| Campo | Tipo | Restricciones |
|:---|:---|:---|
| `employee` | ObjectId | `required`, ref: "Employee" |
| `title` | String | `required` |
| `description` | String | nullable |
| `startdate` | Date | `required` |
| `enddate` | Date | `required` |
| `schedule` | [DaySchedule] | Array de días con tareas |
| `isactive` | Boolean | default: true |
| `status` | String | enum: "active" \| "closed" \| "expired" |
| `createdby` | ObjectId | ref: "HumanResources" |
| `organizationID` | ObjectId | `required`, ref: "Organization" |

**Estructura DaySchedule:**
```javascript
{
  day: "Lunes" | "Martes" | "Miércoles" | "Jueves" | "Viernes" | "Sábado" | "Domingo",
  tasks: [{
    title: String,
    description: String,
    starttime: String ("HH:mm"),
    endtime: String ("HH:mm"),
    completed: Boolean (default: false)
  }]
}
```

#### 5.2.6 Leave
| Campo | Tipo | Restricciones |
|:---|:---|:---|
| `employee` | ObjectId | `required`, ref: "Employee" |
| `leavetype` | String | enum: "Vacaciones" \| "Reposo Médico" \| "Personal" \| "Otro" |
| `startdate` | Date | `required` |
| `enddate` | Date | `required` |
| `title` | String | `required` |
| `reason` | String | `required` |
| `status` | String | enum: "Pending" \| "Rejected" \| "Approved" |
| `approvedby` | ObjectId | ref: "HumanResources" |
| `isDeleted` | Boolean | soft delete flag |
| `organizationID` | ObjectId | ref: "Organization" |

#### 5.2.7 Absence
| Campo | Tipo | Restricciones |
|:---|:---|:---|
| `employee` | ObjectId | `required`, ref: "Employee" |
| `leaveRequest` | ObjectId | ref: "Leave" (opcional) |
| `scheduleId` | ObjectId | ref: "Schedule" (opcional) |
| `startdate` | Date | `required` |
| `enddate` | Date | `required` |
| `leavetype` | String | enum: "Vacaciones" \| "Reposo Médico" \| "Personal" \| "Otro" \| **"Tarea No Realizada"** |
| `title` | String | `required` |
| `reason` | String | `required` |
| `createdBy` | ObjectId | ref: "HumanResources" |
| `isDeleted` | Boolean | soft delete |
| `organizationID` | ObjectId | ref: "Organization" |

#### 5.2.8 Attendance
| Campo | Tipo | Restricciones |
|:---|:---|:---|
| `employee` | ObjectId | `required`, ref: "Employee" |
| `status` | String | enum: "Present" \| "Absent" \| "Not Specified" |
| `attendancelog` | [LogEntry] | Array de registros diarios |
| `organizationID` | ObjectId | ref: "Organization" |

**Estructura LogEntry:**
```javascript
{
  logdate: Date,
  logstatus: "Present" | "Absent" | "Not Specified",
  checkin: Date,     // Hora de entrada
  checkout: Date,    // Hora de salida
  duration: Number   // Minutos trabajados
}
```

#### 5.2.9 WorkPhoto
| Campo | Tipo | Restricciones |
|:---|:---|:---|
| `employee` | ObjectId | `required`, ref: "Employee" |
| `photourl` | String | `required` (Cloudinary URL) |
| `publicid` | String | `required` (para delete de Cloudinary) |
| `description` | String | nullable |
| `workdate` | Date | `required` (fecha de la jornada) |
| `captureDate` | Date | Extraída de EXIF |
| `gpsLocation` | Embedded | `{ lat: Number, lng: Number }` |
| `reviewedby` | ObjectId | ref: "HumanResources" |
| `organizationID` | ObjectId | `required`, ref: "Organization" |

#### 5.2.10 Salary
| Campo | Tipo | Restricciones |
|:---|:---|:---|
| `employee` | ObjectId | ref: "Employee" |
| `basicpay` | Number | `required` |
| `bonuses` | Number | `required` |
| `deductions` | Number | `required` |
| `netpay` | Number | `required` |
| `currency` | String | `required` |
| `duedate` | Date | `required`, validación futuro |
| `paymentdate` | Date | nullable |
| `status` | String | enum: "Pending" \| "Delayed" \| "Paid" |

#### 5.2.11 Bitacora
| Campo | Tipo | Restricciones |
|:---|:---|:---|
| `title` | String | `required`, max 200 chars |
| `content` | String | `required` (rich text HTML) |
| `images` | [String] | max 5 URLs |
| `employee` | ObjectId | `required`, ref: "Employee" |
| `isDeleted` | Boolean | soft delete |
| `organizationID` | ObjectId | ref: "Organization" |

#### 5.2.12 Notification
| Campo | Tipo | Restricciones |
|:---|:---|:---|
| `recipient` | ObjectId | `required`, ref: "HumanResources" |
| `type` | String | enum: "bitacora_created" |
| `title` | String | `required` |
| `message` | String | `required` |
| `relatedTo` | ObjectId | `required`, refPath: "onModel" (polimórfico) |
| `isRead` | Boolean | default: false |
| `isDeleted` | Boolean | soft delete |

#### 5.2.13 PushSubscription
| Campo | Tipo | Restricciones |
|:---|:---|:---|
| `hr` | ObjectId | `required`, ref: "HumanResources" |
| `token` | String | `required` (FCM token) |
| `platform` | String | enum: "web" \| "android" \| "ios" |
| `userAgent` | String | — |
| **Index** | `{ hr: 1, token: 1 }` | **unique: true** |

#### 5.2.14 Recruitment & Applicant & InterviewInsight
Modelo de reclutamiento completo con:
- **Recruitment:** jobtitle, description, department, applications[]
- **Applicant:** firstname, lastname, email, contactnumber, appliedrole, recruitmentstatus
- **InterviewInsight:** applicant, feedback, interviewer, interviewdate, status

#### 5.2.15 Modelos Adicionales
- **Balance:** title, description, availableamount, totalexpenses, expensemonth
- **CorporateCalendar:** eventtitle, eventdate, description, audience
- **GenerateRequest:** requesttitle, requestconent, employee, department, status
- **ContactSales:** fullname, companyname, companysize, message, workemail
- **Notice:** title, content (rich text), audience (Department-Specific | Employee-Specific)

---

## 6. Módulos Funcionales

### 6.1 Portal de Empleados (`/auth/employee/employee-dashboard/*`)

| Módulo | Ruta | Funcionalidades |
|:---|:---|:---|
| **Inicio** | `/home` | Bienvenida personalizada con saludo, descripción del departamento (toggle), resumen del día |
| **Horario** | `/schedule` | Vista de horario semanal con tareas, check de completado |
| **Fotos de Trabajo** | `/photos` | Subir fotos con descripción, geolocalización EXIF, ver historial |
| **Perfil** | `/profile` | Datos personales, departamento, información de contacto |
| **Solicitudes** | `/requests` | Crear y dar seguimiento a solicitudes internas |
| **Ausencias** | `/absences` | Ver historial de ausencias (vacaciones, médicas, personales) |
| **Bitácoras** | `/bitacoras` | Crear entradas de bitácora con editor rich text (TipTap) y hasta 5 imágenes |

### 6.2 Portal de HR (`/HR/dashboard/*`)

| Módulo | Ruta | Funcionalidades |
|:---|:---|:---|
| **Dashboard** | `/dashboard-data` | KPIs (empleados, deptos, solicitudes, ausencias), gráfico de salarios (Recharts), tabla de avisos recientes, tarjeta de saludo personalizado con cargo |
| **Empleados** | `/employees` | CRUD completo, tabla con TanStack, invitación por email, asignación de departamento (single), campo cargo |
| **Departamentos** | `/departments` | CRUD con validación de unicidad por organización |
| **Horarios** | `/schedules` | Crear horarios semanales con tareas por día, asignar a empleados, cerrar/vencer horarios |
| **Permisos** | `/leaves` | Gestión de solicitudes de permiso, flujo Approve/Reject, CRUD completo |
| **Solicitudes** | `/requests` | Aprobar/rechazar solicitudes de empleados |
| **Fotos de Trabajo** | `/work-photos` | Revisar fotos con metadatos EXIF (fecha captura, GPS), marcar como revisadas |
| **Perfiles HR** | `/hr-profiles` | Gestión del equipo HR (Admin/Manager only), control de permisos |
| **Bitácoras** | `/bitacoras` | Visualizar bitácoras de todos los empleados, búsqueda y filtros |

### 6.3 Autenticación y Onboarding

| Funcionalidad | Descripción |
|:---|:---|
| **Registro HR** | Signup con verificación de email mediante código OTP de 6 dígitos (expira 5 min) |
| **Login HR** | Credenciales email + password, sesión JWT |
| **Login Empleado** | Credenciales email + password, sesión JWT |
| **Invitación HR** | Email de invitación con token de 48h, incluye cargo asignado |
| **Invitación Empleado** | Email con contraseña temporal + enlace de aceptación de 48h |
| **Recuperación de contraseña** | Email con enlace de reset (expira 1h), tanto para HR como Employee |
| **Verificación de email** | Código OTP enviado por SendGrid, 5 minutos de validez |

### 6.4 Automatizaciones

| Proceso | Descripción | Frecuencia |
|:---|:---|:---|
| **Registro de Ausencias Diarias** | Verifica horarios activos; si no hay check-in, crea ausencia tipo "Tarea No Realizada" con deduplicación (mismo employee + scheduleId + startdate + leavetype) | Diario (cron) |
| **Notificaciones Push FCM** | Cuando se crea una bitácora, se envía push a todos los HR de la organización | Evento |
| **Notificaciones In-App** | Misma creación de bitácora genera notificación en base de datos | Evento |
| **Limpieza de Tokens FCM** | Tokens inválidos se eliminan automáticamente al fallar el envío push | Evento |

### 6.5 Sistema de Notificaciones

| Tipo | Canal | Destinatarios | Eventos |
|:---|:---|:---|:---|
| **In-App** | Base de datos (polling/consulta) | HR individual | bitacora_created |
| **Push (FCM)** | Service Worker + Browser Notification | HR individual (multi-dispositivo) | bitacora_created |
| **Email** | SendGrid | HR o Employee | Invitación, verificación, bienvenida, reset password |

### 6.6 Sistema de Bitácoras

Características avanzadas del módulo de bitácoras:
- Editor **TipTap** (WYSIWYG) con **Rich Text**:
  - Bullet lists, ordered lists
  - Text alignment, underline
  - Starter kit completo (bold, italic, headings, etc.)
- Soporte para **hasta 5 imágenes** por bitácora
- **Imágenes rotadas automáticamente** según metadatos EXIF
- Vista para empleados (solo las propias) y HR (todas)
- **Notificaciones FCM** automáticas al crear una bitácora

---

## 7. API REST — Endpoints Completos

### 7.1 Autenticación

| Método | Endpoint | Descripción | Auth |
|:---|:---|:---|:---:|
| POST | `/api/auth/employee/signup` | Crear empleado (HR invite) | HR |
| POST | `/api/auth/employee/login` | Login empleado | Público |
| POST | `/api/auth/employee/logout` | Logout empleado | Empleado |
| GET | `/api/auth/employee/check-login` | Verificar sesión empleado | Empleado |
| POST | `/api/auth/employee/forgot-password` | Solicitar reset password | Público |
| POST | `/api/auth/employee/reset-password/:token` | Ejecutar reset password | Público |
| POST | `/api/auth/HR/signup` | Registro HR | Público |
| POST | `/api/auth/HR/login` | Login HR | Público |
| POST | `/api/auth/HR/logout` | Logout HR | HR |
| GET | `/api/auth/HR/check-login` | Verificar sesión HR | HR |
| POST | `/api/auth/HR/verify-email` | Verificar email con código | HR |
| GET | `/api/auth/HR/check-verify-email` | Estado de verificación | HR |
| POST | `/api/auth/HR/resend-verify-email` | Reenviar código | HR |
| POST | `/api/auth/HR/forgot-password` | Solicitar reset password HR | Público |
| POST | `/api/auth/HR/reset-password/:token` | Ejecutar reset password HR | Público |

### 7.2 Recursos Principales (`/api/v1/`)

| Método | Endpoint | Descripción | Auth |
|:---|:---|:---|:---:|
| GET | `/dashboard/HR-dashboard` | KPIs + balance + avisos | HR |
| GET | `/employee/all` | Todos los empleados | HR |
| GET | `/employee/by-HR/:id` | Empleado por ID | HR |
| GET | `/employee/by-employee` | Empleado actual | Employee |
| GET | `/employee/all-employees-ids` | IDs de empleados | HR |
| DELETE | `/employee/delete-employee/:id` | Eliminar empleado | HR |
| GET | `/HR/me` | Perfil HR actual | HR |
| GET | `/HR/all` | Todos los HR | HR |
| GET | `/HR/:HRID` | HR por ID | HR |
| PUT | `/HR/update` | Actualizar HR | HR |
| DELETE | `/HR/delete/:HRID` | Eliminar HR | HR |
| GET | `/department/all` | Todos los departamentos | HR |
| POST | `/department/create-department` | Crear departamento | HR |
| PUT | `/department/update-department` | Actualizar depto | HR |
| DELETE | `/department/delete-department` | Eliminar depto | HR |
| GET | `/salary/...` | CRUD salarios | HR |
| GET | `/notice/...` | CRUD avisos | HR |
| GET | `/leave/all` | Todas las solicitudes | HR |
| POST | `/leave/create-leave` | Crear solicitud | Employee |
| POST | `/leave/hr-create-leave` | Crear solicitud como HR | HR |
| PUT | `/leave/hr-update-leave` | Actualizar solicitud | HR |
| PUT | `/leave/HR-update-leave` | Aprobar/rechazar | HR |
| DELETE | `/leave/hr-delete-leave/:id` | Eliminar solicitud | HR |
| DELETE | `/leave/delete-leave/:id` | Eliminar solicitud (emp) | Employee |
| GET | `/absence/all` | Todas las ausencias | HR |
| GET | `/absence/my-absences` | Mis ausencias | Employee |
| GET | `/absence/employee/:id` | Ausencias por empleado | HR |
| DELETE | `/absence/delete/:id` | Eliminar ausencia | HR |
| GET | `/attendance/...` | CRUD asistencia | Ambos |
| GET | `/schedule/...` | CRUD horarios | Ambos |
| GET | `/workphoto/...` | CRUD fotos trabajo | Ambos |
| GET | `/recruitment/...` | CRUD reclutamiento | HR |
| GET | `/applicant/...` | CRUD postulantes | HR |
| GET | `/interview-insights/...` | CRUD entrevistas | HR |
| GET | `/generate-request/...` | CRUD solicitudes | Ambos |
| GET | `/corporate-calendar/...` | CRUD calendario | HR |
| GET | `/balance/...` | CRUD balances | HR |
| GET | `/hr-profiles/...` | Gestión perfiles HR | HR |
| POST | `/contact/sales` | Contacto ventas | Público |
| GET | `/bitacora/all` | Todas las bitácoras | HR |
| GET | `/bitacora/my-bitacoras` | Mis bitácoras | Employee |
| POST | `/bitacora/create` | Crear bitácora | Employee |
| PUT | `/bitacora/update/:id` | Actualizar bitácora | Employee |
| DELETE | `/bitacora/delete/:id` | Eliminar bitácora | HR |
| GET | `/notification/my-notifications` | Mis notificaciones | HR |
| GET | `/notification/unread-count` | Conteo no leídas | HR |
| PUT | `/notification/read/:id` | Marcar leída | HR |
| PUT | `/notification/read-all` | Marcar todas leídas | HR |
| POST | `/push/subscribe` | Suscribir token FCM | HR |
| DELETE | `/push/unsubscribe/:token` | Eliminar suscripción | HR |
| POST | `/push/test` | Test push notification | HR |
| GET | `/health` | Health check | Público |

---

## 8. Sistema de Roles y Permisos

### 8.1 Roles

| Rol | Nivel de Acceso | Cargos Asociados |
|:---|:---|:---|
| **HR-Admin** | Control total (CRUD en todos los módulos) | Presidente, Vice Presidente |
| **HR-Manager** | Operativo (CRUD excepto HR Profiles), no puede eliminar bitácoras | Secretario, Coordinador |
| **HR-Viewer** | Solo lectura en todos los módulos, sin acceso a HR Profiles | Propietario, General |
| **Employee** | Acceso solo a su propio perfil y datos | Empleado |

### 8.2 Matriz de Permisos por Defecto

| Módulo | HR-Admin | HR-Manager | HR-Viewer |
|:---|:---:|:---:|:---:|
| Employees | CRUD | CRUD | R |
| Departments | CRUD | CRUD | R |
| Schedules | CRUD | CRUD | R |
| Photos | CRUD | CRUD | R |
| Salaries | CRUD | CRUD | R |
| Notices | CRUD | CRUD | R |
| Leaves | CRUD | CRUD | R |
| Requests | CRUD | CRUD | R |
| Attendance | CRUD | CRUD | R |
| Recruitment | CRUD | CRUD | R |
| Interviews | CRUD | CRUD | R |
| HR Profiles | CRUD | R | — |
| Bitácoras | R, D | R | R |

### 8.3 Middleware de Protección

```javascript
// Cadena de middleware típica:
router.get("/all", VerifyhHRToken, PermissionCheck("employees", "read"), HandleAllEmployees)
router.delete("/:id", VerifyhHRToken, PermissionCheck("employees", "delete"), HandleDeleteEmployee)

// Rutas exclusivas de Admin:
router.get("/hr-profiles", VerifyhHRToken, AdminOnly, HandleHRProfiles)
```

---

## 9. Flujo de Autenticación

### 9.1 Flujo de Login HR
```
1. Usuario envía credenciales → POST /api/auth/HR/login
2. Servidor valida email + password (bcrypt compare)
3. Servidor genera JWT con payload { HRid, ORGID, HRrole }
4. JWT se envía en response body
5. Cliente almacena en localStorage("HRtoken")
6. Cada request subsecuente incluye header: Authorization: Bearer <token>
7. Middleware VerifyhHRToken decodifica y verifica que HR sigue activo en DB
```

### 9.2 Flujo de Registro e Invitación HR
```
1. HR-Admin invita a nuevo miembro → formulario con email + cargo
2. Servidor crea HR con estado pendiente, genera invitationtoken (48h)
3. SendGrid envía email con enlace de aceptación
4. Destinatario abre enlace → página /auth/HR/accept-invitation/:token
5. Completa registro (nombre, contraseña, etc.)
6. Se requiere verificación de email (código OTP de 6 dígitos, 5 min)
7. Cuenta activada → redirect a login
```

### 9.3 Flujo de Invitación de Empleado
```
1. HR crea empleado → POST /api/auth/employee/signup
2. Servidor genera contraseña temporal + invitationtoken (48h)
3. SendGrid envía email con credenciales temporales
4. Empleado abre enlace → /auth/employee/accept-invitation/:token
5. Establece su propia contraseña
6. Cuenta activada → redirect a login
```

### 9.4 Doble Autenticación (Employee + HR)
El sistema mantiene **dos sistemas de autenticación paralelos**:
- **Employee Auth**: Token con `EMid`, `EMrole`, `ORGID`
- **HR Auth**: Token con `HRid`, `HRrole`, `ORGID`
- Middleware separado para cada uno (`VerifyEmployeeToken` vs `VerifyhHRToken`)
- El middleware de HR verifica **en cada request** que el HR sigue activo en DB
- El rol `Employee` también puede tener role "HR-Admin" (herencia de arquitectura previa)

---

## 10. UI/UX y Sistema de Diseño

### 10.1 Design System — CondoVE SGC v4

El sistema de diseño está definido en `.agent/rules/design-system/` con los siguientes módulos:

| Módulo | Archivo | Contenido |
|:---|:---|:---|
| Estrategia de Migración | `migration-mapping.md` | Diccionario de traducción de tokens EMS→CondoVE |
| Colores y Tokens | `colors.md` | Paleta Venezuela, ACCENT_MAP |
| Listas y Tablas | `lists-tables.md` | ThemedList*, reglas de deprecación |
| Componentes UI | `ui-elements.md` | Cards KPI, botones, badges, avatares |
| Lógica y Specs | `specs.md` | SelectField, useIsDark, tipografía |

### 10.2 Paleta de Colores

| Sección | Acento | Hex | Legacy (v2) |
|:---|:---|:---|:---|
| Empleados, Perfiles, Nóminas, Avisos, Deptos. | Blue Venezuela | `#003DA5` | Indigo |
| Solicitudes / Ausencias | Yellow Venezuela | `#FCE300` | Amber |
| Reclutamiento | Emerald | `#10b981` | Emerald |
| Entrevistas | Cyan | `#06b6d4` | Cyan |

### 10.3 Reglas de Oro de Contraste
- **Borde > Fondo**: El borde siempre debe ser más oscuro que el fondo
- **Modo Claro**: No usar `gray-100` como separador; usar mid-tint del acento
- **Modo Oscuro**: Fondo mínimo `0.04`, borde mínimo `0.10`
- **Prohibiciones**: No usar `indigo`/`amber`/`purple` legacy; no usar `<select>` nativo; no usar `document.documentElement` directo (usar `useIsDark()` hook)

### 10.4 Componentes UI Core

| Componente | Tecnología | Propósito |
|:---|:---|:---|
| Sidebar | Radix UI + shadcn/ui | Navegación responsiva (escritorio: icon + texto, móvil: sheet) |
| ThemedModal | Radix Dialog | Modales reutilizables con tema |
| ThemedList* | Personalizado | Listas con acentos por sección |
| SelectField | Radix Select | Dropdowns estilizados (prohibido <select>) |
| Button | cva + Tailwind | Variantes: primary, secondary, outline, ghost |
| Card | Personalizado | KPIs, métricas, contenedores |
| Badge | Personalizado | Estados, conteos, etiquetas |
| Avatar | Personalizado | Fotos de perfil con iniciales fallback |
| Dialog | Radix Dialog | Modales de confirmación, formularios |
| Toast | Radix Toast | Notificaciones in-app temporales |
| Tabla | TanStack Table | Data tables con sort, filtros, paginación |
| Charts | Recharts | Gráficos de salarios, KPIs |
| Skeleton | Personalizado | Loading states |

### 10.5 Modo Oscuro/Claro
- Hook `useIsDark()` con MutationObserver en `<html class="dark">`
- Toggle con persistencia en localStorage (`ems-theme`)
- Transiciones suaves en todos los componentes
- Variables CSS HSL para theming (sidebar, background, foreground, etc.)

### 10.6 Responsive Design
- Mobile-first con Tailwind breakpoints
- Sidebar colapsable en mobile (Sheet)
- Tablas con columnas ocultables en mobile (`hiddenCols` prop)
- PWA instalable con `beforeinstallprompt`

---

## 11. Infraestructura y DevOps

### 11.1 Entornos

| Entorno | Frontend | Backend | Base de Datos |
|:---|:---|:---|:---|
| **Producción** | Vercel (`condominio-cia.vercel.app`) | Render (`condominiocia.onrender.com`) | MongoDB Atlas (producción) |
| **Desarrollo** | Localhost:5173 (Vite) | Localhost:10000 | MongoDB Atlas (dev) |

### 11.2 Pipeline de CI/CD
```
Feature Branch (desde dev)
  → Push a origin
  → GitHub Actions: check-merge-source.yml (valida que PR base es dev)
  → PR a dev
  → Merge a dev
  → PR a main
  → Merge a main
  → Deploys automáticos: Vercel (frontend) + Render (backend)
```

### 11.3 Proxy de API (Vercel Rewrites)
```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://condominiocia.onrender.com/:path*" },
    { "source": "/((?!api|assets|favicon.ico).*)", "destination": "/index.html" }
  ]
}
```

### 11.4 Configuración de CORS (Server)
```javascript
const allowedOrigins = [
  process.env.CLIENT_URL,
  /\.vercel\.app$/,
  /cron-job\.org$/
];
// Con soporte para credentials y métodos específicos
```

### 11.5 Tareas Cron
Endpoint interno `/api/v1/...` (sin autenticación, protegido por CORS whitelist):
- `HandleRegisterDailyAbsences`: Ejecución diaria, verifica schedule activos, registra ausencias no justificadas

---

## 12. Seguridad

### 12.1 Autenticación y Sesión
- **JWT** con payload que incluye IDs de usuario, organización y rol
- **Verificación activa en DB** en cada request del HR (revocación inmediata si se desactiva)
- **Contraseñas** hasheadas con bcrypt
- **Tokens de invitación** con expiración (48h)
- **Códigos OTP** con expiración (5 min)

### 12.2 Autorización
- **RBAC granular**: Middleware `PermissionCheck(module, action)` por cada endpoint
- **Rutas protegidas**: Tres capas (Auth → Role → Permission)
- **AdminOnly**: Endpoints exclusivos para HR-Admin

### 12.3 Protección de Datos
- **Multi-tenencia**: Filtro obligatorio por `organizationID` en todas las queries
- **Soft deletes**: Modelos con `isDeleted` + `deletedAt` para auditoría
- **Validación de email**: Regex en servidor y cliente

### 12.4 Seguridad en el Servidor
- **CORS con regex whitelist** (no es abierto)
- **HTTP headers**: Content-Type, Authorization
- **Límite de payload**: 10MB en JSON y URL-encoded
- **Sanitización**: Mongoose validators y trim

### 12.5 Seguridad en FCM Push
- Tokens FCM almacenados con referencia a HR
- **Limpieza automática** de tokens inválidos/vencidos
- Unicidad de token por HR (compound index)

---

## 13. Integraciones Externas

| Servicio | Propósito | Tipo de Integración |
|:---|:---|:---|
| **MongoDB Atlas** | Base de datos principal | Mongoose ODM |
| **Cloudinary** | Almacenamiento de imágenes (fotos trabajo, bitácoras) | SDK REST |
| **SendGrid** | Emails transaccionales (invitaciones, verificación, reset password) | SDK Mail v8 |
| **Firebase Cloud Messaging** | Notificaciones push web | Firebase Admin SDK (server) + Firebase Client SDK |
| **Firebase Auth** | Autenticación (plan de migración) | Client SDK |
| **cron-job.org** | Disparador de tareas cron externas | HTTP callback |
| **Vercel** | Hosting frontend + proxy API | Deploy automático desde GitHub |
| **Render** | Hosting backend Node.js | Deploy automático desde GitHub |

---

## 14. Roadmap y Estado Actual

### 14.1 Tareas Completadas (24)

| # | Tarea | Estado | Fecha |
|:---:|:---|:---:|:---:|
| 001 | Update HRCards | ✅ | 06/04/2026 |
| 002 | Fix HRModals Dropdowns | ✅ | 08/04/2026 |
| 003 | Fix HR Approve/Reject Buttons | ✅ | 13/04/2026 |
| 004 | Refactor HRWorkPhotosPage | ✅ | 15/04/2026 |
| 005 | Fix EmployeeLeaves AuthVar | ✅ | 17/04/2026 |
| 006 | Create ThemedModal Component | ✅ | 18/04/2026 |
| 007 | Create Employee Absences Page | ✅ | 18/04/2026 |
| 008 | Add Employee Email Invitation | ✅ | 19/04/2026 |
| 009 | Fix Employee Session Issues | ✅ | 19/04/2026 |
| 010 | Update Schedule Functionality | ✅ | 20/04/2026 |
| 011 | Migrate Colors Palette | ✅ | 28/04/2026 |
| 012 | Rename EMS to CondoVE SGC | ✅ | 04/05/2026 |
| 013 | Fix Modal Empleados/Coordinadores | ✅ | 07/05/2026 |
| 014 | Add EXIF Metadata to WorkPhotos | ✅ | 08/05/2026 |
| 015 | Restrict HR Viewer Permissions | ✅ | 07/06/2026 |
| 016 | Update Logo and User Greeting | ✅ | 14/05/2026 |
| 017 | Fix Employee Checkbox Department | ✅ | 18/05/2026 |
| 018 | Fix Employee Single Department | ✅ | 18/05/2026 |
| 019 | Add HR Cargo System | ✅ | 20/05/2026 |
| 020 | Sistema de Bitácoras | ✅ | 24/05/2026 |
| 021 | Push Notifications (FCM) | ✅ | 31/05/2026 |
| 022 | Fix Department Uniqueness per Org | ✅ | 07/06/2026 |
| 023 | Fix Editor Paragraph Spacing | ✅ | 08/06/2026 |
| 024 | Employee Home Department Description | ✅ | 08/06/2026 |

### 14.2 Tarea Actual (#025)

| Fase | Estado | Descripción |
|:---:|:---:|:---|
| **Fase 1** | ✅ | Deduplicación de ausencias en cron job |
| **Fase 2** | ⏳ | Logging estructurado con timestamps |
| **Fase 3** | ⏳ | Tests unitarios para endpoints cron |
| **Fase 4** | ⏳ | Documentación `cron-setup.md` |

### 14.3 Próximas Iniciativas Planificadas

| Iniciativa | Prioridad | Descripción |
|:---|:---:|:---|
| Sistema de Nómina Completo | Alta | Generación de recibos de pago, PDFs, historial |
| Reportes y Analytics | Alta | Exportación de datos (CSV/PDF), dashboard avanzado con gráficos |
| Módulo de Chat Interno | Media | Comunicación en tiempo real entre HR y empleados |
| App Móvil Nativa | Media | React Native o Flutter para iOS/Android |
| Integración Bancaria | Media | Pagos automatizados de nómina vía transferencia |
| Portal de Proveedores | Baja | Gestión de contratistas y servicios externos |
| Multi-idioma | Baja | i18n (Español/Inglés) |
| Auditoría de Acciones | Baja | Log de todas las acciones de usuarios con timestamp |
| Tests de Cobertura | Media | Aumentar cobertura de tests unitarios e integración |

---

## 15. Métricas de Éxito (KPI)

### 15.1 KPIs de Producto

| Métrica | Objetivo | Cómo se Mide |
|:---|:---:|:---|
| Usuarios activos (MAU) | >10,000 | Conteo de logins únicos por mes |
| Tiempo de actividad | 99.9% | Uptime monitoring (Render + Vercel) |
| Tiempo de carga (Dashboard) | <2s | Lighthouse / Web Vitals |
| Tasa de adopción de empleados | >80% | % de empleados que usan la plataforma vs. total registrados |
| Solicitudes procesadas/día | — | Conteo de aprobaciones/rechazos |

### 15.2 KPIs Técnicos

| Métrica | Objetivo | Herramienta |
|:---|:---:|:---|
| Cobertura de tests | >80% | Jest/Vitest coverage |
| Tiempo de respuesta API (p95) | <500ms | Logging server |
| Errores en producción | <0.1% | Error tracking |
| Despliegues sin incidentes | 100% | GitHub Actions |

### 15.3 KPIs de Proceso

| Métrica | Objetivo |
|:---|:---:|
| Tiempo de PR a merge | <24h |
| Commits por tarea | 1-3 |
| Ramas sin conflictos con dev | 100% |

---

## 16. Glosario

| Término | Definición |
|:---|:---|
| **SGC** | Sistema de Gestión Condominial |
| **CondoVE** | Marca comercial del producto (Condominios Venezuela) |
| **HR-Admin** | Rol administrativo con control total del sistema |
| **HR-Manager** | Rol operativo con permisos de gestión |
| **HR-Viewer** | Rol de solo lectura para miembros de la junta |
| **Cargo** | Posición en la junta de condominio (Presidente, Secretario, etc.) |
| **Bitácora** | Registro diario de actividades con soporte rich text e imágenes |
| **FCM** | Firebase Cloud Messaging — servicio de notificaciones push |
| **OTP** | One-Time Password — código de verificación de 6 dígitos |
| **JWT** | JSON Web Token — estándar de autenticación stateless |
| **Multi-tenant** | Arquitectura donde múltiples organizaciones comparten la misma instancia con aislamiento de datos |
| **RBAC** | Role-Based Access Control — control de acceso basado en roles |
| **EXIF** | Metadatos incrustados en imágenes (fecha, GPS, cámara) |
| **PWA** | Progressive Web App — aplicación web instalable |
| **TipTap** | Editor de texto enriquecido (WYSIWYG) basado en ProseMirror |
| **Check-in/Check-out** | Sistema de marcación de entrada y salida laboral |
| **Tarea No Realizada** | Tipo de ausencia generada automáticamente por el cron cuando no hay check-in |

---

## Apéndices

### A. Estructura de Archivos del Proyecto

```
condominios-venezuela/
├── AGENTS.md                          # Configuración del agente OpenCode
├── opencode.json                      # Configuración OpenCode
├── .agent/
│   ├── rules/
│   │   ├── design-system/             # Tokens, colores, componentes UI
│   │   │   ├── index.md
│   │   │   ├── colors.md
│   │   │   ├── lists-tables.md
│   │   │   ├── migration-mapping.md
│   │   │   ├── specs.md
│   │   │   └── ui-elements.md
│   │   ├── global-context/
│   │   │   ├── global-context.md      # Reglas globales del proyecto
│   │   │   └── index.md               # Reglas detalladas
│   │   └── checklist-verify.md
│   └── workflows/
│       └── git-workflow.md            # Flujo Git estandarizado
├── .bitacoras/                        # Sistema de bitácoras del proyecto
│   ├── index.md                       # Mapa de tareas
│   ├── actual.md                      # Tarea activa
│   └── 00-plantilla.md               # Plantilla de bitácora
├── .github/workflows/
│   └── check-merge-source.yml         # GitHub Action CI
├── client/                            # Frontend React
│   ├── public/
│   │   ├── firebase-messaging-sw.js   # Service Worker FCM
│   │   └── ...                        # Assets, iconos
│   ├── src/
│   │   ├── App.jsx                    # Entry point con RouterProvider
│   │   ├── main.jsx                   # Bootstrap (Redux Provider + Toaster)
│   │   ├── index.css                  # Tailwind + CSS variables
│   │   ├── routes/
│   │   │   ├── AppRoutes.jsx          # Router combinado
│   │   │   ├── HRroutes.jsx           # 13 rutas HR
│   │   │   ├── employeeroutes.jsx     # 12 rutas Employee
│   │   │   ├── protectedroutes.jsx    # Guard employee
│   │   │   ├── HRprotectedroutes.jsx  # Guard HR
│   │   │   └── ...                    # Auth guards
│   │   ├── pages/
│   │   │   ├── common/
│   │   │   ├── Employees/             # 9 páginas (login, dashboard, etc.)
│   │   │   │   └── Dashboard Childs/  # 7 páginas internas
│   │   │   └── HumanResources/        # 11 páginas (auth + dashboard)
│   │   │       └── Dashboard Childs/  # 9 páginas internas
│   │   ├── components/
│   │   │   ├── ui/                    # 23 componentes base (shadcn/ui style)
│   │   │   ├── common/                # 14 componentes compartidos
│   │   │   ├── HR/                    # Componentes HR
│   │   │   └── employee/              # Componentes Employee
│   │   ├── redux/
│   │   │   ├── app/store.js           # Store con 13 reducers
│   │   │   ├── Slices/                # 13 slices
│   │   │   ├── Thunks/                # 13 thunks
│   │   │   ├── apis/                  # API endpoints + servicios Axios
│   │   │   └── AsyncReducers/         # Builder genérico de reducers
│   │   ├── hooks/                     # 7 hooks personalizados
│   │   ├── services/firebase.js       # Cliente Firebase + FCM
│   │   ├── lib/utils.js               # Utilidades (cn, etc.)
│   │   └── utils/commonhandler.js     # Manejadores comunes
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── vercel.json
├── server/                            # Backend Express
│   ├── index.js                       # Entry point (23 rutas montadas)
│   ├── config/connectDB.js            # Conexión MongoDB
│   ├── models/                        # 21 modelos Mongoose
│   ├── controllers/                   # 24 controladores
│   ├── routes/                        # 23 route files
│   ├── middlewares/                   # Auth, RoleAuth, Uploads
│   ├── services/fcm.service.js        # FCM push service
│   ├── sendgrid/                      # Config + 6 templates email
│   ├── utils/                         # JWT + token generators
│   ├── tests/                         # Tests (cron, leave)
│   └── docs/cron-setup.md            # Documentación cron
└── .opencode/                         # Configuración OpenCode
```

### B. Variables de Entorno

#### Client (`client/.env`)
```env
VITE_BACKEND_API=https://condominiocia.onrender.com
VITE_FIREBASE_API_KEY="..."
VITE_FIREBASE_PROJECT_ID="condove-sgc"
VITE_FIREBASE_APP_ID="1:810469645926:web:..."
VITE_FIREBASE_VAPID_KEY="BOJig1PZsfR..."
```

#### Server (`server/.env`)
```env
MONGODB_URI="mongodb+srv://..."
PORT=10000
JWT_SECRET="..."
CLIENT_URL="https://condominio-cia.vercel.app"
SENDGRID_API_KEY="SG..."
SENDGRID_SENDER_EMAIL="..."
CLOUDINARY_CLOUD_NAME="..."
FIREBASE_PROJECT_ID="condove-sgc"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-fbsvc@condove-sgc.iam.gserviceaccount.com"
```

---

> **Documento generado el:** 2026-06-10  
> **Próxima revisión programada:** 2026-07-10  
> **Mantenedor:** Equipo de Desarrollo — Condominios Venezuela SGC
