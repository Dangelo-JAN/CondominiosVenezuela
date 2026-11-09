# 🛠️ TAREA: RIF en Organization + PayrollCompany en Signup HR
**ID:** #041 | **Estado:** 🟡 EN CURSO | **Fecha:** 2026-11-06

---

## 🎯 OBJETIVO FINAL
> Integrar RIF en Organization como fuente de verdad, crear PayrollCompany válida durante HR Signup (transacción atómica), eliminar lazy-creation defectuosa en controller, y preparar arquitectura escalable para multi-perfil (HR, Administradora, Empleado).

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)
*Usa esto para "despertar" a la IA si el chat se cierra:*

- **Lo último que funcionó:** FASE 1 COMPLETADA - Organization model con RIF, migración ejecutada, índice sparse único creado, Org Demo actualizada con RIF J314188305. Builds server/client ✅ Tests 127 passing.
- **Dónde se rompió/detuvo:** FASE 1 completada, listo para FASE 2.
- **Siguiente acción inmediata:** Iniciar FASE 2 - HR Signup crea PayrollCompany válida atómicamente.

---

## 📝 CAMBIOS TÉCNICOS CLAVE
- [x] Crear bitácora #041
- [x] FASE 1: Organization model con RIF + sanitizeRif + índice sparse único
- [x] FASE 1: Migración ejecutada - Org Demo (6a8e058bd61ead5a01f57de6) actualizada con rif: "J314188305"
- [x] FASE 1: Índice sparse único verificado en MongoDB
- [ ] FASE 2: HR Signup → Transacción atómica Organization + PayrollCompany
- [ ] FASE 3: Controller getCompanyConfig - eliminar lazy creation, retornar 404
- [ ] FASE 4: UI PayrollPolicyTab - manejar 404 COMPANY_NOT_CONFIGURED
- [ ] Build client: 0 errores | Build server: tests passing
- [ ] Commit + PR hacia `037-payroll-venezuelan-module` (PR #56 ya existe)

---

## ✅ FASE 1 COMPLETADA - Organization Model + RIF Migration (STOP ✅)
- [x] F1-01: Agregar campo `rif` a `Organization.model.js` (String, alphanumeric, unique, sparse, trim, uppercase, setter sanitizeRif)
- [x] F1-02: Crear script de migración `migrate-organization-rif.mjs` para organización existente
- [x] F1-03: Normalizador RIF `sanitizeRif(input)` → solo `[A-Z0-9]`, uppercase (exportado desde model)
- [x] F1-04: Índice único parcial (sparse) en `rif` para permitir orgs sin RIF (platform admin)
- [x] Migración ejecutada: Org Demo (6a8e058bd61ead5a01f57de6) actualizada con `rif: "J314188305"`
- [x] Índice sparse único verificado en MongoDB
- **Gate Fase 1:** ✅ Server tests 127 passing, Client build 0 errores
- **STOP 1:** Builds verificados, aprobado para continuar

---

## 🟡 FASE 2 - HR Signup → Crea PayrollCompany Válida (EN CURSO)
- [ ] F2-01: Extender `HRSignupController` para aceptar `organizationRif` en request
- [ ] F2-02: Validación: `organizationRif` required, formato alphanumeric
- [ ] F2-03: Transacción atómica: Organization → PayrollCompany (MongoDB session)
- [ ] F2-04: PayrollCompany creada con: `rif=org.rif`, `email=org.email`, `name=org.name`, defaults nómina
- [ ] F2-05: Rollback automático si falla PayrollCompany (no queda org huérfana)
- [ ] F2-06: Verificar duplicado: si `PayrollCompany.exists({ organizationID })` → error "Ya configurada"
- **STOP 2:** Builds verificados, signup probado end-to-end

---

## ⬜ FASE 3 - Controller - Eliminar Lazy Creation Defectuosa (PENDIENTE)
- [ ] F3-01: `getCompanyConfig`: Eliminar `.create()` con datos vacíos
- [ ] F3-02: Retornar 404 con código `COMPANY_NOT_CONFIGURED` si no existe
- [ ] F3-03: `updateCompanyConfig`: Mantener upsert (para setup posterior)
- [ ] F3-04: Documentar respuesta esperada en OpenAPI/comments
- **STOP 3:** Builds verificados, 404 probado

---

## ⬜ FASE 4 - UI - Manejo Elegante de Company No Configurada (PENDIENTE)
- [ ] F4-01: `PayrollPolicyTab`: Detectar error `COMPANY_NOT_CONFIGURED` / 404
- [ ] F4-02: Mostrar estado "Configuración pendiente" con CTA "Configurar Empresa"
- [ ] F4-03: CTA navega a página de setup con datos pre-llenados
- [ ] F4-04: Mantener funcionalidad completa si company existe
- **STOP 4:** Builds verificados, flujo UI probado

---

## ⚠️ NOTAS DE MEMORIA
- *Regla:* RIF en BD = Solo `[A-Z0-9]` (ej: `J314188305`) - NUNCA guiones, espacios, puntos
- *Regla:* Transacción atómica Org + PayrollCompany o rollback total
- *Regla:* Controller NUNCA crea datos inválidos - 404 explícito
- *Regla:* Signup valida RIF - Requerido para HR/Administradora
- *Regla:* Org existing migration - Org Demo actualizada con `J314188305`
- *Branch:* 040-payroll-policy-tab-ui (trabajo en rama actual)
- *PR:* #56 hacia 037-payroll-venezuelan-module (ya creado)
- *Modelo:* PayrollCompany 1:1 Organization (no User) - multi-HR comparten misma company
- *Escalabilidad:* Organization.parentOrganizationID + organizationType para Administradora v2
- *Referencia:* USER_CASES_V2.md para arquitectura completa multi-perfil