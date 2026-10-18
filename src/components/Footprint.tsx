import { footprintShape, SCALE, type ScaleName } from '../domain/footprint';
import { formatArea, formatMeters, formatRoomsLong } from '../domain/format';
import styles from './Footprint.module.css';

interface Props {
  area: number;
  rooms: number;
  kitchenArea?: number | null;
  scale: ScaleName;
  /** Размерные линии, номера комнат и подпись кухни — для карточки квартиры. */
  dimensions?: boolean;
  className?: string;
}

const DOOR_M = 0.9;
const DIM_PAD = 26;

interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** Перегородка с дверным проёмом: вертикальная — у нижнего края, горизонтальная — у левого. */
function withDoor(s: Segment, door: number, inset: number): Segment[] {
  const vertical = s.x1 === s.x2;
  const len = vertical ? s.y2 - s.y1 : s.x2 - s.x1;
  const gap = Math.min(door, len * 0.35);
  const pad = Math.min(inset, len * 0.15);
  if (vertical) {
    const end = s.y2 - pad;
    return [
      { ...s, y2: end - gap },
      { ...s, y1: end },
    ];
  }
  const start = s.x1 + pad;
  return [
    { ...s, x2: start },
    { ...s, x1: start + gap },
  ];
}

/** Контур квартиры по площади, в одном из фиксированных масштабов. */
export function Footprint({ area, rooms, kitchenArea = null, scale, dimensions = false, className }: Props) {
  const px = SCALE[scale];
  const shape = footprintShape(area, rooms, kitchenArea);
  const w = shape.widthM * px;
  const h = shape.depthM * px;
  const outer = scale === 'list' ? 1.5 : 2;
  const inset = outer / 2;
  const padTop = dimensions ? DIM_PAD : 0;
  // Справа — вертикальная размерная линия и подпись к ней.
  const padRight = dimensions ? 56 : 0;
  const label = `${formatRoomsLong(rooms)}, ${formatArea(area)}`;

  const partitions = shape.cells
    .filter((c) => c.kind === 'room')
    .flatMap((c) => {
      const segs: Segment[] = [];
      const x = c.x * px;
      const y = c.y * px;
      if (c.x > 0) segs.push({ x1: x, y1: y, x2: x, y2: y + c.depth * px });
      if (c.y > 0) segs.push({ x1: x, y1: y, x2: x + c.width * px, y2: y });
      return segs.flatMap((s) => withDoor(s, DOOR_M * px, 0.3 * px));
    });

  const kitchen = shape.cells[0]!;
  const kitchenPxWidth = kitchen.width * px;

  return (
    <svg
      className={[styles.footprint, className].filter(Boolean).join(' ')}
      width={w + padRight + outer}
      height={h + padTop + outer}
      viewBox={`${-inset} ${-padTop - inset} ${w + padRight + outer} ${h + padTop + outer}`}
      role="img"
      aria-label={`Схема: ${label}`}
    >
      <rect x={0} y={0} width={w} height={h} className={styles.wall} strokeWidth={outer} />
      <g className={styles.partition}>
        {partitions.map((s, i) => (
          <line key={i} {...s} />
        ))}
      </g>
      {dimensions && (
        <>
          {/* Ячейка 0 — кухня, остальные — комнаты по порядку: индекс и есть номер комнаты. */}
          {shape.cells.map((c, i) =>
            c.kind === 'room' && rooms > 0 ? (
              <text
                key={i}
                x={(c.x + c.width / 2) * px}
                y={(c.y + c.depth / 2) * px}
                className={styles.roomNo}
                textAnchor="middle"
                dominantBaseline="central"
              >
                {i}
              </text>
            ) : null,
          )}
          {rooms > 0 && (
            <text
              x={kitchenPxWidth / 2}
              y={h / 2}
              className={styles.cellLabel}
              textAnchor="middle"
              dominantBaseline="central"
              // Узкую кухню подписываем вдоль стены.
              transform={kitchenPxWidth < 44 ? `rotate(-90 ${kitchenPxWidth / 2} ${h / 2})` : undefined}
            >
              кухня
            </text>
          )}
          <DimensionLine x1={0} y1={-14} x2={w} y2={-14} text={formatMeters(shape.widthM)} />
          <DimensionLine x1={w + 14} y1={0} x2={w + 14} y2={h} text={formatMeters(shape.depthM)} vertical />
        </>
      )}
    </svg>
  );
}

function DimensionLine(props: { x1: number; y1: number; x2: number; y2: number; text: string; vertical?: boolean }) {
  const { x1, y1, x2, y2, text, vertical } = props;
  const t = 4;
  // Засечки под 45°, как на строительных чертежах.
  const tick = (x: number, y: number) => <line x1={x - t} y1={y + t} x2={x + t} y2={y - t} />;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return (
    <g className={styles.dimension}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      {tick(x1, y1)}
      {tick(x2, y2)}
      <text
        x={vertical ? mx + 6 : mx}
        y={vertical ? my : my - 6}
        textAnchor={vertical ? 'start' : 'middle'}
        dominantBaseline={vertical ? 'central' : 'auto'}
        className={styles.dimText}
      >
        {text}
      </text>
    </g>
  );
}

/** Масштабная линейка: 5 м в выбранном масштабе. */
export function ScaleBar({ scale, meters = 5 }: { scale: ScaleName; meters?: number }) {
  const len = meters * SCALE[scale];
  return (
    <span className={styles.scaleBar}>
      <svg width={len + 2} height={8} aria-hidden="true">
        <line x1={1} y1={4} x2={len + 1} y2={4} />
        <line x1={1} y1={0} x2={1} y2={8} />
        <line x1={len + 1} y1={0} x2={len + 1} y2={8} />
      </svg>
      <span>{meters}&nbsp;м</span>
    </span>
  );
}
