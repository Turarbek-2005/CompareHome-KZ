import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { preferencesStorage } from './preferencesStorage';

interface FavoritesState {
  ids: string[];
  toggle: (id: string) => boolean;
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      /** Возвращает true, если квартира теперь в избранном. */
      toggle: (id) => {
        const { ids } = get();
        if (ids.includes(id)) {
          set({ ids: ids.filter((x) => x !== id) });
          return false;
        }
        set({ ids: [id, ...ids] });
        return true;
      },
    }),
    { name: 'favorites', storage: createJSONStorage(() => preferencesStorage) },
  ),
);
