import { IonContent, IonPage, IonRefresher, IonRefresherContent } from '@ionic/react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApartmentRow } from '../components/ApartmentRow';
import { Chips } from '../components/Chips';
import { CitySelect } from '../components/CitySelect';
import { CompareTray } from '../components/CompareTray';
import { ComplexRow } from '../components/ComplexRow';
import { EmptyState } from '../components/EmptyState';
import { FilterSheet } from '../components/FilterSheet';
import { ListSkeleton, LoadError } from '../components/LoadState';
import { PageHeader } from '../components/PageHeader';
import { useCityApartments, useCovers } from '../data/queries';
import { filterApartments, groupByComplex, sortApartments } from '../domain/catalog';
import { EMPTY_FILTERS, activeFilterCount, type SortKey } from '../domain/filters';
import { formatDate } from '../domain/format';
import { useCatalog } from '../store/filters';
import styles from './CatalogPage.module.css';

const ROOMS = [
  { value: 0, label: 'Студия' },
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4+' },
];

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'price', label: 'Сначала дешевле' },
  { value: 'ppm2', label: 'Дешевле за м²' },
  { value: 'area', label: 'Больше площадь' },
  { value: 'completion', label: 'Раньше сдача' },
];

export function CatalogPage() {
  const { cityId, filters, sort, view, setCity, setFilters, resetFilters, setSort, setView } = useCatalog();
  const { data, isPending, isError, refetch } = useCityApartments(cityId);
  const { data: covers } = useCovers();
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = useMemo(() => sortApartments(filterApartments(data ?? [], filters), sort), [data, filters, sort]);
  const groups = useMemo(() => groupByComplex(filtered), [filtered]);
  const collectedAt = useMemo(
    () => (data ?? []).reduce<string | null>((max, a) => (a.collectedAt && (!max || a.collectedAt > max) ? a.collectedAt : max), null),
    [data],
  );
  const extra = activeFilterCount(filters);

  return (
    <IonPage>
      <PageHeader title="Каталог" end={<CitySelect value={cityId} onChange={setCity} />} />
      <IonContent>
        <IonRefresher
          slot="fixed"
          onIonRefresh={async (e) => {
            await refetch();
            e.detail.complete();
          }}
        >
          <IonRefresherContent />
        </IonRefresher>

        <div className="page">
          <label className="visually-hidden" htmlFor="catalog-search">
            Поиск по ЖК и застройщику
          </label>
          <input
            id="catalog-search"
            className={`input ${styles.search}`}
            type="search"
            placeholder="ЖК или застройщик"
            value={filters.query}
            onChange={(e) => setFilters({ query: e.target.value })}
          />

          <div className={styles.quick}>
            <Chips label="Комнат" options={ROOMS} selected={filters.rooms} onChange={(rooms) => setFilters({ rooms })} />
            <button type="button" className="chip" aria-pressed={extra > 0} onClick={() => setSheetOpen(true)}>
              {extra > 0 ? `Фильтры: ${extra}` : 'Фильтры'}
            </button>
          </div>

          <div className={styles.bar}>
            <div className={styles.segmented} role="group" aria-label="Что показывать">
              <button type="button" aria-pressed={view === 'apartments'} onClick={() => setView('apartments')}>
                Квартиры <span className="num">{filtered.length}</span>
              </button>
              <button type="button" aria-pressed={view === 'complexes'} onClick={() => setView('complexes')}>
                ЖК <span className="num">{groups.length}</span>
              </button>
            </div>
            <label className={styles.sort}>
              <span className="visually-hidden">Сортировка</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {isPending && <ListSkeleton />}
          {isError && !data && <LoadError what="каталог" onRetry={() => void refetch()} />}

          {data && filtered.length === 0 && (
            <EmptyState
              title="Нет квартир с такими условиями"
              text="Уберите часть фильтров или выберите другой город."
              action={
                <button type="button" className="btn" onClick={() => setFilters(EMPTY_FILTERS)}>
                  Сбросить фильтры
                </button>
              }
            />
          )}

          {view === 'apartments' ? (
            <ul className={styles.list}>
              {filtered.map((a) => (
                <ApartmentRow key={a.id} apartment={a} />
              ))}
            </ul>
          ) : (
            <ul className={styles.list}>
              {groups.map((g) => (
                <ComplexRow key={g.complexId} summary={g} cover={covers?.[g.complexId]} />
              ))}
            </ul>
          )}

          {collectedAt && (
            <p className={styles.footnote}>
              Цены с сайтов застройщиков на {formatDate(collectedAt)}, уточняйте актуальную цену у застройщика.{' '}
              <Link to="/more/sources">Откуда данные</Link>
            </p>
          )}
        </div>

        <FilterSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          filters={filters}
          onChange={setFilters}
          onReset={resetFilters}
          resultCount={filtered.length}
        />
      </IonContent>
      <CompareTray />
    </IonPage>
  );
}
