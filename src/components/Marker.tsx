import type { ReactNode } from 'react';
import styles from './Marker.module.css';

/** Жёлтый маркер на лучшем значении. Смысл дублируется текстом для скринридера. */
export function Marker({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <mark className={styles.marker} style={{ animationDelay: `${delay}ms` }}>
      {children}
      <span className="visually-hidden">, лучшее значение</span>
    </mark>
  );
}
