import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { MAX_COMPARE } from '../domain/compare';
import { useCompare } from '../store/compare';
import styles from './CompareToggle.module.css';
import { useAppToast } from './useAppToast';

interface Props {
  id: string;
  /** Квадратная кнопка со значком вкладки «Сравнение» — для строк списка. */
  compact?: boolean;
}

function Glyph({ checked }: { checked: boolean }) {
  return (
    <svg className={styles.icon} viewBox="0 0 16 16" aria-hidden="true">
      {checked ? (
        <path d="M3 8.5l3 3 7-7" />
      ) : (
        <>
          <rect x="1.5" y="7" width="5" height="5.5" />
          <rect x="8.5" y="3.5" width="6" height="9" />
          <path d="M0.5 14.75h15" />
        </>
      )}
    </svg>
  );
}

export function CompareToggle({ id, compact = false }: Props) {
  const inCompare = useCompare((s) => s.ids.includes(id));
  const add = useCompare((s) => s.add);
  const remove = useCompare((s) => s.remove);
  const say = useAppToast();

  const onClick = () => {
    if (inCompare) {
      remove(id);
      say('Убрано из сравнения');
      return;
    }
    if (add(id)) {
      void Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
      say('Добавлено к сравнению');
    } else {
      say(`В сравнении уже ${MAX_COMPARE} квартиры. Уберите одну, чтобы добавить эту.`);
    }
  };

  if (compact) {
    return (
      <button
        type="button"
        className={styles.square}
        aria-pressed={inCompare}
        aria-label={inCompare ? 'В сравнении, убрать' : 'Добавить к сравнению'}
        onClick={onClick}
      >
        <Glyph checked={inCompare} />
      </button>
    );
  }

  return (
    <button type="button" className={`${styles.toggle} btn btn-block`} aria-pressed={inCompare} onClick={onClick}>
      <Glyph checked={inCompare} />
      {inCompare ? 'В сравнении' : 'Добавить к сравнению'}
    </button>
  );
}
