// Перевірки зібраного бандлу гри (dist форку drill-moto) до того, як він
// ляже в public/moto/: де корінь бандлу, чи нема в ньому слідів Codebrew,
// чи шляхи відносні (бандл живе під /moto/), скільки він важить стисненим.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

// SHA-256 оригінальних асетів Codebrew з upstream gravity-defied-web
// (коміт 889a0914da5fd40405190907e493fc6be72c38a2: src/assets і preview.gif — запис
// гри з оригінальними спрайтами й треками). Лише відбитки: самих файлів у
// репозиторії сайту нема й не буде.
export const CODEBREW_SHA256 = new Map([
  ['1250a577720868a9b795f89cb9826374b3aaac08e7901fbbe91404387c1d9cb6', 'bluearm.png'],
  ['c63d471c53af5a7a32a7bdcbb051306344dc987ec072dd7bf8041133825b60ff', 'bluebody.png'],
  ['0a21cb9f85fd101ddba5c3e3a5476e5a161e04af49efa0bbf867e5705764fc08', 'blueleg.png'],
  ['7665d79bc4143adf89c332d35567c55954c7241a7973cba77439692b70935cdf', 'engine.png'],
  ['f227cf0a52ec24313aa03d3080a55b72f67accff9d3b0fedbe0b63988412051f', 'fender.png'],
  ['44164ed4419a60881e0da8ef44d78fb97026f47885b3834ef1502c5694c82033', 'helmet.png'],
  ['d8eb402f0bcfc4c09610104c300bd72a8c3b685d372d9328d0734807cae8e0cd', 'levels.mrg'],
  ['2f90907e721f69b8a513c03ee2f743822ea58603c3bff05a6d4c69fb0db567de', 'logo.png'],
  ['9bc88e36c19a26be0bccbab9429b7e5b8be97528a01d4a07a46085fc32525f1c', 'raster.png'],
  ['6d0aa2de1c13b7b8bda7d7ed78fb21149fecbbca69cf3c89a6c022a1d2c9fcb5', 'splash.png'],
  ['8308600334460e64d204693aaa45033060115f1d863dda1b648217bad73200cf', 'sprites.png'],
  ['5759c1f241aef74e6f818f3148951d66a6a528b33db9b3780da83f7fe8d12942', 'preview.gif'],
]);

/** Бюджет спеки: бандл разом зі шрифтами ≤ 300 КБ стисненим. */
export const BUNDLE_BUDGET_GZIP = 300 * 1024;
/** Файли, без яких бандл не приймається: сторінка гри і текст GPL + походження. */
export const REQUIRED_FILES = ['index.html', 'LICENSE.txt', 'NOTICE.txt'];

// Код бандла, у якому шукаємо рядок levels.mrg і data:-URI. *.txt — ні: NOTICE.txt
// законно розповідає, що оригінальний levels.mrg із форку видалено.
const CODE_FILE_RE = /\.(?:html|js|mjs|css|json|svg)$/;
const DATA_URI_RE = /data:[\w.+-]+\/[\w.+-]+;base64,([A-Za-z0-9+/=]+)/g;
const PACK_NAME_RE = /(?:^|\/)levels(?:[-.][\w-]*)?\.mrg$/i;
const NOT_COUNTED_RE = /\.(?:map|txt)$/;

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

// Зібраний бандл: є index.html і нема package.json. Корінь репозиторію форку
// теж має index.html (вхідна точка Vite), тож без другої умови скрипт узяв би
// сирці разом із node_modules.
const isBuiltBundle = (dir) => existsSync(join(dir, 'index.html')) && !existsSync(join(dir, 'package.json'));

/** Корінь бандлу: сама тека (архів релізу — вміст dist/ у корені) або її dist/ (корінь форку чи архів із текою dist/). */
export const resolveBundleRoot = (dir) => {
  if (isBuiltBundle(dir)) return dir;
  if (isBuiltBundle(join(dir, 'dist'))) return join(dir, 'dist');
  return null;
};

/** Усі файли теки рекурсивно, шляхи через «/», відсортовано; dot-файли пропускаються. */
export const listFiles = (dir, prefix = '') =>
  readdirSync(join(dir, prefix), { withFileTypes: true })
    .filter((entry) => !entry.name.startsWith('.'))
    .flatMap((entry) => {
      const path = prefix ? `${prefix}/${entry.name}` : entry.name;
      return entry.isDirectory() ? listFiles(dir, path) : [path];
    })
    .sort();

/** Сліди Codebrew: файл або вбудований data:-URI з відомим хешем, пак levels*.mrg, рядок levels.mrg. */
export const findCodebrewTraces = (dir, files, forbidden = CODEBREW_SHA256) => {
  const problems = [];
  for (const file of files) {
    const buf = readFileSync(join(dir, file));
    const known = forbidden.get(sha256(buf));
    if (known) problems.push(`${file}: це оригінальний ${known}`);
    if (PACK_NAME_RE.test(file)) problems.push(`${file}: імʼя оригінального пака треків`);
    if (!CODE_FILE_RE.test(file)) continue;
    const text = buf.toString('utf8');
    if (text.includes('levels.mrg')) problems.push(`${file}: згадка levels.mrg`);
    for (const [, base64] of text.matchAll(DATA_URI_RE)) {
      const inlined = forbidden.get(sha256(Buffer.from(base64, 'base64')));
      if (inlined) problems.push(`${file}: вбудований data:-URI — оригінальний ${inlined}`);
    }
  }
  return problems;
};

/** Проблема, якщо index.html посилається на абсолютні /assets/ (бандл зібрано без base: './'). */
export const checkRelativeBase = (indexHtml) =>
  /(?:src|href)="\/(?!\/)/.test(indexHtml)
    ? "index.html має абсолютні шляхи — у vite.config форку потрібен base: './'"
    : null;

/** Проблема, якщо index.html бандла досі несе назву upstream (title, description, keywords). */
export const checkUpstreamName = (indexHtml) =>
  /gravity[\s-]?defied/i.test(indexHtml)
    ? 'index.html згадує «Gravity Defied» — у метаданих гри лише «Дріл Мото» (спека, секція 6)'
    : null;

/** Сума gzip-розмірів файлів, які вантажить гра (без *.map і *.txt). */
export const gzipTotal = (dir, files) =>
  files
    .filter((file) => !NOT_COUNTED_RE.test(file))
    .reduce((sum, file) => sum + gzipSync(readFileSync(join(dir, file)), { level: 9 }).length, 0);
