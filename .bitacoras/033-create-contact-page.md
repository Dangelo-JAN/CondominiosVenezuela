# 🛠️ TAREA: Create Contact Page
**ID:** #033 | **Estado:** 🟡 EN CURSO | **Fecha:** 2026-08-11

---

## 🎯 OBJETIVO FINAL
> Crear una página pública `/contact` con formulario de contacto expandido, manteniendo el estilo y patrones existentes del proyecto.

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)
*Usa esto para "despertar" a la IA si el chat se cierra:*

- **Lo último que funcionó:** Plan aprobado, rama creada, bitácora inicializada.
- **Dónde se rompió/detuvo:** Inicio de Fase 1 (Backend).
- **Siguiente acción inmediata:** Crear modelo ContactGeneral.model.js.

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

---

## ⚠️ NOTAS DE MEMORIA
- *Regla:* NUNCA trabajar en main o dev directamente
- *Regla:* Usar useIsDark() para dark mode, NO useTheme()
- *Regla:* Usar CustomSelect para dropdowns (NO <select> nativo)
- *Regla:* Validar campos en server con sanitización XSS
- *Regla:* HUMAN IN THE LOOP — Pedir aprobación DESPUÉS de cada fase de implementación
- *Branch:* feat/create-contact-page
- *Commit:* Pendiente
