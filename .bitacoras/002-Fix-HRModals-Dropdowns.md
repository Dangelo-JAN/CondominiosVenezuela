# 🛠️ TAREA: Fix HR Modal Dropdowns Dark Mode
**ID:** #002 | **Estado:** ✅ COMPLETADO | **Fecha:** 2026-04-09

---

## 🎯 OBJETIVO FINAL
> Corregir la visibilidad de las opciones de dropdown en los modales de HR (Nueva Solicitud, Invitar Coordinador) en modo oscuro, aplicando los tokens del Design System v2.

**Solución implementada:**
Reemplazar los elementos `<select>` nativos del HTML por un componente personalizado `CustomSelect` basado en Radix UI (`@radix-ui/react-select`), el cual renderiza el dropdown completamente en React con estilos propios, evitando así la dependencia del SO y garantizando contraste correcto en modo oscuro.

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)
*Usa esto para "despertar" a la IA si el chat se cierra:*

- **Lo último que funcionó:** 
  - Componente CustomSelect creado exitosamente
  - 6 selects reemplazados en páginas HR
  - Build exitoso
  - Deploy en Vercel verificado - modo oscuro funciona correctamente
  - Commit `c878bce` realizado y pusheado al remoto
- **Dónde se detuvo:** Tarea completada, esperando indicación para crear PR
- **Siguiente acción inmediata:** Crear PR hacia dev

---

## 📝 CAMBIOS TÉCNICOS CLAVE

### Protocolo seguido (AGENTS.md)
- [x] Lectura obligatoria de AGENTS.md, .bitacoras/index.md, .bitacoras/actual.md, global-context.md, design-system.md
- [x] Triaje: ámbito TRACKEABLE
- [x] Trabajo en rama existente: `fix/hr-modal-dropdowns-dark-mode`

### Implementación técnica

#### 1. Instalación de dependencias
```bash
npm install @radix-ui/react-select
```

#### 2. Nuevo componente: `client/src/components/ui/custom-select.jsx`
- Componente basado en `@radix-ui/react-select`
- Renderizado 100% controlado por React (no depende del SO)
- Estilos completos para modo oscuro con tokens Design System v2
- Búsqueda automática cuando hay más de 5 opciones
- Props: `value`, `onValueChange`, `options`, `placeholder`, `searchPlaceholder`, `groupLabel`, `disabled`, `className`, `emptyMessage`

#### 3. Reemplazos en HRRequestspage.jsx (4 selects)
| Select | Ubicación | Reemplazo |
|--------|-----------|-----------|
| employeeID | RequestForm - Modal Nueva Solicitud | CustomSelect |
| leavetype | RequestForm - Modal Nueva Solicitud | CustomSelect |
| employeeFilter | Filtros de página | CustomSelect |
| statusFilter | Filtros de página | CustomSelect |

#### 4. Reemplazos en HRProfilesPage.jsx (2 selects)
| Select | Ubicación | Reemplazo |
|--------|-----------|-----------|
| role | HRCard - Selector de rol | CustomSelect |
| role | InviteModal - Selector de rol | CustomSelect |

#### 5. Estilos aplicados (Design System v2)
| Elemento | Modo Claro | Modo Oscuro |
|----------|------------|-------------|
| Trigger | bg-gray-50, border-gray-200 | bg-[rgba(255,255,255,0.05)], border-[rgba(255,255,255,0.12)] |
| Dropdown | bg-white, border-gray-200 | bg-[#0f0f1a], border-[rgba(255,255,255,0.12)] |
| Option hover | bg-gray-100 | bg-[rgba(255,255,255,0.08)] |
| Option seleccionada | bg-amber-50, text-amber-600 | bg-[rgba(245,158,11,0.15)], text-amber-400 |

---

## ⚠️ NOTAS DE MEMORIA

- **Problema original:** Los elementos `<select>` nativos son renderizados por el sistema operativo, no por el navegador. Esto causa que los estilos aplicados (incluyendo `colorScheme`) sean ignorados en Windows/Android, manteniendo fondo blanco en modo oscuro.
- **Solución:** Componentes CustomSelect basados en Radix UI que renderizan el dropdown completamente en React, permitiendo control total sobre estilos.
- **Regla:** Usar useIsDark() hook para estilos dinámicos (Design System v2 - Sección 5)
- **Regla:** Fondo mínimo oscuro = 0.05 (rgba 255,255,255,0.05)
- **Regla:** Nunca PR directamente a main - SIEMPRE a dev primero
- **Branch:** fix/hr-modal-dropdowns-dark-mode
- **Commit:** 49a9c2c
- **PR:** https://github.com/Dangelo-JAN/CondominioCIA/pull/116

---

## 📋 RESUMEN VERIFICACIÓN

- ✅ Build local exitoso (npm run build)
- ✅ Deploy en Vercel verificado
- ✅ Modo oscuro funciona correctamente en todos los dropdowns
- ✅ No rompe el proyecto
- ✅ Design System v2 aplicado correctamente
- ✅ Búsqueda visible cuando hay +5 opciones
- ✅ Accesibilidad (keyboard navigation, ARIA)
- ⏳ Listo para crear PR hacia dev
