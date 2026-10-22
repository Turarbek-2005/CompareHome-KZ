/**
 * Проверяет data/curated/*.json и собирает из них supabase/seed.sql — идемпотентный upsert.
 * Применить: SQL Editor в панели Supabase, `supabase db reset` локально или через MCP execute_sql.
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadCurated, rootDir } from './curated.ts';

type Value = string | number | boolean | null | undefined | string[] | Record<string, unknown>;

function lit(v: Value): string {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (Array.isArray(v)) {
    return v.length ? `array[${v.map((s) => lit(s)).join(', ')}]::text[]` : `'{}'::text[]`;
  }
  if (typeof v === 'object') return `${lit(JSON.stringify(v))}::jsonb`;
  return `'${v.replaceAll("'", "''")}'`;
}

function upsert(table: string, rows: Record<string, Value>[], key: string[] = ['id']): string {
  if (rows.length === 0) return '';
  const cols = Object.keys(rows[0]!);
  const values = rows.map((r) => `  (${cols.map((c) => lit(r[c])).join(', ')})`).join(',\n');
  const updates = cols
    .filter((c) => !key.includes(c))
    .map((c) => `${c} = excluded.${c}`)
    .join(', ');
  return (
    `insert into public.${table} (${cols.join(', ')}) values\n${values}\n` +
    `on conflict (${key.join(', ')}) do update set ${updates};\n`
  );
}

const data = loadCurated();
const { collected_at } = data.apartments;

const apartmentRows = data.apartments.groups.flatMap((g) =>
  g.units.map((u) => ({
    id: `${g.complex_id}-${u.unit_no}`,
    complex_id: g.complex_id,
    unit_no: u.unit_no,
    rooms: u.rooms,
    area: u.area,
    kitchen_area: u.kitchen_area ?? null,
    floor: u.floor,
    floors_total: u.floors_total ?? g.floors_total ?? null,
    // У BAZIS-A на сайте указана цена за м², стоимость считаем сами.
    price: u.price ?? Math.round(u.price_per_m2! * u.area),
    finishing: u.finishing ?? g.finishing,
    status: 'available',
    source_url: g.source_url,
    collected_at,
    is_demo: false,
  })),
);

const ids = new Set<string>();
for (const a of apartmentRows) {
  if (ids.has(a.id)) throw new Error(`Повтор id квартиры: ${a.id}`);
  ids.add(a.id);
}

const curatedComplexIds = data.complexes.map((c) => c.id);

// Фото ЖК: обложка — первое фото снаружи; id стабилен, пока не меняется порядок в media.json.
const mediaRows = [
  ...data.media.complexes.flatMap((c) => {
    const counters = { exterior: 0, interior: 0 };
    return c.items.map((it, i) => ({
      id: `${c.complex_id}-${it.kind}-${++counters[it.kind]}`,
      complex_id: c.complex_id,
      apartment_id: null,
      kind: it.kind,
      url: it.url,
      thumb_url: it.thumb_url ?? null,
      caption: it.caption,
      credit: c.credit,
      source_url: c.source_url,
      collected_at: data.media.collected_at,
      sort: i,
    }));
  }),
  ...data.media.plans.map((p) => ({
    id: `${p.complex_id}-${p.unit_no}-plan`,
    complex_id: null,
    apartment_id: `${p.complex_id}-${p.unit_no}`,
    kind: 'plan',
    url: p.url,
    thumb_url: p.thumb_url ?? null,
    caption: null,
    credit: p.credit,
    source_url: p.source_url,
    collected_at: data.media.collected_at,
    sort: 0,
  })),
];

const sql = [
  '-- Сгенерировано scripts/import/seed-curated.ts из data/curated. Не редактируйте вручную.',
  'begin;',
  upsert('cities', data.cities),
  upsert('developers', data.developers),
  upsert(
    'complexes',
    data.complexes.map(({ geocode_query: _q, installment, ...c }) => ({
      ...c,
      lat: c.lat ?? null,
      lng: c.lng ?? null,
      installment: installment ?? null,
    })),
  ),
  // Квартиры, которых больше нет в выборке, удаляем — значит, они проданы или сняты с продажи.
  `delete from public.apartments where complex_id in (${curatedComplexIds.map((id) => lit(id)).join(', ')})\n` +
    `  and id not in (${apartmentRows.map((a) => lit(a.id)).join(', ')});`,
  upsert('apartments', apartmentRows),
  upsert('mortgage_programs', data.mortgagePrograms),
  upsert(
    'city_price_benchmarks',
    Object.entries(data.benchmarks.prices).map(([city_id, price_per_m2]) => ({
      city_id,
      period: data.benchmarks.period,
      price_per_m2,
      source_url: data.benchmarks.source_url,
    })),
    ['city_id', 'period'],
  ),
  upsert('data_sources', data.dataSources),
  // Изображения, которых больше нет в media.json, удаляем — например, застройщик убрал фото.
  `delete from public.media where id not in (${mediaRows.map((m) => lit(m.id)).join(', ')});`,
  upsert('media', mediaRows),
  'commit;',
].join('\n');

const out = resolve(rootDir, 'supabase/seed.sql');
writeFileSync(out, sql, 'utf8');
console.log(
  `seed.sql: застройщиков ${data.developers.length}, ЖК ${data.complexes.length}, ` +
    `квартир ${apartmentRows.length}, программ ${data.mortgagePrograms.length}, изображений ${mediaRows.length}`,
);
