import { supabase } from "../config/supabaseClient.js";

// Lectura de lo que dejan los consumidores de pedidos360-worker en Supabase:
// tickets generados (éxito) y mensajes que terminaron en la DLQ (fallo).

function toMensajeDlq(row) {
  return {
    id: row.id,
    eventoId: row.evento_id,
    tipo: row.tipo,
    colaOrigen: row.cola_origen,
    motivo: row.motivo,
    intentos: row.intentos,
    error: row.error,
    payload: row.payload,
    createdAt: row.created_at,
  };
}

function toTicket(row) {
  return {
    id: row.id,
    numero: row.numero,
    pedidoId: row.pedido_id,
    clienteNombre: row.cliente_nombre,
    total: Number(row.total),
    createdAt: row.created_at,
  };
}

export async function getMensajesDlq(limit = 100) {
  const { data, error } = await supabase
    .from("mensajes_dlq")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data.map(toMensajeDlq);
}

export async function getTickets(limit = 100) {
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data.map(toTicket);
}
