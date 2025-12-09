// api/routes/venta_routes.js
import express from "express";
import Venta from "../models/Venta.js";

const router = express.Router();

/**
 * GET /ventas
 * Regresa la lista de ventas guardadas en la BD
 */
router.get("/", async (req, res) => {
  try {
    // Si quieres también puedes hacer populate del usuario:
    // const ventas = await Venta.find()
    //   .populate("usuarioId", "nombre_usuario correo")
    //   .sort({ createdAt: -1 });

    const ventas = await Venta.find().sort({ createdAt: -1 });

    return res.json(ventas);
  } catch (error) {
    console.error("❌ Error al listar ventas:", error);
    return res.status(500).json({
      message: "Error al listar ventas",
      error: error.message,
    });
  }
});

export default router;
