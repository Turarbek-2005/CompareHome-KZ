import {
  FINISHING_LABEL,
  HOUSING_CLASS_LABEL,
  SAFETY_LABEL,
  WALL_MATERIAL_LABEL,
  completionRank,
  formatArea,
  formatCompletion,
  formatFloor,
  formatMeters,
  formatPrice,
  formatPriceMillions,
  formatPricePerM2,
  formatPriceShort,
  formatRooms,
  formatSignedPercent,
} from './format';
import {
  calculateLoan,
  checkEligibility,
  contextOf,
  requiredDownPayment,
} from './mortgage';
import type { Apartment, MortgageProgram } from './types';

export const MAX_COMPARE = 4;

type Better = 'min' | 'max' | null;

interface RowSpec {
  key: string;
  label: string;
  group: 'price' | 'space' | 'house' | 'mortgage';
  better: Better;
  /** Число для выбора лучшего значения. */
  value?: (a: Apartment) => number | null;
  /** Текст ячейки; null — данных нет. */
  text: (a: Apartment) => string | null;
  /** Значение есть, но второстепенное (например, «Не подходит»): показываем приглушённо. */
  muted?: (a: Apartment) => boolean;
}

export interface CompareContext {
  /** Средняя цена нового жилья за м² по городу (БНС). */
  benchmarkFor: (cityId: string) => number | null;
  program: MortgageProgram | null;
  termYears: number;
}

export interface CompareCell {
  text: string;
  missing: boolean;
  muted: boolean;
  best: boolean;
}

export interface CompareRow {
  key: string;
  label: string;
  group: RowSpec['group'];
  cells: CompareCell[];
  /** Значения не одинаковы — строка остаётся при «Только различия». */
  differs: boolean;
}

function benchmarkDelta(a: Apartment, ctx: CompareContext): number | null {
  const avg = ctx.benchmarkFor(a.cityId);
  return avg ? (a.pricePerM2 / avg - 1) * 100 : null;
}

function mortgagePlan(a: Apartment, ctx: CompareContext) {
  const program = ctx.program;
  if (!program) return null;
  const housing = contextOf(a);
  if (!checkEligibility(program, housing).eligible) return null;
  const downPayment = requiredDownPayment(program, a.price, housing);
  const term = Math.min(ctx.termYears, program.maxTermYears);
  const loan = calculateLoan({
    price: a.price,
    downPayment,
    termYears: term,
    ratePct: program.rate,
    paymentType: 'annuity',
  });
  return { downPayment, monthly: loan.monthly };
}

function specs(ctx: CompareContext): RowSpec[] {
  const rows: RowSpec[] = [
    {
      key: 'price',
      label: 'Цена',
      group: 'price',
      better: 'min',
      value: (a) => a.price,
      text: (a) => formatPriceMillions(a.price),
    },
    {
      key: 'ppm2',
      label: 'Цена за м²',
      group: 'price',
      better: 'min',
      value: (a) => a.pricePerM2,
      // «за м²» уже в подписи строки — в узкой колонке оставляем только сумму.
      text: (a) => formatPricePerM2(a.pricePerM2).replace('/м²', ''),
    },
    {
      key: 'benchmark',
      label: 'Цена за м² относительно средней по городу',
      group: 'price',
      better: 'min',
      value: (a) => benchmarkDelta(a, ctx),
      text: (a) => {
        const d = benchmarkDelta(a, ctx);
        return d == null ? null : formatSignedPercent(d);
      },
    },
    {
      key: 'area',
      label: 'Площадь',
      group: 'space',
      better: 'max',
      value: (a) => a.area,
      text: (a) => formatArea(a.area),
    },
    {
      key: 'rooms',
      label: 'Комнат',
      group: 'space',
      better: null,
      text: (a) => formatRooms(a.rooms),
    },
    {
      key: 'kitchen',
      label: 'Кухня',
      group: 'space',
      better: 'max',
      value: (a) => a.kitchenArea,
      text: (a) => (a.kitchenArea == null ? null : formatArea(a.kitchenArea)),
    },
    {
      key: 'ceiling',
      label: 'Потолки',
      group: 'space',
      better: 'max',
      value: (a) => a.ceilingHeight,
      text: (a) => (a.ceilingHeight == null ? null : formatMeters(a.ceilingHeight)),
    },
    {
      key: 'floor',
      label: 'Этаж',
      group: 'space',
      better: null,
      text: (a) => (a.floor == null ? null : formatFloor(a.floor, a.floorsTotal)),
    },
    {
      key: 'finishing',
      label: 'Отделка',
      group: 'space',
      better: null,
      text: (a) => (a.finishing ? FINISHING_LABEL[a.finishing] : null),
    },
    {
      key: 'completion',
      label: 'Сдача',
      group: 'house',
      better: 'min',
      value: (a) => completionRank(a.completion, a.complexStatus),
      text: (a) => (a.completion || a.complexStatus === 'completed' ? formatCompletion(a.completion, a.complexStatus) : null),
    },
    {
      key: 'safety',
      label: 'Защита дольщиков',
      group: 'house',
      better: null,
      text: (a) => SAFETY_LABEL[a.safety],
    },
    {
      key: 'class',
      label: 'Класс',
      group: 'house',
      better: null,
      text: (a) => (a.housingClass ? HOUSING_CLASS_LABEL[a.housingClass] : null),
    },
    {
      key: 'walls',
      label: 'Стены',
      group: 'house',
      better: null,
      text: (a) => (a.wallMaterial ? WALL_MATERIAL_LABEL[a.wallMaterial] : null),
    },
    {
      key: 'developer',
      label: 'Застройщик',
      group: 'house',
      better: null,
      text: (a) => a.developerName,
    },
  ];

  const program = ctx.program;
  if (program) {
    const ineligible = (a: Apartment) => !checkEligibility(program, contextOf(a)).eligible;
    rows.push(
      {
        key: 'eligible',
        label: `Подходит под «${program.name}»`,
        group: 'mortgage',
        better: 'max',
        value: (a) => (checkEligibility(program, contextOf(a)).eligible ? 1 : 0),
        text: (a) => (checkEligibility(program, contextOf(a)).eligible ? 'Да' : 'Нет'),
      },
      {
        key: 'downPayment',
        label: 'Минимальный взнос',
        group: 'mortgage',
        better: 'min',
        value: (a) => mortgagePlan(a, ctx)?.downPayment ?? null,
        text: (a) => {
          const plan = mortgagePlan(a, ctx);
          return plan ? formatPriceShort(plan.downPayment) : 'Не подходит';
        },
        muted: ineligible,
      },
      {
        key: 'monthly',
        label: `Платёж в месяц, ${Math.min(ctx.termYears, program.maxTermYears)} лет`,
        group: 'mortgage',
        better: 'min',
        value: (a) => mortgagePlan(a, ctx)?.monthly ?? null,
        text: (a) => {
          const plan = mortgagePlan(a, ctx);
          return plan ? formatPriceShort(plan.monthly) : 'Не подходит';
        },
        muted: ineligible,
      },
    );
  }
  return rows;
}

function bestIndexes(values: (number | null)[], better: Better): Set<number> {
  const present = values.filter((v): v is number => v != null);
  // Подсвечивать есть смысл, только когда есть с чем сравнивать и значения различаются.
  if (!better || present.length < 2) return new Set();
  const target = better === 'min' ? Math.min(...present) : Math.max(...present);
  if (present.every((v) => v === target)) return new Set();
  const out = new Set<number>();
  values.forEach((v, i) => {
    if (v != null && Math.abs(v - target) < 1e-9) out.add(i);
  });
  return out;
}

export function buildCompareRows(apartments: Apartment[], ctx: CompareContext): CompareRow[] {
  return specs(ctx)
    .map((spec) => {
      const texts = apartments.map(spec.text);
      const best = spec.value ? bestIndexes(apartments.map(spec.value), spec.better) : new Set<number>();
      const cells = texts.map((t, i) => ({
        text: t ?? 'Нет данных',
        missing: t == null,
        muted: t == null || (spec.muted?.(apartments[i]!) ?? false),
        best: best.has(i),
      }));
      return {
        key: spec.key,
        label: spec.label,
        group: spec.group,
        cells,
        differs: new Set(texts.map((t) => t ?? '')).size > 1,
      };
    })
    .filter((row) => row.cells.some((c) => !c.missing));
}

export function onlyDifferences(rows: CompareRow[]): CompareRow[] {
  return rows.filter((r) => r.differs);
}

/** Текст для «Поделиться»: по строке на квартиру и ключевые цифры. */
export function compareSummary(apartments: Apartment[]): string {
  const lines = apartments.map(
    (a, i) =>
      `${i + 1}. ${a.complexName} (${a.developerName}): ${formatRooms(a.rooms)}, ${formatArea(a.area)}, ` +
      `${formatPrice(a.price)}, ${formatPricePerM2(a.pricePerM2)}, сдача ${formatCompletion(a.completion, a.complexStatus)}`,
  );
  return ['Сравнение квартир — CompareHome KZ', ...lines].join('\n');
}
