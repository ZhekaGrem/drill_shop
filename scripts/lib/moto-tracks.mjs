// scripts/lib/moto-tracks.mjs
// Авторські треки сайту: content/moto/tracks/<ліга>/<nn>-<slug>.json → пак для
// кодека moto-mrg.mjs і індекс назв. Правила звірені з оригінальними треками
// порту (план B, «Факти про трек»):
//  • вісь Y дивиться ВГОРУ: більший y — вище на екрані (GameCanvas.addDy = -y + dy);
//  • координати цілі, x строго зростає — точку з x ≤ попереднього двигун мовчки викидає;
//  • старт на 16–20 одиниць вище землі під start.x — байк падає на колеса (в оригіналі 14,8–30, типово 15–20);
//  • обидва колеса на старті (start.x ± 14, на 8 нижче start.y) щонайменше за 7 від ламаної — ближче GamePhysics зациклюється (trackJson.ts форку);
//  • finish.y = 0, як в усіх оригінальних треках (двигун бере лише finish.x);
//  • до старту й після фінішу щонайменше 150 одиниць ламаної (в оригіналі 190–430);
//  • прапорець старту стоїть раніше за прапорець фінішу (правило LevelLoader);
//  • рівно три ліги, у кожній 3–10 треків.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { decodeMrg } from './moto-mrg.mjs';

export const LEAGUE_DIRS = ['1-lehka', '2-serednia', '3-vazhka'];
export const TRACKS_MIN = 3;
export const TRACKS_MAX = 10;
export const NAME_MAX = 20;
export const SLUG_MAX = 32;
export const START_LIFT_MIN = 16;
export const START_LIFT_MAX = 20;
export const FLAG_MARGIN = 150;
export const COORD_MAX = 32767;
export const WHEEL_DX = 14;
export const WHEEL_DROP = 8;
export const WHEEL_GAP_MIN = 7;
const FILE_RE = /^(\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\.json$/;
const TRACK_KEYS = ['name', 'start', 'finish', 'points'];

const isCoord = (v) => Number.isInteger(v) && Math.abs(v) <= COORD_MAX;
const isPair = (v) => Array.isArray(v) && v.length === 2 && isCoord(v[0]) && isCoord(v[1]);

/** Висота землі під x — лінійна інтерполяція між сусідніми точками ламаної. */
export const groundAt = (points, x) => {
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    if (x >= x0 && x <= x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
  }
  return NaN;
};

// Найкоротша відстань від точки (x, y) до ламаної — як distanceToGround у trackJson.ts форку
const distanceToGround = (points, x, y) => {
  let best = Infinity;
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const dx = points[i][0] - x0;
    const dy = points[i][1] - y0;
    const t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy)));
    best = Math.min(best, Math.hypot(x - x0 - t * dx, y - y0 - t * dy));
  }
  return best;
};

// Прапорці так, як їх ставить LevelLoader.prepareLevelGeometry
const flagPoints = (points, start, finish) => ({
  start: points.findIndex((p) => p[0] > start[0]) + 1,
  finish: points.findIndex((p) => p[0] > finish[0]),
});

const checkShape = ({ name, start, finish, points }) => {
  if (typeof name !== 'string' || name.trim() === '' || [...name.trim()].length > NAME_MAX) {
    throw new Error(`name: непорожній рядок до ${NAME_MAX} символів`);
  }
  if (!isPair(start) || !isPair(finish)) throw new Error(`start/finish: пара цілих у межах ±${COORD_MAX}`);
  if (!Array.isArray(points) || points.length < 2 || points.length > COORD_MAX || !points.every(isPair)) {
    throw new Error(`points: щонайменше дві пари цілих у межах ±${COORD_MAX}`);
  }
};

const checkGeometry = ({ start, finish, points }) => {
  for (let i = 1; i < points.length; i++) {
    const [prev, cur] = [points[i - 1][0], points[i][0]];
    if (cur <= prev) throw new Error(`points[${i}]: x має строго зростати (${prev} → ${cur})`);
  }
  if (start[0] >= finish[0]) throw new Error('start.x має бути менший за finish.x');
  if (start[0] - points[0][0] < FLAG_MARGIN) {
    throw new Error(`до старту менше ${FLAG_MARGIN} одиниць ламаної`);
  }
  if (points.at(-1)[0] - finish[0] < FLAG_MARGIN) {
    throw new Error(`після фінішу менше ${FLAG_MARGIN} одиниць ламаної`);
  }
  if (finish[1] !== 0) throw new Error('finish.y має бути 0');
  const lift = start[1] - groundAt(points, start[0]);
  if (lift < START_LIFT_MIN || lift > START_LIFT_MAX) {
    throw new Error(
      `старт на ${lift.toFixed(1)} над землею, треба ${START_LIFT_MIN}–${START_LIFT_MAX} (вісь Y дивиться вгору)`
    );
  }
  for (const dx of [-WHEEL_DX, WHEEL_DX]) {
    if (distanceToGround(points, start[0] + dx, start[1] - WHEEL_DROP) < WHEEL_GAP_MIN) {
      throw new Error(`колесо в x=${start[0] + dx} на старті вʼязне в землі — двигун зациклюється`);
    }
  }
  const flags = flagPoints(points, start, finish);
  if (flags.start >= flags.finish) throw new Error('між стартом і фінішем замало точок для прапорців');
};

/** JSON треку → { start, finish, points } (копії); кидає Error з першим порушенням. */
export const validateTrack = (json) => {
  if (!json || typeof json !== 'object' || Array.isArray(json)) throw new Error('очікується обʼєкт треку');
  const extra = Object.keys(json).filter((key) => !TRACK_KEYS.includes(key));
  if (extra.length) throw new Error(`зайві поля: ${extra.join(', ')}`);
  checkShape(json);
  checkGeometry(json);
  return {
    start: [...json.start],
    finish: [...json.finish],
    points: json.points.map((p) => [...p]),
  };
};

const listDir = (dir) => readdirSync(dir).filter((entry) => !entry.startsWith('.'));

const collectLeague = (root, league, slugs, errors) => {
  const dir = LEAGUE_DIRS[league];
  const tracks = [];
  const index = [];
  let files;
  try {
    files = listDir(join(root, dir)).sort();
  } catch {
    errors.push(`${dir}: теки ліги нема`);
    return { tracks, index };
  }
  if (files.length < TRACKS_MIN || files.length > TRACKS_MAX) {
    errors.push(`${dir}: треків ${files.length}, треба ${TRACKS_MIN}–${TRACKS_MAX}`);
  }
  files.forEach((file, position) => {
    const where = `${dir}/${file}`;
    try {
      const slug = slugFromFile(file, position, slugs);
      const json = JSON.parse(readFileSync(join(root, dir, file), 'utf8'));
      tracks.push({ name: slug, ...validateTrack(json) });
      index.push({ league, index: tracks.length - 1, name: json.name.trim(), slug });
    } catch (error) {
      errors.push(`${where}: ${error.message}`);
    }
  });
  return { tracks, index };
};

// <nn>-<slug>.json: nn — порядковий номер у лізі з 01 без пропусків, slug —
// ASCII-назва треку в .mrg (двигун читає до 39 байт), унікальна в паку
const slugFromFile = (file, position, slugs) => {
  const match = FILE_RE.exec(file);
  if (!match) throw new Error('імʼя файлу має бути <nn>-<slug>.json (slug: a-z, 0-9, дефіс)');
  const expected = String(position + 1).padStart(2, '0');
  if (match[1] !== expected) throw new Error(`номер ${match[1]}, а за порядком має бути ${expected}`);
  const slug = match[2];
  if (slug.length > SLUG_MAX) throw new Error(`slug довший за ${SLUG_MAX} символи`);
  if (slugs.has(slug)) throw new Error(`slug «${slug}» уже є в паку`);
  slugs.add(slug);
  return slug;
};

/** content/moto/tracks → { pack, index, errors }; порядок у лізі — за іменем файлу. */
export const collectTracks = (root) => {
  const errors = [];
  const slugs = new Set();
  let entries = [];
  try {
    entries = listDir(root);
  } catch {
    return { pack: { leagues: [[], [], []] }, index: [], errors: [`${root}: теки треків нема`] };
  }
  const extra = entries.filter((entry) => !LEAGUE_DIRS.includes(entry));
  if (extra.length) errors.push(`зайве в теці треків: ${extra.join(', ')} (ліги: ${LEAGUE_DIRS.join(', ')})`);
  const leagues = LEAGUE_DIRS.map((_, league) => collectLeague(root, league, slugs, errors));
  return {
    pack: { leagues: leagues.map((l) => l.tracks) },
    index: leagues.flatMap((l) => l.index),
    errors,
  };
};

/** null, якщо зібраний .mrg читається назад у той самий пак; інакше — текст помилки. */
export const verifyRoundTrip = (pack, mrg) =>
  isDeepStrictEqual(decodeMrg(mrg), pack) ? null : 'round-trip: .mrg, прочитаний назад, не збігається з JSON';
