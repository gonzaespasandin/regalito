-- Fase 1: schema inicial de regalito
-- Tablas: cities, categories, gifts, submissions + RLS + bucket de Storage gift-images

-- ============================================================
-- Enums
-- ============================================================
create type public.gift_status as enum ('active', 'inactive', 'draft');
create type public.submission_status as enum ('pending', 'approved', 'rejected');

-- ============================================================
-- Tablas
-- ============================================================
create table public.cities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  province text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon text not null,
  created_at timestamptz not null default now()
);

create table public.gifts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  business_name text not null,
  description text not null,
  requirements text[] not null default '{}',
  address text not null,
  image_url text,
  city_id uuid not null references public.cities (id) on delete restrict,
  category_id uuid not null references public.categories (id) on delete restrict,
  source_url text,
  status public.gift_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index gifts_city_id_idx on public.gifts (city_id);
create index gifts_category_id_idx on public.gifts (category_id);
create index gifts_status_idx on public.gifts (status);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  payload jsonb not null,
  submitter_email text,
  submitter_name text,
  status public.submission_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewer_email text
);

create index submissions_status_idx on public.submissions (status);

-- ============================================================
-- Trigger: mantiene gifts.updated_at
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger gifts_set_updated_at
  before update on public.gifts
  for each row
  execute function public.set_updated_at();

-- ============================================================
-- RLS
-- ============================================================
alter table public.cities enable row level security;
alter table public.categories enable row level security;
alter table public.gifts enable row level security;
alter table public.submissions enable row level security;

-- Las tablas nuevas no se exponen solas al Data API: grants explícitos.
grant select on public.cities to anon, authenticated;
grant select on public.categories to anon, authenticated;
grant select on public.gifts to anon, authenticated;
grant insert on public.submissions to anon, authenticated;

-- Catálogos: lectura pública.
create policy "cities son públicas"
  on public.cities for select
  to anon, authenticated
  using (true);

create policy "categories son públicas"
  on public.categories for select
  to anon, authenticated
  using (true);

-- gifts: solo los activos son visibles públicamente.
create policy "gifts activos son públicos"
  on public.gifts for select
  to anon, authenticated
  using (status = 'active');

-- submissions: cualquiera puede proponer; nadie puede leer.
-- La cola de moderación la lee el admin con service role (bypassa RLS).
create policy "cualquiera puede sumar un regalito"
  on public.submissions for insert
  to anon, authenticated
  with check (true);

-- ============================================================
-- Storage: bucket público para fotos/logos de marcas
-- ============================================================
insert into storage.buckets (id, name, public)
values ('gift-images', 'gift-images', true)
on conflict (id) do nothing;

-- Lectura pública de las imágenes. Las escrituras las hace el admin
-- con service role, que bypassa RLS.
create policy "gift-images lectura pública"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'gift-images');
