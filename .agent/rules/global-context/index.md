---
trigger: always_on
---

# 🗺️ Index: Reglas Globales Especializadas

Este archivo indexa todas las reglas detalladas del proyecto. Consultar el archivo correspondiente según el contexto de la tarea.

## 📂 Estructura de Reglas

1. **[Mapa de Rutas](./route-map.md)**: Rutas principales de la aplicación (públicas y protegidas).
2. **[Invariantes de Desarrollo](./development-invariants.md)**: Soporte temático, responsividad PWA, seguridad.
3. **[Convenciones de Naming](./naming-conventions.md)**: Archivos, componentes, thunks, eventos DOM.
4. **[Reglas Técnicas](./technical-rules.md)**: Validación, modularidad, integridad fullstack.
5. **[Accesibilidad y Contraste](./accessibility.md)**: WCAG, reglas de contraste modo oscuro/claro.
6. **[Push Notifications](./push-notifications.md)**: FCM + Web Push, reglas invariantes.
7. **[Diseño Visual →](../design-system/index.md)**: Design System v4 (colores, componentes, tokens).
8. **[Self-Maintenance](./self-maintenance.md)**: Reglas de actualización post-flight de la configuración del agente.

## 🥇 Reglas de Oro (Cross-cutting)

1. **Fullstack Integrity**: Toda funcionalidad requiere UI + Redux (Frontend) + Modelo + Ruta + Controlador (Backend). No maquetación sin persistencia.
2. **Soporte Temático Bidireccional**: Todo componente debe soportar Light/Dark mode.
3. **Mobile-First + PWA**: Responsividad obligatoria, soporte manifiesto PWA.
4. **Root Cause Analysis Obligatorio**: Antes de cualquier fix o feat, mapear la cadena completa de componentes/dependencias, diagnosticar la causa raíz, y solo entonces implementar. Prohibido parchear síntomas. Ver `development-invariants.md` sección 5.

## 🛑 Prohibiciones Estrictas

1. **No romper separación MERN**: `client/` y `server/` son dominios separados con responsabilidades claras.
2. **No trabajar sin bitácora**: Toda tarea trackeable requiere bitácora ANTES de escribir código.
3. **No herencia del antiguo EMS v2**: Prohibido usar tokens/componentes/estilos del sistema anterior.
