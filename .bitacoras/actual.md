# 🛠️ TAREA: Reportes HR/Empleados — Interactividad, filtros URL-driven y modales (R1/R2/R3)
**ID:** #035 (reapertura) | **Estado:** ✅ COMPLETADO | **Fecha:** 2026-08-28

---

## 🎯 OBJETIVO FINAL
> Que los reportes diarios y semanales (HR y Empleados) sean interactivos: el diario muestra SOLO lo realizado (R1), el semanal muestra TODO incluido lo pendiente (R2), y el usuario puede navegar desde los totales hacia páginas filtradas por fecha y abrir modales de detalle al hacer clic en actividades (R3).

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)
*Usa esto para "despertar" a la IA si el chat se cierra:*
- **Lo último que funcionó:** [Último paso completado con éxito]
- **Dónde se rompió/detuvo:** [Punto donde se detuvo el avance]
- **Siguiente acción inmediata:** [Próximo paso a ejecutar]

---

## 📝 CAMBIOS TÉCNICOS CLAVE
- [ ] Crear ContactGeneral.model.js
- [ ] Crear ContactGeneral.controller.js
- [ ] Crear ContactGeneral.route.js
- [ ] Agregar template email en emailtemplates.js
- [ ] Montar ruta en server/index.js
- [ ] Crear ContactPage.jsx (página pública)
- [ ] Crear PublicRoutes.jsx
- [ ] Agregar ruta pública en AppRoutes.jsx
- [ ] Build client: npm run build (0 errores)
- [ ] Build server: npm run test (todas pasan)

- **Lo ultimo que funciono:** —
- **Donde se rompio/detuvo:** —
- **Siguiente accion inmediata:** —

## ⚠️ NOTAS DE MEMORIA
- *Regla:* NUNCA trabajar en main o dev directamente
- *Regla:* Usar useIsDark() para dark mode, NO useTheme()
- *Regla:* Usar CustomSelect para dropdowns (NO <select> nativo)
- *Regla:* Validar campos en server con sanitización XSS
- *Regla:* HUMAN IN THE LOOP — Pedir aprobación DESPUÉS de cada fase de implementación
- *Branch:* feat/create-contact-page
- *Commit:* Pendiente


