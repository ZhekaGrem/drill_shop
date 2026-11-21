/* eslint-disable no-console */
// Переносить фінальні комплекти дизайнерів («злипні дизайн») у формати сайту:
//   3D/текстура-4096.webp → public/3d/textures/zlypni/<stem>.webp і ?v=хеш у zlypni-merch.json;
//   3D/3D-перед.png, 3D-спина.png → 3d/artists/zlypni/merch/catalog-images/<slug>-{front,back}.jpg
//     і <slug>-render3d.webp — для фази images у create-collection.cjs;
//   відео/оберт.webp, постер.webp → 3d/artists/zlypni/merch/turntables/<slug>.webp, <slug>-poster.webp
//     — для 3d/pipeline/upload-turntables.mjs.
// Спершу перевіряє ВСІ комплекти, потім пише: GLB комплекту має бути геометрією сайтової моделі
// (текстура з чужої розгортки на модель не ляже), а файли — у сайтових розмірах (оберт іншого
// формату зламає картку). Будь-яка розбіжність — помилка з назвою комплекту, нічого не записано.
//   node scripts/zlypni/import-kits.cjs [--kits="../злипні дизайн "] [--manifest=src/shared/config/zlypni-merch.json]
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const FRONT = path.resolve(__dirname, '../..');
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, ...v] = a.replace(/^--/, '').split('=');
    return [k, v.join('=')];
  })
);
const KITS = path.resolve(FRONT, args.kits || '../злипні дизайн ');
const MANIFEST = path.resolve(FRONT, args.manifest || 'src/shared/config/zlypni-merch.json');
const TEXTURES = path.join(FRONT, 'public/3d/textures/zlypni');
const CARDS = path.join(FRONT, '3d/artists/zlypni/merch/catalog-images');
const TURNTABLES = path.join(FRONT, '3d/artists/zlypni/merch/turntables');

// Геометрія сайтових моделей (public/3d/models/tshirt.glb, hoodie-3.glb): mesh і кількість вершин
const MESH = {
  tshirt: { name: 'T28 Oversized Tshirt', vertices: 44818 },
  hoodie: { name: 'HoodieShape.002', vertices: 35066 },
};
const TEXTURE_PX = 4096;
const TURNTABLE = { width: 480, height: 600, frames: 48 };

const expect = (ok, message) => {
  if (!ok) throw new Error(message);
};

/** mesh і вершини з JSON-чанка GLB; бінарний чанк не читається */
const glbMesh = (file) => {
  const buf = fs.readFileSync(file);
  expect(buf.toString('latin1', 0, 4) === 'glTF', `${file}: не GLB`);
  const gltf = JSON.parse(buf.toString('utf8', 20, 20 + buf.readUInt32LE(12)));
  const vertices = gltf.meshes
    .flatMap((m) => m.primitives)
    .reduce((n, p) => n + gltf.accessors[p.attributes.POSITION].count, 0);
  return { name: gltf.meshes[0]?.name, vertices };
};

const kitFiles = (kit) => ({
  glb: path.join(kit, '3D/модель.glb'),
  texture: path.join(kit, '3D/текстура-4096.webp'),
  front: path.join(kit, '3D/3D-перед.png'),
  back: path.join(kit, '3D/3D-спина.png'),
  turntable: path.join(kit, 'відео/оберт.webp'),
  poster: path.join(kit, 'відео/постер.webp'),
});

const checkKit = async (kit, garment) => {
  const files = kitFiles(kit);
  for (const f of Object.values(files)) expect(fs.existsSync(f), `${f}: нема файлу`);
  const mesh = glbMesh(files.glb);
  const want = MESH[garment];
  expect(
    mesh.name === want.name && mesh.vertices === want.vertices,
    `${kit}: mesh ${mesh.name} (${mesh.vertices} вершин) ≠ ${want.name} (${want.vertices}) — чужа геометрія`
  );
  const texture = await sharp(files.texture).metadata();
  expect(
    texture.width === TEXTURE_PX && texture.height === TEXTURE_PX,
    `${files.texture}: ${texture.width}×${texture.height}, треба ${TEXTURE_PX}²`
  );
  const turn = await sharp(files.turntable).metadata();
  const frameHeight = turn.pageHeight ?? turn.height;
  expect(
    turn.width === TURNTABLE.width && frameHeight === TURNTABLE.height && turn.pages === TURNTABLE.frames,
    `${files.turntable}: ${turn.width}×${frameHeight} × ${turn.pages} кадрів, треба 480×600 × 48`
  );
  const poster = await sharp(files.poster).metadata();
  expect(
    poster.width === TURNTABLE.width && poster.height === TURNTABLE.height,
    `${files.poster}: ${poster.width}×${poster.height}, треба 480×600`
  );
};

const importKit = async (kit, product) => {
  const files = kitFiles(kit);
  const { slug } = product;
  const stem = slug.replace(/^zlypni-/, '');
  const texture = path.join(TEXTURES, `${stem}.webp`);
  fs.copyFileSync(files.texture, texture);
  const hash = crypto.createHash('sha256').update(fs.readFileSync(texture)).digest('hex').slice(0, 12);
  product.mapUrl = `/3d/textures/zlypni/${stem}.webp?v=${hash}`;

  // Той самий формат, що в scripts/zlypni/publish-images.cjs: фото 960×1200 на білому, render3d — квадрат
  for (const [side, file] of [
    ['front', files.front],
    ['back', files.back],
  ]) {
    await sharp(file)
      .flatten({ background: '#ffffff' })
      .resize(960, 1200)
      .jpeg({ quality: 92 })
      .toFile(path.join(CARDS, `${slug}-${side}.jpg`));
  }
  await sharp(files.front)
    .resize(1000, 1000, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 92 })
    .toFile(path.join(CARDS, `${slug}-render3d.webp`));

  fs.copyFileSync(files.turntable, path.join(TURNTABLES, `${slug}.webp`));
  fs.copyFileSync(files.poster, path.join(TURNTABLES, `${slug}-poster.webp`));

  const kb = (f) => `${Math.round(fs.statSync(f).size / 1024)} КБ`;
  console.log(`OK ${slug.padEnd(30)} текстура ${kb(texture)}, оберт ${kb(files.turntable)}`);
};

(async () => {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const jobs = manifest.collections.flatMap((c) =>
    c.products.map((product) => ({ kit: path.join(KITS, product.kit), garment: c.garment, product }))
  );
  for (const job of jobs) await checkKit(job.kit, job.garment);
  for (const dir of [TEXTURES, CARDS, TURNTABLES]) fs.mkdirSync(dir, { recursive: true });
  for (const job of jobs) await importKit(job.kit, job.product);
  // У форматі Prettier репозиторію, щоб pre-commit hook не переписував маніфест після кожного запуску
  const prettier = require('prettier');
  const options = await prettier.resolveConfig(MANIFEST);
  fs.writeFileSync(MANIFEST, await prettier.format(JSON.stringify(manifest), { ...options, parser: 'json' }));
  console.log(`${jobs.length} товарів; mapUrl записано в ${path.relative(FRONT, MANIFEST)}`);
})().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
