import { Share } from '@capacitor/share';
import { IonContent, IonIcon, IonPage } from '@ionic/react';
import { closeOutline, shareOutline } from 'ionicons/icons';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { DeveloperPlan } from '../components/DeveloperPlan';
import { EmptyState } from '../components/EmptyState';
import { Footprint, ScaleBar } from '../components/Footprint';
import { ImageViewer } from '../components/ImageViewer';
import { ListSkeleton } from '../components/LoadState';
import { Marker } from '../components/Marker';
import { PageHeader } from '../components/PageHeader';
import { useAppToast } from '../components/useAppToast';
import { useApartmentsByIds, useBenchmarks, useMortgagePrograms, usePlans } from '../data/queries';
import { buildCompareRows, compareSummary, onlyDifferences, type CompareRow } from '../domain/compare';
import { formatArea, formatRooms } from '../domain/format';
import { useCompare } from '../store/compare';
import styles from './ComparePage.module.css';

const GROUP_TITLE: Record<CompareRow['group'], string> = {
  price: 'Цена',
  space: 'Квартира',
  house: 'Дом',
  mortgage: 'Ипотека',
};

export function ComparePage() {
  const { ids, remove, clear, programId, setProgram, termYears } = useCompare();
  const diffOnly = useCompare((s) => s.onlyDifferences);
  const setDiffOnly = useCompare((s) => s.setOnlyDifferences);
  const { data: apartments, isPending } = useApartmentsByIds(ids);
  const { data: programs } = useMortgagePrograms();
  const { data: benchmarks } = useBenchmarks();
  const say = useAppToast();

  const program = programs?.find((p) => p.id === programId) ?? programs?.[0] ?? null;

  // Квартиры, которых больше нет в каталоге (проданы), убираем из сравнения.
  useEffect(() => {
    if (!apartments) return;
    const gone = ids.filter((id) => !apartments.some((a) => a.id === id));
    if (gone.length) {
      gone.forEach(remove);
      say(gone.length === 1 ? 'Одна квартира снята с продажи и убрана из сравнения' : 'Проданные квартиры убраны из сравнения');
    }
  }, [apartments, ids, remove, say]);

  const rows = useMemo(
    () =>
      apartments
        ? buildCompareRows(apartments, {
            benchmarkFor: (cityId) => benchmarks?.[cityId]?.pricePerM2 ?? null,
            program,
            termYears,
          })
        : [],
    [apartments, benchmarks, program, termYears],
  );
  const shown = diffOnly ? onlyDifferences(rows) : rows;
  const list = apartments ?? [];
  const grid = { '--cols': list.length } as CSSProperties;

  // Планировки застройщиков весят до 1,4 МБ — грузим их только по просьбе.
  const [showPlans, setShowPlans] = useState(false);
  const { data: plans, isFetching: plansLoading } = usePlans(ids, showPlans);
  const planList = list.map((a) => plans?.[a.id]).filter((p) => p !== undefined);
  const [planViewer, setPlanViewer] = useState<number | null>(null);

  const share = async () => {
    const text = compareSummary(list);
    try {
      await Share.share({ title: 'Сравнение квартир', text });
    } catch {
      // В браузере без Web Share копируем сводку в буфер.
      await navigator.clipboard?.writeText(text);
      say('Сводка скопирована');
    }
  };

  return (
    <IonPage>
      <PageHeader
        title="Сравнение"
        end={
          list.length > 1 && (
            <button type="button" className="btn-icon" onClick={() => void share()} aria-label="Поделиться сравнением">
              <IonIcon icon={shareOutline} />
            </button>
          )
        }
      />
      <IonContent>
        <div className="page">
          {ids.length === 0 && (
            <EmptyState
              slots={3}
              title="Здесь будут квартиры рядом"
              text="Добавьте 2–4 квартиры из каталога, чтобы сравнить их в одном масштабе."
              action={
                <Link to="/catalog" className="btn btn-primary">
                  Открыть каталог
                </Link>
              }
            />
          )}

          {ids.length > 0 && isPending && <ListSkeleton rows={2} />}

          {list.length > 0 && (
            <>
              <div className={styles.scroller}>
                <div className={styles.sheet} style={grid}>
                  <div className={styles.plans}>
                    {list.map((a) => (
                      <div key={a.id} className={styles.column}>
                        <div className={styles.planBox}>
                          <Footprint area={a.area} rooms={a.rooms} kitchenArea={a.kitchenArea} scale="compare" />
                        </div>
                        <p className={`${styles.area} drafted`}>{formatArea(a.area)}</p>
                        <p className={styles.caption}>
                          {formatRooms(a.rooms)}
                          <br />
                          <Link to={`/compare/apartment/${a.id}`}>{a.complexName}</Link>
                        </p>
                        <button
                          type="button"
                          className={styles.remove}
                          onClick={() => remove(a.id)}
                          aria-label={`Убрать ${a.complexName}, ${formatArea(a.area)} из сравнения`}
                        >
                          <IonIcon icon={closeOutline} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className={`${styles.sticky} ${styles.scaleLine}`}>
                    <ScaleBar scale="compare" />
                    <span className="secondary">Масштаб общий для всех контуров</span>
                  </div>

                  <button
                    type="button"
                    className={`btn-quiet ${styles.sticky}`}
                    aria-expanded={showPlans}
                    onClick={() => setShowPlans((v) => !v)}
                  >
                    {showPlans ? 'Скрыть планировки застройщиков' : 'Показать планировки застройщиков'}
                  </button>
                  {showPlans && (
                    <>
                      <div className={styles.plans}>
                        {list.map((a) => {
                          const plan = plans?.[a.id];
                          if (plan) {
                            return (
                              <DeveloperPlan
                                key={a.id}
                                plan={plan}
                                compact
                                onOpen={() => setPlanViewer(planList.indexOf(plan))}
                              />
                            );
                          }
                          return (
                            <p key={a.id} className={styles.noPlan}>
                              {plansLoading ? 'Загружаем…' : 'Застройщик не публикует планировку'}
                            </p>
                          );
                        })}
                      </div>
                      <p className={`${styles.planNote} ${styles.sticky}`}>
                        Планировки из каталогов застройщиков, масштаб у каждой свой. Размеры сравнивайте по контурам выше.
                      </p>
                      <ImageViewer
                        items={planList}
                        index={planViewer}
                        onClose={() => setPlanViewer(null)}
                        title="Планировки застройщиков"
                      />
                    </>
                  )}

                  {list.length === 1 && (
                    <p className={`${styles.hint} ${styles.sticky}`}>
                      Добавьте ещё хотя бы одну квартиру, чтобы увидеть лучшие значения.
                    </p>
                  )}

                  <div className={`${styles.controls} ${styles.sticky}`}>
                    <label className={styles.switch}>
                      <input type="checkbox" checked={diffOnly} onChange={(e) => setDiffOnly(e.target.checked)} />
                      Только различия
                    </label>
                  </div>

                  {(['price', 'space', 'house', 'mortgage'] as const).map((group) => {
                    const groupRows = shown.filter((r) => r.group === group);
                    if (groupRows.length === 0 && group !== 'mortgage') return null;
                    return (
                      <section key={group} className={styles.group}>
                        <h2 className={`${styles.groupTitle} ${styles.sticky}`}>{GROUP_TITLE[group]}</h2>
                        {group === 'mortgage' && programs && programs.length > 0 && (
                          <div className={`${styles.programs} ${styles.sticky}`} role="group" aria-label="Программа для расчёта">
                            {programs.map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                className="chip"
                                aria-pressed={p.id === program?.id}
                                onClick={() => setProgram(p.id)}
                              >
                                {p.name}, {p.rate}%
                              </button>
                            ))}
                          </div>
                        )}
                        {groupRows.map((row) => (
                          <div key={row.key} className={styles.row}>
                            <p className={`${styles.label} ${styles.sticky}`}>{row.label}</p>
                            <div className={styles.cells}>
                              {row.cells.map((cell, i) => (
                                <p key={i} className={`${styles.cell} num ${cell.muted ? styles.missing : ''}`}>
                                  {cell.best ? <Marker delay={i * 60}>{cell.text}</Marker> : cell.text}
                                </p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </section>
                    );
                  })}
                </div>
              </div>

              <p className={styles.footnote}>
                Ипотека посчитана с минимальным взносом и равными платежами. Свой взнос и срок можно задать в{' '}
                <Link to="/more/mortgage">калькуляторе</Link>.
              </p>
              <button type="button" className="btn" onClick={clear}>
                Очистить сравнение
              </button>
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}
