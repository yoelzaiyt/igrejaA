-- Fase 1.9e: permite que cada igreja habilite/desabilite PIX/crédito/débito
-- independentemente — antes os três métodos apareciam sempre para todas as
-- igrejas, sem nenhuma coluna que permitisse desligar um deles.

alter table public.payment_gateways
  add column if not exists enabled_methods text[] not null default array['pix', 'credit', 'debit'];

alter table public.payment_gateways
  add constraint payment_gateways_enabled_methods_subset
  check (enabled_methods <@ array['pix', 'credit', 'debit']);
