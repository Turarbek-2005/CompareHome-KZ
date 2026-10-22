import { creditLabel, sourceHost } from '../domain/media';
import type { Media } from '../domain/types';
import { ExternalLink } from './ExternalLink';
import styles from './MediaCredit.module.css';

/** «Фото: Sensata Group, sensata.kz» — источник под каждым изображением. */
export function MediaCredit({ media, className }: { media: Pick<Media, 'kind' | 'credit' | 'sourceUrl'>; className?: string }) {
  return (
    <p className={[styles.credit, className].filter(Boolean).join(' ')}>
      {creditLabel(media)}, <ExternalLink href={media.sourceUrl}>{sourceHost(media.sourceUrl)}</ExternalLink>
    </p>
  );
}
