import { randomUUID } from "node:crypto";

// "Base de datos" en memoria: un arreglo. Se reemplaza por Supabase/PostgreSQL
// más adelante, sin tener que tocar controllers ni routes (misma forma de datos).
let productos = [
  {
    id: "p1",
    nombre: "Notebook Lenovo IdeaPad",
    descripcion: "14'' Ryzen 5, 8GB RAM, 512GB SSD",
    precio: 450000,
    stock: 12,
    categoria: "Tecnología",
    activo: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "p2",
    nombre: "Mouse inalámbrico",
    descripcion: "Mouse óptico con receptor USB",
    precio: 8990,
    stock: 40,
    categoria: "Accesorios",
    activo: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "p3",
    nombre: "Silla ergonómica",
    descripcion: "Silla de oficina con soporte lumbar",
    precio: 129990,
    stock: 5,
    categoria: "Mobiliario",
    activo: true,
    createdAt: new Date().toISOString(),
  },
];

export function getAll() {
  return productos;
}

export function getById(id) {
  return productos.find((producto) => producto.id === id) ?? null;
}

export function create(data) {
  const producto = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...data,
  };
  productos.push(producto);
  return producto;
}

export function update(id, data) {
  const index = productos.findIndex((producto) => producto.id === id);
  if (index === -1) {
    return null;
  }
  productos[index] = { ...productos[index], ...data, id };
  return productos[index];
}

export function remove(id) {
  const antes = productos.length;
  productos = productos.filter((producto) => producto.id !== id);
  return productos.length < antes;
}
