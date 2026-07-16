---
trigger: always_on
---

# 🔄 Mapeo de Migración: v2 (EMS) → v4 (CV)

Cuando el agente edite un archivo con estilos antiguos, DEBE aplicar esta tabla de traducción:


| Concepto | v2 (Legacy) | v4 (Condominios VE) |
| :--- | :--- | :--- |
| **Acento Principal** | `indigo` (#6366f1) | `blue` (#003DA5) |
| **Acento Secundario** | `amber` (#f59e0b) | `yellow` (#FCE300) |
| **Acento Éxito** | `emerald` (#10b981) | `emerald` (Sin cambio hex) |
| **Componente Lista** | `ListItemCard` (Card expandible) | `ThemedList*` (Tabular Grid) |
| **Borde de Página** | `rounded-2xl` (Gris) | `rounded-2xl` (Accent Tinte) |
| **Gradiente Botón** | Indigo/Violet | Blue/DarkBlue (#003DA5 -> #00247D) |

## Instrucción de Limpieza
Si encuentras la prop `accent="indigo"`, cámbiala automáticamente a `accent="blue"`. 
Si encuentras `accent="amber"`, cámbiala a `accent="yellow"`.
