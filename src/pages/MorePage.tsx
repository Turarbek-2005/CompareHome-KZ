import { IonContent, IonPage } from '@ionic/react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import styles from './MorePage.module.css';

const LINKS = [
  { to: '/more/mortgage', title: 'Ипотечный калькулятор', text: 'Платёж по «Наурыз», «Отау» или своей ставке' },
  { to: '/more/developers', title: 'Застройщики', text: 'Компании, их ЖК и контакты' },
  { to: '/more/sources', title: 'Откуда данные', text: 'Источники, даты обновления и лицензии' },
];

export function MorePage() {
  return (
    <IonPage>
      <PageHeader title="Ещё" />
      <IonContent>
        <div className="page">
          <ul className={styles.list}>
            {LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className={styles.link}>
                  <span className={styles.title}>{l.title}</span>
                  <span className={styles.text}>{l.text}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className={styles.about}>
            CompareHome KZ помогает сравнить квартиры в новостройках разных застройщиков. Приложение не связано с
            застройщиками и банками и не продаёт квартиры. Цены и условия справочные: перед сделкой сверяйте их у
            застройщика, в банке и в eGov Mobile.
          </p>
          <p className={styles.version}>Версия 0.1.0</p>
        </div>
      </IonContent>
    </IonPage>
  );
}
