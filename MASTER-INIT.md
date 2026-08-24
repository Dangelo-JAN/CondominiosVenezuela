# 🚀 MASTER-INIT — Guía Maestra de Inicialización Local

> **Documento oficial para desarrolladores.** Objetivo: que cualquier persona del equipo —del junior más nuevo al senior más curtido— levante el proyecto completo en local **sin errores, al primer intento**, sin necesidad de preguntar a nadie.
>
> **Enfoque de esta guía:** aplicación corriendo de forma nativa (Opción A) con base de datos **local en Docker** (sandbox seguro). Nada de esta guía toca producción.
>
> Si algún comando falla o algo cambió respecto a lo documentado, repórtalo al líder técnico para actualizar este archivo.

---

## 📑 Índice

1. [¿Qué es este proyecto?](#1-qué-es-este-proyecto)
2. [Requisitos previos](#2-requisitos-previos)
3. [Instalación de dependencias](#3-instalación-de-dependencias)
4. [Levantar la base de datos local (Docker)](#4-levantar-la-base-de-datos-local-docker)
5. [Configurar las variables de entorno (.env)](#5-configurar-las-variables-de-entorno-env)
6. [Levantar el backend (server)](#6-levantar-el-backend-server)
7. [Primer arranque: crear tu cuenta](#7-primer-arranque-crear-tu-cuenta)
8. [Levantar el frontend (client)](#8-levantar-el-frontend-client)
9. [Verificar que todo funciona](#9-verificar-que-todo-funciona)
10. [Inspeccionar la base de datos](#10-inspeccionar-la-base-de-datos)
11. [Correr los tests automatizados](#11-correr-los-tests-automatizados)
12. [Errores comunes y soluciones](#12-errores-comunes-y-soluciones)
13. [Checklist final](#13-checklist-final)

---

## 1. ¿Qué es este proyecto?

**SGC — Sistema de Gestión de Condominios Venezuela** (`condo.ve`): plataforma para control de asistencia, nómina, reclutamiento y comunicación interna de equipos de trabajo.

| Pieza | Carpeta | Tecnología | Corre en |
|---|---|---|---|
| Frontend | `client/` | React 18 + Vite + Tailwind CSS + Redux Toolkit | Tu máquina (nativo) |
| Backend | `server/` | Node.js + Express + Mongoose | Tu máquina (nativo) |
| Base de datos | Docker | MongoDB 7 en contenedor local | Tu máquina (Docker) |

```
Navegador ──► client (Vite, puerto 5173) ──► server (Express, puerto 4000) ──► Mongo local (Docker, puerto 27017)
```

> ℹ️ En producción la app usa MongoDB Atlas (nube). **En local usamos nuestro propio Mongo en Docker**: es idéntico para efectos de desarrollo y cero riesgo de tocar datos reales.

---

## 2. Requisitos previos

Verifica CADA uno con su comando. Si alguno falla, instálalo antes de continuar.

### 2.1 Node.js — versión 20 o superior

```bash
node -v
```

**Salida esperada:** algo como `v20.x.x`, `v22.x.x` o superior. Si ves `v18.x.x` o menor → **detente**, actualiza Node primero (el backend usa `firebase-admin@13`, que exige Node ≥ 20).

> 💡 Se recomienda instalar Node con [nvm](https://github.com/nvm-sh/nvm): `nvm install --lts`

### 2.2 npm

```bash
npm -v
```

**Salida esperada:** `10.x.x` o superior (viene incluido con Node).

### 2.3 Docker — **obligatorio** (es nuestra base de datos local)

```bash
docker --version && docker ps
```

**Salida esperada:** versión de Docker (`27.x`+ recomendado) Y una tabla (aunque esté vacía) del comando `docker ps`.

Si `docker ps` da error tipo *Cannot connect to the Docker daemon* → abre Docker Desktop (Windows/Mac) o inicia el servicio (`sudo systemctl start docker`) y reintenta.

### 2.4 git

```bash
git --version
```

**Salida esperada:** `git version 2.x.x`.

### 2.5 curl (para verificaciones)

```bash
curl --version
```

**Salida esperada:** `curl 7.x.x` o superior. En Windows, úsalo desde WSL, Git Bash o PowerShell moderno.

### 2.6 Credenciales de servicios externos (solo Firebase es indispensable)

| Servicio | ¿Necesario para levantar? | Quién te da acceso |
|---|---|---|
| Firebase (push notifications) | ✅ Sí — el client no arranca sin sus variables | Líder técnico |
| Cloudinary (fotos/videos) | Solo al probar subidas de archivos | Líder técnico |
| SendGrid (correos) | ❌ No bloquea nada en local (ver §7) | Líder técnico |
| MongoDB Atlas | ❌ **NO se usa en esta guía** (tenemos Mongo local) | — |

---

## 3. Instalación de dependencias

Desde la **raíz del repositorio**, ejecuta en orden:

```bash
cd server
npm install
```

**Salida esperada:** `added ~250 packages in Xs` (el número exacto varía; lo importante es que **no aparezca** `ERR!`).

```bash
cd ../client
npm install
```

**Salida esperada:** `added ~450 packages in Xs`, sin errores `ERR!`.

> ⚠️ Ambas carpetas tienen su propio `package.json`. Instalar en una NO instala la otra. Si saltaste este paso, todo lo demás fallará.

---

## 4. Levantar la base de datos local (Docker)

Este proyecto guarda TODOS los datos en MongoDB. En local, tu base de datos será un contenedor Docker en tu propia máquina: puedes crear, borrar y destruir datos libremente sin consecuencias.

### 4.1 Arrancar el contenedor (una sola vez por sesión de trabajo)

```bash
docker run -d --name mongo-local -p 27017:27017 mongo:7
```

**Salida esperada:** un hash largo tipo `a1b2c3d4e5...` (el ID del contenedor).

Verifica que está corriendo:

```bash
docker ps
```

**Salida esperada:** una fila con `mongo:7`, nombre `mongo-local`, puerto `0.0.0.0:27017->27017/tcp`, estado `Up ...`.

### 4.2 Reglas del contenedor

| Situación | Comando |
|---|---|
| Apagaste la PC / reiniciaste Docker → contener detenido | `docker start mongo-local` (NO vuelve a hacer `run`) |
| Ver qué contenedores existen (incluidos apagados) | `docker ps -a` |
| Terminaste y quieres borrar TODO (contenedor + datos) | `docker rm -f mongo-local` |
| Ver logs de la BD | `docker logs mongo-local` |

> 💡 El contenedor conserva datos entre reinicios mientras NO lo borres. `docker rm` sí borra los datos — úsalo cuando quieras empezar de cero.

---

## 5. Configurar las variables de entorno (.env)

El proyecto necesita **DOS archivos `.env`**: uno para el backend y otro para el frontend. Sin ellos, nada arranca.

### 5.1 Backend — `server/.env`

Crea el archivo dentro de la carpeta `server/` y pega esta estructura:

```env
MONGODB_URI=mongodb://localhost:27017/condove_local
appName=SGC
PORT=4000
JWT_SECRET=<pídelo al líder técnico>
CLIENT_URL=http://localhost:5173
EMAIL_USER=<correo remitente — puede ser cualquiera en local>
CLOUDINARY_CLOUD_NAME=<api cloud>
CLOUDINARY_API_KEY=<api key>
CLOUDINARY_API_SECRET=<api secret>
SENDGRID_API_KEY=<api key de sendgrid — opcional en local>
SENDGRID_SENDER_EMAIL=<correo verificado — opcional en local>
FIREBASE_PROJECT_ID=<id del proyecto firebase>
FIREBASE_PRIVATE_KEY=<clave privada — respeta los \n>
FIREBASE_CLIENT_EMAIL=<service account email>
```

**Campos críticos explicados:**

| Variable | Qué hace | Valor para local |
|---|---|---|
| `MONGODB_URI` | Conexión a la BD → **apunta a tu Docker local** | `mongodb://localhost:27017/condove_local` (tal cual; la DB se crea sola al primer uso) |
| `PORT` | Puerto donde escucha el backend | `4000` |
| `CLIENT_URL` | Origen web permitido por CORS | `http://localhost:5173` — **EXACTO, sin `/` final** |

### 5.2 Frontend — `client/.env`

```env
VITE_BACKEND_API=http://localhost:4000
VITE_FIREBASE_API_KEY=<api key firebase web>
VITE_FIREBASE_PROJECT_ID=<id del proyecto firebase>
VITE_FIREBASE_APP_ID=<app id firebase>
VITE_FIREBASE_VAPID_KEY=<clave vapid para push>
```

**Campo crítico:** `VITE_BACKEND_API` debe apuntar al mismo puerto que pusiste en `PORT` del server. Con esta guía: `http://localhost:4000`.

### 5.3 ⚠️ Reglas de oro de los .env

1. **NUNCA hagas commit de un archivo `.env`.** Ya están excluidos por `.gitignore`; no los fuerces con `git add -f`.
2. Si cambias `PORT` del server (ej. `5000`), DEBES cambiar también `VITE_BACKEND_API` del cliente.
3. Si cambias el puerto del frontend (ej. Vite sube a `5174` porque la `5173` estaba ocupada), DEBES cambiar `CLIENT_URL` del server.
4. **Nunca pegues la URI de Atlas (producción) en tu `.env` local salvo instrucción expresa del líder técnico.** Esta guía está pensada para trabajar 100% contra tu Mongo de Docker.

---

## 6. Levantar el backend (server)

Abre una terminal y deja esta pestaña **siempre abierta** mientras desarrollas:

```bash
cd server
npm run server
```

**Salida esperada (en este orden):**

```
> nodemon index.js
[nodemon] starting `node index.js`
MongoDB connected...
Server running on http://localhost:4000
```

Si ves esas dos últimas líneas → **backend funcionando** ✅. `nodemon` reinicia solo cada vez que guardes un cambio en `server/`.

> 🚨 **ERROR TÍPICO #1:** ejecutar `npm start`. **ESE SCRIPT NO EXISTE** en este proyecto. El comando correcto es `npm run server`.
>
> 🚨 **ERROR TÍPICO #2:** cerrar la terminal del server. Mientras esté cerrada, el frontend dará errores de red (`net::ERR_CONNECTION_REFUSED`).
>
> 🚨 **ERROR TÍPICO #3:** arrancar el server SIN tener el contenedor Docker corriendo (§4). Verás `Error connecting to MongoDB` y el proceso morirá.

---

## 7. Primer arranque: crear tu cuenta

⚠️ **Tu Mongo local está recién creado: está VACÍO.** No hay usuarios, no hay organizaciones. Este paso crea tu primer usuario administrador (HR-Admin) — solo se hace UNA vez por base de datos.

### 7.1 Opción recomendada — desde la interfaz

Con backend y frontend corriendo (§6 y §8), ve a la página de registro HR de la app (`HRSignup`) y completa el formulario: tus datos + los de una organización de prueba (nombre, descripción, URL y correo ficticios sirven).

### 7.2 Opción alternativa — con curl

```bash
curl -X POST http://localhost:4000/api/auth/HR/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstname": "Test",
    "lastname": "Admin",
    "email": "admin@test.local",
    "password": "Password123",
    "contactnumber": "04141234567",
    "name": "Org Demo",
    "description": "Organizacion de prueba local",
    "OrganizationURL": "orgdemo",
    "OrganizationMail": "org@test.local"
  }'
```

**Salida esperada (recortada):**

```json
{
  "success": true,
  "message": "Organization Created Successfully & HR Registered Successfully",
  "verificationcode": "123456",
  ...
}
```

### 7.3 Verificar el correo (importante)

La cuenta nace **sin verificar**. La app intenta enviarte un código por email (SendGrid), pero **si SendGrid falla o no tiene credenciales no pasa nada**: el código viaja igual en la respuesta JSON del signup (campo `verificationcode`). Úsalo así:

```bash
curl -X POST http://localhost:4000/api/auth/HR/verify-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token-que-devolvió-el-signup>" \
  -d '{"verificationcode": "123456"}'
```

**Salida esperada:** `{"success": true, "message": "Email Verified successfully", ...}`

### 7.4 Crear empleados de prueba

Los empleados se crean desde la app ya logueado como HR (módulo de Empleados → invitar/registrar). Así tendrás datos reales para probar asistencia, nómina, etc.

---

## 8. Levantar el frontend (client)

Abre una **segunda terminal** (la primera sigue corriendo el backend):

```bash
cd client
npm run dev
```

**Salida esperada:**

```
VITE v5.4.x  ready in ~800 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

Abre en tu navegador: **`http://localhost:5173`**

> 🚨 **Usa EXACTAMENTE `http://localhost:5173`.** NO uses `http://127.0.0.1:5173`. Aunque parecen iguales, para el navegador son orígenes distintos y el login fallará silenciosamente (ver [Errores comunes §12.3](#123-el-login-no-mantiene-la-sesión--peticiones-fallan-con-cors)).

---

## 9. Verificar que todo funciona

Ejecuta estas verificaciones EN ORDEN. No continúes si alguna falla.

### 9.1 Health check del backend

En una tercera terminal (o postman):

```bash
curl http://localhost:4000/api/health
```

**Salida esperada:**

```json
{"status":"ok"}
```

### 9.2 Login real desde el navegador

1. Ve a `http://localhost:5173` e inicia sesión con la cuenta creada en §7.
2. Recarga la página con **F5** → la sesión debe mantenerse.

### 9.3 Verificación técnica en DevTools (F12)

| Dónde mirar | Qué debes ver |
|---|---|
| **Console** | Sin errores rojos de CORS ni `ERR_CONNECTION_REFUSED` |
| **Application → Local Storage → localhost:5173** | Clave `HRtoken` con un JWT largo (eyJhbGci...) tras hacer login |
| **Network → cualquier petición `/api/v1/*` → Headers** | Header `Authorization: Bearer eyJ...` presente |

> ℹ️ Dato útil: la autenticación de este proyecto viaja por header `Authorization` con token guardado en localStorage — no depende de cookies. Si en DevTools ves el token pero las peticiones fallan, revisa la sección [12](#12-errores-comunes-y-soluciones).

### 9.4 Prueba funcional mínima

Navega al Dashboard y abre la lista de empleados. Si cargan datos (o la lista vacía responde bien tras crear empleados en §7.4) → el circuito completo (frontend → backend → Mongo Docker) está operativo.

---

## 10. Inspeccionar la base de datos

Tu BD vive en el contenedor Docker local. Inspecciónala sin miedo: son TUS datos de prueba.

### 10.1 Opción A — mongosh dentro del contenedor (cero instalación extra)

```bash
docker exec -it mongo-local mongosh condove_local
```

Comandos básicos dentro del shell:

```javascript
show collections                                  // colecciones: organizations, humanresources, employees...
db.humanresources.find().limit(5)                 // leer usuarios HR
db.employees.countDocuments()                     // contar empleados
db.leaves.find({ status: "pending" })             // filtrar permisos pendientes
db.reports.find().sort({ createdAt: -1 }).limit(3) // últimos reportes
exit                                              // salir
```

### 10.2 Opción B — MongoDB Compass (interfaz gráfica, recomendado)

Descarga [MongoDB Compass](https://www.mongodb.com/products/compass/compass), conéctalo con:

```
mongodb://localhost:27017/condove_local
```

y explora colecciones/documentos con clicks. Ideal para verificar visualmente que tus pruebas escribieron datos.

### 10.3 ⚠️ Sobre conectar a Atlas (solo con autorización explícita)

Si el líder técnico te autoriza revisar datos de staging/producción: copia esa URI en Compass (**modo solo lectura**) o en `mongosh` para consultar. **JAMÁS pongas una URI de Atlas en tu `server/.env` local sin instrucción expresa**, y jamás ejecutes writes sobre ella.

> 🔒 **Regla de oro:** si no sabes si una URI es producción o staging, TRÁTALA COMO PRODUCCIÓN: solo lecturas. Tu entorno local de esta guía nunca necesita Atlas.

---

## 11. Correr los tests automatizados

Los tests usan una base de datos **en memoria efímera** (`mongodb-memory-server`): NO tocan ni tu Docker ni Atlas. Puedes correrlos sin miedo y sin conexión a internet.

### 11.1 Tests del backend (Jest)

```bash
cd server
npm run test
```

**Salida esperada:** todas las suites en verde (`PASS`) y un resumen tipo `Tests: X passed, X total`.

Suites incluidas: `cron.test.js`, `leave.test.js`, `report.test.js`, `reportController.test.js` (carpeta `server/tests/`).

### 11.2 Tests del frontend (Vitest)

```bash
cd client
npm run test          # una sola pasada
npm run test:watch    # modo observación continua (opcional)
```

**Salida esperada:** `Test Files  X passed` / `Tests  X passed`.

### 11.3 Build de producción (verificación final)

```bash
cd client
npm run build
```

**Salida esperada:** termina con `✓ built in Xs` y genera la carpeta `dist/`. **Debe completarse con 0 errores** — así se valida antes de cualquier entrega.

Para probar ese build compilado en local:

```bash
npm run preview     # sirve el dist → http://localhost:4173
```

> ⚠️ Si usas preview (puerto **4173**), cambia `CLIENT_URL` en `server/.env` a `http://localhost:4173` y reinicia el server.

---

## 12. Errores comunes y soluciones

### 12.1 `Cannot connect to the Docker daemon`

| | |
|---|---|
| **Causa** | Docker Desktop está cerrado o el servicio de Docker no arrancó |
| **Solución** | Abre Docker Desktop (Windows/Mac) o ejecuta `sudo systemctl start docker` (Linux). Espera ~30s y reintenta `docker ps` |

### 12.2 `Error connecting to MongoDB: ...` y el server se cierra

| | |
|---|---|
| **Causa A** | El contenedor `mongo-local` no está corriendo (te saltaste §4 o reiniciaste la PC) |
| **Solución A** | `docker ps -a` → si aparece detenido: `docker start mongo-local`. Si no existe: repite el `docker run` de §4.1 |
| **Causa B** | La IP de Atlas no está autorizada (solo aplica si conectaste a Atlas en vez del Docker local) |
| **Solución B** | No conectes a Atlas en local. Usa la URI de Docker de esta guía |

### 12.3 El login no mantiene la sesión / peticiones fallan con CORS (usando 127.0.0.1)

| | |
|---|---|
| **Causa** | Estás navegando en `http://127.0.0.1:5173` en vez de `http://localhost:5173` |
| **Solución** | Cambia la URL del navegador a `http://localhost:5173`. Son orígenes distintos para el navegador y solo uno está autorizado |

### 12.4 En la consola del navegador: `No permitido por CORS (Regex Vercel)`

| | |
|---|---|
| **Causa** | El `CLIENT_URL` del server no coincide EXACTAMENTE con el origen de tu navegador |
| **Solución** | En `server/.env`: `CLIENT_URL=http://localhost:5173` (sin `/` final, sin espacios). Reinicia el server (Ctrl+C → `npm run server`) |

### 12.5 `Missing script: "start"` al intentar levantar el server

| | |
|---|---|
| **Causa** | Ejecutaste `npm start` |
| **Solución** | El comando correcto es `npm run server` (dentro de `server/`) |

### 12.6 `Error: listen EADDRINUSE: address already in use :::4000`

| | |
|---|---|
| **Causa** | Otro proceso ya ocupa el puerto 4000 (probablemente otra instancia del server que olvidaste cerrar) |
| **Solución** | Linux/Mac/WSL: `lsof -ti :4000 \| xargs kill -9` · Windows (PowerShell): `Stop-Process -Id (Get-NetTCPConnection -LocalPort 4000).OwningProcess -Force` — o simplemente cambia `PORT` en `.env` (y recuerda actualizar `VITE_BACKEND_API`) |

### 12.7 `Bind for 0.0.0.0:27017 failed: port is already allocated`

| | |
|---|---|
| **Causa** | Ya existe OTRO contenedor (u otro Mongo instalado) usando el puerto 27017 |
| **Solución** | `docker ps` para ver quién lo usa. Si es un `mongo-local` viejo: `docker rm -f mongo-local` y repite §4.1 |

### 12.8 Perdí todos mis datos de prueba

| | |
|---|---|
| **Causa** | Ejecutaste `docker rm -f mongo-local` (eso borra contenedor Y datos) |
| **Solución** | Es el comportamiento esperado. Repite §4.1 y §7 para recrear tu cuenta. Para evitarlo, NO borres el contenedor entre sesiones: usa `docker stop mongo-local` / `docker start mongo-local` |

### 12.9 El frontend arranca en el puerto 5174 (o similar)

| | |
|---|---|
| **Causa** | El puerto 5173 estaba ocupado y Vite saltó al siguiente automáticamente |
| **Solución** | Libera el 5173 (mismo comando del punto 12.6, con `:5173`) o actualiza `CLIENT_URL` del server al puerto nuevo. Lo simple: siempre trabajar sobre `5173` |

### 12.10 Error al generar `firebase-messaging-sw.js` antes de arrancar el client

| | |
|---|---|
| **Causa** | Faltan las variables `VITE_FIREBASE_*` en `client/.env` (un script pre-arranque las necesita) |
| **Solución** | Completa las 4 variables Firebase + `VITE_FIREBASE_VAPID_KEY` en `client/.env` |

### 12.11 El signup dice error de envío de correo / los correos llegan a usuarios reales

| | |
|---|---|
| **Causa** | SendGrid sin credenciales válidas (no pasa nada: el código llega en la respuesta JSON, ver §7.3) — o credenciales REALES enviando correos de verdad |
| **Solución** | Para verificar tu cuenta usa el `verificationcode` de la respuesta del signup. Durante pruebas, usa SIEMPRE tu propio correo como destinatario; jamás dispares invitaciones/resets a correos de personas reales |

### 12.12 Las notificaciones push no se registran

| | |
|---|---|
| **Causa** | Estás accediendo por IP de red local (ej. `192.168.x.x`) en vez de localhost, o bloqueaste notificaciones en el navegador |
| **Solución** | Usa `http://localhost:5173` (único host sin HTTPS donde los Service Workers funcionan). Revisa DevTools → Application → Service Workers |

### 12.13 El cierre semanal automático de reportes no ocurre

| | |
|---|---|
| **Causa** | Ese cron lo dispara un servicio externo (cron-job.org), no tu máquina local |
| **Solución** | Es el comportamiento esperado en local. La lógica está cubierta por `cron.test.js`. Para probar el endpoint manualmente, pide al líder técnico la ruta y dispara la petición con curl |

---

## 13. Checklist final

Imprímelo o márcalo. **Completa los pasos en orden estricto:**

```text
PREPARACIÓN
[ ] node -v    → v20 o superior
[ ] docker ps  → daemon corriendo
[ ] npm install ejecutado en server/ SIN errores
[ ] npm install ejecutado en client/ SIN errores

BASE DE DATOS LOCAL
[ ] docker run -d --name mongo-local -p 27017:27017 mongo:7 → contenedor Up
[ ] server/.env creado con MONGODB_URI=mongodb://localhost:27017/condove_local
[ ] client/.env creado con TODAS las variables de la sección 5.2

ARRANQUE
[ ] Terminal 1: cd server && npm run server → "MongoDB connected..." + "Server running on http://localhost:4000"
[ ] Terminal 2: cd client && npm run dev    → "ready" en http://localhost:5173/
[ ] curl http://localhost:4000/api/health   → {"status":"ok"}

PRIMER USUARIO (una sola vez)
[ ] Signup vía UI (§7.1) o curl (§7.2)     → success: true + verificationcode
[ ] Email verificado con el código (§7.3)   → success: true
[ ] Empleados de prueba creados desde la app

VERIFICACIÓN FUNCIONAL
[ ] Login en http://localhost:5173 exitoso y persiste tras F5
[ ] DevTools: clave "HRtoken" visible en Local Storage
[ ] Dashboard carga sin errores en consola

CALIDAD
[ ] cd server && npm run test  → todas las suites PASS
[ ] cd client && npm run test  → todos los tests PASS
[ ] cd client && npm run build → 0 errores

LISTO ✅ — Entorno local completo y verificado.
```

---

## 📎 Apéndice rápido — Comandos de un vistazo

```bash
# ─── BASE DE DATOS LOCAL (Docker) ─────────────────
docker run -d --name mongo-local -p 27017:27017 mongo:7   # crear (1ª vez)
docker start mongo-local                                   # reusar tras reinicio
docker stop mongo-local                                    # pausar (conserva datos)
docker exec -it mongo-local mongosh condove_local          # consola de BD
docker rm -f mongo-local                                   # ⚠️ borra contenedor + datos

# ─── ARRANQUE DIARIO ──────────────────────────────
cd server && npm run server     # Terminal 1 → backend en :4000
cd client && npm run dev        # Terminal 2 → frontend en :5173

# ─── VERIFICACIÓN ─────────────────────────────────
curl http://localhost:4000/api/health

# ─── CALIDAD ──────────────────────────────────────
cd server && npm run test       # tests backend
cd client && npm run test       # tests frontend
cd client && npm run build      # build producción
cd client && npm run lint       # análisis estático
```

---

*Documento mantenido por el equipo técnico. Última actualización: 2026-08-24 · Fuente de verdad: el código de este repositorio.*
