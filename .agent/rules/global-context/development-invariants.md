---
trigger: always_on
---

# ⚙️ Invariantes del Desarrollo

Reglas que TODO desarrollo debe cumplir sin excepción.

## 1. Soporte Temático Bidireccional
Todo componente DEBE soportar Light y Dark mode, siguiendo el Design System v4.

## 2. Responsividad Absoluta & PWA
- Enfoque **Mobile-first** en toda implementación.
- Soporte para manifiesto PWA.
- Service Workers para caching (ver `client/public/sw.js`).

## 3. Seguridad End-to-End
- Validación de roles estrictamente **server-side** mediante interceptores JWT.
- Nunca confiar en datos del cliente para autorización.

## 4. Protocolo de Ejecución Obligatorio
- **PLAN FIRST:** Toda tarea debe iniciar con un plan detallado presentado y aprobado por el usuario. Sin plan aprobado → no hay código.
- **STOPS POR FASE:** Cada fase de implementación debe terminar con un STOP, build verification, commit y espera de aprobación del usuario. No avanzar sin aprobación.
- **BUILDS GATE:** Antes de cada commit, ejecutar `client: npm run build` (0 errores) y `server: npm run test` (todas pasan). Si falla → corregir, no commitear.
- **APROBACIÓN EXPLÍCITA:** Ninguna fase, commit, cambio ni tarea se da por completado sin aprobación del usuario. "Completado" = el usuario lo dice.
- **SECUENCIA FINAL:** Al terminar todas las fases: 1) esperar confirmación del usuario, 2) actualizar bitácoras, 3) auto-mantenimiento, 4) PR hacia dev.

## 5. Root Cause Analysis Obligatorio
> **Nacido del bug #030 (HR scrolling):** Parchear síntomas sin entender la causa raíz genera iteraciones infinitas y frustración.

### 5.1. Para BUGS / FIXES
**ANTES de escribir UNA sola línea de código:**

1. **MAPEO DE CADENA COMPLETA:** Identificar TODOS los nodos afectados desde el componente raíz hasta el nodo donde se manifiesta el síntoma.
   - Ejemplo: `DashboardLayout → Outlet → PageRoot → TableWrapper → ThemedListWrapper → ThemedListContainer`
2. **DIAGNÓSTICO DE CAUSA RAÍZ:** Para cada nodo de la cadena, responder:
   - ¿Tiene `overflow`? ¿Qué tipo (hidden, auto, scroll)?
   - ¿Tiene `flex-1`? ¿Está constreñido por un padre flex?
   - ¿Tiene `min-h-0`? Sin esto, un flex item no puede encogerse por debajo de su contenido.
   - ¿Tiene `flex-shrink-0`? ¿Crece libremente o está limitado?
3. **HIPÓTESIS FUNDAMENTADA:** Proponer UNA solución que ataque la causa raíz (no el síntoma). Justificar por qué funciona con evidencia del mapeo.
4. **VALIDACIÓN:** El fix debe resolver el bug SIN crear regresiones en otros componentes que usen los mismos nodos.

### 5.2. Para FEATURES / MEJORAS
**ANTES de escribir UNA sola línea de código:**

1. **MAPEO DE IMPACTO:** Identificar TODOS los componentes, rutas y patrones que interactúan con la nueva implementación.
2. **ANÁLISIS DE PATRÓN:** Verificar si el patrón ya existe en el proyecto. Si existe, reutilizarlo. Si no, documentar por qué se crea uno nuevo.
3. **CADENA DE DEPENDENCIAS:** Mapear: UI → Redux/State → API → Modelo. Verificar integridad en cada nodo.
4. **VALIDACIÓN:** La feature debe funcionar en todos los breakpoints y modos (light/dark) sin romper componentes existentes.

### 5.3. ⛔ Prohibiciones Derivadas
- **PROHIBIDO** parchear un nivel sin verificar todos los niveles de la cadena.
- **PROHIBIDO** asumir que un `overflow-hidden` o `flex-1` es "decorativo" sin analizar su impacto en el layout.
- **PROHIBIDO** aplicar fixes iterativos sin mapear la cadena completa primero. Cada iteración fallida = violación de esta regla.

### 5.4. Caso de Estudio: Bug #030 (HR Scrolling)
| Iteración | Fix Intentado | Por Qué Falló |
|-----------|---------------|---------------|
| 1 | Agregar `overflow-y-auto` al page root | La página crecía libremente, el root se hacía scroll infinito. No se analizó que `flex-1` en TableWrapper no estaba constreñido. |
| 2 | Quitar `overflow-y-auto` del page root | `ThemedListContainer` tenía `overflow-hidden` y crecía ilimitadamente para encajar todo su contenido. TableWrapper nunca se desbordaba → sin scrollbar. |
| 3 ✅ | `ThemedListContainer` → `flex-1 min-h-0 overflow-y-auto` | Causa raíz identificada: el container necesitaba llenar el espacio restante después del header (que tenía `flex-shrink-0`) y scrollear internamente. |

**Lección:** El fix correcto estaba 2 niveles más abajo del que se observaba el síntoma. El mapeo completo de la cadena al inicio habría revelado `ThemedListContainer` como nodo raíz en el primer intento.
