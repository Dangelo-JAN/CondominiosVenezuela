# 🛠️ TAREA: Create Contact Page
**ID:** #033 | **Estado:** 🟡 EN CURSO | **Fecha:** 2026-08-12

---

## 🎯 OBJETIVO FINAL
> Crear una página pública `/contact` con formulario de contacto expandido, manteniendo el estilo y patrones existentes del proyecto.

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)
*Usa esto para "despertar" a la IA si el chat se cierra:*

- **Lo último que funcionó:** ✅ Página de contacto pública implementada y pusheada
- **Dónde se rompió/detuvo:** N/A - Tarea completada
- **Siguiente acción inmediata:** Crear PR hacia dev

---

## 📝 CAMBIOS TÉCNICOS CLAVE
- [x] Crear ContactGeneral.model.js
- [x] Crear ContactGeneral.controller.js
- [x] Crear ContactGeneral.route.js
- [x] Agregar template email en emailtemplates.js
- [x] Montar ruta en server/index.js
- [x] Crear ContactPage.jsx (página pública)
- [x] Crear PublicRoutes.jsx
- [x] Agregar ruta pública en AppRoutes.jsx
- [x] Build client: npm run build (0 errores)
- [x] Build server: npm run test (1 test preexistente falla - no relacionado)

---

## ⚠️ NOTAS DE MEMORIA
- *Regla:* NUNCA trabajar en main o dev directamente
- *Regla:* Usar useIsDark() para dark mode, NO useTheme()
- *Regla:* Usar CustomSelect para dropdowns (NO <select> nativo)
- *Regla:* Validar campos en server con sanitización XSS
- *Regla:* HUMAN IN THE LOOP — Pedir aprobación DESPUÉS de cada fase de implementación
- *Branch:* feat/create-contact-page
- *Commit:* 85f8a9b
