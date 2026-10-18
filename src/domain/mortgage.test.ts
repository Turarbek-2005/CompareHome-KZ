import {
  annuityPayment,
  calculateLoan,
  checkEligibility,
  differentiatedPayments,
  requiredDownPayment,
  validateLoan,
} from './mortgage';
import { nauryz } from './testData';

const construction = { cityId: 'almaty', finishing: null, complexStatus: 'construction' as const };

describe('annuityPayment', () => {
  it('считает платёж для 30 млн ₸ под 9% на 19 лет', () => {
    expect(annuityPayment(30_000_000, 9, 228)).toBeCloseTo(275_070, -1);
  });

  it('делит займ поровну при нулевой ставке', () => {
    expect(annuityPayment(1_200_000, 0, 12)).toBe(100_000);
  });

  it('возвращает 0 для пустого займа', () => {
    expect(annuityPayment(0, 9, 120)).toBe(0);
  });
});

describe('differentiatedPayments', () => {
  it('первый платёж больше последнего, переплата меньше чем у аннуитета', () => {
    const d = differentiatedPayments(12_000_000, 12, 120);
    expect(d.first).toBeCloseTo(100_000 + 120_000);
    expect(d.last).toBeCloseTo(101_000);
    const annuityTotal = annuityPayment(12_000_000, 12, 120) * 120;
    expect(d.total).toBeLessThan(annuityTotal);
  });
});

describe('calculateLoan', () => {
  it('вычитает взнос из цены', () => {
    const r = calculateLoan({ price: 40_000_000, downPayment: 10_000_000, termYears: 19, ratePct: 9, paymentType: 'annuity' });
    expect(r.loan).toBe(30_000_000);
    expect(r.overpayment).toBeCloseTo(r.monthly * 228 - 30_000_000);
  });
});

describe('checkEligibility', () => {
  it('строящееся жильё с гарантией КЖК подходит под «Наурыз»', () => {
    expect(checkEligibility(nauryz, { ...construction, safety: 'kzhk_guarantee' }).eligible).toBe(true);
  });

  it('строящееся жильё с разрешением акимата не подходит и объясняет почему', () => {
    const r = checkEligibility(nauryz, { ...construction, safety: 'akimat_permit' });
    expect(r).toEqual({ eligible: false, reason: 'Строящееся жильё подходит, только если у ЖК есть гарантия КЖК' });
  });

  it('сданное жильё подходит', () => {
    expect(
      checkEligibility(nauryz, { ...construction, safety: 'completed', complexStatus: 'completed' }).eligible,
    ).toBe(true);
  });
});

describe('validateLoan', () => {
  it('ругается на займ больше лимита в Алматы', () => {
    const issues = validateLoan(nauryz, { price: 50_000_000, downPayment: 10_000_000, termYears: 19 }, construction);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatch(/лимита программы — 36\s000\s000 ₸/);
  });

  it('ругается на взнос 10% без чистовой отделки', () => {
    const issues = validateLoan(nauryz, { price: 30_000_000, downPayment: 3_000_000, termYears: 10 }, construction);
    expect(issues).toEqual(['Взнос меньше 20% от стоимости — минимума по программе «Наурыз».']);
  });

  it('принимает взнос 10% при чистовой отделке', () => {
    const issues = validateLoan(
      nauryz,
      { price: 30_000_000, downPayment: 3_000_000, termYears: 10 },
      { cityId: 'almaty', finishing: 'finished' },
    );
    expect(issues).toEqual([]);
  });

  it('ругается на срок больше максимума', () => {
    const issues = validateLoan(nauryz, { price: 30_000_000, downPayment: 6_000_000, termYears: 25 }, construction);
    expect(issues).toEqual(['Срок больше 19 лет — максимума по программе.']);
  });
});

describe('requiredDownPayment', () => {
  it('берёт минимальный процент, если цена в пределах лимита', () => {
    expect(requiredDownPayment(nauryz, 40_000_000, { ...construction, safety: 'kzhk_guarantee' })).toBe(8_000_000);
  });

  it('повышает взнос, если займ упирается в лимит', () => {
    expect(requiredDownPayment(nauryz, 60_000_000, { ...construction, safety: 'kzhk_guarantee' })).toBe(24_000_000);
  });

  it('учитывает меньший лимит в остальных городах', () => {
    const ctx = { cityId: 'karaganda', finishing: null, complexStatus: 'construction' as const, safety: 'kzhk_guarantee' as const };
    expect(requiredDownPayment(nauryz, 40_000_000, ctx)).toBe(10_000_000);
  });
});
