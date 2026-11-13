# 🛠️ TAREA: Payroll Social Benefits Tab UI
**ID:** #043 | **Estado:** 🟡 EN CURSO (DEBUGGING INFINITE RE-RENDERS) | **Fecha:** 2026-11-12

---

## 🎯 OBJETIVO FINAL
Implementar la UI completa de la pestaña "Prestaciones Sociales" en HRPayrollPage con 3 subtabs (Libro, Liquidaciones, Devengado) siguiendo el patrón de PayrollVacationsTab, reemplazando el placeholder "En Desarrollo".

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)
*Usa esto para "despertar" a la IA si el chat se cierra:*

- **Lo último que funcionó:** Build 0 errores. Fix `useMemo` aplicado para estabilizar `employees`. Pero **el error persiste en deploy** (React error #301 / Too many re-renders).
- **Dónde se rompió/detuvo:** Error "Minified React error #301" en cloud deploy + "Too many re-renders" en local. El fix del Redux selector no fue suficiente.
- **Siguiente acción inmediata:** **FASE 1 DEBUG** - Identificar TODAS las referencias inestables que se pasan a modales.

---

## 📝 CAMBIOS TÉCNICOS CLAVE
- [x] **Fase 1-5 (Original):** UI completa implementada
- [x] **Fix v1:** Local state → Redux selector
- [x] **Fix v2:** Header principal + useMemo para employees
- [ ] **DEBUG FASE 1:** Mapear cadena completa de referencias inestables
- [ ] **DEBUG FASE 2:** Aislar y fixear cada referencia inestable
- [ ] **DEBUG FASE 3:** Verificar en local + build
- [ ] **DEBUG FASE 4:** Deploy y verificación cloud
- [ ] **PR Update:** Actualizar PR #59

---

## 🐛 BUG ACTUAL: Infinite Re-renders (React Error #301)

### Síntomas
- **Cloud (Vercel):** `Minified React error #301` - stack trace apunta a `vendor-react-DNXgf9I9.js`
- **Local (Vite):** `Too many re-renders. React limits the number of renders to prevent an infinite loop`
- **Trigger:** Click en botón **"Nuevo Devengado"** (abre `AccrualFormModal`)

### Análisis Preliminar (Causa Raíz NO resuelta)
El fix `useMemo` para `employees` era necesario pero **insuficiente**. Hay otras referencias inestables que se pasan a los modales:

| Referencia | Ubicación | Problema Potencial |
|------------|-----------|-------------------|
| `contracts={[]}` | Línea 1710: `<SettlementFormModal contracts={[]} />` | **Nuevo array `[]` cada render** |
| `calculating` | Líneas 1712, 1722 | State local, pero si cambia dispara re-render |
| `recording` | Línea 1723 | State local |
| `employeeOptions` en modales | `useMemo([employees])` | Si `employees` cambia referencia, recalcula |
| `contractOptions` en modales | `useMemo([employees, formData.employee])` | Depende de `employees` |

---

## 🔬 PLAN DE DEBUGGING — FASES CON STOPS OBLIGATORIOS

> **REGLA:** Cada fase DEBE terminar con STOP → mostrar evidencia → esperar aprobación explícita antes de continuar.

---

### **FASE 1: MAPEO DE CADENA COMPLETA DE REFERENCIAS INESTABLES**
**Objetivo:** Identificar TODAS las props que pasan del padre a modales y que pueden crear nuevas referencias cada render.

**Acciones:**
1. ✅ Leer componente completo `PayrollSocialBenefitsTab.jsx`
2. ✅ Listar TODAS las props que se pasan a `<SettlementFormModal>` y `<AccrualFormModal>`
3. ✅ Para cada prop: determinar si es **estable** (misma referencia entre renders) o **inestable** (nueva referencia)
4. ✅ Identificar `useEffect` en modales que tengan esas props en dependency array
5. ✅ Documentar hallazgos en tabla

**Entregable:** Tabla completa de props inestables + `useEffect` afectados

**STOP 1:** Mostrar tabla → Esperar aprobación para FASE 2

---

### **FASE 2: FIX DE REFERENCIAS INESTABLES IDENTIFICADAS**
**Objetivo:** Eliminar TODAS las referencias inestables de props hacia modales.

**Acciones por cada prop inestable:**
- **`contracts={[]}`** → Cambiar a `useMemo(() => [], [])` o eliminar si no se usa
- **`calculating` / `recording`** → Si no son necesarios en modal, quitar; si son necesarios, estabilizar con `useCallback` o mover lógica
- **`employeeOptions` / `contractOptions` en modales** → Verificar que `employees` sea verdaderamente estable (ya con `useMemo`)
- **Props functions** (`onSubmit`, `onCalculate`, etc.) → Envolver en `useCallback` con deps correctas

**Entregable:** Código con todas las referencias estabilizadas

**STOP 2:** Mostrar diff de cambios → Build local → Esperar aprobación para FASE 3

---

### **FASE 3: VERIFICACIÓN LOCAL EXHAUSTIVA**
**Objetivo:** Confirmar que NO hay infinite re-renders en entorno local.

**Acciones:**
1. `npm run build` → 0 errores
2. `npm run dev` → Probar click "Nuevo Devengado", "Nueva Liquidación"
3. Verificar consola: NO errores, NO warnings de re-renders
4. Probar flujo completo: abrir modal → cerrar → volver a abrir (múltiples veces)
5. Probar cambio de sub-tabs (Libro → Liquidaciones → Devengado → Libro)

**Evidencia Requerida:**
- ✅ Build success
- ✅ Console limpia (sin warnings React)
- ✅ Múltiples aperturas/cierres de modales sin error

**STOP 3:** Confirmar verificación local completa → Esperar aprobación para FASE 4

---

### **FASE 4: DEPLOY Y VERIFICACIÓN CLOUD**
**Objetivo:** Confirmar fix en Vercel (donde ocurre error #301 minificado).

**Acciones:**
1. Push a rama → Vercel Preview deploy automático
2. Acceder a Preview URL
3. Navegar a HR → Nómina → Prestaciones Sociales
4. Click "Nuevo Devengado" → Verificar NO error #301
5. Click "Nueva Liquidación" → Verificar
6. Test completo de todos los sub-tabs y modales

**Evidencia Requerida:**
- ✅ Deploy success
- ✅ Sin error #301 en consola browser
- ✅ Funcionalidad completa operativa

**STOP 4:** Confirmar deploy funcional → Proceder a cierre de tarea

---

### **FASE 5: CIERRE Y DOCUMENTACIÓN**
**Objetivo:** Actualizar bitácoras, bug-prevention.md, cerrar tarea.

**Acciones:**
1. Actualizar `.bitacoras/043-payroll-social-benefits-tab-ui.md` con root cause final y fix definitivo
2. Actualizar `.agent/rules/global-context/bug-prevention.md` si hay nuevo patrón
3. Commit final + push
4. Limpiar `actual.md`
5. Marcar tarea COMPLETADA

---

## 📋 CHECKLIST PRE-DEBUG (Verificación Rápida)

Antes de iniciar FASE 1, confirmar:

- [ ] `employees` estabilizado con `useMemo` (línea 1075) ✅
- [ ] `employeeOptions` en padre usa `employees` estable (línea 1168) ✅
- [ ] `contracts={[]}` en SettlementFormModal (línea 1710) ❌ **INESTABLE**
- [ ] `calculating`, `recording` pasados a ambos modales ⚠️ **REVISAR**
- [ ] `onSubmit`, `onCalculate`, `onRecord` envueltos en `useCallback` ⚠️ **REVISAR**
- [ ] `useEffect` en modales con deps correctas ⚠️ **REVISAR**

---

## ⚠️ NOTAS DE MEMORIA ACTUALIZADAS
- *Root Cause Hipótesis:* **Múltiples props inestables** (`contracts={[]}`, functions sin `useCallback`, states locales) pasadas a modales → `useEffect` en modales se disparan en loop
- *Patrón Correcto (VacationsTab):* Solo pasa `employees` (Redux selector estable) + `periods` (Redux selector estable) + handlers con `useCallback`
- *Regla #5 bug-prevention.md:* "Verificar que `useEffect` en modales NO tengan en deps props que sean nuevos objetos/arrays cada render del padre"
- *Error #301:* Minified React error para "Too many re-renders" - necesita dev environment no minificado para debug completo
- *Branch:* 043-payroll-social-benefits-tab-ui
- *PR:* #59 hacia 037-payroll-venezuelan-module