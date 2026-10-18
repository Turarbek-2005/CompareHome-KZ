/**
 * «Единый масштаб»: контур квартиры, построенный по площади.
 * Это схема, а не планировка: прямоугольник с правильной площадью,
 * кухня во всю глубину слева, комнаты справа — в один или два ряда.
 */

/** Пикселей на метр. Все контуры на одном экране рисуются в одном масштабе. */
export const SCALE = {
  /** Списки: 35 м² ≈ 24 px, 185 м² ≈ 55 px. */
  list: 3.6,
  /** Шапка сравнения: до 4 колонок на 390 px. */
  compare: 6,
  /** Карточка квартиры. */
  detail: 12,
} as const;

export type ScaleName = keyof typeof SCALE;

/** Отношение ширины к глубине у схемы. */
const ASPECT = 1.3;

/** Ячейка в метрах от левого верхнего угла. */
export interface FootprintCell {
  x: number;
  y: number;
  width: number;
  depth: number;
  kind: 'kitchen' | 'room';
}

export interface FootprintShape {
  widthM: number;
  depthM: number;
  cells: FootprintCell[];
}

/** Ширина и глубина прямоугольника заданной площади. */
export function footprintSize(area: number): { widthM: number; depthM: number } {
  return { widthM: Math.sqrt(area * ASPECT), depthM: Math.sqrt(area / ASPECT) };
}

export function footprintShape(area: number, rooms: number, kitchenArea: number | null): FootprintShape {
  const { widthM, depthM } = footprintSize(area);
  if (rooms <= 0) return { widthM, depthM, cells: [{ x: 0, y: 0, width: widthM, depth: depthM, kind: 'room' }] };

  // Кухня с прихожей и санузлом — известная доля или около четверти площади.
  const kitchenShare = kitchenArea ? Math.min(Math.max(kitchenArea / area + 0.08, 0.18), 0.45) : 0.26;
  const kitchenWidth = widthM * kitchenShare;
  const cells: FootprintCell[] = [{ x: 0, y: 0, width: kitchenWidth, depth: depthM, kind: 'kitchen' }];

  // До двух комнат — в ряд, больше — в два ряда: так схема похожа на план, а не на штрихкод.
  const rows = rooms <= 2 ? [rooms] : [Math.ceil(rooms / 2), Math.floor(rooms / 2)];
  const rest = widthM - kitchenWidth;
  const rowDepth = depthM / rows.length;
  rows.forEach((count, r) => {
    const w = rest / count;
    for (let i = 0; i < count; i++) {
      cells.push({ x: kitchenWidth + i * w, y: r * rowDepth, width: w, depth: rowDepth, kind: 'room' });
    }
  });
  return { widthM, depthM, cells };
}

/** Самый большой контур среди квартир — для выравнивания колонок в одном масштабе. */
export function maxFootprintPx(areas: number[], scale: ScaleName): { width: number; depth: number } {
  const px = SCALE[scale];
  const maxArea = Math.max(0, ...areas);
  const { widthM, depthM } = footprintSize(maxArea);
  return { width: widthM * px, depth: depthM * px };
}
