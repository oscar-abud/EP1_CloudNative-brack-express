import * as ProductoModel from "../models/productoModel.js";

export async function listar(req, res) {
  res.json(await ProductoModel.getAll());
}

export async function obtener(req, res) {
  const producto = await ProductoModel.getById(req.params.id);
  if (!producto) {
    return res.status(404).json({ message: "Producto no encontrado" });
  }
  res.json(producto);
}

export async function crear(req, res) {
  const { nombre, descripcion, precio, stock, categoria, activo } = req.body;

  if (!nombre || precio == null || stock == null) {
    return res.status(400).json({
      message: "Faltan campos obligatorios: nombre, precio, stock",
    });
  }

  const producto = await ProductoModel.create({
    nombre,
    descripcion: descripcion ?? "",
    precio: Number(precio),
    stock: Number(stock),
    categoria: categoria ?? "",
    activo: activo ?? true,
  });

  res.status(201).json(producto);
}

export async function actualizar(req, res) {
  const producto = await ProductoModel.update(req.params.id, req.body);
  if (!producto) {
    return res.status(404).json({ message: "Producto no encontrado" });
  }
  res.json(producto);
}

export async function eliminar(req, res) {
  const eliminado = await ProductoModel.remove(req.params.id);
  if (!eliminado) {
    return res.status(404).json({ message: "Producto no encontrado" });
  }
  res.status(204).send();
}
