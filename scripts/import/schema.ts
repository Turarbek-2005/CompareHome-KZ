import { z } from 'zod';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'ожидается дата YYYY-MM-DD');
const url = z.url();

export const housingClass = z.enum(['econom', 'comfort', 'business', 'premium']);
export const wallMaterial = z.enum(['monolith', 'monolith_brick', 'brick', 'panel', 'gasblock', 'frame']);
export const complexStatus = z.enum(['planned', 'construction', 'completed']);
export const safetyStatus = z.enum(['kzhk_guarantee', 'akimat_permit', 'bank', 'completed', 'unknown']);
export const finishing = z.enum(['rough', 'whitebox', 'finished']);

export const citySchema = z.object({
  id: z.string().regex(/^[a-z-]+$/),
  name: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  sort: z.number().int(),
});

export const developerSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  bin: z.string().regex(/^\d{12}$/).nullable(),
  founded_year: z.number().int().nullable(),
  website: url.nullable(),
  phone: z.string().nullable(),
  description: z.string().nullable(),
  completed_count: z.number().int().nullable(),
  source_url: url.nullable(),
  verified_at: isoDate.nullable(),
});

export const complexSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  developer_id: z.string(),
  city_id: z.string(),
  name: z.string().min(1),
  district: z.string().nullable(),
  address: z.string().nullable(),
  geocode_query: z.string().nullable(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  housing_class: housingClass.nullable(),
  wall_material: wallMaterial.nullable(),
  floors_min: z.number().int().nullable(),
  floors_max: z.number().int().nullable(),
  ceiling_height: z.number().nullable(),
  completion_year: z.number().int().nullable(),
  completion_quarter: z.number().int().min(1).max(4).nullable(),
  status: complexStatus,
  safety: safetyStatus,
  safety_note: z.string().nullable(),
  registry_url: url.nullable(),
  parking: z.string().nullable(),
  amenities: z.array(z.string()),
  installment: z
    .object({ down_payment_pct: z.number(), note: z.string() })
    .nullable()
    .optional(),
  sales_url: url.nullable(),
  source_url: url.nullable(),
  collected_at: isoDate.nullable(),
});

const unitSchema = z
  .object({
    unit_no: z.string(),
    rooms: z.number().int().min(0).max(6),
    area: z.number().positive(),
    price: z.number().int().positive().optional(),
    price_per_m2: z.number().int().positive().optional(),
    floor: z.number().int(),
    floors_total: z.number().int().optional(),
    kitchen_area: z.number().positive().optional(),
    finishing: finishing.optional(),
  })
  .refine((u) => u.price !== undefined || u.price_per_m2 !== undefined, {
    message: 'нужна цена или цена за м²',
  });

export const apartmentsFileSchema = z.object({
  collected_at: isoDate,
  groups: z.array(
    z.object({
      complex_id: z.string(),
      source_url: url,
      finishing: finishing.nullable(),
      floors_total: z.number().int().optional(),
      price_from_ppm2: z.boolean().optional(),
      units: z.array(unitSchema).min(1),
    }),
  ),
});

export const mortgageProgramSchema = z.object({
  id: z.string(),
  bank: z.string(),
  name: z.string(),
  rate: z.number().positive(),
  rate_note: z.string().nullable(),
  min_down_payment_pct: z.number().min(0).max(100),
  reduced_down_payment_pct: z.number().min(0).max(100).nullable(),
  reduced_down_payment_note: z.string().nullable(),
  max_term_years: z.number().int().positive(),
  max_amount_major: z.number().int().nullable(),
  max_amount_other: z.number().int().nullable(),
  housing_types: z.array(z.enum(['completed', 'construction_kzhk', 'construction_any'])),
  note: z.string().nullable(),
  source_url: url,
  verified_at: isoDate,
  sort: z.number().int(),
});

export const benchmarksFileSchema = z.object({
  period: z.string(),
  source_url: url,
  note: z.string(),
  prices: z.record(z.string(), z.number().int().positive()),
});

export const dataSourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  publisher: z.string(),
  url,
  license: z.string().nullable(),
  used_for: z.string(),
  retrieved_at: isoDate,
  note: z.string().nullable(),
  sort: z.number().int(),
});

export type Complex = z.infer<typeof complexSchema>;
