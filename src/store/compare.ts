import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { MAX_COMPARE } from '../domain/compare';
import { preferencesStorage } from './preferencesStorage';

interface CompareState {
  ids: string[];
  /** Программа для строк ипотеки в сравнении. */
  programId: string | null;
  termYears: number;
  onlyDifferences: boolean;
  /** false — список полон, квартира не добавлена. */
  add: (id: string) => boolean;
  remove: (id: string) => void;
  clear: () => void;
  setProgram: (id: string | null) => void;
  setOnlyDifferences: (value: boolean) => void;
}

export const useCompare = create<CompareState>()(
  persist(
    (set, get) => ({
      ids: [],
      programId: null,
      termYears: 19,
      onlyDifferences: false,
      add: (id) => {
        const { ids } = get();
        if (ids.includes(id)) return true;
        if (ids.length >= MAX_COMPARE) return false;
        set({ ids: [...ids, id] });
        return true;
      },
      remove: (id) => set({ ids: get().ids.filter((x) => x !== id) }),
      clear: () => set({ ids: [] }),
      setProgram: (programId) => set({ programId }),
      setOnlyDifferences: (onlyDifferences) => set({ onlyDifferences }),
    }),
    { name: 'compare', storage: createJSONStorage(() => preferencesStorage) },
  ),
);
