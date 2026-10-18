import { IonFooter } from '@ionic/react';
import { Link } from 'react-router-dom';
import { useApartmentsByIds } from '../data/queries';
import { MAX_COMPARE } from '../domain/compare';
import { useCompare } from '../store/compare';
import styles from './CompareTray.module.css';
import { Footprint } from './Footprint';

/** Лоток над вкладками: что уже лежит в сравнении, в том же масштабе, что и список. */
export function CompareTray() {
  const ids = useCompare((s) => s.ids);
  const { data } = useApartmentsByIds(ids);
  if (ids.length === 0) return null;
  return (
    <IonFooter className={styles.footer} id="compare-tray">
      <div className={styles.tray}>
        <span className={styles.plans} aria-hidden="true">
          {(data ?? []).map((a) => (
            <Footprint key={a.id} area={a.area} rooms={a.rooms} kitchenArea={a.kitchenArea} scale="list" />
          ))}
        </span>
        <span className={styles.count}>
          {ids.length} из {MAX_COMPARE}
        </span>
        <Link to="/compare" className="btn btn-primary">
          {ids.length < 2 ? 'Открыть сравнение' : `Сравнить (${ids.length})`}
        </Link>
      </div>
    </IonFooter>
  );
}
