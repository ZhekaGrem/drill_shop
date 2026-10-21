const path = require('path');
const fs = require('fs');
const root = process.argv[2];
const sharp = require(path.join(root, 'node_modules/sharp'));
const rows = [
  ['green', 'IMG20251109152732.jpg', { left: 1310, top: 1640, width: 420, height: 420 }],
  ['purple', 'IMG20251214103246.jpg', { left: 1200, top: 930, width: 440, height: 440 }],
  ['turquoise-purple', 'IMG20250720140919.jpg', { left: 790, top: 1870, width: 640, height: 640 }],
];
(async () => {
  for (const [slug, name, rect] of rows) {
    const p = path.join(root, '../брілок', name);
    const out = __dirname;
    await sharp(p)
      .extract(rect)
      .resize(512, 512)
      .jpeg({ quality: 92 })
      .toFile(path.join(out, slug + '-fiber.jpg'));
    const grey = await sharp(p).extract(rect).resize(512, 512).greyscale().raw().toBuffer();
    const normal = Buffer.alloc(512 * 512 * 3);
    for (let y = 0; y < 512; y++)
      for (let x = 0; x < 512; x++) {
        const get = (a, b) => grey[((b + 512) % 512) * 512 + ((a + 512) % 512)] / 255;
        const dx = (get(x + 1, y) - get(x - 1, y)) * 2,
          dy = (get(x, y + 1) - get(x, y - 1)) * 2;
        let l = Math.sqrt(dx * dx + dy * dy + 1),
          i = (y * 512 + x) * 3;
        normal[i] = Math.round(((-dx / l) * 0.5 + 0.5) * 255);
        normal[i + 1] = Math.round(((dy / l) * 0.5 + 0.5) * 255);
        normal[i + 2] = Math.round(((1 / l) * 0.5 + 0.5) * 255);
      }
    await sharp(normal, { raw: { width: 512, height: 512, channels: 3 } })
      .png()
      .toFile(path.join(out, slug + '-normal.png'));
  }
})();
