import multer from "multer"

// ── Configuración de multer para imágenes y videos de bitácora ──
const storage = multer.memoryStorage()

const uploadBitacoraMiddleware = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB global (necesario para videos)
    },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === "images") {
            if (!file.mimetype.startsWith("image/")) {
                return cb(new Error("Solo se permiten archivos de imagen"), false)
            }
        } else if (file.fieldname === "videos") {
            if (!file.mimetype.startsWith("video/")) {
                return cb(new Error("Solo se permiten archivos de video"), false)
            }
        } else {
            return cb(new Error("Campo de archivo desconocido"), false)
        }
        cb(null, true)
    }
}).fields([
    { name: "images", maxCount: 5 },
    { name: "videos", maxCount: 3 }
])

export { uploadBitacoraMiddleware }
