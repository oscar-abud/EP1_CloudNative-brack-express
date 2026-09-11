import { randomUUID } from "node:crypto";

// Igual que productoModel: arreglo en memoria, futuro reemplazo por Supabase.
let pedidos = [
  {
    id: "pe1",
    clienteNombre: "Cliente de prueba",
    items: [
      { productoId: "p1", nombre: "Notebook Lenovo IdeaPad", cantidad: 1, precioUnitario: 450000 },
      { productoId: "p2", nombre: "Mouse inalámbrico", cantidad: 2, precioUnitario: 8990 },
    ],
    total: 450000 + 2 * 8990,
    estado: "pendiente",
    createdAt: new Date().toISOString(),
  },
];

export function getAll() {
  return pedidos;
}

export function getById(id) {
  return pedidos.find((pedido) => pedido.id === id) ?? null;
}

export function create(data) {
  const pedido = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...data,
  };
  pedidos.push(pedido);
  return pedido;
}

export function update(id, data) {
  const index = pedidos.findIndex((pedido) => pedido.id === id);
  if (index === -1) {
    return null;
  }
  pedidos[index] = { ...pedidos[index], ...data, id };
  return pedidos[index];
}
