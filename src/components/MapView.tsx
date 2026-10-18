import { useIonViewDidEnter } from '@ionic/react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import { AttributionControl, MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import type { SafetyStatus } from '../domain/types';
import styles from './MapView.module.css';

export interface MapPoint {
  key: string;
  lat: number;
  lng: number;
  label: string;
  safety: SafetyStatus;
}

interface Props {
  center: [number, number];
  zoom: number;
  points: MapPoint[];
  onSelect?: (key: string) => void;
  /** Мини-карта на странице ЖК: без жестов. */
  interactive?: boolean;
  className?: string;
}

function icon(p: MapPoint) {
  // Метка в языке приложения: квадрат статуса и подпись, а не стандартная «капля».
  return L.divIcon({
    className: styles.pin,
    html: `<span class="${styles.square} ${styles[p.safety] ?? ''}"></span><span class="${styles.label}">${escapeHtml(p.label)}</span>`,
    iconSize: undefined,
    iconAnchor: [6, 6],
  });
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/** Ionic показывает страницу с анимацией: после неё Leaflet должен пересчитать размер. */
function ResizeOnEnter() {
  const map = useMap();
  useIonViewDidEnter(() => {
    map.invalidateSize();
  });
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 300);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

/**
 * Показываем все метки сразу; переезжаем только при смене набора меток или города,
 * а не на каждый рендер (иначе карта прыгала бы при выборе метки).
 */
function FitView({ points, center, zoom }: { points: MapPoint[]; center: [number, number]; zoom: number }) {
  const map = useMap();
  const key = points.map((p) => `${p.lat},${p.lng}`).join('|');
  const [lat, lng] = center;
  useEffect(() => {
    if (points.length >= 2) {
      map.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lng])), { padding: [48, 48], maxZoom: 15 });
    } else if (points.length === 1) {
      map.setView([points[0]!.lat, points[0]!.lng], zoom);
    } else {
      map.setView([lat, lng], zoom);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key, lat, lng, zoom]);
  return null;
}

/** Подписи меток видны только вблизи — на масштабе города они наезжают друг на друга. */
function LabelsByZoom() {
  const map = useMap();
  useEffect(() => {
    const update = () => map.getContainer().classList.toggle(styles.labelsHidden ?? '', map.getZoom() < 13);
    update();
    map.on('zoomend', update);
    return () => {
      map.off('zoomend', update);
    };
  }, [map]);
  return null;
}

export function MapView({ center, zoom, points, onSelect, interactive = true, className }: Props) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={[styles.map, className].filter(Boolean).join(' ')}
      zoomControl={false}
      dragging={interactive}
      touchZoom={interactive}
      scrollWheelZoom={interactive}
      doubleClickZoom={interactive}
      keyboard={interactive}
      attributionControl={false}
    >
      <AttributionControl position="bottomright" prefix="Leaflet" />
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">Участники OpenStreetMap</a>'
        maxZoom={19}
      />
      <ResizeOnEnter />
      <FitView points={points} center={center} zoom={zoom} />
      {interactive && <LabelsByZoom />}
      {points.map((p) => (
        <Marker
          key={p.key}
          position={[p.lat, p.lng]}
          icon={icon(p)}
          keyboard={interactive}
          title={p.label}
          eventHandlers={onSelect ? { click: () => onSelect(p.key) } : undefined}
        />
      ))}
    </MapContainer>
  );
}
