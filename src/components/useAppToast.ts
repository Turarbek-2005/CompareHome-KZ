import { useIonToast } from '@ionic/react';
import { useCallback } from 'react';

/** Тост над лотком сравнения или панелью вкладок — чтобы не закрывал их. */
export function useAppToast() {
  const [present] = useIonToast();
  return useCallback(
    (message: string) => {
      const anchor = ['compare-tray', 'app-tabbar'].find((id) => document.getElementById(id));
      void present({ message, duration: 1800, position: 'bottom', positionAnchor: anchor, cssClass: 'app-toast' });
    },
    [present],
  );
}
