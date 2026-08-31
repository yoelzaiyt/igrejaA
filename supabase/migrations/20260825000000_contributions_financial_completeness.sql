-- Fase 1.9d: completar o registro financeiro por tentativa (spec Projeto 2:
-- tenant, igreja, totem, categoria, valor, método, provider, status,
-- transaction_id, created_at, approved_at, erro) e fechar a lacuna de
-- idempotência a nível de banco — mesmo que a trava do app falhe, o banco
-- impede duas linhas para o mesmo mp_payment_id ou a mesma tentativa
-- (idempotency_key).
--
-- transaction_id do spec = coluna mp_payment_id já existente (genérica o
-- suficiente pra qualquer provider, não renomeada pra não quebrar
-- create-payment.js/check-payment.js/contributions.ts que já dependem dela).
-- mp_status_detail continua sendo o código de status do PROVIDER;
-- error_detail (novo) é pra erros OPERACIONAIS nossos (timeout, falha de
-- rede, simulação de débito recusada/erro).

alter table public.contributions
  add column if not exists provider text not null default 'mercadopago'
    check (provider in ('mercadopago', 'stone', 'cielo', 'pagbank', 'simulated')),
  add column if not exists approved_at timestamptz,
  add column if not exists error_detail text,
  add column if not exists idempotency_key text;

-- NULL continua distinto de NULL num unique index padrão do Postgres, então
-- linhas pendentes criadas antes de existir um mp_payment_id/idempotency_key
-- não são afetadas — só duplicatas genuínas são bloqueadas.
create unique index if not exists contributions_mp_payment_id_unique
  on public.contributions (mp_payment_id);

create unique index if not exists contributions_idempotency_key_unique
  on public.contributions (idempotency_key);

create index if not exists contributions_totem_id_idx on public.contributions (totem_id);
