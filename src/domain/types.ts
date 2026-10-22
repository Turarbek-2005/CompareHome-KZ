import type { Enums } from '../data/database.types';

export type HousingClass = Enums<'housing_class'>;
export type WallMaterial = Enums<'wall_material'>;
export type SafetyStatus = Enums<'safety_status'>;
export type Finishing = Enums<'finishing_type'>;
export type ComplexStatus = Enums<'complex_status'>;
export type MediaKind = Enums<'media_kind'>;

/** Изображение с сайта застройщика: показываем по ссылке и всегда с источником. */
export interface Media {
  id: string;
  complexId: string | null;
  apartmentId: string | null;
  kind: MediaKind;
  url: string;
  /** Уменьшенная версия, если застройщик её отдаёт. */
  thumbUrl: string | null;
  caption: string | null;
  credit: string;
  sourceUrl: string;
  collectedAt: string;
  sort: number;
}

export interface Completion {
  year: number;
  quarter: number | null;
}

export interface City {
  id: string;
  name: string;
  lat: number;
  lng: number;
  sort: number;
}

export interface Developer {
  id: string;
  name: string;
  bin: string | null;
  foundedYear: number | null;
  website: string | null;
  phone: string | null;
  description: string | null;
  completedCount: number | null;
  sourceUrl: string | null;
  verifiedAt: string | null;
}

export interface Installment {
  downPaymentPct: number;
  note: string;
}

export interface Complex {
  id: string;
  developerId: string;
  developerName: string;
  cityId: string;
  name: string;
  district: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  housingClass: HousingClass | null;
  wallMaterial: WallMaterial | null;
  floorsMin: number | null;
  floorsMax: number | null;
  ceilingHeight: number | null;
  completion: Completion | null;
  status: ComplexStatus;
  safety: SafetyStatus;
  safetyNote: string | null;
  registryUrl: string | null;
  parking: string | null;
  amenities: string[];
  installment: Installment | null;
  salesUrl: string | null;
  sourceUrl: string | null;
  collectedAt: string | null;
  isDemo: boolean;
}

export interface Apartment {
  id: string;
  complexId: string;
  unitNo: string | null;
  rooms: number;
  area: number;
  kitchenArea: number | null;
  livingArea: number | null;
  floor: number | null;
  floorsTotal: number | null;
  price: number;
  pricePerM2: number;
  finishing: Finishing | null;
  ceilingHeight: number | null;
  sourceUrl: string | null;
  collectedAt: string | null;
  isDemo: boolean;
  complexName: string;
  cityId: string;
  district: string | null;
  housingClass: HousingClass | null;
  wallMaterial: WallMaterial | null;
  completion: Completion | null;
  complexStatus: ComplexStatus;
  safety: SafetyStatus;
  lat: number | null;
  lng: number | null;
  developerId: string;
  developerName: string;
}

/** completed — сданное жильё; construction_kzhk — строящееся с гарантией КЖК; construction_any — любое строящееся. */
export type HousingType = 'completed' | 'construction_kzhk' | 'construction_any';

export interface MortgageProgram {
  id: string;
  bank: string;
  name: string;
  rate: number;
  rateNote: string | null;
  minDownPaymentPct: number;
  reducedDownPaymentPct: number | null;
  reducedDownPaymentNote: string | null;
  maxTermYears: number;
  maxAmountMajor: number | null;
  maxAmountOther: number | null;
  housingTypes: HousingType[];
  note: string | null;
  sourceUrl: string;
  verifiedAt: string;
}

export interface Benchmark {
  cityId: string;
  period: string;
  pricePerM2: number;
  sourceUrl: string;
}

export interface DataSource {
  id: string;
  title: string;
  publisher: string;
  url: string;
  license: string | null;
  usedFor: string;
  retrievedAt: string;
  note: string | null;
}
