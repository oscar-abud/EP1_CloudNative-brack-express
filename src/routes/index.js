import { Router } from "express";
import productoRoutes from "./productoRoutes.js";
import pedidoRoutes from "./pedidoRoutes.js";
import usuarioRoutes from "./usuarioRoutes.js";

const router = Router();

router.use("/productos", productoRoutes);
router.use("/pedidos", pedidoRoutes);
router.use("/usuarios", usuarioRoutes);

export default router;
