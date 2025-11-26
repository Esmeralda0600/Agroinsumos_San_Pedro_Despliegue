import express from "express";
import { listarAdmins, crearAdmin,mostrarInventario} from "../controllers/adminController.js";
import { upload, subirImagen } from "../controllers/uploadController.js";

const router = express.Router();
router.get("/", listarAdmins);
router.post("/", crearAdmin);
router.get("/inventario",mostrarInventario);

router.post("/subir-imagen", upload.single("foto"), subirImagen);
console.log("rutas ok");

export default router;