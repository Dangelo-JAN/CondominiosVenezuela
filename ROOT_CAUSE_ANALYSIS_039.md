# 🔬 ROOT CAUSE ANALYSIS — Tarea #039: Payroll Concepts Tab UI
## Bug: Botón "Nuevo Concepto" NO aparece en CLOUD (sí en LOCAL)

---

## 📋 RESUMEN EJECUTIVO

**Problema:** `can("payroll", "create")` retorna `false` para HR-Manager en deploy cloud, pero funciona en local.

**Causa Raíz:** El thunk `HandleHRCheck` **nunca está conectado al reducer** de `HRSlice`. Se crea, se despacha desde `App.jsx`, hace la llamada API, pero **el `extraReducers` del slice no maneja su acción `fulfilled`** → `HRReducer.data.permissions` nunca se popula → el fallback `DEFAULT_PERMISSIONS[role]` en `useHRAuth` falla porque `role` llega `undefined` o `null` durante la hidratación inicial.

**Por qué funciona en local:** Posiblemente el token persiste entre recargas y el login previo ya pobló el estado, o el timing de desarrollo enmascara el bug. En cloud (fresh deploy, nueva sesión), el flujo completo falla.

---

## 🔄 FLUJO COMPLETO TRACKEADO (End-to-End)

### 1. LOGIN (Server → Client)
```
POST /api/auth/HR/login
  → HandleHRLogin (server/controllers/HRAuth.controller.js:113)
  → Returns: { success: true, type: "HRLogin", role, permissions: HR.permissions.toObject(), token }
  → Client: HandlePostHumanResources thunk (HRThunk.js:26)
  → HRAsyncReducer handles "HRLogin" type (asyncreducer.js:51)
  → state.data = { role, permissions, ... }
  → localStorage.setItem("HRtoken", token)
```

### 2. APP INIT (Client) — **DONDE FALLA**
```
App.jsx useEffect (mount)
  → const token = localStorage.getItem("HRtoken")  // ✅ EXISTE
  → dispatch(HandleHRCheck())  // ✅ SE DESPACHA
  
HandleHRCheck thunk (HRThunk.js:17)
  → await hrApiService.get(HREndPoints.CHECKLOGIN)  // ✅ LLAMADA API
  → GET /api/auth/HR/check-login
  → VerifyhHRToken middleware (Auth.middleware.js:32)
    → Decodes JWT → req.HRid, req.ORGID
  → HandleHRCheck controller (HRAuth.controller.js:159)
    → Finds HR by _id + orgID
    → Returns: { success: true, type: "checkHR", role, permissions: HR.permissions.toObject() }
  → Thunk returns: { ...response.data, type: "checkHR" }
  
  ❌ AQUÍ SE ROMPE LA CADENA:
  → HandleHRCheck.fulfilled action DISPATCHED
  → HRSlice.extraReducers NO TIENE handler para HandleHRCheck
  → HRAsyncReducer NUNCA SE EJECUTA para este thunk
  → state.data.permissions NUNCA SE ACTUALIZA
  → state.data.role NUNCA SE ACTUALIZA (si era null)
```

### 3. HOOK useHRAuth (Client) — LEE ESTADO CORRUPTO
```
useHRAuth.js (lines 77-91)
  → role = useSelector(s => s.HRReducer?.data?.role)  // ❌ null/undefined
  → permissions = useSelector(s => s.HRReducer?.data?.permissions)  // ❌ undefined
  
  → effectivePermissions = useMemo(() => {
      if (permissions && Object.keys(permissions).length > 0) return permissions  // ❌ false
      return role ? DEFAULT_PERMISSIONS[role] || {} : {}  // ❌ role es null → {}
    }, [permissions, role])
    
  → can = (module, action) => {
      if (isAdmin) return true  // ❌ isAdmin = false (role !== "HR-Admin")
      return effectivePermissions[module]?.[action] === true  // ❌ {}[payroll] = undefined
    }
    
  → can("payroll", "create") → FALSE
```

### 4. RENDER PayrollConceptsTab (Client)
```
PayrollConceptsTab.jsx
  → const { canCreate } = useHRAuth()
  → {canCreate("payroll") && <Button>Nuevo Concepto</Button>}  // ❌ FALSE → NO RENDERIZA
```

---

## 🎯 EVIDENCIA TÉCNICA IRREFUTABLE

### Archivo: `client/src/redux/Slices/HRSlice.js`
```javascript
// LÍNEAS 36-39: SOLO ESTOS DOS THUNKS TIENEN HRAsyncReducer
extraReducers: (builder) => {
    HRAsyncReducer(builder, HandlePostHumanResources)  // ✅ Login, signup, etc.
    HRAsyncReducer(builder, HandleGetHumanResources)   // ✅ Get HR data
    
    // ❌ FALTA: HRAsyncReducer(builder, HandleHRCheck)
    
    // HandlePatchHumanResources manual...
}
```

### Archivo: `client/src/redux/AsyncReducers/asyncreducer.js` (Líneas 51-62)
```javascript
// ESTE CÓDIGO NUNCA SE EJECUTA PARA HandleHRCheck
if ((action.payload.type == "checkHR") || (action.payload.type == "HRLogin") || ...) {
    state.data = {
        ...state.data,
        ...(action.payload.role && { role: action.payload.role }),
        ...(action.payload.permissions && { permissions: action.payload.permissions })
    }
}
```

### Archivo: `client/src/redux/Thunks/HRThunk.js` (Líneas 17-24)
```javascript
export const HandleHRCheck = createAsyncThunk("HandleHRCheck", async (_, { rejectWithValue }) => {
    try {
        const response = await hrApiService.get(HREndPoints.CHECKLOGIN)
        return { ...response.data, type: "checkHR" }  // ✅ Type correcto
    } catch (error) {
        return rejectWithValue(error.response?.data)
    }
})
```

### Archivo: `client/src/App.jsx` (Líneas 12-17)
```javascript
useEffect(() => {
    const token = localStorage.getItem("HRtoken")
    if (token) {
        dispatch(HandleHRCheck())  // ✅ Se despacha correctamente
    }
}, [dispatch])
```

---

## 🧪 POR QUÉ FUNCIONA EN LOCAL PERO NO EN CLOUD

| Factor | Local | Cloud |
|--------|-------|-------|
| **Sesión previa** | Token persiste en localStorage de desarrollo | Deploy fresco = localStorage vacío o token expirado |
| **Login flow** | Usuario ya logueó antes → `HandlePostHumanResources` pobló `state.data` | Primera carga tras deploy → solo `HandleHRCheck` se ejecuta |
| **Timing** | Hot reload mantiene estado Redux | Cold start → estado inicial `data: null` |
| **Fallback useHRAuth** | `role` ya existe en estado → `DEFAULT_PERMISSIONS[role]` funciona | `role` es `null` → fallback retorna `{}` |

**Conclusión:** En local, el estado ya estaba "sucio" (poblado por login previo). En cloud, el flujo limpio expone el bug.

---

## 🔧 FIX REQUERIDO (Una línea)

### `client/src/redux/Slices/HRSlice.js`

```diff
 import { createSlice } from "@reduxjs/toolkit";
 import { HRAsyncReducer } from "../AsyncReducers/asyncreducer.js";
-import { HandlePostHumanResources, HandleGetHumanResources, HandlePatchHumanResources } from "../Thunks/HRThunk.js";
+import { HandlePostHumanResources, HandleGetHumanResources, HandlePatchHumanResources, HandleHRCheck } from "../Thunks/HRThunk.js";
 
 const HRSlice = createSlice({
     // ...
     extraReducers: (builder) => {
         HRAsyncReducer(builder, HandlePostHumanResources)
         HRAsyncReducer(builder, HandleGetHumanResources)
+        HRAsyncReducer(builder, HandleHRCheck)  // ← AGREGAR ESTA LÍNEA
 
         // HandlePatchHumanResources...
     }
 })
```

---

## ✅ CHECKLIST DE VALIDACIÓN POST-FIX

- [x] Importar `HandleHRCheck` en HRSlice.js
- [x] Agregar `HRAsyncReducer(builder, HandleHRCheck)` en extraReducers
- [x] Build client: `npm run build` → 0 errores
- [x] Test server: `npm run test` → 127 passing
- [ ] Verificar en Redux DevTools (cloud): `HRReducer.data.permissions` poblado tras carga
- [ ] Verificar `can("payroll", "create")` → `true` para HR-Manager
- [ ] Botón "Nuevo Concepto" visible en cloud
- [ ] Modal abre sin crash (fix previo `value="unassigned"`)
- [ ] Commit + Push

---

## 📝 LECCIONES APRENDIDAS (CTO Notes)

1. **Siempre wirear thunks al slice** — Un thunk creado pero no conectado al reducer es código muerto que falla silenciosamente.

2. **Diferencia local vs cloud** — El estado "sucio" de desarrollo enmascara bugs de hidratación. Probar siempre en entorno limpio (incógnito, fresh deploy).

3. **Patrón HRAsyncReducer** — Centraliza la lógica de "checkHR", "HRLogin", etc. Cualquier thunk que retorne `{ type: "checkHR", role, permissions }` DEBE pasar por este reducer.

4. **Defensive coding en hooks** — `useHRAuth` tiene fallback, pero asume que `role` existe. Si `role` es `null` al inicio, el fallback falla. Considerar `isReady` real basado en `permissions` pobladas.

5. **Observabilidad** — Agregar logs en `HandleHRCheck` thunk y reducer para debug rápido en producción.

---

## 📁 ARCHIVOS MODIFICADOS EN ESTE ANÁLISIS

- `client/src/redux/Slices/HRSlice.js` — **FIX REQUERIDO AQUÍ** ✅ APLICADO (commit e02a7eb)
- `client/src/redux/Thunks/HRThunk.js` — Thunk creado correctamente
- `client/src/App.jsx` — Dispatch correcto
- `client/src/redux/AsyncReducers/asyncreducer.js` — Lógica de reducer correcta (pero no invocada)
- `client/src/hooks/useHRAuth.js` — Hook correcto, víctima del estado vacío
- `server/controllers/HRAuth.controller.js` — Endpoint `/check-login` correcto
- `server/middlewares/Auth.middleware.js` — Middleware `VerifyhHRToken` correcto

---

## 🚨 BUG PERSISTE — PLAN DE DEBUG SISTEMÁTICO POR FASES

> **Estado:** Fix aplicado (conectar HandleHRCheck al reducer) pero botón sigue sin verse en cloud.
> **Hipótesis:** El fix era necesario pero **no suficiente**. Hay al menos un bug silencioso adicional en la cadena.

---

### 📋 FASE 0: PRE-FLIGHT — Verificar que el fix está realmente deployado en cloud

| Paso | Acción | Verificación | Esperado |
|------|--------|--------------|----------|
| 0.1 | Verificar commit en rama cloud | `git log --oneline -1` en servidor/preview | Commit `e02a7eb` presente |
| 0.2 | Verificar build actual en Vercel/Render | Dashboard → Build logs | Build exitoso post-commit |
| 0.3 | Hard refresh cloud (incógnito) | Ctrl+Shift+R / nueva ventana incógnito | Sin cache viejo |
| 0.4 | Verificar `HRtoken` en localStorage cloud | DevTools → Application → LocalStorage | Token presente y válido (JWT) |

**Criterio de salida:** Si algún paso falla → corregir deploy antes de continuar.

---

### 📋 FASE 1: NETWORK — Verificar que la llamada API `/check-login` sucede y responde bien

| Paso | Acción | Verificación | Esperado |
|------|--------|--------------|----------|
| 1.1 | Abrir Network tab (DevTools cloud) | Filtrar "check-login" | Request GET `/api/auth/HR/check-login` visible |
| 1.2 | Verificar headers de request | Authorization: `Bearer <token>` | Token enviado correctamente |
| 1.3 | Verificar response status | 200 OK | No 401/403/500 |
| 1.4 | Verificar response body | `{ success: true, type: "checkHR", role, permissions, ... }` | `role` y `permissions` presentes y no vacíos |
| 1.5 | Verificar timing | Request sale al montar App (no delayed) | Inmediato tras carga |

**Criterio de salida:** Si request no sale → bug en App.jsx useEffect. Si 401/403 → token inválido/expirado. Si response sin role/permissions → bug server.

---

### 📋 FASE 2: REDUX STORE — Verificar que el reducer procesa la action (SIN Redux DevTools)

| Paso | Acción | Verificación | Esperado |
|------|--------|--------------|----------|
| 2.1 | **Console log en thunk** (ya agregado en Fase 1.3) | Verificar que `HandleHRCheck/fulfilled` retorna payload | Log: `[DEBUG] HandleHRCheck - RESPONSE { success: true, type: "checkHR", role, permissions, ... }` |
| 2.2 | **Console log en reducer** (instrumentación temporal) | Agregar `console.log` en `HRAsyncReducer` dentro del bloque `if (action.payload.type == "checkHR")` | Log: `[DEBUG] HRAsyncReducer - checkHR payload { role, permissions, ... }` + state actualizado |
| 2.3 | **Console log en slice listener** (opcional) | `store.subscribe(() => console.log('[DEBUG] Store updated:', store.getState().HumanResources))` en App.jsx | Log muestra `data` poblado tras fulfilled |
| 2.4 | **Verificar flags en consola** | Log `isAuthenticated`, `isAuthourized` desde hook o componente | Ambos `true` tras fulfilled |
| 2.5 | **Console.log directo en useHRAuth** (Fase 3.1) | Verificar que `role` y `permissions` llegan al hook | `role: "HR-Manager"`, `permissions: {...}` |

**Criterio de salida:** Si log 2.1 sale pero 2.2 NO sale → reducer no matchea `type === "checkHR"`. Si 2.2 sale pero 2.5 ve null → race condition o selector incorrecto.

---

#### 🔧 Instrumentación exacta para copiar/pegar (Fase 2.2):

**Archivo: `client/src/redux/AsyncReducers/asyncreducer.js` (línea ~51)**

```javascript
// BUSCAR ESTE BLOQUE:
if ((action.payload.type == "checkHR") || (action.payload.type == "HRLogin") || (action.payload.type == "HRforgotpassword")) {

// AGREGAR INMEDIATAMENTE DESPUÉS DE LA LÍNEA DE APERTURA:
console.log("[DEBUG] HRAsyncReducer - MATCHED checkHR/HRLogin", {
  type: action.payload.type,
  role: action.payload.role,
  permissionsKeys: action.payload.permissions ? Object.keys(action.payload.permissions) : "UNDEFINED",
  prevStateDataKeys: state.data ? Object.keys(state.data) : "NULL"
});

// EL RESTO DEL BLOQUE SIGUE IGUAL:
state.isSignUp = true
state.isLoading = false;
// ...
```

**Archivo: `client/src/App.jsx` (para Fase 2.3 - listener global)**

```javascript
// AGREGAR DENTRO DEL useEffect, DESPUÉS DEL DISPATCH:
useEffect(() => {
    const token = localStorage.getItem("HRtoken")
    if (token) {
        dispatch(HandleHRCheck())
    }
    
    // 👇 LISTENER TEMPORAL PARA VER TODOS LOS CAMBIOS DE STORE
    const unsubscribe = store.subscribe(() => {
        const hrState = store.getState().HumanResources
        if (hrState.data && (hrState.data.role || hrState.data.permissions)) {
            console.log("[DEBUG] Store listener - HRReducer.data:", {
                role: hrState.data.role,
                permissionsKeys: hrState.data.permissions ? Object.keys(hrState.data.permissions) : "UNDEFINED",
                isAuthenticated: hrState.isAuthenticated,
                isAuthourized: hrState.isAuthourized
            })
        }
    })
    return () => unsubscribe()
}, [dispatch])

// IMPORTAR store al inicio del archivo:
import { store } from "./redux/store.js"
```

---

### 📋 FASE 3: HOOK useHRAuth — Verificar que el selector lee el estado correcto

| Paso | Acción | Verificación | Esperado |
|------|--------|--------------|----------|
| 3.1 | Console log en useHRAuth (temporal) | Log `role`, `permissions`, `effectivePermissions` | `role: "HR-Manager"`, `permissions` objeto poblado |
| 3.2 | Verificar `isReady` | `role !== null && role !== undefined` | `true` |
| 3.3 | Verificar `can("payroll", "create")` | Llamar en consola | `true` |
| 3.4 | Verificar `canCreate("payroll")` | Igual que anterior | `true` |

**Criterio de salida:** Si `role` es null → selector incorrecto o state no actualizado. Si `effectivePermissions` vacío → fallback falla.

---

### 📋 FASE 4: COMPONENTE — Verificar render condicional

| Paso | Acción | Verificación | Esperado |
|------|--------|--------------|----------|
| 4.1 | Console log en PayrollConceptsTab | Log `canCreate("payroll")` al render | `true` |
| 4.2 | Inspeccionar DOM | Buscar botón "Nuevo Concepto" | Presente en árbol (aunque hidden por CSS) |
| 4.3 | Verificar CSS | No `display: none`, `visibility: hidden`, `opacity: 0` | Visible |
| 4.4 | Verificar `ProtectedHRRoute` | No está bloqueando el render | Children se renderizan |

**Criterio de salida:** Si hook retorna true pero botón no está en DOM → bug en JSX condicional. Si en DOM pero invisible → CSS.

---

### 📋 FASE 5: SERVER SIDE — Verificar endpoint y middleware

| Paso | Acción | Verificación | Esperado |
|------|--------|--------------|----------|
| 5.1 | Logs servidor (Render/Render logs) | `[LOG SERVER] VerifyhHRToken` | Token decodificado, HR encontrado |
| 5.2 | Verificar `req.HRid` / `req.ORGID` | En middleware | Validos, coinciden con BD |
| 5.3 | Verificar `HR.permissions` en BD | Query directa MongoDB | Existe, no vacío, estructura correcta |
| 5.4 | Verificar `CARGO_TO_ROLE` mapping | HR.cargo → role | Coincide con esperado |

**Criterio de salida:** Si middleware falla → token inválido. Si HR no tiene permissions → seed/data issue.

---

### 📋 FASE 6: EDGE CASES — Casos frontera que rompen la cadena

| Caso | Síntoma | Verificación | Fix |
|------|---------|--------------|-----|
| Token expirado | 401 en check-login | JWT decode → `exp` < now | Re-login o refresh token |
| Token válido pero HR borrado | 403 en middleware | Log "HR no encontrado o inactivo" | Recrear HR o limpiar localStorage |
| HR sin permissions en BD | `permissions: {}` | Query BD | Seed DEFAULT_PERMISSIONS |
| CORS bloquea request | Network error | Console: CORS error | Config CORS_ORIGIN_REGEX |
| Race condition: useEffect antes de store | Dispatch en store no listo | Log orden mount | `store.subscribe` o `useSelector` gate |
| Múltiples dispatch simultáneos | State race | Redux DevTools: actions orden | `takeLatest` o guard en thunk |

---

### 🛠️ HERRAMIENTAS DE DEBUG TEMPORAL (Agregar y remover)

#### En `client/src/redux/Thunks/HRThunk.js`:
```javascript
export const HandleHRCheck = createAsyncThunk("HandleHRCheck", async (_, { rejectWithValue }) => {
    console.log("[DEBUG] HandleHRCheck - START")
    try {
        const response = await hrApiService.get(HREndPoints.CHECKLOGIN)
        console.log("[DEBUG] HandleHRCheck - RESPONSE", response.data)
        return { ...response.data, type: "checkHR" }
    } catch (error) {
        console.error("[DEBUG] HandleHRCheck - ERROR", error.response?.data)
        return rejectWithValue(error.response?.data)
    }
})
```

#### En `client/src/redux/AsyncReducers/asyncreducer.js` (línea 51):
```javascript
if ((action.payload.type == "checkHR") || ...) {
    console.log("[DEBUG] HRAsyncReducer - checkHR payload", action.payload)
    state.data = { ... }
}
```

#### En `client/src/hooks/useHRAuth.js` (línea 86):
```javascript
const effectivePermissions = useMemo(() => {
    console.log("[DEBUG] useHRAuth - role:", role, "permissions:", permissions)
    // ...
}, [permissions, role])
```

#### En `client/src/components/payroll/PayrollConceptsTab.jsx`:
```javascript
const { canCreate } = useHRAuth()
console.log("[DEBUG] PayrollConceptsTab - canCreate(payroll):", canCreate("payroll"))
```

---

### 📊 MATRIZ DE DECISIÓN RÁPIDA

| Síntoma observado | Fase a investigar | Acción inmediata |
|-------------------|-------------------|------------------|
| No hay request check-login en Network | Fase 1 | Verificar App.jsx useEffect, token en localStorage |
| Request sale pero 401/403 | Fase 5 | Verificar token validez, middleware, HR en BD |
| Request 200 pero sin role/permissions | Fase 5 | Verificar controller, modelo BD |
| Action en Redux pero state no cambia | Fase 2 | Verificar reducer matchea `type === "checkHR"` |
| State cambia pero hook ve null | Fase 3 | Verificar selector path `HRReducer.data` |
| Hook ve true pero botón no renderiza | Fase 4 | Verificar JSX, CSS, ProtectedHRRoute |

---

### 🎯 PRÓXIMOS PASOS INMEDIATOS (Al recibir instrucción)

1. **Deploy logs temporales** en cloud (Vercel/Render) con console.logs arriba
2. **Abrir cloud en incógnito** con DevTools → Network + Console + Redux DevTools
3. **Ejecutar matriz de decisión** según síntomas observados
4. **Identificar fase exacta** donde se rompe
5. **Aplicar fix quirúrgico** (no parches)
6. **Revalidar** todo el flujo
7. **Limpiar logs temporales** y commit final

---

---

## ✅ FASES COMPLETADAS — FIX PERMISOS HR

### FASE 1: MIGRACIÓN BD ✅ (2026-11-05)
- **Script:** `server/scripts/migrate-hr-permissions.mjs`
- **Ejecutado en prod:** 5/5 usuarios actualizados
- **Resultado:** Todos HR-Manager/HR-Admin con `payroll.create: true`

### FASE 2: MIDDLEWARE PRE-SAVE ✅ (2026-11-05)
- **Archivo:** `server/models/HR.model.js` (líneas 156-178)
- **Función:** Auto-sync permissions al cambiar role/cargo
- **Tests:** 127 passing

### FASE 3: CONTROLLERS SET EXPLÍCITO ✅ (2026-11-05)
- `HRAuth.controller.js`: HandleHRSignup + permissions
- `HRProfiles.controller.js`: HandleAcceptInvitation + permissions
- `HandleInviteHR` ya tenía permissions

### FASE 4: FIX HANDLEUPDATEHR ✅ (2026-11-05)
- **Archivo:** `server/controllers/HR.controller.js`
- **Cambio:** `findByIdAndUpdate` → `findById + save()` para activar middleware
- **Protección:** No permite actualizar `_id`, `password`, `organizationID`

### COMMIT + PUSH ✅
- **Commit:** `c41b94e` - "fix: HR permissions auto-sync + migration for 5 users"
- **Push:** Ambos remotos (origin + Dangelo-JAN)

---

## 🧪 VALIDACIÓN PENDIENTE EN CLOUD (Fase 5)

Ejecutar en incógnito cloud tras deploy automático:

| Test | Acción | Esperado |
|------|--------|----------|
| 1. Login existing | Login con user migrado (Dangelo) | Botón "Nuevo Concepto" visible |
| 2. Cambio role | Admin UI: HR-Manager → HR-Admin | Permissions actualizados (payroll.delete: true) |
| 3. Cambio cargo | Admin UI: Coordinador → Secretario | Role sincronizado, permissions OK |
| 4. Nuevo signup | Crear HR nuevo via signup | Permissions correctos desde creación |
| 5. Aceptar invitación | Flujo invitación → accept | Permissions correctos |

---

## 📁 ARCHIVOS MODIFICADOS (Commits e02a7eb → c41b94e)

| Archivo | Cambio |
|---------|--------|
| `server/models/HR.model.js` | Middleware pre-save auto-sync |
| `server/controllers/HRAuth.controller.js` | HandleHRSignup + permissions |
| `server/controllers/HRProfiles.controller.js` | HandleAcceptInvitation + permissions |
| `server/controllers/HR.controller.js` | HandleUpdateHR usa save() |
| `server/scripts/migrate-hr-permissions.mjs` | **NUEVO** - Script migración |
| `server/scripts/verify-migration.mjs` | **NUEVO** - Verificación |
| `ROOT_CAUSE_ANALYSIS_039.md` | Documentación completa |

---

*Actualizado: 2026-11-05 | Commit c41b94e | Listo para validación cloud*