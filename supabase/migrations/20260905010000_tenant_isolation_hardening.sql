-- FASE 2 (rodada "Central IBM Alphaville"): fecha o isolamento multi-tenant
-- (RLS) que ficou pendente desde a estrutura corporativa de 06/08 e desde a
-- Fase 4 anterior (bloqueada). Combina as duas correções num único arquivo
-- porque são a mesma classe de problema: policy "authenticated_all"/"select
-- para qualquer autenticado" sem checar profiles.brand_id.
--
-- Contexto do risco: hoje só existe 1 perfil no banco (role='master',
-- brand_id=null), então nada abaixo é explorável AINDA. Mas assim que a
-- primeira conta church_admin/org_admin for criada (ex.: IBM Alphaville,
-- objetivo desta rodada), qualquer uma das tabelas abaixo sem esse fix
-- viraria um vazamento cross-tenant real e imediato. Corrigir agora, antes
-- de existir a primeira conta não-master, é o pré-requisito de segurança
-- para a Central IBM.
--
-- Padrão usado em todas: master enxerga/edita tudo; qualquer outro papel só
-- enxerga/edita o que pertence à própria church_id (profiles.brand_id) —
-- mesmo padrão já usado com sucesso em registrations/brand_configs
-- (church_scoped_rls.sql, 06/08).

-- ── 1) Fase 4 anterior: registrations (status/metadata/UPDATE) ──────────

alter table public.registrations
  add column if not exists metadata jsonb,
  add column if not exists status text not null default 'novo'
    check (status in ('novo', 'em_atendimento', 'concluido')),
  add column if not exists assigned_to text,
  add column if not exists status_updated_at timestamptz;

drop policy if exists "authenticated_update_registrations" on public.registrations;
create policy "authenticated_update_registrations"
  on public.registrations
  for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (p.role = 'master' or p.brand_id = registrations.brand_id)
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (p.role = 'master' or p.brand_id = registrations.brand_id)
    )
  );

-- ── 2) Fase 4 anterior: audit_logs deixava qualquer autenticado ler tudo ──

drop policy if exists "authenticated_select_audit_logs" on public.audit_logs;
create policy "authenticated_select_audit_logs"
  on public.audit_logs
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (p.role = 'master' or p.brand_id = audit_logs.brand_id)
    )
  );

-- ── 3) NOVO (achado nesta rodada): churches, campuses, totems ───────────
-- Essas três têm church_id (ou são a própria church) diretamente.

drop policy if exists "authenticated_all_churches" on public.churches;
create policy "authenticated_all_churches"
  on public.churches for all to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and (p.role = 'master' or p.brand_id = churches.id)
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and (p.role = 'master' or p.brand_id = churches.id)
    )
  );

drop policy if exists "authenticated_all_campuses" on public.campuses;
create policy "authenticated_all_campuses"
  on public.campuses for all to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and (p.role = 'master' or p.brand_id = campuses.church_id)
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and (p.role = 'master' or p.brand_id = campuses.church_id)
    )
  );

drop policy if exists "authenticated_all_totems" on public.totems;
create policy "authenticated_all_totems"
  on public.totems for all to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and (p.role = 'master' or p.brand_id = totems.church_id)
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and (p.role = 'master' or p.brand_id = totems.church_id)
    )
  );

-- ── 4) NOVO: device_logs (só tem totem_id — precisa de join) ────────────

drop policy if exists "authenticated_all_device_logs" on public.device_logs;
create policy "authenticated_all_device_logs"
  on public.device_logs for all to authenticated
  using (
    exists (
      select 1 from public.totems t
      join public.profiles p on p.id = auth.uid()
      where t.id = device_logs.totem_id
        and (p.role = 'master' or p.brand_id = t.church_id)
    )
  )
  with check (
    exists (
      select 1 from public.totems t
      join public.profiles p on p.id = auth.uid()
      where t.id = device_logs.totem_id
        and (p.role = 'master' or p.brand_id = t.church_id)
    )
  );

-- ── 5) NOVO: companies (pai de churches — não tem church_id direto) ─────
-- Não-master só enxerga a company dona da própria church.

drop policy if exists "authenticated_all_companies" on public.companies;
create policy "authenticated_select_own_company"
  on public.companies for select to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'master'
    )
    or exists (
      select 1 from public.profiles p
      join public.churches c on c.company_id = companies.id
      where p.id = auth.uid() and p.brand_id = c.id
    )
  );

drop policy if exists "master_write_companies" on public.companies;
create policy "master_write_companies"
  on public.companies for insert to authenticated
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'master'));

create policy "master_update_companies"
  on public.companies for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'master'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'master'));

create policy "master_delete_companies"
  on public.companies for delete to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'master'));

-- ── 6) NOVO: permissions (linhas de um profile — escopo por dono do perfil) ──

drop policy if exists "authenticated_all_permissions" on public.permissions;
create policy "authenticated_all_permissions"
  on public.permissions for all to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'master'
    )
    or exists (
      select 1 from public.profiles owner
      join public.profiles me on me.id = auth.uid()
      where owner.id = permissions.profile_id and owner.brand_id = me.brand_id and me.brand_id is not null
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'master'
    )
    or exists (
      select 1 from public.profiles owner
      join public.profiles me on me.id = auth.uid()
      where owner.id = permissions.profile_id and owner.brand_id = me.brand_id and me.brand_id is not null
    )
  );

-- ── 7) NOVO: licenses/subscriptions (billing — leitura da própria igreja,
-- escrita só master; não é algo que um ORG_ADMIN deva poder alterar) ─────

drop policy if exists "authenticated_all_licenses" on public.licenses;
create policy "read_own_licenses"
  on public.licenses for select to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and (p.role = 'master' or p.brand_id = licenses.church_id)
    )
  );
create policy "master_write_licenses"
  on public.licenses for insert to authenticated
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'master'));
create policy "master_update_licenses"
  on public.licenses for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'master'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'master'));
create policy "master_delete_licenses"
  on public.licenses for delete to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'master'));

drop policy if exists "authenticated_all_subscriptions" on public.subscriptions;
create policy "read_own_subscriptions"
  on public.subscriptions for select to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and (p.role = 'master' or p.brand_id = subscriptions.church_id)
    )
  );
create policy "master_write_subscriptions"
  on public.subscriptions for insert to authenticated
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'master'));
create policy "master_update_subscriptions"
  on public.subscriptions for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'master'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'master'));
create policy "master_delete_subscriptions"
  on public.subscriptions for delete to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'master'));

-- ── 8) NOVO: plans/features/plan_features são catálogo global de produto —
-- não são dados de tenant. Mantêm leitura aberta a qualquer autenticado
-- (já era assim para features/roles), mas a ESCRITA (antes liberada pra
-- "qualquer autenticado" em plans e plan_features) passa a ser só master.

drop policy if exists "authenticated_all_plans" on public.plans;
create policy "authenticated_select_plans"
  on public.plans for select to authenticated using (true);
create policy "master_write_plans"
  on public.plans for insert to authenticated
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'master'));
create policy "master_update_plans"
  on public.plans for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'master'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'master'));
create policy "master_delete_plans"
  on public.plans for delete to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'master'));

drop policy if exists "authenticated_all_plan_features" on public.plan_features;
create policy "authenticated_select_plan_features"
  on public.plan_features for select to authenticated using (true);
create policy "master_write_plan_features"
  on public.plan_features for insert to authenticated
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'master'));
create policy "master_update_plan_features"
  on public.plan_features for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'master'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'master'));
create policy "master_delete_plan_features"
  on public.plan_features for delete to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'master'));
