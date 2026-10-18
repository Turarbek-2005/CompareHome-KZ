-- CompareHome KZ: каталог новостроек для сравнения квартир.
-- Все таблицы только для чтения из приложения; запись — скриптами импорта (service role) и из панели Supabase.

create type public.housing_class as enum ('econom', 'comfort', 'business', 'premium');
create type public.wall_material as enum ('monolith', 'monolith_brick', 'brick', 'panel', 'gasblock', 'frame');
create type public.complex_status as enum ('planned', 'construction', 'completed');
-- unknown = мы не проверили статус по реестру; это не утверждение о риске.
create type public.safety_status as enum ('kzhk_guarantee', 'akimat_permit', 'bank', 'completed', 'unknown');
create type public.finishing_type as enum ('rough', 'whitebox', 'finished');
create type public.unit_status as enum ('available', 'reserved', 'sold');

create table public.cities (
  id text primary key,
  name text not null,
  lat double precision not null,
  lng double precision not null,
  sort smallint not null default 100
);

create table public.developers (
  id text primary key,
  name text not null,
  bin text check (bin is null or bin ~ '^\d{12}$'),
  founded_year smallint,
  website text,
  phone text,
  description text,
  completed_count integer,
  source_url text,
  verified_at date,
  is_demo boolean not null default false
);

create table public.complexes (
  id text primary key,
  developer_id text not null references public.developers (id) on delete cascade,
  city_id text not null references public.cities (id),
  name text not null,
  district text,
  address text,
  lat double precision,
  lng double precision,
  housing_class public.housing_class,
  wall_material public.wall_material,
  floors_min smallint,
  floors_max smallint,
  ceiling_height numeric(3, 2),
  completion_year smallint,
  completion_quarter smallint check (completion_quarter between 1 and 4),
  status public.complex_status not null default 'construction',
  safety public.safety_status not null default 'unknown',
  safety_note text,
  registry_url text,
  parking text,
  amenities text[] not null default '{}',
  installment jsonb,
  sales_url text,
  source_url text,
  collected_at date,
  is_demo boolean not null default false
);
create index complexes_city_idx on public.complexes (city_id);
create index complexes_developer_idx on public.complexes (developer_id);

create table public.apartments (
  id text primary key,
  complex_id text not null references public.complexes (id) on delete cascade,
  rooms smallint not null check (rooms between 0 and 6),
  area numeric(6, 2) not null check (area > 0),
  kitchen_area numeric(5, 2),
  living_area numeric(6, 2),
  floor smallint,
  floors_total smallint,
  price bigint not null check (price > 0),
  price_per_m2 bigint generated always as (round(price / area)::bigint) stored,
  finishing public.finishing_type,
  ceiling_height numeric(3, 2),
  bathrooms smallint,
  balcony boolean,
  layout jsonb,
  status public.unit_status not null default 'available',
  source_url text,
  collected_at date,
  is_demo boolean not null default false
);
create index apartments_complex_idx on public.apartments (complex_id);
create index apartments_price_idx on public.apartments (price);

create table public.mortgage_programs (
  id text primary key,
  bank text not null,
  name text not null,
  rate numeric(5, 2) not null,
  rate_note text,
  min_down_payment_pct numeric(5, 2) not null,
  -- пониженный взнос, например «от 10% для первичного жилья с чистовой отделкой»
  reduced_down_payment_pct numeric(5, 2),
  reduced_down_payment_note text,
  max_term_years smallint not null,
  max_amount_major bigint,
  max_amount_other bigint,
  housing_types text[] not null default '{}',
  note text,
  source_url text not null,
  verified_at date not null,
  sort smallint not null default 100
);

create table public.city_price_benchmarks (
  city_id text not null references public.cities (id),
  period text not null,
  price_per_m2 bigint not null,
  source_url text not null,
  primary key (city_id, period)
);

create table public.data_sources (
  id text primary key,
  title text not null,
  publisher text not null,
  url text not null,
  license text,
  used_for text not null,
  retrieved_at date not null,
  note text,
  sort smallint not null default 100
);

create view public.apartment_cards
with (security_invoker = true) as
select
  a.id,
  a.complex_id,
  a.rooms,
  a.area,
  a.kitchen_area,
  a.living_area,
  a.floor,
  a.floors_total,
  a.price,
  a.price_per_m2,
  a.finishing,
  coalesce(a.ceiling_height, c.ceiling_height) as ceiling_height,
  a.bathrooms,
  a.balcony,
  a.layout,
  a.status,
  a.source_url,
  a.collected_at,
  (a.is_demo or c.is_demo) as is_demo,
  c.name as complex_name,
  c.city_id,
  c.district,
  c.housing_class,
  c.wall_material,
  c.completion_year,
  c.completion_quarter,
  c.status as complex_status,
  c.safety,
  c.lat,
  c.lng,
  c.developer_id,
  d.name as developer_name,
  d.completed_count as developer_completed_count
from public.apartments a
join public.complexes c on c.id = a.complex_id
join public.developers d on d.id = c.developer_id;

-- Доступ: только чтение для всех.
alter table public.cities enable row level security;
alter table public.developers enable row level security;
alter table public.complexes enable row level security;
alter table public.apartments enable row level security;
alter table public.mortgage_programs enable row level security;
alter table public.city_price_benchmarks enable row level security;
alter table public.data_sources enable row level security;

create policy "Public read" on public.cities for select to anon, authenticated using (true);
create policy "Public read" on public.developers for select to anon, authenticated using (true);
create policy "Public read" on public.complexes for select to anon, authenticated using (true);
create policy "Public read" on public.apartments for select to anon, authenticated using (true);
create policy "Public read" on public.mortgage_programs for select to anon, authenticated using (true);
create policy "Public read" on public.city_price_benchmarks for select to anon, authenticated using (true);
create policy "Public read" on public.data_sources for select to anon, authenticated using (true);

revoke insert, update, delete, truncate on all tables in schema public from anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
