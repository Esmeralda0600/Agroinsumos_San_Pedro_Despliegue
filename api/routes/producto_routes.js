import express from "express";
import { crearProducto,
    mostrarInventario,
    buscarProductoPorNombre,
    eliminarProducto,
    obtenerProductoPorId,
    actualizarProducto } from "../controllers/productoControllers.js";

const router = express.Router();

// POST /productos → crear un nuevo producto
router.post("/", crearProducto);
router.get("/inventario",mostrarInventario);
router.get("/buscar", buscarProductoPorNombre);
router.get("/:id", obtenerProductoPorId);
router.put("/:id", actualizarProducto);
router.delete("/:id",eliminarProducto);

export default router;