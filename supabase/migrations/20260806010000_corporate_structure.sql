-- Fase 1.5 (Estrutura Corporativa): entidades preparatórias para crescimento
-- multi-cliente/multi-campus/multi-totem. Camada ADITIVA — não altera nem
-- remove nenhuma coluna/tabela/policy existente (registrations, brand_configs,
-- profiles, audit_logs continuam exatamente como estavam). RLS aqui segue o
-- mesmo modelo "tudo ou nada para autenticado" já usado na Fase 1; ABAC/RBAC
-- granular por atributo fica para a Fase 2, que vai popular/consumir estas
-- tabelas de verdade.

-- ── Hierarquia corporativa ──────────────────────────────────────────────

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  is_platform_owner boolean not null default false, -- true somente para a ATHOS
  created_at timestamptz not null default now()
);

-- id em texto de propósito: é o mesmo valor já usado em registrations.brand_id
-- e brand_configs.id (BrandConfig.id no código) — evita duplicar identidade.
create table if not exists public.churches (
  id text primary key,
  company_id uuid references public.companies(id),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.campuses (
  id uuid primary key default gen_random_uuid(),
  church_id text not null references public.churches(id) on delete cascade,
  name text not null,
  address text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── Device Manager (base para o futuro Totem Agent) ─────────────────────

create table if not exists public.totems (
  id uuid primary key default gen_random_uuid(),
  campus_id uuid references public.campuses(id) on delete set null,
  church_id text not null references public.churches(id) on delete cascade,
  label text not null,
  hostname text,
  serial_number text,
  model text,
  os text,
  app_version text,
  status text not null default 'unknown' check (status in ('online', 'offline', 'unknown')),
  last_heartbeat_at timestamptz,
  last_login_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.device_logs (
  id uuid primary key default gen_random_uuid(),
  totem_id uuid not null references public.totems(id) on delete cascade,
  event_type text not null, -- 'heartbeat' | 'boot' | 'error' | 'update' | ...
  cpu_usage numeric,
  memory_usage numeric,
  temperature numeric,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists device_logs_totem_id_idx on public.device_logs (totem_id);
create index if not exists device_logs_created_at_idx on public.device_logs (created_at desc);

-- ── RBAC/ABAC (catálogo + atribuições; motor de decisão vem na Fase 2) ──

create table if not exists public.roles (
  id text primary key,
  name text not null,
  description text
);

insert into public.roles (id, name, description) values
  ('master', 'Master (ATHOS)', 'Acesso total à plataforma, todas as igrejas e configurações globais.'),
  ('church_admin', 'Administrador da Igreja', 'Acesso total aos dados da própria igreja (todos os campi).'),
  ('campus_admin', 'Administrador de Campus', 'Acesso restrito a um campus específico.'),
  ('viewer', 'Somente Leitura', 'Acesso de leitura, sem permissão de edição.')
on conflict (id) do nothing;

-- profiles.role hoje tem CHECK restrito a ('master','church_admin'); relaxamos
-- para os novos papéis do catálogo sem quebrar os valores já existentes.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('master', 'church_admin', 'campus_admin', 'viewer'));

-- permissões por atributo: recurso + escopo (igreja/campus/etc.) + nível de
-- acesso + restrições extras (dias da semana, IP, etc.) em jsonb.
create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  resource text not null, -- 'church' | 'campus' | 'financial' | 'registrations' | ...
  scope_id text, -- id da igreja/campus/etc. ao qual a permissão se aplica; null = todos
  access_level text not null default 'read' check (access_level in ('read', 'write', 'admin')),
  constraints jsonb,
  created_at timestamptz not null default now()
);

-- ── Licenciamento e assinaturas (preparação, sem cobrança automática ainda) ──

create table if not exists public.plans (
  id text primary key,
  name text not null,
  max_totems integer,
  max_campuses integer,
  price_cents integer,
  billing_period text not null default 'monthly'
);

insert into public.plans (id, name, max_totems, max_campuses, price_cents, billing_period) values
  ('starter', 'Starter', 1, 1, 0, 'monthly'),
  ('pro', 'Pro', 5, 3, 0, 'monthly'),
  ('enterprise', 'Enterprise', null, null, 0, 'monthly')
on conflict (id) do nothing;

create table if not exists public.licenses (
  id uuid primary key default gen_random_uuid(),
  church_id text not null references public.churches(id) on delete cascade,
  plan_id text references public.plans(id),
  status text not null default 'trial' check (status in ('trial', 'active', 'suspended', 'canceled')),
  starts_at timestamptz not null default now(),
  expires_at timestamptz
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  church_id text not null references public.churches(id) on delete cascade,
  plan_id text references public.plans(id),
  mercado_pago_subscription_id text,
  status text not null default 'active',
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

-- ── RLS: acesso restrito a administradores autenticados (mesmo padrão da Fase 1) ──

alter table public.companies enable row level security;
alter table public.churches enable row level security;
alter table public.campuses enable row level security;
alter table public.totems enable row level security;
alter table public.device_logs enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.plans enable row level security;
alter table public.licenses enable row level security;
alter table public.subscriptions enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['companies', 'churches', 'campuses', 'totems', 'device_logs', 'permissions', 'plans', 'licenses', 'subscriptions'] loop
    execute format(
      'drop policy if exists "authenticated_all_%1$s" on public.%1$s;
       create policy "authenticated_all_%1$s" on public.%1$s for all to authenticated
         using (exists (select 1 from public.profiles where id = auth.uid()))
         with check (exists (select 1 from public.profiles where id = auth.uid()));',
      t
    );
  end loop;
end $$;

-- roles é catálogo público de leitura (nomes de papéis não são sensíveis)
drop policy if exists "authenticated_select_roles" on public.roles;
create policy "authenticated_select_roles"
  on public.roles for select to authenticated using (true);

grant select, insert, update, delete on public.companies, public.churches, public.campuses,
  public.totems, public.device_logs, public.permissions, public.plans, public.licenses,
  public.subscriptions to authenticated;
grant select on public.roles to authenticated;

-- ── Seed: hierarquia atual (ATHOS + as 6 igrejas já em produção) ────────

insert into public.companies (slug, name, is_platform_owner) values
  ('athos', 'ATHOS', true),
  ('clientes-santuario-digital', 'Clientes Santuário Digital', false)
on conflict (slug) do nothing;

insert into public.churches (id, company_id, name)
select v.id, c.id, v.name
from (values
  ('atitude', 'Atitude'),
  ('icconselheira', 'Igreja Cristã Conselheira'),
  ('lagoinha', 'Lagoinha'),
  ('universal', 'Universal'),
  ('beityaacov', 'Beit Yaacov'),
  ('ibmalphaville', 'IBM Alphaville')
) as v(id, name)
cross join (select id from public.companies where slug = 'clientes-santuario-digital') as c
on conflict (id) do nothing;

insert into public.campuses (church_id, name, address, is_primary)
select v.church_id, v.campus_name, v.address, true
from (values
  ('atitude', 'Alphaville', 'Av. Juruá, 159 - Alphaville, Barueri - SP'),
  ('icconselheira', 'ICC', 'Av. Nova Cantareira, 3014 - Tucuruvi - São Paulo'),
  ('lagoinha', 'Alphaville', 'Avenida Tamboré, 74 – Alphaville Industrial, Barueri - SP'),
  ('universal', 'Templo de Salomão', 'Av. Celso Garcia, 605 - Brás, São Paulo - SP'),
  ('beityaacov', 'Congregação', 'Rua Dr. Veiga Filho, 547 – Higienópolis, São Paulo - SP'),
  ('ibmalphaville', 'Sede Tamboré', 'Av. Tamboré, 1603 – Tamboré, Barueri - SP')
) as v(church_id, campus_name, address)
where not exists (
  select 1 from public.campuses existing where existing.church_id = v.church_id
);

insert into public.licenses (church_id, plan_id, status)
select id, 'pro', 'active' from public.churches
where not exists (select 1 from public.licenses l where l.church_id = churches.id);
