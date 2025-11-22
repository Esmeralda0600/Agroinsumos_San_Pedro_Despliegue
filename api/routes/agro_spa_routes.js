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

router.get("/", listarUsuarios);
router.post("/", crearUsuario);
router.post("/login", login_Usuario);

router.get("/categorias", mostrar_categorias);
router.get("/marcas", mostrar_marcas);
router.get("/ingrediente", mostrar_ingredientes);

// ❗ ESTA ES LA RUTA CORRECTA
router.post("/productos", mostrar_productos);

export default router;
