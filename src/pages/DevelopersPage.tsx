import { IonContent, IonPage } from '@ionic/react';
import { Link } from 'react-router-dom';
import { ListSkeleton, LoadError } from '../components/LoadState';
import { PageHeader } from '../components/PageHeader';
import { useCities, useDevelopers } from '../data/queries';
import styles from './MorePage.module.css';

export function DevelopersPage() {
  const { data, isPending, isError, refetch } = useDevelopers();
  const { data: cities } = useCities();
  const cityName = (id: string) => cities?.find((c) => c.id === id)?.name ?? id;

  return (
    <IonPage>
      <PageHeader title="Застройщики" backHref="/more" />
      <IonContent>
        <div className="page">
          {isPending && <ListSkeleton rows={3} />}
          {isError && <LoadError what="застройщиков" onRetry={() => void refetch()} />}
          <ul className={styles.list}>
            {(data ?? []).map((d) => (
              <li key={d.id}>
                <Link to={`/more/developer/${d.id}`} className={styles.link}>
                  <span className={styles.title}>{d.name}</span>
                  <span className={styles.text}>
                    {d.complexCount} ЖК в приложении:{' '}
                    {d.cityIds.map(cityName).join(', ')}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </IonContent>
    </IonPage>
  );
}
