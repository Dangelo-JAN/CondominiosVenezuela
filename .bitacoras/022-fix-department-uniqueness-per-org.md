# 🛠️ TAREA: Fix unicidad de departamentos por condominio
**ID:** #022 | **Estado:** ✅ COMPLETADO | **Fecha:** 2026-06-07

---

## 🎯 OBJETIVO FINAL
> Que cada condominio pueda crear departamentos con el mismo nombre que otro condominio sin colisiones, respetando el aislamiento multi-tenant.

---

## 🚦 PUNTO DE CONTROL

- **Lo último que funcionó:** La rama `fix/department-uniqueness-per-org` fue creada desde `dev`.
- **Dónde se rompió/detuvo:** N/A — implementación en curso.
- **Siguiente acción inmediata:** Corregir validación de unicidad en `Department.controller.js` y agregar compound index en `Department.model.js`.

---

## 📝 CAMBIOS TÉCNICOS CLAVE

- [x] Análisis completo y diagnóstico (CTO review)
- [x] Fix en `Department.controller.js`: scoping `findOne` por `organizationID` (línea 12)
- [x] Fix en `Department.model.js`: agregar compound index `{ name: 1, organizationID: 1 }` (línea 37-38)
- [x] Commit y push

---

## ⚠️ NOTAS DE MEMORIA

- *Regla:* La unicidad de departamentos debe ser POR condominio, no global.
- *Regla:* El `organizationID` se inyecta en `req.ORGID` por el middleware `VerifyhHRToken`.
- *Branch:* `fix/department-uniqueness-per-org`
