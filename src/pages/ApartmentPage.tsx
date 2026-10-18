import { Share } from '@capacitor/share';
import { IonContent, IonPage } from '@ionic/react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { currentTab, useTabHref } from '../app/tabs';
import { BenchmarkDelta } from '../components/BenchmarkDelta';
import { CompareToggle } from '../components/CompareToggle';
import { ExternalLink } from '../components/ExternalLink';
import { FavoriteToggle } from '../components/FavoriteToggle';
import { Footprint, ScaleBar } from '../components/Footprint';
import { ListSkeleton, LoadError } from '../components/LoadState';
import { PageHeader } from '../components/PageHeader';
import { SafetyBadge } from '../components/SafetyStatus';
import { useAppToast } from '../components/useAppToast';
import { useApartment, useMortgagePrograms } from '../data/queries';
import {
  FINISHING_LABEL,
  HOUSING_CLASS_LABEL,
  WALL_MATERIAL_LABEL,
  formatArea,
  formatCompletion,
  formatDate,
  formatFloor,
  formatMeters,
  formatPrice,
  formatPricePerM2,
  formatRoomsLong,
} from '../domain/format';
import { checkEligibility, contextOf } from '../domain/mortgage';
import styles from './ApartmentPage.module.css';

const NO_DATA = 'Нет данных';

export function ApartmentPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { pathname } = useLocation();
  const href = useTabHref();
  const { data: a, isPending, isError, refetch } = useApartment(id);
  const { data: programs } = useMortgagePrograms();
  const say = useAppToast();

  const share = async () => {
    if (!a) return;
    const text = `${a.complexName}, ${formatRoomsLong(a.rooms).toLowerCase()} ${formatArea(a.area)}: ${formatPrice(a.price)}`;
    try {
      await Share.share({ title: a.complexName, text, url: a.sourceUrl ?? undefined });
    } catch {
      await navigator.clipboard?.writeText(text);
      say('Описание скопировано');
    }
  };

  return (
    <IonPage>
      <PageHeader title={a?.complexName ?? 'Квартира'} backHref={`/${currentTab(pathname)}`} />
      <IonContent>
        <div className="page">
          {isPending && <ListSkeleton rows={2} />}
          {isError && <LoadError what="квартиру" onRetry={() => void refetch()} />}
          {a && (
            <>
              <figure className={styles.plan}>
                <Footprint area={a.area} rooms={a.rooms} kitchenArea={a.kitchenArea} scale="detail" dimensions />
                <figcaption className={styles.planCaption}>
                  <ScaleBar scale="detail" />
                  <span>Схема по площади, не планировка</span>
                </figcaption>
              </figure>

              <h1 className={styles.title}>
                {formatRoomsLong(a.rooms)}, {formatArea(a.area)}
              </h1>
              <p className={`${styles.price} drafted`}>{formatPrice(a.price)}</p>
              <p className={styles.ppm2}>{formatPricePerM2(a.pricePerM2)}</p>
              <BenchmarkDelta cityId={a.cityId} pricePerM2={a.pricePerM2} />
              {a.collectedAt && (
                <p className={styles.note}>
                  Базовая цена на {formatDate(a.collectedAt)}, без акций. Уточняйте у застройщика.
                </p>
              )}

              <div className={styles.actions}>
                <CompareToggle id={a.id} />
                <FavoriteToggle id={a.id} />
              </div>

              <dl className="facts">
                <dt>ЖК</dt>
                <dd>
                  <Link to={href(`/complex/${a.complexId}`)}>{a.complexName}</Link>
                </dd>
                <dt>Застройщик</dt>
                <dd>
                  <Link to={href(`/developer/${a.developerId}`)}>{a.developerName}</Link>
                </dd>
                <dt>Защита дольщиков</dt>
                <dd>
                  <SafetyBadge status={a.safety} />
                </dd>
                <dt>Сдача</dt>
                <dd>{formatCompletion(a.completion, a.complexStatus)}</dd>
                <dt>Этаж</dt>
                <dd>{formatFloor(a.floor, a.floorsTotal)}</dd>
                <dt>Отделка</dt>
                <dd>{a.finishing ? FINISHING_LABEL[a.finishing] : NO_DATA}</dd>
                <dt>Потолки</dt>
                <dd>{a.ceilingHeight ? formatMeters(a.ceilingHeight) : NO_DATA}</dd>
                <dt>Класс</dt>
                <dd>{a.housingClass ? HOUSING_CLASS_LABEL[a.housingClass] : NO_DATA}</dd>
                <dt>Стены</dt>
                <dd>{a.wallMaterial ? WALL_MATERIAL_LABEL[a.wallMaterial] : NO_DATA}</dd>
                {a.unitNo && (
                  <>
                    <dt>Номер у застройщика</dt>
                    <dd>№ {a.unitNo}</dd>
                  </>
                )}
              </dl>

              <h2 className="section-title">Ипотека</h2>
              <ul className={styles.programs}>
                {(programs ?? []).map((p) => {
                  const e = checkEligibility(p, contextOf(a));
                  return (
                    <li key={p.id}>
                      <span className={e.eligible ? styles.yes : styles.no}>
                        {p.bank}, «{p.name}»: {e.eligible ? 'подходит' : 'не подходит'}
                      </span>
                      {!e.eligible && <span className="secondary"> {e.reason}.</span>}
                    </li>
                  );
                })}
              </ul>
              <Link to={`/more/mortgage?apartment=${a.id}`} className="btn btn-block">
                Рассчитать ипотеку
              </Link>

              <div className={styles.links}>
                {a.sourceUrl && (
                  <ExternalLink href={a.sourceUrl} className="btn btn-block">
                    Открыть на сайте застройщика
                  </ExternalLink>
                )}
                <button type="button" className="btn-quiet" onClick={() => void share()}>
                  Поделиться
                </button>
              </div>
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}
