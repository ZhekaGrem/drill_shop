/* eslint-disable no-console */
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const merch = require('../../src/shared/config/new-merch.json');
const FRONT = path.resolve(__dirname, '../..');
const RENDERS = path.join(FRONT, '3d/artists/prokliatyi/new-merch/renders');
const OUTPUT = path.join(FRONT, '3d/artists/prokliatyi/new-merch/catalog-images');

async function main() {
  fs.mkdirSync(OUTPUT, { recursive: true });
  for (const collection of merch.collections) {
    for (const item of collection.items) {
      const stem = path.basename(item.mapUrl.split('?')[0], '.webp');
      for (const side of ['front', 'back']) {
        await sharp(path.join(RENDERS, `${stem}-${side}.png`))
          .extract({ left: 100, top: 0, width: 800, height: 1000 })
          .resize(960, 1200)
          .flatten({ background: '#ffffff' })
          .jpeg({ quality: 92 })
          .toFile(path.join(OUTPUT, `${item.key}-${side}.jpg`));
      }
      fs.copyFileSync(
        path.join(FRONT, 'public', item.fallback.split('?')[0]),
        path.join(OUTPUT, `${item.key}-render3d.webp`)
      );
    }
  }
  console.log(
    `Prepared ${merch.collections.reduce((n, c) => n + c.items.length, 0)} products: front, back, 3D poster`
  );
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
