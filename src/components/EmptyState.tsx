import type { ReactNode } from 'react';
import styles from './EmptyState.module.css';

interface Props {
  title: string;
  text?: string;
  action?: ReactNode;
  /** Пунктирные контуры «пустых мест» — для пустого сравнения. */
  slots?: number;
}

export function EmptyState({ title, text, action, slots = 0 }: Props) {
  return (
    <div className={styles.empty}>
      {slots > 0 && (
        <div className={styles.slots} aria-hidden="true">
          {Array.from({ length: slots }, (_, i) => (
            <span key={i} className={styles.slot} style={{ width: 34 + i * 10, height: 28 + i * 6 }} />
          ))}
        </div>
      )}
      <h2 className={styles.title}>{title}</h2>
      {text && <p className={styles.text}>{text}</p>}
      {action}
    </div>
  );
}
