import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

/** Цвет значков в статус-баре — под светлую или тёмную тему системы. */
export async function initNative() {
  if (!Capacitor.isNativePlatform()) return;
  const dark = window.matchMedia('(prefers-color-scheme: dark)');
  const apply = () =>
    StatusBar.setStyle({ style: dark.matches ? Style.Dark : Style.Light }).catch(() => {
      // На части устройств стиль статус-бара недоступен — не критично.
    });
  await apply();
  dark.addEventListener('change', () => void apply());
  await SplashScreen.hide().catch(() => {});
}
