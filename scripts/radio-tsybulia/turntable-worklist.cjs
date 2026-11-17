/* eslint-disable no-console */
// Worklist обертів (turntable) «Радіо Цибулі» для 3d/pipeline/batch-turntables.py:
//   node scripts/radio-tsybulia/turntable-worklist.cjs   → 3d/artists/radio-tsybulia/turntable-worklist.json
//
// Колір грудей випадковий, тож оберт картки показує всі п'ять, як і 3D-сцена товару. Сцена тримає
// колір 3,5 с — на картці це п'ять обертів і ~4 МБ. Тому оберт один, звичні 48 кадрів (як у решти
// футболок), а кольори змінюються по 4 кадри саме тоді, коли груди видно — у вікні ±10 кадрів
// навколо фронту. Кадр 0 (постер) — перший колір, як на фото й render3d товару.
const fs = require('node:fs');
const path = require('node:path');

const FRONT = path.resolve(__dirname, '../..');
const ATLASES = path.join(FRONT, '3d/artists/radio-tsybulia/atlases');
const OUT = path.join(FRONT, '3d/artists/radio-tsybulia/turntable-worklist.json');
const { products } = require('../../src/shared/config/radio-tsybulia.json');

const FRAMES = 48;
const STEP = 4;
// Порядок сцени (build-textures.py CHESTS) зі зсувом: на кадр 0 припадає перший колір — rozheva
const WINDOW = ['fioletova', 'bila', 'rozheva', 'zhovta', 'biruzova'];
const WINDOW_START = -(STEP * 2 + STEP / 2); // −10: rozheva займає кадри −2…1

const colourAt = (frame) => {
  const offset = ((frame - WINDOW_START + FRAMES) % FRAMES) / STEP;
  return WINDOW[Math.min(Math.floor(offset), WINDOW.length - 1)];
};

const worklist = products.map(({ slug, mapUrl }) => {
  const stem = path.basename(mapUrl.split('?')[0], '.webp');
  const atlas = (colour) => {
    const file = path.join(ATLASES, `${stem}-${colour}.webp`);
    if (!fs.existsSync(file)) throw new Error(`Нема атласу ${file} — спершу build-textures.py`);
    return file;
  };
  return {
    slug,
    model: 'tshirt.glb',
    texture: atlas(colourAt(0)),
    frameTextures: Array.from({ length: FRAMES }, (_, f) => atlas(colourAt(f))),
  };
});

fs.writeFileSync(OUT, `${JSON.stringify(worklist, null, 2)}\n`);
console.log(`${worklist.length} товари → ${path.relative(FRONT, OUT)}`);
console.log(Array.from({ length: FRAMES }, (_, f) => `${f}:${colourAt(f)}`).join(' '));
