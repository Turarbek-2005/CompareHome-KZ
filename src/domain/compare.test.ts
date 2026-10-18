import { buildCompareRows, compareSummary, onlyDifferences, type CompareContext } from './compare';
import { apartment, nauryz } from './testData';

const ctx: CompareContext = { benchmarkFor: () => 600_000, program: null, termYears: 19 };

function row(rows: ReturnType<typeof buildCompareRows>, key: string) {
  const r = rows.find((x) => x.key === key);
  if (!r) throw new Error(`нет строки ${key}`);
  return r;
}

describe('buildCompareRows', () => {
  it('отмечает самую низкую цену и самую большую площадь', () => {
    const rows = buildCompareRows(
      [
        apartment({ id: 'a', price: 30_000_000, area: 50 }),
        apartment({ id: 'b', price: 40_000_000, area: 80 }),
      ],
      ctx,
    );
    expect(row(rows, 'price').cells.map((c) => c.best)).toEqual([true, false]);
    expect(row(rows, 'area').cells.map((c) => c.best)).toEqual([false, true]);
  });

  it('отмечает все равные лучшие значения при ничьей', () => {
    const rows = buildCompareRows(
      [
        apartment({ id: 'a', price: 30_000_000 }),
        apartment({ id: 'b', price: 30_000_000 }),
        apartment({ id: 'c', price: 35_000_000 }),
      ],
      ctx,
    );
    expect(row(rows, 'price').cells.map((c) => c.best)).toEqual([true, true, false]);
  });

  it('ничего не отмечает, когда все значения одинаковы', () => {
    const rows = buildCompareRows([apartment({ id: 'a' }), apartment({ id: 'b' })], ctx);
    expect(row(rows, 'price').cells.every((c) => !c.best)).toBe(true);
    expect(row(rows, 'price').differs).toBe(false);
  });

  it('пропуски не мешают выбрать лучшее и подписаны как «Нет данных»', () => {
    const rows = buildCompareRows(
      [
        apartment({ id: 'a', ceilingHeight: 3 }),
        apartment({ id: 'b', ceilingHeight: null }),
        apartment({ id: 'c', ceilingHeight: 3.3 }),
      ],
      ctx,
    );
    const ceiling = row(rows, 'ceiling');
    expect(ceiling.cells.map((c) => c.best)).toEqual([false, false, true]);
    expect(ceiling.cells[1]).toEqual({ text: 'Нет данных', missing: true, muted: true, best: false });
  });

  it('прячет строки, где данных нет ни у одной квартиры', () => {
    const rows = buildCompareRows([apartment({ id: 'a' }), apartment({ id: 'b' })], ctx);
    expect(rows.some((r) => r.key === 'kitchen')).toBe(false);
  });

  it('раньше сдача — лучше', () => {
    const rows = buildCompareRows(
      [
        apartment({ id: 'a', completion: { year: 2027, quarter: 4 } }),
        apartment({ id: 'b', completion: { year: 2026, quarter: 3 } }),
      ],
      ctx,
    );
    expect(row(rows, 'completion').cells.map((c) => c.best)).toEqual([false, true]);
  });

  it('показывает отклонение от средней цены по городу', () => {
    const rows = buildCompareRows(
      [apartment({ id: 'a', price: 27_000_000, area: 50 }), apartment({ id: 'b', price: 39_000_000, area: 50 })],
      ctx,
    );
    expect(row(rows, 'benchmark').cells.map((c) => c.text)).toEqual(['−10%', '+30%']);
  });

  it('считает ипотеку только для подходящих под программу квартир', () => {
    const rows = buildCompareRows(
      [
        apartment({ id: 'a', safety: 'kzhk_guarantee', price: 40_000_000 }),
        apartment({ id: 'b', safety: 'akimat_permit', price: 30_000_000 }),
      ],
      { ...ctx, program: nauryz },
    );
    expect(row(rows, 'eligible').cells.map((c) => [c.text, c.best])).toEqual([
      ['Да', true],
      ['Нет', false],
    ]);
    const monthly = row(rows, 'monthly');
    expect(monthly.cells[0]).toMatchObject({ muted: false, best: false });
    expect(monthly.cells[1]).toMatchObject({ text: 'Не подходит', muted: true, best: false });
  });
});

describe('onlyDifferences', () => {
  it('оставляет только строки с разными значениями', () => {
    const rows = buildCompareRows(
      [apartment({ id: 'a', price: 30_000_000 }), apartment({ id: 'b', price: 31_000_000 })],
      ctx,
    );
    const keys = onlyDifferences(rows).map((r) => r.key);
    expect(keys).toContain('price');
    expect(keys).not.toContain('rooms');
  });
});

describe('compareSummary', () => {
  it('пишет по строке на квартиру', () => {
    const text = compareSummary([apartment({ complexName: 'Ayala' }), apartment({ complexName: 'Aitau' })]);
    expect(text.split('\n')).toHaveLength(3);
    expect(text).toContain('1. Ayala');
  });
});
