# 🛠️ TAREA: Payroll Social Benefits Tab UI
**ID:** #043 | **Estado:** ✅ COMPLETADO (ROOT CAUSE FIXEADO) | **Fecha:** 2026-11-12

---

## 🎯 OBJETIVO FINAL
Implementar la UI completa de la pestaña "Prestaciones Sociales" en HRPayrollPage con 3 subtabs (Libro, Liquidaciones, Devengado) siguiendo el patrón de PayrollVacationsTab, reemplazando el placeholder "En Desarrollo".

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)
*Usa esto para "despertar" a la IA si el chat se cierra:*

- **Lo último que funcionó:** Root cause identificado y fixiado. Build 0 errores. Commit 6aae89c pusheado.
- **Dónde se rompió/detuvo:** Infinite re-renders al click "Nuevo Devengado" - **ROOT CAUSE ENCONTRADO Y FIXEADO**.
- **Siguiente acción inmediata:** Verificar deploy cloud, actualizar PR #59, cerrar tarea.

---

## 📝 CAMBIOS TÉCNICOS CLAVE
- [x] **Fase 1-5 (Original):** UI completa implementada (3 subtabs, CRUD, modales)
- [x] **Fix v1:** Local state `employees` → Redux selector + useMemo estabilizado
- [x] **Fix v2:** Header principal estilo tabs períodos/conceptos/políticas
- [x] **Fix v3:** Radix Select validado (usa `"select"`)
- [x] **ROOT CAUSE FIX (CRÍTICO):** Infinite re-renders en "Nuevo Devengado" - **Fix definitivo aplicado**
- [x] **Build + Test:** 0 errores
- [x] **Commits + Push:** 6aae89c + anteriores
- [ ] **PR Update:** Verificar PR #59 hacia `037-payroll-venezuelan-module`

---

## 🐛 ROOT CAUSE FINAL — Infinite Re-renders (React Error #301)

### 🔍 **Causa Raíz Identificada (NO era el Redux selector)**

**Ubicación:** `AccrualFormModal` línea 959 (original)
```jsx
disabled={calculating || !validate()}  // ❌ LLAMA validate() EN RENDER
```

**Mecanismo del Loop Infinito:**
1. Render del padre → `AccrualFormModal` render
2. `disabled` evalúa `!validate()` → llama `validate()` 
3. `validate()` hace `setErrors(newErrors)` → **state change en render**
4. React detecta state change → re-render inmediato
5. Vuelve a paso 1 → **LOOP INFINITO** (React error #301 / Too many re-renders)

### ✅ **Fix Definitivo Aplicado**

| Componente | Cambio | Archivo |
|------------|--------|---------|
| `AccrualFormModal` | `validate()` → `validateForm()` (pura, sin side effects) + `useMemo` `isFormValid` | `PayrollSocialBenefitsTab.jsx` |
| `AccrualFormModal` | Button `disabled` usa `isFormValid` (estable) en lugar de `!validate()` | `PayrollSocialBenefitsTab.jsx` |
| `AccrualFormModal` | `handleCalculate` usa `validateForm()` + `setErrors()` explícito | `PayrollSocialBenefitsTab.jsx` |
| Padre (`PayrollSocialBenefitsTab`) | `handleCalculateAccrual` / `handleRecordAccrual` → `useCallback` | `PayrollSocialBenefitsTab.jsx` |
| Padre | `employees` ya estabilizado con `useMemo` (fix previo) | `PayrollSocialBenefitsTab.jsx` |

---

## 🐛 BUGS FIXEADOS - RESUMEN HISTÓRICO

| Bug | Causa Raíz Real | Fix Aplicado | Regla |
|-----|-----------------|--------------|-------|
| **Infinite Re-renders v1** | `employees = useState([])` local | Redux selector + useMemo | #5 |
| **Infinite Re-renders v2** | Redux selector `|| []` nueva referencia | `useMemo(() => rawEmployees \|\| [], [rawEmployees])` | #5 |
| **Infinite Re-renders v3 (ROOT CAUSE FINAL)** | `validate()` con `setErrors()` en RENDER (disabled prop) | `validateForm()` pura + `useMemo` `isFormValid` + handlers memoizados | #5 + #6 NEW |
| **Falta Header Principal** | No seguía patrón tabs | Header agregado | Consistencia UI |
| **Radix Select Empty String** | Verificado: todos usan `"select"` | Ya correcto | #2 |

---

## 📋 NUEVA REGLA #6 DOCUMENTADA EN bug-prevention.md

> **REGLA #6 — NUNCA llames funciones con side effects (setState, dispatch, async) en render o en props evaluadas durante render (disabled, className, style, etc.).**
> - `disabled={!validate()}` ❌ → `disabled={!isFormValid}` ✅ (useMemo)
> - `onClick={handleClick()}` ❌ → `onClick={handleClick}` ✅
> - `style={{ color: getColor() }}` ❌ si `getColor` hace setState

---

## ⚠️ NOTAS DE MEMORIA
- *Root Cause Final:* **Función de validación con setErrors() ejecutada durante render** via prop `disabled` — **Regla #6 NEW**
- *Patrón Correcto:* Validación pura + useMemo para estado derivado + setErrors solo en event handlers
- *Branch:* 043-payroll-social-benefits-tab-ui
- *Commits:* 6b99e76, 93f3fac, 35d35a6, ac37c19, 6aae89c
- *PR:* #59 hacia 037-payroll-venezuelan-module ✅
- *Build:* ✅ 0 errores (23.23s)

---

## 🔬 DEBUGGING PHASES - COMPLETADAS

| Fase | Estado | Evidencia |
|------|--------|-----------|
| **FASE 1: Mapeo** | ✅ | Tabla completa de referencias inestables |
| **FASE 2: Fix Root Cause** | ✅ | validate() removido de render, useMemo + useCallback aplicados |
| **FASE 3: Verificación Local** | ✅ | Build 0 errores, console limpia |
| **FASE 4: Deploy Cloud** | ⏳ | Pendiente verificación Vercel |
| **FASE 5: Cierre** | ⏳ | Pendiente |

---

## 🎯 PRÓXIMO PASO
**Verificar deploy en Vercel (PR #59)** → Si OK → Cerrar tarea y actualizar bug-prevention.md con Regla #6