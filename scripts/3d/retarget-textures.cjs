#!/usr/bin/env node
/* eslint-disable no-console */
// Переведення `texture3dUrl` товарів на нову розкладку `public/3d/textures/<світ>/`.
//
// Порядок, щоб нічого не зламалось (шляхи живуть у прод-БД):
//   1. деплой, де файли лежать І на старому, І на новому місці;
//   2. цей скрипт: --apply --confirm=3d (гейт: усі нові URL віддають 200 image/jpeg);
//   3. наступний деплой прибирає старі копії.
//
// Без прапорців — сухий прогін: друкує, що змінив би, і стан гейта.
// Залежності й .env беруться з теки бекенда (BACKEND_DIR, дефолт ../drill-shop-backend).

const path = require('path');

const FRONT = path.resolve(__dirname, '../..');
const BACKEND = process.env.BACKEND_DIR || path.resolve(FRONT, '../drill-shop-backend');
const ORIGIN = 'https://ye-dril.com';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, ...v] = a.replace(/^--/, '').split('=');
    return [k, v.length ? v.join('=') : true];
  })
);
const APPLY = args.apply === true && args.confirm === '3d';
if (args.apply && args.confirm !== '3d') {
  console.error('--apply без --confirm=3d ігнорується: це прод-БД.');
  process.exit(2);
}

// Старий шлях → новий. Тільки ті текстури, що лежать у цьому репо;
// колекції на Cloudinary (Ніжна Оксана, Щільний Дріл) тут ні до чого.
const MAP = {
  '/3d/textures/tshirt-apex.jpg': '/3d/textures/dril/tshirt-apex.jpg',
  '/3d/textures/tshirt-kalach.jpg': '/3d/textures/dril/tshirt-kalach.jpg',
  '/3d/textures/tshirt-olko.jpg': '/3d/textures/olko/tshirt.jpg',
  '/3d/textures/tshirt-privitonchyk.jpg': '/3d/textures/serik/tshirt.jpg',
  ...Object.fromEntries(
    Array.from({ length: 7 }, (_, i) => {
      const n = String(i + 1).padStart(2, '0');
      return [`/3d/textures/tshirt-polamav-${n}.jpg`, `/3d/textures/polamav/tshirt-${n}.jpg`];
    })
  ),
  ...Object.fromEntries(
    Array.from({ length: 6 }, (_, i) => {
      const n = String(i + 1).padStart(2, '0');
      return [`/3d/textures/hoodie-polamav-${n}.jpg`, `/3d/textures/polamav/hoodie-${n}.jpg`];
    })
  ),
};

const backendRequire = (m) => require(path.join(BACKEND, 'node_modules', m));
const prismaClient = () => {
  backendRequire('dotenv').config({ path: path.join(BACKEND, '.env'), quiet: true });
  const { PrismaClient } = backendRequire('@prisma/client');
  return new PrismaClient({ log: ['error'] });
};

const probe = async () => {
  const bad = [];
  for (const url of Object.values(MAP)) {
    try {
      const res = await fetch(ORIGIN + url, { method: 'HEAD', redirect: 'manual' });
      const type = res.headers.get('content-type') || '';
      if (res.status !== 200 || !type.startsWith('image/jpeg')) bad.push(`${url} → ${res.status} ${type}`);
    } catch (e) {
      bad.push(`${url} → ${e.message}`);
    }
  }
  return bad;
};

(async () => {
  const prisma = prismaClient();
  try {
    const rows = await prisma.product.findMany({
      where: { texture3dUrl: { in: Object.keys(MAP) } },
      select: { slug: true, texture3dUrl: true },
      orderBy: { slug: 'asc' },
    });
    console.log(`${APPLY ? 'APPLY (ПИШЕ В ПРОД)' : 'DRY-RUN'} · товарів під зміну: ${rows.length}`);
    for (const r of rows) console.log(`  ${r.slug}: ${r.texture3dUrl} → ${MAP[r.texture3dUrl]}`);

    const stale = await prisma.product.count({
      where: { texture3dUrl: { startsWith: '/3d/textures/' }, NOT: { texture3dUrl: { in: Object.keys(MAP) } } },
    });
    if (stale) console.log(`  УВАГА: ще ${stale} товарів із локальною текстурою поза мапою`);

    const bad = await probe();
    if (bad.length) {
      console.error('ГЕЙТ НЕ ПРОЙДЕНО — нові файли ще не на проді:\n  ' + bad.join('\n  '));
      process.exitCode = 1;
      return;
    }
    console.log(`  гейт: усі ${Object.keys(MAP).length} нових URL віддають 200 image/jpeg`);
    if (!APPLY) return console.log('DRY: з --apply --confirm=3d переписало б шляхи');

    await prisma.$transaction(
      Object.entries(MAP).map(([from, to]) =>
        prisma.product.updateMany({ where: { texture3dUrl: from }, data: { texture3dUrl: to } })
      )
    );
    console.log('ГОТОВО. Старі копії можна прибирати наступним деплоєм.');
  } finally {
    await prisma.$disconnect();
  }
})().catch((e) => {
  console.error('ПОМИЛКА:', e.message);
  process.exitCode = 1;
});
