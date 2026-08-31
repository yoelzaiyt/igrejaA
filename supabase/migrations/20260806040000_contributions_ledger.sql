-- Fase 1.9b: módulo de Contribuições — registro de toda tentativa de
-- pagamento (PIX/crédito/débito) gerada pelo totem via Mercado Pago.
-- Escrita feita pelas funções serverless (api/create-payment.js,
-- api/check-payment.js) usando a service_role key — nunca pelo cliente
-- anon/authenticated diretamente, então não há policy de insert/update
-- aqui (service_role ignora RLS por padrão no Supabase).

create table if not exists public.contributions (
  id uuid primary key default gen_random_uuid(),
  church_id text not null references public.churches(id) on delete cascade,
  totem_id uuid references public.totems(id) on delete set null,
  category text not null,
  method text not null check (method in ('pix', 'credit', 'debit')),
  amount_cents integer not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'refunded', 'canceled')),
  mp_payment_id text,
  mp_status_detail text,
  receipt_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contributions_church_id_idx on public.contributions (church_id);
create index if not exists contributions_created_at_idx on public.contributions (created_at desc);
create index if not exists contributions_mp_payment_id_idx on public.contributions (mp_payment_id);

alter table public.contributions enable row level security;

drop policy if exists "authenticated_select_contributions" on public.contributions;
create policy "authenticated_select_contributions"
  on public.contributions for select to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (p.role = 'master' or p.brand_id = contributions.church_id)
    )
  );

grant select on public.contributions to authenticated;
