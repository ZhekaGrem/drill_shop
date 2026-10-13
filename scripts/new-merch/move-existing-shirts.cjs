/* eslint-disable no-console */
// Preserve existing product IDs, variants, artwork, prices and order history.
const path = require('node:path');
const backend = path.resolve(__dirname, '../../../drill-shop-backend');
require(path.join(backend, 'node_modules/dotenv')).config({
  path: path.join(backend, '.env'),
  quiet: true,
});
const { PrismaClient } = require(path.join(backend, 'node_modules/@prisma/client'));
const prisma = new PrismaClient();
const slugs = ['nirvana-runic', 'rdg'];
const destination = 'prokliatyi-new-tshirt';

async function main() {
  await prisma.$transaction(async (tx) => {
    const collection = await tx.collection.findUniqueOrThrow({ where: { slug: destination } });
    const products = await tx.product.findMany({
      where: { slug: { in: slugs } },
      include: { variants: true },
    });
    if (products.length !== slugs.length || !collection.isActive || collection.deletedAt)
      throw new Error('Missing products or inactive destination');
    for (const [index, slug] of slugs.entries()) {
      const product = products.find((p) => p.slug === slug);
      if (!product.isActive || product.deletedAt) throw new Error(`Inactive product: ${slug}`);
      if (process.argv.includes('--apply')) {
        await tx.product.update({
          where: { id: product.id },
          data: { collectionId: collection.id, collectionOrder: 11 + index },
        });
        // Legacy RDG variants kept the size as their name with empty options.
        // Cart/checkout display the variant name, so restore the product name
        // and store the size in its dedicated option without changing stock.
        for (const variant of product.variants) {
          if (!variant.options?.size && /^(S|M|L|XL|XXL|XXXL)$/.test(variant.name)) {
            await tx.productVariant.update({
              where: { id: variant.id },
              data: { name: product.name, options: { ...variant.options, size: variant.name } },
            });
          }
        }
      }
      console.log(`${slug} → ${destination}, position ${11 + index}`);
    }
  });
  const rows = await prisma.product.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, collectionOrder: true, collection: { select: { slug: true } } },
  });
  if (process.argv.includes('--apply') && rows.some((p) => p.collection.slug !== destination))
    throw new Error('Collection transfer verification failed');
  console.log(JSON.stringify(rows));
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
