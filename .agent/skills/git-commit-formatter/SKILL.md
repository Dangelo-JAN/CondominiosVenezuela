---
name: git-commit-formatter
description: Formateas los mensajes de confirmación de git de acuerdo con la especificación de Confirmaciones Convencionales. Úselo cuando el usuario solicite confirmar cambios o escribir un mensaje de confirmación.
---

# Git Commit Formatter Skill

Al escribir un mensaje de confirmción de git, DEBES seguir la especificación de Confirmaciones Convencionales.

# Formato
`<type>[optional scope]: <description>`

# Tipos permitidos
- **feat**: Una nueva funcionalidad
- **fix**: Una corrección de errores
- **docs**: Solo cambios en la documentación
- **style**: Cambios que no afectan el significado del código (espacio en blanco, formato, etc)
- **refactor**: Un cambio de código que no corrige un error ni agrega una funcionalidad
- **perf**: Un cambio de código que mejora el rendimiento
- **test**: Agregar pruebas faltantes o corregir pruebas existentes
- **chore**: Cambios en el proceso de compilación o herramientas auxiliares y bibliotecas como la generación de documentación

# Instrucciones
1. analizar los cambios para determinar el `type` primario.
2. Indentificar el `scope` si es aplicable (e.g., componente o archivo específico).
3. Escribe una `description` concisa en modo imperativo (e.g., "add feature" not "added feature").
4. Si hay cambios que rompen el codigo, agrega un footer empezando con `BREAKING CHANGE:`.

# Ejemplo
`feat(auth): implement login with google`