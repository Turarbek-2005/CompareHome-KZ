import { IonContent, IonPage } from '@ionic/react';
import { ExternalLink } from '../components/ExternalLink';
import { ListSkeleton, LoadError } from '../components/LoadState';
import { PageHeader } from '../components/PageHeader';
import { useDataSources } from '../data/queries';
import { formatDate } from '../domain/format';
import styles from './DataSourcesPage.module.css';

export function DataSourcesPage() {
  const { data, isPending, isError, refetch } = useDataSources();
  return (
    <IonPage>
      <PageHeader title="Откуда данные" backHref="/more" />
      <IonContent>
        <div className="page">
          <p className={styles.intro}>
            Мы собираем только открытые сведения и указываем, откуда они взяты. Если цифра устарела или неверна,
            сверьтесь с источником по ссылке.
          </p>
          {isPending && <ListSkeleton rows={3} />}
          {isError && <LoadError what="список источников" onRetry={() => void refetch()} />}
          <ul className={styles.list}>
            {(data ?? []).map((s) => (
              <li key={s.id} className={styles.item}>
                <h2 className={styles.title}>{s.title}</h2>
                <p className="secondary">{s.publisher}</p>
                <p>{s.usedFor}</p>
                {s.note && <p className="secondary">{s.note}</p>}
                <p className={styles.meta}>
                  Проверено {formatDate(s.retrievedAt)}
                  {s.license && `, лицензия: ${s.license}`}
                </p>
                <ExternalLink href={s.url}>Открыть источник</ExternalLink>
              </li>
            ))}
          </ul>
        </div>
      </IonContent>
    </IonPage>
  );
}
