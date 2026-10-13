-- Pedidos360: esquema de productos y pedidos.
-- Correr una sola vez en el SQL Editor de Supabase.

create table if not exists productos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text not null default '',
  precio numeric(12, 2) not null,
  stock integer not null default 0,
  categoria text not null default '',
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists pedidos (
  id uuid primary key default gen_random_uuid(),
  cliente_nombre text not null,
  total numeric(12, 2) not null default 0,
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'en_proceso', 'enviado', 'entregado', 'cancelado')),
  created_at timestamptz not null default now()
);

create table if not exists pedido_items (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references pedidos(id) on delete cascade,
  producto_id uuid not null references productos(id),
  nombre text not null,
  cantidad integer not null,
  precio_unitario numeric(12, 2) not null
);

-- RLS activado sin políticas: bloquea cualquier acceso directo (anon/authenticated).
-- El backend usa la service_role key, que siempre pasa por encima de RLS.
alter table productos enable row level security;
alter table pedidos enable row level security;
alter table pedido_items enable row level security;

-- Datos semilla, iguales a los que ya tenías en memoria.
insert into productos (nombre, descripcion, precio, stock, categoria, activo)
values
  ('Notebook Lenovo IdeaPad', '14'' Ryzen 5, 8GB RAM, 512GB SSD', 450000, 12, 'Tecnología', true),
  ('Mouse inalámbrico', 'Mouse óptico con receptor USB', 8990, 40, 'Accesorios', true),
  ('Silla ergonómica', 'Silla de oficina con soporte lumbar', 129990, 5, 'Mobiliario', true);

-- ===================== EP3: mensajería (RabbitMQ) =====================
-- Correr este bloque en el SQL Editor de Supabase (es idempotente).

-- Tickets/comprobantes que genera el consumidor de tickets (pedidos360-worker)
-- al procesar un evento pedido.creado. pedido_id es UNIQUE: si el mismo
-- evento llega dos veces (reintento), no se duplica el ticket.
create table if not exists tickets (
  id uuid primary key default gen_random_uuid(),
  numero text not null unique,
  pedido_id uuid not null unique,
  cliente_nombre text not null,
  total numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

-- Mensajes que terminaron en la DLQ (pedidos.dlq), con el motivo que da
-- RabbitMQ (rejected, expired, maxlen) o "unrouted" si no tenía destino.
create table if not exists mensajes_dlq (
  id uuid primary key default gen_random_uuid(),
  evento_id text,
  tipo text,
  cola_origen text,
  motivo text not null,
  intentos integer not null default 0,
  error text,
  payload jsonb,
  created_at timestamptz not null default now()
);

alter table tickets enable row level security;
alter table mensajes_dlq enable row level security;
