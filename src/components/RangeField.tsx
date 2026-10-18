import { useId, useState } from 'react';
import styles from './RangeField.module.css';

interface Props {
  label: string;
  /** Во сколько раз значение в поле меньше хранимого: цена вводится в млн ₸. */
  unit?: number;
  min: number | null;
  max: number | null;
  onChange: (min: number | null, max: number | null) => void;
}

function toText(v: number | null, unit: number) {
  return v == null ? '' : String(Math.round((v / unit) * 100) / 100).replace('.', ',');
}

function parse(s: string, unit: number): number | null {
  const n = Number(s.replace(',', '.').replace(/\s/g, ''));
  return s.trim() === '' || !Number.isFinite(n) || n < 0 ? null : n * unit;
}

/** Поле держит введённый текст как есть («2,», «2,5»), а наружу отдаёт число. */
function NumberInput(props: { id: string; placeholder: string; value: number | null; unit: number; onValue: (v: number | null) => void }) {
  const { id, placeholder, value, unit, onValue } = props;
  const [text, setText] = useState(() => toText(value, unit));
  const [prevValue, setPrevValue] = useState(value);
  // Значение сменилось снаружи (например, «Сбросить») — показываем его.
  if (value !== prevValue) {
    setPrevValue(value);
    if (parse(text, unit) !== value) setText(toText(value, unit));
  }
  return (
    <input
      id={id}
      className="input"
      inputMode="decimal"
      placeholder={placeholder}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        onValue(parse(e.target.value, unit));
      }}
    />
  );
}

export function RangeField({ label, unit = 1, min, max, onChange }: Props) {
  const id = useId();
  return (
    <fieldset className={styles.range}>
      <legend className="field-label">{label}</legend>
      <div className={styles.inputs}>
        <label htmlFor={`${id}-min`} className="visually-hidden">
          {label}, от
        </label>
        <NumberInput id={`${id}-min`} placeholder="от" value={min} unit={unit} onValue={(v) => onChange(v, max)} />
        <label htmlFor={`${id}-max`} className="visually-hidden">
          {label}, до
        </label>
        <NumberInput id={`${id}-max`} placeholder="до" value={max} unit={unit} onValue={(v) => onChange(min, v)} />
      </div>
    </fieldset>
  );
}
