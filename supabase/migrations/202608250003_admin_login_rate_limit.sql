create table public.admin_login_attempts (
  reservation_id uuid primary key default gen_random_uuid(),
  client_key text not null check (client_key ~ '^[a-f0-9]{64}$'),
  state text not null default 'pending' check (state in ('pending', 'failed')),
  attempted_at timestamptz not null default clock_timestamp()
);

create index admin_login_attempts_client_time_idx
on public.admin_login_attempts (client_key, attempted_at desc);

create index admin_login_attempts_time_idx
on public.admin_login_attempts (attempted_at);

create table public.admin_login_trusted_clients (
  client_key text primary key check (client_key ~ '^[a-f0-9]{64}$'),
  trusted_until timestamptz not null
);

alter table public.admin_login_attempts enable row level security;
alter table public.admin_login_trusted_clients enable row level security;
revoke all on table public.admin_login_attempts from public, anon, authenticated;
revoke all on table public.admin_login_trusted_clients from public, anon, authenticated;
grant all on table public.admin_login_attempts to service_role;
grant all on table public.admin_login_trusted_clients to service_role;

create function public.reserve_admin_login_attempt(p_client_key text)
returns table (allowed boolean, reservation_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_time timestamptz := pg_catalog.clock_timestamp();
  client_attempts integer;
  total_attempts integer;
  client_is_trusted boolean;
  new_reservation_id uuid;
begin
  if p_client_key is null or p_client_key !~ '^[a-f0-9]{64}$' then
    return query select false, null::uuid;
    return;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('pixels-galaxy-admin-login-rate-limit-v1', 0)
  );

  delete from public.admin_login_attempts
  where attempted_at <= current_time - interval '15 minutes';

  delete from public.admin_login_trusted_clients
  where trusted_until <= current_time;

  select pg_catalog.count(*)::integer
  into client_attempts
  from public.admin_login_attempts
  where client_key = p_client_key;

  if client_attempts >= 5 then
    return query select false, null::uuid;
    return;
  end if;

  select pg_catalog.count(*)::integer
  into total_attempts
  from public.admin_login_attempts;

  select exists (
    select 1
    from public.admin_login_trusted_clients
    where client_key = p_client_key and trusted_until > current_time
  ) into client_is_trusted;

  -- Anonymous identities cannot consume the final 20 recovery reservations.
  if total_attempts >= 520 or (total_attempts >= 500 and not client_is_trusted) then
    return query select false, null::uuid;
    return;
  end if;

  insert into public.admin_login_attempts (client_key, attempted_at)
  values (p_client_key, current_time)
  returning admin_login_attempts.reservation_id into new_reservation_id;

  return query select true, new_reservation_id;
end;
$$;

create function public.complete_admin_login_attempt(
  p_reservation_id uuid,
  p_outcome text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_time timestamptz := pg_catalog.clock_timestamp();
  reservation_client_key text;
begin
  if p_outcome not in ('failure', 'success') then
    return;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('pixels-galaxy-admin-login-rate-limit-v1', 0)
  );

  select client_key
  into reservation_client_key
  from public.admin_login_attempts
  where reservation_id = p_reservation_id;

  if reservation_client_key is null then
    return;
  end if;

  if p_outcome = 'success' then
    delete from public.admin_login_attempts
    where client_key = reservation_client_key;

    insert into public.admin_login_trusted_clients (client_key, trusted_until)
    values (reservation_client_key, current_time + interval '30 days')
    on conflict (client_key) do update
    set trusted_until = excluded.trusted_until;

    delete from public.admin_login_trusted_clients
    where client_key in (
      select client_key
      from public.admin_login_trusted_clients
      order by trusted_until desc, client_key
      offset 20
    );
  else
    update public.admin_login_attempts
    set state = 'failed'
    where reservation_id = p_reservation_id;
  end if;
end;
$$;

revoke all on function public.reserve_admin_login_attempt(text) from public, anon, authenticated;
revoke all on function public.complete_admin_login_attempt(uuid, text) from public, anon, authenticated;
grant execute on function public.reserve_admin_login_attempt(text) to service_role;
grant execute on function public.complete_admin_login_attempt(uuid, text) to service_role;
