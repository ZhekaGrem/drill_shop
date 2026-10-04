/* eslint-disable no-console */
// Default is read-only. Create an inactive product, deploy assets, then activate.
// node scripts/scarf/create-scarf.cjs --phase=create --apply --confirm=khustynka-oksana
const fs = require('node:fs');
const path = require('node:path');
const config = require('../../src/shared/config/scarf-oksana.json');
const root = path.resolve(__dirname, '../..');
const backend = process.env.BACKEND_DIR || path.resolve(root, '../drill-shop-backend');
const dependency = (name) => require(path.join(backend, 'node_modules', name));
const args = Object.fromEntries(process.argv.slice(2).map((arg) => arg.replace(/^--/, '').split('=')));
const phase = args.phase || 'check';
const apply = process.argv.includes('--apply') && args.confirm === config.collectionSlug;
dependency('dotenv').config({ path: path.join(backend, '.env'), quiet: true });
const { PrismaClient } = dependency('@prisma/client');
const db = new PrismaClient();
const assets = [config.modelUrl, config.posterUrl, ...config.textureUrls];
const origin = 'https://ye-dril.com';

async function product() {
  return db.product.findUnique({
    where: { slug: config.slug },
    include: { variants: true, images: true, collection: true },
  });
}

async function main() {
  if (!['check', 'create', 'activate'].includes(phase)) throw new Error('Unknown phase');
  if (phase !== 'check' && !apply)
    throw new Error(`Write requires --apply --confirm=${config.collectionSlug}`);
  for (const asset of assets) {
    if (!fs.existsSync(path.join(root, 'public', asset))) throw new Error(`Missing ${asset}`);
  }
  const existing = await product();
  if (phase === 'check') {
    console.log(
      JSON.stringify(
        {
          product: existing && {
            slug: existing.slug,
            price: existing.price,
            quantity: existing.quantity,
            isActive: existing.isActive,
            variants: existing.variants.length,
            images: existing.images.length,
            collection: existing.collection?.slug,
          },
          collections: await db.collection.findMany({
            where: { deletedAt: null },
            select: { slug: true, sortOrder: true },
            orderBy: { sortOrder: 'asc' },
          }),
          categories: await db.category.findMany({
            where: { deletedAt: null },
            select: { slug: true, name: true },
          }),
          assets: assets.length,
        },
        null,
        2
      )
    );
    return;
  }
  if (phase === 'create') {
    if (existing)
      throw new Error('Product already exists; stock and images left unchanged. Use check or activate.');
    if (await db.collection.findUnique({ where: { slug: config.collectionSlug } }))
      throw new Error('Collection slug collision');
    const { v2: cloudinary } = dependency('cloudinary');
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    const images = [];
    for (const [index, asset] of [config.posterUrl, ...config.textureUrls].entries()) {
      const uploaded = await cloudinary.uploader.upload(path.join(root, 'public', asset), {
        public_id: `products/${config.slug}/${index === 0 ? 'render3d' : `print-${index}`}`,
        overwrite: false,
        resource_type: 'image',
      });
      images.push({
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
        kind: index === 0 ? 'render3d' : 'photo',
        altText: `${config.name} — ${index === 0 ? '3D' : `можливий принт ${index}`}`,
        sortOrder: index,
        isPrimary: index === 1,
        isSecondary: index === 2,
      });
    }
    const first = await db.collection.aggregate({ _min: { sortOrder: true } });
    await db.$transaction(async (tx) => {
      const collection = await tx.collection.create({
        data: {
          slug: config.collectionSlug,
          title: config.name,
          description: config.description,
          sortOrder: (first._min.sortOrder ?? 0) - 1,
          isActive: false,
          heroEnabled: true,
          labelText: 'новинка',
          labelColor: 'var(--gradient-brand)',
        },
      });
      await tx.product.create({
        data: {
          sku: config.slug,
          slug: config.slug,
          name: config.name,
          description: config.description,
          shortDescription: config.description,
          price: config.price,
          quantity: config.initialQuantity,
          unit: 'PIECE',
          productType: 'ACCESSORIES',
          status: 'ACTIVE',
          hasVariants: false,
          isActive: false,
          collectionId: collection.id,
          collectionOrder: 0,
          model3dPath: config.modelUrl,
          texture3dUrl: config.textureUrls[0],
          switcherSwatch: '#b9a082',
          labelText: 'новинка',
          labelColor: 'var(--gradient-brand)',
          images: { create: images },
        },
      });
    });
    console.log('Created inactive scarf: 777 UAH, 10 pieces, no variants, 9 images.');
    return;
  }
  if (
    !existing ||
    existing.collection?.slug !== config.collectionSlug ||
    existing.variants.length ||
    existing.hasVariants ||
    Number(existing.price) !== config.price ||
    existing.images.length !== 9
  )
    throw new Error('Product verification failed');
  for (const asset of assets) {
    const response = await fetch(origin + asset, { method: 'HEAD' });
    const type = response.headers.get('content-type') || '';
    if (!response.ok || !(asset.endsWith('.glb') ? type.includes('gltf') : type.startsWith('image/')))
      throw new Error(`Deployment asset failed: ${asset} (${response.status})`);
  }
  await db.$transaction([
    db.product.update({
      where: { id: existing.id },
      data: { isActive: true, publishedAt: existing.publishedAt || new Date() },
    }),
    db.collection.update({ where: { id: existing.collectionId }, data: { isActive: true } }),
  ]);
  const route = fs.readFileSync(path.join(root, 'src/app/api/revalidate/route.ts'), 'utf8');
  const secret = process.env.REVALIDATE_SECRET || route.match(/const REVALIDATE_SECRET = '([^']+)'/)?.[1];
  if (!secret) throw new Error('Activated; revalidation secret missing');
  const response = await fetch(`${origin}/api/revalidate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-revalidate-secret': secret },
    body: JSON.stringify({ event: 'create', slug: config.slug }),
  });
  if (!response.ok || !(await response.json()).revalidated)
    throw new Error(`Activated; revalidation failed (${response.status})`);
  console.log('Activated and revalidated. Stock preserved.');
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
