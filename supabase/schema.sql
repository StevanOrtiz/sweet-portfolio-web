-- Run in the Supabase SQL editor when you switch to VITE_CONTENT_SOURCE=supabase.
-- Then create an admin user under Authentication > Users and disable public sign-ups.

create table if not exists categories (id uuid primary key default gen_random_uuid(), name text not null, sort int not null default 0);
create table if not exists works (
  id uuid primary key default gen_random_uuid(), title text not null, description text not null default '',
  category_id uuid references categories(id) on delete set null, images text[] not null default '{}',
  tools text not null default '', tags text not null default '', published boolean not null default true, sort int not null default 0
);
create table if not exists services (id uuid primary key default gen_random_uuid(), title text not null, description text not null default '', icon text not null default 'box', sort int not null default 0);
create table if not exists links (id uuid primary key default gen_random_uuid(), type text not null default 'other', label text not null, url text not null, note text not null default '', sort int not null default 0);
create table if not exists tools (id uuid primary key default gen_random_uuid(), name text not null, level int not null default 50, note text not null default '', icon text not null default 'cube', sort int not null default 0);
create table if not exists stats (id uuid primary key default gen_random_uuid(), label text not null, value text not null default '', sort int not null default 0);
create table if not exists timeline (id uuid primary key default gen_random_uuid(), year text not null default '', title text not null, text text not null default '', sort int not null default 0);
create table if not exists faq (id uuid primary key default gen_random_uuid(), q text not null, a text not null default '', sort int not null default 0);
create table if not exists profile (
  id uuid primary key default gen_random_uuid(), name text not null default '', tagline text not null default '',
  bio text not null default '', avatar text not null default '', skills text not null default '', facts text not null default ''
);
create table if not exists availability (id uuid primary key default gen_random_uuid(), open boolean not null default true, response text not null default '', preferred text not null default 'discord');
create table if not exists site_texts (key text primary key, value text not null default '');

-- Migrations for projects created with an earlier version of this file.
alter table links add column if not exists note text not null default '';
alter table profile add column if not exists facts text not null default '';

do $$
declare t text;
begin
  foreach t in array array['categories','works','services','links','tools','stats','timeline','faq','profile','availability','site_texts'] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "admin write" on %I', t);
    execute format('create policy "admin write" on %I for all to authenticated using (true) with check (true)', t);
    if t <> 'works' then
      execute format('drop policy if exists "public read" on %I', t);
      execute format('create policy "public read" on %I for select using (true)', t);
    end if;
  end loop;
end $$;

drop policy if exists "public read published" on works;
create policy "public read published" on works for select using (published or auth.role() = 'authenticated');

insert into storage.buckets (id, name, public) values ('renders', 'renders', true) on conflict do nothing;
drop policy if exists "public read renders" on storage.objects;
create policy "public read renders" on storage.objects for select using (bucket_id = 'renders');
drop policy if exists "admin write renders" on storage.objects;
create policy "admin write renders" on storage.objects for all to authenticated using (bucket_id = 'renders') with check (bucket_id = 'renders');
