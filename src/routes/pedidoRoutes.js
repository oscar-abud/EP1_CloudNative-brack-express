import { Router } from "express";
import * as PedidoController from "../controllers/pedidoController.js";
import { requireRole } from "../middlewares/auth.js";

const router = Router();

// Cualquier usuario autenticado ve y crea sus pedidos (Cliente incluido).
router.get("/", PedidoController.listar);
router.get("/:id", PedidoController.obtener);
router.post("/", PedidoController.crear);

// Cambiar el estado de un pedido: solo Admin u Operador.
router.put("/:id", requireRole("Admin", "Operador"), PedidoController.actualizar);

export default router;
