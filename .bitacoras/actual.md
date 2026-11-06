# 📋 PLANTILLA DE BITÁCORA (OBLIGATORIO SEGUIR)

> Todas las bitácoras DEBEN seguir esta estructura exacta.

```markdown
# 🛠️ TAREA: [Nombre Breve]
**ID:** #XXX | **Estado:** 🟡 EN CURSO | **Fecha:** YYYY-MM-DD

---

## 🎯 OBJETIVO FINAL
> Una frase que defina el "éxito" de esta tarea (Ej: "Que el usuario pueda loguearse con Google sin errores").

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)
*Usa esto para "despertar" a la IA si el chat se cierra:*

- **Lo último que funcionó:** [Ej: El botón de login ya envía los datos].
- **Dónde se rompió/detuvo:** [Ej: Error 403 en el callback de la API].
- **Siguiente acción inmediata:** [Ej: Revisar las credenciales en el archivo .env].

---

## 📝 CAMBIOS TÉCNICOS CLAVE
- [x] [Configuración de Provider - COMPLETADO]
- [ ] [Validación de JWT - PENDIENTE]
- [ ] [Redirección al Dashboard - PENDIENTE]

---

## ⚠️ NOTAS DE MEMORIA
- *Regla:* [Regla importante a recordar para esta tarea]
- *Regla:* [Otra regla relevante]
- *Branch:* [nombre de la rama]
- *Commit:* [hash del commit si aplica]
```

---

## 📝 REGLAS DE LA PLANTILLA

| Campo | Formato | Ejemplo |
|-------|---------|---------|
| **ID** | `#001`, `#002`, etc. (secuencial) | `#001` |
| **Estado** | 🟡 EN CURSO / ✅ FINALIZADO / 🔴 BLOQUEADO | 🟡 EN CURSO |
| **Fecha** | YYYY-MM-DD | 2026-04-07 |
| **Objetivo Final** | Una sola frase que defina el éxito | "Que el usuario pueda loguearse" |
| **Punto de Control** | Contexto para recuperación si el chat se cierra | 3 puntos: último trabajo, dónde se detuvo, siguiente acción |
| **Cambios Técnicos** | Checklist con [x] completado y [ ] pendiente | - [x] Tarea completada |
| **Notas de Memoria** | Reglas importantes, branch, commit | - Branch: feat/login-google |

---

## 📌 EJEMPLO

Ver bitácora de referencia: [[001-Update-HRCards]]

*Esta plantilla es de cumplimiento obligatorio para todas las nuevas bitácoras.*