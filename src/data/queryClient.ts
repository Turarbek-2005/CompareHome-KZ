import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { preferencesStorage } from '../store/preferencesStorage';

const WEEK = 7 * 24 * 60 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 60 * 1000,
      // Кэш живёт неделю: без сети показываем последние загруженные данные.
      gcTime: WEEK,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const persister = createAsyncStoragePersister({
  storage: preferencesStorage,
  key: 'comparehome-query-cache',
});

export const persistMaxAge = WEEK;
