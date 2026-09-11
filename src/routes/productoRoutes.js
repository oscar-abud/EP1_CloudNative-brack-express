import { Router } from "express";
import * as ProductoController from "../controllers/productoController.js";
import { requireRole } from "../middlewares/auth.js";

const router = Router();

// Cualquier usuario autenticado puede leer el catálogo.
router.get("/", ProductoController.listar);
router.get("/:id", ProductoController.obtener);

// Crear/editar/eliminar productos: solo Admin u Operador.
router.post("/", requireRole("Admin", "Operador"), ProductoController.crear);
router.put("/:id", requireRole("Admin", "Operador"), ProductoController.actualizar);
router.delete("/:id", requireRole("Admin", "Operador"), ProductoController.eliminar);

export default router;
