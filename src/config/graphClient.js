import { env } from "./env.js";

// Cliente único de Microsoft Graph (Singleton), igual que supabaseClient.js.
// Usa client credentials (permisos de APLICACIÓN) con el client ID/secret de
// pedidos360-back: así el secreto vive solo en el backend y el front nunca
// habla directo con Graph. Quién puede usarlo lo decide requireRole("Admin").
const GRAPH_URL = "https://graph.microsoft.com/v1.0";
const tokenUrl = `https://login.microsoftonline.com/${env.azureTenantId}/oauth2/v2.0/token`;

let cachedToken = null;
let cachedTokenExpiresAt = 0;

async function getAppToken() {
  // Margen de 60s para no usar un token que expire a mitad de la petición.
  if (cachedToken && Date.now() < cachedTokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.azureAudience,
      client_secret: env.azureClientSecret,
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials",
    }),
  });
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      `No se pudo obtener token de Microsoft Graph: ${data.error_description ?? data.error}`,
    );
    error.status = 502;
    throw error;
  }

  cachedToken = data.access_token;
  cachedTokenExpiresAt = Date.now() + data.expires_in * 1000;
  return cachedToken;
}

// path relativo a /v1.0 (ej: "/users") o una URL completa (@odata.nextLink).
export async function graphRequest(method, path, body) {
  const token = await getAppToken();
  const response = await fetch(path.startsWith("http") ? path : `${GRAPH_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body !== undefined && { "Content-Type": "application/json" }),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    // Se propaga el status y mensaje de Graph para que errorHandler los
    // devuelva tal cual (ej: 400 contraseña débil, 409/400 UPN repetido).
    const error = new Error(data?.error?.message ?? `Error de Microsoft Graph (${response.status})`);
    error.status = response.status === 401 || response.status === 403 ? 502 : response.status;
    throw error;
  }
  return data;
}

// GET de colecciones siguiendo la paginación de Graph (@odata.nextLink).
export async function graphGetAll(path) {
  const items = [];
  let next = path;
  while (next) {
    const page = await graphRequest("GET", next);
    items.push(...(page.value ?? []));
    next = page["@odata.nextLink"];
  }
  return items;
}
