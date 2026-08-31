-- Fase 1.5b: generalização via ATRIBUTOS, não via rename de tabelas.
--
-- Decisão registrada (2026-08-06): a plataforma deve poder atender outros
-- segmentos além de igrejas (condomínios, clínicas, escolas, hotéis,
-- coworkings) no futuro, sem redesenhar o banco. Em vez de renomear
-- `churches` → `organizations`, `campuses` → `units` e `totems` → `devices`
-- agora (o que exigiria tocar em toda referência já existente no app —
-- BrandConfig.id, registrations.brand_id, brand_configs.id, e todo o código
-- de UI que já assume "igreja"), generalizamos pelo campo `organization_type`
-- em `churches` e `device_type` em `totems`. Isso dá a mesma flexibilidade
-- de negócio (vender pra outros segmentos) sem o risco de uma refatoração
-- ampla agora.
--
-- v2.0 (futuro, quando o produto realmente for multi-segmento): considerar
-- `alter table churches rename to organizations` (+ campuses→units,
-- totems→devices) como um rename de baixo risco técnico nessa altura,
-- já que FKs seguem o rename automaticamente — o custo real está em
-- atualizar o app (BrandConfig, registrations.brand_id como conceito),
-- não no banco em si.

alter table public.churches
  add column if not exists organization_type text not null default 'church'
    check (organization_type in ('church', 'school', 'company', 'condominium', 'hotel', 'clinic', 'association', 'other')),
  add column if not exists cnpj text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists status text not null default 'active' check (status in ('active', 'suspended', 'canceled'));

alter table public.totems
  add column if not exists device_type text not null default 'totem'
    check (device_type in ('totem', 'tablet', 'tv', 'desktop', 'kiosk')),
  add column if not exists ip_address text,
  add column if not exists mac_address text,
  add column if not exists screen_resolution text,
  add column if not exists license_id uuid references public.licenses(id) on delete set null,
  add column if not exists last_sync_at timestamptz;

alter table public.device_logs
  add column if not exists storage_usage numeric;

-- ── Feature flags por plano ──────────────────────────────────────────────

create table if not exists public.features (
  id text primary key,
  name text not null,
  description text
);

insert into public.features (id, name) values
  ('crm', 'CRM'),
  ('financeiro', 'Financeiro'),
  ('eventos', 'Eventos'),
  ('ia', 'Inteligência Artificial'),
  ('pix', 'PIX'),
  ('pedidos', 'Pedidos'),
  ('ministerios', 'Ministérios'),
  ('marketplace', 'Marketplace'),
  ('agenda', 'Agenda'),
  ('cursos', 'Cursos')
on conflict (id) do nothing;

create table if not exists public.plan_features (
  plan_id text not null references public.plans(id) on delete cascade,
  feature_id text not null references public.features(id) on delete cascade,
  primary key (plan_id, feature_id)
);

-- Associação inicial (placeholder de negócio — ajustar conforme a
-- precificação real definida pelo time comercial):
insert into public.plan_features (plan_id, feature_id)
select 'starter', f from unnest(array['crm', 'pix']) as f
union all
select 'pro', f from unnest(array['crm', 'pix', 'eventos', 'ministerios', 'agenda']) as f
union all
select 'enterprise', f from unnest(array['crm', 'pix', 'eventos', 'ministerios', 'agenda', 'ia', 'financeiro', 'pedidos', 'marketplace', 'cursos']) as f
on conflict do nothing;

alter table public.features enable row level security;
alter table public.plan_features enable row level security;

drop policy if exists "authenticated_select_features" on public.features;
create policy "authenticated_select_features"
  on public.features for select to authenticated using (true);

drop policy if exists "authenticated_all_plan_features" on public.plan_features;
create policy "authenticated_all_plan_features"
  on public.plan_features for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid()))
  with check (exists (select 1 from public.profiles where id = auth.uid()));

grant select on public.features to authenticated;
grant select, insert, update, delete on public.plan_features to authenticated;

-- Nota de roadmap (Fase 2, não implementado aqui): hierarquia de papéis
-- mais profunda que o catálogo atual (master/church_admin/campus_admin/
-- viewer) — ATHOS Master → Company Admin → Organization Admin →
-- Unit Manager → Leader → Operator → Volunteer → Visitor. A tabela
-- `roles` já é um catálogo aberto (id text livre), então adicionar esses
-- papéis é só inserir linhas novas quando a lógica de ABAC for construída
-- em cima de `permissions` — nenhuma mudança de schema será necessária.
