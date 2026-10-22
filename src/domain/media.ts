import type { Media, MediaKind } from './types';

const bySort = (a: Media, b: Media) => a.sort - b.sort;

/** Изображения одного вида в порядке, заданном при сборе. */
export function byKind(media: Media[], kind: MediaKind): Media[] {
  return media.filter((m) => m.kind === kind).sort(bySort);
}

/** Обложка ЖК — первое фото снаружи. */
export function coverOf(media: Media[]): Media | null {
  return byKind(media, 'exterior')[0] ?? null;
}

/** Первое фото снаружи для каждого ЖК — для миниатюр в списках и на карте. */
export function coversByComplex(media: Media[]): Record<string, Media> {
  const out: Record<string, Media> = {};
  for (const m of [...media].sort(bySort)) {
    if (m.kind === 'exterior' && m.complexId && !out[m.complexId]) out[m.complexId] = m;
  }
  return out;
}

/** «sensata.kz» — короткая подпись ссылки на источник. */
export function sourceHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** Подпись автора под изображением: планировку и фото называем по-разному. */
export function creditLabel(m: Pick<Media, 'kind' | 'credit'>): string {
  return `${m.kind === 'plan' ? 'Планировка' : 'Фото'}: ${m.credit}`;
}
