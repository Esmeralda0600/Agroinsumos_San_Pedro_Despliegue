import express from "express";
import {
    listarFavoritos,
    agregarFavorito,
    eliminarFavorito
} from "../controllers/favoritoController.js";

const router = express.Router();

/*
==================================================
 FAVORITOS - RUTAS
==================================================
*/

// Listar todos los favoritos de un usuario
// GET /favoritos/:usuarioId
router.get("/:usuarioId", listarFavoritos);

// Agregar un producto a favoritos
// POST /favoritos
router.post("/", agregarFavorito);

// Eliminar un producto de favoritos
// DELETE /favoritos/:favoritoId
router.delete("/:favoritoId", eliminarFavorito);

export default router;
