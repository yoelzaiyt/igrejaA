-- Fase 1.9c: cada igreja pode configurar seu próprio gateway de pagamento.
-- Credenciais NUNCA ficam em texto puro: `credentials_encrypted` guarda o
-- ciphertext (AES-256-GCM) e `credentials_iv` o vetor de inicialização,
-- cifrados/decifrados só dentro das funções serverless (api/*.js) usando
-- CREDENTIAL_ENCRYPTION_KEY (env var server-side, nunca chega no cliente).
-- Escrita/leitura de credencial passa pelas serverless functions com
-- service_role — não há policy de select/insert direta pro client aqui
-- além do necessário pra listar (sem credencial) quais gateways existem.

create table if not exists public.payment_gateways (
  id uuid primary key default gen_random_uuid(),
  church_id text not null references public.churches(id) on delete cascade,
  provider text not null check (provider in ('mercadopago', 'stone', 'cielo', 'pagbank')),
  credentials_encrypted text,
  credentials_iv text,
  credentials_auth_tag text,
  is_active boolean not null default false,
  last_tested_at timestamptz,
  last_test_result text check (last_test_result in ('success', 'failure')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (church_id, provider)
);

create index if not exists payment_gateways_church_id_idx on public.payment_gateways (church_id);

alter table public.payment_gateways enable row level security;

-- Autenticado (scoped por igreja, igual as outras tabelas) pode ver METADADOS
-- (provider, is_active, last_tested_at) — nunca a credencial em si, porque a
-- coluna cifrada não serve pra nada sem a chave mestra que só existe no
-- servidor. Ainda assim, por padrão de segurança, escrita fica só para
-- service_role (via api/gateway-config.js), não para o client autenticado
-- direto — evita qualquer risco de o app escrever ciphertext malformado.
drop policy if exists "authenticated_select_payment_gateways" on public.payment_gateways;
create policy "authenticated_select_payment_gateways"
  on public.payment_gateways for select to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (p.role = 'master' or p.brand_id = payment_gateways.church_id)
    )
  );

grant select on public.payment_gateways to authenticated;
