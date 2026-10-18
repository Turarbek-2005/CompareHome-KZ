import { Preferences } from '@capacitor/preferences';

/**
 * Асинхронное хранилище поверх Capacitor Preferences:
 * на Android — SharedPreferences, в браузере — localStorage.
 */
export const preferencesStorage = {
  getItem: async (key: string) => (await Preferences.get({ key })).value,
  setItem: async (key: string, value: string) => {
    await Preferences.set({ key, value });
  },
  removeItem: async (key: string) => {
    await Preferences.remove({ key });
  },
};
