import { IonContent, IonModal, IonPage } from '@ionic/react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CitySelect } from '../components/CitySelect';
import { LazyMapView as MapView } from '../components/LazyMapView';
import type { MapPoint } from '../components/MapView';
import { PageHeader } from '../components/PageHeader';
import { RemoteImage } from '../components/RemoteImage';
import { SafetyBadge } from '../components/SafetyStatus';
import { useCities, useCityApartments, useComplexes, useCovers } from '../data/queries';
import { groupByComplex } from '../domain/catalog';
import { formatCompletion, formatPricePerM2Range, formatPriceShort } from '../domain/format';
import { useCatalog } from '../store/filters';
import styles from './MapPage.module.css';

export function MapPage() {
  const cityId = useCatalog((s) => s.cityId);
  const setCity = useCatalog((s) => s.setCity);
  const { data: cities } = useCities();
  const { data: complexes } = useComplexes(cityId);
  const { data: apartments } = useCityApartments(cityId);
  const { data: covers } = useCovers();
  const [selected, setSelected] = useState<string | null>(null);

  const city = cities?.find((c) => c.id === cityId);
  const summaries = useMemo(() => new Map(groupByComplex(apartments ?? []).map((s) => [s.complexId, s])), [apartments]);
  const located = (complexes ?? []).filter((c) => c.lat != null && c.lng != null);
  const unlocated = (complexes ?? []).filter((c) => c.lat == null || c.lng == null);

  // ЖК с одним адресом (соседние очереди) — одна метка со всеми названиями.
  const points = useMemo(() => {
    const byCoord = new Map<string, MapPoint>();
    for (const c of located) {
      const key = `${c.lat},${c.lng}`;
      const existing = byCoord.get(key);
      if (existing) existing.label += `, ${c.name}`;
      else byCoord.set(key, { key, lat: c.lat!, lng: c.lng!, label: c.name, safety: c.safety });
    }
    return [...byCoord.values()];
  }, [located]);

  const selectedComplexes = (complexes ?? []).filter((c) => `${c.lat},${c.lng}` === selected);

  return (
    <IonPage>
      <PageHeader title="Карта" end={<CitySelect value={cityId} onChange={setCity} />} />
      <IonContent scrollY={false}>
        <div className={styles.wrap}>
          {city && <MapView center={[city.lat, city.lng]} zoom={11} points={points} onSelect={setSelected} />}
          {unlocated.length > 0 && (
            <p className={styles.unlocated}>
              Без точного адреса: {unlocated.map((c) => c.name).join(', ')}
            </p>
          )}
          <ul className={styles.legend} aria-label="Обозначения">
            {(['kzhk_guarantee', 'bank', 'akimat_permit', 'unknown'] as const).map((s) => (
              <li key={s}>
                <SafetyBadge status={s} />
              </li>
            ))}
          </ul>
        </div>

        <IonModal
          isOpen={selected != null}
          onDidDismiss={() => setSelected(null)}
          breakpoints={[0, 0.45, 0.8]}
          initialBreakpoint={0.45}
          className="sheet"
        >
          <IonContent>
            <div className={styles.sheet}>
              {selectedComplexes.map((c) => {
                const s = summaries.get(c.id);
                const cover = covers?.[c.id];
                return (
                  <section key={c.id} className={styles.item}>
                    {cover && (
                      <span className={styles.cover}>
                        <RemoteImage src={cover.thumbUrl ?? cover.url} alt="" ratio="16 / 9" />
                      </span>
                    )}
                    <h2 className={styles.name}>{c.name}</h2>
                    <p className="secondary">{c.developerName}</p>
                    <SafetyBadge status={c.safety} />
                    <p className="num">
                      Сдача {formatCompletion(c.completion, c.status)}
                      {s && (
                        <>
                          <br />
                          от {formatPriceShort(s.minPrice)}, {formatPricePerM2Range(s.minPpm2, s.maxPpm2)}
                        </>
                      )}
                    </p>
                    <Link to={`/map/complex/${c.id}`} className="btn btn-primary" onClick={() => setSelected(null)}>
                      Открыть ЖК
                    </Link>
                  </section>
                );
              })}
            </div>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
}
