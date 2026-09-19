#!/usr/bin/env node
/* eslint-disable no-console */
// Розділ «є. Поламав» у прод-БД: 2 колекції (7 футболок × 1000 грн, 6 худі × 2000 грн),
// у кожного товару розміри M/L/XL. Назви мокові. Спека:
// docs/superpowers/specs/2026-09-19-polamav-world-design.md
//
// За замовчуванням НІЧОГО не пише. Будь-який запис вимагає ОБОХ прапорців:
//   --apply --confirm=polamav
//
// Фази (--phase=…):
//   plan (дефолт)  друкує модель даних. Ні БД, ні мережі.
//   check          лише читання: колізії slug/sku, локальні асети, git-трекінг;
//                  з --probe=https://ye-dril.com ще й HEAD до асетів на проді.
//   create         «темна» вставка: колекції й товари isActive=false (невидимі всюди).
//   images         Cloudinary + ProductImage з --dir=<тека> (<slug>-front.jpg,
//                  <slug>-back.jpg, <slug>-render3d.webp).
//   activate       ПІСЛЯ деплою фронта. Гейт (асети 200 з правильним типом, фото й
//                  рендери на місці, модель худі рівно та, 3 розміри) → одна
//                  транзакція isActive=true. Потребує --probe.
//   revalidate     POST /api/revalidate для кожного товару (секрет — змінна
//                  середовища REVALIDATE_SECRET, у файлі його немає).
//   deactivate     миттєво сховати назад (isActive=false), зворотно.
//   stock          --qty=N на кожен розмір (відкрити продаж). Мок = 0.
//   retire         мʼяке видалення за конвенцією ProductRepository.delete.
//
// Залежності (@prisma/client, cloudinary, dotenv) і .env беруться з теки бекенда:
// BACKEND_DIR, за замовчуванням ../drill-shop-backend поруч із цим репо.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const FRONT = path.resolve(__dirname, '../..');
const BACKEND = process.env.BACKEND_DIR || path.resolve(FRONT, '../drill-shop-backend');
const ORIGIN = 'https://ye-dril.com'; // апекс: www віддає 308, а редирект губить тіло POST

// ---------- CLI ----------
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, ...v] = a.replace(/^--/, '').split('=');
    return [k, v.length ? v.join('=') : true];
  })
);
const PHASE = args.phase || 'plan';
const APPLY = args.apply === true && args.confirm === 'polamav';
const QTY = args.qty !== undefined ? Number(args.qty) : 0;
const PROBE = typeof args.probe === 'string' ? args.probe.replace(/\/+$/, '') : null;
if (args.apply && args.confirm !== 'polamav') {
  console.error('--apply без --confirm=polamav ігнорується: це прод-БД.');
  process.exit(2);
}

// ---------- ДАНІ ----------
const SIZES = ['M', 'L', 'XL'];
// Раніше за найстаріший публічний товар (2025-11-30): каталог сортує за createdAt desc
// і ховає приховані розділи лише ПІСЛЯ пагінації — з сьогоднішньою датою 13 товарів
// зайняли б першу сторінку каталогу і його JSON-LD ItemList.
const BACKDATE = new Date('2025-11-01T00:00:00.000Z');
const HOODIE_MODEL = '/3d/models/hoodie-polamav.glb';
const BADGE = { badgeText: 'скоро', badgeColor: '#2b9ad9' };
const PLAIN = '#111111';
const RED = 'conic-gradient(from 0deg, #111111 0 50%, #e41d25 50% 100%)';

const COLLECTIONS = [
  {
    slug: 'polamav-futbolky',
    title: 'Поламав · Футболки',
    sortOrder: 100,
    garment: 'tee',
    price: 1000,
    products: [
      { name: 'Два кола', src: '1 (1).png', swatch: PLAIN },
      { name: 'Червоне коло', src: '2 (1).png', swatch: RED },
      { name: 'Тихе коло', src: '3.png', swatch: PLAIN },
      { name: 'Зміїний вузол', src: '3-1.png', swatch: PLAIN },
      { name: 'Ножі', src: '4.png', swatch: PLAIN },
      { name: 'Танець смерті', src: '5.png', swatch: PLAIN },
      { name: 'Куля у вогні', src: '6.png', swatch: PLAIN },
    ],
  },
  {
    slug: 'polamav-hudi',
    title: 'Поламав · Худі',
    sortOrder: 101,
    garment: 'hoodie',
    price: 2000,
    products: [
      { name: 'Худі Куля у вогні', src: '1 (2).png', swatch: PLAIN },
      { name: 'Худі Танець смерті', src: '2 (2).png', swatch: PLAIN },
      { name: 'Худі Червоні рукави', src: '3 (1).png', swatch: RED },
      { name: 'Худі Зміїний вузол', src: '4 (1).png', swatch: PLAIN },
      { name: 'Худі Ножі', src: '5 (1).png', swatch: RED },
      { name: 'Худі Червоний кант', src: '7EXPERIMENTAL.png', swatch: RED },
    ],
  },
];

const pad = (n) => String(n).padStart(2, '0');

const rows = () =>
  COLLECTIONS.flatMap((c) =>
    c.products.map((p, i) => {
      const n = pad(i + 1);
      const slug = `polamav-${c.garment}-${n}`;
      return {
        collection: c.slug,
        garment: c.garment,
        product: {
          slug,
          sku: slug,
          name: p.name,
          price: c.price,
          unit: 'PIECE',
          productType: 'CLOTHING',
          status: 'ACTIVE',
          hasVariants: true,
          collectionOrder: i + 1,
          // Футболка: null = дефолтна tshirt.glb у фронті (прецедент Олька)
          model3dPath: c.garment === 'hoodie' ? HOODIE_MODEL : null,
          texture3dUrl: `/3d/textures/${c.garment === 'tee' ? 'tshirt' : 'hoodie'}-polamav-${n}.jpg`,
          switcherSwatch: p.swatch,
          ...BADGE,
          labelText: null,
          labelColor: null,
        },
        variants: SIZES.map((size, k) => ({
          sku: `${slug}-${size.toLowerCase()}`,
          // Імʼя товару, не розміру: кошик і чекаут показують variant.name || product.name
          name: p.name,
          price: c.price,
          options: { size },
          sortOrder: k + 1, // M першим: легасі /catalog/[slug] автообирає variants[0]
        })),
        src: path.join(FRONT, '3d/єПоламав', c.garment === 'tee' ? 'футболки' : 'худі', p.src),
      };
    })
  );

const allSlugs = () => rows().map((r) => r.product.slug);
const collectionSlugs = () => COLLECTIONS.map((c) => c.slug);

// ---------- helpers ----------
const backendRequire = (m) => require(path.join(BACKEND, 'node_modules', m));
const prismaClient = () => {
  backendRequire('dotenv').config({ path: path.join(BACKEND, '.env'), quiet: true });
  const { PrismaClient } = backendRequire('@prisma/client');
  return new PrismaClient({ log: ['error'] });
};

const EXPECTED_TYPE = (u) => (u.endsWith('.glb') ? 'model/gltf-binary' : 'image/jpeg');
const assetUrls = () => {
  const urls = new Set();
  for (const r of rows()) {
    urls.add(r.product.texture3dUrl);
    if (r.product.model3dPath) urls.add(r.product.model3dPath);
  }
  return [...urls];
};
const localAssetReport = () =>
  assetUrls().map((u) => {
    const rel = path.join('public', u);
    let tracked = false;
    try {
      execFileSync('git', ['-C', FRONT, 'ls-files', '--error-unmatch', rel], { stdio: 'ignore' });
      tracked = true;
    } catch {}
    return { url: u, exists: fs.existsSync(path.join(FRONT, rel)), gitTracked: tracked };
  });
const probe = async (origin) => {
  const out = [];
  for (const u of assetUrls()) {
    try {
      const res = await fetch(origin + u, { method: 'HEAD', redirect: 'manual' });
      const type = res.headers.get('content-type') || '';
      out.push({
        url: u,
        status: res.status,
        type,
        ok: res.status === 200 && type.startsWith(EXPECTED_TYPE(u)),
      });
    } catch (e) {
      out.push({ url: u, status: 'ERR ' + e.message, ok: false });
    }
  }
  return out;
};

// ---------- phases ----------
function printPlan() {
  console.log(`PLAN (без БД). backdate=${BACKDATE.toISOString()} qty=${QTY}`);
  for (const c of COLLECTIONS) {
    console.log(`\nКОЛЕКЦІЯ ${c.slug} «${c.title}» sortOrder=${c.sortOrder} heroEnabled=true`);
    for (const r of rows().filter((x) => x.collection === c.slug)) {
      const p = r.product;
      const src = `${path.basename(r.src)}${fs.existsSync(r.src) ? '' : ' (ФАЙЛУ НЕМА)'}`;
      console.log(
        `  #${p.collectionOrder} ${p.slug} «${p.name}» ${p.price} грн | model=${p.model3dPath ?? 'tshirt.glb'} | tex=${p.texture3dUrl} | ${SIZES.join('/')} | src=${src}`
      );
    }
  }
  const n = rows().length;
  console.log(`\nРАЗОМ: ${COLLECTIONS.length} колекції, ${n} товарів, ${n * SIZES.length} варіантів`);
}

async function check(prisma) {
  const slugs = allSlugs();
  const skus = rows().flatMap((r) => r.variants.map((v) => v.sku));
  const like = { contains: 'polamav', mode: 'insensitive' };
  const report = {
    existingCollections: await prisma.collection.findMany({
      where: { slug: like },
      select: { slug: true, isActive: true, heroEnabled: true, deletedAt: true },
    }),
    existingProducts: await prisma.product.findMany({
      where: { OR: [{ slug: { in: slugs } }, { sku: { in: slugs } }, { slug: like }] },
      select: {
        slug: true,
        isActive: true,
        deletedAt: true,
        _count: { select: { variants: true, images: true } },
      },
    }),
    existingVariantSkus: (
      await prisma.productVariant.findMany({ where: { sku: { in: skus } }, select: { sku: true } })
    ).length,
    localAssets: localAssetReport(),
    sourcePngsMissing: rows()
      .filter((r) => !fs.existsSync(r.src))
      .map((r) => path.basename(r.src)),
  };
  if (PROBE) report.probe = await probe(PROBE);
  console.log(JSON.stringify(report, null, 2));
}

async function create(prisma) {
  await prisma.$transaction(
    async (tx) => {
      const colIds = {};
      for (const c of COLLECTIONS) {
        const col = await tx.collection.upsert({
          where: { slug: c.slug },
          // update НЕ чіпає isActive: повторний create після activate нічого не ховає
          update: { title: c.title, sortOrder: c.sortOrder, heroEnabled: true },
          // heroEnabled=true ЗАВЖДИ: прихований розділ мусить бути в GET /collections
          // (hidden-collections.ts). «Темноту» дає isActive=false, а не heroEnabled.
          create: {
            slug: c.slug,
            title: c.title,
            sortOrder: c.sortOrder,
            heroEnabled: true,
            isActive: false,
          },
        });
        colIds[c.slug] = col.id;
      }
      for (const r of rows()) {
        const { slug, ...data } = r.product;
        const prod = await tx.product.upsert({
          where: { slug },
          update: { ...data, collectionId: colIds[r.collection] }, // без isActive/quantity/createdAt
          create: {
            slug,
            ...data,
            collectionId: colIds[r.collection],
            isActive: false,
            // Сток живе у варіантах; product.quantity>0 відкрив би кошик без variantId
            quantity: 0,
            publishedAt: new Date(),
            createdAt: BACKDATE,
          },
        });
        for (const v of r.variants) {
          await tx.productVariant.upsert({
            where: { sku: v.sku },
            update: {
              name: v.name,
              price: v.price,
              options: v.options,
              sortOrder: v.sortOrder,
              isActive: true,
            },
            create: { productId: prod.id, ...v, quantity: QTY, isActive: true },
          });
        }
        console.log(`  ✓ ${slug} «${r.product.name}» (${r.variants.length} розміри)`);
      }
    },
    { timeout: 120_000 }
  );
}

async function images(prisma) {
  const dir = typeof args.dir === 'string' ? args.dir : null;
  if (!dir) throw new Error('--dir=<тека з <slug>-front.jpg, <slug>-back.jpg, <slug>-render3d.webp>');
  const { v2: cloudinary } = backendRequire('cloudinary');
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  for (const r of rows()) {
    const s = r.product.slug;
    const files = {
      front: path.join(dir, `${s}-front.jpg`),
      back: path.join(dir, `${s}-back.jpg`),
      render3d: path.join(dir, `${s}-render3d.webp`),
    };
    const missing = Object.entries(files)
      .filter(([, f]) => !fs.existsSync(f))
      .map(([k]) => k);
    console.log(`  ${s}: ${missing.length ? 'БРАКУЄ ' + missing.join(',') : 'усі 3 файли на місці'}`);
    if (!APPLY) continue;
    if (missing.length) throw new Error(`${s}: бракує ${missing.join(', ')}`);
    const prod = await prisma.product.findUnique({ where: { slug: s }, select: { id: true } });
    if (!prod) throw new Error(`${s}: нема в БД — спершу --phase=create`);
    const up = (file, public_id) =>
      cloudinary.uploader.upload(file, { public_id, overwrite: true, resource_type: 'image' });
    // Ті самі public_id і sortOrder, що в 3d/pipeline/upload-render3d.mjs і upload-photos.mjs
    const fr = await up(files.front, `products/${s}-front`);
    const br = await up(files.back, `products/${s}-back`);
    const rr = await up(files.render3d, `drill/render3d/${s}`);
    const name = r.product.name;
    await prisma.$transaction([
      prisma.productImage.deleteMany({ where: { productId: prod.id, kind: { in: ['render3d', 'photo'] } } }),
      prisma.productImage.create({
        data: {
          productId: prod.id,
          url: fr.secure_url,
          publicId: fr.public_id,
          kind: 'photo',
          altText: `${name} — перед`,
          sortOrder: 0,
          isPrimary: true,
        },
      }),
      prisma.productImage.create({
        data: {
          productId: prod.id,
          url: br.secure_url,
          publicId: br.public_id,
          kind: 'photo',
          altText: `${name} — спина`,
          sortOrder: 1,
          isSecondary: true,
        },
      }),
      prisma.productImage.create({
        data: {
          productId: prod.id,
          url: rr.secure_url,
          publicId: rr.public_id,
          kind: 'render3d',
          altText: `${name} — 3D-рендер`,
          sortOrder: 10,
        },
      }),
    ]);
    console.log(
      `    ↑ ${fr.width}x${fr.height} перед, ${br.width}x${br.height} спина, ${rr.width}x${rr.height} рендер`
    );
  }
}

async function activate(prisma) {
  if (!PROBE) throw new Error(`activate вимагає --probe=${ORIGIN} (асети мають віддаватись фронтом)`);
  const probed = await probe(PROBE);
  const prods = await prisma.product.findMany({
    where: { slug: { in: allSlugs() } },
    select: {
      slug: true,
      model3dPath: true,
      collection: { select: { slug: true } },
      images: { select: { kind: true, isPrimary: true } },
      variants: { where: { isActive: true }, orderBy: { sortOrder: 'asc' }, select: { options: true } },
    },
  });
  const gate = {
    badAssets: probed.filter((p) => !p.ok),
    missingProducts: allSlugs().filter((s) => !prods.some((p) => p.slug === s)),
    noRender3d: prods.filter((p) => !p.images.some((i) => i.kind === 'render3d')).map((p) => p.slug),
    noPrimaryPhoto: prods
      .filter((p) => !p.images.some((i) => i.kind === 'photo' && i.isPrimary))
      .map((p) => p.slug),
    // «шлях віддає 200» тут замало: hoodie.glb теж 200, а на ньому худі вийшло б без принта
    wrongHoodieModel: prods
      .filter((p) => p.collection?.slug === 'polamav-hudi' && p.model3dPath !== HOODIE_MODEL)
      .map((p) => p.slug),
    wrongSizes: prods
      .filter((p) => p.variants.map((v) => v.options?.size).join('/') !== SIZES.join('/'))
      .map((p) => p.slug),
  };
  console.log(JSON.stringify({ probed: probed.length, gate }, null, 2));
  if (Object.values(gate).some((v) => v.length)) throw new Error('ГЕЙТ НЕ ПРОЙДЕНО — нічого не змінено');
  if (!APPLY)
    return console.log('DRY: гейт пройдено; з --apply --confirm=polamav увімкнуло б 2 колекції й 13 товарів');
  await prisma.$transaction([
    prisma.collection.updateMany({
      where: { slug: { in: collectionSlugs() } },
      data: { isActive: true, heroEnabled: true },
    }),
    prisma.product.updateMany({ where: { slug: { in: allSlugs() } }, data: { isActive: true } }),
  ]);
  console.log('АКТИВОВАНО. Далі: --phase=revalidate');
}

async function revalidate() {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) throw new Error('REVALIDATE_SECRET не задано');
  for (const slug of allSlugs()) {
    if (!APPLY) {
      console.log(`DRY: POST ${ORIGIN}/api/revalidate {create, ${slug}}`);
      continue;
    }
    const res = await fetch(`${ORIGIN}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-revalidate-secret': secret },
      body: JSON.stringify({ event: 'create', slug }),
    });
    const body = await res.json().catch(() => ({}));
    console.log(`  ${slug}: ${res.status} revalidated=${body.revalidated}`);
    if (!body.revalidated) process.exitCode = 1;
  }
}

async function setActive(prisma, value) {
  if (!APPLY) return console.log(`DRY: isActive=${value} для 2 колекцій і ${allSlugs().length} товарів`);
  await prisma.$transaction([
    prisma.product.updateMany({ where: { slug: { in: allSlugs() } }, data: { isActive: value } }),
    prisma.collection.updateMany({ where: { slug: { in: collectionSlugs() } }, data: { isActive: value } }),
  ]);
  console.log(`isActive=${value}`);
}

async function stock(prisma) {
  if (!Number.isInteger(QTY) || QTY < 0) throw new Error('--qty=<ціле ≥0>');
  const skus = rows().flatMap((r) => r.variants.map((v) => v.sku));
  if (!APPLY)
    return console.log(`DRY: quantity=${QTY} для ${skus.length} варіантів (product.quantity лишається 0)`);
  const res = await prisma.productVariant.updateMany({
    where: { sku: { in: skus } },
    data: { quantity: QTY },
  });
  console.log(`quantity=${QTY} для ${res.count} варіантів`);
}

async function retire(prisma) {
  const suffix = `-deleted-${Date.now()}`; // конвенція ProductRepository.delete
  if (!APPLY) return console.log(`DRY: мʼяке видалення з суфіксом ${suffix}`);
  await prisma.$transaction(
    async (tx) => {
      for (const slug of allSlugs()) {
        const p = await tx.product.findUnique({ where: { slug }, select: { id: true, sku: true } });
        if (!p) continue;
        await tx.product.update({
          where: { id: p.id },
          data: { sku: p.sku + suffix, slug: slug + suffix, isActive: false, deletedAt: new Date() },
        });
        const vs = await tx.productVariant.findMany({
          where: { productId: p.id },
          select: { id: true, sku: true },
        });
        for (const v of vs)
          await tx.productVariant.update({
            where: { id: v.id },
            data: { sku: v.sku + suffix, isActive: false },
          });
      }
      for (const c of collectionSlugs()) {
        // Коду мʼякого видалення колекцій нема — дзеркалимо товарну конвенцію
        await tx.collection.updateMany({
          where: { slug: c },
          data: { slug: c + suffix, isActive: false, deletedAt: new Date() },
        });
      }
    },
    { timeout: 120_000 }
  );
  console.log('мʼяко видалено');
}

(async () => {
  if (PHASE === 'plan') return printPlan();
  if (PHASE === 'revalidate') return revalidate();
  const prisma = prismaClient();
  try {
    console.log(`PHASE=${PHASE} ${APPLY ? 'APPLY (ПИШЕ В ПРОД)' : 'DRY-RUN'}`);
    if (PHASE === 'check') return void (await check(prisma));
    if (PHASE === 'create') return APPLY ? await create(prisma) : printPlan();
    if (PHASE === 'images') return await images(prisma);
    if (PHASE === 'activate') return await activate(prisma);
    if (PHASE === 'deactivate') return await setActive(prisma, false);
    if (PHASE === 'stock') return await stock(prisma);
    if (PHASE === 'retire') return await retire(prisma);
    throw new Error(`невідома фаза ${PHASE}`);
  } finally {
    await prisma.$disconnect();
  }
})().catch((e) => {
  console.error('ПОМИЛКА:', e.message);
  process.exitCode = 1;
});
