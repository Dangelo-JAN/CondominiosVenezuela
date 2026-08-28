# 🛠️ TAREA: Reportes HR/Empleados — Interactividad, filtros URL-driven y modales (R1/R2/R3)
**ID:** #035 (reapertura) | **Estado:** ✅ COMPLETADO | **Fecha:** 2026-08-28

---

## 🎯 OBJETIVO FINAL
> Que los reportes diarios y semanales (HR y Empleados) sean interactivos: el diario muestra SOLO lo realizado (R1), el semanal muestra TODO incluido lo pendiente (R2), y el usuario puede navegar desde los totales hacia páginas filtradas por fecha y abrir modales de detalle al hacer clic en actividades (R3).

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)
- **Estado:** ✅ TAREA COMPLETADA el 2026-08-28 (aprobación explícita del CTO).
- **Resumen final:** R1 y R2 ya funcionaban server-side; la reapertura añadió R3 completo (interactividad). Todos los cambios en `feat/weekly-reports` (PR #50 → dev). Verificación E2E en vivo exitosa; servicios apagados y Mongo detenido (`docker stop`, datos intactos).
- **Próxima acción (futura):** Esperar merge del PR #50 hacia `dev`. Cuando el CTO lo indique, ejecutar auto-mantenimiento + secuencia de cierre formal (deploy a `main` si aplica).

---

## 📝 CAMBIOS TÉCNICOS CLAVE (resumen de cierre)
- [x] **R1** — Reporte diario muestra SOLO realizado (verificado en vivo: solo `task_completed`, 0 pendientes).
- [x] **R2** — Reporte semanal muestra TODO (verificado en vivo: `task_pending:59` + completadas + bitácoras + fotos).
- [x] **R3** — Interactividad completa:
  - Fase 1: backend tareas pendientes en semanal (`7179b8d`).
  - Subtarea #038: `seed-reports.mjs` (5 snapshots W30-W34) idempotente (`f9a088d`+`a998836`).
  - Fase 2: filtros server-side date (`9881243`).
  - Fase 3: modales reutilizables `ReportActivityModals.jsx` + refactor 4 páginas (`3571af8`,`3667a1d`,`cf97cc6`).
  - Fase 4: componentes interactivos `ReportComponents.jsx` (`054f231`).
  - Fase 5: integración `HRReportPage.jsx` — chips URL-driven + modales (`9897df3`).
  - Fase 6: filtros URL-driven en 4 páginas destino + thunks con params + contrato `startDate`/`endDate` (`e475a2c`).
  - Fases 7-8: interactividad lado empleado (`EmployeeHomePage`, `EmployeeReportsPage`) (`2d361a0`).
- [x] Builds finales: server `61/61 PASS` · client `0 errores`.
- [x] Validación E2E en vivo documentada en este cierre.

---

## ⚠️ NOTAS DE MEMORIA
- *Regla:* Deploy local oficial -> `MASTER-INIT.md` §14. Reabrir = `docker start mongo-local` + `npm run server` + `npm run dev` (NUNCA `docker run` de nuevo; NUNCA `docker rm` = destruye datos).
- *Regla:* Para reabrir, verificar SIEMPRE datos de la DB (§2.4) antes de decidir entre seed o reapertura.
- *Regla:* Credenciales locales: HR `admin@test.local`/`Password123`; empleados `{nombre}.{apellido}{N}@test.local`/`Empleado123`.
- *Hallazgo:* Los emails de empleados del seed llevan acentos literales (`maría.pérez0@test.local`) — el login funciona con el acento (copiar-pegar); la DB no normaliza. No existe empleado sin acentos con actividad en la semana actual.
- *Branch:* `feat/weekly-reports` (PR #50 → dev)
- *Commits de cierre:* `7179b8d` a `bc0246d`
