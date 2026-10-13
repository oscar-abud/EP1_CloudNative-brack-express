import { Router } from "express";
import productoRoutes from "./productoRoutes.js";
import pedidoRoutes from "./pedidoRoutes.js";
import usuarioRoutes from "./usuarioRoutes.js";
import mensajeriaRoutes from "./mensajeriaRoutes.js";

const router = Router();

router.use("/productos", productoRoutes);
router.use("/pedidos", pedidoRoutes);
router.use("/usuarios", usuarioRoutes);
router.use("/mensajeria", mensajeriaRoutes);

export default router;
