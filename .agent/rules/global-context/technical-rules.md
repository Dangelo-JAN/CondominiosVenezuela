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
