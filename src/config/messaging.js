// Configuración centralizada de mensajería (equivalente a la clase
// @Configuration / application.yml de Spring). Ningún nombre de exchange o
// routing key se escribe fuera de este archivo.
//
// Este servicio (pedidos-api) es PRODUCTOR: solo publica eventos de dominio en
// el exchange de eventos. Las colas, bindings, reintentos y DLQ los declara el
// servicio consumidor (pedidos360-worker), dueño de esa topología.

export const EXCHANGES = {
  // Topic: cada evento se enruta por su routing key (pedido.creado, etc.).
  // Si un evento no calza con ningún binding, el alternate-exchange lo manda
  // al DLX para que no se pierda en silencio (mensajes "no entregados").
  EVENTS: {
    name: process.env.RABBITMQ_EVENTS_EXCHANGE ?? "pedidos.events",
    type: "topic",
    options: {
      durable: true,
      alternateExchange: process.env.RABBITMQ_DLX_EXCHANGE ?? "pedidos.dlx",
    },
  },
  // Se declara también aquí porque es el alternate-exchange del de eventos.
  DLX: {
    name: process.env.RABBITMQ_DLX_EXCHANGE ?? "pedidos.dlx",
    type: "fanout",
    options: { durable: true },
  },
};

// Routing keys = tipos de evento que publica este servicio.
export const ROUTING_KEYS = {
  PEDIDO_CREADO: "pedido.creado",
  PEDIDO_ESTADO_ACTUALIZADO: "pedido.estado.actualizado",
  USUARIO_CREADO: "usuario.creado",
};

// Header que los consumidores leen para forzar un fallo (solo para la demo
// de reintentos/DLQ desde el panel del Admin).
export const HEADERS = {
  SIMULAR_FALLO: "x-simular-fallo",
};

export const CONNECTION = {
  maxRetries: 10,
  retryDelayMs: 3000,
};
