import type { Finishing, HousingClass, SafetyStatus } from './types';

export type SortKey = 'price' | 'ppm2' | 'area' | 'completion';
export type CatalogView = 'apartments' | 'complexes';

export interface Filters {
  /** 4 — «4 и больше». */
  rooms: number[];
  priceMin: number | null;
  priceMax: number | null;
  areaMin: number | null;
  areaMax: number | null;
  classes: HousingClass[];
  finishing: Finishing[];
  safety: SafetyStatus[];
  /** Сдача не позже этого года. */
  completionBy: number | null;
  query: string;
}

export const EMPTY_FILTERS: Filters = {
  rooms: [],
  priceMin: null,
  priceMax: null,
  areaMin: null,
  areaMax: null,
  classes: [],
  finishing: [],
  safety: [],
  completionBy: null,
  query: '',
};

/** Сколько фильтров из шторки включено — для бейджа на кнопке. */
export function activeFilterCount(f: Filters): number {
  return (
    (f.priceMin != null || f.priceMax != null ? 1 : 0) +
    (f.areaMin != null || f.areaMax != null ? 1 : 0) +
    (f.classes.length ? 1 : 0) +
    (f.finishing.length ? 1 : 0) +
    (f.safety.length ? 1 : 0) +
    (f.completionBy != null ? 1 : 0)
  );
}
