/* eslint-disable no-console */
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const { createHash } = require('node:crypto');
const FRONT = path.resolve(__dirname, '../..');
const RENDERS = path.join(FRONT, '3d/artists/prokliatyi/new-merch/renders');
const OUTPUT = path.join(FRONT, 'public/assets/img/prokliatyi/new-merch');

(async () => {
  fs.mkdirSync(OUTPUT, { recursive: true });
  for (const kind of ['tshirt', 'hoodie']) {
    for (let i = 1; i <= (kind === 'hoodie' ? 11 : 10); i++) {
      const stem = `${kind}-${String(i).padStart(2, '0')}`;
      await sharp(path.join(RENDERS, `${stem}-front.png`))
        .webp({ quality: 92 })
        .toFile(path.join(OUTPUT, `${stem}.webp`));
    }
  }
  const manifestPath = path.join(FRONT, 'src/shared/config/new-merch.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  for (const collection of manifest.collections) {
    for (const item of collection.items) {
      const url = item.fallback.split('?')[0];
      const fingerprint = createHash('sha256')
        .update(fs.readFileSync(path.join(FRONT, 'public', url)))
        .digest('hex');
      item.fallback = `${url}?v=${fingerprint.slice(0, 12)}`;
    }
  }
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log('Published 21 real front-view posters');
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
