-- Fase 11: WhatsApp desacoplado via MessagingProvider (Evolution API nesta
-- fase; Meta/WhatsApp Business Platform fica preparado no catálogo mas não
-- implementado). Mesmo padrão já usado em payment_gateways: uma linha por
-- igreja, credencial sensível (o token da instância, retornado pela
-- Evolution na criação) cifrada com o mesmo CREDENTIAL_ENCRYPTION_KEY já
-- usado pra gateway de pagamento -- decisão de escopo já tomada antes.
--
-- EVOLUTION_API_URL e EVOLUTION_API_KEY (a chave GLOBAL da instância
-- Evolution, usada só pra gerenciar instâncias -- criar/conectar/checar
-- status) ficam em env var da plataforma, nunca por igreja: hoje só temos
-- uma instância Evolution self-hosted compartilhada, uma "instanceName"
-- diferente por igreja dentro dela. O token retornado na criação de CADA
-- instanceName é o que fica cifrado aqui por igreja.

create table if not exists public.messaging_gateways (
  id uuid primary key default gen_random_uuid(),
  church_id text not null unique references public.churches(id) on delete cascade,
  provider text not null default 'evolution' check (provider in ('evolution', 'meta')),
  instance_name text not null unique,
  instance_token_encrypted text,
  instance_token_iv text,
  instance_token_auth_tag text,
  status text not null default 'disconnected' check (status in ('disconnected', 'connecting', 'connected')),
  phone_number text,
  is_active boolean not null default true,
  last_tested_at timestamptz,
  last_test_result text,
  created_at timestamptz not null default now()
);

alter table public.messaging_gateways enable row level security;

-- Mesmo padrão church-scoped já usado em payment_gateways/registrations:
-- master vê/edita tudo, church_admin só a própria igreja.
drop policy if exists "authenticated_all_messaging_gateways" on public.messaging_gateways;
create policy "authenticated_all_messaging_gateways"
  on public.messaging_gateways for all to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and (p.role = 'master' or p.brand_id = messaging_gateways.church_id)
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and (p.role = 'master' or p.brand_id = messaging_gateways.church_id)
    )
  );
