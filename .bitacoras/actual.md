# 🛠️ TAREA ACTUAL

**ID:** #040 | **Estado:** 🟡 EN CURSO | **Fecha:** 2026-11-06

---

## 🎯 OBJETIVO FINAL
> Resolver React Error #300 en producción Vercel al navegar a pestaña Políticas de Nómina, y completar implementación UI PayrollPolicyTab.

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)
*Usa esto para "despertar" a la IA si el chat se cierra:*

- **Lo último que funcionó:** Builds locales OK, tests 127 passing. Error #300 persiste en Vercel producción al navegar a /payroll/policy.
- **Dónde se rompió/detuvo:** Error #300 "Element type is invalid" en Vercel al navegar a pestaña Políticas. Stack trace apunta a chunk payroll-tabs-*.
- **Siguiente acción inmediata:** Iniciar FASE D1 - Análisis stack trace Error #300.

---

## 📝 PLAN DE DEBUG - FASE D (React Error #300)

### FASE D1: Análisis Stack Trace y Aislamiento (STOP 1)
- [ ] D1.1: Obtener stack trace completo en Vercel (Source Maps habilitados)
- [ ] D1.2: Identificar componente exacto que lanza Error #300 (payroll-tabs-* chunk)
- [ ] D1.3: Verificar imports en PayrollPolicyTab.jsx (StyledSelect, normalizeValue, etc.)
- [ ] D1.4: Revisar HRPayrollPage.jsx - lazy loading de PayrollPolicyTab
- [ ] D1.5: Revisar PayrollTabsContainer.jsx - renderTabContent
- **STOP 1:** Commit con hallazgos + push. Esperar aprobación.

### FASE D2: Reproducción Local y Source Map Analysis (STOP 2)
- [ ] D2.1: Habilitar Source Maps en build de Vercel (vercel.json)
- [ ] D2.2: Build local con `npm run build` y analizar chunk `payroll-tabs-*`
- [ ] D2.3: Buscar componente que retorna tipo inválido en `payroll-tabs-*.js`
- [ ] D2.4: Test manual navegando a `/payroll/policy` en local
- [ ] D2.5: Verificar que `StyledSelect` no pasa props undefined a `<select>`
- **STOP 2:** Commit con fix candidato + push. Esperar aprobación.

### FASE D3: Fix y Validación en Producción (STOP 3)
- [ ] D3.1: Aplicar fix identificado (ej: StyledSelect props, lazy loading, etc.)
- [ ] D3.2: Build + deploy a Vercel preview
- [ ] D3.2: Test navegación a `/payroll/policy` en preview
- [ ] D3.4: Verificar navegación entre tabs (periods → policy → concepts → policy)
- **STOP 3:** Commit con fix validado + push. Esperar aprobación.

### FASE D4: Validación Final y Cierre (STOP 4)
- [ ] D4.1: Deploy a producción Vercel
- [ ] D4.2: Test completo flujo: login → nómina → pestaña políticas → navegar tabs
- [ ] D4.3: Verificar ausencia Error #300 en consola
- [ ] D4.4: Actualizar bitácora con resolución final
- [ ] D4.5: PR listo para merge a `037-payroll-venezuelan-module`
- **STOP 4:** Confirmación usuario "TAREA COMPLETADA".

---

## ⚠️ NOTAS DE MEMORIA
- *Regla:* **SOLO** usar `PayrollConceptsTab.jsx` como patrón UI
- *Regla:* Acento **blue** (#003DA5) para Nómina
- *Regla:* Fix aplicado: native select styled (Radix Select v2 incompatible SSR condicional)
- *Regla:* RIF en BD = Solo `[A-Z0-9]` (ej: `J314188305`) - NUNCA guiones
- *Regla:* Transacción atómica Org + PayrollCompany o rollback total
- *Regla:* Controller NUNCA crea datos inválidos - 404 explícito
- *Regla:* Signup valida RIF - Requerido para HR/Administradora
- *Regla:* Org producción `6a0cac2d63fe9b9c98e59a54` → `J314188305` EN ATLAS
- *Branch:* 040-payroll-policy-tab-ui (trabajo en rama actual)
- *PR:* #56 hacia 037-payroll-venezuelan-module (ya creado)
- *Error actual:* React Error #300 en Vercel al navegar a pestaña Políticas