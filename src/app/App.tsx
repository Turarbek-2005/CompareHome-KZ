import {
  IonApp,
  IonBadge,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ellipsisHorizontal, heartOutline, mapOutline } from 'ionicons/icons';
import type { ComponentType } from 'react';
import { Navigate, Route } from 'react-router-dom';
import { ApartmentPage } from '../pages/ApartmentPage';
import { CatalogPage } from '../pages/CatalogPage';
import { ComparePage } from '../pages/ComparePage';
import { ComplexPage } from '../pages/ComplexPage';
import { DataSourcesPage } from '../pages/DataSourcesPage';
import { DeveloperPage } from '../pages/DeveloperPage';
import { DevelopersPage } from '../pages/DevelopersPage';
import { FavoritesPage } from '../pages/FavoritesPage';
import { MapPage } from '../pages/MapPage';
import { MorePage } from '../pages/MorePage';
import { MortgagePage } from '../pages/MortgagePage';
import { useCompare } from '../store/compare';
import { catalogIcon, compareIcon } from './icons';
import { TABS } from './tabs';

// Один вид на Android и iOS: внешний вид задаёт наша тема, а не платформа.
setupIonicReact({ mode: 'md' });

const DETAIL: [string, ComponentType][] = [
  ['apartment/:id', ApartmentPage],
  ['complex/:id', ComplexPage],
  ['developer/:id', DeveloperPage],
];

export function App() {
  const compareCount = useCompare((s) => s.ids.length);
  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/more" element={<MorePage />} />
            <Route path="/more/mortgage" element={<MortgagePage />} />
            <Route path="/more/developers" element={<DevelopersPage />} />
            <Route path="/more/sources" element={<DataSourcesPage />} />
            {TABS.flatMap((tab) =>
              DETAIL.map(([path, Page]) => <Route key={`${tab}/${path}`} path={`/${tab}/${path}`} element={<Page />} />),
            )}
            <Route path="/" element={<Navigate to="/catalog" replace />} />
            <Route path="*" element={<Navigate to="/catalog" replace />} />
          </IonRouterOutlet>
          <IonTabBar slot="bottom" id="app-tabbar">
            <IonTabButton tab="catalog" href="/catalog">
              <IonIcon aria-hidden="true" icon={catalogIcon} />
              <IonLabel>Каталог</IonLabel>
            </IonTabButton>
            <IonTabButton tab="map" href="/map">
              <IonIcon aria-hidden="true" icon={mapOutline} />
              <IonLabel>Карта</IonLabel>
            </IonTabButton>
            <IonTabButton tab="compare" href="/compare">
              <IonIcon aria-hidden="true" icon={compareIcon} />
              <IonLabel>Сравнение</IonLabel>
              {compareCount > 0 && <IonBadge aria-label={`${compareCount} в сравнении`}>{compareCount}</IonBadge>}
            </IonTabButton>
            <IonTabButton tab="favorites" href="/favorites">
              <IonIcon aria-hidden="true" icon={heartOutline} />
              <IonLabel>Избранное</IonLabel>
            </IonTabButton>
            <IonTabButton tab="more" href="/more">
              <IonIcon aria-hidden="true" icon={ellipsisHorizontal} />
              <IonLabel>Ещё</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
}
