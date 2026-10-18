import { averagePricePerM2, filterApartments, groupByComplex, sortApartments } from './catalog';
import { apartment } from './testData';
import { EMPTY_FILTERS } from './filters';

const list = [
  apartment({ id: 'studio', rooms: 0, area: 30, price: 20_000_000, complexId: 'x', complexName: 'Ayala' }),
  apartment({ id: 'two', rooms: 2, area: 60, price: 36_000_000, complexId: 'x', complexName: 'Ayala', finishing: 'finished' }),
  apartment({
    id: 'five',
    rooms: 5,
    area: 180,
    price: 300_000_000,
    complexId: 'y',
    complexName: 'Grace Garden',
    housingClass: 'premium',
    safety: 'kzhk_guarantee',
    completion: { year: 2026, quarter: 3 },
  }),
];

describe('filterApartments', () => {
  it('без фильтров возвращает всё', () => {
    expect(filterApartments(list, EMPTY_FILTERS)).toHaveLength(3);
  });

  it('«4+» включает квартиры с пятью комнатами, 0 — студии', () => {
    const ids = filterApartments(list, { ...EMPTY_FILTERS, rooms: [0, 4] }).map((a) => a.id);
    expect(ids).toEqual(['studio', 'five']);
  });

  it('фильтрует по цене, классу, отделке и защите дольщиков', () => {
    expect(filterApartments(list, { ...EMPTY_FILTERS, priceMax: 40_000_000 })).toHaveLength(2);
    expect(filterApartments(list, { ...EMPTY_FILTERS, classes: ['premium'] }).map((a) => a.id)).toEqual(['five']);
    expect(filterApartments(list, { ...EMPTY_FILTERS, finishing: ['finished'] }).map((a) => a.id)).toEqual(['two']);
    expect(filterApartments(list, { ...EMPTY_FILTERS, safety: ['kzhk_guarantee'] }).map((a) => a.id)).toEqual(['five']);
  });

  it('сдача не позже выбранного года', () => {
    expect(filterApartments(list, { ...EMPTY_FILTERS, completionBy: 2026 }).map((a) => a.id)).toEqual(['five']);
  });

  it('ищет по названию ЖК без учёта регистра', () => {
    expect(filterApartments(list, { ...EMPTY_FILTERS, query: 'grace' }).map((a) => a.id)).toEqual(['five']);
  });
});

describe('sortApartments', () => {
  it('по площади — сначала большие', () => {
    expect(sortApartments(list, 'area').map((a) => a.id)).toEqual(['five', 'two', 'studio']);
  });

  it('по сроку — сначала ранние', () => {
    expect(sortApartments(list, 'completion')[0]!.id).toBe('five');
  });
});

describe('groupByComplex', () => {
  it('считает диапазоны цен по ЖК', () => {
    const groups = groupByComplex(list);
    expect(groups).toHaveLength(2);
    expect(groups[0]).toMatchObject({ complexName: 'Ayala', count: 2, minPrice: 20_000_000, maxPrice: 36_000_000 });
  });
});

describe('averagePricePerM2', () => {
  it('взвешивает по площади', () => {
    expect(averagePricePerM2(list.slice(0, 2))).toBeCloseTo(56_000_000 / 90);
  });
});
