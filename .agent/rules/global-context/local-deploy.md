# 🛠️ Guía de Deploy Local para Testing de Desarrollo

> **Regla NO NEGOCIABLE:** Cualquier levantamiento o configuración del entorno local de desarrollo **DEBE** seguir estrictamente lo documentado en **[MASTER-INIT.md](../../MASTER-INIT.md)**. No existen atajos ni variantes permitidas.

---

## 1. Propósito de esta guía

Esta guía actúa como el punto de entrada rápido para los agentes de IA y desarrolladores que necesitan replicar el entorno de pruebas localmente. Centraliza las reglas de memoria vital para el correcto funcionamiento del stack (Docker, Backend y Frontend).

## 2. Reglas Fundamentales de Memoria (Local)

### 2.1 Credenciales y Acceso
- **Cuenta de Prueba (HR-Admin):** `admin@test.local` / `Password123` (Organización: Org Demo).
- **Credenciales de Empleados:** `{nombre}.{apellido}{N}@test.local` / `Empleado123`.
- **Persistencia:** El dataset semilla y los usuarios permanecen activos mientras NO se ejecute `docker rm -f mongo-local`.

### 2.2 Gestión del Contenedor Docker
- **NUNCA** ejecutar `docker run` si el contenedor `mongo-local` ya existe (provoca destrucción de datos y conflictos de puertos).
- Para reanudar servicios tras un reinicio o apagado, utilizar **SIEMPRE** `docker start mongo-local`.
- Para levantar el stack completo, seguir la secuencia: `docker start` + `npm run server` (backend) + `npm run dev` (frontend).

### 2.3 Protocolo para Agentes de IA
Los agentes que operen sobre este repositorio deben seguir el protocolo de levantamiento no interactivo definido en la **[Sección 14 de MASTER-INIT.md](../../MASTER-INIT.md#14-reapertura-de-servicios-uso-diario-y-agentes-ia)**:

1. **Pre-check:** Verificar estado de contenedores y puertos.
2. **Arranque en Background:** Utilizar `setsid nohup` para desacoplar los procesos de la sesión del shell.
3. **Polling de Readiness:** Verificar el éxito leyendo los logs (`/tmp/opencode/logs/`) antes de confirmar.
4. **Smoke Tests:** Realizar pruebas de integración básicas (`curl` a `/api/health` y login) para validar la integridad del entorno.

> ⚠️ **IMPORTANTE:** El uso de `nodemon` actualmente requiere instalación global (`npm install -g nodemon`) o el manejo del script de forma nativa según lo indicado en §2.7 de la guía maestra.

## 3. Resumen de Comandos Esenciales

| Acción | Comando | Notas |
| :--- | :--- | :--- |
| **Iniciar DB** | `docker start mongo-local` | Solo si el contenedor existe y está detenido. |
| **Iniciar Backend** | `cd server && npm run server` | Puerto 4000. |
| **Iniciar Frontend** | `cd client && npm run dev` | Puerto 5173. |
| **Verificar Estado** | `curl http://localhost:4000/api/health` | Debe retornar `{"status":"ok"}`. |

---
*Referencia completa: [MASTER-INIT.md](../../MASTER-INIT.md)*
