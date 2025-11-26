// api/routes/pagoRoutes.js
import express from "express";
import { crearPreferencia,confirmarPago } from "../controllers/pagoController.js";

const router = express.Router();

router.post("/crear-preferencia", crearPreferencia);
router.post("/confirmar", confirmarPago);
export default router;
