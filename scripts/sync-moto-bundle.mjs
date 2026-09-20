// Кладе зібраний бандл гри (dist форку drill-moto) у public/moto/.
//   node scripts/sync-moto-bundle.mjs --from ../drill-moto/dist   — локальна збірка форку
//   node scripts/sync-moto-bundle.mjs --tag v0.1.0                — реліз з GitHub (dist.zip)
// Спершу перевіряє джерело (index.html, LICENSE.txt, NOTICE.txt, відносні шляхи,
// жодного сліду Codebrew і назви upstream, ≤ 300 КБ gzip) і лише тоді замінює public/moto/,
// не чіпаючи public/moto/tracks/ — треки сайту збирає build-moto-tracks.mjs.
// Пише public/moto/VERSION: тег релізу або мітку локальної збірки.
import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BUNDLE_BUDGET_GZIP,
  REQUIRED_FILES,
  checkRelativeBase,
  checkUpstreamName,
  findCodebrewTraces,
  gzipTotal,
  listFiles,
  resolveBundleRoot,
} from './lib/moto-bundle.mjs';

const REPO = 'ZhekaGrem/drill-moto';
const TAG_RE = /^v\d+\.\d+\.\d+$/;
const SITE_ROOT = fileURLToPath(new URL('..', import.meta.url));
const TARGET = join(SITE_ROOT, 'public/moto');
const KEEP = 'tracks'; // public/moto/tracks — треки сайту, бандл їх не приносить

// Помилка з рядками для людини; ловиться внизу, щоб finally прибрав тимчасову теку.
const fail = (lines) => {
  throw Object.assign(new Error('sync-moto-bundle'), { lines: [lines].flat() });
};

const argValue = (flag) => {
  const i = process.argv.indexOf(flag);
  return i === -1 ? null : (process.argv[i + 1] ?? '');
};

// Мітка локальної збірки: git describe форку (тег, коміти після нього, хеш, -dirty).
const localLabel = (from) => {
  const git = spawnSync('git', ['-C', from, 'describe', '--tags', '--always', '--dirty'], {
    encoding: 'utf8',
  });
  return `local+${git.status === 0 ? git.stdout.trim() : 'nogit'}`;
};

// Реліз: репозиторій публічний, тож досить curl (gh на цій машині нема; curl
// іде через системний проксі, якщо він є). -f: HTTP 404 → ненульовий код.
const downloadRelease = (tag, workDir) => {
  const url = `https://github.com/${REPO}/releases/download/${tag}/dist.zip`;
  const zipPath = join(workDir, 'dist.zip');
  const curl = spawnSync('curl', ['-fsSL', '-o', zipPath, url], { stdio: 'inherit' });
  if (curl.status !== 0) fail(`не вдалося завантажити ${url} (curl, код ${curl.status})`);
  const unzip = spawnSync('unzip', ['-q', zipPath, '-d', join(workDir, 'unzipped')], { stdio: 'inherit' });
  if (unzip.status !== 0) fail('unzip не зміг розпакувати dist.zip');
  return join(workDir, 'unzipped');
};

const verifySource = (root) => {
  const files = listFiles(root).filter((file) => !file.startsWith(`${KEEP}/`));
  const missing = REQUIRED_FILES.filter((file) => !files.includes(file));
  if (missing.length) fail(`у бандлі нема: ${missing.join(', ')}`);
  const problems = findCodebrewTraces(root, files);
  const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');
  for (const problem of [checkRelativeBase(indexHtml), checkUpstreamName(indexHtml)]) {
    if (problem) problems.push(problem);
  }
  if (problems.length) fail(problems);
  const gzip = gzipTotal(root, files);
  const kb = (gzip / 1024).toFixed(1);
  if (gzip > BUNDLE_BUDGET_GZIP) {
    fail(`бандл ${kb} КБ gzip — понад бюджет спеки ${BUNDLE_BUDGET_GZIP / 1024} КБ`);
  }
  return { files, kb };
};

const replaceTarget = (root, files, label) => {
  mkdirSync(TARGET, { recursive: true });
  for (const entry of readdirSync(TARGET)) {
    if (entry !== KEEP) rmSync(join(TARGET, entry), { recursive: true, force: true });
  }
  for (const file of files) {
    mkdirSync(dirname(join(TARGET, file)), { recursive: true });
    copyFileSync(join(root, file), join(TARGET, file));
  }
  writeFileSync(join(TARGET, 'VERSION'), `${label}\n`);
};

const from = argValue('--from');
const tag = argValue('--tag');
const workDir = mkdtempSync(join(tmpdir(), 'moto-bundle-'));
try {
  if ((from === null) === (tag === null)) fail('вкажи рівно одне: --from <тека dist> або --tag vX.Y.Z');
  if (tag !== null && !TAG_RE.test(tag)) fail(`тег «${tag}» не схожий на vX.Y.Z`);
  const source = from !== null ? resolve(from) : downloadRelease(tag, workDir);
  const root = resolveBundleRoot(source);
  if (!root) fail(`${source}: нема зібраного бандлу (index.html без package.json) ні тут, ні в dist/`);
  const { files, kb } = verifySource(root);
  const label = from !== null ? localLabel(source) : tag;
  replaceTarget(root, files, label);
  console.log(`ok - public/moto/: ${files.length} файлів, ${kb} КБ gzip, VERSION ${label}`);
  if (listFiles(root).some((file) => file.startsWith(`${KEEP}/`))) {
    console.log(`note - теку ${KEEP}/ з бандлу пропущено: треки сайту — node scripts/build-moto-tracks.mjs`);
  }
  if (!existsSync(join(TARGET, KEEP, 'dril.mrg'))) {
    console.log('note - public/moto/tracks/dril.mrg ще нема: node scripts/build-moto-tracks.mjs');
  }
} catch (error) {
  if (!error.lines) throw error;
  for (const line of error.lines) console.error('✗', line);
  process.exitCode = 1;
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
