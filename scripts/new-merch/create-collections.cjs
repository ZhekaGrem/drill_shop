/* eslint-disable no-console */
const merch = require('../../src/shared/config/new-merch.json');
const { run } = require('../lib/seed-collections.cjs');

const config = {
  confirm: 'new-merch',
  sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
  badge: {
    badgeText: 'виготовлення до 7 днів чувачки бо обстріли',
    badgeColor: '#2b9ad9',
  },
  backdate: '2025-11-01T00:00:00.000Z',
  // Activation replaces both old collections in the same transaction.
  retireCollections: ['prokliatyi-futbolky', 'prokliatyi-hudi'],
  retireProductSlugs: ['tee', 'hoodie'].flatMap((kind) =>
    Array.from({ length: 5 }, (_, i) => `prokliatyi-${kind}-${String(i + 1).padStart(2, '0')}`)
  ),
  collections: merch.collections.map((collection, i) => ({
    slug: collection.key,
    title: collection.title,
    description: collection.description,
    sortOrder: 102 + i,
    price: i === 0 ? 1200 : 2100,
    model3dPath: i === 0 ? null : collection.modelUrl,
    products: collection.items.map((item) => ({
      slug: item.key,
      name: item.label,
      swatch: '#080808',
      texture3dUrl: item.mapUrl,
    })),
  })),
};

module.exports = config;
if (require.main === module) run(config);
