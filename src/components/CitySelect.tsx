import { useCities } from '../data/queries';
import styles from './CitySelect.module.css';

interface Props {
  value: string;
  onChange: (cityId: string) => void;
}

/** Нативный выбор города: на Android открывается системный список. Показываем только города, где есть ЖК. */
export function CitySelect({ value, onChange }: Props) {
  const { data } = useCities();
  const cities = (data ?? []).filter((c) => c.complexCount > 0 || c.id === value);
  const current = cities.find((c) => c.id === value);
  return (
    <label className={styles.select}>
      <span className="visually-hidden">Город</span>
      <span aria-hidden="true" className={styles.value}>
        {current?.name ?? 'Город'}
        <svg viewBox="0 0 12 12" className={styles.chevron}>
          <path d="M2.5 4.5 6 8l3.5-3.5" />
        </svg>
      </span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {cities.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}, {c.complexCount} ЖК
          </option>
        ))}
      </select>
    </label>
  );
}
