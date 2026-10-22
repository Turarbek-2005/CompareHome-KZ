import { IonIcon, IonModal } from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import { useRef, useState } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import type { Media } from '../domain/types';
import styles from './ImageViewer.module.css';
import { MediaCredit } from './MediaCredit';

interface Props {
  items: Media[];
  /** Открытый кадр; null — просмотр закрыт. */
  index: number | null;
  onClose: () => void;
  title?: string;
}

/**
 * Полноэкранный просмотр: листание вбок, зум двумя пальцами и двойным касанием.
 * Пока кадр увеличен, листание выключено — иначе жест «двигать картинку» превращался бы в «следующий кадр».
 */
export function ImageViewer({ items, index, onClose, title = 'Изображения' }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const zoomedRef = useRef(false);
  const [current, setCurrent] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const item = items[current];

  const scrollTo = (i: number) => {
    const el = trackRef.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'instant' as ScrollBehavior });
  };

  return (
    <IonModal
      isOpen={index != null}
      onWillPresent={() => {
        setCurrent(index ?? 0);
        setZoomed(false);
        zoomedRef.current = false;
      }}
      onDidPresent={() => scrollTo(index ?? 0)}
      onDidDismiss={onClose}
      className="viewer"
      aria-label={title}
    >
      <div className={styles.viewer}>
        <div className={styles.top}>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Закрыть просмотр">
            <IonIcon icon={closeOutline} />
          </button>
          {items.length > 1 && (
            <span className={styles.counter} aria-live="polite">
              {current + 1} из {items.length}
            </span>
          )}
        </div>

        <div
          ref={trackRef}
          className={styles.track}
          data-zoomed={zoomed}
          onScroll={(e) => {
            const el = e.currentTarget;
            const i = Math.round(el.scrollLeft / el.clientWidth);
            if (i !== current) setCurrent(i);
          }}
        >
          {items.map((m, i) => (
            <div key={m.id} className={styles.slide}>
              <TransformWrapper
                minScale={1}
                maxScale={6}
                centerOnInit
                doubleClick={{ mode: 'toggle', step: 1.6 }}
                panning={{ disabled: !zoomed || i !== current }}
                onTransform={(_, state) => {
                  if (i !== current) return;
                  const z = state.scale > 1.02;
                  if (z !== zoomedRef.current) {
                    zoomedRef.current = z;
                    setZoomed(z);
                  }
                }}
              >
                <TransformComponent wrapperClass={styles.zoomWrap} contentClass={styles.zoomContent}>
                  <img
                    src={m.url}
                    alt={m.caption ?? (m.kind === 'plan' ? 'Планировка' : 'Фото')}
                    referrerPolicy="no-referrer"
                    loading={Math.abs(i - (index ?? 0)) <= 1 ? 'eager' : 'lazy'}
                    className={m.kind === 'plan' ? styles.plan : styles.photo}
                  />
                </TransformComponent>
              </TransformWrapper>
            </div>
          ))}
        </div>

        {item && (
          <div className={styles.bottom}>
            {item.caption && <p className={styles.caption}>{item.caption}</p>}
            <MediaCredit media={item} className={styles.credit} />
            {!zoomed && <p className={styles.hint}>Чтобы приблизить, коснитесь дважды или разведите пальцы</p>}
          </div>
        )}
      </div>
    </IonModal>
  );
}
