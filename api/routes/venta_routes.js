// api/routes/venta_routes.js
import { Router } from "express";
import { listarVentas } from "../controllers/ventaController.js";

const router = Router();

router.get("/", listarVentas); 

export default router;
