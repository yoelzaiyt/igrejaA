-- Totem registrations (prayer, check-in, donations, members, etc.)
create table if not exists public.registrations (
  id text primary key,
  name text not null,
  phone text not null default '-',
  email text not null default '-',
  type text not null,
  brand_id text not null,
  created_at timestamptz not null default now()
);

create index if not exists registrations_brand_id_idx on public.registrations (brand_id);
create index if not exists registrations_created_at_idx on public.registrations (created_at desc);

-- Brand configs synced from totem admin
create table if not exists public.brand_configs (
  id text primary key,
  config jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.registrations enable row level security;
alter table public.brand_configs enable row level security;

drop policy if exists "anon_insert_registrations" on public.registrations;
create policy "anon_insert_registrations"
  on public.registrations
  for insert
  to anon
  with check (true);

drop policy if exists "anon_select_registrations" on public.registrations;
create policy "anon_select_registrations"
  on public.registrations
  for select
  to anon
  using (true);

drop policy if exists "anon_delete_registrations" on public.registrations;
create policy "anon_delete_registrations"
  on public.registrations
  for delete
  to anon
  using (true);

drop policy if exists "anon_select_brand_configs" on public.brand_configs;
create policy "anon_select_brand_configs"
  on public.brand_configs
  for select
  to anon
  using (true);

drop policy if exists "anon_upsert_brand_configs" on public.brand_configs;
create policy "anon_upsert_brand_configs"
  on public.brand_configs
  for all
  to anon
  using (true)
  with check (true);

grant usage on schema public to anon, authenticated;
grant select, insert, delete on public.registrations to anon, authenticated;
grant select, insert, update, delete on public.brand_configs to anon, authenticated;
