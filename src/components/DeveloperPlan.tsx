import type { Media } from '../domain/types';
import styles from './DeveloperPlan.module.css';
import { RemoteImage } from './RemoteImage';

interface Props {
  plan: Media;
  onOpen: () => void;
  /** Миниатюра для колонок сравнения. */
  compact?: boolean;
}

/** Планировка застройщика на белом листе; касание открывает её на весь экран. */
export function DeveloperPlan({ plan, onOpen, compact = false }: Props) {
  return (
    <button
      type="button"
      className={compact ? styles.compact : styles.button}
      onClick={onOpen}
      aria-label="Открыть планировку застройщика"
    >
      <RemoteImage
        src={plan.thumbUrl ?? plan.url}
        alt="Планировка застройщика"
        fit="contain"
        sheet
        ratio={compact ? '1 / 1' : '4 / 3'}
        fallback={<span className={styles.missing}>Планировка недоступна на сайте застройщика</span>}
      />
    </button>
  );
}
