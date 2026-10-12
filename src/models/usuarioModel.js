import { graphGetAll, graphRequest } from "../config/graphClient.js";
import { env } from "../config/env.js";

// Los roles (Admin, Operador, Cliente) son app roles de pedidos360-back: se
// asignan sobre su Service Principal (Enterprise application) y por eso
// aparecen en el claim "roles" del access token que valida auth.js.
let servicePrincipal = null;

async function getServicePrincipal() {
  if (!servicePrincipal) {
    const sp = await graphRequest(
      "GET",
      `/servicePrincipals(appId='${env.azureAudience}')?$select=id,appRoles`,
    );
    servicePrincipal = {
      id: sp.id,
      roles: sp.appRoles
        .filter((role) => role.isEnabled)
        .map((role) => ({ id: role.id, value: role.value })),
    };
  }
  return servicePrincipal;
}

async function appRoleId(rol) {
  const sp = await getServicePrincipal();
  const role = sp.roles.find((r) => r.value === rol);
  if (!role) {
    const error = new Error(`El rol ${rol} no existe en la app registration`);
    error.status = 400;
    throw error;
  }
  return role.id;
}

async function getAssignments() {
  const sp = await getServicePrincipal();
  return graphGetAll(`/servicePrincipals/${sp.id}/appRoleAssignedTo?$top=999`);
}

// Graph (objeto user) -> lo que espera el front.
function toUsuario(user, roles = []) {
  return {
    id: user.id,
    nombre: user.displayName,
    email: user.userPrincipalName,
    activo: user.accountEnabled,
    roles,
  };
}

export async function getAll() {
  const [users, assignments, sp] = await Promise.all([
    graphGetAll("/users?$select=id,displayName,userPrincipalName,accountEnabled&$top=999"),
    getAssignments(),
    getServicePrincipal(),
  ]);

  const roleById = new Map(sp.roles.map((role) => [role.id, role.value]));
  const rolesByUser = new Map();
  for (const assignment of assignments) {
    const rol = roleById.get(assignment.appRoleId);
    if (!rol) continue;
    rolesByUser.set(assignment.principalId, [
      ...(rolesByUser.get(assignment.principalId) ?? []),
      rol,
    ]);
  }

  return users
    .map((user) => toUsuario(user, rolesByUser.get(user.id) ?? []))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export async function getRoles(userId) {
  const sp = await getServicePrincipal();
  const roleById = new Map(sp.roles.map((role) => [role.id, role.value]));
  const assignments = await graphGetAll(`/users/${userId}/appRoleAssignments?$top=999`);
  return assignments
    .filter((a) => a.resourceId === sp.id && roleById.has(a.appRoleId))
    .map((a) => roleById.get(a.appRoleId));
}

export async function create({ nombre, email, password }) {
  const user = await graphRequest("POST", "/users", {
    accountEnabled: true,
    displayName: nombre,
    mailNickname: email.split("@")[0].replace(/[^A-Za-z0-9._-]/g, ""),
    userPrincipalName: email,
    passwordProfile: {
      password,
      forceChangePasswordNextSignIn: true,
    },
  });
  return toUsuario(user);
}

export async function assignRole(userId, rol) {
  const sp = await getServicePrincipal();
  await graphRequest("POST", `/servicePrincipals/${sp.id}/appRoleAssignedTo`, {
    principalId: userId,
    resourceId: sp.id,
    appRoleId: await appRoleId(rol),
  });
}

// Devuelve false si el usuario no tenía ese rol asignado.
export async function removeRole(userId, rol) {
  const sp = await getServicePrincipal();
  const roleId = await appRoleId(rol);
  const assignments = await graphGetAll(`/users/${userId}/appRoleAssignments?$top=999`);
  const assignment = assignments.find(
    (a) => a.resourceId === sp.id && a.appRoleId === roleId,
  );
  if (!assignment) {
    return false;
  }
  await graphRequest("DELETE", `/servicePrincipals/${sp.id}/appRoleAssignedTo/${assignment.id}`);
  return true;
}
