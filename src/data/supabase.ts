import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error('Нет VITE_SUPABASE_URL или VITE_SUPABASE_PUBLISHABLE_KEY — скопируйте .env.example в .env.');
}

export const supabase = createClient<Database>(url, key, {
  // Приложение читает только публичные данные: сессия не нужна.
  auth: { persistSession: false, autoRefreshToken: false },
});
