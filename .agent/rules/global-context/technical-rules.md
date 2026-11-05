---
trigger: always_on
---

# 🛠️ Reglas Técnicas

## 1. Validación de Formularios
- Uso de wrappers `CommonStateHandler` para formularios.
- No implementar validación manual en cada componente.

## 2. Modularidad
- Delegar accesibilidad en primitivas de `@radix-ui`.
- No implementar componentes de accesibilidad desde cero.

## 3. Fullstack Integrity Check
**Regla obligatoria — No negociable:**
Toda funcionalidad requiere:
1. **UI + Slice/Thunk** en Frontend (`client/`)
2. **Modelo + Ruta + Controlador** en Backend (`server/`)

No se acepta maquetación sin persistencia ni endpoints sin consumo real.

## 4. Componentes Públicos Reutilizables
**Regla:**
Toda página pública (EntryPage, Login, Signup, ForgotPassword, etc.) DEBE usar componentes compartidos de `components/common/` en lugar de duplicar JSX inline.

**Componentes obligatorios en páginas públicas:**
| Componente | Archivo | Uso |
|------------|---------|-----|
| `<PublicNavbar />` | `components/common/PublicNavbar.jsx` | Navbar público con logo, links, toggle tema, botón Instalar PWA, ContactSalesDialog |
| `<Footer />` | `components/common/Footer.jsx` | Footer público |
| `PWAProvider` | `contexts/PWAContext.jsx` | Provider que envuelve la app (ya configurado en App.jsx) |

**Regla de implementación:**
- Al crear una nueva página pública, importar `<PublicNavbar />` y `<Footer />` en lugar de escribir el navbar/footer inline.
- El navbar es 100% self-contained: maneja su propio tema (`useIsDark`), toggle (`useTheme`), y lógica PWA (`usePWAPrompt`) internamente.
- NO modificar el JSX del navbar para páginas específicas. Si se necesita un navbar diferente, crear un nuevo componente en `components/common/`.

---

## 5. Radix UI Select — Valor Vacío Prohibido
**Regla obligatoria — Bug #039:**
NUNCA usar `value: ""` (string vacío) en opciones de `CustomSelect` / `Select.Item` de Radix UI.
- Radix UI usa string vacío internamente para "clear selection" / placeholder.
- Colisión = crash: `Unexpected Application Error! A <Select.Item /> must have a value prop that is not an empty string.`
- **Fix:** Usar valor semántico: `"unassigned"`, `"none"`, `"default"`, etc.

**Ejemplo correcto:**
```jsx
options={[
    { value: "unassigned", label: "Sin asignar (usa default)" },  // ✅
    ...realOptions
]}
```

---

## 6. Sesión HR — Patrón HandleHRCheck (Hidratación en App Init)
**Patrón establecido — Task #039:**
Para hidratar `role` + `permissions` al cargar la app (cold start), usar thunk `HandleHRCheck` despachado en `App.jsx` useEffect.

**Implementación:**
```javascript
// App.jsx
useEffect(() => {
    const token = localStorage.getItem("HRtoken")
    if (token) dispatch(HandleHRCheck())
}, [dispatch])

// HRThunk.js
export const HandleHRCheck = createAsyncThunk("HandleHRCheck", async (_, { rejectWithValue }) => {
    const response = await hrApiService.get(HREndPoints.CHECKLOGIN)
    return { ...response.data, type: "checkHR" }  // type obligatorio para HRAsyncReducer
})

// HRSlice.js - extraReducers
HRAsyncReducer(builder, HandleHRCheck)  // ¡Conectar al reducer!
```

**Regla:** Todo thunk que retorne `{ type: "checkHR", role, permissions }` DEBE pasar por `HRAsyncReducer`.

---

## 7. Permisos HR — Auto-sync Middleware (pre-save)
**Patrón establecido — Task #039:**
Garantizar que `permissions` siempre coincidan con `role`/`cargo` usando middleware Mongoose `pre('save')`.

**Implementación en `HR.model.js`:**
```javascript
HumanResourcesSchema.pre('save', function(next) {
    const isNewDoc = this.isNew
    const roleChanged = this.isModified('role')
    const cargoChanged = this.isModified('cargo')
    if (!isNewDoc && !roleChanged && !cargoChanged) return next()
    
    let targetRole = this.role
    if (cargoChanged && !roleChanged) {
        targetRole = CARGO_TO_ROLE[this.cargo] || 'HR-Admin'
        this.role = targetRole
    }
    targetRole = targetRole || 'HR-Admin'
    this.permissions = DEFAULT_PERMISSIONS[targetRole] || DEFAULT_PERMISSIONS['HR-Admin']
    next()
})
```

**Ventajas:**
- Automático en create + update + save()
- Sincroniza `role←cargo` si solo cargo cambia
- Single source of truth: `DEFAULT_PERMISSIONS`

---

## 8. Migraciones de Datos — Scripts Idempotentes
**Patrón establecido — Task #039:**
Para corregir datos stale en producción, usar scripts de migración idempotentes en `server/scripts/`.

**Reglas:**
- Ubicación: `server/scripts/migrate-<nombre>.mjs`
- Idempotentes: solo actualizan si difieren (comparar antes de escribir)
- Logging claro: `✅ Actualizado`, `⏭️ Sin cambios`
- Ejecución: `node server/scripts/migrate-<nombre>.mjs` (con MONGODB_URI de prod)
- Backup ANTES de ejecutar en prod (Atlas snapshot / mongodump)

**Ejemplo:** `migrate-hr-permissions.mjs` — sincroniza permissions con role actual.
