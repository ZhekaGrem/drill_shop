/* eslint-disable no-console */
// Apply approved copy/prices/order only. Preserve inventory, media and historical orders.
const path = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const config = require('./collection.json');
const back = path.resolve(root, '../drill-shop-backend');
const dep = (name) => require(path.join(back, 'node_modules', name));
dep('dotenv').config({ path: path.join(back, '.env'), quiet: true });
const { PrismaClient } = dep('@prisma/client');
const db = new PrismaClient();
const inventory = (products) =>
  products
    .flatMap((p) =>
      p.variants.map((v) => ({ id: v.id, quantity: v.quantity, reservedQuantity: v.reservedQuantity }))
    )
    .sort((a, b) => a.id.localeCompare(b.id));
async function main() {
  assert(process.argv.includes('--apply'), 'Requires --apply');
  const before = await db.product.findMany({
    where: { slug: { in: config.products.map((p) => p.slug) } },
    include: { variants: true },
  });
  assert.equal(before.length, 3);
  await db.$transaction(async (tx) => {
    const last = await tx.collection.aggregate({
      where: { deletedAt: null, slug: { not: config.slug } },
      _max: { sortOrder: true },
    });
    const collection = await tx.collection.update({
      where: { slug: config.slug },
      data: {
        title: config.title,
        description: config.description,
        sortOrder: (last._max.sortOrder ?? 0) + 1,
        heroEnabled: true,
        isActive: true,
      },
    });
    for (const p of config.products) {
      const product = before.find((row) => row.slug === p.slug);
      assert.equal(product.collectionId, collection.id);
      assert.equal(product.variants.length, 3);
      await tx.product.update({
        where: { id: product.id },
        data: {
          name: p.name,
          description: config.description,
          shortDescription: config.description,
          price: config.sizes[0].price,
        },
      });
      for (const size of config.sizes) {
        const variant = product.variants.find((v) => v.options.size === size.size);
        assert(variant);
        await tx.productVariant.update({
          where: { id: variant.id },
          data: { name: p.name, price: size.price, options: { ...variant.options, color: p.color } },
        });
      }
    }
  });
  const after = await db.product.findMany({
    where: { slug: { in: config.products.map((p) => p.slug) } },
    include: { variants: true },
  });
  assert.deepEqual(inventory(after), inventory(before));
  for (const p of after) {
    const expected = config.products.find((row) => row.slug === p.slug);
    assert.equal(p.name, expected.name);
    for (const v of p.variants)
      assert.equal(Number(v.price), config.sizes.find((s) => s.size === v.options.size).price);
  }
  const last = await db.collection.findFirst({
    where: { deletedAt: null, isActive: true, heroEnabled: true },
    orderBy: { sortOrder: 'desc' },
  });
  assert.equal(last.slug, config.slug);
  const route = fs.readFileSync(path.join(root, 'src/app/api/revalidate/route.ts'), 'utf8');
  const secret = process.env.REVALIDATE_SECRET || route.match(/const REVALIDATE_SECRET = '([^']+)'/)?.[1];
  assert(secret);
  for (const p of config.products) {
    const res = await fetch('https://ye-dril.com/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-revalidate-secret': secret },
      body: JSON.stringify({ event: 'update', slug: p.slug }),
    });
    assert(res.ok && (await res.json()).revalidated);
  }
  console.log(
    JSON.stringify(
      {
        title: last.title,
        sortOrder: last.sortOrder,
        inventoryPreserved: true,
        products: after.map((p) => ({
          name: p.name,
          variants: p.variants.map((v) => ({ size: v.options.size, price: Number(v.price) })),
        })),
      },
      null,
      2
    )
  );
}
main()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
