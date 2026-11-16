/* eslint-disable no-console */
// Фото для карток, які seed-скрипт (--phase=images) вантажить у Cloudinary:
// <slug>-front.jpg, <slug>-back.jpg і <slug>-render3d.webp. Запускати після render-posters.py.
// render3d — вигляд спереду: мініатюра в перемикачі й обкладинка колекції.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const FRONT = path.resolve(__dirname, '../..');
const RENDERS = path.join(FRONT, '3d/artists/zlypni/renders');
const OUT = path.join(FRONT, '3d/artists/zlypni/catalog-images');
const catalog = require('./catalog.json');

// Той самий кроп, що в scripts/new-merch/prepare-products.cjs: рендер 1000² → фото 960×1200
const photo = (file, out) =>
  sharp(file)
    .extract({ left: 100, top: 0, width: 800, height: 1000 })
    .resize(960, 1200)
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: 92 })
    .toFile(out);

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const { products } of catalog.collections) {
    for (const { slug } of products) {
      const render = (side) => path.join(RENDERS, `${slug}-${side}.png`);
      const out = (name) => path.join(OUT, `${slug}-${name}`);
      await photo(render('front'), out('front.jpg'));
      await photo(render('back'), out('back.jpg'));
      await sharp(render('front')).webp({ quality: 92 }).toFile(out('render3d.webp'));
    }
    console.log(`${products.length} товарів: фото переду й спини, render3d`);
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
