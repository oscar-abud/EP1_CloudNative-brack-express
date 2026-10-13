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

  // Secret de la misma app (client ID = azureAudience) para pedir tokens de
  // Microsoft Graph con client credentials (gestión de usuarios y roles).
  azureClientSecret: required(process.env.AZURE_CLIENT_SECRET, "AZURE_CLIENT_SECRET"),

  corsOrigins: (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),

  // Supabase: solo la secret key (bypassa RLS). Nunca la publishable key acá,
  // esa es para el front si algún día hablara directo con Supabase.
  supabaseUrl: required(process.env.SUPABASE_URL, "SUPABASE_URL"),
  supabaseSecretKey: required(process.env.SUPABASE_SECRET_KEY, "SUPABASE_SECRET_KEY"),

  // RabbitMQ (local: docker-compose; producción: CloudAMQP, usar amqps://).
  // Si falta, la API funciona igual pero no publica eventos.
  rabbitmqUrl: required(process.env.RABBITMQ_URL, "RABBITMQ_URL"),
};
