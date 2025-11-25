import express from "express";
import { listarAdmins, crearAdmin,mostrarInventario} from "../controllers/adminController.js";

const router = express.Router();
router.get("/", listarAdmins);
router.post("/", crearAdmin);
router.get("/inventario",mostrarInventario);

console.log("rutas ok");

export default router;