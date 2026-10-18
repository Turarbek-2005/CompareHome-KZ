import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import {
  apartmentsFileSchema,
  benchmarksFileSchema,
  citySchema,
  complexSchema,
  dataSourceSchema,
  developerSchema,
  mortgageProgramSchema,
} from './schema.ts';

export const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const curatedDir = resolve(rootDir, 'data/curated');

function readJson(name: string): unknown {
  return JSON.parse(readFileSync(resolve(curatedDir, name), 'utf8'));
}

export function writeJson(name: string, value: unknown) {
  writeFileSync(resolve(curatedDir, name), JSON.stringify(value, null, 2) + '\n', 'utf8');
}

function parse<T extends z.ZodType>(name: string, schema: T): z.infer<T> {
  const result = schema.safeParse(readJson(name));
  if (!result.success) {
    throw new Error(`${name}: ${z.prettifyError(result.error)}`);
  }
  return result.data;
}

export function loadCurated() {
  const cities = parse('cities.json', z.array(citySchema));
  const developers = parse('developers.json', z.array(developerSchema));
  const complexes = parse('complexes.json', z.array(complexSchema));
  const apartments = parse('apartments.json', apartmentsFileSchema);
  const mortgagePrograms = parse('mortgage_programs.json', z.array(mortgageProgramSchema));
  const benchmarks = parse('benchmarks.json', benchmarksFileSchema);
  const dataSources = parse('data_sources.json', z.array(dataSourceSchema));

  // Ссылочная целостность — ошибки здесь понятнее, чем отказ внешнего ключа в БД.
  const cityIds = new Set(cities.map((c) => c.id));
  const developerIds = new Set(developers.map((d) => d.id));
  const complexIds = new Set(complexes.map((c) => c.id));
  for (const c of complexes) {
    if (!developerIds.has(c.developer_id)) throw new Error(`${c.id}: нет застройщика ${c.developer_id}`);
    if (!cityIds.has(c.city_id)) throw new Error(`${c.id}: нет города ${c.city_id}`);
  }
  for (const g of apartments.groups) {
    if (!complexIds.has(g.complex_id)) throw new Error(`apartments: нет ЖК ${g.complex_id}`);
  }
  for (const cityId of Object.keys(benchmarks.prices)) {
    if (!cityIds.has(cityId)) throw new Error(`benchmarks: нет города ${cityId}`);
  }

  return { cities, developers, complexes, apartments, mortgagePrograms, benchmarks, dataSources };
}
