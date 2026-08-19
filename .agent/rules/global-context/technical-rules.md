---
trigger: always_on
---

# 🛠️ Reglas Técnicas

## 1. Validación de Formularios
- Uso de wrappers `CommonStateHandler` para formularios.
- No implementar validación manual en cada componente.

## 2. Modularidad
- Delegar accesibilidad en primitivas de `@radix-ui`.
- No implementar componentes de accesibilidad desde cero.

## 3. Fullstack Integrity Check
**Regla obligatoria — No negociable:**
Toda funcionalidad requiere:
1. **UI + Slice/Thunk** en Frontend (`client/`)
2. **Modelo + Ruta + Controlador** en Backend (`server/`)

No se acepta maquetación sin persistencia ni endpoints sin consumo real.

## 4. Componentes Públicos Reutilizables
**Regla:**
Toda página pública (EntryPage, Login, Signup, ForgotPassword, etc.) DEBE usar componentes compartidos de `components/common/` en lugar de duplicar JSX inline.

**Componentes obligatorios en páginas públicas:**
| Componente | Archivo | Uso |
|------------|---------|-----|
| `<PublicNavbar />` | `components/common/PublicNavbar.jsx` | Navbar público con logo, links, toggle tema, botón Instalar PWA, ContactSalesDialog |
| `<Footer />` | `components/common/Footer.jsx` | Footer público |
| `PWAProvider` | `contexts/PWAContext.jsx` | Provider que envuelve la app (ya configurado en App.jsx) |

**Regla de implementación:**
- Al crear una nueva página pública, importar `<PublicNavbar />` y `<Footer />` en lugar de escribir el navbar/footer inline.
- El navbar es 100% self-contained: maneja su propio tema (`useIsDark`), toggle (`useTheme`), y lógica PWA (`usePWAPrompt`) internamente.
- NO modificar el JSX del navbar para páginas específicas. Si se necesita un navbar diferente, crear un nuevo componente en `components/common/`.
