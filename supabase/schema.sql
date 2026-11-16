-- TIGRIS – Datenbank-Schema für Supabase (im SQL-Editor einmal komplett ausführen)
-- Konten (auth.users) kommen von Supabase Auth. Hier: Profile, Admins, Ereignisse, Uploads, Projekte, Admin-Auswertungen.

-- ---------- Profile ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  full_name text,
  company text,
  role text,
  city text,
  country text,
  phone text,
  marketing_opt_in boolean not null default false,
  marketing_opt_in_at timestamptz,
  terms_accepted_at timestamptz,
  tracking_consent boolean not null default false,
  tracking_consent_at timestamptz,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz
);

-- ---------- Admins ----------
create table if not exists public.admins (
  user_id uuid primary key references auth.users on delete cascade
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid())
$$;

-- Profil automatisch anlegen, wenn sich jemand registriert (E-Mail oder Google)
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.profiles (id, email, full_name, company, role, city, country, phone,
    marketing_opt_in, marketing_opt_in_at, terms_accepted_at, tracking_consent, tracking_consent_at)
  values (new.id, new.email,
    coalesce(m->>'full_name', m->>'name'), m->>'company', m->>'role', m->>'city', m->>'country', m->>'phone',
    coalesce((m->>'marketing_opt_in')::boolean, false),
    case when coalesce((m->>'marketing_opt_in')::boolean, false) then now() end,
    case when coalesce((m->>'terms_accepted')::boolean, false) then now() end,
    coalesce((m->>'tracking_consent')::boolean, false),
    case when coalesce((m->>'tracking_consent')::boolean, false) then now() end)
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Konto löschen (Recht auf Löschung): löscht auth.users -> alles andere per CASCADE
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public as $$
begin
  delete from storage.objects where bucket_id = 'plans' and (storage.foldername(name))[1] = auth.uid()::text;
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- ---------- Ereignisse (Nutzungsanalyse, nur nach Einwilligung im Browser) ----------
create table if not exists public.events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  user_id uuid references auth.users on delete cascade,
  anon_id text not null,
  session_id text not null,
  type text not null,
  data jsonb not null default '{}'::jsonb,
  path text
);
create index if not exists events_user_idx on public.events (user_id, created_at desc);
create index if not exists events_type_idx on public.events (type, created_at desc);
create index if not exists events_anon_idx on public.events (anon_id);

-- last_seen_at im Profil mitführen
create or replace function public.touch_last_seen() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.user_id is not null then
    update public.profiles set last_seen_at = new.created_at where id = new.user_id and (last_seen_at is null or last_seen_at < new.created_at);
  end if;
  return new;
end $$;
drop trigger if exists events_touch on public.events;
create trigger events_touch after insert on public.events for each row execute function public.touch_last_seen();

-- ---------- Uploads (Grundriss-Bilder) und Projekte ----------
create table if not exists public.uploads (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  path text,
  file_name text,
  size int,
  mime text,
  result jsonb not null default '{}'::jsonb
);
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  data jsonb,
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

-- ---------- Row Level Security ----------
alter table public.profiles enable row level security;
alter table public.admins enable row level security;
alter table public.events enable row level security;
alter table public.uploads enable row level security;
alter table public.projects enable row level security;

drop policy if exists "profiles read" on public.profiles;
create policy "profiles read" on public.profiles for select using (id = auth.uid() or public.is_admin());
drop policy if exists "profiles insert" on public.profiles;
create policy "profiles insert" on public.profiles for insert with check (id = auth.uid());
drop policy if exists "profiles update" on public.profiles;
create policy "profiles update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "admins self" on public.admins;
create policy "admins self" on public.admins for select using (user_id = auth.uid());

drop policy if exists "events insert" on public.events;
create policy "events insert" on public.events for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());
drop policy if exists "events admin read" on public.events;
create policy "events admin read" on public.events for select using (public.is_admin());

drop policy if exists "uploads own" on public.uploads;
create policy "uploads own" on public.uploads for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "uploads admin read" on public.uploads;
create policy "uploads admin read" on public.uploads for select using (public.is_admin());

drop policy if exists "projects own" on public.projects;
create policy "projects own" on public.projects for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "projects admin read" on public.projects;
create policy "projects admin read" on public.projects for select using (public.is_admin());

-- ---------- Storage: privater Bucket für hochgeladene Pläne ----------
insert into storage.buckets (id, name, public) values ('plans', 'plans', false) on conflict (id) do nothing;
drop policy if exists "plans upload own" on storage.objects;
create policy "plans upload own" on storage.objects for insert to authenticated
  with check (bucket_id = 'plans' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "plans read own or admin" on storage.objects;
create policy "plans read own or admin" on storage.objects for select to authenticated
  using (bucket_id = 'plans' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- ---------- Auswertungen für die Admin-Ansicht (RLS greift: nur Admins sehen alles) ----------
create or replace view public.admin_user_overview with (security_invoker = on) as
select p.*,
  (select count(*) from public.events e where e.user_id = p.id) as events,
  (select coalesce(sum((e.data->>'sec')::int), 0) from public.events e where e.user_id = p.id and e.type = 'heartbeat') as active_seconds,
  (select count(distinct e.session_id) from public.events e where e.user_id = p.id) as sessions,
  (select count(*) from public.uploads u where u.user_id = p.id) as uploads
from public.profiles p;

create or replace view public.admin_item_popularity with (security_invoker = on) as
select e.data->>'item' as item, max(e.data->>'name') as name, count(*) as adds,
  count(distinct coalesce(e.user_id::text, e.anon_id)) as users
from public.events e where e.type = 'add_item'
group by 1 order by 3 desc;

-- ---------- Nach der ersten eigenen Registrierung: sich selbst zum Admin machen ----------
-- insert into public.admins (user_id) select id from auth.users order by created_at limit 1;
