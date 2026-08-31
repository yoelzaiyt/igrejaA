-- Fase 1 (segurança): autenticação real via Supabase Auth substitui o PIN
-- client-side, e o RLS deixa de ser aberto (`using (true)`) para exigir
-- login em tudo que não seja o insert público de registrations.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'master' check (role in ('master', 'church_admin')),
  brand_id text, -- null para 'master' (acesso a todas as igrejas); preenchido em Fase 2 (RBAC por igreja)
  email text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "self_select_profile" on public.profiles;
create policy "self_select_profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  actor_email text,
  action text not null,
  target_type text,
  target_id text,
  brand_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_logs enable row level security;

drop policy if exists "authenticated_insert_audit_logs" on public.audit_logs;
create policy "authenticated_insert_audit_logs"
  on public.audit_logs
  for insert
  to authenticated
  with check (true);

drop policy if exists "authenticated_select_audit_logs" on public.audit_logs;
create policy "authenticated_select_audit_logs"
  on public.audit_logs
  for select
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid()));

-- registrations: visitantes anônimos continuam podendo enviar (check-in,
-- oração, cadastro), mas deixam de poder LER ou APAGAR dados de qualquer
-- igreja — isso só é permitido a administradores autenticados.
drop policy if exists "anon_select_registrations" on public.registrations;
drop policy if exists "anon_delete_registrations" on public.registrations;

drop policy if exists "authenticated_select_registrations" on public.registrations;
create policy "authenticated_select_registrations"
  on public.registrations
  for select
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid()));

drop policy if exists "authenticated_delete_registrations" on public.registrations;
create policy "authenticated_delete_registrations"
  on public.registrations
  for delete
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid()));

-- brand_configs: leitura pública (necessária pro totem se tematizar),
-- escrita restrita a administradores autenticados.
drop policy if exists "anon_upsert_brand_configs" on public.brand_configs;

drop policy if exists "authenticated_all_brand_configs" on public.brand_configs;
create policy "authenticated_all_brand_configs"
  on public.brand_configs
  for all
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid()))
  with check (exists (select 1 from public.profiles where id = auth.uid()));

revoke select, delete on public.registrations from anon;
revoke insert, update, delete on public.brand_configs from anon;

grant select, insert, update, delete on public.registrations to authenticated;
grant select, insert, update, delete on public.brand_configs to authenticated;
grant select on public.profiles to authenticated;
grant select, insert on public.audit_logs to authenticated;
