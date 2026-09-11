import { Router } from "express";
import productoRoutes from "./productoRoutes.js";
import pedidoRoutes from "./pedidoRoutes.js";

const router = Router();

router.use("/productos", productoRoutes);
router.use("/pedidos", pedidoRoutes);

export default router;
