import { supabase } from "../config/supabaseClient.js";

const SELECT_CON_ITEMS = "*, pedido_items(*)";

function toItem(row) {
  return {
    productoId: row.producto_id,
    nombre: row.nombre,
    cantidad: row.cantidad,
    precioUnitario: Number(row.precio_unitario),
  };
}

function toPedido(row) {
  return {
    id: row.id,
    clienteNombre: row.cliente_nombre,
    items: (row.pedido_items ?? []).map(toItem),
    total: Number(row.total),
    estado: row.estado,
    createdAt: row.created_at,
  };
}

export async function getAll() {
  const { data, error } = await supabase
    .from("pedidos")
    .select(SELECT_CON_ITEMS)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data.map(toPedido);
}

export async function getById(id) {
  const { data, error } = await supabase
    .from("pedidos")
    .select(SELECT_CON_ITEMS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? toPedido(data) : null;
}

export async function create({ clienteNombre, items, total, estado }) {
  const { data: pedido, error } = await supabase
    .from("pedidos")
    .insert({ cliente_nombre: clienteNombre, total, estado })
    .select()
    .single();
  if (error) throw error;

  const filas = items.map((item) => ({
    pedido_id: pedido.id,
    producto_id: item.productoId,
    nombre: item.nombre,
    cantidad: item.cantidad,
    precio_unitario: item.precioUnitario,
  }));

  const { error: itemsError } = await supabase.from("pedido_items").insert(filas);
  if (itemsError) throw itemsError;

  return getById(pedido.id);
}

// Solo se usa para cambiar el estado (ver pedidoRoutes/pedidoController).
export async function update(id, { estado }) {
  const { data, error } = await supabase
    .from("pedidos")
    .update({ estado })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return getById(id);
}
