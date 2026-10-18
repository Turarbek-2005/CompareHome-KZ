import { useBenchmarks } from '../data/queries';
import { cityLocative, formatPricePerM2 } from '../domain/format';
import styles from './BenchmarkDelta.module.css';

interface Props {
  cityId: string;
  pricePerM2: number;
  /** «Цена за м²» для квартиры, «Средняя цена за м²» для ЖК. */
  subject?: string;
}

/** Сравнение с официальной средней ценой нового жилья (БНС). */
export function BenchmarkDelta({ cityId, pricePerM2, subject = 'Цена за м²' }: Props) {
  const { data } = useBenchmarks();
  const b = data?.[cityId];
  if (!b) return null;
  const delta = Math.round((pricePerM2 / b.pricePerM2 - 1) * 100);
  const where = cityLocative(cityId);
  const text =
    delta === 0
      ? `${subject} на уровне средней ${where}`
      : `${subject} на ${Math.abs(delta)}% ${delta < 0 ? 'ниже' : 'выше'} средней ${where}`;
  return (
    <p className={styles.delta}>
      {text}.{' '}
      <span className={styles.source}>
        Средняя по данным БНС за {b.period} год: {formatPricePerM2(b.pricePerM2)}.
      </span>
    </p>
  );
}
