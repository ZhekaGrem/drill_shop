/* eslint-disable no-console */
// node scripts/keychains/create-collection.cjs --check
// node scripts/keychains/create-collection.cjs --apply --confirm=brilok
// Add-only: refuses collisions, never resets existing stock.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const config = require('./collection.json');
const root = process.env.FRONTEND_DIR || path.resolve(__dirname, '../..');
const back = process.env.BACKEND_DIR || path.resolve(root, '../drill-shop-backend');
const dependency = (n) => require(path.join(back, 'node_modules', n));
dependency('dotenv').config({ path: path.join(back, '.env'), quiet: true });
const { PrismaClient } = dependency('@prisma/client');
const db = new PrismaClient();
const args = new Set(process.argv.slice(2));
async function main() {
  const existing = await db.collection.findUnique({
    where: { slug: config.slug },
    include: { products: { include: { variants: true, images: true } } },
  });
  const collisions = await db.product.findMany({
    where: {
      OR: [
        { slug: { in: config.products.map((p) => p.slug) } },
        { sku: { in: config.products.map((p) => p.slug) } },
      ],
    },
    select: { slug: true },
  });
  if (args.has('--check')) {
    console.log(
      JSON.stringify(
        {
          collection: existing && {
            slug: existing.slug,
            title: existing.title,
            isActive: existing.isActive,
            heroEnabled: existing.heroEnabled,
            products: existing.products.map((p) => ({
              slug: p.slug,
              price: p.price,
              model: p.model3dPath,
              images: p.images.length,
              variants: p.variants.map((v) => ({
                size: v.options.size,
                color: v.options.color,
                price: v.price,
                quantity: v.quantity,
              })),
            })),
          },
          collisions,
        },
        null,
        2
      )
    );
    return;
  }
  assert(args.has('--apply') && args.has('--confirm=brilok'), 'Writes need --apply --confirm=brilok');
  assert(!existing && !collisions.length, 'Already exists: inspect with --check; never overwrite stock');
  const { v2: cloudinary } = dependency('cloudinary');
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  const uploads = [];
  for (const p of config.products) {
    const modelFile = path.join(root, 'public/3d/models', p.slug + '.glb');
    const model = await cloudinary.uploader.upload(modelFile, {
      resource_type: 'raw',
      public_id: `products/${p.slug}/model-v1.glb`,
      overwrite: false,
    });
    // Assets are on the existing CDN, independent of Vercel deployment.
    const response = await fetch(model.secure_url);
    assert(response.ok, `Model unavailable: ${p.slug}`);
    const buf = Buffer.from(await response.arrayBuffer());
    assert.equal(buf.toString('utf8', 0, 4), 'glTF');
    assert.equal(buf.length, fs.statSync(modelFile).size);
    const images = [];
    for (const [i, kind] of ['render3d', 'photo'].entries()) {
      const file =
        kind === 'render3d'
          ? path.join(root, 'public/3d/posters', p.slug + '.webp')
          : path.join(root, 'public/assets/brilok', p.slug + '.jpg');
      const u = await cloudinary.uploader.upload(file, {
        public_id: `products/${p.slug}/${kind}-v1`,
        overwrite: false,
        resource_type: 'image',
      });
      images.push({
        url: u.secure_url,
        publicId: u.public_id,
        kind,
        altText: `${p.name} — ${kind === 'render3d' ? '3D-модель' : 'фото виробу'}`,
        sortOrder: i,
        isPrimary: kind === 'photo',
        isSecondary: false,
      });
    }
    uploads.push({ p, model: model.secure_url, images });
  }
  const last = await db.collection.aggregate({ where: { deletedAt: null }, _max: { sortOrder: true } });
  await db.$transaction(async (tx) => {
    const c = await tx.collection.create({
      data: {
        slug: config.slug,
        title: config.title,
        description: config.description,
        sortOrder: (last._max.sortOrder ?? 0) + 1,
        isActive: true,
        heroEnabled: true,
        labelText: 'новинка',
        labelColor: 'var(--gradient-brand)',
      },
    });
    for (const [index, { p, model, images }] of uploads.entries())
      await tx.product.create({
        data: {
          sku: p.slug,
          slug: p.slug,
          name: p.name,
          description: config.description,
          shortDescription: config.description,
          price: config.sizes[0].price,
          quantity: 0,
          unit: 'PIECE',
          productType: 'ACCESSORIES',
          status: 'ACTIVE',
          isActive: true,
          hasVariants: true,
          publishedAt: new Date(),
          collectionId: c.id,
          collectionOrder: index + 1,
          model3dPath: model,
          texture3dUrl: null,
          switcherSwatch: p.swatch,
          images: { create: images },
          variants: {
            create: config.sizes.map((s, i) => ({
              sku: `${p.slug}-${s.size.toLowerCase()}`,
              name: p.name,
              price: s.price,
              quantity: config.initialQuantity,
              options: { size: s.size, color: p.color },
              isActive: true,
              sortOrder: i + 1,
            })),
          },
        },
      });
  });
  console.log('Created brilok: 3 colors, 9 variants, L/XL/XXL 350/420/550 UAH, 100 each.');
  const route = fs.readFileSync(path.join(root, 'src/app/api/revalidate/route.ts'), 'utf8');
  const secret = process.env.REVALIDATE_SECRET || route.match(/const REVALIDATE_SECRET = '([^']+)'/)?.[1];
  assert(secret, 'Created; revalidation secret missing');
  for (const p of config.products) {
    const res = await fetch('https://ye-dril.com/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-revalidate-secret': secret },
      body: JSON.stringify({ event: 'create', slug: p.slug }),
    });
    assert(res.ok && (await res.json()).revalidated, `Created; revalidation failed for ${p.slug}`);
  }
  console.log('Revalidated catalog and product pages.');
}
main()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
