create table api_keys (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  email text not null,
  created_at timestamptz not null default now(),
  requests_used integer not null default 0,
  requests_limit integer not null default 1000
);

create table usage_logs (
  id uuid primary key default gen_random_uuid(),
  api_key_id uuid not null references api_keys (id) on delete cascade,
  endpoint text not null,
  created_at timestamptz not null default now()
);

create index idx_usage_logs_api_key_created
  on usage_logs (api_key_id, created_at desc);

create index idx_usage_logs_created
  on usage_logs (created_at);

alter table api_keys enable row level security;
alter table usage_logs enable row level security;

-- Revoke default public grants; only service_role may access these tables directly.
revoke all on table api_keys from anon, authenticated, public;
revoke all on table usage_logs from anon, authenticated, public;
grant all on table api_keys to service_role;
grant all on table usage_logs to service_role;

-- Explicit RLS policies for service_role. anon/authenticated have no policies (denied).
create policy "service_role_all_api_keys"
  on api_keys
  for all
  to service_role
  using (true)
  with check (true);

create policy "service_role_all_usage_logs"
  on usage_logs
  for all
  to service_role
  using (true)
  with check (true);

create or replace function increment_api_key_usage(
  p_key text,
  p_endpoint text
)
returns table (
  api_key_id uuid,
  requests_used integer,
  requests_limit integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row api_keys%rowtype;
begin
  select *
  into v_row
  from api_keys
  where key = p_key
  for update;

  if not found then
    raise exception 'invalid_api_key';
  end if;

  if v_row.requests_used >= v_row.requests_limit then
    raise exception 'limit_exceeded';
  end if;

  update api_keys
  set requests_used = v_row.requests_used + 1
  where id = v_row.id
  returning * into v_row;

  insert into usage_logs (api_key_id, endpoint)
  values (v_row.id, p_endpoint);

  return query
  select v_row.id, v_row.requests_used, v_row.requests_limit;
end;
$$;

grant execute on function increment_api_key_usage(text, text) to service_role;
