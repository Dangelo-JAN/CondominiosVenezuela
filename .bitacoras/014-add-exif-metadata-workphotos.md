# 🛠️ TAREA: Extraer Metadata EXIF de Fotos (Fecha Captura + GPS)
**ID:** #014 | **Estado:** ✅ COMPLETADO (Bug en fecha timezone) | **Fecha:** 2026-05-09

---

## 🎯 OBJETIVO FINAL
> Extraer la fecha de captura real (`GPSDateStamp`) y GPS de las fotos de trabajo usando Cloudinary `exif: true`. Si no hay EXIF, rechazar el upload.

---

## 🚦 PUNTO DE CONTROL (Contexto de Reanudación)

### Estado Actual: Bug de Fecha Persistiendo ⚠️

**Lo último que funcionó:**
- EXIF se extrae correctamente ✅
- GPS coordinates se extraen correctamente ✅
- La foto se sube exitosamente ✅

**Bug Actual - Fecha Muestra 1 Día Antes:**
- Se usa `GPSDateStamp` para la fecha de captura
- La fecha mostrada es 1 día anterior a la seleccionada por el empleado
- Ejemplo: empleado selecciona "2026-05-08", muestra "2026-05-07"

**Último commit:** `e4e905c` - fix syntax error (duplicate code block)
**Logs actuales:**
```
[DEBUG] Fecha captura: usando GPSDateStamp: 08/05/2026
captureDate: 2026-05-08T12:00:00.000Z  ← UTC time
```

### Hipótesis del Bug:
El problema es que `new Date("2026-05-08T12:00:00")` se interpreta como **UTC midnight + 12h = UTC 12:00**.
Cuando se muestra en la UI (timezone local Venezuela -04:00), se convierte restando 4 horas → Queda como día anterior.

**Posible Solución Pending:**
Usar el timezone local explícitamente:
```javascript
captureDate = new Date(`${dateFormatted}T12:00:00`)
// debe convertirse a:
// captureDate = new Date(`${dateFormatted}T12:00:00-04:00`)
// o usar:
// captureDate = new Date(`${dateFormatted}T12:00:00`).toLocaleDateString("es-ES")
```

---

## 📝 HISTORIAL DE COMMITS

| Commit | Descripción |
|:-------|:------------|
| `4674383` | feat(workphotos): extract EXIF metadata - DateTimeOriginal and GPS |
| `469426a` | fix(workphotos): add exif:true + debug logging for EXIF extraction |
| `48f423f` | fix(workphotos): simplify to exif:true only + improve error logging |
| `5406746` | fix(workphotos): fallback to Cloudinary API when EXIF is empty |
| `53a643d` | fix(workphotos): add detailed EXIF logging to see what's in API response |
| `7c11a30` | fix(workphotos): change upload to multipart/form-data with multer to preserve EXIF |
| `afd89d3` | fix(workphotos): remove invalid raw_convert parameter that was causing 400 error |
| `598fdf4` | fix(workphotos): implement priority hierarchy for capture date extraction |
| `128e9dd` | fix(workphotos): use only GPSDateStamp for capture date to avoid timezone issues |
| `e4e905c` | fix(workphotos): remove duplicate code block that was causing syntax error |

---

## 📝 CAMBIOS TÉCNICOS IMPLEMENTADOS

- [x] [Modelo: agregar campos captureDate y gpsLocation]
- [x] [Controller: multipart/form-data con multer para preservar EXIF]
- [x] [Controller: extraer GPS coordinates (lat/lng)]
- [x] [Controller: fallback a Cloudinary API resource cuando EXIF vacío]
- [x] [Controller: jerarquía de fecha GPSDateStamp > DateTimeOriginal > DateTime]
- [x] [Controller: fix syntax error duplicate code block]
- [ ] [BUG: La fecha muestra 1 día antes - necesita fix de timezone]

---

## ⚠️ NOTAS DE MEMORIA PARA CONTINUAR MAÑANA

- *Regla:* Mantener compatibilidad hacia atrás - no romper funcionalidad existente
- *Regla:* Usar `GPSDateStamp` como fuente principal de fecha (requerimiento del usuario)
- *Branch:* `feature/add-exif-metadata-workphotos`
- *PR:* #7 hacia dev (actualizándose constantemente)
- *Problema timezone:* JS Date interpret "YYYY-MM-DDTHH:MM:SS" como UTC, no local
- *Solución pendiente:* Agregar timezone offset en la fecha guardada: `2026-05-08T12:00:00-04:00`
- *Investigación pendiente:* Ver cómo el frontend muestra la fecha `captureDate`

---

## 🔜 PRÓXIMO PASO PARA CONTINUAR MAÑANA

1. Investigar cómo el frontend muestra la fecha `captureDate`
2. Modificar el parsing para evitar conversión UTC que causa desfase de 1 día
3. Opcional: incluir timezone offset en la fecha guardada: `2026-05-08T12:00:00-04:00`
4. Probar con foto del celular y verificar fecha correcta en la UI

---

*Actualizado: 2026-05-09 00:08*
*Estado: 🟡 EN CURSO - Bug de fecha timezone persiste*
*NO COMPLETADA - Esperando fix de timezone*