import { IonContent, IonPage } from '@ionic/react';
import { useId, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ExternalLink } from '../components/ExternalLink';
import { PageHeader } from '../components/PageHeader';
import { useApartment, useMortgagePrograms } from '../data/queries';
import { formatArea, formatDate, formatPrice, formatRoomsLong, plural } from '../domain/format';
import {
  calculateLoan,
  checkEligibility,
  contextOf,
  minDownPaymentPct,
  validateLoan,
  type PaymentType,
} from '../domain/mortgage';
import type { MortgageProgram } from '../domain/types';
import { useCatalog } from '../store/filters';
import styles from './MortgagePage.module.css';

const CUSTOM = 'custom';
const DEFAULT_PRICE = 36_000_000;

function MoneyInput({ id, value, onChange }: { id: string; value: number; onChange: (v: number) => void }) {
  const [text, setText] = useState(() => new Intl.NumberFormat('ru-RU').format(value));
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    if (Number(text.replace(/\D/g, '')) !== value) setText(new Intl.NumberFormat('ru-RU').format(value));
  }
  return (
    <input
      id={id}
      className="input"
      inputMode="numeric"
      value={text}
      onChange={(e) => {
        const digits = Number(e.target.value.replace(/\D/g, '').slice(0, 12));
        setText(digits ? new Intl.NumberFormat('ru-RU').format(digits) : '');
        onChange(digits);
      }}
    />
  );
}

export function MortgagePage() {
  const ids = { price: useId(), rate: useId(), down: useId(), term: useId() };
  const { search } = useLocation();
  const apartmentId = new URLSearchParams(search).get('apartment');
  const { data: apartment } = useApartment(apartmentId ?? '');
  const { data: programs } = useMortgagePrograms();
  const catalogCity = useCatalog((s) => s.cityId);

  const [price, setPrice] = useState(DEFAULT_PRICE);
  const [programId, setProgramId] = useState<string | null>(null);
  const [customRate, setCustomRate] = useState(16);
  const [downPct, setDownPct] = useState(20);
  const [termYears, setTermYears] = useState(15);
  const [paymentType, setPaymentType] = useState<PaymentType>('annuity');

  // Подставляем цену квартиры, с которой пришли, — один раз на квартиру.
  const [seededFrom, setSeededFrom] = useState<string | null>(null);
  if (apartment && seededFrom !== apartment.id) {
    setSeededFrom(apartment.id);
    setPrice(apartment.price);
  }

  const program: MortgageProgram | null =
    programId === CUSTOM ? null : (programs?.find((p) => p.id === programId) ?? programs?.[0] ?? null);
  const rate = program ? program.rate : customRate;
  const maxTerm = program ? program.maxTermYears : 25;
  const term = Math.min(termYears, maxTerm);
  const downPayment = Math.round((price * downPct) / 100);
  const ctx = { cityId: apartment?.cityId ?? catalogCity, finishing: apartment?.finishing ?? null };

  const result = calculateLoan({ price, downPayment, termYears: term, ratePct: rate, paymentType });
  const issues = program ? validateLoan(program, { price, downPayment, termYears: term }, ctx) : [];
  const eligibility = program && apartment ? checkEligibility(program, contextOf(apartment)) : null;

  const comparison = useMemo(
    () =>
      (programs ?? []).map((p) => {
        const t = Math.min(termYears, p.maxTermYears);
        const r = calculateLoan({ price, downPayment, termYears: t, ratePct: p.rate, paymentType });
        const problems = validateLoan(p, { price, downPayment, termYears: t }, ctx);
        const fits = apartment ? checkEligibility(p, contextOf(apartment)).eligible : true;
        return { p, monthly: r.monthly, ok: problems.length === 0 && fits };
      }),
    // ctx пересобирается каждый рендер; зависим от его полей.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [programs, price, downPayment, termYears, paymentType, ctx.cityId, ctx.finishing, apartment],
  );

  const selectProgram = (id: string) => {
    setProgramId(id);
    const p = programs?.find((x) => x.id === id);
    // При смене программы поднимаем взнос до её минимума — иначе расчёт сразу с ошибкой.
    if (p) setDownPct((d) => Math.max(d, minDownPaymentPct(p, ctx.finishing)));
  };

  return (
    <IonPage>
      <PageHeader title="Ипотека" backHref="/more" />
      <IonContent>
        <div className={`page ${styles.page}`}>
          {apartment && (
            <p className={styles.context}>
              {apartment.complexName}, {formatRoomsLong(apartment.rooms).toLowerCase()} {formatArea(apartment.area)}
            </p>
          )}

          <div className="field">
            <label htmlFor={ids.price}>Стоимость квартиры, ₸</label>
            <MoneyInput id={ids.price} value={price} onChange={setPrice} />
          </div>

          <div className="field">
            <span className="field-label">Программа</span>
            <div className="chips" role="group" aria-label="Программа">
              {(programs ?? []).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="chip"
                  aria-pressed={program?.id === p.id}
                  onClick={() => selectProgram(p.id)}
                >
                  «{p.name}», {p.rate}%
                </button>
              ))}
              <button type="button" className="chip" aria-pressed={programId === CUSTOM} onClick={() => setProgramId(CUSTOM)}>
                Своя ставка
              </button>
            </div>
          </div>

          {programId === CUSTOM && (
            <div className="field">
              <label htmlFor={ids.rate}>Ставка, % годовых</label>
              <input
                id={ids.rate}
                className="input"
                inputMode="decimal"
                value={String(customRate).replace('.', ',')}
                onChange={(e) => {
                  const v = Number(e.target.value.replace(',', '.'));
                  if (Number.isFinite(v) && v >= 0 && v < 100) setCustomRate(v);
                }}
              />
            </div>
          )}

          <div className="field">
            <label htmlFor={ids.down}>
              Первоначальный взнос: {downPct}%, это <span className="num">{formatPrice(downPayment)}</span>
            </label>
            <input
              id={ids.down}
              className={styles.range}
              type="range"
              min={0}
              max={90}
              step={1}
              value={downPct}
              onChange={(e) => setDownPct(Number(e.target.value))}
            />
            {program && (
              <span className={styles.hint}>
                Минимум по программе: {minDownPaymentPct(program, ctx.finishing)}%
                {program.reducedDownPaymentPct != null &&
                  ctx.finishing !== 'finished' &&
                  `, или ${program.reducedDownPaymentPct}% ${program.reducedDownPaymentNote?.toLowerCase() ?? ''}`}
              </span>
            )}
          </div>

          <div className="field">
            <label htmlFor={ids.term}>
              Срок: {term} {plural(term, ['год', 'года', 'лет'])}
            </label>
            <input
              id={ids.term}
              className={styles.range}
              type="range"
              min={1}
              max={maxTerm}
              step={1}
              value={term}
              onChange={(e) => setTermYears(Number(e.target.value))}
            />
          </div>

          <div className={styles.segmented} role="group" aria-label="Тип платежа">
            <button type="button" aria-pressed={paymentType === 'annuity'} onClick={() => setPaymentType('annuity')}>
              Равные платежи
            </button>
            <button
              type="button"
              aria-pressed={paymentType === 'differentiated'}
              onClick={() => setPaymentType('differentiated')}
            >
              Убывающие платежи
            </button>
          </div>

          <section className={styles.result} aria-live="polite">
            <p className={styles.resultLabel}>{paymentType === 'annuity' ? 'Платёж в месяц' : 'Первый платёж'}</p>
            <p className={`${styles.payment} drafted`}>{formatPrice(Math.round(result.monthly))}</p>
            {paymentType === 'differentiated' && (
              <p className="secondary">Последний платёж: {formatPrice(Math.round(result.lastMonthly))}</p>
            )}
            <dl className="facts">
              <dt>Сумма займа</dt>
              <dd>{formatPrice(result.loan)}</dd>
              <dt>Переплата</dt>
              <dd>{formatPrice(Math.round(result.overpayment))}</dd>
              <dt>Всего выплат</dt>
              <dd>{formatPrice(Math.round(result.total))}</dd>
              <dt>Ставка</dt>
              <dd>{String(rate).replace('.', ',')}% годовых</dd>
            </dl>

            {eligibility && !eligibility.eligible && (
              <p className={styles.issue}>
                Эта квартира не подходит под «{program?.name}»: {eligibility.reason.toLowerCase()}.
              </p>
            )}
            {issues.map((issue) => (
              <p key={issue} className={styles.issue}>
                {issue}
              </p>
            ))}
          </section>

          {program && (
            <section className={styles.program}>
              <h2 className="section-title">
                {program.bank}, «{program.name}»
              </h2>
              {program.rateNote && <p>{program.rateNote}</p>}
              {program.note && <p className="secondary">{program.note}</p>}
              <p className={styles.hint}>
                Условия проверены {formatDate(program.verifiedAt)}.{' '}
                <ExternalLink href={program.sourceUrl}>Условия на сайте банка</ExternalLink>
              </p>
            </section>
          )}

          {comparison.length > 1 && (
            <section>
              <h2 className="section-title">Программы при этих условиях</h2>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Программа</th>
                    <th scope="col">Платёж</th>
                    <th scope="col">Подходит</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map(({ p, monthly, ok }) => (
                    <tr key={p.id}>
                      <th scope="row">
                        «{p.name}», {p.rate}%
                      </th>
                      <td className="num">{formatPrice(Math.round(monthly))}</td>
                      <td>{ok ? 'Да' : 'Нет'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          <p className={styles.hint}>
            Расчёт справочный: банк учтёт доход, страховку и комиссии. Точный график даст банк.
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
}
