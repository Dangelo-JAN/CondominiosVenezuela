import express from "express";
import { HandleContactGeneralRequest } from "../controllers/ContactGeneral.controller.js";

const router = express.Router();

router.post("/general", HandleContactGeneralRequest);

export default router;
