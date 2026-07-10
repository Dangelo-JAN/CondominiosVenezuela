import { Bitacora } from "../models/Bitacora.model.js"
import { Employee } from "../models/Employee.model.js"
import { HumanResources } from "../models/HR.model.js"
import { Notification } from "../models/Notification.model.js"
import { sendPushToAll } from "../services/fcm.service.js"
import { v2 as cloudinary } from "cloudinary"

// Configurar Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// ── Helper: Subir imágenes a Cloudinary ────────────────────────────────────
const uploadImagesToCloudinary = async (files, orgID, empID) => {
    if (!files || files.length === 0) return []

    const uploadPromises = files.map((file) => {
        const photoData = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`
        return cloudinary.uploader.upload(photoData, {
            folder: `ems/${orgID}/bitacoras/${empID}`,
            resource_type: "image"
        })
    })

    const results = await Promise.all(uploadPromises)
    return results.map((r) => r.secure_url)
}

// ── Helper: Eliminar imágenes de Cloudinary ────────────────────────────────
const deleteImagesFromCloudinary = async (imageUrls) => {
    if (!imageUrls || imageUrls.length === 0) return

    const deletePromises = imageUrls.map((url) => {
        // Extraer public_id de la URL de Cloudinary
        const parts = url.split("/")
        const filename = parts[parts.length - 1]
        const publicId = filename.split(".")[0]
        // Reconstruir el public_id con la ruta de la carpeta
        const folderMatch = url.match(/\/v\d+\/(.+)\.\w+$/)
        if (folderMatch) {
            return cloudinary.uploader.destroy(folderMatch[1])
        }
        return Promise.resolve()
    })

    await Promise.all(deletePromises)
}

// ── Helper: Subir videos a Cloudinary ───────────────────────────────────────
const uploadVideosToCloudinary = async (files, orgID, empID) => {
    if (!files || files.length === 0) return []

    const uploadPromises = files.map((file) => {
        const videoData = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`
        return cloudinary.uploader.upload(videoData, {
            resource_type: "video",
            folder: `ems/${orgID}/bitacoras/${empID}/videos`
        })
    })

    const results = await Promise.all(uploadPromises)
    return results.map((r) => r.secure_url)
}

// ── Helper: Eliminar videos de Cloudinary ──────────────────────────────────
const deleteVideosFromCloudinary = async (videoUrls) => {
    if (!videoUrls || videoUrls.length === 0) return

    const deletePromises = videoUrls.map((url) => {
        const folderMatch = url.match(/\/v\d+\/(.+)\.\w+$/)
        if (folderMatch) {
            return cloudinary.uploader.destroy(folderMatch[1], {
                resource_type: "video"
            })
        }
        return Promise.resolve()
    })

    await Promise.all(deletePromises)
}

// ── Helper: Crear notificaciones para todos los HR ─────────────────────────
const notifyAllHRs = async (orgID, bitacora, employeeName) => {
    try {
        const allHRs = await HumanResources.find({
            organizationID: orgID,
            isactive: true,
            isDeleted: { $ne: true }
        }).select("_id")

        if (allHRs.length === 0) return

        const notifications = allHRs.map((hr) => ({
            recipient: hr._id,
            type: "bitacora_created",
            title: "Nueva Bitácora",
            message: `${employeeName} ha creado una nueva novedad: "${bitacora.title}"`,
            relatedTo: bitacora._id,
            onModel: "Bitacora",
            organizationID: orgID
        }))

        await Notification.insertMany(notifications)

        // También enviar push notification FCM
        const pushTitle = "Nueva Bitácora"
        const pushBody = `${employeeName} ha creado una nueva novedad: "${bitacora.title}"`
        await sendPushToAll(orgID, pushTitle, pushBody, {
            type: "bitacora_created",
            bitacoraId: String(bitacora._id),
            url: "/HR/dashboard/bitacoras",
        })
    } catch (error) {
        console.error("[ERROR] notifyAllHRs:", error.message)
        // No lanzar el error — la notificación no debe romper la creación
    }
}


// ============ RUTAS EMPLEADO ============

// Crear bitácora (empleado)
export const HandleCreateBitacora = async (req, res) => {
    try {
        const { title, content } = req.body

        if (!title || !title.trim()) {
            return res.status(400).json({ success: false, message: "El título es requerido" })
        }
        if (!content || !content.trim()) {
            return res.status(400).json({ success: false, message: "El contenido es requerido" })
        }

        const employee = await Employee.findOne({ _id: req.EMPID, organizationID: req.ORGID })
        if (!employee) {
            return res.status(404).json({ success: false, message: "Empleado no encontrado" })
        }

        // Subir imágenes si existen
        let imageUrls = []
        if (req.files?.images?.length > 0) {
            imageUrls = await uploadImagesToCloudinary(req.files.images, req.ORGID, req.EMPID)
        }

        // Subir videos si existen
        let videoUrls = []
        if (req.files?.videos?.length > 0) {
            videoUrls = await uploadVideosToCloudinary(req.files.videos, req.ORGID, req.EMPID)
        }

        const bitacora = await Bitacora.create({
            title: title.trim(),
            content: content.trim(),
            images: imageUrls,
            videos: videoUrls,
            employee: req.EMPID,
            organizationID: req.ORGID
        })

        // Notificar a todos los HR de la organización
        const employeeName = `${employee.firstname} ${employee.lastname}`
        await notifyAllHRs(req.ORGID, bitacora, employeeName)

        // Poblar el empleado para la respuesta
        const populated = await Bitacora.findById(bitacora._id)
            .populate("employee", "firstname lastname department")

        return res.status(201).json({
            success: true,
            message: "Bitácora creada exitosamente",
            data: populated
        })

    } catch (error) {
        console.error("[ERROR] HandleCreateBitacora:", error.message)
        return res.status(500).json({ success: false, message: error.message })
    }
}

// Actualizar bitácora propia (empleado)
export const HandleUpdateBitacora = async (req, res) => {
    try {
        const { id } = req.params
        const { title, content, keepImages, keepVideos } = req.body

        const bitacora = await Bitacora.findOne({
            _id: id,
            employee: req.EMPID,
            organizationID: req.ORGID,
            isDeleted: false
        })

        if (!bitacora) {
            return res.status(404).json({ success: false, message: "Bitácora no encontrada" })
        }

        // Actualizar campos de texto si vienen
        if (title !== undefined) {
            if (!title.trim()) {
                return res.status(400).json({ success: false, message: "El título no puede estar vacío" })
            }
            bitacora.title = title.trim()
        }
        if (content !== undefined) {
            if (!content.trim()) {
                return res.status(400).json({ success: false, message: "El contenido no puede estar vacío" })
            }
            bitacora.content = content.trim()
        }

        // ── Parsear keepImages/keepVideos de JSON string a Array ──────────
        let parsedKeepImages, parsedKeepVideos
        try {
            if (keepImages !== undefined) parsedKeepImages = JSON.parse(keepImages)
            if (keepVideos !== undefined) parsedKeepVideos = JSON.parse(keepVideos)
        } catch (e) {
            // Si falla el parseo, tratar como no definido
        }

        // ── Manejo de imágenes: APPEND si hay nuevas, o solo keep ────────
        const currentImages = bitacora.images || []

        if (req.files?.images?.length > 0) {
            // Subir nuevas imágenes a Cloudinary
            const newImageUrls = await uploadImagesToCloudinary(req.files.images, req.ORGID, req.EMPID)

            if (parsedKeepImages !== undefined) {
                // Solo eliminar de Cloudinary las que el usuario quitó (no están en keepImages)
                const removedImages = currentImages.filter(url => !parsedKeepImages.includes(url))
                if (removedImages.length > 0) await deleteImagesFromCloudinary(removedImages)
                // APPEND: mantener las que sobreviven + nuevas
                bitacora.images = [...parsedKeepImages, ...newImageUrls]
            } else {
                // Sin keepImages: reemplazar todo (las nuevas son el único contenido)
                await deleteImagesFromCloudinary(currentImages)
                bitacora.images = newImageUrls
            }
        } else if (parsedKeepImages !== undefined) {
            // No hay imágenes nuevas, solo se actualizó la lista de existentes
            const removedImages = currentImages.filter(url => !parsedKeepImages.includes(url))
            if (removedImages.length > 0) await deleteImagesFromCloudinary(removedImages)
            bitacora.images = parsedKeepImages
        }

        // ── Manejo de videos: APPEND si hay nuevos, o solo keep ──────────
        const currentVideos = bitacora.videos || []

        if (req.files?.videos?.length > 0) {
            // Subir nuevos videos a Cloudinary
            const newVideoUrls = await uploadVideosToCloudinary(req.files.videos, req.ORGID, req.EMPID)

            if (parsedKeepVideos !== undefined) {
                // Solo eliminar de Cloudinary los que el usuario quitó
                const removedVideos = currentVideos.filter(url => !parsedKeepVideos.includes(url))
                if (removedVideos.length > 0) await deleteVideosFromCloudinary(removedVideos)
                // APPEND: mantener los que sobreviven + nuevos
                bitacora.videos = [...parsedKeepVideos, ...newVideoUrls]
            } else {
                // Sin keepVideos: reemplazar todo
                await deleteVideosFromCloudinary(currentVideos)
                bitacora.videos = newVideoUrls
            }
        } else if (parsedKeepVideos !== undefined) {
            // No hay videos nuevos, solo se actualizó la lista de existentes
            const removedVideos = currentVideos.filter(url => !parsedKeepVideos.includes(url))
            if (removedVideos.length > 0) await deleteVideosFromCloudinary(removedVideos)
            bitacora.videos = parsedKeepVideos
        }

        await bitacora.save()

        const populated = await Bitacora.findById(bitacora._id)
            .populate("employee", "firstname lastname department")

        return res.status(200).json({
            success: true,
            message: "Bitácora actualizada exitosamente",
            data: populated
        })

    } catch (error) {
        console.error("[ERROR] HandleUpdateBitacora:", error.message)
        return res.status(500).json({ success: false, message: error.message })
    }
}

// Obtener mis bitácoras (empleado)
export const HandleGetMyBitacoras = async (req, res) => {
    try {
        const bitacoras = await Bitacora.find({
            employee: req.EMPID,
            organizationID: req.ORGID,
            isDeleted: false
        })
            .populate("employee", "firstname lastname department")
            .sort({ createdAt: -1 })

        // Headers anti-caché
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate')
        res.set('Pragma', 'no-cache')
        res.set('Expires', '0')

        return res.status(200).json({
            success: true,
            message: "Bitácoras recuperadas exitosamente",
            data: bitacoras
        })

    } catch (error) {
        console.error("[ERROR] HandleGetMyBitacoras:", error.message)
        return res.status(500).json({ success: false, message: error.message })
    }
}


// ============ RUTAS HR ============

// Obtener todas las bitácoras (HR)
export const HandleGetAllBitacoras = async (req, res) => {
    try {
        const { employee: employeeFilter, startDate, endDate } = req.query

        const filter = {
            organizationID: req.ORGID,
            isDeleted: false
        }

        // Filtro por empleado
        if (employeeFilter) {
            filter.employee = employeeFilter
        }

        // Filtro por rango de fechas
        if (startDate || endDate) {
            filter.createdAt = {}
            if (startDate) filter.createdAt.$gte = new Date(startDate)
            if (endDate) {
                const end = new Date(endDate)
                end.setHours(23, 59, 59, 999)
                filter.createdAt.$lte = end
            }
        }

        const bitacoras = await Bitacora.find(filter)
            .populate("employee", "firstname lastname department email")
            .sort({ createdAt: -1 })

        // Headers anti-caché
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate')
        res.set('Pragma', 'no-cache')
        res.set('Expires', '0')

        return res.status(200).json({
            success: true,
            message: "Bitácoras recuperadas exitosamente",
            data: bitacoras
        })

    } catch (error) {
        console.error("[ERROR] HandleGetAllBitacoras:", error.message)
        return res.status(500).json({ success: false, message: error.message })
    }
}

// Obtener una bitácora por ID (HR)
export const HandleGetBitacoraById = async (req, res) => {
    try {
        const { id } = req.params

        const bitacora = await Bitacora.findOne({
            _id: id,
            organizationID: req.ORGID,
            isDeleted: false
        }).populate("employee", "firstname lastname department email")

        if (!bitacora) {
            return res.status(404).json({ success: false, message: "Bitácora no encontrada" })
        }

        return res.status(200).json({
            success: true,
            message: "Bitácora recuperada exitosamente",
            data: bitacora
        })

    } catch (error) {
        console.error("[ERROR] HandleGetBitacoraById:", error.message)
        return res.status(500).json({ success: false, message: error.message })
    }
}

// Eliminar bitácora (HR - soft delete)
export const HandleDeleteBitacora = async (req, res) => {
    try {
        const { id } = req.params

        const bitacora = await Bitacora.findOne({
            _id: id,
            organizationID: req.ORGID,
            isDeleted: false
        })

        if (!bitacora) {
            return res.status(404).json({ success: false, message: "Bitácora no encontrada" })
        }

        // Soft-delete
        bitacora.isDeleted = true
        bitacora.deletedAt = new Date()
        await bitacora.save()

        return res.status(200).json({
            success: true,
            message: "Bitácora eliminada exitosamente"
        })

    } catch (error) {
        console.error("[ERROR] HandleDeleteBitacora:", error.message)
        return res.status(500).json({ success: false, message: error.message })
    }
}
