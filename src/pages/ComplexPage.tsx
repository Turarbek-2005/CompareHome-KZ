import { IonContent, IonPage } from '@ionic/react';
import { useMemo } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { currentTab, useTabHref } from '../app/tabs';
import { ApartmentRow } from '../components/ApartmentRow';
import { BenchmarkDelta } from '../components/BenchmarkDelta';
import { CompareTray } from '../components/CompareTray';
import { ExternalLink } from '../components/ExternalLink';
import { ListSkeleton, LoadError } from '../components/LoadState';
import { LazyMapView as MapView } from '../components/LazyMapView';
import { PageHeader } from '../components/PageHeader';
import { SafetyDetails } from '../components/SafetyStatus';
import { useCities, useComplex, useComplexApartments } from '../data/queries';
import { averagePricePerM2 } from '../domain/catalog';
import {
  HOUSING_CLASS_LABEL,
  WALL_MATERIAL_LABEL,
  formatCompletion,
  formatDate,
  formatMeters,
  formatPricePerM2,
} from '../domain/format';
import type { Apartment, Complex } from '../domain/types';
import styles from './ComplexPage.module.css';

function floors(c: Complex) {
  if (c.floorsMin && c.floorsMax && c.floorsMin !== c.floorsMax) return `${c.floorsMin}–${c.floorsMax}`;
  return c.floorsMax ?? c.floorsMin ?? null;
}

export function ComplexPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { pathname } = useLocation();
  const href = useTabHref();
  const complex = useComplex(id);
  const apartments = useComplexApartments(id);
  const { data: cities } = useCities();
  const c = complex.data;
  const list = useMemo(() => apartments.data ?? [], [apartments.data]);
  const avg = averagePricePerM2(list);
  const city = cities?.find((x) => x.id === c?.cityId);

  const byRooms = useMemo(() => {
    const groups = new Map<number, Apartment[]>();
    for (const a of list) groups.set(a.rooms, [...(groups.get(a.rooms) ?? []), a]);
    return [...groups.entries()].sort(([a], [b]) => a - b);
  }, [list]);

  const facts: [string, string | number | null][] = c
    ? [
        ['Сдача', formatCompletion(c.completion, c.status)],
        ['Класс', c.housingClass ? HOUSING_CLASS_LABEL[c.housingClass] : null],
        ['Стены', c.wallMaterial ? WALL_MATERIAL_LABEL[c.wallMaterial] : null],
        ['Этажность', floors(c)],
        ['Потолки', c.ceilingHeight ? formatMeters(c.ceilingHeight) : null],
        ['Паркинг', c.parking],
        ['Рассрочка', c.installment ? `Взнос от ${c.installment.downPaymentPct}%. ${c.installment.note}` : null],
      ]
    : [];

  return (
    <IonPage>
      <PageHeader title={c?.name ?? 'Жилой комплекс'} backHref={`/${currentTab(pathname)}`} />
      <IonContent>
        <div className="page">
          {complex.isPending && <ListSkeleton rows={2} />}
          {complex.isError && <LoadError what="жилой комплекс" onRetry={() => void complex.refetch()} />}
          {c && (
            <>
              <h1 className={styles.title}>{c.name}</h1>
              <p>
                <Link to={href(`/developer/${c.developerId}`)}>{c.developerName}</Link>
              </p>
              <p className="secondary">
                {[city?.name, c.district && `район ${c.district}`, c.address].filter(Boolean).join(', ')}
              </p>

              {avg && (
                <div className={styles.price}>
                  <p className={styles.priceLabel}>Цена за м² в среднем по квартирам в продаже</p>
                  <p className={`${styles.priceValue} drafted`}>{formatPricePerM2(avg)}</p>
                  <BenchmarkDelta cityId={c.cityId} pricePerM2={avg} subject="Это" />
                </div>
              )}

              <SafetyDetails status={c.safety} note={c.safetyNote} registryUrl={c.registryUrl} />

              <dl className="facts">
                {facts
                  .filter(([, v]) => v != null && v !== '')
                  .map(([k, v]) => (
                    <div key={k} className={styles.fact}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
              </dl>

              {c.lat != null && c.lng != null && (
                <figure className={styles.mapFigure}>
                  <div className={styles.map}>
                    <MapView
                      center={[c.lat, c.lng]}
                      zoom={14}
                      points={[{ key: c.id, lat: c.lat, lng: c.lng, label: c.name, safety: c.safety }]}
                      interactive={false}
                    />
                  </div>
                  <figcaption className={styles.mapNote}>Метка стоит на улице из адреса: дом может быть в стороне.</figcaption>
                </figure>
              )}

              <h2 className="section-title">Квартиры в продаже</h2>
              {apartments.isPending && <ListSkeleton rows={3} />}
              {byRooms.map(([rooms, items]) => (
                <section key={rooms}>
                  <h3 className={styles.roomsTitle}>{rooms === 0 ? 'Студии' : `${rooms}-комнатные`}</h3>
                  <ul className={styles.list}>
                    {items.map((a) => (
                      <ApartmentRow key={a.id} apartment={a} hideComplex />
                    ))}
                  </ul>
                </section>
              ))}

              <p className={styles.source}>
                {c.collectedAt && <>Данные с сайта застройщика на {formatDate(c.collectedAt)}. </>}
                {c.salesUrl && <ExternalLink href={c.salesUrl}>Все квартиры на сайте застройщика</ExternalLink>}
              </p>
            </>
          )}
        </div>
      </IonContent>
      <CompareTray />
    </IonPage>
  );
}
