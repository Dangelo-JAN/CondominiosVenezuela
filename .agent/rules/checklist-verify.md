# Checklist de Verificación - Reglas del Proyecto

Este archivo es la fuente de verdad para verificar que sigo las reglas del proyecto antes de cada tarea.

## REGLAS OBLIGATORIAS (En orden de ejecución)

### 0. PLAN FIRST (Antes de cualquier cosa — NO NEGOCIABLE)
> Esta verificación está por encima de cualquier otra. Se ejecuta SIEMPRE primero.
- [ ] Crear plan detallado de la tarea
- [ ] Mostrar plan al usuario en formato estructurado
- [ ] Esperar aprobación explícita del usuario
- [ ] NO escribir código hasta obtener aprobación del plan

### 0.5. STOPS POR FASE
- [ ] Cada fase de implementación debe terminar con un STOP
- [ ] Mostrar resumen de lo implementado en la fase
- [ ] Ejecutar builds (client: `npm run build`, server: `npm run test`)
- [ ] Si builds fallan → CORREGIR (no hacer commit)
- [ ] Si builds pasan → hacer commit + push + esperar aprobación

### 1. PRE-FLIGHT CHECK (Antes de cualquier cosa)
- [ ] Ejecutar `git status` para confirmar la rama actual
- [ ] Si estoy en `main` o `dev`, DETENERME y seguir el Git Workflow
- [ ] NUNCA hacer cambios directos en main o dev

### 2. Lectura Obligatoria de Documentación
- [ ] Leer `AGENTS.md` - Configuración del agente
- [ ] Leer `.agent/rules/global-context/global-context.md` - Reglas globales del proyecto (Main Brain)
- [ ] Leer `.agent/rules/checklist-verify.md` - Verificación de reglas (este archivo)
- [ ] Leer `.agent/workflows/git-workflow.md` - Flujo de trabajo Git

### 3. Git Workflow (Para cualquier cambio de código)
- [ ] Paso 1: Sincronizar con main y dev
- [ ] Paso 2: Crear rama desde dev usando @git-branch-formatter
- [ ] Paso 3: Desarrollo (implementar cambios)
- [ ] Paso 4: Commit usando @git-commit-formatter
- [ ] Paso 5: Push a la rama remota

### 3.1. Creación de Bitácora (TRACKEABLE)
- [ ] Crear archivo `.bitacoras/###-nombre-tarea.md` con plantilla ANTES de escribir código
- [ ] El archivo debe existir en el sistema de archivos antes de cualquier cambio
- [ ] Usar `@git-branch-formatter` para nombre de rama
- [ ] NO escribir código hasta que bitácora exista (regla NO negociable)

### 4. Reglas Técnicas
- [ ] Soporte para Light/Dark Mode en todos los componentes
- [ ] Usar hook `useIsDark()` para estilos dinámicos
- [ ] Seguir naming conventions del proyecto
- [ ] Aplicar Design System v4 (tokens, colores, opacidades)

### 4.1. ROOT CAUSE ANALYSIS OBLIGATORIO (Antes de código)
> ⚠️ OBLIGATORIO: Ejecutar SIEMPRE antes de escribir código para bugs, fixes o features.
- [ ] **MAPEO DE CADENA:** Identificar TODOS los nodos/componentes afectados desde la raíz hasta el síntoma
- [ ] **DIAGNÓSTICO:** Para cada nodo: verificar overflow, flex-1, min-h-0, flex-shrink-0, crecimiento libre vs constreñido
- [ ] **HIPÓTESIS FUNDAMENTADA:** Proponer 1 solución que ataque la causa raíz (no el síntoma), justificada con evidencia del mapeo
- [ ] **VALIDACIÓN:** Confirmar que el fix no crea regresiones en otros componentes que usen los mismos nodos
- [ ] Ver `development-invariants.md` sección 5 para el proceso completo y caso de estudio #030

### 4.5. VERIFICACIÓN DE BUILDS ANTES DE COMMIT
> ⚠️ OBLIGATORIO: Ejecutar SIEMPRE antes de cada commit. NO OPCIONAL.
- [ ] **Cliente:** `npm run build` — 0 errores (production build)
- [ ] **Servidor:** `npm run test` — todas las suites pasan
- [ ] Si ALGÚN build falla → **NO HACER COMMIT**. Corregir primero.
- [ ] Solo commitear cuando ambos builds sean exitosos

### 5. Antes de crear/modificar archivos
- [ ] Verificar que es un cambio necesario (no especulativo)
- [ ] Asegurar que se cumple "Fullstack Integrity Check"
- [ ] Si es funcionalidad nueva: Modelo + Ruta + Controlador + UI + Redux

### 6. Post-Flight — Auto-Mantenimiento (Paso 4.5 de AGENTS.md)
> ⚠️ OBLIGATORIO: Ejecutar DESPUÉS de que la bitácora se marque como COMPLETADO
> y ANTES del Pull Request (Paso 7). No saltar. No excepciones.

#### 6.1. Leer self-maintenance.md
- [ ] Leer `.agent/rules/global-context/self-maintenance.md`
- [ ] Aplicar la matriz de actualización línea por línea
- [ ] Revisar los indicadores de auto-mantenimiento

#### 6.2. Determinar si hay cambios
- [ ] Si hay cambios → actualizar archivo(s) correspondiente(s) según la matriz
- [ ] Si NO hay cambios → marcar explícitamente en la bitácora: "Sin cambios requeridos"

#### 6.3. Verificación de builds
- [ ] Server: `npm run test` — todas las suites pasan
- [ ] Client: `npm run build` — 0 errores

### 6.5. SECUENCIA FINAL OBLIGATORIA
> ⚠️ OBLIGATORIO: Ejecutar DESPUÉS de completar TODAS las fases de implementación
> y ANTES de crear el Pull Request.

- [ ] **Paso 1:** Esperar confirmación explícita del usuario de que la tarea está COMPLETADA
- [ ] **Paso 2:** Actualizar bitácoras
  - [ ] Crear/actualizar bitácora de la tarea en `.bitacoras/###-nombre-tarea.md`
  - [ ] Actualizar `.bitacoras/index.md` con el nuevo registro
  - [ ] Limpiar `.bitacoras/actual.md` manteniendo formato plantilla
- [ ] **Paso 3:** AUTO-MANTENIMIENTO (Post-Flight) — según self-maintenance.md
  - [ ] Revisar matriz de actualización
  - [ ] Aplicar cambios correspondientes en configuración del agente
- [ ] **Paso 4:** Crear PR hacia dev (NUNCA a main)
  - [ ] Verificar que el PR base sea 'dev'
  - [ ] NO crear PR si tarea no está COMPLETADA

### 7. Pull Request
- [ ] Verificar que el PR base sea 'dev' (NUNCA main)
- [ ] NUNCA PR a main directamente
- [ ] PR debe ir de rama de trabajo a dev
- [ ] NO crear PR sin aprobación explícita de tarea COMPLETADA
- [ ] Bitácora debe estar en estado COMPLETADO antes de PR

## REGLA AGÉNTICA ABSOLUTA — NO INTERCALADO DE PASOS

> ⛔ **PROHIBICIÓN TOTAL e INNEGOCIABLE:**
> Cuando se actualicen, creen o modifiquen configuraciones agénticas (archivos en `.agent/`, `AGENTS.md`, o cualquier archivo de reglas/workflows), **ESTÁ TOTALMENTE PROHIBIDO** intercalar pasos nuevos entre existentes.
>
> **Ejemplo de lo que NO se debe hacer (INCORRECTO):**
> Si existen pasos 6 y 7, y se necesita agregar un paso entre ellos, **NO** se crea un "6.5".
>
> **Lo que SÍ se debe hacer (CORRECTO):**
> El nuevo paso se crea como el **NUEVO paso 7**, y los pasos anteriores (7 y subsecuentes) se renumeran secuencialmente:
> - Antiguo paso 7 → Ahora paso 8
> - Antiguo paso 8 → Ahora paso 9
> - Y así sucesivamente.
>
> **NUNCA** se usan decimales para intercalar (6.5, 7.5, etc.). Siempre se renumera todo secuencialmente.

## Notas
- Las secciones 1-5 deben ejecutarse ANTES y DURANTE cada tarea
- La sección **6 (Post-Flight)** debe ejecutarse después de marcar la tarea como COMPLETADO
  y ANTES del Pull Request — es de CUMPLIMIENTO OBLIGATORIO y NO NEGOCIABLE
- Si alguna regla no está clara, consultar la documentación del proyecto
- Las reglas de Git workflow son de CUMPLIMIENTO OBLIGATORIO y NO NEGOCIABLE