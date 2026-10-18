import type { Tables } from './database.types';
import type {
  Apartment,
  Benchmark,
  City,
  Complex,
  Completion,
  DataSource,
  Developer,
  HousingType,
  Installment,
  MortgageProgram,
} from '../domain/types';

function completion(year: number | null, quarter: number | null): Completion | null {
  return year ? { year, quarter } : null;
}

function required<T>(value: T | null, field: string): T {
  if (value == null) throw new Error(`apartment_cards: пустое поле ${field}`);
  return value;
}

export function toApartment(r: Tables<'apartment_cards'>): Apartment {
  const area = Number(required(r.area, 'area'));
  const price = required(r.price, 'price');
  return {
    id: required(r.id, 'id'),
    complexId: required(r.complex_id, 'complex_id'),
    unitNo: r.unit_no,
    rooms: required(r.rooms, 'rooms'),
    area,
    kitchenArea: r.kitchen_area == null ? null : Number(r.kitchen_area),
    livingArea: r.living_area == null ? null : Number(r.living_area),
    floor: r.floor,
    floorsTotal: r.floors_total,
    price,
    pricePerM2: r.price_per_m2 ?? Math.round(price / area),
    finishing: r.finishing,
    ceilingHeight: r.ceiling_height == null ? null : Number(r.ceiling_height),
    sourceUrl: r.source_url,
    collectedAt: r.collected_at,
    isDemo: r.is_demo ?? false,
    complexName: required(r.complex_name, 'complex_name'),
    cityId: required(r.city_id, 'city_id'),
    district: r.district,
    housingClass: r.housing_class,
    wallMaterial: r.wall_material,
    completion: completion(r.completion_year, r.completion_quarter),
    complexStatus: r.complex_status ?? 'construction',
    safety: r.safety ?? 'unknown',
    lat: r.lat,
    lng: r.lng,
    developerId: required(r.developer_id, 'developer_id'),
    developerName: required(r.developer_name, 'developer_name'),
  };
}

function installment(json: unknown): Installment | null {
  if (!json || typeof json !== 'object') return null;
  const o = json as { down_payment_pct?: unknown; note?: unknown };
  if (typeof o.down_payment_pct !== 'number') return null;
  return { downPaymentPct: o.down_payment_pct, note: typeof o.note === 'string' ? o.note : '' };
}

export function toComplex(r: Tables<'complexes'> & { developers: { name: string } | null }): Complex {
  return {
    id: r.id,
    developerId: r.developer_id,
    developerName: r.developers?.name ?? '',
    cityId: r.city_id,
    name: r.name,
    district: r.district,
    address: r.address,
    lat: r.lat,
    lng: r.lng,
    housingClass: r.housing_class,
    wallMaterial: r.wall_material,
    floorsMin: r.floors_min,
    floorsMax: r.floors_max,
    ceilingHeight: r.ceiling_height == null ? null : Number(r.ceiling_height),
    completion: completion(r.completion_year, r.completion_quarter),
    status: r.status,
    safety: r.safety,
    safetyNote: r.safety_note,
    registryUrl: r.registry_url,
    parking: r.parking,
    amenities: r.amenities,
    installment: installment(r.installment),
    salesUrl: r.sales_url,
    sourceUrl: r.source_url,
    collectedAt: r.collected_at,
    isDemo: r.is_demo,
  };
}

export function toDeveloper(r: Tables<'developers'>): Developer {
  return {
    id: r.id,
    name: r.name,
    bin: r.bin,
    foundedYear: r.founded_year,
    website: r.website,
    phone: r.phone,
    description: r.description,
    completedCount: r.completed_count,
    sourceUrl: r.source_url,
    verifiedAt: r.verified_at,
  };
}

const HOUSING_TYPES: HousingType[] = ['completed', 'construction_kzhk', 'construction_any'];

export function toMortgageProgram(r: Tables<'mortgage_programs'>): MortgageProgram {
  return {
    id: r.id,
    bank: r.bank,
    name: r.name,
    rate: Number(r.rate),
    rateNote: r.rate_note,
    minDownPaymentPct: Number(r.min_down_payment_pct),
    reducedDownPaymentPct: r.reduced_down_payment_pct == null ? null : Number(r.reduced_down_payment_pct),
    reducedDownPaymentNote: r.reduced_down_payment_note,
    maxTermYears: r.max_term_years,
    maxAmountMajor: r.max_amount_major,
    maxAmountOther: r.max_amount_other,
    housingTypes: r.housing_types.filter((t): t is HousingType => HOUSING_TYPES.includes(t as HousingType)),
    note: r.note,
    sourceUrl: r.source_url,
    verifiedAt: r.verified_at,
  };
}

export function toCity(r: Tables<'cities'>): City {
  return { id: r.id, name: r.name, lat: r.lat, lng: r.lng, sort: r.sort };
}

export function toBenchmark(r: Tables<'city_price_benchmarks'>): Benchmark {
  return { cityId: r.city_id, period: r.period, pricePerM2: r.price_per_m2, sourceUrl: r.source_url };
}

export function toDataSource(r: Tables<'data_sources'>): DataSource {
  return {
    id: r.id,
    title: r.title,
    publisher: r.publisher,
    url: r.url,
    license: r.license,
    usedFor: r.used_for,
    retrievedAt: r.retrieved_at,
    note: r.note,
  };
}
