/**
 * Рисует исходники иконки и заставки для `capacitor-assets generate`:
 * два контура квартир разной площади на одной линии — знак «единого масштаба».
 */
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { rootDir } from '../import/curated.ts';

const out = resolve(rootDir, 'assets');
mkdirSync(out, { recursive: true });

const PAPER = '#F1F3F0';
const PAPER_DARK = '#1C2023';

/** Знак в квадрате 0..100; strokeWidth в тех же единицах. */
function mark(ink: string, accent: string) {
  return `
    <rect x="14" y="41" width="27" height="31" fill="none" stroke="${ink}" stroke-width="5"/>
    <rect x="52" y="18" width="34" height="54" fill="none" stroke="${accent}" stroke-width="5"/>
    <path d="M8 81.5h84" stroke="${ink}" stroke-width="5"/>`;
}

function svg(size: number, background: string | null, markSize: number, ink: string, accent: string) {
  const offset = (size - markSize) / 2;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    ${background ? `<rect width="${size}" height="${size}" fill="${background}"/>` : ''}
    <g transform="translate(${offset} ${offset}) scale(${markSize / 100})">${mark(ink, accent)}</g>
  </svg>`);
}

const jobs: [string, Buffer][] = [
  ['icon-only.png', svg(1024, PAPER, 700, '#23282C', '#0B706F')],
  // Адаптивная иконка Android: знак в безопасной зоне (~66%), фон отдельно.
  ['icon-foreground.png', svg(1024, null, 560, '#23282C', '#0B706F')],
  ['icon-background.png', svg(1024, PAPER, 0, PAPER, PAPER)],
  ['splash.png', svg(2732, PAPER, 520, '#23282C', '#0B706F')],
  ['splash-dark.png', svg(2732, PAPER_DARK, 520, '#E4E8E5', '#4FB3AE')],
];

for (const [name, data] of jobs) {
  await sharp(data).png().toFile(resolve(out, name));
  console.log(`assets/${name}`);
}
