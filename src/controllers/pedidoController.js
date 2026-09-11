import * as PedidoModel from "../models/pedidoModel.js";
import * as ProductoModel from "../models/productoModel.js";

export function listar(req, res) {
  res.json(PedidoModel.getAll());
}

export function obtener(req, res) {
  const pedido = PedidoModel.getById(req.params.id);
  if (!pedido) {
    return res.status(404).json({ message: "Pedido no encontrado" });
  }
  res.json(pedido);
}

export function crear(req, res) {
  const { clienteNombre, items, estado } = req.body;

  if (!clienteNombre || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      message: "Faltan campos obligatorios: clienteNombre, items (al menos 1)",
    });
  }

  const itemsConPrecio = [];
  for (const item of items) {
    const producto = ProductoModel.getById(item.productoId);
    if (!producto) {
      return res.status(400).json({
        message: `El producto ${item.productoId} no existe`,
      });
    }
    itemsConPrecio.push({
      productoId: producto.id,
      nombre: producto.nombre,
      cantidad: Number(item.cantidad) || 1,
      precioUnitario: producto.precio,
    });
  }

  const total = itemsConPrecio.reduce(
    (suma, item) => suma + item.precioUnitario * item.cantidad,
    0,
  );

  const pedido = PedidoModel.create({
    clienteNombre,
    items: itemsConPrecio,
    total,
    estado: estado ?? "pendiente",
  });

  res.status(201).json(pedido);
}

export function actualizar(req, res) {
  // Solo Admin/Operador llegan aquí (ver pedidoRoutes) para cambiar estado.
  const { estado } = req.body;
  const pedido = PedidoModel.update(req.params.id, estado ? { estado } : req.body);
  if (!pedido) {
    return res.status(404).json({ message: "Pedido no encontrado" });
  }
  res.json(pedido);
}
