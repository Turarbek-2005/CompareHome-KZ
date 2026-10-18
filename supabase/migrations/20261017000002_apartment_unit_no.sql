-- Номер квартиры на сайте застройщика, чтобы покупатель мог найти её в каталоге.
alter table public.apartments add column unit_no text;

create or replace view public.apartment_cards
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
  d.completed_count as developer_completed_count,
  a.unit_no
from public.apartments a
join public.complexes c on c.id = a.complex_id
join public.developers d on d.id = c.developer_id;
