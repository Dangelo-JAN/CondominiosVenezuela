---
trigger: always_on
---

# 🛡️ Bug Prevention Guide — Redux State Key Mismatch

## 🚨 Error Típico
```
TypeError: can't access property "socialBenefitsLedger", _.Payroll is undefined
```

## 🔍 Causa Raíz
**Inconsistencia entre el nombre del slice (Redux Toolkit) y la clave en el store root reducer.**

| Archivo | Configuración | Valor |
|---------|---------------|-------|
| `PayrollSlice.js` | `createSlice({ name: "Payroll", ... })` | `"Payroll"` |
| `store.js` | `reducer: { payrollReducer: PayrollReducer }` | `"payrollReducer"` |
| Componente | `useSelector(state => state.Payroll...)` | ❌ Busca `state.Payroll` |
| Realidad | Estado real | ✅ Existe `state.payrollReducer` |

**Resultado:** `state.Payroll` es `undefined` → crash al acceder a cualquier propiedad.

---

## ✅ Solución Correcta

### Opción A: Cambiar la clave en store.js (Recomendada — consistente con slice name)
```javascript
// client/src/redux/app/store.js
reducer: {
    // ...otros reducers
    Payroll: PayrollReducer,  // ← Usar el nombre del slice (capitalizado)
}
```

### Opción B: Cambiar todos los selectores a la clave del store
```javascript
// En componentes
useSelector(state => state.payrollReducer.socialBenefitsLedger)  // ← Coincide con store key
```

> **Regla del proyecto:** Los tabs de nómina existentes usan `state.payrollReducer` (Opción B). Mantener consistencia.

---

## 🔧 Checklist Pre-Commit (Obligatorio)

Antes de commitear cualquier componente que use Redux:

- [ ] Verificar `createSlice({ name: "X" })` en el slice
- [ ] Verificar clave en `store.js` reducer object
- [ ] Verificar que `useSelector(state => state.ClaveCorrecta...)` coincida **exactamente** con la clave del store
- [ ] Ejecutar `npm run build` — 0 errores

---

## 📋 Patrones del Proyecto (Referencia Rápida)

| Slice | Slice Name | Store Key | Selector Correcto |
|-------|------------|-----------|-------------------|
| Payroll | `"Payroll"` | `payrollReducer` | `state.payrollReducer.xxx` |
| HR | `"HumanResources"` | `HRReducer` | `state.HRReducer.xxx` |
| Employee | `"employees"` | `employeereducer` | `state.employeereducer.xxx` |
| Dashboard | `"HRDashboard"` | `dashboardreducer` | `state.dashboardreducer.xxx` |
| Leaves | `"HRLeaves"` | `HRLeavesReducer` | `state.HRLeavesReducer.xxx` |

> **Nota:** Las claves del store son **inconsistentes** (algunas camelCase, otras PascalCase, otras lowercase). **Siempre verificar en `store.js` antes de escribir selectores.**

---

## 🛑 Prevención Futura

1. **Al crear nuevo slice:** Usar nombre consistente y registrar en store con la **misma clave** que el `name` del slice
2. **Al crear nuevo componente:** Copiar patrón de selector de componente existente del mismo dominio
3. **Code Review:** Verificar `useSelector` vs `store.js` keys en cada PR
4. **Documentar:** Si se cambia convención, actualizar esta tabla

---

## 📝 Historial de Ocurrencias

| Fecha | Tarea | Archivo Afectado | Fix Aplicado |
|-------|-------|------------------|--------------|
| 2026-11-12 | #043 Payroll Social Benefits | `PayrollSocialBenefitsTab.jsx` | Cambio `state.Payroll` → `state.payrollReducer` (6 selectores) |

---

## 🎯 Regla de Oro (Redux)

> **NUNCA asumas que el slice name = store key. SIEMPRE verifica `store.js` antes de escribir `useSelector`.**

El estado de Redux es **exactamente** lo que define el objeto `reducer` en `configureStore()`. El `name` del slice solo sirve para action types (`Payroll/SETTLEMENTS_CREATE`), no para la clave del estado.

---

## 🚨 Error Típico #2 — Radix Select Empty String Value
```
Error: A <Select.Item /> must have a value prop that is not an empty string.
```

## 🔍 Causa Raíz #2
**Inconsistencia entre el valor inicial del estado (`""`) y los valores de las opciones del Select (`"select"`).**

Radix UI Select valida que todos los `Select.Item` tengan un `value` no vacío. Cuando el estado inicial es `""` (empty string) pero las opciones usan `"select"` como valor para "Todos", Radix intenta renderizar un item con valor vacío y falla.

| Componente | Estado Inicial | Opciones Disponibles | Problema |
|------------|----------------|---------------------|----------|
| Filtro empleado | `employee: ""` | `{ value: "select", ... }` | ❌ Mismatch |
| Filtro tipo | `entry_type: ""` | `{ value: "select", ... }` | ❌ Mismatch |

## ✅ Solución Correcta

### Opción A: Usar `"select"` como valor inicial (consistente con opciones)
```javascript
// Estado inicial
const [filters, setFilters] = useState({ employee: "select", entry_type: "select" })

// Opciones
const options = [
    { value: "select", label: "Todos los empleados" },
    // ...otras opciones
]
```

### Opción B: Usar `"all"` como en VacationsTab (recomendado para filtros)
```javascript
const [filters, setFilters] = useState({ employee: "all", status: "all" })
const options = [
    { value: "all", label: "Todos los empleados" },
    // ...
]
```

> **Regla del proyecto:** Usar `"select"` para formularios (placeholder), `"all"` para filtros (consistente con VacationsTab).

---

## 🔧 Checklist Pre-Commit (Obligatorio) — Actualizado

Antes de commitear cualquier componente que use **Redux** o **CustomSelect/Radix Select**:

- [ ] Verificar `createSlice({ name: "X" })` en el slice
- [ ] Verificar clave en `store.js` reducer object
- [ ] Verificar que `useSelector(state => state.ClaveCorrecta...)` coincida **exactamente** con la clave del store
- [ ] **Verificar que valores iniciales de Select coincidan con `value` de las opciones** (no empty string `""`)
- [ ] **Verificar que opciones de filtro usen `"select"` o `"all"`, no `""`**
- [ ] Ejecutar `npm run build` — 0 errores

---

## 📋 Patrones del Proyecto (Referencia Rápida) — Actualizado

| Slice | Slice Name | Store Key | Selector Correcto |
|-------|------------|-----------|-------------------|
| Payroll | `"Payroll"` | `payrollReducer` | `state.payrollReducer.xxx` |
| HR | `"HumanResources"` | `HRReducer` | `state.HRReducer.xxx` |
| Employee | `"employees"` | `employeereducer` | `state.employeereducer.xxx` |
| Dashboard | `"HRDashboard"` | `dashboardreducer` | `state.dashboardreducer.xxx` |
| Leaves | `"HRLeaves"` | `HRLeavesReducer` | `state.HRLeavesReducer.xxx` |

> **Nota:** Las claves del store son **inconsistentes** (algunas camelCase, otras PascalCase, otras lowercase). **Siempre verificar en `store.js` antes de escribir selectores.**

---

## 🛑 Prevención Futura — Actualizada

1. **Al crear nuevo slice:** Usar nombre consistente y registrar en store con la **misma clave** que el `name` del slice
2. **Al crear nuevo componente:** Copiar patrón de selector de componente existente del mismo dominio
3. **Al usar CustomSelect:** Inicializar estado con `"select"` (formularios) o `"all"` (filtros), **nunca `""`**
4. **Code Review:** Verificar `useSelector` vs `store.js` keys Y `useState` inicial vs opciones de Select en cada PR
5. **Documentar:** Si se cambia convención, actualizar esta tabla

---

## 📝 Historial de Ocurrencias — Actualizado

| Fecha | Tarea | Archivo Afectado | Fix Aplicado |
|-------|-------|------------------|--------------|
| 2026-11-12 | #043 Payroll Social Benefits | `PayrollSocialBenefitsTab.jsx` | Cambio `state.Payroll` → `state.payrollReducer` (6 selectores) |
| 2026-11-12 | #043 Payroll Social Benefits | `PayrollSocialBenefitsTab.jsx` | Filtros: `""` → `"select"` + params builders para excluir "select" de API |

---

## 🎯 Regla de Oro (Combinada)

> **NUNCA asumas que:**
> - slice name = store key → **Verifica `store.js`**
> - estado inicial `""` funciona en Select → **Usa `"select"` o `"all"`**
> **SIEMPRE verifica antes de escribir código.**

---

## 🚨 Error Típico #3 — Temporal Dead Zone (TDZ) / Lexical Declaration
```
ReferenceError: can't access lexical declaration 'F' before initialization
```

## 🔍 Causa Raíz #3
**Una variable `const`/`let` (o `useCallback`/`useMemo`) es referenciada en un `useEffect` dependency array ANTES de ser declarada.**

En JavaScript, las declaraciones `const`/`let` están en la **Temporal Dead Zone (TDZ)** desde el inicio del scope hasta su declaración. Acceder a ellas antes lanza `ReferenceError`.

| Orden en Componente | Problema |
|---------------------|----------|
| 1. `useEffect(() => { ... }, [buildParams])` | ❌ `buildParams` referenciado |
| 2. `const buildParams = useCallback(...)` | ❌ Declaración posterior (TDZ) |

React registra el `useEffect` durante el render (evalúa el dependency array), pero `buildParams` aún no existe.

## ✅ Solución Correcta

### Declarar hooks `useCallback`/`useMemo` ANTES de los `useEffect` que dependen de ellos
```javascript
// ✅ CORRECTO - callbacks primero
const buildLedgerParams = useCallback(() => { ... }, [deps])
const buildSettlementsParams = useCallback(() => { ... }, [deps])

useEffect(() => {
    dispatch(action({ ...buildLedgerParams() }))
}, [dispatch, buildLedgerParams, buildSettlementsParams])

// ❌ INCORRECTO - useEffect antes de callbacks
useEffect(() => {
    dispatch(action({ ...buildLedgerParams() }))  // TDZ!
}, [dispatch, buildLedgerParams])

const buildLedgerParams = useCallback(...)  // Declarado después
```

## 🔧 Checklist Pre-Commit (Obligatorio) — Actualizado Final

Antes de commitear cualquier componente con **hooks**:

- [ ] Verificar `createSlice({ name: "X" })` en el slice
- [ ] Verificar clave en `store.js` reducer object
- [ ] Verificar que `useSelector(state => state.ClaveCorrecta...)` coincida **exactamente** con la clave del store
- [ ] **Verificar que valores iniciales de Select coincidan con `value` de las opciones** (no empty string `""`)
- [ ] **Verificar que opciones de filtro usen `"select"` o `"all"`, no `""`**
- [ ] **Verificar que `useCallback`/`useMemo` estén declarados ANTES de `useEffect` que los referencian en dependency array**
- [ ] Ejecutar `npm run build` — 0 errores

---

## 📝 Historial de Ocurrencias — Actualizado Final

| Fecha | Tarea | Archivo Afectado | Fix Aplicado |
|-------|-------|------------------|--------------|
| 2026-11-12 | #043 Payroll Social Benefits | `PayrollSocialBenefitsTab.jsx` | Cambio `state.Payroll` → `state.payrollReducer` (6 selectores) |
| 2026-11-12 | #043 Payroll Social Benefits | `PayrollSocialBenefitsTab.jsx` | Filtros: `""` → `"select"` + params builders para excluir "select" de API |
| 2026-11-12 | #043 Payroll Social Benefits | `PayrollSocialBenefitsTab.jsx` | TDZ: `useCallback` movidos antes de `useEffect` dependency |

---

## 🎯 Regla de Oro (Final - 3 Pilares)

> **NUNCA asumas que:**
> 1. slice name = store key → **Verifica `store.js`**
> 2. estado inicial `""` funciona en Select → **Usa `"select"` o `"all"`**
> 3. orden de hooks no importa → **Callbacks ANTES de Effects que dependen de ellos**
> **SIEMPRE verifica antes de escribir código.**

---

## 🚨 Error Típico #4 — Variable Not Defined in Render Function Scope
```
ReferenceError: employeeOptions is not defined
    at renderLedgerTab (PayrollSocialBenefitsTab.jsx:1173:34)
```

## 🔍 Causa Raíz #4
**Una variable definida dentro de un sub-componente (modal) se intenta usar en una función de render del componente principal.**

En `PayrollSocialBenefitsTab`, las funciones `renderLedgerTab`, `renderSettlementsTab`, `renderAccrualTab` se definen en el scope del componente principal, pero `employeeOptions` solo se definía dentro de los modales (`SettlementFormModal`, `AccrualFormModal`).

| Scope | Variable | Disponible en |
|-------|----------|---------------|
| Componente Principal | `renderLedgerTab` | ❌ No ve variables de modales |
| SettlementFormModal | `employeeOptions` | ✅ Solo dentro del modal |
| AccrualFormModal | `employeeOptions` | ✅ Solo dentro del modal |

## ✅ Solución Correcta

### Definir variables compartidas en el scope del componente principal (antes de las funciones de render)
```javascript
// ✅ CORRECTO - En scope principal, ANTES de renderLedgerTab
const employeeOptions = useMemo(() => {
    const seen = new Set()
    const opts = [{ value: "select", label: "Todos los empleados" }]
    socialBenefitsLedger.data?.forEach(entry => {
        if (entry.employee?._id && !seen.has(entry.employee._id)) {
            seen.add(entry.employee._id)
            opts.push({ value: entry.employee._id, label: `${entry.employee.firstname} ${entry.employee.lastname}` })
        }
    })
    return opts
}, [socialBenefitsLedger.data])

// ─── Render Subtab Content ───
const renderLedgerTab = () => (
    <CustomSelect options={employeeOptions} ... />
)
```

## 🔧 Checklist Pre-Commit (Obligatorio) — Actualizado Final v2

Antes de commitear cualquier componente con **funciones de render internas**:

- [ ] Verificar `createSlice({ name: "X" })` en el slice
- [ ] Verificar clave en `store.js` reducer object
- [ ] Verificar que `useSelector(state => state.ClaveCorrecta...)` coincida **exactamente** con la clave del store
- [ ] **Verificar que valores iniciales de Select coincidan con `value` de las opciones** (no empty string `""`)
- [ ] **Verificar que opciones de filtro usen `"select"` o `"all"`, no `""`**
- [ ] **Verificar que `useCallback`/`useMemo` estén declarados ANTES de `useEffect` que los referencian en dependency array**
- [ ] **Verificar que variables usadas en funciones de render (`renderXxx`) estén definidas en el scope del componente principal (ANTES de dichas funciones)**
- [ ] Ejecutar `npm run build` — 0 errores

---

## 📝 Historial de Ocurrencias — Actualizado Final v2

| Fecha | Tarea | Archivo Afectado | Fix Aplicado |
|-------|-------|------------------|--------------|
| 2026-11-12 | #043 Payroll Social Benefits | `PayrollSocialBenefitsTab.jsx` | Cambio `state.Payroll` → `state.payrollReducer` (6 selectores) |
| 2026-11-12 | #043 Payroll Social Benefits | `PayrollSocialBenefitsTab.jsx` | Filtros: `""` → `"select"` + params builders para excluir "select" de API |
| 2026-11-12 | #043 Payroll Social Benefits | `PayrollSocialBenefitsTab.jsx` | TDZ: `useCallback` movidos antes de `useEffect` dependency |
| 2026-11-12 | #043 Payroll Social Benefits | `PayrollSocialBenefitsTab.jsx` | `employeeOptions` movido a scope principal antes de `renderLedgerTab` |

---

## 🎯 Regla de Oro (Final - 4 Pilares)

> **NUNCA asumas que:**
> 1. slice name = store key → **Verifica `store.js`**
> 2. estado inicial `""` funciona en Select → **Usa `"select"` o `"all"`**
> 3. orden de hooks no importa → **Callbacks ANTES de Effects que dependen de ellos**
> 4. variables de sub-componentes son accesibles en render functions → **Define en scope principal ANTES de render functions**
> **SIEMPRE verifica antes de escribir código.**

---

## 🚨 Error Típico #5 — Infinite Re-renders (Too Many Re-renders)
```
Error: Too many re-renders. React limits the number of renders to prevent an infinite loop.
```

## 🔍 Causa Raíz #5
**Un `useEffect` en un componente hijo (modal) tiene en su dependency array una prop que es un nuevo objeto/array en cada render del padre.**

En `SocialBenefitsTab`, el estado `employees` es `useState([])` (local, no Redux). Cada render del padre crea una nueva referencia `[]`. Al pasarse como prop al modal `AccrualFormModal`, el `useEffect` con `[open, employees]` se ejecuta en cada render del padre, llamando a `setState` interno → re-render del modal → re-render del padre → loop infinito.

| Patrón Problemático | Patrón Correcto (VacationsTab) |
|---------------------|--------------------------------|
| `employees` = `useState([])` local | `employees` = `useSelector(...)` desde Redux |
| `useEffect(() => { setFormData(...) }, [open, employees])` | `useEffect(() => { setFormData(...) }, [open, editingRequest])` |
| Nueva referencia `[]` cada render | Referencia estable desde Redux store |

## ✅ Solución Correcta

### Opción A: Eliminar prop inestable del dependency array (si solo se usa para reset inicial)
```javascript
// ❌ PROBLEMÁTICO
useEffect(() => {
    if (open) { setFormData(...) }
}, [open, employees])  // employees = nueva [] cada render

// ✅ CORRECTO - Solo depender de lo que realmente cambia
useEffect(() => {
    if (open) { setFormData(...) }
}, [open])  // Solo open importa para reset
```

### Opción B: Usar Redux selector para datos estables (patrón VacationsTab)
```javascript
// En componente padre
const { data: employees } = useSelector(state => state.employeeReducer.employees)
// Referencia estable mientras no cambie el store
```

### Opción C: Memoizar con useMemo si debe ser local
```javascript
const employees = useMemo(() => fetchEmployees(), [])
// Referencia estable entre renders
```

## 🔧 Checklist Pre-Commit (Obligatorio) — Actualizado Final v3

Antes de commitear cualquier componente con **modales/hijos que reciben props**:

- [ ] Verificar `createSlice({ name: "X" })` en el slice
- [ ] Verificar clave en `store.js` reducer object
- [ ] Verificar que `useSelector(state => state.ClaveCorrecta...)` coincida **exactamente** con la clave del store
- [ ] **Verificar que valores iniciales de Select coincidan con `value` de las opciones** (no empty string `""`)
- [ ] **Verificar que opciones de filtro usen `"select"` o `"all"`, no `""`**
- [ ] **Verificar que `useCallback`/`useMemo` estén declarados ANTES de `useEffect` que los referencian en dependency array**
- [ ] **Verificar que variables usadas en funciones de render (`renderXxx`) estén definidas en el scope del componente principal (ANTES de dichas funciones)**
- [ ] **Verificar que `useEffect` en modales NO tengan en deps props que sean nuevos objetos/arrays cada render del padre (usar Redux selectors o quitar de deps)**
- [ ] Ejecutar `npm run build` — 0 errores

---

## 📝 Historial de Ocurrencias — Actualizado Final v3

| Fecha | Tarea | Archivo Afectado | Fix Aplicado |
|-------|-------|------------------|--------------|
| 2026-11-12 | #043 Payroll Social Benefits | `PayrollSocialBenefitsTab.jsx` | Cambio `state.Payroll` → `state.payrollReducer` (6 selectores) |
| 2026-11-12 | #043 Payroll Social Benefits | `PayrollSocialBenefitsTab.jsx` | Filtros: `""` → `"select"` + params builders para excluir "select" de API |
| 2026-11-12 | #043 Payroll Social Benefits | `PayrollSocialBenefitsTab.jsx` | TDZ: `useCallback` movidos antes de `useEffect` dependency |
| 2026-11-12 | #043 Payroll Social Benefits | `PayrollSocialBenefitsTab.jsx` | `employeeOptions` movido a scope principal antes de `renderLedgerTab` |
| 2026-11-12 | #043 Payroll Social Benefits | `PayrollSocialBenefitsTab.jsx` | Infinite re-renders v1: `employees` removido de useEffect deps en AccrualFormModal y SettlementFormModal |
| 2026-11-12 | #043 Payroll Social Benefits | `PayrollSocialBenefitsTab.jsx` | Infinite re-renders v2 (ROOT CAUSE): `validate()` con `setErrors()` en render via `disabled` prop → fix: `validateForm()` pura + `useMemo` `isFormValid` + handlers `useCallback` |

---

## 🚨 Error Típico #6 — Side Effects in Render (setState in Render Props)
```
Error: Too many re-renders. React limits the number of renders to prevent an infinite loop.
```
(Minified: React Error #301)

## 🔍 Causa Raíz #6
**Una función con side effects (`setState`, `dispatch`, `async`) es llamada DURANTE el render**, típicamente a través de props evaluadas en render como `disabled`, `className`, `style`, `onClick` (con paréntesis), etc.

| Patrón Problemático | Por Qué Falla | Patrón Correcto |
|---------------------|---------------|-----------------|
| `disabled={!validate()}` donde `validate()` hace `setErrors()` | `validate()` se ejecuta en cada render → `setErrors` → re-render → loop | `disabled={!isFormValid}` donde `isFormValid = useMemo(() => validateForm(), [deps])` |
| `onClick={handleClick()}` (con paréntesis) | Ejecuta función en render | `onClick={handleClick}` (sin paréntesis) |
| `style={{ color: getColor() }}` si `getColor` hace `setState` | Side effect en render | `const color = useMemo(() => getColor(), [deps])` |

## ✅ Solución Correcta

### Separar validación pura de side effects:
```javascript
// ❌ PROBLEMÁTICO - side effect en render
const validate = () => {
    const errors = computeErrors()
    setErrors(errors)  // Side effect!
    return Object.keys(errors).length === 0
}
<button disabled={!validate()} />

// ✅ CORRECTO - validación pura + memo + side effect solo en handler
const validateForm = () => computeErrors()  // Pura, sin setErrors

const isFormValid = useMemo(() => Object.keys(validateForm()).length === 0, [formData])

const handleSubmit = (e) => {
    e.preventDefault()
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
        setErrors(errors)  // Side effect SOLO en handler
        return
    }
    // ... submit
}
<button disabled={!isFormValid} onClick={handleSubmit} />
```

## 🔧 Checklist Pre-Commit — Actualizado Final v4

Antes de commitear cualquier componente con **validaciones/props en render**:

- [ ] Verificar `createSlice({ name: "X" })` en el slice
- [ ] Verificar clave en `store.js` reducer object
- [ ] Verificar que `useSelector(state => state.ClaveCorrecta...)` coincida **exactamente** con la clave del store
- [ ] **Verificar que valores iniciales de Select coincidan con `value` de las opciones** (no empty string `""`)
- [ ] **Verificar que opciones de filtro usen `"select"` o `"all"`, no `""`**
- [ ] **Verificar que `useCallback`/`useMemo` estén declarados ANTES de `useEffect` que los referencian en dependency array**
- [ ] **Verificar que variables usadas en funciones de render (`renderXxx`) estén definidas en el scope del componente principal (ANTES de dichas funciones)**
- [ ] **Verificar que `useEffect` en modales NO tengan en deps props que sean nuevos objetos/arrays cada render del padre (usar Redux selectors o quitar de deps)**
- [ ] **Verificar que NO hay llamadas a funciones con side effects (`setState`, `dispatch`, `async`) en render o props evaluadas en render (`disabled`, `className`, `style`, `onClick={fn()}`)**
- [ ] Ejecutar `npm run build` — 0 errores

---

## 🎯 Regla de Oro (Final - 6 Pilares)

> **NUNCA asumas que:**
> 1. slice name = store key → **Verifica `store.js`**
> 2. estado inicial `""` funciona en Select → **Usa `"select"` o `"all"`**
> 3. orden de hooks no importa → **Callbacks ANTES de Effects que dependen de ellos**
> 4. variables de sub-componentes son accesibles en render functions → **Define en scope principal ANTES de render functions**
> 5. props en useEffect deps son estables → **Verifica que no sean nuevos objetos/arrays cada render (usa Redux selectors o quita de deps)**
> 6. **funciones en render son puras** → **NUNCA llames funciones con side effects (`setState`, `dispatch`, `async`) en render o props evaluadas en render (`disabled`, `className`, `style`, `onClick={fn()}`)**
> **SIEMPRE verifica antes de escribir código.**