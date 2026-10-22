import { useQuery } from '@tanstack/react-query';
import { supabase } from './supabase';
import {
  toApartment,
  toBenchmark,
  toCity,
  toComplex,
  toDataSource,
  toDeveloper,
  toMedia,
  toMortgageProgram,
} from './mappers';
import { coversByComplex } from '../domain/media';
import type { Benchmark, Media } from '../domain/types';

function check<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}

export function useCities() {
  return useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const rows = check(
        await supabase.from('cities').select('*, complexes(count)').order('sort').order('name'),
      );
      return rows.map((r) => ({
        ...toCity(r),
        complexCount: (r.complexes as unknown as { count: number }[])[0]?.count ?? 0,
      }));
    },
  });
}

export function useCityApartments(cityId: string) {
  return useQuery({
    queryKey: ['apartments', 'city', cityId],
    queryFn: async () =>
      check(await supabase.from('apartment_cards').select('*').eq('city_id', cityId).order('price')).map(
        toApartment,
      ),
  });
}

export function useApartmentsByIds(ids: string[]) {
  const sorted = [...ids].sort();
  return useQuery({
    queryKey: ['apartments', 'ids', sorted],
    enabled: ids.length > 0,
    queryFn: async () => {
      const rows = check(await supabase.from('apartment_cards').select('*').in('id', sorted)).map(toApartment);
      // Сохраняем порядок, в котором пользователь добавлял квартиры.
      return ids.map((id) => rows.find((a) => a.id === id)).filter((a) => a !== undefined);
    },
  });
}

export function useApartment(id: string) {
  return useQuery({
    queryKey: ['apartment', id],
    enabled: id !== '',
    queryFn: async () => toApartment(check(await supabase.from('apartment_cards').select('*').eq('id', id).single())),
  });
}

export function useComplexApartments(complexId: string) {
  return useQuery({
    queryKey: ['apartments', 'complex', complexId],
    queryFn: async () =>
      check(
        await supabase.from('apartment_cards').select('*').eq('complex_id', complexId).order('rooms').order('price'),
      ).map(toApartment),
  });
}

export function useComplexes(cityId?: string) {
  return useQuery({
    queryKey: ['complexes', cityId ?? 'all'],
    queryFn: async () => {
      let q = supabase.from('complexes').select('*, developers(name)').order('name');
      if (cityId) q = q.eq('city_id', cityId);
      return check(await q).map(toComplex);
    },
  });
}

export function useComplex(id: string) {
  return useQuery({
    queryKey: ['complex', id],
    queryFn: async () =>
      toComplex(check(await supabase.from('complexes').select('*, developers(name)').eq('id', id).single())),
  });
}

export function useDevelopers() {
  return useQuery({
    queryKey: ['developers'],
    queryFn: async () => {
      const rows = check(await supabase.from('developers').select('*, complexes(id, city_id)').order('name'));
      return rows.map((r) => ({
        ...toDeveloper(r),
        complexCount: r.complexes.length,
        cityIds: [...new Set(r.complexes.map((c) => c.city_id))],
      }));
    },
  });
}

export function useDeveloper(id: string) {
  return useQuery({
    queryKey: ['developer', id],
    queryFn: async () => toDeveloper(check(await supabase.from('developers').select('*').eq('id', id).single())),
  });
}

export function useDeveloperComplexes(developerId: string) {
  return useQuery({
    queryKey: ['complexes', 'developer', developerId],
    queryFn: async () =>
      check(
        await supabase.from('complexes').select('*, developers(name)').eq('developer_id', developerId).order('name'),
      ).map(toComplex),
  });
}

export function useMortgagePrograms() {
  return useQuery({
    queryKey: ['mortgage_programs'],
    queryFn: async () =>
      check(await supabase.from('mortgage_programs').select('*').order('sort')).map(toMortgageProgram),
  });
}

/**
 * Последние по периоду средние цены БНС, по городу.
 * Обычный объект, а не Map: кэш запросов сохраняется на устройстве в JSON.
 */
export function useBenchmarks() {
  return useQuery({
    queryKey: ['benchmarks'],
    queryFn: async () => {
      const rows = check(await supabase.from('city_price_benchmarks').select('*').order('period')).map(toBenchmark);
      const byCity: Record<string, Benchmark> = {};
      for (const b of rows) byCity[b.cityId] = b;
      return byCity;
    },
  });
}

/** Фото и интерьеры ЖК в порядке, заданном при сборе. */
export function useComplexMedia(complexId: string) {
  return useQuery({
    queryKey: ['media', 'complex', complexId],
    enabled: complexId !== '',
    queryFn: async () =>
      check(await supabase.from('media').select('*').eq('complex_id', complexId).order('sort')).map(toMedia),
  });
}

export function useApartmentPlan(apartmentId: string) {
  return useQuery({
    queryKey: ['media', 'plan', apartmentId],
    enabled: apartmentId !== '',
    queryFn: async () => {
      const row = check(
        await supabase.from('media').select('*').eq('apartment_id', apartmentId).eq('kind', 'plan').maybeSingle(),
      );
      return row ? toMedia(row) : null;
    },
  });
}

/** Планировки нескольких квартир — для сравнения. Объект, а не Map: кэш сохраняется в JSON. */
export function usePlans(apartmentIds: string[], enabled = true) {
  const sorted = [...apartmentIds].sort();
  return useQuery({
    queryKey: ['media', 'plans', sorted],
    enabled: enabled && sorted.length > 0,
    queryFn: async () => {
      const rows = check(await supabase.from('media').select('*').in('apartment_id', sorted).eq('kind', 'plan'));
      const out: Record<string, Media> = {};
      for (const m of rows.map(toMedia)) if (m.apartmentId) out[m.apartmentId] = m;
      return out;
    },
  });
}

/** Обложки всех ЖК одним запросом — для списка ЖК и карты. */
export function useCovers() {
  return useQuery({
    queryKey: ['media', 'covers'],
    queryFn: async () =>
      coversByComplex(check(await supabase.from('media').select('*').eq('kind', 'exterior').order('sort')).map(toMedia)),
  });
}

export function useDataSources() {
  return useQuery({
    queryKey: ['data_sources'],
    queryFn: async () => check(await supabase.from('data_sources').select('*').order('sort')).map(toDataSource),
  });
}
