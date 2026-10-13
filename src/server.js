import app from "./app.js";
import { env } from "./config/env.js";
import { closeRabbit, connectRabbit } from "./messaging/rabbitConnection.js";

app.listen(env.port, () => {
  console.log(`Pedidos360 API escuchando en http://localhost:${env.port}`);
});

// La API arranca aunque RabbitMQ no esté: la mensajería se conecta en
// segundo plano (con reintentos) y, mientras tanto, los eventos se registran
// como "no entregados" en el log sin afectar las peticiones.
connectRabbit().catch((error) => {
  console.error("[RABBITMQ] No se pudo conectar:", error.message);
});

async function shutdown() {
  await closeRabbit();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
