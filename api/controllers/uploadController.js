// api/controllers/uploadController.js

import multer from "multer";
import path from "path";

// Configuración del storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "imgs"); 
    },
    filename: (req, file, cb) => {
        const nombre = Date.now() + path.extname(file.originalname);
        cb(null, nombre);
    }
});

export const upload = multer({ storage });

export const subirImagen = (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            error: "No se envió ningún archivo"
        });
    }

    res.json({
        mensaje: "Imagen guardada correctamente",
        ruta: "/imgs/" + req.file.filename
    });
};
