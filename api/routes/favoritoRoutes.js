import express from "express";
import { listarFavoritos, agregarFavorito, eliminarFavorito } from "../controllers/favoritoController.js";

const router = express.Router();

// Listar todos los favoritos de un usuario
router.get("/:usuarioId", listarFavoritos);

// Agregar un producto a favoritos
router.post("/", agregarFavorito);

// Eliminar un producto de favoritos
router.delete("/:favoritoId", eliminarFavorito);

export default router;
