// content/moto/tracks/<ліга>/<nn>-<slug>.json → public/moto/tracks/dril.mrg
// (пак для гри) + public/moto/tracks/dril.json (індекс українських назв).
//   node scripts/build-moto-tracks.mjs          — перевірити й записати
//   node scripts/build-moto-tracks.mjs --check  — лише перевірити, зокрема що
//                                                 public/moto/tracks актуальний
// --check іде в prebuild: npm run build (і Vercel) падає на зламаному треку
// або на забутому перезборі пака — «падіння скрипта = червона збірка» (спека).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { encodeMrg } from './lib/moto-mrg.mjs';
import { collectTracks, verifyRoundTrip } from './lib/moto-tracks.mjs';

const SITE_ROOT = fileURLToPath(new URL('..', import.meta.url));
const CONTENT_DIR = join(SITE_ROOT, 'content/moto/tracks');
const OUT_DIR = join(SITE_ROOT, 'public/moto/tracks');
const MRG_PATH = join(OUT_DIR, 'dril.mrg');
const INDEX_PATH = join(OUT_DIR, 'dril.json');
const checkOnly = process.argv.includes('--check');

const fail = (lines) => {
  for (const line of lines) console.error('✗', line);
  process.exit(1);
};

const { pack, index, errors } = collectTracks(CONTENT_DIR);
if (errors.length) fail(errors);
const mrg = encodeMrg(pack);
const roundTrip = verifyRoundTrip(pack, mrg);
if (roundTrip) fail([roundTrip]);
const indexJson = `${JSON.stringify(index, null, 2)}\n`;

if (checkOnly) {
  const stale = [];
  if (!existsSync(MRG_PATH) || !readFileSync(MRG_PATH).equals(mrg)) stale.push('dril.mrg');
  if (!existsSync(INDEX_PATH) || readFileSync(INDEX_PATH, 'utf8') !== indexJson) stale.push('dril.json');
  if (stale.length) {
    fail(
      stale.map((file) => `public/moto/tracks/${file} застарів — запусти node scripts/build-moto-tracks.mjs`)
    );
  }
} else {
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(MRG_PATH, mrg);
  writeFileSync(INDEX_PATH, indexJson);
}

pack.leagues.forEach((league, l) => {
  const names = index.filter((entry) => entry.league === l).map((entry) => entry.name);
  console.log(`ok - ліга ${l + 1}, треків ${league.length}: ${names.join(', ')}`);
});
console.log(`ok - ${checkOnly ? 'перевірено' : 'записано'}: dril.mrg ${mrg.length} Б, round-trip збігся`);
