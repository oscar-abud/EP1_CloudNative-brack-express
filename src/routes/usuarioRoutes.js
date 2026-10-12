import { Router } from "express";
import * as UsuarioController from "../controllers/usuarioController.js";
import { requireRole } from "../middlewares/auth.js";

const router = Router();

// Gestión de usuarios y roles en Entra ID (vía Microsoft Graph): solo Admin.
router.use(requireRole("Admin"));

router.get("/", UsuarioController.listar);
router.post("/", UsuarioController.crear);
router.post("/:id/roles", UsuarioController.asignarRol);
router.delete("/:id/roles/:rol", UsuarioController.quitarRol);

export default router;
