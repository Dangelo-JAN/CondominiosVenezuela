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