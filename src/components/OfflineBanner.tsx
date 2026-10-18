import { Network } from '@capacitor/network';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { formatDayMonth } from '../domain/format';
import styles from './OfflineBanner.module.css';

function useOnline() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    let active = true;
    void Network.getStatus().then((s) => active && setOnline(s.connected));
    const sub = Network.addListener('networkStatusChange', (s) => setOnline(s.connected));
    return () => {
      active = false;
      void sub.then((h) => h.remove());
    };
  }, []);
  return online;
}

export function OfflineBanner() {
  const online = useOnline();
  const client = useQueryClient();
  if (online) return null;
  const updated = Math.max(0, ...client.getQueryCache().getAll().map((q) => q.state.dataUpdatedAt));
  return (
    <p className={styles.banner} role="status">
      {updated
        ? `Нет соединения. Показаны данные от ${formatDayMonth(new Date(updated))}.`
        : 'Нет соединения. Подключитесь к интернету, чтобы загрузить каталог.'}
    </p>
  );
}
