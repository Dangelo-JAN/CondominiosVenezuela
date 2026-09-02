---
trigger: always_on
---

# 🌍 Global Context & Master Rules (Condominios Venezuela - SGC)

## 1. Visión del Proyecto
Sistema de Gestión Empresarial Integral enfocado en el mercado venezolano (`condo.ve`), diseñado para optimizar el control de asistencia, nómina y comunicación interna. Lema central: "Gestiona tu equipo de forma inteligente".

## 2. Tech Stack & Infraestructura
- **Frontend:** React 18, Vite, Tailwind CSS, Redux Toolkit, React Router DOM v6, Recharts, Radix UI, Lucide React.
- **Backend:** Node.js, Express, Mongoose, JWT, Bcrypt, Cloudinary, SendGrid.
- **Base de Datos:** MongoDB Atlas.

## 3. Arquitectura y Principios
- **Arquitectura MERN:** Separación orgánica en `client/` y `server/`.
- **Estado Global:** Redux Toolkit para centralización de datos asíncronos.
- **Gestión Visual (Theme Toggle):** `useIsDark()` (boolean reactivo) para LECTURA de `isDark`; `useTheme()` SOLO para el `toggleTheme`. Prohibido tocar el DOM directamente ni fusionar los contratos (ver `design-system/specs.md` §3).
- **Separación de Responsabilidades:** Componentes UI en `components/common/`, Layouts en `pages/`, Fetchers en `redux/thunks`.

## 4. The Source of Truth
- **Datos:** MongoDB Atlas via Express Schemas.
- **UI:** Store de Redux como caché y fuente visual primaria.
- **Autoridad:** Token JWT para permisos y sesiones.

## 5. Reglas Especializadas
Las reglas detalladas de rutas, desarrollo, naming, técnicas, accesibilidad y funcionalidades específicas están en archivos dedicados. Consultar según el contexto de la tarea:

| Contexto | Archivo |
|----------|---------|
| Reglas detalladas (rutas, invariantes, naming, técnicas, accesibilidad, push) | `.agent/rules/global-context/index.md` |
| Diseño visual (colores, componentes, tokens) | `.agent/rules/design-system/index.md` |
| **Deploy Local y Testing de Desarrollo** | `.agent/rules/global-context/local-deploy.md` |

### ⛔ REGLA DE DEPLOY LOCAL — NO NEGOCIABLE
Si se requiere ejecutar el entorno de desarrollo o testing local, **DEBES** seguir el protocolo estrictamente documentado en **[.agent/rules/global-context/local-deploy.md](.agent/rules/global-context/local-deploy.md)**. Esta regla garantiza la integridad del dataset semilla y la correcta inicialización del stack (Docker, Backend y Frontend).

## 6. Flujo de Git (NO NEGOCIABLE)
Seguir estrictamente `.agent/workflows/git-workflow.md`. Prohibido commit directo a `main` o `dev`.

## 7. Regla Obligatoria de Pull Request
**NUNCA** PR directo a `main`. Flujo obligatorio: `Rama de trabajo` → `dev` → `main`.

## 8. Protocolo de Triaje
1. **Exentas (sin Git/Bitácora):** Cambios en `.gitignore`, `.agent/`, `.opencode/`, pruebas locales.
2. **Trackeables (Git + PR + Bitácora):** Todo cambio en `client/`, `server/`, assets o config de producción.
