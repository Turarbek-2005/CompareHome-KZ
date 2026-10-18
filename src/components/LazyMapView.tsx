import { lazy, Suspense, type ComponentProps } from 'react';
import type { MapView } from './MapView';

// Leaflet нужен только на карте и странице ЖК — грузим его отдельно от основного кода.
const MapViewImpl = lazy(() => import('./MapView').then((m) => ({ default: m.MapView })));

export function LazyMapView(props: ComponentProps<typeof MapView>) {
  return (
    <Suspense fallback={<div style={{ height: '100%', background: 'var(--rule)' }} aria-label="Загружаем карту" />}>
      <MapViewImpl {...props} />
    </Suspense>
  );
}
