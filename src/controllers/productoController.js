import * as ProductoModel from "../models/productoModel.js";

export function listar(req, res) {
  res.json(ProductoModel.getAll());
}

export function obtener(req, res) {
  const producto = ProductoModel.getById(req.params.id);
  if (!producto) {
    return res.status(404).json({ message: "Producto no encontrado" });
  }
  res.json(producto);
}

export function crear(req, res) {
  const { nombre, descripcion, precio, stock, categoria, activo } = req.body;

  if (!nombre || precio == null || stock == null) {
    return res.status(400).json({
      message: "Faltan campos obligatorios: nombre, precio, stock",
    });
  }

  const producto = ProductoModel.create({
    nombre,
    descripcion: descripcion ?? "",
    precio: Number(precio),
    stock: Number(stock),
    categoria: categoria ?? "",
    activo: activo ?? true,
  });

  res.status(201).json(producto);
}

export function actualizar(req, res) {
  const producto = ProductoModel.update(req.params.id, req.body);
  if (!producto) {
    return res.status(404).json({ message: "Producto no encontrado" });
  }
  res.json(producto);
}

export function eliminar(req, res) {
  const eliminado = ProductoModel.remove(req.params.id);
  if (!eliminado) {
    return res.status(404).json({ message: "Producto no encontrado" });
  }
  res.status(204).send();
}
