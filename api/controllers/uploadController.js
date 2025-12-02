import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const subirImagen = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se envió archivo" });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "agroinsumos/imagenes", // carpeta opcional
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary error:", error);
          return res.status(500).json({ error: "Error subiendo imagen" });
        }

        return res.json({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    // Convertir Buffer → Stream
    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);

  } catch (err) {
    console.error("Error servidor:", err);
    res.status(500).json({ error: "Error interno" });
  }
};
