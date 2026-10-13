import * as UsuarioModel from "../models/usuarioModel.js";
import * as EventPublisher from "../messaging/eventPublisher.js";

const ROLES = ["Admin", "Operador", "Cliente"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Los ids de Entra ID (oid) son GUID: evita armar rutas de Graph con basura.
const GUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validarRol(rol, res) {
  if (!ROLES.includes(rol)) {
    res.status(400).json({ message: `Rol inválido. Valores permitidos: ${ROLES.join(", ")}` });
    return false;
  }
  return true;
}

function validarId(id, res) {
  if (!GUID_REGEX.test(id)) {
    res.status(400).json({ message: "Id de usuario inválido" });
    return false;
  }
  return true;
}

export async function listar(req, res) {
  res.json(await UsuarioModel.getAll());
}

export async function crear(req, res) {
  const nombre = req.body?.nombre?.trim();
  const email = req.body?.email?.trim().toLowerCase();
  const { password, rol } = req.body ?? {};

  if (!nombre || !email || !password || !rol) {
    return res.status(400).json({
      message: "Faltan campos obligatorios: nombre, email, password, rol",
    });
  }
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ message: "El email no tiene un formato válido" });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: "La contraseña debe tener al menos 8 caracteres" });
  }
  if (!validarRol(rol, res)) return;

  const usuario = await UsuarioModel.create({ nombre, email, password });

  // Entra ID tarda unos segundos en replicar un usuario recién creado: la
  // asignación de rol puede responder 404/400 al primer intento.
  for (let intento = 1; ; intento++) {
    try {
      await UsuarioModel.assignRole(usuario.id, rol);
      break;
    } catch (error) {
      if (intento >= 5 || ![400, 404].includes(error.status)) {
        error.message = `Usuario ${email} creado, pero no se pudo asignar el rol ${rol}: ${error.message}`;
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  void EventPublisher.usuarioCreado({ ...usuario, roles: [rol] });
  res.status(201).json({ ...usuario, roles: [rol] });
}

export async function asignarRol(req, res) {
  const { id } = req.params;
  const { rol } = req.body ?? {};
  if (!validarId(id, res) || !validarRol(rol, res)) return;

  const roles = await UsuarioModel.getRoles(id);
  if (roles.includes(rol)) {
    return res.status(409).json({ message: `El usuario ya tiene el rol ${rol}` });
  }

  await UsuarioModel.assignRole(id, rol);
  res.status(201).json({ id, roles: [...roles, rol] });
}

export async function quitarRol(req, res) {
  const { id, rol } = req.params;
  if (!validarId(id, res) || !validarRol(rol, res)) return;

  // Evita que el Admin se deje a sí mismo sin acceso a este panel.
  if (id === req.auth.oid && rol === "Admin") {
    return res.status(400).json({ message: "No puedes quitarte tu propio rol Admin" });
  }

  const eliminado = await UsuarioModel.removeRole(id, rol);
  if (!eliminado) {
    return res.status(404).json({ message: `El usuario no tiene el rol ${rol}` });
  }
  res.status(204).send();
}
