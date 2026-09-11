import { createRemoteJWKSet, jwtVerify } from "jose";
import { env } from "../config/env.js";

// El API Gateway ya valida el JWT (issuer/audience) antes de reenviar la
// petición, pero este backend es un Resource Server independiente: vuelve a
// verificar el token contra las claves públicas (JWKS) de Entra ID y expone
// los claims (roles incluidos) en req.auth para la autorización por rol.
const issuer = `https://login.microsoftonline.com/${env.azureTenantId}/v2.0`;
const jwks = createRemoteJWKSet(
  new URL(
    `https://login.microsoftonline.com/${env.azureTenantId}/discovery/v2.0/keys`,
  ),
);

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Falta el token de acceso (Authorization: Bearer <token>)" });
  }

  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer,
      audience: env.azureAudience,
    });

    req.auth = {
      oid: payload.oid,
      name: payload.name,
      email: payload.preferred_username ?? payload.email ?? null,
      roles: Array.isArray(payload.roles) ? payload.roles : [],
    };

    next();
  } catch (error) {
    console.error("[auth] Token inválido:", error.message);
    res.status(401).json({ message: "Token inválido o expirado" });
  }
}

// Autorización por rol (Admin, Operador, Cliente). Sin roles requeridos,
// solo exige estar autenticado (ya lo garantiza requireAuth antes).
export function requireRole(...roles) {
  return (req, res, next) => {
    const userRoles = req.auth?.roles ?? [];
    const allowed = roles.length === 0 || roles.some((role) => userRoles.includes(role));

    if (!allowed) {
      return res.status(403).json({
        message: `No tienes permiso para esta acción. Rol requerido: ${roles.join(" o ")}.`,
      });
    }

    next();
  };
}
