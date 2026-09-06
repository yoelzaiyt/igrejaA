-- Fase 6: RBAC granular de verdade -- até aqui, qualquer papel não-master
-- (church_admin, campus_admin, viewer) tinha o MESMO acesso de escrita
-- dentro da própria igreja, porque as policies eram "ALL" checando só
-- brand_id, nunca o papel. Um `viewer` (deveria ser só-leitura) conseguia
-- escrever em brand_configs/churches/campuses/totems/device_logs/
-- messaging_gateways e em registrations (update/delete) exatamente como um
-- church_admin. Isso nunca foi explorado (nenhuma conta viewer/campus_admin
-- existe ainda), mas precisa estar fechado antes de criar a primeira.
--
-- Matriz ROLE × RESOURCE × ACTION aplicada nesta migration:
--
--                      SELECT              INSERT/UPDATE/DELETE
-- master               tudo                tudo
-- church_admin         própria igreja      própria igreja (tudo abaixo)
-- campus_admin         própria igreja      só registrations (cadastros/
--                                          solicitações) -- não edita
--                                          identidade/pastores/carrossel/
--                                          totens/gateway de mensageria
-- viewer                própria igreja      nada -- só leitura, sempre
--
-- payment_gateways não entra aqui: já não tinha policy de escrita nenhuma
-- (só SELECT) -- toda escrita já passa exclusivamente por
-- api/gateway-config.js com authGuard, que é o desenho certo pra dado
-- sensível (credencial cifrada). permissions já tinha regra própria mais
-- fina, também não mexido.

-- ── brand_configs: split ALL -> SELECT (qualquer papel escopado) + escrita
-- (só master/church_admin) ──────────────────────────────────────────────

drop policy if exists "authenticated_all_brand_configs" on public.brand_configs;

create policy "authenticated_select_brand_configs"
  on public.brand_configs for select to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and (p.role = 'master' or p.brand_id = brand_configs.id)
    )
  );

create policy "write_brand_configs"
  on public.brand_configs for all to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (p.role = 'master' or (p.brand_id = brand_configs.id and p.role = 'church_admin'))
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (p.role = 'master' or (p.brand_id = brand_configs.id and p.role = 'church_admin'))
    )
  );

-- ── churches / campuses / totems / device_logs: mesmo split ────────────

drop policy if exists "authenticated_all_churches" on public.churches;
create policy "authenticated_select_churches"
  on public.churches for select to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and (p.role = 'master' or p.brand_id = churches.id))
  );
create policy "write_churches"
  on public.churches for all to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and (p.role = 'master' or (p.brand_id = churches.id and p.role = 'church_admin')))
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and (p.role = 'master' or (p.brand_id = churches.id and p.role = 'church_admin')))
  );

drop policy if exists "authenticated_all_campuses" on public.campuses;
create policy "authenticated_select_campuses"
  on public.campuses for select to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and (p.role = 'master' or p.brand_id = campuses.church_id))
  );
create policy "write_campuses"
  on public.campuses for all to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and (p.role = 'master' or (p.brand_id = campuses.church_id and p.role = 'church_admin')))
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and (p.role = 'master' or (p.brand_id = campuses.church_id and p.role = 'church_admin')))
  );

drop policy if exists "authenticated_all_totems" on public.totems;
create policy "authenticated_select_totems"
  on public.totems for select to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and (p.role = 'master' or p.brand_id = totems.church_id))
  );
create policy "write_totems"
  on public.totems for all to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and (p.role = 'master' or (p.brand_id = totems.church_id and p.role = 'church_admin')))
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and (p.role = 'master' or (p.brand_id = totems.church_id and p.role = 'church_admin')))
  );

drop policy if exists "authenticated_all_device_logs" on public.device_logs;
create policy "authenticated_select_device_logs"
  on public.device_logs for select to authenticated
  using (
    exists (
      select 1 from public.totems t join public.profiles p on p.id = auth.uid()
      where t.id = device_logs.totem_id and (p.role = 'master' or p.brand_id = t.church_id)
    )
  );
create policy "write_device_logs"
  on public.device_logs for all to authenticated
  using (
    exists (
      select 1 from public.totems t join public.profiles p on p.id = auth.uid()
      where t.id = device_logs.totem_id and (p.role = 'master' or (p.brand_id = t.church_id and p.role = 'church_admin'))
    )
  )
  with check (
    exists (
      select 1 from public.totems t join public.profiles p on p.id = auth.uid()
      where t.id = device_logs.totem_id and (p.role = 'master' or (p.brand_id = t.church_id and p.role = 'church_admin'))
    )
  );

-- ── messaging_gateways: mesmo split ──────────────────────────────────────

drop policy if exists "authenticated_all_messaging_gateways" on public.messaging_gateways;
create policy "authenticated_select_messaging_gateways"
  on public.messaging_gateways for select to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and (p.role = 'master' or p.brand_id = messaging_gateways.church_id))
  );
create policy "write_messaging_gateways"
  on public.messaging_gateways for all to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and (p.role = 'master' or (p.brand_id = messaging_gateways.church_id and p.role = 'church_admin')))
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and (p.role = 'master' or (p.brand_id = messaging_gateways.church_id and p.role = 'church_admin')))
  );

-- ── registrations: UPDATE/DELETE passam a excluir viewer, mas permitem
-- campus_admin (é o trabalho operacional dele -- atender cadastros) ────

drop policy if exists "authenticated_update_registrations" on public.registrations;
create policy "authenticated_update_registrations"
  on public.registrations for update to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (p.role = 'master' or (p.brand_id = registrations.brand_id and p.role in ('church_admin', 'campus_admin')))
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (p.role = 'master' or (p.brand_id = registrations.brand_id and p.role in ('church_admin', 'campus_admin')))
    )
  );

drop policy if exists "authenticated_delete_registrations" on public.registrations;
create policy "authenticated_delete_registrations"
  on public.registrations for delete to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (p.role = 'master' or (p.brand_id = registrations.brand_id and p.role in ('church_admin', 'campus_admin')))
    )
  );
