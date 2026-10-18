interface Option<T> {
  value: T;
  label: string;
}

interface Props<T> {
  label: string;
  options: Option<T>[];
  selected: T[];
  onChange: (next: T[]) => void;
  /** Один вариант за раз; повторное касание снимает выбор. */
  single?: boolean;
}

export function Chips<T extends string | number>({ label, options, selected, onChange, single = false }: Props<T>) {
  const toggle = (v: T) => {
    if (selected.includes(v)) onChange(selected.filter((x) => x !== v));
    else onChange(single ? [v] : [...selected, v]);
  };
  return (
    <div className="chips" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          className="chip"
          aria-pressed={selected.includes(o.value)}
          onClick={() => toggle(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
