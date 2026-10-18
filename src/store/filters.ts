import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { EMPTY_FILTERS, type CatalogView, type Filters, type SortKey } from '../domain/filters';
import { preferencesStorage } from './preferencesStorage';

interface CatalogState {
  cityId: string;
  filters: Filters;
  sort: SortKey;
  view: CatalogView;
  setCity: (id: string) => void;
  setFilters: (patch: Partial<Filters>) => void;
  resetFilters: () => void;
  setSort: (sort: SortKey) => void;
  setView: (view: CatalogView) => void;
}

export const useCatalog = create<CatalogState>()(
  persist(
    (set, get) => ({
      cityId: 'astana',
      filters: EMPTY_FILTERS,
      sort: 'price',
      view: 'apartments',
      setCity: (cityId) => set({ cityId }),
      setFilters: (patch) => set({ filters: { ...get().filters, ...patch } }),
      // Поиск по названию — не фильтр из шторки, его не сбрасываем.
      resetFilters: () => set({ filters: { ...EMPTY_FILTERS, query: get().filters.query } }),
      setSort: (sort) => set({ sort }),
      setView: (view) => set({ view }),
    }),
    { name: 'catalog', storage: createJSONStorage(() => preferencesStorage) },
  ),
);
