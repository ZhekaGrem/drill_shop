/* eslint-disable no-console */
// Колекції «Злипні» в прод-БД: «Футболярчики» (tshirt.glb) і «Бобаночки» (hoodie-3.glb), розміри
// S–XXL по 100 штук. Товари бере з scripts/zlypni/catalog.json — його пише import-uv.py.
// Фази й запобіжники — scripts/lib/seed-collections.cjs. Будь-який запис: --apply --confirm=zlypni
//
// Порядок (повністю — docs/zlypni.md): import-uv.py → render-posters.py → publish-images.cjs →
//   create → images --dir=3d/artists/zlypni/catalog-images → деплой фронта з ZLYPNI_LIVE=true →
//   activate --probe=https://ye-dril.com
const catalog = require('./catalog.json');
const { run } = require('../lib/seed-collections.cjs');

const MODEL = { tshirt: null, hoodie: '/3d/models/hoodie-3.glb' }; // null — дефолтна tshirt.glb

const unpriced = catalog.collections.filter((c) => c.products.length && !c.price).map((c) => c.title);
if (unpriced.length) throw new Error(`Нема ціни: ${unpriced.join(', ')} — вкажіть price у catalog.json`);

const config = {
  confirm: 'zlypni',
  sizes: catalog.sizes,
  stockBySize: Object.fromEntries(catalog.sizes.map((size) => [size, catalog.stockPerSize])),
  collections: catalog.collections
    .filter((c) => c.products.length)
    .map((c, i) => ({
      slug: c.slug,
      title: c.title,
      description: c.description,
      sortOrder: 110 + i, // після «є. ***» (102–103)
      price: c.price,
      model3dPath: MODEL[c.garment],
      products: c.products.map((p) => ({
        slug: p.slug,
        name: p.name,
        swatch: '#080808',
        texture3dUrl: p.texture3dUrl,
      })),
    })),
};

module.exports = config;
if (require.main === module) run(config);
