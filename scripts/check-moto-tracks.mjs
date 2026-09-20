// scripts/check-moto-tracks.mjs
// Перевірки кодека .mrg і правил треків (scripts/lib/moto-mrg.mjs,
// scripts/lib/moto-tracks.mjs). Тестового раннера в проєкті нема:
//   node scripts/check-moto-tracks.mjs
// Калібрування з оригінальним паком порту (лежить лише в довідковому клоні
// upstream ../gd-upstream з плану A, поза обома репозиторіями):
//   GD_ORIGINAL_MRG=../gd-upstream/src/assets/levels.mrg node scripts/check-moto-tracks.mjs
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { START_SCALE, decodeMrg, encodeMrg } from './lib/moto-mrg.mjs';
import { collectTracks, groundAt, validateTrack, verifyRoundTrip } from './lib/moto-tracks.mjs';

let n = 0;
const check = (name, fn) => {
  fn();
  n += 1;
  console.log('ok -', name);
};

// Ламана рядком: '0,0 10,5' → [[0, 0], [10, 5]] — щоб фікстури читались в один рядок
const line = (text) => text.split(' ').map((pair) => pair.split(',').map(Number));

// Валідний трек: земля y = 0 під стартом, старт на 18 вище, по 200 одиниць до старту й після фінішу
const track = (over = {}) => ({
  name: 'Тест',
  start: [0, 18],
  finish: [400, 0],
  points: line('-200,0 -100,0 50,0 150,10 250,0 350,0 450,0 600,0'),
  ...over,
});

check('groundAt інтерполює між точками', () => {
  assert.equal(groundAt(line('0,0 10,10'), 5), 5);
  assert.equal(groundAt(line('0,4 10,4 20,-6'), 15), -1);
  assert.ok(Number.isNaN(groundAt(line('0,0 10,0'), 11)));
});

check('validateTrack приймає валідний трек і повертає копії', () => {
  const src = track();
  const out = validateTrack(src);
  assert.deepEqual(out, { start: src.start, finish: src.finish, points: src.points });
  assert.notEqual(out.points, src.points);
});

check('validateTrack ловить порушення правил', () => {
  const bad = [
    [{ points: line('-200,0 -100,0 -100,5 600,0') }, /строго зростати/],
    [{ start: [0, 10] }, /вгору/],
    [{ start: [0, 25] }, /вгору/],
    [{ start: [0, -18] }, /вгору/],
    [{ finish: [400, 5] }, /finish\.y/],
    [{ start: [-100, 18] }, /до старту/],
    [{ finish: [500, 0] }, /після фінішу/],
    [{ start: [420, 18], finish: [400, 0] }, /менший за finish/],
    [{ name: '' }, /name/],
    [{ name: 'Дуже-дуже довга назва треку' }, /name/],
    [{ start: [0.5, 18] }, /start\/finish/],
    [{ points: line('-200,0 40000,0') }, /points/],
    [{ finsh: [400, 0] }, /зайві поля: finsh/],
    [{ points: line('-200,0 -100,0 0,0 14,14 100,14 250,0 350,0 450,0 600,0') }, /вʼязне/],
  ];
  for (const [over, pattern] of bad) {
    assert.throws(() => validateTrack(track(over)), pattern, JSON.stringify(over));
  }
});

check('validateTrack вимагає точки між прапорцями старту й фінішу', () => {
  const sparse = { points: line('-200,0 -100,0 300,0 600,0'), start: [0, 18], finish: [250, 0] };
  assert.throws(() => validateTrack(track(sparse)), /прапорців/);
});

const packOf = (...leagues) => ({
  leagues: leagues.map((league) => league.map((t, i) => ({ name: `t${i}`, ...validateTrack(t) }))),
});

check('кодек: round-trip зберігає ліги, назви, старт, фініш і точки', () => {
  // дельти 160, 320 і 150 не влазять у int8, відʼємні координати — теж випадок
  const wide = track({
    points: line('-200,-300 -100,-300 60,20 200,20 210,170 350,170 450,0 600,0'),
    start: [0, -82],
  });
  const pack = packOf([track(), wide], [track()], [wide, track(), track()]);
  const mrg = encodeMrg(pack);
  assert.deepEqual(decodeMrg(mrg), pack);
  assert.equal(verifyRoundTrip(pack, mrg), null);
});

check('кодек: заголовок, маркер 0x33 і старт × 8192 там, де їх читає двигун', () => {
  const mrg = encodeMrg(packOf([track()], [], []));
  assert.equal(mrg.readInt32BE(0), 1);
  const offset = mrg.readInt32BE(4);
  assert.equal(mrg.toString('latin1', 8, 10), 't0');
  assert.equal(mrg[10], 0);
  assert.equal(mrg.readInt32BE(11), 0, 'ліга 2 порожня');
  assert.equal(mrg.readInt32BE(15), 0, 'ліга 3 порожня');
  assert.equal(offset, 19);
  assert.equal(mrg[offset], 0x33);
  assert.equal(mrg.readInt32BE(offset + 1), 0 * START_SCALE);
  assert.equal(mrg.readInt32BE(offset + 5), 18 * START_SCALE);
  assert.equal(mrg.readInt32BE(offset + 9), 400 * START_SCALE);
  assert.equal(mrg.readInt16BE(offset + 17), 8);
  assert.equal(START_SCALE, 8192);
});

check('кодек: дельта за межами байта йде escape-записом (9 байт замість 2)', () => {
  const near = packOf([track()], [], []);
  const far = packOf([track({ points: line('-200,0 -100,0 50,0 150,200 250,0 350,0 450,0 600,0') })], [], []);
  // у far дві дельти dy = ±200 не влазять у int8: +7 байт на кожну
  assert.equal(encodeMrg(far).length - encodeMrg(near).length, 14);
  assert.deepEqual(decodeMrg(encodeMrg(far)), far);
});

check('verifyRoundTrip помічає розбіжність', () => {
  const pack = packOf([track()], [], []);
  const other = packOf([track({ name: 'Інший', start: [0, 19] })], [], []);
  assert.match(verifyRoundTrip(other, encodeMrg(pack)), /round-trip/);
});

const withTree = (files, fn) => {
  const root = mkdtempSync(join(tmpdir(), 'moto-tracks-'));
  try {
    for (const [path, body] of Object.entries(files)) {
      mkdirSync(join(root, path, '..'), { recursive: true });
      writeFileSync(join(root, path), typeof body === 'string' ? body : JSON.stringify(body));
    }
    fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
};

// 1-lehka/01-1a.json … 3-vazhka/03-3c.json — усі з однаковим валідним треком
const threeByThree = () => {
  const files = {};
  for (const dir of ['1-lehka', '2-serednia', '3-vazhka']) {
    ['a', 'b', 'c'].forEach((letter, i) => {
      files[`${dir}/0${i + 1}-${dir[0]}${letter}.json`] = track();
    });
  }
  return files;
};

check('collectTracks: 3 × 3 треки → пак і індекс у порядку файлів', () => {
  withTree(threeByThree(), (root) => {
    const { pack, index, errors } = collectTracks(root);
    assert.deepEqual(errors, []);
    assert.deepEqual(
      pack.leagues.map((l) => l.length),
      [3, 3, 3]
    );
    assert.equal(pack.leagues[1][2].name, '2c');
    assert.deepEqual(index[0], { league: 0, index: 0, name: 'Тест', slug: '1a' });
    assert.deepEqual(index[8], { league: 2, index: 2, name: 'Тест', slug: '3c' });
  });
});

check('collectTracks: кількість треків, імена файлів, нумерація, зайві теки, дублікати slug', () => {
  const cases = [
    [{ remove: ['1-lehka/03-1c.json'] }, /1-lehka: треків 2/],
    [{ add: { '1-lehka/4-1d.json': track() } }, /імʼя файлу/],
    [{ add: { '2-serednia/05-2e.json': track() } }, /номер 05/],
    [{ add: { '4-extra/01-x.json': track() } }, /зайве в теці треків: 4-extra/],
    [{ remove: ['3-vazhka/01-3a.json'], add: { '3-vazhka/01-1a.json': track() } }, /slug «1a» уже є/],
    [{ add: { '1-lehka/02-1b.json': '{ зламаний json' } }, /1-lehka\/02-1b\.json/],
  ];
  for (const [{ remove = [], add = {} }, pattern] of cases) {
    const files = threeByThree();
    for (const path of remove) delete files[path];
    Object.assign(files, add);
    withTree(files, (root) => {
      const { errors } = collectTracks(root);
      assert.ok(
        errors.some((e) => pattern.test(e)),
        `${pattern} серед: ${errors.join(' | ')}`
      );
    });
  }
});

const original = process.env.GD_ORIGINAL_MRG;
if (original && existsSync(original)) {
  check('калібрування: оригінальний пак читається і перекодовується байт у байт', () => {
    const bytes = readFileSync(original);
    const pack = decodeMrg(bytes);
    const intro = pack.leagues[0][0];
    assert.equal(intro.name, 'Intro');
    assert.equal(intro.points.length, 45);
    assert.deepEqual(intro.points[0], [-380, 136]);
    assert.deepEqual(intro.start, [-49, 24]);
    assert.deepEqual(intro.finish, [433, 0]);
    assert.ok(encodeMrg(pack).equals(bytes));
  });
} else {
  console.log('skip - калібрування (GD_ORIGINAL_MRG не задано)');
}

console.log(`ok: ${n} checks`);
