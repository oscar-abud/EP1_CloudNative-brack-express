import { Router } from "express";
import * as MensajeriaController from "../controllers/mensajeriaController.js";
import { requireRole } from "../middlewares/auth.js";

const router = Router();

// Monitoreo de la mensajería asíncrona: solo Admin.
router.use(requireRole("Admin"));

router.get("/estado", MensajeriaController.estado);
router.get("/dlq", MensajeriaController.listarDlq);
router.get("/tickets", MensajeriaController.listarTickets);
router.get("/eventos", MensajeriaController.listarEventos);
router.post("/simular", MensajeriaController.simular);

export default router;
