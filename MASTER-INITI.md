# 🚀 MASTER-INITI — Guía Maestra de Inicialización Local

> **Documento oficial para desarrolladores.** Objetivo: que cualquier persona del equipo —del junior más nuevo al senior más curtido— levante el proyecto completo en local **sin errores, al primer intento**, sin necesidad de preguntar a nadie.
>
> Si algún comando de esta guía falla o algo cambió respecto a lo documentado, repórtalo al líder técnico para actualizar este archivo.

---

## 📑 Índice

1. [¿Qué es este proyecto?](#1-qué-es-este-proyecto)
2. [Requisitos previos](#2-requisitos-previos)
3. [Instalación de dependencias](#3-instalación-de-dependencias)
4. [Configurar las variables de entorno (.env)](#4-configurar-las-variables-de-entorno-env)
5. [Levantar el backend (server)](#5-levantar-el-backend-server)
6. [Levantar el frontend (client)](#6-levantar-el-frontend-client)
7. [Verificar que todo funciona](#7-verificar-que-todo-funciona)
8. [Inspeccionar la base de datos](#8-inspeccionar-la-base-de-datos)
9. [Correr los tests automatizados](#9-correr-los-tests-automatizados)
10. [Errores comunes y soluciones](#10-errores-comunes-y-soluciones)
11. [Checklist final](#11-checklist-final)

---

## 1. ¿Qué es este proyecto?

**SGC — Sistema de Gestión de Condominios Venezuela** (`condo.ve`): plataforma para control de asistencia, nómina, reclutamiento y comunicación interna de equipos de trabajo.

| Pieza | Carpeta | Tecnología |
|---|---|---|
| Frontend | `client/` | React 18 + Vite + Tailwind CSS + Redux Toolkit |
| Backend | `server/` | Node.js + Express + Mongoose |
| Base de datos | ☁️ Remota | MongoDB Atlas (no instalas nada de BD en tu máquina) |

```
Navegador ──► client (Vite, puerto 5173) ──► server (Express, puerto 4000) ──► MongoDB Atlas (nube)
```

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

### 2.3 git

```bash
git --version
```

**Salida esperada:** `git version 2.x.x`.

### 2.4 curl (para verificaciones)

```bash
curl --version
```

**Salida esperada:** `curl 7.x.x` o superior. En Windows, úsalo desde WSL, Git Bash o PowerShell moderno.

### 2.5 Acceso a los servicios externos

El proyecto usa credenciales de servicios de pago/libres ya contratados por la empresa:

| Servicio | Uso | Quién te da acceso |
|---|---|---|
| MongoDB Atlas | Base de datos | Líder técnico (te agrega al cluster o te da URI de staging) |
| Cloudinary | Almacenamiento de fotos/videos | Líder técnico |
| SendGrid | Envío de correos | Líder técnico |
| Firebase | Notificaciones push | Líder técnico |

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

## 4. Configurar las variables de entorno (.env)

El proyecto necesita **DOS archivos `.env`**: uno para el backend y otro para el frontend. Sin ellos, nada arranca.

### 4.1 Backend — `server/.env`

Crea el archivo dentro de la carpeta `server/`:

```bash
# estando en server/
touch .env        # (Windows PowerShell: ni .env directamente)
```

Pide al líder técnico los valores reales (o configúralos con tus propias cuentas si tienes acceso). Estructura completa:

```env
MONGODB_URI=<connection string de MongoDB Atlas>
appName=SGC
PORT=4000
JWT_SECRET=<secreto para firmar tokens — pídelo al líder técnico>
CLIENT_URL=http://localhost:5173
EMAIL_USER=<correo remitente>
CLOUDINARY_CLOUD_NAME=<nombre del cloud>
CLOUDINARY_API_KEY=<api key>
CLOUDINARY_API_SECRET=<api secret>
SENDGRID_API_KEY=<api key de sendgrid>
SENDGRID_SENDER_EMAIL=<correo verificado en sendgrid>
FIREBASE_PROJECT_ID=<id del proyecto firebase>
FIREBASE_PRIVATE_KEY=<clave privada — respeta los \n>
FIREBASE_CLIENT_EMAIL=<service account email>
```

**Campos críticos explicados:**

| Variable | Qué hace | Valor para local |
|---|---|---|
| `PORT` | Puerto donde escucha el backend | `4000` |
| `CLIENT_URL` | Origen web permitido por CORS | `http://localhost:5173` — **EXACTO, sin `/` final** |
| `MONGODB_URI` | Conexión a la base de datos | La URI que te dé el líder técnico |

### 4.2 Frontend — `client/.env`

```env
VITE_BACKEND_API=http://localhost:4000
VITE_FIREBASE_API_KEY=<api key firebase web>
VITE_FIREBASE_PROJECT_ID=<id del proyecto firebase>
VITE_FIREBASE_APP_ID=<app id firebase>
VITE_FIREBASE_VAPID_KEY=<clave vapid para push>
```

**Campo crítico:** `VITE_BACKEND_API` debe apuntar al mismo puerto que pusiste en `PORT` del server. Con esta guía: `http://localhost:4000`.

### 4.3 ⚠️ Reglas de oro de los .env

1. **NUNCA hagas commit de un archivo `.env`.** Ya están excluidos por `.gitignore`; no los fuerces con `git add -f`.
2. Si cambias `PORT` del server (ej. `5000`), DEBES cambiar también `VITE_BACKEND_API` del cliente.
3. Si cambias el puerto del frontend (ej. Vite sube a `5174` porque la `5173` estaba ocupada), DEBES cambiar `CLIENT_URL` del server.

---

## 5. Levantar el backend (server)

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

---

## 6. Levantar el frontend (client)

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

> 🚨 **Usa EXACTAMENTE `http://localhost:5173`.** NO uses `http://127.0.0.1:5173`. Aunque parecen iguales, para el navegador son orígenes distintos y el login fallará silenciosamente (ver [Errores comunes §10.3](#103-el-login-no-mantiene-la-sesión--peticiones-fallan-con-cors)).

---

## 7. Verificar que todo funciona

Ejecuta estas verificaciones EN ORDEN. No continúes si alguna falla.

### 7.1 Health check del backend

En una tercera terminal (o postman):

```bash
curl http://localhost:4000/api/health
```

**Salida esperada:**

```json
{"status":"ok"}
```

### 7.2 Login real desde el navegador

1. Ve a `http://localhost:5173` e inicia sesión con tu usuario HR de prueba.
2. Recarga la página con **F5** → la sesión debe mantenerse.

### 7.3 Verificación técnica en DevTools (F12)

| Dónde mirar | Qué debes ver |
|---|---|
| **Console** | Sin errores rojos de CORS ni `ERR_CONNECTION_REFUSED` |
| **Application → Local Storage → localhost:5173** | Clave `HRtoken` con un JWT largo (eyJhbGci...) tras hacer login |
| **Network → cualquier petición `/api/v1/*` → Headers** | Header `Authorization: Bearer eyJ...` presente |

> ℹ️ Dato útil: la autenticación de este proyecto viaja por header `Authorization` con token guardado en localStorage — no depende de cookies. Si en DevTools ves el token pero las peticiones fallan, revisa la sección [10](#10-errores-comunes-y-soluciones).

### 7.4 Prueba funcional mínima

Navega al Dashboard y abre la lista de empleados. Si cargan datos → el circuito completo (frontend → backend → Atlas) está operativo.

---

## 8. Inspeccionar la base de datos

Aunque la BD vive en la nube (Atlas), puedes inspeccionarla desde tu máquina como si fuera local.

### 8.1 Opción A — mongosh (terminal)

Instálalo solo si no lo tienes ([guía oficial](https://www.mongodb.com/docs/mongodb-shell/install/)). Luego copia el valor de `MONGODB_URI` desde tu `server/.env` y conéctate:

```bash
mongosh "<pega-aquí-el-valor-de-MONGODB_URI>"
```

Comandos básicos dentro del shell:

```javascript
show dbs                          // listar bases de datos
use <nombre_db>                   // seleccionar la base del proyecto
show collections                  // ver colecciones (employees, hrs, leaves...)
db.employees.find().limit(5)      // leer 5 empleados
db.employees.countDocuments()     // contar registros
db.leaves.find({ status: "pending" })   // filtrar
db.reports.find().sort({ createdAt: -1 }).limit(3)   // últimos reportes
```

### 8.2 Opción B — MongoDB Compass (interfaz gráfica, recomendado)

Descarga [MongoDB Compass](https://www.mongodb.com/products/compass/compass), conéctalo con la misma URI de `MONGODB_URI` y explora colecciones/documentos con clicks. Ideal para verificar visualmente que tus pruebas escribieron datos.

### 8.3 Opción C — Sandbox local 100% seguro (recomendado para experimentar)

⚠️ **La URI que te dieron puede ser la base REAL.** Para probar libremente (crear/borrar/destruir datos) monta un Mongo efímero en tu máquina con Docker:

```bash
docker run -d --name mongo-local -p 27017:27017 mongo:7
```

Luego cambia temporalmente en `server/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/condove_test
```

Reinicia el server. Cuando termines tus pruebas:

```bash
docker rm -f mongo-local    # borra contenedor Y sus datos
```

Y restaura la URI original en `.env`.

> 🔒 **Regla de oro:** si no sabes si una URI es producción o staging, TRÁTALA COMO PRODUCCIÓN: solo lecturas.

---

## 9. Correr los tests automatizados

Los tests usan una base de datos **en memoria efímera** (`mongodb-memory-server`): NO tocan Atlas, puedes correrlos sin miedo y sin conexión a internet.

### 9.1 Tests del backend (Jest)

```bash
cd server
npm run test
```

**Salida esperada:** todas las suites en verde (`PASS`) y un resumen tipo `Tests: X passed, X total`.

Suites incluidas: `cron.test.js`, `leave.test.js`, `report.test.js`, `reportController.test.js` (carpeta `server/tests/`).

### 9.2 Tests del frontend (Vitest)

```bash
cd client
npm run test          # una sola pasada
npm run test:watch    # modo observación continua (opcional)
```

**Salida esperada:** `Test Files  X passed` / `Tests  X passed`.

### 9.3 Build de producción (verificación final)

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

## 10. Errores comunes y soluciones

### 10.1 `Error connecting to MongoDB: ...` y el server se cierra

| | |
|---|---|
| **Causa** | Tu IP no está autorizada en MongoDB Atlas |
| **Solución** | Pide al líder técnico que agregue tu IP en Atlas → *Network Access* → *Add IP Address*. Para desarrollo rápido se usa `0.0.0.0/0` (acepta cualquier IP — solo en entornos de prueba) |

### 10.2 En la consola del navegador: `No permitido por CORS (Regex Vercel)`

| | |
|---|---|
| **Causa** | El `CLIENT_URL` del server no coincide EXACTAMENTE con el origen de tu navegador |
| **Solución** | En `server/.env`: `CLIENT_URL=http://localhost:5173` (sin `/` final, sin espacios). Reinicia el server (Ctrl+C → `npm run server`) |

### 10.3 El login no mantiene la sesión / peticiones fallan con CORS (usando 127.0.0.1)

| | |
|---|---|
| **Causa** | Estás navegando en `http://127.0.0.1:5173` en vez de `http://localhost:5173` |
| **Solución** | Cambia la URL del navegador a `http://localhost:5173`. Son orígenes distintos para el navegador y solo uno está autorizado |

### 10.4 `Missing script: "start"` al intentar levantar el server

| | |
|---|---|
| **Causa** | Ejecutaste `npm start` |
| **Solución** | El comando correcto es `npm run server` (dentro de `server/`) |

### 10.5 `Error: listen EADDRINUSE: address already in use :::4000`

| | |
|---|---|
| **Causa** | Otro proceso ya ocupa el puerto 4000 (probablemente otra instancia del server que olvidaste cerrar) |
| **Solución** | Linux/Mac: `lsof -ti :4000 \| xargs kill -9` · Windows (PowerShell): `Stop-Process -Id (Get-NetTCPConnection -LocalPort 4000).OwningProcess -Force` — o simplemente cambia `PORT` en `.env` (y recuerda actualizar `VITE_BACKEND_API`) |

### 10.6 El frontend arranca en el puerto 5174 (o similar)

| | |
|---|---|
| **Causa** | El puerto 5173 estaba ocupado y Vite saltó al siguiente automáticamente |
| **Solución** | Libera el 5173 (mismo comando del punto anterior, con `:5173`) o actualiza `CLIENT_URL` del server al puerto nuevo. Lo simple: siempre trabajar sobre `5173` |

### 10.7 Error al generar `firebase-messaging-sw.js` antes de arrancar el client

| | |
|---|---|
| **Causa** | Faltan las variables `VITE_FIREBASE_*` en `client/.env` (un script pre-arranque las necesita) |
| **Solución** | Completa las 4 variables Firebase + `VITE_FIREBASE_VAPID_KEY` en `client/.env` |

### 10.8 Los correos de prueba llegan a usuarios reales

| | |
|---|---|
| **Causa** | ⚠️ SendGrid envía correos DE VERDAD con las credenciales configuradas |
| **Solución** | Durante pruebas locales, usa SIEMPRE tu propio correo como destinatario. No dispares flujos de invitación/reset contra correos de personas reales |

### 10.9 Las notificaciones push no se registran

| | |
|---|---|
| **Causa** | Estás accediendo por IP de red local (ej. `192.168.x.x`) en vez de localhost, o bloqueaste notificaciones en el navegador |
| **Solución** | Usa `http://localhost:5173` (único host sin HTTPS donde los Service Workers funcionan). Revisa DevTools → Application → Service Workers |

### 10.10 El cierre semanal automático de reportes no ocurre

| | |
|---|---|
| **Causa** | Ese cron lo dispara un servicio externo (cron-job.org), no tu máquina local |
| **Solución** | Es el comportamiento esperado en local. La lógica está cubierta por `cron.test.js`. Para probar el endpoint manualmente, pide al líder técnico la ruta y dispara la petición con curl |

---

## 11. Checklist final

Imprímelo o márcalo. **Completa los pasos en orden estricto:**

```text
PREPARACIÓN
[ ] node -v  → v20 o superior
[ ] npm install ejecutado en server/ SIN errores
[ ] npm install ejecutado en client/ SIN errores
[ ] server/.env creado con TODAS las variables de la sección 4.1
[ ] client/.env creado con TODAS las variables de la sección 4.2

ARRANQUE
[ ] Terminal 1: cd server && npm run server → "MongoDB connected..." + "Server running on http://localhost:4000"
[ ] Terminal 2: cd client && npm run dev    → "ready" en http://localhost:5173/
[ ] curl http://localhost:4000/api/health   → {"status":"ok"}

VERIFICACIÓN FUNCIONAL
[ ] Login en http://localhost:5173 exitoso y persiste tras F5
[ ] DevTools: clave "HRtoken" visible en Local Storage
[ ] Dashboard carga empleados sin errores en consola

CALIDAD
[ ] cd server && npm run test  → todas las suites PASS
[ ] cd client && npm run test  → todos los tests PASS
[ ] cd client && npm run build → 0 errores

LISTO ✅ — Entorno local completo y verificado.
```

---

## 📎 Apéndice rápida — Comandos de un vistazo

```bash
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

# ─── SANDBOX BD LOCAL (opcional) ──────────────────
docker run -d --name mongo-local -p 27017:27017 mongo:7
docker rm -f mongo-local
```

---

*Documento mantenido por el equipo técnico. Última actualización: 2026-08-24 · Fuente de verdad: el código de este repositorio.*
