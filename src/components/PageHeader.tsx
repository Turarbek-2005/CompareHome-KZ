import { IonBackButton, IonButtons, IonHeader, IonToolbar } from '@ionic/react';
import type { ReactNode } from 'react';
import { OfflineBanner } from './OfflineBanner';
import styles from './PageHeader.module.css';

interface Props {
  title: string;
  /** Куда вести «Назад», если истории нет (открыли по ссылке). Без него — страница верхнего уровня. */
  backHref?: string;
  end?: ReactNode;
  children?: ReactNode;
}

export function PageHeader({ title, backHref, end, children }: Props) {
  return (
    <IonHeader>
      <IonToolbar>
        {backHref && (
          <IonButtons slot="start">
            <IonBackButton defaultHref={backHref} text="" aria-label="Назад" />
          </IonButtons>
        )}
        <div className={backHref ? styles.titleSmall : styles.title} role="heading" aria-level={1}>
          {title}
        </div>
        {end && <IonButtons slot="end">{end}</IonButtons>}
      </IonToolbar>
      {children}
      <OfflineBanner />
    </IonHeader>
  );
}
