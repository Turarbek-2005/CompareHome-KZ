import { completionRank } from './format';
import type { Apartment } from './types';
import type { Filters, SortKey } from './filters';

function inRange(value: number, min: number | null, max: number | null): boolean {
  return (min == null || value >= min) && (max == null || value <= max);
}

export function filterApartments(apartments: Apartment[], f: Filters): Apartment[] {
  const q = f.query.trim().toLocaleLowerCase('ru');
  return apartments.filter((a) => {
    if (f.rooms.length && !f.rooms.some((r) => (r >= 4 ? a.rooms >= 4 : a.rooms === r))) return false;
    if (!inRange(a.price, f.priceMin, f.priceMax)) return false;
    if (!inRange(a.area, f.areaMin, f.areaMax)) return false;
    if (f.classes.length && (!a.housingClass || !f.classes.includes(a.housingClass))) return false;
    if (f.finishing.length && (!a.finishing || !f.finishing.includes(a.finishing))) return false;
    if (f.safety.length && !f.safety.includes(a.safety)) return false;
    if (f.completionBy != null && a.complexStatus !== 'completed') {
      if (!a.completion || a.completion.year > f.completionBy) return false;
    }
    if (q && !`${a.complexName} ${a.developerName}`.toLocaleLowerCase('ru').includes(q)) return false;
    return true;
  });
}

const BY: Record<SortKey, (a: Apartment) => number> = {
  price: (a) => a.price,
  ppm2: (a) => a.pricePerM2,
  area: (a) => -a.area,
  completion: (a) => completionRank(a.completion, a.complexStatus) ?? Number.MAX_SAFE_INTEGER,
};

export function sortApartments(apartments: Apartment[], sort: SortKey): Apartment[] {
  const key = BY[sort];
  return [...apartments].sort((a, b) => key(a) - key(b) || a.price - b.price);
}

export interface ComplexSummary {
  complexId: string;
  complexName: string;
  developerName: string;
  count: number;
  minPrice: number;
  maxPrice: number;
  minPpm2: number;
  maxPpm2: number;
  /** Квартиры ЖК из выборки — для мини-контуров. */
  apartments: Apartment[];
}

/** Группирует уже отфильтрованные квартиры по ЖК, сохраняя порядок первого появления. */
export function groupByComplex(apartments: Apartment[]): ComplexSummary[] {
  const map = new Map<string, ComplexSummary>();
  for (const a of apartments) {
    const s = map.get(a.complexId);
    if (!s) {
      map.set(a.complexId, {
        complexId: a.complexId,
        complexName: a.complexName,
        developerName: a.developerName,
        count: 1,
        minPrice: a.price,
        maxPrice: a.price,
        minPpm2: a.pricePerM2,
        maxPpm2: a.pricePerM2,
        apartments: [a],
      });
      continue;
    }
    s.count++;
    s.minPrice = Math.min(s.minPrice, a.price);
    s.maxPrice = Math.max(s.maxPrice, a.price);
    s.minPpm2 = Math.min(s.minPpm2, a.pricePerM2);
    s.maxPpm2 = Math.max(s.maxPpm2, a.pricePerM2);
    s.apartments.push(a);
  }
  return [...map.values()];
}

/** Средняя цена за м² по квартирам выборки — для сравнения ЖК со средней по городу. */
export function averagePricePerM2(apartments: Apartment[]): number | null {
  const area = apartments.reduce((s, a) => s + a.area, 0);
  if (!area) return null;
  return apartments.reduce((s, a) => s + a.price, 0) / area;
}
