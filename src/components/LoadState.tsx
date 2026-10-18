import styles from './LoadState.module.css';

/** Заготовка списка без мерцания: пунктирные контуры на месте будущих квартир. */
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <ul className={styles.skeleton} aria-label="Загружаем">
      {Array.from({ length: rows }, (_, i) => (
        <li key={i}>
          <span className={styles.plan} style={{ width: 22 + ((i * 7) % 20), height: 18 + ((i * 5) % 16) }} />
          <span className={styles.lines}>
            <span style={{ width: '46%' }} />
            <span style={{ width: '72%' }} />
            <span style={{ width: '58%' }} />
          </span>
        </li>
      ))}
    </ul>
  );
}

export function LoadError({ what, onRetry }: { what: string; onRetry: () => void }) {
  return (
    <div className={styles.error} role="alert">
      <p>Не удалось загрузить {what}. Проверьте подключение к интернету и попробуйте ещё раз.</p>
      <button type="button" className="btn" onClick={onRetry}>
        Повторить
      </button>
    </div>
  );
}
