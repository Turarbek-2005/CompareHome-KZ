import { IonContent, IonFooter, IonModal } from '@ionic/react';
import { FINISHING_LABEL, HOUSING_CLASS_LABEL, SAFETY_LABEL, plural } from '../domain/format';
import type { Filters } from '../domain/filters';
import type { Finishing, HousingClass, SafetyStatus } from '../domain/types';
import { Chips } from './Chips';
import styles from './FilterSheet.module.css';
import { RangeField } from './RangeField';

interface Props {
  open: boolean;
  onClose: () => void;
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
  /** Сколько квартир подходит при текущих фильтрах. */
  resultCount: number;
}

const classes = Object.entries(HOUSING_CLASS_LABEL).map(([value, label]) => ({ value: value as HousingClass, label }));
const finishing = Object.entries(FINISHING_LABEL).map(([value, label]) => ({ value: value as Finishing, label }));
const safety = (['kzhk_guarantee', 'bank', 'akimat_permit', 'unknown'] as SafetyStatus[]).map((value) => ({
  value,
  label: SAFETY_LABEL[value],
}));
const years = [2026, 2027, 2028].map((y) => ({ value: y, label: `До конца ${y}` }));

export function FilterSheet({ open, onClose, filters: f, onChange, onReset, resultCount }: Props) {
  return (
    <IonModal
      isOpen={open}
      onDidDismiss={onClose}
      breakpoints={[0, 1]}
      initialBreakpoint={1}
      className="sheet"
      aria-label="Фильтры"
    >
      <IonContent>
        <div className={styles.body}>
          <div className={styles.head}>
            <h2 className={styles.title}>Фильтры</h2>
            <button type="button" className="btn-quiet" onClick={onReset}>
              Сбросить
            </button>
          </div>

          <RangeField
            label="Цена, млн ₸"
            unit={1_000_000}
            min={f.priceMin}
            max={f.priceMax}
            onChange={(priceMin, priceMax) => onChange({ priceMin, priceMax })}
          />
          <RangeField
            label="Площадь, м²"
            min={f.areaMin}
            max={f.areaMax}
            onChange={(areaMin, areaMax) => onChange({ areaMin, areaMax })}
          />

          <div className="field">
            <span className="field-label">Защита дольщиков</span>
            <Chips label="Защита дольщиков" options={safety} selected={f.safety} onChange={(v) => onChange({ safety: v })} />
          </div>
          <div className="field">
            <span className="field-label">Сдача</span>
            <Chips
              label="Сдача"
              single
              options={years}
              selected={f.completionBy == null ? [] : [f.completionBy]}
              onChange={(v) => onChange({ completionBy: v[0] ?? null })}
            />
          </div>
          <div className="field">
            <span className="field-label">Класс</span>
            <Chips label="Класс" options={classes} selected={f.classes} onChange={(v) => onChange({ classes: v })} />
          </div>
          <div className="field">
            <span className="field-label">Отделка</span>
            <Chips label="Отделка" options={finishing} selected={f.finishing} onChange={(v) => onChange({ finishing: v })} />
          </div>
        </div>
      </IonContent>
      {/* IonFooter в шторке Ionic держит у нижнего края видимой части, а не всей модалки. */}
      <IonFooter className={styles.footer}>
        <button type="button" className="btn btn-primary btn-block" onClick={onClose} disabled={resultCount === 0}>
          {resultCount === 0
            ? 'Нет квартир с такими условиями'
            : `Показать ${resultCount} ${plural(resultCount, ['квартиру', 'квартиры', 'квартир'])}`}
        </button>
      </IonFooter>
    </IonModal>
  );
}
