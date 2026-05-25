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
        if (req.files && req.files.length > 0) {
            imageUrls = await uploadImagesToCloudinary(req.files, req.ORGID, req.EMPID)
        }

        const bitacora = await Bitacora.create({
            title: title.trim(),
            content: content.trim(),
            images: imageUrls,
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
        const { title, content, keepImages } = req.body

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

        // Manejo de imágenes: si se envían nuevas, reemplazar
        if (req.files && req.files.length > 0) {
            // Eliminar imágenes antiguas de Cloudinary
            await deleteImagesFromCloudinary(bitacora.images)

            // Subir nuevas imágenes
            const newImageUrls = await uploadImagesToCloudinary(req.files, req.ORGID, req.EMPID)
            bitacora.images = newImageUrls
        } else if (keepImages !== undefined) {
            // Si keepImages es un array, usarlo como la nueva lista de imágenes
            // (útil si el empleado eliminó algunas imágenes sin subir nuevas)
            bitacora.images = keepImages
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
