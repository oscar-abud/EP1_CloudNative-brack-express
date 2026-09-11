import "dotenv/config";

function required(value, key) {
  if (!value || value.trim() === "") {
    console.warn(`[config] Falta ${key} en .env`);
    return "";
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT) || 4000,

  // Deben coincidir con el JWT Authorizer del API Gateway (mismo issuer/audience).
  azureTenantId: required(process.env.AZURE_TENANT_ID, "AZURE_TENANT_ID"),
  azureAudience: required(process.env.AZURE_AUDIENCE, "AZURE_AUDIENCE"),

  corsOrigins: (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};
