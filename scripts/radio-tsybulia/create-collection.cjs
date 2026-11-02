/* eslint-disable no-console */
// Колекція «Радіо Цибуля»: дві футболки на tshirt.glb, колір грудей випадковий (useChestCycle).
// Фази й прапорці — у scripts/lib/seed-collections.cjs. Будь-який запис:
//   --apply --confirm=radio-tsybulia
// Порядок: create → images --dir=3d/artists/radio-tsybulia/catalog-images → деплой фронта →
//   activate --probe=https://ye-dril.com → revalidate.
const manifest = require('../../src/shared/config/radio-tsybulia.json');
const { run } = require('../lib/seed-collections.cjs');

const config = {
  confirm: 'radio-tsybulia',
  sizes: Object.keys(manifest.stock),
  // Реальні залишки власника, 2026-11-02: по кожній футболці L 3, M 2, S 1
  stockBySize: manifest.stock,
  collections: [
    {
      slug: manifest.collection.slug,
      title: manifest.collection.title,
      description: manifest.collection.description,
      sortOrder: -2, // першою: хустинка стоїть на -1
      price: manifest.price,
      model3dPath: null, // дефолтна tshirt.glb
      products: manifest.products.map((product) => ({
        slug: product.slug,
        name: product.name,
        swatch: '#080808',
        texture3dUrl: product.mapUrl,
      })),
    },
  ],
};

module.exports = config;
if (require.main === module) run(config);
