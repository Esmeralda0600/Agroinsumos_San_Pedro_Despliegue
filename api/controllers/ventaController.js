import Venta from "../models/Venta.js";

export const listarVentas = async (req, res) => {
  try {
    const ventas = await Venta.find()
      .populate("usuarioId", "nombre correo") // si quieres datos del usuario
      .sort({ createdAt: -1 });

    res.json(ventas);
  } catch (err) {
    console.error("Error listando ventas:", err);
    res.status(500).json({ message: "Error al listar ventas" });
  }
};
