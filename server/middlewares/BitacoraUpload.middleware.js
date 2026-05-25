import multer from "multer"

// ── Configuración de multer para imágenes de bitácora ──
const storage = multer.memoryStorage()

// Filtro: solo imágenes
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true)
    } else {
        cb(new Error("Solo se permiten archivos de imagen"), false)
    }
}

export const uploadBitacoraMiddleware = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB por imagen
        files: 5 // Máximo 5 imágenes
    }
})
