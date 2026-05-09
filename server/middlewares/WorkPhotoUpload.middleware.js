import multer from "multer"

// ── Configuración de multer para fotos de trabajo ──
const storage = multer.memoryStorage() // Guardar en memoria para procesar

// Filtro: solo imágenes
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true)
    } else {
        cb(new Error("Solo se permiten archivos de imagen"), false)
    }
}

export const uploadWorkPhotoMiddleware = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max
    }
})