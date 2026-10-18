import { Link } from 'react-router-dom';
import { useTabHref } from '../app/tabs';
import {
  SAFETY_LABEL,
  formatArea,
  formatCompletion,
  formatPrice,
  formatPricePerM2,
  formatRooms,
} from '../domain/format';
import type { Apartment } from '../domain/types';
import styles from './ApartmentRow.module.css';
import { CompareToggle } from './CompareToggle';
import { Footprint } from './Footprint';
import { SafetyGlyph } from './SafetyStatus';

interface Props {
  apartment: Apartment;
  /** Без названия ЖК — внутри страницы ЖК оно лишнее. */
  hideComplex?: boolean;
}

export function ApartmentRow({ apartment: a, hideComplex = false }: Props) {
  const href = useTabHref();
  const floor = a.floor == null ? '' : `, ${a.floor}${a.floorsTotal ? ` из ${a.floorsTotal}` : ''} эт.`;
  return (
    <li className={styles.row}>
      <Link to={href(`/apartment/${a.id}`)} className={styles.main}>
        <span className={styles.plan}>
          <Footprint area={a.area} rooms={a.rooms} kitchenArea={a.kitchenArea} scale="list" />
        </span>
        <span className={styles.info}>
          <span className={`${styles.price} ${styles.besideAction} drafted`}>{formatPrice(a.price)}</span>
          <span className={`${styles.line} ${styles.besideAction}`}>
            {formatArea(a.area)}, {formatRooms(a.rooms)}
            {floor}
          </span>
          <span className={`${styles.line} ${styles.muted}`}>
            {formatPricePerM2(a.pricePerM2)}
            {!hideComplex && (
              <>
                , <span className={styles.complex}>{a.complexName}</span>, {a.developerName}
              </>
            )}
          </span>
          <span className={`${styles.line} ${styles.meta}`}>
            <SafetyGlyph status={a.safety} />
            {SAFETY_LABEL[a.safety]}, сдача {formatCompletion(a.completion, a.complexStatus)}
          </span>
          {a.isDemo && <span className={styles.demo}>Демо</span>}
        </span>
      </Link>
      <span className={styles.action}>
        <CompareToggle id={a.id} compact />
      </span>
    </li>
  );
}
