/* eslint-disable no-console */
// Catalog photos the seed script uploads to Cloudinary: <slug>-front.jpg, <slug>-back.jpg and
// <slug>-render3d.webp. Run after scripts/radio-tsybulia/render-posters.py.
//
// Both tees share the chest logo, so the render3d image (the switcher card and collection cover)
// is the back view: that is where the two products differ.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const FRONT = path.resolve(__dirname, '../..');
const RENDERS = path.join(FRONT, '3d/artists/radio-tsybulia/renders');
const CATALOG = path.join(FRONT, '3d/artists/radio-tsybulia/catalog-images');
const manifest = require('../../src/shared/config/radio-tsybulia.json');

// Same crop as scripts/new-merch/prepare-products.cjs: the 1000² render → 960×1200 product photo
const photo = (file, out) =>
  sharp(file)
    .extract({ left: 100, top: 0, width: 800, height: 1000 })
    .resize(960, 1200)
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: 92 })
    .toFile(out);

(async () => {
  fs.mkdirSync(CATALOG, { recursive: true });
  for (const product of manifest.products) {
    // texture3dUrl bakes in the first chest colour; the renders are named <tee>-<colour>-<side>.png
    const stem = `${path.basename(product.mapUrl.split('?')[0], '.webp')}-rozheva`;
    const render = (side) => path.join(RENDERS, `${stem}-${side}.png`);
    const out = (name) => path.join(CATALOG, `${product.slug}-${name}`);
    await photo(render('front'), out('front.jpg'));
    await photo(render('back'), out('back.jpg'));
    await sharp(render('back')).webp({ quality: 92 }).toFile(out('render3d.webp'));
    console.log(`${product.slug}: front/back photos, render3d (back view)`);
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
