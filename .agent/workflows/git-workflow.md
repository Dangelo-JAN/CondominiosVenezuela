---
description: Flujo de trabajo profesional de Git (sincronización, ramas y commits estandarizados)
---

# Flujo de Trabajo de Git (Git Workflow)

Este workflow define los pasos estandarizados y obligatorios para trabajar de forma segura en el proyecto. Asegura que el entorno remoto y local estén siempre sincronizados y que las convenciones de nomenclatura (ramas y mensajes) se respeten utilizando nuestras skills.

## 0. PRE-FLIGHT CHECK (Regla Cero Estricta)
*Antes de realizar CUALQUIER cambio en el código o crear archivos, DEBES validar tu entorno:*
1. Ejecuta `git status` para confirmar en qué rama te encuentras.
2. Si estás en `main` o `dev`, **DETENTE OBLIGATORIAMENTE**. NO puedes editar ni hacer commits. Ve directamente al Paso 1.

## 1. PLAN FIRST (Regla Suprema — NO NEGOCIABLE)
*El plan es obligatorio antes de cualquier implementación. No hay excepciones.*

1. Crea un plan detallado de la tarea con: objetivo, fases, archivos a modificar, riesgos.
2. PRESENTA el plan al usuario en formato estructurado (tablas, listas, diagramas).
3. ESPERA la aprobación explícita del usuario antes de escribir una sola línea de código.
4. Sin plan aprobado → NO hay código.

## 2. STOP — APROBACIÓN DEL PLAN
*Antes de comenzar cualquier desarrollo, debes asegurar que el plan está aprobado.*

1. **Mostrar plan detallado al usuario** (fases, archivos, cambios propuestos).
2. **Esperar aprobación explícita** del usuario.
3. **NO comenzar desarrollo** sin aprobación.
4. Si el usuario solicita cambios → ajustar plan y volver a presentar.

## 3. Sincronización Inicial
*Antes de empezar a codificar o modificar configuraciones, debes sincronizar tu entorno local con el remoto.*

1. Haz checkout y actualiza la rama de producción (`main`):
   ```bash
   git checkout main
   git pull origin main
   ```
2. Limpia referencias remotas obsoletas (ejecutado desde `main`):
   ```bash
   git fetch --prune
   ```
3. Haz checkout y actualiza la rama de desarrollo (`dev`):
   ```bash
   git checkout dev
   git pull origin dev
   ```

## 4. Creación de la Rama de Trabajo
*Todo cambio debe realizarse en una rama nueva que nazca exclusivamente de `dev`.*

1. DEBES INVOCAR la skill **@git-branch-formatter** para determinar el nombre correcto de la rama según lo que se va a desarrollar. NO DEBES inventar un nombre tu misma.
2. Crea y muévete a la nueva rama desde `dev`:
   ```bash
   git checkout -b <nombre-rama-nueva>
   ```
3. Inmediatamente después de crearla, sube la rama y configúrala para rastrear la remota:
   ```bash
   git push origin <nombre-rama-nueva> --set-upstream
   ```

## 5. Desarrollo
*Implementa los cambios por fases, deteniéndote después de cada una para verificar builds y obtener aprobación.*

### 5.1. Implementar Fase N
1. Identifica la fase actual del plan aprobado.
2. Implementa los cambios correspondientes a esa fase.
3. NO avances a la siguiente fase sin completar este ciclo.

### 5.2. Verificación de Builds
*Antes de cada commit, DEBES ejecutar y verificar los builds.*
1. **Cliente:** `npm run build` — **0 errores**.
2. **Servidor:** `npm run test` — **todas las suites pasan**.
3. Si ALGÚN build falla → **CORREGIR**. NO hacer commit.
4. Solo continuar cuando ambos builds sean exitosos.

## 6. Confirmación de Cambios (Commit)
*Una vez terminados tus cambios, guárdalos siguiendo las convenciones.*

1. Añade todos los archivos modificados al área de preparación:
   ```bash
   git add .
   ```
2. Usa la skill **@git-commit-formatter** para generar un mensaje de commit profesional bajo el estándar de *Conventional Commits*.
3. Realiza el commit con el mensaje autogenerado:
   ```bash
   git commit -m "<mensaje-generado>"
   ```

## 7. Empujar Cambios
*Publica tu trabajo en la rama remota correspondiente.*

1. Sube los commits a tu rama en el origen:
   ```bash
   git push
   ```

## 8. STOP — ESPERAR APROBACIÓN DE FASE
1. Mostrar resumen de lo implementado en la fase.
2. Ejecutar builds (verificación opcional si ya se hizo en 5.2).
3. **Esperar aprobación del usuario** para continuar.
4. Si hay más fases → volver a 5.1.
5. Si es la última fase → ir a SECUENCIA FINAL (Paso 9).

## 9. SECUENCIA FINAL OBLIGATORIA
*Ejecutar SOLO después de completar TODAS las fases de implementación del plan aprobado.*

### 9.1. Confirmación del Usuario
1. **ESPERAR** confirmación explícita del usuario de que la tarea está COMPLETADA.
2. Ninguna tarea se da por completada sin esta confirmación.
3. Mientras el usuario no confirme, la tarea sigue EN CURSO.

### 9.2. Actualizar Bitácoras
1. Crear/actualizar la bitácora de la tarea en `.bitacoras/###-nombre-tarea.md`.
2. Actualizar `.bitacoras/index.md` con el nuevo registro de tarea completada.
3. Limpiar `.bitacoras/actual.md` manteniendo el formato de `00-plantilla.md`.

### 9.3. Auto-Mantenimiento (Post-Flight)
1. Leer `.agent/rules/global-context/self-maintenance.md`.
2. Aplicar la matriz de actualización línea por línea.
3. Si hay cambios → actualizar archivos correspondientes según la matriz.
4. Si NO hay cambios → marcar explícitamente: "Sin cambios requeridos".

### 9.4. Crear Pull Request
1. Verificar que la tarea está en estado COMPLETADO en la bitácora.
2. NUNCA PR a main directamente.
3. Crear PR hacia **dev** exclusivamente.
4. Verificar que el PR base sea 'dev'.
