import * as PedidoModel from "../models/pedidoModel.js";
import * as ProductoModel from "../models/productoModel.js";

export async function listar(req, res) {
  res.json(await PedidoModel.getAll());
}

export async function obtener(req, res) {
  const pedido = await PedidoModel.getById(req.params.id);
  if (!pedido) {
    return res.status(404).json({ message: "Pedido no encontrado" });
  }
  res.json(pedido);
}

export async function crear(req, res) {
  const { clienteNombre, items, estado } = req.body;

  if (!clienteNombre || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      message: "Faltan campos obligatorios: clienteNombre, items (al menos 1)",
    });
  }

  const itemsConPrecio = [];
  for (const item of items) {
    const producto = await ProductoModel.getById(item.productoId);
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

  const pedido = await PedidoModel.create({
    clienteNombre,
    items: itemsConPrecio,
    total,
    estado: estado ?? "pendiente",
  });

  res.status(201).json(pedido);
}

export async function actualizar(req, res) {
  // Solo Admin/Operador llegan aquí (ver pedidoRoutes) para cambiar estado.
  const { estado } = req.body;
  const pedido = await PedidoModel.update(req.params.id, estado ? { estado } : req.body);
  if (!pedido) {
    return res.status(404).json({ message: "Pedido no encontrado" });
  }
  res.json(pedido);
}
