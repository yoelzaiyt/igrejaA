-- Fase 1.9a: isolamento real por igreja no RLS. Até aqui, qualquer perfil
-- autenticado (mesmo que não fosse 'master') enxergava TODAS as igrejas —
-- a coluna profiles.brand_id existia desde a Fase 1 mas nunca era
-- consultada nas policies. Agora: 'master' continua vendo tudo; qualquer
-- outro papel só vê/edita dados da própria church_id (profiles.brand_id).
--
-- Sem efeito visível hoje (só existe o perfil master), mas fecha a lacuna
-- para quando contas church_admin passarem a existir.

drop policy if exists "authenticated_select_registrations" on public.registrations;
create policy "authenticated_select_registrations"
  on public.registrations for select to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (p.role = 'master' or p.brand_id = registrations.brand_id)
    )
  );

drop policy if exists "authenticated_delete_registrations" on public.registrations;
create policy "authenticated_delete_registrations"
  on public.registrations for delete to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (p.role = 'master' or p.brand_id = registrations.brand_id)
    )
  );

drop policy if exists "authenticated_all_brand_configs" on public.brand_configs;
create policy "authenticated_all_brand_configs"
  on public.brand_configs for all to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (p.role = 'master' or p.brand_id = brand_configs.id)
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (p.role = 'master' or p.brand_id = brand_configs.id)
    )
  );
