import { SAFETY_EXPLANATION, SAFETY_LABEL } from '../domain/format';
import type { SafetyStatus as Status } from '../domain/types';
import { ExternalLink } from './ExternalLink';
import styles from './SafetyStatus.module.css';

/** Квадрат-обозначение статуса: залитый — есть гарант, контур — без гаранта, пунктир — не проверено. */
export function SafetyGlyph({ status }: { status: Status }) {
  return <span className={`${styles.glyph} ${styles[status]}`} aria-hidden="true" />;
}

export function SafetyBadge({ status }: { status: Status }) {
  return (
    <span className={styles.badge}>
      <SafetyGlyph status={status} />
      {SAFETY_LABEL[status]}
    </span>
  );
}

interface DetailsProps {
  status: Status;
  note: string | null;
  registryUrl: string | null;
}

export function SafetyDetails({ status, note, registryUrl }: DetailsProps) {
  return (
    <section className={styles.details} aria-labelledby="safety-title">
      <h2 id="safety-title" className={styles.title}>
        <SafetyGlyph status={status} />
        {SAFETY_LABEL[status]}
      </h2>
      <p>{SAFETY_EXPLANATION[status]}</p>
      {note && <p className="secondary">{note}</p>}
      {registryUrl && <ExternalLink href={registryUrl}>Открыть запись реестра</ExternalLink>}
    </section>
  );
}
