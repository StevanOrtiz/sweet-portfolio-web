-- SweetKanmi portfolio schema. Applied to the Supabase project with the connector;
-- keep this file in sync with the applied migration.
--
-- Security model:
--   * Anyone can READ published content.
--   * Only emails listed in private.admins can WRITE (rows and images), even if other people sign up.

create schema if not exists private;
grant usage on schema private to anon, authenticated;

create table if not exists private.admins (email text primary key);
alter table private.admins enable row level security; -- no policies: never readable through the API

create or replace function private.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from private.admins a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
$$;
revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to anon, authenticated;

create table public.categories (id uuid primary key default gen_random_uuid(), name text not null, sort int not null default 0);
create table public.works (
  id uuid primary key default gen_random_uuid(), title text not null, description text not null default '',
  category_id uuid references public.categories(id) on delete set null, images text[] not null default '{}',
  tools text not null default '', tags text not null default '', published boolean not null default true, sort int not null default 0
);
create table public.services (id uuid primary key default gen_random_uuid(), title text not null, description text not null default '', icon text not null default 'box', sort int not null default 0);
create table public.links (id uuid primary key default gen_random_uuid(), type text not null default 'other', label text not null, url text not null, note text not null default '', sort int not null default 0);
create table public.tools (id uuid primary key default gen_random_uuid(), name text not null, level int not null default 50, note text not null default '', icon text not null default 'cube', sort int not null default 0);
create table public.stats (id uuid primary key default gen_random_uuid(), label text not null, value text not null default '', sort int not null default 0);
create table public.timeline (id uuid primary key default gen_random_uuid(), year text not null default '', title text not null, text text not null default '', sort int not null default 0);
create table public.faq (id uuid primary key default gen_random_uuid(), q text not null, a text not null default '', sort int not null default 0);
create table public.profile (
  id uuid primary key default gen_random_uuid(), name text not null default '', tagline text not null default '',
  bio text not null default '', avatar text not null default '', skills text not null default '', facts text not null default ''
);
create table public.availability (id uuid primary key default gen_random_uuid(), open boolean not null default true, response text not null default '', preferred text not null default 'discord');
create table public.site_texts (key text primary key, value text not null default '');
create table public.studio (id uuid primary key default gen_random_uuid(), name text not null default '', tagline text not null default '', intro text not null default '', logo text not null default '', ceo_note text not null default '', join_text text not null default '');
create table public.studio_stats (id uuid primary key default gen_random_uuid(), label text not null, value text not null default '', sort int not null default 0);
create table public.studio_steps (id uuid primary key default gen_random_uuid(), title text not null, text text not null default '', sort int not null default 0);
create table public.studio_services (id uuid primary key default gen_random_uuid(), title text not null, description text not null default '', icon text not null default 'box', sort int not null default 0);
create table public.team (id uuid primary key default gen_random_uuid(), name text not null, role text not null default '', bio text not null default '', avatar text not null default '', skills text not null default '', link text not null default '', ceo boolean not null default false, sort int not null default 0);

create index works_category_id_idx on public.works (category_id);

do $$
declare t text;
begin
  foreach t in array array['categories','works','services','links','tools','stats','timeline','faq','profile','availability','site_texts','studio','studio_stats','studio_steps','studio_services','team'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "admin write" on public.%I for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()))', t);
    if t <> 'works' then
      execute format('create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
    end if;
  end loop;
end $$;

-- Visitors only see published works; admins see drafts too.
create policy "public read published" on public.works for select to anon, authenticated using (published or (select private.is_admin()));

-- Storage: public bucket for renders. Public URLs work without a policy; only admins can upload or manage files.
insert into storage.buckets (id, name, public) values ('renders', 'renders', true) on conflict (id) do nothing;
create policy "admin manage renders" on storage.objects for all to authenticated
  using (bucket_id = 'renders' and (select private.is_admin()))
  with check (bucket_id = 'renders' and (select private.is_admin()));
