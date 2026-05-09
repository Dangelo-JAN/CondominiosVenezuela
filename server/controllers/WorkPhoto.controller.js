import { WorkPhoto } from "../models/WorkPhoto.model.js"
import { Employee } from "../models/Employee.model.js"
import { v2 as cloudinary } from "cloudinary"
import dayjs from "dayjs"

// Configurar Cloudinary (requiere CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET en .env)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// ── Employee: Subir foto de trabajo ──────────────────────────────────────
export const HandleUploadWorkPhoto = async (req, res) => {
    try {
        // Aceptar archivo de multer (multipart/form-data) O base64 (JSON)
        let photoData = null
        if (req.file) {
            // multipart/form-data: usar buffer del archivo
            photoData = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`
            console.log("[DEBUG] Usando archivo de multer, mimetype:", req.file.mimetype, "size:", req.file.size)
        } else if (req.body.photo) {
            // JSON con base64
            photoData = req.body.photo
            console.log("[DEBUG] Usando base64 del body")
        }

        const { description, workdate, timezone } = req.body

        // DEBUG: Log timezone recibidos
        console.log("[DEBUG] workdate recibido:", workdate)
        console.log("[DEBUG] timezone recibido:", timezone)

        if (!photoData || !workdate) {
            return res.status(400).json({ success: false, message: "La foto y la fecha son requeridas" })
        }

        const employee = await Employee.findOne({ _id: req.EMPID, organizationID: req.ORGID })

        if (!employee) {
            return res.status(404).json({ success: false, message: "Empleado no encontrado" })
        }

        // Subir imagen a Cloudinary con extracción de metadata EXIF
        // Envío archivo RAW (multipart/form-data) para preservar EXIF original
        const uploadResult = await cloudinary.uploader.upload(photoData, {
            folder: `ems/${req.ORGID}/workphotos/${req.EMPID}`,
            resource_type: "image",
            exif: true
        })

        console.log("[DEBUG] Upload realizado, public_id:", uploadResult.public_id)

        // ── DEBUG: Log de respuesta de Cloudinary para diagnosis ──
        console.log("[DEBUG] Cloudinary uploadResult keys:", Object.keys(uploadResult))
        console.log("[DEBUG] Has exif:", !!uploadResult.exif)
        console.log("[DEBUG] Has image_metadata:", !!uploadResult.image_metadata)
        if (uploadResult.exif) {
            console.log("[DEBUG] exif keys:", Object.keys(uploadResult.exif))
            console.log("[DEBUG] exif.DateTimeOriginal:", uploadResult.exif.DateTimeOriginal)
            console.log("[DEBUG] exif.GPSLatitude:", uploadResult.exif.GPSLatitude)
            console.log("[DEBUG] exif.GPSLongitude:", uploadResult.exif.GPSLongitude)
        }

        // ── Extraer metadata EXIF (Fecha de captura + GPS) ──
        // Nota: Cuando el frontend envía base64, el EXIF puede perderse durante la recodificación.
        // Por eso intentamos obtener los metadatos directamente desde Cloudinary usando la API de recursos.
        let exifData = uploadResult.exif || {}

        // Si el objeto EXIF está vacío, intentamos obtenerlo desde la API de recursos de Cloudinary
        if (!uploadResult.exif || Object.keys(uploadResult.exif || {}).length === 0) {
            try {
                console.log("[DEBUG] EXIF vacío en upload, consultando API de recursos de Cloudinary...")
                const resourceDetails = await cloudinary.api.resource(uploadResult.public_id, {
                    exif: true,
                    image_metadata: true
                })
                console.log("[DEBUG] Recurso desde API - exif:", !!resourceDetails.exif)
                console.log("[DEBUG] Recurso desde API - exif keys:", resourceDetails.exif ? Object.keys(resourceDetails.exif) : [])
                console.log("[DEBUG] Recurso desde API - image_metadata:", !!resourceDetails.image_metadata)
                console.log("[DEBUG] Recurso desde API - image_metadata keys:", resourceDetails.image_metadata ? Object.keys(resourceDetails.image_metadata) : [])
                
                // Mostrar todos los valores del EXIF para diagnosis
                if (resourceDetails.exif && Object.keys(resourceDetails.exif).length > 0) {
                    console.log("[DEBUG] EXIF completo desde API:", JSON.stringify(resourceDetails.exif))
                }
                
                // Mostrar todos los valores de image_metadata para diagnosis
                if (resourceDetails.image_metadata && Object.keys(resourceDetails.image_metadata).length > 0) {
                    console.log("[DEBUG] image_metadata completo desde API:", JSON.stringify(resourceDetails.image_metadata))
                }
                
                if (resourceDetails.exif && Object.keys(resourceDetails.exif).length > 0) {
                    exifData = resourceDetails.exif
                    console.log("[DEBUG] EXIF obtenido desde API, keys:", Object.keys(resourceDetails.exif))
                }
                if (resourceDetails.image_metadata && Object.keys(resourceDetails.image_metadata).length > 0) {
                    exifData = { ...exifData, ...resourceDetails.image_metadata }
                }
            } catch (apiError) {
                console.error("[ERROR] Falló consulta a API de recursos:", apiError.message)
            }
        }

// ── Extraer fecha de captura ──
        // PRIORIDAD (según requerimiento):
        // 1. GPSDateStamp (fecha del GPS) - MODO ACTUAL
        // 2. DateTimeOriginal (si existe en otros dispositivos)
        // 3. DateTime (fallback)
        // FALLBACK: Rechazar si ninguno existe

        let captureDate = null

        // 1. PRIORIDAD: GPSDateStamp (solo fecha, sin hora)
        // El GPSDateStamp viene como "YYYY:MM:DD" y está en hora local
        if (exifData.GPSDateStamp) {
            const gpsDateStr = exifData.GPSDateStamp // "2026:05:08"
            const dateFormatted = gpsDateStr.replace(/^(\d{4}):(\d{2}):(\d{2})$/, "$1-$2-$3")
            // Usar hora fija 12:00:00 para evitar problemas de conversión UTC
            captureDate = new Date(`${dateFormatted}T12:00:00`)
            console.log("[DEBUG] Fecha captura: usando GPSDateStamp:", captureDate.toLocaleDateString("es-ES"))
        }
        // 2. SEGUNDA: DateTimeOriginal
        else if (exifData.DateTimeOriginal) {
            const dateParts = exifData.DateTimeOriginal.split(" ")
            const dateStr = dateParts[0].replace(/^(\d{4}):(\d{2}):(\d{2})$/, "$1-$2-$3")
            const timeStr = dateParts[1] || "12:00:00"
            captureDate = new Date(`${dateStr}T${timeStr}`)
            console.log("[DEBUG] Fecha captura: usando DateTimeOriginal:", captureDate.toLocaleDateString("es-ES"))
        }
        // 3. TERCERA: DateTime
        else if (exifData.DateTime) {
            const dateParts = exifData.DateTime.split(" ")
            const dateStr = dateParts[0].replace(/^(\d{4}):(\d{2}):(\d{2})$/, "$1-$2-$3")
            const timeStr = dateParts[1] || "12:00:00"
            captureDate = new Date(`${dateStr}T${timeStr}`)
            console.log("[DEBUG] Fecha captura: usando DateTime:", captureDate.toLocaleDateString("es-ES"))
}
        // 4. VALIDAR: captureDate es obligatorio
        if (!captureDate || isNaN(captureDate.getTime())) {
            console.error("[ERROR] No se pudo extraer fecha de captura. exifData keys:", Object.keys(exifData))
            return res.status(400).json({
                success: false,
                message: "La foto debe contener metadata de fecha de captura. Evita fotos de WhatsApp, Telegram, capturas de pantalla o fotos editadas."
            })
        }

        // ── Extraer GPS (Solo si existe) ──
        let gpsLocation = null
        if (exifData.GPSLatitude && exifData.GPSLongitude) {
            // Convertir coordenadas GPS de formato EXIF a decimal
            const lat = parseGPSCoordinate(exifData.GPSLatitude)
            const lng = parseGPSCoordinate(exifData.GPSLongitude)
            
            // Verificar que son coordenadas válidas
            if (lat !== null && lng !== null) {
                gpsLocation = { lat, lng }
            }
        }

        // Helper: Parsear coordenadas GPS desde formato EXIF a decimal
        function parseGPSCoordinate(coord) {
            if (!coord) return null
            // Formato EXIF: "DDD/MMM, MMM/MMM, 0/1"
            try {
                const parts = coord.split(",").map(p => p.trim())
                if (parts.length >= 2) {
                    const degrees = evalFraction(parts[0])
                    const minutes = evalFraction(parts[1])
                    const degreesDec = degrees + (minutes / 60)
                    return parts.length >= 3 && parts[2].includes("-") 
                        ? -degreesDec 
                        : degreesDec
                }
            } catch {
                return null
            }
            return null
        }

        function evalFraction(str) {
            const fraction = str.split("/")
            return fraction.length === 2 
                ? parseFloat(fraction[0]) / parseFloat(fraction[1]) 
                : parseFloat(str)
        }

        // ── Helper: Normalizar fecha según timezone del navegador ──
        // El problema: new Date("2026-05-08") parsea como UTC midnight
        // Solución: crear la fecha en hora local (12:00) para evitar timezone shift
        const normalizeDate = (dateStr, userTimezone) => {
            // Si tenemos timezone del usuario, usarlo; si no, asumir hora local
            // Al agregar T12:00:00, evitamos que UTC midnight caiga en día anterior
            const dateWithTime = `${dateStr}T12:00:00`
            const date = new Date(dateWithTime)
            console.log("[DEBUG] Fecha normalizada:", date.toISOString(), "from input:", dateStr)
            return date
        }

        const normalizedWorkDate = normalizeDate(workdate, timezone)

        const newPhoto = await WorkPhoto.create({
            employee: req.EMPID,
            photourl: uploadResult.secure_url,
            publicid: uploadResult.public_id,
            description: description || null,
            workdate: normalizedWorkDate,
            captureDate: captureDate,
            gpsLocation: gpsLocation,
            organizationID: req.ORGID
        })

        return res.status(201).json({
            success: true,
            message: "Foto subida exitosamente",
            data: newPhoto
        })

    } catch (error) {
        console.error("[ERROR] HandleUploadWorkPhoto:", error.message || error)
        console.error("[ERROR] Cloudinary error details:", error.error || error)
        return res.status(500).json({ 
            success: false, 
            message: error.message || "Internal Server Error",
            error: error.toString()
        })
    }
}

// ── Employee: Obtener mis fotos ───────────────────────────────────────────
export const HandleGetMyWorkPhotos = async (req, res) => {
    try {
        const photos = await WorkPhoto.find({
            employee: req.EMPID,
            organizationID: req.ORGID
        }).sort({ workdate: -1 })

        return res.status(200).json({
            success: true,
            message: "Fotos obtenidas exitosamente",
            data: photos
        })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

// ── Employee: Eliminar una foto propia ────────────────────────────────────
export const HandleDeleteMyWorkPhoto = async (req, res) => {
    try {
        const { photoID } = req.params

        const photo = await WorkPhoto.findOne({
            _id: photoID,
            employee: req.EMPID,
            organizationID: req.ORGID
        })

        if (!photo) {
            return res.status(404).json({ success: false, message: "Foto no encontrada" })
        }

        // Eliminar de Cloudinary
        await cloudinary.uploader.destroy(photo.publicid)

        await photo.deleteOne()

        return res.status(200).json({
            success: true,
            message: "Foto eliminada exitosamente"
        })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

// ── HR: Ver todas las fotos de la organización ────────────────────────────
export const HandleGetAllWorkPhotos = async (req, res) => {
    try {
        const photos = await WorkPhoto.find({ organizationID: req.ORGID })
            .populate("employee", "firstname lastname department")
            .populate("reviewedby", "firstname lastname")
            .sort({ workdate: -1 })

        return res.status(200).json({
            success: true,
            message: "Fotos obtenidas exitosamente",
            data: photos
        })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

// ── HR: Ver fotos de un empleado específico ───────────────────────────────
export const HandleGetEmployeeWorkPhotos = async (req, res) => {
    try {
        const { employeeID } = req.params

        const photos = await WorkPhoto.find({
            employee: employeeID,
            organizationID: req.ORGID
        })
            .populate("employee", "firstname lastname department")
            .sort({ workdate: -1 })

        return res.status(200).json({
            success: true,
            message: "Fotos del empleado obtenidas exitosamente",
            data: photos
        })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

// ── HR: Marcar foto como revisada ─────────────────────────────────────────
export const HandleReviewWorkPhoto = async (req, res) => {
    try {
        const { photoID } = req.body

        if (!photoID) {
            return res.status(400).json({ success: false, message: "photoID es requerido" })
        }

        const photo = await WorkPhoto.findOne({
            _id: photoID,
            organizationID: req.ORGID
        })

        if (!photo) {
            return res.status(404).json({ success: false, message: "Foto no encontrada" })
        }

        photo.reviewedby = req.HRid
        photo.reviewedat = new Date()

        await photo.save()

        return res.status(200).json({
            success: true,
            message: "Foto marcada como revisada",
            data: photo
        })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

// ── HR: Eliminar foto de cualquier empleado ───────────────────────────────
export const HandleDeleteWorkPhoto = async (req, res) => {
    try {
        const { photoID } = req.params

        const photo = await WorkPhoto.findOne({
            _id: photoID,
            organizationID: req.ORGID
        })

        if (!photo) {
            return res.status(404).json({ success: false, message: "Foto no encontrada" })
        }

        await cloudinary.uploader.destroy(photo.publicid)
        await photo.deleteOne()

        return res.status(200).json({
            success: true,
            message: "Foto eliminada exitosamente"
        })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}
