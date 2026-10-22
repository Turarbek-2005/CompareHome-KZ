import { byKind, coverOf, coversByComplex, creditLabel, sourceHost } from './media';
import type { Media } from './types';

function media(overrides: Partial<Media>): Media {
  return {
    id: 'm',
    complexId: 'c1',
    apartmentId: null,
    kind: 'exterior',
    url: 'https://sensata.kz/img/a.jpg',
    thumbUrl: null,
    caption: null,
    credit: 'Sensata Group',
    sourceUrl: 'https://sensata.kz/project/ayala',
    collectedAt: '2026-10-23',
    sort: 0,
    ...overrides,
  };
}

const list = [
  media({ id: 'hall', kind: 'interior', sort: 5 }),
  media({ id: 'yard', kind: 'exterior', sort: 3, caption: 'Двор' }),
  media({ id: 'hero', kind: 'exterior', sort: 0 }),
  media({ id: 'other', complexId: 'c2', kind: 'exterior', sort: 1 }),
];

describe('media', () => {
  it('обложка — первое фото снаружи по порядку сбора', () => {
    expect(coverOf(list.filter((m) => m.complexId === 'c1'))?.id).toBe('hero');
  });

  it('без фото снаружи обложки нет', () => {
    expect(coverOf([media({ kind: 'interior' })])).toBeNull();
  });

  it('группирует по виду и сортирует', () => {
    expect(byKind(list, 'exterior').map((m) => m.id)).toEqual(['hero', 'other', 'yard']);
    expect(byKind(list, 'interior').map((m) => m.id)).toEqual(['hall']);
  });

  it('обложка для каждого ЖК', () => {
    const covers = coversByComplex(list);
    expect(covers.c1?.id).toBe('hero');
    expect(covers.c2?.id).toBe('other');
  });

  it('подписи источника', () => {
    expect(sourceHost('https://www.bi.group/ru/landing/aisar')).toBe('bi.group');
    expect(creditLabel({ kind: 'plan', credit: 'BAZIS-A' })).toBe('Планировка: BAZIS-A');
    expect(creditLabel({ kind: 'interior', credit: 'BI Group' })).toBe('Фото: BI Group');
  });
});
