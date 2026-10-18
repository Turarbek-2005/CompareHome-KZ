import type { Completion, ComplexStatus, Finishing, HousingClass, SafetyStatus, WallMaterial } from './types';

const NBSP = ' ';
const int = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });
const oneDecimal = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 });
const twoDecimals = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });

/** 24 100 000 ₸ */
export function formatPrice(value: number): string {
  return `${int.format(value)}${NBSP}₸`;
}

/** 24,1 млн ₸ · 1,2 млрд ₸ · 950 тыс. ₸ */
export function formatPriceShort(value: number): string {
  if (value >= 1e9) return `${oneDecimal.format(value / 1e9)}${NBSP}млрд${NBSP}₸`;
  if (value >= 1e6) return `${oneDecimal.format(value / 1e6)}${NBSP}млн${NBSP}₸`;
  return `${int.format(Math.round(value / 1e3))}${NBSP}тыс.${NBSP}₸`;
}

/** 39,12 млн ₸ — для узких колонок сравнения: точность 10 тыс. ₸ достаточна, чтобы видеть разницу. */
export function formatPriceMillions(value: number): string {
  return `${twoDecimals.format(value / 1e6)}${NBSP}млн${NBSP}₸`;
}

/** 574 тыс. ₸/м²; от миллиона — 1,67 млн ₸/м² */
export function formatPricePerM2(value: number): string {
  if (value >= 1e6) return `${twoDecimals.format(value / 1e6)}${NBSP}млн${NBSP}₸/м²`;
  return `${int.format(Math.round(value / 1e3))}${NBSP}тыс.${NBSP}₸/м²`;
}

/** 545–575 тыс. ₸/м² */
export function formatPricePerM2Range(min: number, max: number): string {
  if (Math.round(min / 1e3) === Math.round(max / 1e3)) return formatPricePerM2(min);
  if (max < 1e6) return `${int.format(Math.round(min / 1e3))}–${int.format(Math.round(max / 1e3))}${NBSP}тыс.${NBSP}₸/м²`;
  if (min >= 1e6) return `${twoDecimals.format(min / 1e6)}–${twoDecimals.format(max / 1e6)}${NBSP}млн${NBSP}₸/м²`;
  return `${formatPricePerM2(min)} – ${formatPricePerM2(max)}`;
}

/** 73,08 м² */
export function formatArea(value: number): string {
  return `${twoDecimals.format(value)}${NBSP}м²`;
}

/** 8,2 м */
export function formatMeters(value: number): string {
  return `${oneDecimal.format(value)}${NBSP}м`;
}

export function formatRooms(rooms: number): string {
  return rooms === 0 ? 'студия' : `${rooms}-комн.`;
}

export function formatRoomsLong(rooms: number): string {
  if (rooms === 0) return 'Студия';
  return `${rooms}-комнатная`;
}

const ROMAN = ['I', 'II', 'III', 'IV'];

/** IV кв. 2026; без квартала — просто год. */
export function formatCompletion(completion: Completion | null, status?: ComplexStatus): string {
  if (status === 'completed') return 'Сдан';
  if (!completion) return 'Нет данных';
  const q = completion.quarter ? `${ROMAN[completion.quarter - 1]}${NBSP}кв.${NBSP}` : '';
  return `${q}${completion.year}`;
}

/** Порядковое значение срока для сравнения: меньше — раньше. */
export function completionRank(completion: Completion | null, status?: ComplexStatus): number | null {
  if (status === 'completed') return 0;
  if (!completion) return null;
  return completion.year * 4 + (completion.quarter ?? 4);
}

export function formatFloor(floor: number | null, floorsTotal: number | null): string {
  if (floor == null) return 'Нет данных';
  return floorsTotal ? `${floor} из ${floorsTotal}` : `${floor}`;
}

/** 17.10.2026 */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}.${m}.${y}`;
}

const MONTHS_GENITIVE = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

/** 12 октября */
export function formatDayMonth(date: Date): string {
  return `${date.getDate()}${NBSP}${MONTHS_GENITIVE[date.getMonth()]}`;
}

/** −8% / +12% с типографским минусом. */
export function formatSignedPercent(value: number): string {
  const rounded = Math.round(value);
  if (rounded === 0) return '0%';
  return rounded > 0 ? `+${rounded}%` : `−${Math.abs(rounded)}%`;
}

/** plural(5, ['квартира', 'квартиры', 'квартир']) → «квартир» */
export function plural(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}

const CITY_LOCATIVE: Record<string, string> = {
  astana: 'в Астане',
  almaty: 'в Алматы',
  shymkent: 'в Шымкенте',
  karaganda: 'в Караганде',
  aktobe: 'в Актобе',
  atyrau: 'в Атырау',
  aktau: 'в Актау',
};

/** «в Астане»; для городов без формы — «по городу». */
export function cityLocative(cityId: string): string {
  return CITY_LOCATIVE[cityId] ?? 'по городу';
}

export const HOUSING_CLASS_LABEL: Record<HousingClass, string> = {
  econom: 'Эконом',
  comfort: 'Комфорт',
  business: 'Бизнес',
  premium: 'Премиум',
};

export const WALL_MATERIAL_LABEL: Record<WallMaterial, string> = {
  monolith: 'Монолит',
  monolith_brick: 'Монолит и кирпич',
  brick: 'Кирпич',
  panel: 'Панель',
  gasblock: 'Газоблок',
  frame: 'Каркас',
};

export const FINISHING_LABEL: Record<Finishing, string> = {
  rough: 'Черновая',
  whitebox: 'Предчистовая',
  finished: 'Чистовая',
};

export const SAFETY_LABEL: Record<SafetyStatus, string> = {
  kzhk_guarantee: 'Гарантия КЖК',
  akimat_permit: 'Разрешение акимата',
  bank: 'Участие банка',
  completed: 'Дом сдан',
  unknown: 'Не проверено',
};

/** Что статус значит для денег дольщика — простыми словами. */
export const SAFETY_EXPLANATION: Record<SafetyStatus, string> = {
  kzhk_guarantee:
    'Деньги дольщиков гарантирует Казахстанская жилищная компания: если застройщик не достроит, дом завершат или вернут деньги.',
  akimat_permit:
    'Акимат разрешил продажу на этапе стройки. Застройщик строит на свои средства, отдельного гаранта по деньгам дольщиков нет.',
  bank: 'Стройку финансирует и контролирует банк второго уровня.',
  completed: 'Дом введён в эксплуатацию, квартиру покупают по обычному договору купли-продажи.',
  unknown:
    'Мы не смогли однозначно подтвердить статус по сводке реестра. Перед покупкой проверьте объект в eGov Mobile: Жилищный портал, раздел «Объекты долевого строительства».',
};
