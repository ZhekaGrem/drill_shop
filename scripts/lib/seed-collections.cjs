/* eslint-disable no-console */
// Фазовий засів колекцій у прод-БД. Схема й запобіжники — ті самі, що в
// scripts/polamav/create-polamav.cjs (той скрипт своє відпрацював і лишається як є);
// тут вони винесені в рушій, щоб наступна серія була лише файлом із даними.
//
// За замовчуванням НІЧОГО не пише. Будь-який запис вимагає ОБОХ прапорців:
//   --apply --confirm=<config.confirm>
//
// Фази (--phase=…):
//   plan (дефолт)  друкує модель даних. Ні БД, ні мережі.
//   check          лише читання: колізії slug/sku, локальні асети, git-трекінг;
//                  з --probe=https://ye-dril.com ще й HEAD до асетів на проді.
//   create         «темна» вставка: колекції й товари isActive=false (невидимі всюди).
//   images         Cloudinary + ProductImage з --dir=<тека> (<slug>-front.jpg,
//                  <slug>-back.jpg, <slug>-render3d.webp); --only=slug1,slug2 — лише ці.
//   activate       ПІСЛЯ деплою фронта. Гейт (асети 200 з правильним типом, фото й
//                  рендери на місці, модель і розміри рівно ті) → одна транзакція
//                  isActive=true. Потребує --probe.
//   revalidate     POST /api/revalidate для кожного товару (секрет — змінна
//                  середовища REVALIDATE_SECRET, у файлі його немає).
//   deactivate     миттєво сховати назад (isActive=false), зворотно.
//   stock          --qty=N на кожен розмір (відкрити продаж).
//   retire         мʼяке видалення за конвенцією ProductRepository.delete.
//   purge          ЖОРСТКЕ видалення з бази, лише для --only=slug1,slug2. Варіанти, фото,
//                  позиції кошиків, відгуки й категорії зникають каскадом; товар, що є
//                  хоч в одному замовленні, не видаляється (OrderItem без каскаду).
//                  Файли в Cloudinary лишаються.
//
// Залежності (@prisma/client, cloudinary, dotenv) і .env беруться з теки бекенда:
// BACKEND_DIR, за замовчуванням ../drill-shop-backend поруч із цим репо.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const FRONT = path.resolve(__dirname, '../..');
const BACKEND = process.env.BACKEND_DIR || path.resolve(FRONT, '../drill-shop-backend');
const ORIGIN = 'https://ye-dril.com'; // апекс: www віддає 308, а редирект губить тіло POST
const TYPES = { '.glb': 'model/gltf-binary', '.jpg': 'image/jpeg', '.webp': 'image/webp' };

const parseArgs = (argv) =>
  Object.fromEntries(
    argv.map((a) => {
      const [k, ...v] = a.replace(/^--/, '').split('=');
      return [k, v.length ? v.join('=') : true];
    })
  );

const backendRequire = (m) => require(path.join(BACKEND, 'node_modules', m));
const prismaClient = () => {
  backendRequire('dotenv').config({ path: path.join(BACKEND, '.env'), quiet: true });
  const { PrismaClient } = backendRequire('@prisma/client');
  return new PrismaClient({ log: ['error'] });
};

// ---------- модель даних ----------
const buildRows = (config) =>
  config.collections.flatMap((c) =>
    c.products.map((p, i) => ({
      collection: c.slug,
      product: {
        slug: p.slug,
        sku: p.slug,
        name: p.name,
        price: c.price,
        unit: 'PIECE',
        productType: 'CLOTHING',
        status: 'ACTIVE',
        hasVariants: true,
        collectionOrder: i + 1,
        model3dPath: c.model3dPath,
        texture3dUrl: p.texture3dUrl,
        switcherSwatch: p.swatch,
        badgeText: config.badge?.badgeText ?? null,
        badgeColor: config.badge?.badgeColor ?? null,
        labelText: null,
        labelColor: null,
      },
      variants: config.sizes.map((size, k) => ({
        sku: `${p.slug}-${size.toLowerCase()}`,
        // Імʼя товару, не розміру: кошик і чекаут показують variant.name || product.name
        name: p.name,
        price: c.price,
        options: { size },
        sortOrder: k + 1, // перший розмір першим: легасі /catalog/[slug] автообирає variants[0]
      })),
    }))
  );

const assetUrls = (rows) => {
  const urls = new Set();
  for (const r of rows) {
    urls.add(r.product.texture3dUrl);
    if (r.product.model3dPath) urls.add(r.product.model3dPath);
  }
  return [...urls];
};

const localAssetReport = (rows) =>
  assetUrls(rows).map((u) => {
    const rel = path.join('public', u);
    let tracked = false;
    try {
      execFileSync('git', ['-C', FRONT, 'ls-files', '--error-unmatch', rel], { stdio: 'ignore' });
      tracked = true;
    } catch {}
    return { url: u, exists: fs.existsSync(path.join(FRONT, rel)), gitTracked: tracked };
  });

const probe = async (origin, rows) => {
  const out = [];
  for (const u of assetUrls(rows)) {
    try {
      const res = await fetch(origin + u, { method: 'HEAD', redirect: 'manual' });
      const type = res.headers.get('content-type') || '';
      const ok = res.status === 200 && type.startsWith(TYPES[path.extname(u)] ?? 'image/');
      out.push({ url: u, status: res.status, type, ok });
    } catch (e) {
      out.push({ url: u, status: 'ERR ' + e.message, ok: false });
    }
  }
  return out;
};

// ---------- фази ----------
function printPlan(ctx) {
  const { config, rows, qty } = ctx;
  console.log(`PLAN (без БД). createdAt=${config.backdate ?? 'now'} qty=${qty}`);
  for (const c of config.collections) {
    console.log(`\nКОЛЕКЦІЯ ${c.slug} «${c.title}» sortOrder=${c.sortOrder} label=${c.labelText ?? '—'}`);
    for (const { product: p } of rows.filter((x) => x.collection === c.slug)) {
      console.log(
        `  #${p.collectionOrder} ${p.slug} «${p.name}» ${p.price} грн | model=${p.model3dPath ?? 'tshirt.glb'} | tex=${p.texture3dUrl} | ${config.sizes.join('/')} | badge=${p.badgeText ?? '—'}`
      );
    }
  }
  console.log(
    `\nРАЗОМ: ${config.collections.length} кол., ${rows.length} товарів, ${rows.length * config.sizes.length} варіантів`
  );
}

async function check(ctx, prisma) {
  const { config, rows } = ctx;
  const slugs = rows.map((r) => r.product.slug);
  const skus = rows.flatMap((r) => r.variants.map((v) => v.sku));
  const report = {
    // Уся вітрина: щоб бачити сусідні sortOrder, а не лише колізії
    collections: await prisma.collection.findMany({
      where: { deletedAt: null },
      orderBy: { sortOrder: 'asc' },
      select: { slug: true, sortOrder: true, isActive: true, heroEnabled: true },
    }),
    existingProducts: await prisma.product.findMany({
      where: { OR: [{ slug: { in: slugs } }, { sku: { in: slugs } }] },
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
    localAssets: localAssetReport(rows),
  };
  if (ctx.probeOrigin) report.probe = await probe(ctx.probeOrigin, rows);
  console.log(JSON.stringify(report, null, 2));
}

async function upsertCollections(tx, config) {
  const ids = {};
  for (const c of config.collections) {
    const data = {
      title: c.title,
      description: c.description,
      sortOrder: c.sortOrder,
      heroEnabled: true,
      labelText: c.labelText ?? null,
      labelColor: c.labelColor ?? null,
    };
    // update НЕ чіпає isActive: повторний create після activate нічого не ховає.
    // «Темноту» дає isActive=false, а не heroEnabled.
    const col = await tx.collection.upsert({
      where: { slug: c.slug },
      update: data,
      create: { slug: c.slug, ...data, isActive: false },
    });
    ids[c.slug] = col.id;
  }
  return ids;
}

async function create(ctx, prisma) {
  const { config, rows, qty } = ctx;
  await prisma.$transaction(
    async (tx) => {
      const colIds = await upsertCollections(tx, config);
      for (const r of rows) {
        const { slug, ...data } = r.product;
        const collectionId = colIds[r.collection];
        const dark = {
          isActive: false,
          // Сток живе у варіантах; product.quantity>0 відкрив би кошик без variantId
          quantity: 0,
          publishedAt: new Date(),
          ...(config.backdate ? { createdAt: new Date(config.backdate) } : {}),
        };
        const prod = await tx.product.upsert({
          where: { slug },
          update: { ...data, collectionId }, // без isActive/quantity/createdAt
          create: { slug, ...data, collectionId, ...dark },
        });
        for (const v of r.variants) {
          const { sku, ...fields } = v;
          await tx.productVariant.upsert({
            where: { sku },
            update: { ...fields, isActive: true }, // сток повторний create не чіпає
            create: { productId: prod.id, sku, ...fields, quantity: qty, isActive: true },
          });
        }
        console.log(`  ✓ ${slug} «${r.product.name}» (${r.variants.length} розміри)`);
      }
    },
    { timeout: 120_000 }
  );
}

const imageRows = (productId, name, up) =>
  [
    {
      url: up.front.secure_url,
      publicId: up.front.public_id,
      kind: 'photo',
      altText: `${name} — перед`,
      sortOrder: 0,
      isPrimary: true,
    },
    {
      url: up.back.secure_url,
      publicId: up.back.public_id,
      kind: 'photo',
      altText: `${name} — спина`,
      sortOrder: 1,
      isSecondary: true,
    },
    {
      url: up.render3d.secure_url,
      publicId: up.render3d.public_id,
      kind: 'render3d',
      altText: `${name} — 3D-рендер`,
      sortOrder: 10,
    },
  ].map((row) => ({ productId, ...row }));

/** --only=slug1,slug2 → масив; без прапорця — порожній (фаза бере всі товари конфігу) */
const onlySlugs = (ctx) =>
  typeof ctx.args.only === 'string' ? ctx.args.only.split(',').filter(Boolean) : [];

async function images(ctx, prisma) {
  const dir = typeof ctx.args.dir === 'string' ? ctx.args.dir : null;
  if (!dir) throw new Error('--dir=<тека з <slug>-front.jpg, <slug>-back.jpg, <slug>-render3d.webp>');
  const { v2: cloudinary } = backendRequire('cloudinary');
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  const upload = (file, public_id) =>
    cloudinary.uploader.upload(file, { public_id, overwrite: true, resource_type: 'image' });
  const only = onlySlugs(ctx);
  for (const { product } of ctx.rows.filter((r) => !only.length || only.includes(r.product.slug))) {
    const s = product.slug;
    const files = { front: `${s}-front.jpg`, back: `${s}-back.jpg`, render3d: `${s}-render3d.webp` };
    const missing = Object.values(files).filter((f) => !fs.existsSync(path.join(dir, f)));
    console.log(`  ${s}: ${missing.length ? 'БРАКУЄ ' + missing.join(', ') : 'усі 3 файли на місці'}`);
    if (!ctx.apply) continue;
    if (missing.length) throw new Error(`${s}: бракує ${missing.join(', ')}`);
    const prod = await prisma.product.findUnique({ where: { slug: s }, select: { id: true } });
    if (!prod) throw new Error(`${s}: нема в БД — спершу --phase=create`);
    // Ті самі public_id і sortOrder, що в 3d/pipeline/upload-render3d.mjs і upload-photos.mjs
    const up = {
      front: await upload(path.join(dir, files.front), `products/${s}-front`),
      back: await upload(path.join(dir, files.back), `products/${s}-back`),
      render3d: await upload(path.join(dir, files.render3d), `drill/render3d/${s}`),
    };
    await prisma.$transaction([
      prisma.productImage.deleteMany({ where: { productId: prod.id, kind: { in: ['render3d', 'photo'] } } }),
      prisma.productImage.createMany({ data: imageRows(prod.id, product.name, up) }),
    ]);
    console.log(`    ↑ ${up.front.width}x${up.front.height} перед, ${up.back.width}x${up.back.height} спина`);
  }
}

async function gate(ctx, prisma) {
  const { config, rows } = ctx;
  const slugs = rows.map((r) => r.product.slug);
  const probed = await probe(ctx.probeOrigin, rows);
  const prods = await prisma.product.findMany({
    where: { slug: { in: slugs } },
    select: {
      slug: true,
      model3dPath: true,
      images: { select: { kind: true, isPrimary: true } },
      variants: { where: { isActive: true }, orderBy: { sortOrder: 'asc' }, select: { options: true } },
    },
  });
  const expectedModel = Object.fromEntries(rows.map((r) => [r.product.slug, r.product.model3dPath]));
  const sizes = config.sizes.join('/');
  return {
    badAssets: probed.filter((p) => !p.ok),
    missingProducts: slugs.filter((s) => !prods.some((p) => p.slug === s)),
    noRender3d: prods.filter((p) => !p.images.some((i) => i.kind === 'render3d')).map((p) => p.slug),
    noPrimaryPhoto: prods
      .filter((p) => !p.images.some((i) => i.kind === 'photo' && i.isPrimary))
      .map((p) => p.slug),
    // «шлях віддає 200» тут замало: чужа модель теж 200, а принт на неї не ляже
    wrongModel: prods.filter((p) => p.model3dPath !== expectedModel[p.slug]).map((p) => p.slug),
    wrongSizes: prods
      .filter((p) => p.variants.map((v) => v.options?.size).join('/') !== sizes)
      .map((p) => p.slug),
  };
}

async function activate(ctx, prisma) {
  if (!ctx.probeOrigin)
    throw new Error(`activate вимагає --probe=${ORIGIN} (асети мають віддаватись фронтом)`);
  const result = await gate(ctx, prisma);
  console.log(JSON.stringify({ gate: result }, null, 2));
  if (Object.values(result).some((v) => v.length)) throw new Error('ГЕЙТ НЕ ПРОЙДЕНО — нічого не змінено');
  if (!ctx.apply) return console.log('DRY: гейт пройдено; з --apply увімкнуло б колекції й товари');
  await setActive(ctx, prisma, true);
  console.log('Далі: --phase=revalidate');
}

async function revalidate(ctx) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) throw new Error('REVALIDATE_SECRET не задано');
  for (const { product } of ctx.rows) {
    if (!ctx.apply) {
      console.log(`DRY: POST ${ORIGIN}/api/revalidate {create, ${product.slug}}`);
      continue;
    }
    const res = await fetch(`${ORIGIN}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-revalidate-secret': secret },
      body: JSON.stringify({ event: 'create', slug: product.slug }),
    });
    const body = await res.json().catch(() => ({}));
    console.log(`  ${product.slug}: ${res.status} revalidated=${body.revalidated}`);
    if (!body.revalidated) process.exitCode = 1;
  }
}

async function setActive(ctx, prisma, value) {
  const slugs = ctx.rows.map((r) => r.product.slug);
  const collections = ctx.config.collections.map((c) => c.slug);
  if (!ctx.apply)
    return console.log(`DRY: isActive=${value} для ${collections.length} кол. і ${slugs.length} товарів`);
  await prisma.$transaction([
    prisma.product.updateMany({ where: { slug: { in: slugs } }, data: { isActive: value } }),
    prisma.collection.updateMany({ where: { slug: { in: collections } }, data: { isActive: value } }),
  ]);
  console.log(`isActive=${value}`);
}

async function stock(ctx, prisma) {
  const { qty } = ctx;
  if (!Number.isInteger(qty) || qty < 0) throw new Error('--qty=<ціле ≥0>');
  const skus = ctx.rows.flatMap((r) => r.variants.map((v) => v.sku));
  if (!ctx.apply)
    return console.log(`DRY: quantity=${qty} для ${skus.length} варіантів (product.quantity лишається 0)`);
  const res = await prisma.productVariant.updateMany({
    where: { sku: { in: skus } },
    data: { quantity: qty },
  });
  console.log(`quantity=${qty} для ${res.count} варіантів`);
}

async function retire(ctx, prisma) {
  const suffix = `-deleted-${Date.now()}`; // конвенція ProductRepository.delete
  if (!ctx.apply) return console.log(`DRY: мʼяке видалення з суфіксом ${suffix}`);
  await prisma.$transaction(
    async (tx) => {
      for (const { product } of ctx.rows) {
        const p = await tx.product.findUnique({
          where: { slug: product.slug },
          select: { id: true, sku: true },
        });
        if (!p) continue;
        const gone = { isActive: false, deletedAt: new Date() };
        await tx.product.update({
          where: { id: p.id },
          data: { sku: p.sku + suffix, slug: product.slug + suffix, ...gone },
        });
        const variants = await tx.productVariant.findMany({
          where: { productId: p.id },
          select: { id: true, sku: true },
        });
        for (const v of variants)
          await tx.productVariant.update({
            where: { id: v.id },
            data: { sku: v.sku + suffix, isActive: false },
          });
      }
      // Коду мʼякого видалення колекцій нема — дзеркалимо товарну конвенцію
      for (const c of ctx.config.collections)
        await tx.collection.updateMany({
          where: { slug: c.slug },
          data: { slug: c.slug + suffix, isActive: false, deletedAt: new Date() },
        });
    },
    { timeout: 120_000 }
  );
  console.log('мʼяко видалено');
}

async function purge(ctx, prisma) {
  const only = onlySlugs(ctx);
  if (!only.length) throw new Error('purge вимагає --only=slug1,slug2 — усе підряд не видаляється');
  const owned = ctx.config.collections.map((c) => c.slug);
  const found = await prisma.product.findMany({
    where: { slug: { in: only } },
    select: {
      id: true,
      slug: true,
      name: true,
      collection: { select: { slug: true } },
      _count: { select: { variants: true, images: true, cartItems: true, orderItems: true, reviews: true } },
    },
  });
  console.log(
    JSON.stringify(
      found.map(({ id, ...rest }) => rest),
      null,
      2
    )
  );
  const missing = only.filter((slug) => !found.some((p) => p.slug === slug));
  const foreign = found.filter((p) => !owned.includes(p.collection?.slug)).map((p) => p.slug);
  const ordered = found.filter((p) => p._count.orderItems > 0).map((p) => p.slug);
  if (missing.length) throw new Error(`нема в БД: ${missing.join(', ')}`);
  if (foreign.length) throw new Error(`не з колекцій цього скрипта: ${foreign.join(', ')}`);
  if (ordered.length)
    throw new Error(`є в замовленнях, жорстко не видаляється (є retire): ${ordered.join(', ')}`);
  if (!ctx.apply) return console.log(`DRY: жорстко видалило б ${found.length} товар(и) з усім каскадом`);
  await prisma.$transaction(found.map((p) => prisma.product.delete({ where: { id: p.id } })));
  console.log(`видалено назавжди: ${found.map((p) => p.slug).join(', ')}`);
}

const DB_PHASES = {
  check,
  create,
  images,
  activate,
  stock,
  retire,
  purge,
  deactivate: (ctx, prisma) => setActive(ctx, prisma, false),
};

/** config: { confirm, sizes, badge, backdate, collections: [{ slug, title, description, sortOrder,
 *  labelText, labelColor, price, model3dPath, products: [{ slug, name, swatch, texture3dUrl }] }] } */
async function run(config, argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  if (args.apply && args.confirm !== config.confirm) {
    console.error(`--apply без --confirm=${config.confirm} ігнорується: це прод-БД.`);
    process.exit(2);
  }
  const ctx = {
    config,
    args,
    rows: buildRows(config),
    apply: args.apply === true && args.confirm === config.confirm,
    qty: args.qty !== undefined ? Number(args.qty) : 0,
    probeOrigin: typeof args.probe === 'string' ? args.probe.replace(/\/+$/, '') : null,
  };
  const phase = args.phase || 'plan';
  if (phase === 'plan' || (phase === 'create' && !ctx.apply)) return printPlan(ctx);
  if (phase === 'revalidate') return revalidate(ctx);
  if (!DB_PHASES[phase]) throw new Error(`невідома фаза ${phase}`);
  const prisma = prismaClient();
  try {
    console.log(`PHASE=${phase} ${ctx.apply ? 'APPLY (ПИШЕ В ПРОД)' : 'DRY-RUN'}`);
    await DB_PHASES[phase](ctx, prisma);
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = {
  run: (config, argv) =>
    run(config, argv).catch((e) => {
      console.error('ПОМИЛКА:', e.message);
      process.exitCode = 1;
    }),
};
