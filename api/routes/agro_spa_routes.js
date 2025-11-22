import express from "express";
import {
    listarUsuarios,
    crearUsuario,
    login_Usuario,
    mostrar_categorias,
    mostrar_ingredientes,
    mostrar_marcas,
    mostrar_productos
} from "../controllers/usuarioController.js";

const router = express.Router();

// ===============================
// USUARIOS
// ===============================
router.get("/", listarUsuarios);          // Obtener lista de usuarios
router.post("/", crearUsuario);           // Registrar nuevo usuario
router.post("/login", login_Usuario);     // Login usuario

// ===============================
// CATÁLOGO BÁSICO
// ===============================
router.get("/categorias", mostrar_categorias);      
router.get("/marcas", mostrar_marcas);
router.get("/ingrediente", mostrar_ingredientes);

// ===============================
// PRODUCTOS
// ===============================

// 🔥 Mantener tu ruta original (POST)
router.post("/productos", mostrar_productos);

// 🔥 Agregar GET para mayor compatibilidad (opcional pero recomendado)
router.get("/productos/:categoria?", (req, res) => {
    const categoria = req.params.categoria || req.query.categoria;
    req.body.categoria = categoria;  // adaptar GET → POST handler
    mostrar_productos(req, res);
});

console.log("Rutas de usuarios cargadas correctamente ✔");

export default router;
