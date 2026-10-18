import { IonContent, IonPage } from '@ionic/react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { currentTab, useTabHref } from '../app/tabs';
import { ExternalLink } from '../components/ExternalLink';
import { ListSkeleton, LoadError } from '../components/LoadState';
import { PageHeader } from '../components/PageHeader';
import { SafetyBadge } from '../components/SafetyStatus';
import { useCities, useDeveloper, useDeveloperComplexes } from '../data/queries';
import { HOUSING_CLASS_LABEL, formatCompletion, formatDate } from '../domain/format';
import listStyles from './MorePage.module.css';
import styles from './DeveloperPage.module.css';

export function DeveloperPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { pathname } = useLocation();
  const href = useTabHref();
  const developer = useDeveloper(id);
  const complexes = useDeveloperComplexes(id);
  const { data: cities } = useCities();
  const d = developer.data;
  const cityName = (cityId: string) => cities?.find((c) => c.id === cityId)?.name ?? cityId;

  return (
    <IonPage>
      <PageHeader title={d?.name ?? 'Застройщик'} backHref={`/${currentTab(pathname)}`} />
      <IonContent>
        <div className="page">
          {developer.isPending && <ListSkeleton rows={2} />}
          {developer.isError && <LoadError what="застройщика" onRetry={() => void developer.refetch()} />}
          {d && (
            <>
              <h1 className={styles.title}>{d.name}</h1>
              {d.description && <p className={styles.description}>{d.description}</p>}

              <dl className="facts">
                {d.bin && (
                  <>
                    <dt>БИН</dt>
                    <dd>{d.bin}</dd>
                  </>
                )}
                {d.foundedYear && (
                  <>
                    <dt>На рынке с</dt>
                    <dd>{d.foundedYear}</dd>
                  </>
                )}
                {d.completedCount != null && (
                  <>
                    <dt>Сдано объектов</dt>
                    <dd>{d.completedCount}</dd>
                  </>
                )}
                {d.website && (
                  <>
                    <dt>Сайт</dt>
                    <dd>
                      <ExternalLink href={d.website}>{d.website.replace(/^https?:\/\//, '')}</ExternalLink>
                    </dd>
                  </>
                )}
                {d.phone && (
                  <>
                    <dt>Телефон</dt>
                    <dd>
                      <a href={`tel:${d.phone}`}>{d.phone}</a>
                    </dd>
                  </>
                )}
              </dl>

              <h2 className="section-title">ЖК в приложении</h2>
              {complexes.isPending && <ListSkeleton rows={2} />}
              <ul className={listStyles.list}>
                {(complexes.data ?? []).map((c) => (
                  <li key={c.id}>
                    <Link to={href(`/complex/${c.id}`)} className={listStyles.link}>
                      <span className={listStyles.title}>{c.name}</span>
                      <span className={listStyles.text}>
                        {cityName(c.cityId)}
                        {c.housingClass && `, ${HOUSING_CLASS_LABEL[c.housingClass].toLowerCase()}`}, сдача{' '}
                        {formatCompletion(c.completion, c.status)}
                      </span>
                      <SafetyBadge status={c.safety} />
                    </Link>
                  </li>
                ))}
              </ul>

              {d.verifiedAt && (
                <p className={styles.source}>Сведения проверены {formatDate(d.verifiedAt)}.</p>
              )}
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}
