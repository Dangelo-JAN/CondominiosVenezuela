---
trigger: always_on
---

# 🇻🇪 Index: Condominios Venezuela - SGC Design System v4

Este directorio contiene las reglas canónicas de UI/UX para `condo.ve` (abril 2026). Es obligatorio seguir estos estándares para migrar el sistema desde EMS v2 hacia la nueva identidad visual de la marca.

## 📂 Estructura de Reglas (Módulos)
1. **[Estrategia de Migración](./migration-mapping.md)**: **CRÍTICO.** Diccionario de traducción de tokens antiguos (Indigo/Amber) a los nuevos (Blue/Yellow Venezuela).
2. **[Colores y Tokens](./colors.md)**: Definición de la Paleta 🇻🇪, `ACCENT_MAP` y tintes de Tailwind.
3. **[Listas y Tablas](./lists-tables.md)**: Implementación de `ThemedList*` y reglas de deprecación de `ListItemCard`.
4. **[Componentes UI](./ui-elements.md)**: Especificaciones para Cards KPI, Botones de acción, Badges y Avatares.
5. **[Lógica y Specs](./specs.md)**: Uso de `SelectField`, hook `useIsDark`, tipografía y border-radius.

## 📏 Regla de Oro de Contraste
- **Borde > Fondo**: El borde siempre debe ser más oscuro o perceptible que el fondo.
- **Modo Claro**: PROHIBIDO usar `gray-100` como separador; usar siempre el mid-tint del acento correspondiente (ej. `#dde5ff`).
- **Modo Oscuro**: Fondo mínimo opacidad `0.04`, borde mínimo `0.10`. Los separadores deben ser perceptibles (`rgba(255,255,255,0.08)`).

## 🧭 Guía de Acento por Sección


| Sección | Acento v4 | Color Hex | Legacy (v2) |
| :--- | :--- | :--- | :--- |
| Empleados, Perfiles, Nóminas, Avisos, Deptos. | `blue` | `#003DA5` | `indigo` |
| Solicitudes / Ausencias | `yellow` | `#FCE300` | `amber` |
| Reclutamiento | `emerald` | `#10b981` | `emerald` |
| Entrevistas | `cyan` | `#06b6d4` | `cyan` |

## 🛑 Prohibiciones Estrictas (Zero Tolerance)
1. **No usar acentos antiguos**: El agente no debe sugerir ni mantener nombres como `indigo`, `amber` o `purple`.
2. **No usar `<select>` nativo**: Es obligatorio el uso de `SelectField` para evitar errores de renderizado en Windows.
3. **No usar `document.documentElement`**: Toda lógica de tema debe ser reactiva mediante el hook `useIsDark()`.
4. **No a los separadores invisibles**: Cualquier borde de separación en listas debe seguir los tintes definidos en `lists-tables.md`.