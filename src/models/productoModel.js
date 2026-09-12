import { supabase } from "../config/supabaseClient.js";

// Traduce la fila de Postgres (snake_case) a lo que espera el front (camelCase).
function toProducto(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion,
    precio: Number(row.precio),
    stock: row.stock,
    categoria: row.categoria,
    activo: row.activo,
    createdAt: row.created_at,
  };
}

// Solo incluye los campos que vienen definidos (sirve para updates parciales).
function toRow(input) {
  const row = {};
  if (input.nombre !== undefined) row.nombre = input.nombre;
  if (input.descripcion !== undefined) row.descripcion = input.descripcion;
  if (input.precio !== undefined) row.precio = input.precio;
  if (input.stock !== undefined) row.stock = input.stock;
  if (input.categoria !== undefined) row.categoria = input.categoria;
  if (input.activo !== undefined) row.activo = input.activo;
  return row;
}

export async function getAll() {
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data.map(toProducto);
}

export async function getById(id) {
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? toProducto(data) : null;
}

export async function create(input) {
  const { data, error } = await supabase
    .from("productos")
    .insert(toRow(input))
    .select()
    .single();
  if (error) throw error;
  return toProducto(data);
}

export async function update(id, input) {
  const { data, error } = await supabase
    .from("productos")
    .update(toRow(input))
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data ? toProducto(data) : null;
}

export async function remove(id) {
  const { data, error } = await supabase
    .from("productos")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) throw error;
  return (data ?? []).length > 0;
}
