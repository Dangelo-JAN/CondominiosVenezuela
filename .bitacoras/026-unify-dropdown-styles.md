# 🛠️ TAREA: Unificar estilos de dropdowns con CustomSelect
**ID:** #026 | **Estado:** 🟡 EN CURSO | **Fecha:** 2026-06-16

---

## 🎯 OBJETIVO FINAL
> Reemplazar todos los dropdowns nativos `<select>` en 5 páginas con el componente `CustomSelect` (Radix UI), usando el estilo del dropdown "Tipo de Ausencia" como referencia, con acentos por página (amarillo/azul).

---

## 🚦 PUNTO DE CONTROL

- **Lo último que funcionó:** FASE 4 completada — HRSchedulePage con CustomSelect blue accent. Build OK. Commit `13be4b0` pusheado.
- **Dónde se rompió/detuvo:** N/A.
- **Siguiente acción inmediata:** Esperar aprobación para FASE 5 — ContactSalesDialog (blue accent): "Selecciona un rango".

---

## 📝 CAMBIOS TÉCNICOS CLAVE
- [x] FASE 1: Refactor CustomSelect con accentColor prop (yellow/blue)
- [x] FASE 2a: EmployeeRequestspage — "Estado" filter (yellow)
- [x] FASE 2b: hrbitacoraspage — "Todos los empleados" filter (yellow)
- [x] FASE 3: HRWorkPhotosPage — departamento + empleado filters (blue)
- [x] FASE 4a: HRSchedulePage ScheduleForm — "Seleccionar empleado" (blue)
- [x] FASE 4b: HRSchedulePage DayEditor — selector de día (blue)
- [x] FASE 5: ContactSalesDialog — "Selecciona un rango" (blue)
- [x] Post-Flight: push, actualizar bitácora, verificar builds ✓

---

## ⚠️ NOTAS DE MEMORIA
- *Regla:* Trabajar directamente en `dev` (aprobación explícita del usuario para esta tarea)
- *Regla:* Cada fase requiere STOP con build check antes del commit
- *Regla:* NO romper nada que ya funciona — regresión cero
- *Regla:* `accentColor="yellow"` es el default en CustomSelect para backward compatibility
- *Branch:* `dev` (directo)
