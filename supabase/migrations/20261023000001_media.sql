-- Изображения с сайтов застройщиков. Файлы не копируем: храним ссылку, автора и страницу-источник.
create type public.media_kind as enum ('plan', 'exterior', 'interior');

create table public.media (
  id text primary key,
  complex_id text references public.complexes (id) on delete cascade,
  apartment_id text references public.apartments (id) on delete cascade,
  kind public.media_kind not null,
  url text not null,
  thumb_url text,
  caption text,
  credit text not null,
  source_url text not null,
  collected_at date not null,
  sort smallint not null default 100,
  -- Изображение принадлежит либо ЖК (фото, интерьеры), либо квартире (планировка).
  constraint media_owner check ((complex_id is null) <> (apartment_id is null)),
  constraint media_plan_owner check ((kind = 'plan') = (apartment_id is not null))
);
create index media_complex_idx on public.media (complex_id);
create index media_apartment_idx on public.media (apartment_id);

alter table public.media enable row level security;
create policy "Public read" on public.media for select to anon, authenticated using (true);
revoke insert, update, delete, truncate on public.media from anon, authenticated;
grant select on public.media to anon, authenticated;
