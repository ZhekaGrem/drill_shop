// scripts/lib/moto-mrg.mjs
// Кодек пака треків .mrg — формату, який читає двигун гри «Дріл Мото»
// (GameLevel.load і LevelLoader у форку drill-moto). Свій для сайту: скрипти
// сайту — чистий .mjs без імпорту .ts (у package.json сайту нема
// "type": "module", і Node сипле попередження на кожен .ts-імпорт).
//
// Big endian. Заголовок: для кожної з 3 ліг int32 кількість треків, далі для
// кожного треку int32 абсолютний зсув його даних від початку файлу і назва
// ASCII з 0x00 у кінці. Дані треку: маркер 0x33 (0x32 — старий варіант із 20
// зайвими байтами, лише читаємо), start x, start y, finish x, finish y як
// int32 = одиниця × 8192, int16 кількість точок, перша точка абсолютно
// (int32 x, int32 y), далі для кожної наступної int8 dx, int8 dy; dx = -1 —
// escape, за ним абсолютні int32 x, int32 y.

export const START_SCALE = 8192;
export const LEAGUE_COUNT = 3;
const TRACK_MARKER = 0x33;
const LEGACY_MARKER = 0x32;
const LEGACY_EXTRA_BYTES = 20;
const ESCAPE = -1;

const fitsInt8 = (v) => v >= -128 && v <= 127;

const encodeTrack = (track) => {
  const head = Buffer.alloc(27);
  head.writeUInt8(TRACK_MARKER, 0);
  head.writeInt32BE(track.start[0] * START_SCALE, 1);
  head.writeInt32BE(track.start[1] * START_SCALE, 5);
  head.writeInt32BE(track.finish[0] * START_SCALE, 9);
  head.writeInt32BE(track.finish[1] * START_SCALE, 13);
  head.writeInt16BE(track.points.length, 17);
  head.writeInt32BE(track.points[0][0], 19);
  head.writeInt32BE(track.points[0][1], 23);
  const parts = [head];
  for (let i = 1; i < track.points.length; i++) {
    const [x, y] = track.points[i];
    const dx = x - track.points[i - 1][0];
    const dy = y - track.points[i - 1][1];
    if (dx !== ESCAPE && fitsInt8(dx) && fitsInt8(dy)) {
      const delta = Buffer.alloc(2);
      delta.writeInt8(dx, 0);
      delta.writeInt8(dy, 1);
      parts.push(delta);
    } else {
      const absolute = Buffer.alloc(9);
      absolute.writeInt8(ESCAPE, 0);
      absolute.writeInt32BE(x, 1);
      absolute.writeInt32BE(y, 5);
      parts.push(absolute);
    }
  }
  return Buffer.concat(parts);
};

/** { leagues: [[{ name, start, finish, points }], [...], [...]] } → Buffer .mrg */
export const encodeMrg = (pack) => {
  const bodies = pack.leagues.map((league) => league.map(encodeTrack));
  let headerSize = 0;
  for (const league of pack.leagues) {
    headerSize += 4;
    for (const track of league) headerSize += 4 + Buffer.byteLength(track.name, 'latin1') + 1;
  }
  const header = Buffer.alloc(headerSize);
  let h = 0;
  let offset = headerSize;
  pack.leagues.forEach((league, l) => {
    h = header.writeInt32BE(league.length, h);
    league.forEach((track, i) => {
      h = header.writeInt32BE(offset, h);
      h += header.write(track.name, h, 'latin1');
      h = header.writeUInt8(0, h);
      offset += bodies[l][i].length;
    });
  });
  return Buffer.concat([header, ...bodies.flat()]);
};

const decodeTrack = (buf, offset) => {
  let q = offset;
  const marker = buf.readUInt8(q);
  q += 1;
  if (marker === LEGACY_MARKER) {
    q += LEGACY_EXTRA_BYTES;
  } else if (marker !== TRACK_MARKER) {
    throw new Error(`зсув ${offset}: невідомий маркер треку 0x${marker.toString(16)}`);
  }
  const start = [buf.readInt32BE(q) / START_SCALE, buf.readInt32BE(q + 4) / START_SCALE];
  const finish = [buf.readInt32BE(q + 8) / START_SCALE, buf.readInt32BE(q + 12) / START_SCALE];
  const count = buf.readInt16BE(q + 16);
  q += 18;
  let x = buf.readInt32BE(q);
  let y = buf.readInt32BE(q + 4);
  q += 8;
  const points = [[x, y]];
  for (let i = 1; i < count; i++) {
    const dx = buf.readInt8(q);
    q += 1;
    if (dx === ESCAPE) {
      x = buf.readInt32BE(q);
      y = buf.readInt32BE(q + 4);
      q += 8;
    } else {
      x += dx;
      y += buf.readInt8(q);
      q += 1;
    }
    points.push([x, y]);
  }
  return { start, finish, points };
};

/** Buffer .mrg → { leagues: [[{ name, start, finish, points }], [...], [...]] } */
export const decodeMrg = (buf) => {
  let p = 0;
  const entries = [];
  for (let l = 0; l < LEAGUE_COUNT; l++) {
    const count = buf.readInt32BE(p);
    p += 4;
    const league = [];
    for (let i = 0; i < count; i++) {
      const offset = buf.readInt32BE(p);
      const end = buf.indexOf(0, p + 4);
      league.push({ name: buf.toString('latin1', p + 4, end), offset });
      p = end + 1;
    }
    entries.push(league);
  }
  return {
    leagues: entries.map((league) => league.map((e) => ({ name: e.name, ...decodeTrack(buf, e.offset) }))),
  };
};
