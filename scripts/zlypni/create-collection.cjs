/* eslint-disable no-console */
// Колекції розділу «є. Злипні» в прод-БД: «Футболляндручки» (tshirt.glb, 1300 грн) і «Боби»
// (hoodie-3.glb, 2300 грн), S–XXL по stockPerSize штук. Джерело — src/shared/config/zlypni-merch.json,
// у якому mapUrl заповнює scripts/zlypni/import-kits.cjs (він же готує фото карток і оберти).
// Фази й запобіжники — scripts/lib/seed-collections.cjs. Будь-який запис: --apply --confirm=zlypni
//
// Порядок (повністю — docs/zlypni.md): import-kits.cjs → push v2 (текстури на проді) →
//   create → images --dir=3d/artists/zlypni/merch/catalog-images → оберти (upload-turntables.mjs) →
//   activate --probe=https://ye-dril.com
const manifest = require('../../src/shared/config/zlypni-merch.json');
const { run } = require('../lib/seed-collections.cjs');

const MODEL = { tshirt: null, hoodie: '/3d/models/hoodie-3.glb' }; // null — дефолтна tshirt.glb

const unfilled = manifest.collections.flatMap((c) => c.products.filter((p) => !p.mapUrl).map((p) => p.slug));
if (unfilled.length) throw new Error(`Нема mapUrl: ${unfilled.join(', ')} — спершу import-kits.cjs`);

const config = {
  confirm: 'zlypni',
  sizes: manifest.sizes,
  stockBySize: Object.fromEntries(manifest.sizes.map((size) => [size, manifest.stockPerSize])),
  collections: manifest.collections.map((c, i) => ({
    slug: c.slug,
    title: c.title,
    description: c.description,
    sortOrder: 110 + i, // після «є. ***» (102–103) і брілка (104)
    price: c.price,
    model3dPath: MODEL[c.garment],
    products: c.products.map((p) => ({
      slug: p.slug,
      name: p.name,
      swatch: '#080808',
      texture3dUrl: p.mapUrl,
    })),
  })),
};

module.exports = config;
if (require.main === module) run(config);
