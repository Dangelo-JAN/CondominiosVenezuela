import express from "express";
import { HandleContactSalesRequest } from "../controllers/ContactSales.controller.js";
import { HandleContactGeneralRequest } from "../controllers/ContactGeneral.controller.js";

const router = express.Router();

// Contacto de Ventas - Solicitud de demo
router.post("/sales", HandleContactSalesRequest);

// Contacto General - Consultas generales
router.post("/general", HandleContactGeneralRequest);

export default router;