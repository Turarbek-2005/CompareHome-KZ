import { useState } from 'react';
import type { Media } from '../domain/types';
import styles from './Gallery.module.css';
import { ImageViewer } from './ImageViewer';
import { MediaCredit } from './MediaCredit';
import { RemoteImage } from './RemoteImage';

interface Props {
  title: string;
  items: Media[];
}

/** Лента миниатюр со snap; касание открывает просмотр с этого кадра. */
export function Gallery({ title, items }: Props) {
  const [index, setIndex] = useState<number | null>(null);
  if (items.length === 0) return null;
  return (
    <section className={styles.gallery} aria-label={title}>
      <h2 className="section-title">{title}</h2>
      <ul className={styles.strip}>
        {items.map((m, i) => (
          <li key={m.id} className={styles.item}>
            <button
              type="button"
              className={styles.thumb}
              onClick={() => setIndex(i)}
              aria-label={`Открыть ${i + 1} из ${items.length}${m.caption ? `: ${m.caption}` : ''}`}
            >
              <RemoteImage src={m.thumbUrl ?? m.url} alt="" ratio="4 / 3" />
            </button>
            {m.caption && <span className={styles.caption}>{m.caption}</span>}
          </li>
        ))}
      </ul>
      <MediaCredit media={items[0]!} />
      <ImageViewer items={items} index={index} onClose={() => setIndex(null)} title={title} />
    </section>
  );
}
