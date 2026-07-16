# 🛠️ TAREA: Guardar Videos en Bitácoras
**ID:** #027 | **Estado:** ✅ COMPLETADO | **Fecha:** 2026-07-10

---

## 🎯 OBJETIVO FINAL
> Que los empleados puedan subir y visualizar videos (MP4/WebM/MOV) en sus bitácoras, junto a las imágenes existentes, con soporte completo backend (Cloudinary upload_large) y frontend (formulario + reproductor).

---

## 🚦 PUNTO DE CONTROL

- **Lo último que funcionó:** Todas las fases completadas — Backend (modelo+middleware+controlador), Frontend Employee (form+detail), Frontend HR (detail), 3 hotfixes de bugs en producción. Builds OK.
- **Dónde se rompió/detuvo:** N/A — tarea completada exitosamente.
- **Siguiente acción inmediata:** PR a dev.

---

## 📝 CAMBIOS TÉCNICOS CLAVE

### ✅ FASE 0 — Preparación (COMPLETADO)
- [x] Sync con `main` y `dev`
- [x] Rama `feat/027-videos-en-bitacoras` creada desde `dev`
- [x] Bitácora inicializada

### ✅ FASE 1 — Backend (COMPLETADO — commit `38bdff0`)
- [x] Modelo: campo `videos: [String]` con validator max 3
- [x] Middleware: migrar a `.fields()` con fileFilter bifurcado (images: `image/*`, videos: `video/*`)
- [x] Controlador: `uploadVideosToCloudinary` usando `upload_large` + chunks 6MB + eager streaming
- [x] Controlador: `deleteVideosFromCloudinary` con `resource_type: "video"`
- [x] Controlador: Update `HandleCreateBitacora` y `HandleUpdateBitacora` con `keepVideos`

### ✅ FASE 2 — Frontend Employee: Formulario (COMPLETADO — commit `6c9b541`)
- [x] Estados: `selectedVideoFiles`, `videoPreviews`, `existingVideos`, `isUploading`
- [x] Handlers: `handleVideoFileChange`, `removeNewVideo`, `removeExistingVideo`
- [x] UI: sección subida con input `accept="video/*"` + previews `<video>` + overlay X
- [x] Submit: `formData.append('videos', file)` + `keepVideos`
- [x] Submit button: `disabled={isUploading}` con feedback "Subiendo..."

### ✅ FASE 3 — Frontend Employee: Vista detalle (COMPLETADO — commit `c0ba0db`)
- [x] Card footer: icono `Video` + count junto a imágenes
- [x] Detail modal: grid de `<video controls playsInline preload="metadata">` con `bg-black`

### ✅ FASE 4 — Frontend HR: Vista detalle (COMPLETADO — commit `01a051f`)
- [x] Detail modal HR: grid de `<video controls playsInline>` idéntico al Employee

### 🐛 HOTFIX — Video upload crashing (commit `0181139`)
- [x] **Bug**: `path.split is not a function` en `HandleCreateBitacora`
- [x] **Causa**: `cloudinary.uploader.upload_large()` no acepta Readable stream como primer argumento
- [x] **Fix**: Cambiado a `cloudinary.uploader.upload()` con base64 data URI (mismo patrón probado de imágenes)
- [x] Eliminado import `Readable` de `stream`

### 🐛 HOTFIX 2 — Eager streaming_profile (commit `8a4702e`)
- [x] **Bug**: `Eager Invalid Transformation - Streaming profile not supported for non-streaming formats`
- [x] **Causa**: `streaming_profile: "hd"` solo válido para formatos HLS/DASH, no para MP4 directo
- [x] **Fix**: Eliminado bloque `eager` completo — Cloudinary almacena el video original directamente

### 🐛 SUPER BUG — Update APPEND + JSON.parse (commit `6173bfa`)
- [x] **Bug 1**: `keepImages`/`keepVideos` eran strings JSON asignados sin parsear → Mongoose guardaba `['["url1"]']` como un solo elemento
- [x] **Bug 2**: Nuevos files REEMPLAZABAN existentes en vez de APPEND → pérdida de datos
- [x] **Bug 3**: Se borraban TODOS los archivos de Cloudinary al editar → solo deben borrarse los que el usuario quitó
- [x] **Fix**: `JSON.parse(keepImages)` + APPEND merge + delete solo los removidos

### ✅ FASE 5 — Post-Flight + Cierre (COMPLETADO)
- [x] Auto-maintenance — Sin cambios requeridos (mismos patrones existentes)
- [x] Build Client — 0 errores
- [x] Build Server — 16 tests PASS
- [x] Bitácora → COMPLETADO
- [x] Limpiar actual.md
- [ ] PR a dev

---

## ⚠️ NOTAS DE MEMORIA
- *Regla:* Multer `.fields()` cambia `req.files` de array a objeto con `req.files.images` y `req.files.videos`
- *Regla:* Cloudinary `upload_large` es obligatorio para videos > 10MB (usa chunk_size 6MB)
- *Regla:* Atributo `playsInline` es crítico para reproducción en iOS/Safari
- *Regla:* Estado `isUploading` deshabilita botón submit y evita doble envío
- *Regla:* `keepVideos` es string JSON en FormData, igual que `keepImages`
- *Branch:* `feat/027-videos-en-bitacoras`
- *Commits:* `38bdff0` (F1 backend), `6c9b541` (F2 form), `c0ba0db` (F3 detail), `01a051f` (F4 HR), `0181139` (hotfix upload), `8a4702e` (hotfix eager), `6173bfa` (super bug append+parse)
