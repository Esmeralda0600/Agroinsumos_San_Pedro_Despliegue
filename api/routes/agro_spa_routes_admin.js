import express from "express";
import multer from "multer";
import { subirImagen } from "../controllers/uploadController.js";
import { listarAdmins, crearAdmin,
    mostrarInventario, loginAdmin} from "../controllers/adminController.js";


const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/", listarAdmins);
router.post("/", crearAdmin);
router.post("/login", loginAdmin);
router.get("/inventario",mostrarInventario);

router.post("/upload", upload.single("file"), subirImagen);
console.log("rutas ok");

export default router;