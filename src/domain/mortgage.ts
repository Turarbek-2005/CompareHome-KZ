import type { Apartment, Finishing, MortgageProgram, SafetyStatus, ComplexStatus } from './types';

/** Города с повышенным лимитом займа по программам Отбасы банка. */
const MAJOR_CITIES = new Set(['astana', 'almaty']);

/** Ежемесячный аннуитетный платёж. */
export function annuityPayment(principal: number, annualRatePct: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / months;
  const k = Math.pow(1 + r, months);
  return (principal * r * k) / (k - 1);
}

/** Дифференцированные платежи: первый, последний и сумма всех выплат. */
export function differentiatedPayments(principal: number, annualRatePct: number, months: number) {
  if (principal <= 0 || months <= 0) return { first: 0, last: 0, total: 0 };
  const r = annualRatePct / 100 / 12;
  const body = principal / months;
  // Сумма процентов: r · body · (n + (n−1) + … + 1)
  const interest = r * body * ((months * (months + 1)) / 2);
  return {
    first: body + principal * r,
    last: body + body * r,
    total: principal + interest,
  };
}

export type PaymentType = 'annuity' | 'differentiated';

export interface LoanInput {
  price: number;
  downPayment: number;
  termYears: number;
  ratePct: number;
  paymentType: PaymentType;
}

export interface LoanResult {
  loan: number;
  /** Для аннуитета — постоянный платёж, для дифференцированного — первый. */
  monthly: number;
  lastMonthly: number;
  total: number;
  overpayment: number;
}

export function calculateLoan({ price, downPayment, termYears, ratePct, paymentType }: LoanInput): LoanResult {
  const loan = Math.max(0, price - downPayment);
  const months = Math.round(termYears * 12);
  if (paymentType === 'differentiated') {
    const d = differentiatedPayments(loan, ratePct, months);
    return { loan, monthly: d.first, lastMonthly: d.last, total: d.total, overpayment: d.total - loan };
  }
  const monthly = annuityPayment(loan, ratePct, months);
  const total = monthly * months;
  return { loan, monthly, lastMonthly: monthly, total, overpayment: total - loan };
}

export interface HousingContext {
  cityId: string;
  finishing: Finishing | null;
  safety: SafetyStatus;
  complexStatus: ComplexStatus;
}

export function contextOf(a: Apartment): HousingContext {
  return { cityId: a.cityId, finishing: a.finishing, safety: a.safety, complexStatus: a.complexStatus };
}

/** Минимальный взнос в процентах с учётом льготы (например, 10% для чистовой отделки). */
export function minDownPaymentPct(program: MortgageProgram, finishing: Finishing | null): number {
  if (program.reducedDownPaymentPct != null && finishing === 'finished') {
    return program.reducedDownPaymentPct;
  }
  return program.minDownPaymentPct;
}

export function maxLoanAmount(program: MortgageProgram, cityId: string): number | null {
  return MAJOR_CITIES.has(cityId) ? program.maxAmountMajor : program.maxAmountOther;
}

export type Eligibility = { eligible: true } | { eligible: false; reason: string };

/** Подходит ли жильё под программу по типу: сданное, строящееся с гарантией КЖК и т. п. */
export function checkEligibility(program: MortgageProgram, ctx: HousingContext): Eligibility {
  const types = program.housingTypes;
  if (ctx.complexStatus === 'completed' || ctx.safety === 'completed') {
    return types.includes('completed')
      ? { eligible: true }
      : { eligible: false, reason: 'Программа только для строящегося жилья' };
  }
  if (types.includes('construction_any')) return { eligible: true };
  if (types.includes('construction_kzhk')) {
    return ctx.safety === 'kzhk_guarantee'
      ? { eligible: true }
      : { eligible: false, reason: 'Строящееся жильё подходит, только если у ЖК есть гарантия КЖК' };
  }
  return { eligible: false, reason: 'Программа только для сданного жилья' };
}

/**
 * Взнос, при котором займ укладывается и в минимальный процент, и в лимит суммы.
 * Если цена выше лимита, недостающее покупатель доплачивает из своих.
 */
export function requiredDownPayment(program: MortgageProgram, price: number, ctx: HousingContext): number {
  const byPct = (price * minDownPaymentPct(program, ctx.finishing)) / 100;
  const max = maxLoanAmount(program, ctx.cityId);
  const byLimit = max != null ? price - max : 0;
  return Math.ceil(Math.max(byPct, byLimit, 0));
}

/** Проверка введённых параметров против условий программы. Возвращает понятные сообщения. */
export function validateLoan(
  program: MortgageProgram,
  input: { price: number; downPayment: number; termYears: number },
  ctx: Pick<HousingContext, 'cityId' | 'finishing'>,
): string[] {
  const issues: string[] = [];
  const loan = input.price - input.downPayment;
  const minPct = minDownPaymentPct(program, ctx.finishing);
  if (input.price > 0 && (input.downPayment / input.price) * 100 < minPct - 1e-9) {
    issues.push(`Взнос меньше ${minPct}% от стоимости — минимума по программе «${program.name}».`);
  }
  const max = maxLoanAmount(program, ctx.cityId);
  if (max != null && loan > max) {
    issues.push(
      `Сумма займа больше лимита программы — ${new Intl.NumberFormat('ru-RU').format(max)} ₸. Увеличьте взнос.`,
    );
  }
  if (input.termYears > program.maxTermYears) {
    issues.push(`Срок больше ${program.maxTermYears} лет — максимума по программе.`);
  }
  return issues;
}
