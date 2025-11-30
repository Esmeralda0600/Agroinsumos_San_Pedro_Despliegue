import express from "express";
import multer from "multer";
import { listarAdmins, crearAdmin,mostrarInventario} from "../controllers/adminController.js";
import { subirImagen } from "../controllers/uploadController.js";

const router = express.Router();
const upload = multer(); // archivos en memoria

router.get("/", listarAdmins);
router.post("/", crearAdmin);
router.get("/inventario",mostrarInventario);

router.post("/upload", upload.single("file"), subirImagen);
console.log("rutas ok");

export default router;