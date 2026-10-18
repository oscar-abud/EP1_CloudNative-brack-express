// Configuración centralizada de mensajería (equivalente a la clase
// @Configuration / application.yml de Spring). Ningún nombre de exchange o
// routing key se escribe fuera de este archivo.
//
// Este servicio (pedidos-api) es PRODUCTOR: solo publica eventos de dominio en
// el exchange de eventos. Las colas, bindings, reintentos y DLQ los declara el
// servicio consumidor (pedidos360-worker), dueño de esa topología. La cola de
// auditoría escucha "#", así que todo evento publicado tiene destino.

export const EXCHANGES = {
  // Topic: cada evento se enruta por su routing key (pedido.creado, etc.).
  // Debe declararse con las mismas opciones que en pedidos360-worker.
  EVENTS: {
    name: process.env.RABBITMQ_EVENTS_EXCHANGE ?? "pedidos.events",
    type: "topic",
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

// Reconexión sin límite: espera 3s, 6s, 12s, 24s y luego 30s entre intentos.
export const CONNECTION = {
  retryDelayMs: 3000,
  maxRetryDelayMs: 30000,
  heartbeatSeconds: 30,
};
