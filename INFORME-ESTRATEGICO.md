# 📊 INFORME ESTRATÉGICO DEL PROYECTO — "CONDOMINIOS VENEZUELA SGC (CondoVe)"

> **Versión del informe:** 2.0.0  
> **Fecha:** 2026-06-10  
> **Basado en:** Estado real del repositorio (rama `dev` + feature branches)  
> **Propósito:** Diagnóstico integral, análisis deuda técnica, roadmap estratégico  
> **Precedente:** Este informe actualiza y reemplaza completamente la versión del 18/05/2026

---

## Índice

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Estado Actual del Proyecto](#2-estado-actual-del-proyecto)
3. [Arquitectura y Stack](#3-arquitectura-y-stack)
4. [Análisis de Features Implementadas](#4-análisis-de-features-implementadas)
5. [Resolución de Bugs del Informe Anterior](#5-resolución-de-bugs-del-informe-anterior)
6. [Deuda Técnica Identificada](#6-deuda-técnica-identificada)
7. [Riesgos de Seguridad](#7-riesgos-de-seguridad)
8. [Observabilidad y Monitoreo](#8-observabilidad-y-monitoreo)
9. [Cobertura de Tests](#9-cobertura-de-tests)
10. [Roadmap Estratégico](#10-roadmap-estratégico)
11. [Recomendaciones del CTO](#11-recomendaciones-del-cto)
12. [Conclusión](#12-conclusión)

---

## 1. Resumen Ejecutivo

**Condominios Venezuela SGC (CondoVE)** es un sistema de gestión condominial B2B SaaS construido sobre el stack MERN, diseñado para el mercado venezolano. Representa una aplicación de **complejidad alta** con **21 modelos de datos**, **80+ endpoints REST**, **dos portales diferenciados** (HR + Empleado), **RBAC granular con 13 módulos**, **sistema de notificaciones push en tiempo real (FCM)**, **editor rich text**, **cron jobs**, **integración con 8 servicios externos**, y **soporte PWA completo**.

El informe anterior (mayo 2026) identificó 18 tareas completadas y un bug crítico en la tarea #015. Al día de hoy, el proyecto ha completado **24 tareas**, resuelto el bug crítico de permisos HR-Viewer, y añadido **6 features mayores** que no existían en ese momento: sistema de bitácoras con rich text, notificaciones push FCM, sistema de cargos HR, cron jobs de ausencias, extracción EXIF en fotos, y descripción de departamento en home del empleado.

---

## 2. Estado Actual del Proyecto

### 2.1 Métricas del Proyecto

| Métrica | Informe Anterior (Mayo 2026) | Actual (Junio 2026) | Δ |
|:---|---:|---:|:---:|
| **Total tareas completadas** | 18 | **24** | +6 |
| **Pull Requests merged** | 16 | **21+** | +5 |
| **Modelos de datos** | 15 | **21** | +6 |
| **Rutas backend** | ~17 | **23** | +6 |
| **Controladores** | ~18 | **24** | +6 |
| **Slices Redux** | 11 | **13** | +2 |
| **Componentes UI** | ~15 | **23** | +8 |
| **Hooks personalizados** | 5 | **7** | +2 |
| **Tests** | 1 archivo | **2 archivos** | +1 |
| **Documentación** | 0 | **1 archivo** (`cron-setup.md`) | +1 |
| **Integraciones externas** | 5 | **8** | +3 |
| **Rama activa** | `main` | `fix/cron-job-deduplication-...` | — |
| **Tarea actual** | #015 (PAUSADA) | **#025** (🟡 EN CURSO) | — |

### 2.2 Estado de Tareas (Comparativa)

El informe anterior reportaba la tarea **#015 como PAUSADA con bug crítico**. Este y otros problemas han sido resueltos:

| ID | Tarea | Estado Anterior | Estado Actual | Notas |
|:---:|:---|:---:|:---:|:---|
| #015 | Restrict HR Viewer Permissions | 🔴 PAUSADA (bug crítico) | ✅ COMPLETADA (PR #26 → dev, merged 2026-06-07) | Bug resuelto — RBAC funcional con 3 roles |
| #016 | Update Logo and User Greeting | ✅ COMPLETADA | ✅ COMPLETADA | — |
| #017-018 | Fix Employee Department | ✅ COMPLETADA | ✅ COMPLETADA | — |
| #019 | **Add HR Cargo System** | ❌ NO EXISTÍA | ✅ COMPLETADA (PR #19) | Nuevo: sistema de cargos con mapeo a roles |
| #020 | **Sistema de Bitácoras** | ❌ NO EXISTÍA | ✅ COMPLETADA (PR #21) | Nuevo: editor TipTap + imágenes + notificaciones |
| #021 | **Push Notifications (FCM)** | ❌ NO EXISTÍA | ✅ COMPLETADA (PR #24/#25) | Nuevo: FCM multi-dispositivo + service worker |
| #022 | **Fix Department Uniqueness** | ❌ NO EXISTÍA | ✅ COMPLETADA | Nuevo: índice compuesto unique por org |
| #023 | **Fix Editor Paragraph Spacing** | ❌ NO EXISTÍA | ✅ COMPLETADA | Nuevo: estandarización TipTap |
| #024 | **Employee Home Dept Description** | ❌ NO EXISTÍA | ✅ COMPLETADA | Nuevo: toggle de descripción |
| #025 | **Cron Job Deduplication + Tests** | ❌ NO EXISTÍA | 🟡 EN CURSO (Fase 1 ✅) | Fases 2-4 pendientes |

### 2.3 Funcionalidades Nuevas (Post-Informe Anterior)

| Feature | Componentes | Impacto |
|:---|:---|:---:|
| **Sistema de Cargos HR** | Modelo HR.cargo, CARGO_TO_ROLE, UNIQUE_CARGOS, `useHRAuth` hook | ⚡ Mapea posición real de junta de condominio a roles del sistema |
| **Sistema de Bitácoras** | Modelo Bitacora, TipTap editor (rich text), upload imágenes Cloudinary, notificaciones FCM + in-app | ⚡ Core de reportabilidad diaria |
| **Push Notifications FCM** | Firebase Admin SDK, PushSubscription model, service worker, tokens multi-dispositivo, limpieza automática | ⚡ Comunicación en tiempo real |
| **Cron Jobs Diarios** | `HandleRegisterDailyAbsences`, deduplicación, CORS whitelist para cron-job.org | ⚡ Automatización de ausencias |
| **EXIF Metadata en Fotos** | Extracción de fecha de captura + coordenadas GPS en WorkPhotos | ⚡ Verificación geográfica del trabajo |
| **ProtectedHRRoute** | Componente de guard para rutas exclusivas (Admin/Manager) | ⚡ Seguridad UI por rol |

---

## 3. Arquitectura y Stack

### 3.1 Stack Tecnológico Actual

#### Frontend
| Capa | Tecnología | Versión |
|:---|:---|:---:|
| UI Framework | React | 18.3.1 |
| Build | Vite | 5.4.10 |
| Routing | React Router DOM v6 | 6.28.0 |
| State | Redux Toolkit | 2.3.0 |
| Estilos | Tailwind CSS | 3.4.15 |
| UI Primitives | Radix UI (8 componentes) | 1.x |
| Editor Rich Text | TipTap | 3.20.1 |
| Tablas | TanStack Table | 8.20.5 |
| Charts | Recharts | 2.13.3 |
| Icons | Lucide React | 0.460.0 |
| PWA / Push | Firebase JS SDK | 12.13.0 |
| HTTP | Axios | 1.7.7 |
| Testing | Vitest | 4.1.2 |

#### Backend
| Capa | Tecnología | Versión |
|:---|:---|:---:|
| Runtime | Node.js | — |
| Framework | Express | 4.21.1 |
| ODM | Mongoose | 8.8.1 |
| DB | MongoDB Atlas | — |
| Auth | JWT + Bcrypt | 9.0.2 / 5.1.1 |
| Email | SendGrid | 8.1.6 |
| Push | Firebase Admin SDK | 13.10.0 |
| Images | Cloudinary SDK | 2.9.0 |
| Upload | Multer | 2.1.1 |
| Cron | node-cron | — |
| Testing | Jest + Supertest | 30.3.0 |

### 3.2 Correciones al Informe Anterior

El informe anterior contenía varias **imprecisiones fácticas** que este documento corrige:

| Declaración Anterior | Realidad Actual |
|:---|:---|
| "18 tareas completadas" | **24 tareas completadas** (+6) |
| "Rama actual: main" | **Rama activa:** `fix/cron-job-deduplication-logging-tests-docs`; `dev` es la rama de integración activa |
| "Bug #015 crítico PAUSADO" | **#015 COMPLETADA** — RBAC funcional con 3 roles, `PermissionCheck` middleware operativo |
| "HR-Viewer podía acceder a Perfiles HR" | Corregido: `ProtectedHRRoute` con `allowedRoles={["HR-Admin", "HR-Manager"]}` protege la ruta |
| "Nóminas NO IMPLEMENTADO" | **Modelo Salary + controlador + ruta existen** (funcionalidad base operativa) |
| "Avisos NO IMPLEMENTADO" | **Modelo Notice completo** con CRUD, audience targeting y rich text |
| "Asistencia NO IMPLEMENTADO" | **Modelo Attendance con check-in/checkout, duration, historial de logs** |
| "PWA NO COMPLETADO" | **PWA completa**: service worker de FCM, manifest, `beforeinstallprompt`, instalación |
| "Sin health checks" | **`GET /api/health`** endpoint operativo |
| "Sin tests" | **2 archivos de test**: `cron.test.js` y `leave.test.js` |
| "Sin documentación" | **1 documento**: `docs/cron-setup.md` |
| "Corporate Calendar incompleto" | Modelo + rutas existen |
| "Reclutamiento incompleto" | 3 modelos (Recruitment, Applicant, InterviewInsight) + rutas |
| "Sin WebSocket/Real-time" | Reemplazado por **FCM push notifications** que es más apropiado para el caso de uso |
| "Console.log en producción" | **Parcialmente corregido** — logs se mantienen en middleware de auth para debugging controlado |
| "Tokens sin expiración" | **Tokens JWT con expiración** implementados; invitación tokens expiran a 48h |

### 3.3 Diagrama de Arquitectura Actual

```
INTERNET
    │
    ▼
┌──────────────────────────────────────────────────────────────────┐
│                      VERCEL (CDN + Proxy)                         │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  React 18 SPA (Vite Build)                                  │  │
│  │  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │  │
│  │  │ Router  │ │  Redux   │ │ Firebase │ │  PWA Service  │  │  │
│  │  │  v6     │ │  Toolkit │ │   Auth   │ │  Worker (FCM) │  │  │
│  │  └─────────┘ └──────────┘ └──────────┘ └───────────────┘  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                         │ Proxy Rewrite (/api/*)                  │
└─────────────────────────┼────────────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│                      RENDER (Node.js)                             │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Express 4 — 23 Rutas Montadas                              │  │
│  │                                                              │  │
│  │  Middleware Pipeline:                                        │  │
│  │  CORS(regex) → CookieParser → JSON(10mb) → Auth(JWT) →      │  │
│  │  RoleAuth(PermissionCheck) → Controller → Response           │  │
│  │                                                              │  │
│  │  ┌────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐  │  │
│  │  │ JWT    │ │ Bcrypt   │ │ Multer   │ │ Cloudinary     │  │  │
│  │  │ Auth   │ │ Hash     │ │ Upload   │ │ Image Store    │  │  │
│  │  └────────┘ └──────────┘ └──────────┘ └────────────────┘  │  │
│  │                                                              │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐                   │  │
│  │  │ SendGrid │ │ FCM      │ │ node-cron│                   │  │
│  │  │ Email    │ │ Push     │ │ Jobs     │                   │  │
│  │  └──────────┘ └──────────┘ └──────────┘                   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                         │ Mongoose ODM                            │
│                         ▼                                         │
│              ┌──────────────────────┐                            │
│              │    MongoDB Atlas     │                            │
│              │   21 colecciones     │                            │
│              └──────────────────────┘                            │
└──────────────────────────────────────────────────────────────────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
   ┌─────────┐  ┌──────────────┐  ┌────────┐  ┌────────────┐
   │SendGrid │  │Firebase FCM │  │Cloudin.│  │cron-job.org│
   │(Email)  │  │(Push Notif) │  │(Images)│  │(Triggers)  │
   └─────────┘  └──────────────┘  └────────┘  └────────────┘
```

---

## 4. Análisis de Features Implementadas

### 4.1 Mapa Completo de Features (24 Tareas)

```
Tareas Completadas ──────────────────────────────────────────────────────

 001 ████████████████ Update HRCards
 002 ████████████████ Fix HRModals Dropdowns
 003 ████████████████ Fix HR Approve/Reject Buttons
 004 ████████████████ Refactor HRWorkPhotosPage
 005 ████████████████ Fix EmployeeLeaves AuthVar
 006 ████████████████ Create ThemedModal Component
 007 ████████████████ Create Employee Absences Page
 008 ████████████████ Add Employee Email Invitation
 009 ████████████████ Fix Employee Session Issues
 010 ████████████████ Update Schedule Functionality
 011 ████████████████ Migrate Colors Palette (EMS → CondoVE)
 012 ████████████████ Rename EMS to CondoVE SGC
 013 ████████████████ Fix Modal Empleados/Coordinadores
 014 ████████████████ Add EXIF Metadata to WorkPhotos
 015 ████████████████ Restrict HR Viewer Permissions (RBAC)
 016 ████████████████ Update Logo and User Greeting
 017 ████████████████ Fix Employee Checkbox Department
 018 ████████████████ Fix Employee Single Department
 019 ████████████████ Add HR Cargo System
 020 ████████████████ Sistema de Bitácoras
 021 ████████████████ Push Notifications (FCM)
 022 ████████████████ Fix Department Uniqueness per Org
 023 ████████████████ Fix Editor Paragraph Spacing
 024 ████████████████ Employee Home Department Description

Tarea Actual ────────────────────────────────────────────────────────────

 025 ████████░░░░░░░░ Cron Job: Deduplicación + Logging + Tests + Docs
      Fase 1 ✅ | Fase 2 ⏳ | Fase 3 ⏳ | Fase 4 ⏳
```

### 4.2 Features por Categoría

#### Portal HR (10 módulos)
| Módulo | Estado | Complejidad |
|:---|---:|:---:|
| Dashboard con KPIs | ✅ | Media |
| Gestión de empleados (CRUD + invitación) | ✅ | Alta |
| Gestión de departamentos | ✅ | Media |
| Gestión de horarios (semanal con tareas) | ✅ | Alta |
| Gestión de permisos/solicitudes (approve/reject) | ✅ | Alta |
| Revisión de fotos de trabajo (con EXIF + GPS) | ✅ | Alta |
| Gestión de nóminas (Salary CRUD) | ✅ | Media |
| Avisos (Notice CRUD con targeting) | ✅ | Media |
| Perfiles HR (RBAC granular) | ✅ | Alta |
| Bitácoras (vista de todas) | ✅ | Media |

#### Portal Empleado (7 módulos)
| Módulo | Estado | Complejidad |
|:---|---:|:---:|
| Home con saludo + descripción de departamento | ✅ | Baja |
| Horario semanal con tareas | ✅ | Media |
| Fotos de trabajo con geolocalización | ✅ | Alta |
| Perfil personal | ✅ | Baja |
| Solicitudes internas | ✅ | Media |
| Ausencias (historial) | ✅ | Media |
| Bitácoras (creación con TipTap + imágenes) | ✅ | Alta |

#### Sistema de Autenticación
| Feature | Estado |
|:---|---:|
| Login/Logout HR con JWT | ✅ |
| Login/Logout Empleado con JWT | ✅ |
| Registro HR con verificación email (OTP 6 dígitos) | ✅ |
| Invitación HR por email (token 48h) | ✅ |
| Invitación Empleado por email (password temporal) | ✅ |
| Recuperación de contraseña (HR + Employee) | ✅ |
| Verificación de email en 2 pasos | ✅ |
| Doble autenticación paralela (Employee + HR) | ✅ |

#### Automatizaciones
| Feature | Estado |
|:---|---:|
| Cron diario de registro de ausencias | ✅ |
| Deduplicación de ausencias en cron | ✅ |
| Notificaciones push FCM en creación de bitácora | ✅ |
| Notificaciones in-app en creación de bitácora | ✅ |
| Limpieza automática de tokens FCM inválidos | ✅ |

#### Seguridad
| Feature | Estado |
|:---|---:|
| JWT con verificación de estado en DB (cada request) | ✅ |
| RBAC: 3 roles + 13 módulos × 4 acciones (52 permisos) | ✅ |
| ProtectedHRRoute (UI guard por rol) | ✅ |
| CORS con regex whitelist | ✅ |
| Soft deletes (isDeleted + deletedAt) | ✅ |
| Compound indexes unique por organización | ✅ |
| Validación de email con regex (server + client) | ✅ |
| Límite de payload 10MB | ✅ |

---

## 5. Resolución de Bugs del Informe Anterior

### 5.1 Bugs Reportados vs. Realidad Actual

| # | Bug Reportado (Mayo 2026) | Severidad | Estado Actual | Evidencia |
|:---:|:---|:---:|:---:|:---|
| **1** | Tarea #015: HR-Viewer podía ver "Perfiles HR" | 🔴 CRÍTICA | ✅ **CORREGIDO** | `ProtectedHRRoute` con `allowedRoles={["HR-Admin", "HR-Manager"]}` en `HRroutes.jsx:74` |
| **2** | Console.log en producción (HRApiService) | 🟡 MEDIA | ⚠️ **PERSISTE** | Logs permanecen pero ahora son controlados y útiles para debugging. Se recomienda migrar a logging condicional |
| **3** | Dependencias faltantes en useEffect (protectedroutes) | 🟡 MEDIA | ⚠️ **NO VERIFICADO** | Requiere revisión de `protectedroutes.jsx` y `HRprotectedroutes.jsx` |
| **4** | Tokens en localStorage sin expiración | 🔴 CRÍTICA | ✅ **MITIGADO** | JWT tiene expiración; localStorage sigue siendo el mecanismo de almacenamiento (trade-off vs HttpOnly cookies) |
| **5** | Sin manejo de errores centralizado | 🟡 MEDIA | ⚠️ **PERSISTE** | Aún no hay Error Boundary global en React ni middleware global de errores en Express |
| **6** | Logs de depuración en Auth middleware | 🟡 MEDIA | ⚠️ **PERSISTE** | Logs en `Auth.middleware.js` y `RoleAuth.middleware.js` — se mantienen para debugging, pero deben ser condicionales en producción |
| **7** | Estado duplicado en slices | 🟢 BAJA | ⚠️ **PERSISTE** | 13 slices siguen existiendo; la arquitectura es intencional por dominio |
| **8** | Nombres inconsistentes | 🟢 BAJA | ✅ **MEJORADO** | Refactor menor en naming |

### 5.2 Bugs Nuevos Identificados (Junio 2026)

| # | Bug | Ubicación | Severidad | Descripción |
|:---:|:---|:---|:---:|:---|
| **N1** | Token FCM almacenado en localStorage sin cifrar | `usePushNotifications.js:153` | 🟡 MEDIA | El token FCM se persiste en localStorage; aunque no es un secreto crítico, podría ser usado para spam de notificaciones |
| **N2** | SendGrid API key en .env sin rotación | `server/.env:13` | 🟡 MEDIA | La API key de SendGrid está visible en el repositorio (`.env` en producción) |
| **N3** | Firestore rules no definidas | Firebase Console | 🟡 MEDIA | No se verificaron reglas de seguridad de Firebase |
| **N4** | Sin rate limiting en login | Server | 🟡 MEDIA | Los endpoints de login no tienen protección contra fuerza bruta |
| **N5** | Cron endpoints sin auth (por diseño) | `Schedule.controller.js` | 🟢 BAJA | Los endpoints cron no tienen autenticación pero están protegidos por CORS whitelist (compensación aceptable) |

---

## 6. Deuda Técnica Identificada

### 6.1 Deuda de Arquitectura

| Área | Problema | Impacto | Solución Propuesta | Esfuerzo |
|:---|:---|:---:|:---|:---:|
| **Capa de servicios** | `server/services/` tiene solo `fcm.service.js` y un `.gitkeep` | Mantenibilidad | Mover lógica de negocio de controladores a servicios | 2 semanas |
| **Validación** | Sin librería de validación (Joi/Zod) — solo Mongoose validators | Consistencia | Implementar Zod para validación de schemas compartidos | 1 semana |
| **TypeScript** | Proyecto 100% JavaScript | Type safety | Migración gradual empezando por modelos Mongoose | 1 mes |
| **Middleware global de errores** | Errores no capturados centralmente | Estabilidad | Agregar middleware `errorHandler` global en Express | 2 días |
| **Redux vs Server State** | Datos del servidor en Redux (11 slices) | Complejidad | Considerar React Query para server state, mantener Redux solo para UI state | 3 semanas |

### 6.2 Deuda de Testing

| Área | Estado Actual | Objetivo | Brecha |
|:---|---:|---:|:---:|
| **Tests unitarios backend** | 2 archivos (`cron.test.js`, `leave.test.js`) | >70% cobertura | ❌ Crítico |
| **Tests unitarios frontend** | 0 | >70% cobertura | ❌ Crítico |
| **Tests de integración** | 0 | Endpoints críticos | ❌ Crítico |
| **E2E** | 0 | Flujos principales (login, CRUD) | ❌ Alto |

### 6.3 Deuda de Documentación

| Documento | Estado | Prioridad |
|:---|---|:---:|
| API Documentation (OpenAPI/Swagger) | ❌ No existe | ALTA |
| Arquitectura del sistema | ⚠️ Parcial (solo PRD.md) | MEDIA |
| Guía de contribución | ❌ No existe | MEDIA |
| Runbook de operaciones | ❌ No existe | MEDIA |
| Changelog formal | ⚠️ Solo en `.bitacoras/` | BAJA |
| Documentación de componentes UI | ❌ Storybook no existe | BAJA |

### 6.4 Deuda de Performance

| Área | Problema | Impacto | Prioridad |
|:---|:---|:---:|:---:|
| **Lazy loading de rutas** | No hay `React.lazy` + `Suspense` | Bundle inicial grande | MEDIA |
| **React.memo / useMemo** | No implementado en listas | Re-renders innecesarios | BAJA |
| **Skeleton screens** | Solo spinners (`<Loading />`) | Percepción de lentitud | BAJA |
| **Índices MongoDB** | Faltan índices compuestos para queries frecuentes | Performance degradada con datos masivos | MEDIA |
| **Assets optimizados** | Imágenes sin CDN ni lazy loading | Tiempo de carga | BAJA |

---

## 7. Riesgos de Seguridad

### 7.1 Matriz de Riesgos Actual

| Riesgo | Probabilidad | Impacto | Severidad | Mitigación Actual | Acción Requerida |
|:---|:---:|:---:|:---:|:---|:---|
| **XSS** | Media | Alto | 🟠 ALTO | React escapa por defecto; TipTap permite HTML sanitizado | Auditar sanitización de contenido rich text |
| **JWT en localStorage** | Alta | Alto | 🟠 ALTO | JWT almacenado en localStorage (vulnerable a XSS) | Migrar a HttpOnly cookies + CSRF tokens |
| **Credenciales en .env** | Media | Alto | 🟠 ALTO | .env en producción contiene secrets | Rotar credenciales inmediatamente; usar secret manager |
| **NoSQL Injection** | Baja | Alto | 🟡 MEDIO | Mongoose sanitiza queries | Validar ObjectIds antes de consultas |
| **Falta rate limiting** | Alta | Medio | 🟡 MEDIO | No hay protección en login | Implementar `express-rate-limit` |
| **CSRF** | Baja | Medio | 🟢 BAJA | CORS whitelist mitiga parcialmente | Implementar tokens CSRF |
| **Console.logs** | Alta | Bajo | 🟢 BAJA | Logs expuestos en producción | Implementar logging condicional (NODE_ENV) |
| **Cron endpoints sin auth** | Baja | Medio | 🟢 BAJA | Protegido por CORS whitelist + solo registra ausencias | Aceptable como está (compensación controlada) |

### 7.2 Recomendaciones de Seguridad Inmediatas

```javascript
// 1. Implementar rate limiting en login
import rateLimit from 'express-rate-limit';
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 intentos
    message: { success: false, message: "Demasiados intentos. Intenta de nuevo en 15 minutos." }
});
app.use("/api/auth/", loginLimiter);

// 2. Agregar middleware de errores global
app.use((err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] ERROR:`, err.message);
    res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'Error interno del servidor'
            : err.message
    });
});

// 3. Logging condicional
if (process.env.NODE_ENV !== 'production') {
    console.log("[DEBUG] ...");
}
```

---

## 8. Observabilidad y Monitoreo

### 8.1 Estado Actual

| Capacidad | Estado | Detalle |
|:---|---:|:---|
| **Health check endpoint** | ✅ | `GET /api/health` → `{ status: "ok" }` |
| **Logging en servidor** | ⚠️ Parcial | `console.log` disperso, sin niveles (info/warn/error) |
| **Logging en cliente** | ⚠️ Parcial | Axios interceptors loggean requests/responses |
| **Métricas de aplicación** | ❌ | No hay métricas (CPU, memoria, request rate) |
| **Alerting** | ❌ | No hay sistema de alertas |
| **Tracing distribuido** | ❌ | No hay tracing (OpenTelemetry, etc.) |
| **Error tracking** | ❌ | No hay Sentry/DataDog |
| **Analytics de usuario** | ❌ | No hay seguimiento de uso |

### 8.2 Recomendaciones

| Prioridad | Herramienta | Propósito | Esfuerzo |
|:---:|:---|---|:---:|
| 1 | **Winston/Pino** | Logging estructurado con niveles (reemplazar console.log) | 3 días |
| 2 | **Sentry** | Error tracking en backend + frontend | 2 días |
| 3 | **express-rate-limit** | Monitoreo de intentos de acceso | 1 día |
| 4 | **Prometheus + Grafana** | Métricas de aplicación en Render | 1 semana |
| 5 | **Vercel Analytics** | Analíticas de frontend | 1 día |

---

## 9. Cobertura de Tests

### 9.1 Estado Actual

```
Archivos de test: 2
├── server/tests/cron.test.js    ✅ Tests de endpoints cron
└── server/tests/leave.test.js   ⚠️ Test preexistente con fallo conocido (jest/globals)

Cobertura estimada: < 5%
```

### 9.2 Plan de Tests Recomendado

| Fase | Área | Tipo | Tests Estimados | Prioridad |
|:---:|:---|---:|---:|:---:|
| 1 | Autenticación HR (login, signup, verify) | Integración | 10 | 🔴 CRÍTICA |
| 2 | Autenticación Employee (login, invite, reset) | Integración | 8 | 🔴 CRÍTICA |
| 3 | CRUD Empleados (crear, leer, actualizar, eliminar) | Integración | 12 | 🟠 ALTA |
| 4 | CRUD Departamentos | Integración | 8 | 🟠 ALTA |
| 5 | Flujo de Permisos (Leave: create, approve, reject) | Integración | 10 | 🟠 ALTA |
| 6 | Cron Jobs (registro de ausencias, deduplicación) | Unit + Integración | 6 | 🟡 MEDIA |
| 7 | RBAC (permisos por rol, PermissionCheck) | Integración | 8 | 🟡 MEDIA |
| 8 | Notificaciones (FCM, in-app) | Integración | 6 | 🟡 MEDIA |
| 9 | Frontend: Renderizado de componentes | Unit (Vitest) | 20 | 🟢 BAJA |
| 10 | Frontend: Flujos de usuario (login, dashboard) | E2E (Playwright) | 10 | 🟢 BAJA |

---

## 10. Roadmap Estratégico

### 10.1 Fase 0: Finalización de Tarea #025 (1 semana)

- [ ] **Fase 2**: Logging estructurado con timestamps en cron handlers
- [ ] **Fase 3**: Tests unitarios para endpoints cron
- [ ] **Fase 4**: Documentación `cron-setup.md` (ya existe commit, verificar)

### 10.2 Fase 1: Fortaleza Técnica (Semanas 2-4)

| Prioridad | Tarea | Esfuerzo | Dependencias |
|:---:|---|:---:|:---:|
| 🔴 1 | Migrar JWT a HttpOnly cookies | 1 semana | Ninguna |
| 🔴 2 | Rate limiting en login (express-rate-limit) | 1 día | Ninguna |
| 🔴 3 | Middleware global de errores en Express | 2 días | Ninguna |
| 🔴 4 | Validación con Zod (schemas compartidos client/server) | 1 semana | Ninguna |
| 🟠 5 | Logging condicional (NODE_ENV) | 1 día | Ninguna |
| 🟠 6 | Winston/Pino para logging estructurado | 3 días | Ninguna |

### 10.3 Fase 2: Testing (Semanas 5-8)

| Prioridad | Tarea | Esfuerzo |
|:---:|---|:---:|
| 🔴 1 | Tests de autenticación (HR + Employee) | 1 semana |
| 🟠 2 | Tests de CRUD principales | 2 semanas |
| 🟠 3 | Tests de RBAC y permisos | 1 semana |
| 🟡 4 | Configurar Vitest para frontend | 3 días |
| 🟡 5 | Tests de componentes críticos | 2 semanas |

### 10.4 Fase 3: Documentación y Calidad (Semanas 9-10)

| Prioridad | Tarea | Esfuerzo |
|:---:|---|:---:|
| 🟠 1 | API Documentation con Swagger/OpenAPI | 1 semana |
| 🟠 2 | Error Boundaries en React | 2 días |
| 🟡 3 | Guía de contribución (CONTRIBUTING.md) | 2 días |
| 🟡 4 | Runbook de operaciones | 2 días |

### 10.5 Fase 4: Performance y Escalabilidad (Semanas 11-12)

| Prioridad | Tarea | Esfuerzo |
|:---:|---|:---:|
| 🟠 1 | Lazy loading de rutas + Suspense | 2 días |
| 🟠 2 | Índices compuestos en MongoDB | 1 día |
| 🟡 3 | React.memo en listas pesadas | 2 días |
| 🟡 4 | Skeleton screens (reemplazar spinners) | 3 días |
| 🟢 5 | React Query para server state (evaluación) | 1 semana |

### 10.6 Fase 5: TypeScript (Roadmap Extendido)

| Tarea | Esfuerzo | Dependencias |
|:---|:---:|:---|
| Migrar modelos Mongoose a TS | 1 semana | Fase 1 |
| Migrar controladores a TS | 2 semanas | Modelos en TS |
| Migrar slices Redux a TS | 1 semana | — |
| Migrar componentes críticos a TS | 3 semanas | Slices en TS |

---

## 11. Recomendaciones del CTO

### 11.1 Quick Wins (Esta Semana)

1. **✅ Finalizar tarea #025** — Completar Fases 2-4 del cron job (logging, tests, docs). Ya hay commits preparados.
2. **🔒 Rate limiting** — Agregar `express-rate-limit` a endpoints de login (2 horas de trabajo).
3. **🛡️ Logging condicional** — Envolver `console.log` en servidor con `if (process.env.NODE_ENV !== 'production')`.
4. **📋 Error handler global** — Agregar middleware de errores en Express (30 minutos).
5. **📄 Documentación API** — Al menos documentar los endpoints principales en un archivo `API.md`.

### 11.2 Prioridades a 1 Mes

1. **JWT HttpOnly cookies** — La vulnerabilidad más crítica. Migrar de localStorage a cookies HttpOnly con CSRF tokens.
2. **Test suite de autenticación** — El flujo de login/registro/invitación debe estar cubierto por tests antes de cualquier cambio mayor.
3. **Validación Zod** — Schemas compartidos entre cliente y servidor eliminan bugs de interfaz.
4. **Sentry** — Error tracking en producción para identificar bugs que los usuarios encuentran pero los logs no capturan.

### 11.3 Decisiones Arquitectónicas Pendientes

| Decisión | Opciones | Recomendación |
|:---|:---|:---:|
| **State Management** | Mantener Redux puro vs React Query + Redux | **Híbrido**: React Query para server state (datos del API), Redux para UI state (temas, sidebar, UI flags) |
| **Auth Strategy** | localStorage JWT vs HttpOnly cookies + CSRF | **HttpOnly cookies** — es el estándar de seguridad para apps web |
| **Testing Framework** | Jest vs Vitest (frontend) | **Vitest** — ya está configurado, es más rápido y compatible con Vite |
| **TypeScript** | Migración gradual vs completa | **Gradual** — empezar por modelos/data layer, luego componentes críticos |
| **Email Service** | SendGrid vs Resend/SES | **Mantener SendGrid** — ya está integrado y funcional; reevaluar si costos escalan |

### 11.4 Lo Que el Informe Anterior NO Detectó

El informe de mayo de 2026 omitió varios aspectos que este informe corrige:

1. **No consideró el sistema de bitácoras como core del producto** — Es la feature más战略性 para la retención de usuarios, ya que convierte a los empleados en generadores activos de contenido diario.
2. **Subestimó la complejidad del RBAC** — Describió el bug de permisos como un "fix de sidebar" cuando en realidad requería cambios en: login response, middleware de backend, slices de Redux, hooks, y 3 componentes UI diferentes.
3. **No identificó el modelo de negocio** — El sistema multi-tenant con Organization como raíz es la clave para escalar el producto como SaaS.
4. **Ignoró el potencial de FCM** — Las notificaciones push transforman la plataforma de "pull" (el usuario tiene que entrar) a "push" (la plataforma llega al usuario).
5. **Marco features como "NO IMPLEMENTADO" cuando sí lo estaban** — Nóminas, Avisos, Asistencia y PWA ya tenían implementación base al momento del informe.

---

## 12. Conclusión

### 12.1 Diagnóstico General

```
                       DEBILIDADES                    FORTALEZAS
                        │                                │
    Testing             ■■■■■■■■■■■■■■■■■■                │
    TypeScript          ■■■■■■■■■■■■■■■■■■                │
    Documentación       ■■■■■■■■■■■■                      │
    Seguridad           ■■■■■■■■■■                        │
    Performance         ■■■■■■                            │
    Features            ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ │
    UX/UI               ■■■■■■■■■■■■■■■■■■■■■■■■■■■      │
    Arquitectura        ■■■■■■■■■■■■■■■■■■■■■■■■■■       │
                        │                                │
                        ◄────── MEJORAR ──── EXCELENTE ──►
```

### 12.2 Puntuación por Dimensión

| Dimensión | Puntaje (1-10) | Interpretación |
|:---|---:|:---|
| **Cobertura funcional** | 9.0 | 24/25 tareas completadas; solo 1 feature parcial |
| **Arquitectura** | 7.5 | Sólida base MERN; oportunidades en capa de servicios y validación |
| **UX/UI** | 8.0 | Design System v4, modo oscuro, responsive; faltan skeletons y estados vacíos |
| **Seguridad** | 6.0 | JWT en localStorage es el riesgo mayor; lo demás está controlado |
| **Testing** | 2.0 | <5% cobertura — la deuda más crítica |
| **Documentación** | 4.0 | PRD completo, falta API docs y contribución |
| **Performance** | 6.5 | App responde bien; faltan optimizaciones preventivas |
| **DevOps** | 6.0 | CI básico, deploys automáticos; falta observabilidad |

### 12.3 Veredicto Final

> **El proyecto Condominios Venezuela SGC está en una posición sólida desde el punto de vista funcional, con 24 de 25 tareas completadas y una arquitectura MERN bien ejecutada. El equipo ha demostrado capacidad de entrega consistente (6 features mayores en 3 semanas desde el informe anterior).**
>
> **La prioridad absoluta debe ser la migración de JWT de localStorage a HttpOnly cookies** (riesgo de seguridad crítico) y **el aumento de cobertura de tests** (deuda técnica más significativa). Estas dos acciones desbloquean la madurez necesaria para escalar el producto de manera segura.
>
> **La feature de notificaciones push FCM y el sistema de bitácoras posicionan al producto por encima de competidores típicos de gestión condominial.** La estrategia recomendada es capitalizar estas fortalezas mientras se reduce la deuda técnica identificada.

---

*Informe generado el 10 de junio de 2026*  
*Perspectiva: CTO de clase mundial*  
*Este informe reemplaza y actualiza completamente la versión del 18 de mayo de 2026*
