/* eslint-disable no-console */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const { createHash } = require('node:crypto');
const FRONT = path.resolve(__dirname, '..');

async function main() {
  const manifestPath = path.join(FRONT, 'src/shared/config/new-merch.json');
  assert.ok(fs.existsSync(manifestPath), 'New merch manifest must exist');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(manifest.collections.length, 2);
  const pdfRear = await sharp(
    path.join(FRONT, '3d/artists/prokliatyi/new-merch/print-assets/07-back.png')
  ).metadata();
  assert.ok(
    pdfRear.height > pdfRear.width,
    'PDF 7 back must include its three columns of text below the illustrations'
  );
  const urls = new Set();
  for (const c of manifest.collections) {
    assert.equal(
      c.items.length,
      c.key.endsWith('hoodie') ? 11 : 10,
      `${c.key}: all supplied designs and the full-chest rider`
    );
    assert.ok(fs.existsSync(path.join(FRONT, 'public', c.modelUrl)));
    for (const item of c.items) {
      assert.ok(!urls.has(item.mapUrl), `Duplicate texture: ${item.mapUrl}`);
      urls.add(item.mapUrl);
      const meta = await sharp(path.join(FRONT, 'public', item.mapUrl.split('?')[0])).metadata();
      assert.deepEqual([meta.width, meta.height, meta.format], [4096, 4096, 'webp']);
      if (!process.argv.includes('--textures-only')) {
        const poster = await sharp(path.join(FRONT, 'public', item.fallback.split('?')[0])).metadata();
        assert.deepEqual([poster.width, poster.height, poster.format], [1000, 1000, 'webp']);
      }
    }
  }
  const report = JSON.parse(fs.readFileSync(path.join(FRONT, '3d/artists/prokliatyi/new-merch/layout.json')));
  assert.equal(report.designs.length, 21);
  const fingerprints = new Set();
  for (const design of report.designs) {
    const texture = path.join(
      FRONT,
      'public/3d/textures/prokliatyi/new-merch',
      `${design.kind}-${String(design.number).padStart(2, '0')}.webp`
    );
    const fingerprint = createHash('sha256').update(fs.readFileSync(texture)).digest('hex');
    assert.equal(fingerprint, design.runtimeSha256, 'Runtime texture must match the verified UV generation');
    assert.ok(!fingerprints.has(fingerprint), 'Each design must have different texture pixels');
    fingerprints.add(fingerprint);
    assert.ok(design.placements.front && design.placements.back);
    for (const placement of Object.values(design.placements)) {
      assert.equal(placement.outsideUvPixels, 0, `${design.kind} ${design.number}: outside UV`);
    }
    if (design.kind === 'hoodie' && design.number !== 11) {
      const box = design.placements.front.box2048;
      assert.ok(box[1] >= 662 && box[3] <= 837, `Hoodie ${design.number}: pocket collision`);
      const rear = design.placements.back.box2048;
      assert.ok(rear[1] >= 106 && rear[3] <= 502 && rear[2] - rear[0] <= 250);
    }
  }
  const rider = report.designs.find((d) => d.kind === 'hoodie' && d.number === 11);
  assert.ok(
    rider.placements.pocket.triangles > 0,
    'Large rider must be baked onto the separate pocket island'
  );
  assert.ok(rider.placements.front.triangles > 0, 'Large rider must be baked onto the chest');
  assert.deepEqual(
    rider.placements.front.projection,
    rider.placements.pocket.projection,
    'Chest and pocket must share one continuous print projection'
  );
  assert.deepEqual(report.printScale, { tshirt: { front: 0.7, back: 0.8 }, hoodie: { front: 1, back: 1 } });
  console.log(
    `PASS: two heroes, ${urls.size} unique 4096 textures, UV bounds${process.argv.includes('--textures-only') ? '' : ', 21 real posters'}`
  );
}
main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
