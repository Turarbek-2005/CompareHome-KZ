import type { Apartment, MortgageProgram } from './types';

export function apartment(overrides: Partial<Apartment> = {}): Apartment {
  const area = overrides.area ?? 60;
  const price = overrides.price ?? 36_000_000;
  return {
    id: 'a1',
    complexId: 'c1',
    unitNo: '1',
    rooms: 2,
    area,
    kitchenArea: null,
    livingArea: null,
    floor: 3,
    floorsTotal: 9,
    price,
    pricePerM2: Math.round(price / area),
    finishing: null,
    ceilingHeight: 3,
    sourceUrl: null,
    collectedAt: '2026-10-17',
    isDemo: false,
    complexName: 'ЖК',
    cityId: 'astana',
    district: null,
    housingClass: 'comfort',
    wallMaterial: null,
    completion: { year: 2027, quarter: 2 },
    complexStatus: 'construction',
    safety: 'akimat_permit',
    lat: null,
    lng: null,
    developerId: 'd1',
    developerName: 'Застройщик',
    ...overrides,
  };
}

export const nauryz: MortgageProgram = {
  id: 'otbasy-nauryz',
  bank: 'Отбасы банк',
  name: 'Наурыз',
  rate: 9,
  rateNote: null,
  minDownPaymentPct: 20,
  reducedDownPaymentPct: 10,
  reducedDownPaymentNote: 'Для первичного жилья с чистовой отделкой',
  maxTermYears: 19,
  maxAmountMajor: 36_000_000,
  maxAmountOther: 30_000_000,
  housingTypes: ['completed', 'construction_kzhk'],
  note: null,
  sourceUrl: 'https://hcsbk.kz/ru/to-get-a-loan/nauryz/',
  verifiedAt: '2026-10-17',
};
