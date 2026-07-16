---
trigger: always_on
---

# 🔄 Self-Maintenance: Actualización Post-Flight

Este archivo define cuándo y cómo el agente DEBE actualizar su propia configuración después de completar una tarea.

## ⏱ Cuándo se ejecuta

**SOLO** después de que la bitácora de la tarea se marque como:

- `✅ FINALIZADO`
- `✅ COMPLETADO`

NO se ejecuta antes, durante, ni en medio de la tarea. Es un **post-flight check** que ocurre al cierre del ciclo de vida de la tarea.

## 📊 Matriz de actualización

| Si la tarea COMPLETADA implicó... | Entonces DEBES actualizar... |
|-----------------------------------|------------------------------|
| Nuevo feature cross-cutting (impacta client+server) con reglas invariantes | Crear archivo en `global-context/` + registrar en `index.md` |
| Cambio en el stack tecnológico (nueva librería, nuevo servicio) | `global-context.md` (sección 2: Tech Stack) |
| Nueva ruta principal o cambio de rutas existentes | `route-map.md` |
| Nueva regla de desarrollo (tema, responsive, seguridad) | `development-invariants.md` |
| Nueva convención de naming | `naming-conventions.md` |
| Nueva regla técnica (validación, modularidad, integridad) | `technical-rules.md` |
| Nueva regla de accesibilidad/contraste | `accessibility.md` |
| Nuevo token/componente/patrón visual | Archivo correspondiente en `design-system/` |
| Cambio en el flujo de Git o PR | `AGENTS.md` y/o `.agent/workflows/git-workflow.md` y/o `development-invariants.md` (Protocolo Ejecución) |
| Cambio en el protocolo de inicio del agente | `AGENTS.md` |
| Cambio en el checklist de verificación | `.agent/rules/checklist-verify.md` |
| Cambio en prompts de build/review | `.opencode/prompts/build.txt` y/o `.opencode/prompts/review.txt` |
| Deprecación de una regla existente | Archivo correspondiente + marcar como `⚠️ DEPRECATED` |

## 🚦 Indicadores de auto-mantenimiento

Responde **SÍ** a alguna de estas preguntas al finalizar la tarea:

- [ ] ¿La tarea introdujo un nuevo patrón que no existía antes? (ej: GraphQL, WebSockets, cola de mensajes, nueva BD)
- [ ] ¿La tarea modificó la forma en que clientes y servidor se comunican?
- [ ] ¿La tarea agregó una dependencia externa nueva (servicio, SDK, API)?
- [ ] ¿La tarea creó un nuevo tipo de componente que se usará en múltiples lugares?
- [ ] ¿La tarea cambió reglas de estilo, colores, o componentes visuales?
- [ ] ¿La tarea modificó el flujo de trabajo (Git, PR, revisión)?
- [ ] ¿La tarea agregó o eliminó una convención de desarrollo?

Si alguna respuesta es **SÍ** → actualizar el/los archivos según la matriz.

## 🛑 Regla de oro

Documenta **SOLO** lo que la tarea realmente construyó, no lo que planeaste. La verdad la tiene el código completado, no el plan inicial. Si el cambio arquitectónico fue menor o no evidente, NO fuerces una actualización.
