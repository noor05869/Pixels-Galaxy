alter table public.orders
  add column if not exists province text,
  add column if not exists postal_code text,
  add column if not exists landmark text,
  add column if not exists address_type text;

alter table public.orders
  drop constraint if exists orders_address_type_check;

alter table public.orders
  add constraint orders_address_type_check
  check (address_type is null or address_type in ('home', 'office'));
