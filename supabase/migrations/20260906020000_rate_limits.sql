-- Fase 13 (security hardening): rate limiting básico pra endpoints sensíveis
-- a abuso (criar usuário, criar cobrança, enviar WhatsApp) sem depender de
-- um serviço externo novo (Redis/Upstash) -- contador de janela fixa no
-- próprio Postgres, suficiente pro volume de um totem/Central admin.
--
-- Só o service_role toca essa tabela (nenhuma policy = ninguém além dele
-- com RLS ligado) -- não é dado de tenant, é infraestrutura interna.

create table if not exists public.rate_limits (
  key text primary key,
  count integer not null default 1,
  window_start timestamptz not null default now()
);

alter table public.rate_limits enable row level security;
