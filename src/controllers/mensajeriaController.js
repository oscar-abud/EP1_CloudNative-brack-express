import { randomUUID } from "node:crypto";
import * as MensajeriaModel from "../models/mensajeriaModel.js";
import * as EventPublisher from "../messaging/eventPublisher.js";
import { isRabbitConnected } from "../messaging/rabbitConnection.js";

const TIPOS_FALLO = ["transitorio", "permanente"];

export async function estado(req, res) {
  res.json({ rabbitmq: isRabbitConnected() ? "conectado" : "desconectado" });
}

export async function listarDlq(req, res) {
  res.json(await MensajeriaModel.getMensajesDlq());
}

export async function listarTickets(req, res) {
  res.json(await MensajeriaModel.getTickets());
}

// Demo para la evaluación: publica un pedido.creado de prueba. Sin "fallo"
// se procesa normal (genera ticket). Con "transitorio" el consumidor
// reintenta 3 veces con backoff y luego lo manda a la DLQ; con "permanente"
// va directo a la DLQ (error no recuperable, sin reintentos).
export async function simular(req, res) {
  const { fallo } = req.body ?? {};
  if (fallo !== undefined && !TIPOS_FALLO.includes(fallo)) {
    return res.status(400).json({
      message: `Valor de 'fallo' inválido. Permitidos: ${TIPOS_FALLO.join(", ")} (u omitirlo)`,
    });
  }
  if (!isRabbitConnected()) {
    return res.status(503).json({ message: "RabbitMQ no está disponible" });
  }

  const pedidoDemo = {
    id: randomUUID(),
    clienteNombre: `Demo (${req.auth.name ?? "Admin"})`,
    items: [],
    total: 0,
    estado: "pendiente",
    demo: true,
  };

  const publicado = await EventPublisher.pedidoCreado(pedidoDemo, { simularFallo: fallo });
  if (!publicado) {
    return res.status(502).json({ message: "RabbitMQ no confirmó el evento" });
  }
  res.status(202).json({ pedidoId: pedidoDemo.id, fallo: fallo ?? null });
}
