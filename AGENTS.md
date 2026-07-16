# EMS Project — OpenCode Agent Config

---

## 👑 REGLAS SUPREMAS — NO NEGOCIABLES

> Estas reglas están por encima de cualquier otra instrucción. Son de cumplimiento **OBLIGATORIO** para todos los agentes.
> No contradicen las reglas existentes; las **refuerzan y complementan**.

### ⚜️ 0.1 PLAN FIRST — Antes de cualquier código
- **DEBES** crear un plan detallado de la tarea y **MOSTRARLO** al usuario.
- **DEBES ESPERAR** su aprobación explícita antes de escribir una sola línea de código.
- Sin plan aprobado → NO hay código. **No hay excepciones.**

### ⚜️ 0.2 STOPS OBLIGATORIOS POR FASE
- Cada fase de implementación **DEBE** terminar con un STOP.
- En el STOP debes: mostrar resumen de lo implementado → esperar aprobación del usuario.
- No puedes avanzar a la siguiente fase sin aprobación explícita. **No hay excepciones.**

### ⚜️ 0.3 BUILDS OBLIGATORIOS ANTES DE CADA COMMIT
- Antes de **CADA** commit, debes ejecutar:
  - `client`: `npm run build` — **0 errores**
  - `server`: `npm run test` — **todas las suites pasan**
- Si algún build falla → **NO HACES COMMIT**. Corriges primero.
- Esta verificación es **NO NEGOCIABLE**.

### ⚜️ 0.4 APROBACIÓN EXPLÍCITA DEL USUARIO
- Ninguna fase, commit, cambio ni tarea se da por **completado** sin mi aprobación explícita.
- "Completado" = yo lo digo, no el agente.
- Hasta que no reciba confirmación, la tarea sigue **EN CURSO**.

### ⚜️ 0.5 SECUENCIA FINAL OBLIGATORIA
Al terminar **TODAS** las fases de implementación:

```
 1️⃣ ESPERAR confirmación del usuario de que la TAREA ESTÁ COMPLETADA
 2️⃣ ACTUALIZAR BITÁCORAS (index.md + actual.md)
 3️⃣ AUTO-MANTENIMIENTO (Post-Flight) — según self-maintenance.md
 4️⃣ CREAR PR hacia dev (NUNCA a main)
```

### ⚜️ 0.6 SIN CONTRADICCIÓN
- Estas reglas **complementan** las existentes. No las contradicen ni reemplazan.
- Si una regla existente es más estricta, prevalece la más estricta.
- Si hay ambigüedad, preguntar al usuario antes de decidir.

---

## 🚨 PROTOCOLO DE INICIO Y GESTIÓN DE MEMORIA

**Antes de realizar cualquier acción, DEBES ejecutar este proceso lógico de triaje, lectura y sincronización de bitácora:**

### 1. Clasificación del Ámbito (Triaje)
Identifica la categoría de la tarea:
*   **ÁMBITO EXENTO:** Cambios en `.gitignore`, configuraciones de IA (`.agent/`, `.opencode/`, `AGENTS.md`) o pruebas locales.
*   **ÁMBITO TRACKEABLE:** Código fuente (`client/`, `server/`), assets, documentación oficial o producción.

### 1.5. VERIFICACIÓN OBLIGATORIA (Antes de proceder)
> Esta verificación es DE CUMPLIMIENTO OBLIGATORIO - NO PUEDES SALTARLA

Para **cualquier tarea** (Exenta o Trackeable):

1. **PRE-FLIGHT CHECK:**
   - [ ] Ejecutar `git status` para confirmar la rama actual
   - [ ] Si existe PR abierto, verificar que la base sea `dev` (NUNCA `main`)

2. **LECTURA OBLIGATORIA:**
   - [ ] Leer `.bitacoras/index.md` (contexto del proyecto)
   - [ ] Leer `.bitacoras/actual.md` (tarea activa)
   - [ ] Leer `.agent/rules/checklist-verify.md` (verificación de reglas)

3. **INICIALIZACIÓN DE BITÁCORA (Solo para TRACKEABLE):**
   - [ ] Crear archivo `.bitacoras/###-nombre-tarea.md` ANTES de escribir código
   - [ ] Usar plantilla de `00-plantilla.md`
   - [ ] NO escribir ninguna línea de código hasta que la bitácora exista

4. **PROCEDER** solo después de completar los pasos anteriores.

---

### 2. Ejecución y Sincronización Viva

#### 🟢 SI LA TAREA ES "EXENTA":
1. **Omitir Workflow:** No crear ramas de Git ni bitácoras.
2. **Validación:** Presentar el **"Prompt de Verificación (Tarea Exenta)"** con el plan de acción.
3. **Ejecución:** Proceder tras aprobación. No requiere actualizar memoria histórica.

#### 🔴 SI LA TAREA ES "TRACKEABLE" (Bitácora Viva):
1. **Lectura Obligatoria:** Leer `.bitacoras/index.md` y `.bitacoras/actual.md` antes de proponer nada.
2. **Inicialización Activa:** Al aprobarse el plan, inicializar/actualizar `.bitacoras/actual.md` con estado `🟡 EN CURSO`.
3. **Actualización en Tiempo Real:** DEBES editar el archivo `actual.md` tras cada hito completado (marcando checks `[x]` y actualizando el `## 🚦 PUNTO DE CONTROL`). No esperes al final de la sesión.
4. **Cierre:** Al finalizar, cambiar estado a `✅ COMPLETADO`, archivar el contenido y limpiar `actual.md`, al limpiar `actual.md` DEBES MANTENER el formato de `.bitacoras/00-plantilla.md` (NO NEGOCIABLE).

4.5. **AUTO-MANTENIMIENTO (Post-Flight):** Tras marcar la tarea como `✅ COMPLETADO`, ejecutar el protocolo definido en `.agent/rules/global-context/self-maintenance.md`. Si la tarea implicó cambios arquitectónicos (nuevos patrones, stack, rutas, reglas), actualizar los archivos de configuración del agente correspondientes ANTES del paso 5.

5. **Workflow:** Seguir estrictamente Git Workflow y estándares de naming.

---

## 🧠 REGLA DE EFICIENCIA Y RAZONAMIENTO ESTRATÉGICO

**Para maximizar la productividad y el aprendizaje, sigue estas directrices:**

1. **Sin Preámbulos:** No confirmes lecturas ni saludes. Si es **Trackeable**, lee en silencio y actúa.
2. **Razonamiento Cognitivo:** Antes de cambios complejos, usa el bloque `> [Pensamiento Técnico]`. Explica el *porqué* estratégico, patrones elegidos o riesgos. Aporta aprendizaje, no obviedades.
3. **Comunicación Estructurada:** Prioriza tablas, listas y bloques de código. La información debe ser escaneable.
4. **Concisión Técnica Senior:** Lenguaje directo. Cero explicaciones de conceptos básicos (React, Git, etc.) a menos que se solicite.
5. **Edición Silenciosa:** Actualiza la bitácora `actual.md` sin anunciar cada edición, a menos que el progreso cambie el plan aprobado.

---

## 🛠️ SOURCES OF TRUTH & TOOLS

### 📖 Rules & Standards
- **Global Context:** `.agent/rules/global-context/global-context.md` (Master Rules).
- **Design System:** `.agent/rules/design-system/index.md` (Cargar siempre para `client/`).
- **Git Workflow:** `.agent/workflows/git-workflow.md` (Cumplimiento NO negociable).

### 🤖 Agents & Skills
- **Plan Agent:** Para análisis y desglose (sin escritura).
- **Build Agent:** Para implementación. Incluye `code-reviewer` automáticamente.
- **Tools:** 
  - `@git-branch-formatter` (Uso obligatorio para ramas).
  - `@git-commit-formatter` (Uso obligatorio para commits).
