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

## 🎯 Regla de Oro

> **NUNCA asumas que el slice name = store key. SIEMPRE verifica `store.js` antes de escribir `useSelector`.**

El estado de Redux es **exactamente** lo que define el objeto `reducer` en `configureStore()`. El `name` del slice solo sirve para action types (`Payroll/SETTLEMENTS_CREATE`), no para la clave del estado.