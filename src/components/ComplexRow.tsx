import { Link } from 'react-router-dom';
import { useTabHref } from '../app/tabs';
import type { ComplexSummary } from '../domain/catalog';
import { formatPricePerM2Range, formatPriceShort, plural } from '../domain/format';
import type { Media } from '../domain/types';
import styles from './ComplexRow.module.css';
import { Footprint } from './Footprint';
import { RemoteImage } from './RemoteImage';

/** Строка ЖК: диапазон цен, обложка и контуры квартир из выборки в масштабе списка. */
export function ComplexRow({ summary: s, cover }: { summary: ComplexSummary; cover?: Media }) {
  const href = useTabHref();
  const shown = s.apartments.slice(0, 6);
  return (
    <li className={styles.row}>
      <Link to={href(`/complex/${s.complexId}`)} className={styles.link}>
        <span className={styles.head}>
          <span className={styles.titles}>
            <span className={styles.name}>{s.complexName}</span>
            <span className={styles.developer}>{s.developerName}</span>
          </span>
          {cover && (
            <span className={styles.cover}>
              <RemoteImage src={cover.thumbUrl ?? cover.url} alt="" ratio="4 / 3" />
            </span>
          )}
        </span>
        <span className={styles.plans} aria-hidden="true">
          {shown.map((a) => (
            <Footprint key={a.id} area={a.area} rooms={a.rooms} kitchenArea={a.kitchenArea} scale="list" />
          ))}
          {s.count > shown.length && <span className={styles.more}>+{s.count - shown.length}</span>}
        </span>
        <span className={`${styles.price} num`}>
          от {formatPriceShort(s.minPrice)}, {formatPricePerM2Range(s.minPpm2, s.maxPpm2)}
        </span>
        <span className={styles.count}>
          {s.count} {plural(s.count, ['квартира', 'квартиры', 'квартир'])} в выборке
        </span>
      </Link>
    </li>
  );
}
