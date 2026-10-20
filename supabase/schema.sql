-- Run in the Supabase SQL editor. Then create an admin user under Authentication > Users.

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort int not null default 0
);
create table if not exists works (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  category_id uuid references categories(id) on delete set null,
  images text[] not null default '{}',
  tools text not null default '',
  tags text not null default '',
  published boolean not null default true,
  sort int not null default 0
);
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  icon text not null default 'box',
  sort int not null default 0
);
create table if not exists links (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'other',  -- discord, email, roblox, x, github, linkedin, other
  label text not null,
  url text not null,
  sort int not null default 0
);
create table if not exists profile (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  tagline text not null default '',
  bio text not null default '',
  avatar text not null default '',
  skills text not null default ''
);
create table if not exists site_texts (
  key text primary key,
  value text not null default ''
);

alter table categories enable row level security;
alter table works enable row level security;
alter table services enable row level security;
alter table links enable row level security;
alter table profile enable row level security;
alter table site_texts enable row level security;

do $$
declare t text;
begin
  foreach t in array array['categories','services','links','profile','site_texts'] loop
    execute format('create policy "public read" on %I for select using (true)', t);
    execute format('create policy "admin write" on %I for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;

create policy "public read published" on works for select using (published or auth.role() = 'authenticated');
create policy "admin write" on works for all to authenticated using (true) with check (true);

-- Storage bucket for renders
insert into storage.buckets (id, name, public) values ('renders', 'renders', true) on conflict do nothing;
create policy "public read renders" on storage.objects for select using (bucket_id = 'renders');
create policy "admin write renders" on storage.objects for all to authenticated
  using (bucket_id = 'renders') with check (bucket_id = 'renders');

-- Migration for existing projects: short message shown in the Contact window.
alter table links add column if not exists note text not null default '';
