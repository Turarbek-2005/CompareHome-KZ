import {
  formatArea,
  formatCompletion,
  formatPrice,
  formatPricePerM2,
  formatPriceShort,
  formatRooms,
  formatSignedPercent,
  plural,
} from './format';

// Intl для ru-RU разделяет разряды неразрывным пробелом — сравниваем без учёта вида пробела.
const norm = (s: string) => s.replace(/\s/g, ' ');

describe('format', () => {
  it('цена целиком и коротко', () => {
    expect(norm(formatPrice(24_100_000))).toBe('24 100 000 ₸');
    expect(norm(formatPriceShort(24_150_000))).toBe('24,2 млн ₸');
    expect(norm(formatPriceShort(1_250_000_000))).toBe('1,3 млрд ₸');
    expect(norm(formatPriceShort(275_070))).toBe('275 тыс. ₸');
  });

  it('цена за метр', () => {
    expect(norm(formatPricePerM2(574_000))).toBe('574 тыс. ₸/м²');
    expect(norm(formatPricePerM2(1_665_000))).toBe('1,67 млн ₸/м²');
  });

  it('площадь с запятой', () => {
    expect(norm(formatArea(73.08))).toBe('73,08 м²');
    expect(norm(formatArea(134))).toBe('134 м²');
  });

  it('комнаты и срок сдачи', () => {
    expect(formatRooms(0)).toBe('студия');
    expect(formatRooms(3)).toBe('3-комн.');
    expect(norm(formatCompletion({ year: 2026, quarter: 4 }))).toBe('IV кв. 2026');
    expect(formatCompletion({ year: 2026, quarter: 4 }, 'completed')).toBe('Сдан');
    expect(formatCompletion(null)).toBe('Нет данных');
  });

  it('знак процента с типографским минусом', () => {
    expect(formatSignedPercent(-8.4)).toBe('−8%');
    expect(formatSignedPercent(12.5)).toBe('+13%');
    expect(formatSignedPercent(0.2)).toBe('0%');
  });

  it('склонение', () => {
    const forms: [string, string, string] = ['квартира', 'квартиры', 'квартир'];
    expect(plural(1, forms)).toBe('квартира');
    expect(plural(3, forms)).toBe('квартиры');
    expect(plural(11, forms)).toBe('квартир');
    expect(plural(94, forms)).toBe('квартиры');
  });
});
