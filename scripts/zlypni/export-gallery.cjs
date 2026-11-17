/* eslint-disable no-console */
// Дані прихованої галереї «Злипні» (widgets/ZlypniGallery): назви, текстури й постери всіх дизайнів.
// Галерея не читає БД — товарів там немає (зняті з продажу 2026-11-17), тож усе, що вона показує,
// лежить у репозиторії: текстури з import-uv.py і постери, які цей скрипт стискає з render3d
// (publish-images.cjs) у public/zlypni/<колекція>/NNN.webp. Запускати після publish-images.cjs.
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const FRONT = path.resolve(__dirname, '../..');
const IMAGES = path.join(FRONT, '3d/artists/zlypni/catalog-images');
const OUT = path.join(FRONT, 'src/shared/config/zlypni-gallery.json');
const catalog = require('./catalog.json');

// Та сама модель, що в create-collection.cjs; футболка — дефолтна модель сцени, її не передаємо
const MODEL = { tshirt: undefined, hoodie: '/3d/models/hoodie-3.glb' };
const POSTER_SIZE = 640;

const contentHash = (buffer) => crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 12);

(async () => {
  const collections = [];
  for (const col of catalog.collections) {
    const dir = col.slug.replace(/^zlypni-/, '');
    fs.mkdirSync(path.join(FRONT, 'public/zlypni', dir), { recursive: true });
    const designs = [];
    for (const p of col.products) {
      const number = String(p.number).padStart(3, '0');
      const poster = await sharp(path.join(IMAGES, `${p.slug}-render3d.webp`))
        .resize(POSTER_SIZE, POSTER_SIZE)
        .webp({ quality: 80 })
        .toBuffer();
      fs.writeFileSync(path.join(FRONT, 'public/zlypni', dir, `${number}.webp`), poster);
      designs.push({
        key: p.slug,
        name: p.name,
        texture: p.texture3dUrl,
        poster: `/zlypni/${dir}/${number}.webp?v=${contentHash(poster)}`,
      });
    }
    collections.push({ key: col.slug, title: col.title, modelUrl: MODEL[col.garment], designs });
    console.log(`${col.title}: ${designs.length} постерів`);
  }
  fs.writeFileSync(OUT, `${JSON.stringify({ collections }, null, 2)}\n`);
  console.log(`→ ${path.relative(FRONT, OUT)}`);
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
