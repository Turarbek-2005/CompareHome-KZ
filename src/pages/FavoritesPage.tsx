import { IonContent, IonPage } from '@ionic/react';
import { Link } from 'react-router-dom';
import { ApartmentRow } from '../components/ApartmentRow';
import { CompareTray } from '../components/CompareTray';
import { EmptyState } from '../components/EmptyState';
import { ListSkeleton } from '../components/LoadState';
import { PageHeader } from '../components/PageHeader';
import { useApartmentsByIds } from '../data/queries';
import { useFavorites } from '../store/favorites';

export function FavoritesPage() {
  const ids = useFavorites((s) => s.ids);
  const { data, isPending } = useApartmentsByIds(ids);
  const missing = data ? ids.length - data.length : 0;

  return (
    <IonPage>
      <PageHeader title="Избранное" />
      <IonContent>
        <div className="page">
          {ids.length === 0 ? (
            <EmptyState
              title="Пока пусто"
              text="Сохраняйте квартиры кнопкой «Сохранить в избранное», чтобы вернуться к ним позже."
              action={
                <Link to="/catalog" className="btn btn-primary">
                  Открыть каталог
                </Link>
              }
            />
          ) : (
            <>
              {isPending && <ListSkeleton rows={Math.min(ids.length, 4)} />}
              <ul style={{ margin: 0, padding: 0 }}>
                {(data ?? []).map((a) => (
                  <ApartmentRow key={a.id} apartment={a} />
                ))}
              </ul>
              {missing > 0 && (
                <p className="secondary" style={{ marginTop: 16, fontSize: 'var(--t-xs)' }}>
                  Ещё {missing} из сохранённых квартир сняты с продажи.
                </p>
              )}
            </>
          )}
        </div>
      </IonContent>
      <CompareTray />
    </IonPage>
  );
}
