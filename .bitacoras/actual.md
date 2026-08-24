# 🛠️ TAREA ACTUAL
**ID:** N/A | **Estado:** ⏸ SIN TAREA ACTIVA | **Fecha:** 2026-08-24

---

## 🎯 OBJETIVO FINAL
> Sin tarea activa — esperando instrucciones del CTO.

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)
*Usa esto para "despertar" a la IA si el chat se cierra:*

- **Lo último que funcionó:** Tarea #037 COMPLETADA — MASTER-INIT.md §14 (reapertura diaria de servicios + protocolo no interactivo para agentes IA) ver [[037-master-init-reopen-section]]. Commit `b287874` en `feat/weekly-reports`.
- **Dónde se rompió/detuvo:** N/A.
- **Siguiente acción inmediata:** Esperar nueva instrucción del CTO. PR #50 (→ dev) abierto e incluye commits de #035, #036 y #037.

---

## 📝 CAMBIOS TÉCNICOS CLAVE
- [x] (Tarea anterior #037 archivada en `.bitacoras/037-master-init-reopen-section.md`)

---

## ⚠️ NOTAS DE MEMORIA
- *Regla:* Deploy local oficial documentado en `MASTER-INIT.md`. Para REABRIR servicios usar SIEMPRE §14: `docker start mongo-local` (NUNCA `docker run` de nuevo) + `npm run server` + `npm run dev`. Los agentes IA deben seguir el protocolo §14.3 (precheck → background → poll logs → smoke tests).
- *Regla:* Credenciales locales vigentes: `admin@test.local` / `Password123` (HR-Admin, Org Demo); empleados `Empleado123`. Dataset semilla persistente mientras NO se borre `mongo-local`.
- *Bug pendiente trackeable:* `nodemon` usado por script pero no declarado en `server/package.json` → hoy se cubre con instalación global + requisito documentado en §2.7. Candidato a tarea futura (opción B preferida por CTO: script con `node --watch index.js`).
- *Branch:* `feat/weekly-reports` (PR #50 → dev)
- *Commit:* `b287874`
