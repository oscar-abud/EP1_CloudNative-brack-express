import { randomUUID } from "node:crypto";
import { getChannel } from "./rabbitConnection.js";
import { EXCHANGES, HEADERS, ROUTING_KEYS } from "../config/messaging.js";

// Publicador de eventos de dominio. Los controllers solo llaman a estas
// funciones de alto nivel; no conocen exchanges, routing keys ni amqplib.
//
// Publicar NUNCA rompe la lógica existente: si RabbitMQ no está disponible o
// no confirma, se registra en el log y la petición HTTP sigue su curso
// (el pedido ya quedó guardado en Supabase).

function publish(routingKey, data, { simularFallo } = {}) {
  const channel = getChannel();
  const event = {
    id: randomUUID(),
    tipo: routingKey,
    ocurridoEn: new Date().toISOString(),
    data,
  };

  if (!channel) {
    console.error(`[EVENTO NO ENTREGADO] Sin conexión a RabbitMQ: ${routingKey} ${event.id}`);
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    channel.publish(
      EXCHANGES.EVENTS.name,
      routingKey,
      Buffer.from(JSON.stringify(event)),
      {
        persistent: true,
        contentType: "application/json",
        messageId: event.id,
        type: routingKey,
        timestamp: Math.floor(Date.now() / 1000),
        headers: simularFallo ? { [HEADERS.SIMULAR_FALLO]: simularFallo } : {},
      },
      (error) => {
        if (error) {
          console.error(`[EVENTO NO ENTREGADO] RabbitMQ rechazó ${routingKey} ${event.id}:`, error.message);
          resolve(false);
        } else {
          console.log(`[EVENTO] Publicado ${routingKey} ${event.id}`);
          resolve(true);
        }
      },
    );
  });
}

export function pedidoCreado(pedido, opciones) {
  return publish(ROUTING_KEYS.PEDIDO_CREADO, pedido, opciones);
}

export function pedidoEstadoActualizado(pedido) {
  return publish(ROUTING_KEYS.PEDIDO_ESTADO_ACTUALIZADO, {
    id: pedido.id,
    clienteNombre: pedido.clienteNombre,
    estado: pedido.estado,
  });
}

export function usuarioCreado(usuario) {
  return publish(ROUTING_KEYS.USUARIO_CREADO, {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    roles: usuario.roles,
  });
}
