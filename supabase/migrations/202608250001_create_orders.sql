create extension if not exists pgcrypto;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique check (order_number ~ '^PG-[A-Z0-9]{6}$'),
  customer_name text not null,
  phone text not null,
  email text,
  city text not null,
  address text not null,
  notes text,
  payment_method text not null check (payment_method = 'cod'),
  currency text not null check (currency = 'PKR'),
  total integer not null check (total >= 0),
  status text not null default 'new' check (status in ('new', 'confirmed', 'shipped', 'completed', 'cancelled')),
  items jsonb not null check (jsonb_typeof(items) = 'array'),
  notification_state text not null default 'pending' check (notification_state in ('pending', 'sent', 'failed')),
  notification_failure text check (notification_failure is null or char_length(notification_failure) <= 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_created_at_desc_idx on public.orders (created_at desc);

alter table public.orders enable row level security;
revoke all on table public.orders from public, anon, authenticated;
grant all on table public.orders to service_role;

create function public.set_orders_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_orders_updated_at() from public;

create trigger orders_set_updated_at
before update on public.orders
for each row
execute function public.set_orders_updated_at();
