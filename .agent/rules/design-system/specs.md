---
trigger: always_on
---

# ⚙️ Especificaciones Técnicas y Lógica

## 1. Tipografía y Radios
- **Títulos**: `text-2xl/3xl`, font-bold.
- **Páginas/Cards**: `rounded-2xl` (16px).
- **Inputs/Botones**: `rounded-xl` (12px).

## 2. Lógica de Desarrollo
- **SelectField**: SUSTITUIR todos los `<select>` nativos.
- **Contraste**: Borde siempre más oscuro que el fondo.

## 3. Hooks de Tema — CONTRATO DE INDEPENDENCIA (NO NEGOCIABLE)

> **Lección del bug "tema en páginas públicas":** unificar ambos hooks en un solo
> contrato rompió (a) el boolean esperado por los componentes y (b) la reactividad
> ante cambios de tema externos. Los dos hooks son **independientes** y NO se
> pueden fusionar ni intercambiar.

| Hook | Retorna | Para qué se usa | ¿Reacciona al cambio de tema externo? |
| :--- | :--- | :--- | :--- |
| **`useTheme()`** | `{ toggleTheme }` (objeto) | **SOLO** para realizar el **toggle** (escribe la clase `dark` en `<html>`). | No — lee `localStorage`/`matchMedia` solo al arrancar. |
| **`useIsDark()`** | `boolean` (`isDark`) | **Siempre** para **leer** el modo actual y aplicar estilos dinámicos. | **Sí** — `MutationObserver` sobre la clase `dark` del `<html>`. |

### Reglas de uso
1. **Lectura de `isDark`** → SIEMPRE vía `useIsDark()` (boolean reactivo). **PROHIBIDO** leerlo desde `useTheme()`.
2. **Toggle** → SOLO vía `useTheme().toggleTheme`. Quien hace toggle puede también leer con `useIsDark()` si necesita reaccionar.
3. **No desestructurar `{ isDark }` de `useIsDark()`**: este hook ya retorna el boolean directamente (`const isDark = useIsDark()`), NO un objeto.
4. **No desestructurar `{ isDark, toggleTheme }` de `useTheme()`**: desestructurar `isDark` de `useTheme()` es un anti-patrón que rompe la reactividad (ver #1).
5. **Los únicos consumidores de `useTheme()`** son los componentes que **disparan** el cambio de tema: `DashboardLayout` (origen) y `PublicNavbar` (solo `toggleTheme`).
6. **Prohibición (`document.documentElement`)**: ninguna lógica de tema debe tocar el DOM directamente; la sincronización con `<html>` la gestionan internamente los hooks.
