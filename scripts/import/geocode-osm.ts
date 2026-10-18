/**
 * Ставит координаты ЖК по полю geocode_query через Nominatim (OpenStreetMap).
 * Точность — до улицы. Уже заполненные координаты не трогает; --force пересчитывает все.
 * Правила Nominatim: не больше 1 запроса в секунду и понятный User-Agent.
 */
import { loadCurated, writeJson } from './curated.ts';

const force = process.argv.includes('--force');
const USER_AGENT = 'CompareHomeKZ-data-import/0.1';
const COARSE_TYPES = new Set(['country', 'state', 'region', 'county', 'city', 'town', 'municipality']);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function geocode(query: string, near: { lat: number; lng: number }) {
  // Ограничиваем поиск окрестностью города, чтобы не найти одноимённую улицу в другом месте.
  const d = 0.3;
  const params = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    countrycodes: 'kz',
    limit: '1',
    'accept-language': 'ru',
    viewbox: `${near.lng - d},${near.lat + d},${near.lng + d},${near.lat - d}`,
    bounded: '1',
  });
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { 'User-Agent': USER_AGENT },
  });
  if (!res.ok) throw new Error(`Nominatim ${res.status} для «${query}»`);
  const rows = (await res.json()) as {
    lat: string;
    lon: string;
    display_name: string;
    addresstype: string;
  }[];
  const first = rows[0];
  // Попадание в город целиком вместо улицы хуже, чем отсутствие метки.
  if (!first || COARSE_TYPES.has(first.addresstype)) return null;
  return { lat: Number(first.lat), lng: Number(first.lon), label: first.display_name };
}

const { cities, complexes } = loadCurated();
const cityById = new Map(cities.map((c) => [c.id, c]));

let updated = 0;
for (const complex of complexes) {
  if (!complex.geocode_query) {
    console.log(`– ${complex.id}: нет адреса для поиска, пропускаю`);
    continue;
  }
  if (!force && complex.lat != null && complex.lng != null) continue;

  const city = cityById.get(complex.city_id)!;
  const hit = await geocode(complex.geocode_query, city);
  await sleep(1100);
  if (!hit) {
    console.log(`✗ ${complex.id}: «${complex.geocode_query}» не найдено`);
    continue;
  }
  complex.lat = Math.round(hit.lat * 1e5) / 1e5;
  complex.lng = Math.round(hit.lng * 1e5) / 1e5;
  updated++;
  console.log(`✓ ${complex.id}: ${complex.lat}, ${complex.lng} — ${hit.label}`);
}

if (updated > 0) {
  writeJson('complexes.json', complexes);
  console.log(`Записано координат: ${updated}`);
}
