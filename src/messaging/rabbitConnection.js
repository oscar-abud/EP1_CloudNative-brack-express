import amqp from "amqplib";
import { env } from "../config/env.js";
import { CONNECTION, EXCHANGES } from "../config/messaging.js";

// Conexión única a RabbitMQ (Singleton, como supabaseClient.js). Usa un
// ConfirmChannel: el broker confirma cada publicación, así el publisher sabe
// si el evento quedó realmente en RabbitMQ.
let connection = null;
let channel = null;
let closing = false;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function openConnection() {
  for (let attempt = 1; attempt <= CONNECTION.maxRetries; attempt++) {
    try {
      return await amqp.connect(env.rabbitmqUrl);
    } catch (error) {
      console.warn(
        `[RABBITMQ] Intento ${attempt}/${CONNECTION.maxRetries} fallido (${error.message}).`,
      );
      if (attempt === CONNECTION.maxRetries) throw error;
      await sleep(CONNECTION.retryDelayMs);
    }
  }
}

// Declara solo lo que este servicio usa para publicar (idempotente).
async function declareTopology(ch) {
  for (const exchange of [EXCHANGES.DLX, EXCHANGES.EVENTS]) {
    await ch.assertExchange(exchange.name, exchange.type, exchange.options);
  }
}

export async function connectRabbit() {
  if (!env.rabbitmqUrl) {
    console.warn("[RABBITMQ] Sin RABBITMQ_URL: la API no publicará eventos.");
    return;
  }

  connection = await openConnection();
  connection.on("error", (error) => console.error("[RABBITMQ] Error de conexión:", error.message));
  connection.on("close", () => {
    channel = null;
    connection = null;
    if (!closing) {
      console.warn("[RABBITMQ] Conexión cerrada. Reconectando...");
      setTimeout(() => connectRabbit().catch((e) => console.error("[RABBITMQ]", e.message)), CONNECTION.retryDelayMs);
    }
  });

  channel = await connection.createConfirmChannel();
  await declareTopology(channel);
  console.log(`[RABBITMQ] Productor conectado. Exchange '${EXCHANGES.EVENTS.name}' listo.`);
}

export function getChannel() {
  return channel;
}

export function isRabbitConnected() {
  return Boolean(channel);
}

export async function closeRabbit() {
  closing = true;
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
  } catch {
    // ya estaba cerrada
  }
}
