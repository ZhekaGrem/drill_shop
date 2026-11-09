/* eslint-disable no-console */
// node scripts/radio-tsybulia/verify.cjs — manifest, textures, print clock and home position.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const ts = require('typescript');
const sharp = require('sharp');
const manifest = require('../../src/shared/config/radio-tsybulia.json');

const root = path.resolve(__dirname, '../..');
function loadTs(file) {
  const code = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const result = { exports: {} };
  new Function('module', 'exports', code)(result, result.exports);
  return result.exports;
}

async function main() {
  const {
    printCycleAt,
    TEE_PRINT_SECONDS: hold,
    TEE_FADE_SECONDS: fade,
  } = loadTs('src/widgets/HeroVisual/print-cycle.ts');
  assert.deepEqual(printCycleAt(0, 5, hold, fade), { current: 0, next: 1, blend: 0 });
  assert.equal(printCycleAt(hold - fade - 0.01, 5, hold, fade).blend, 0);
  assert.ok(Math.abs(printCycleAt(hold - fade / 2, 5, hold, fade).blend - 0.5) < 0.0001);
  assert.deepEqual(printCycleAt(4 * hold, 5, hold, fade), { current: 4, next: 0, blend: 0 });
  assert.deepEqual(printCycleAt(5 * hold, 5, hold, fade), { current: 0, next: 1, blend: 0 });

  const { orderForHome } = loadTs('src/shared/config/home-collections.ts');
  const home = orderForHome([
    { key: 'khustynka-oksana' },
    { key: 'nizhna-oksana' },
    { key: 'radio-tsybulia' },
  ]);
  assert.equal(home[0].key, manifest.collection.slug);

  assert.equal(manifest.price, 1250);
  assert.deepEqual(manifest.stock, { S: 1, M: 2, L: 3 });
  const image = async (url) => {
    const [file, version] = url.split('?v=');
    const bytes = fs.readFileSync(path.join(root, 'public', file));
    assert.equal(
      version,
      createHash('sha256').update(bytes).digest('hex').slice(0, 12),
      `${file}: stale ?v=`
    );
    const meta = await sharp(bytes).metadata();
    assert.equal(meta.format, 'webp', file);
    return meta;
  };
  assert.equal(manifest.products.length, 2);
  for (const product of manifest.products) {
    const meta = await image(product.mapUrl);
    assert.deepEqual([meta.width, meta.height], [4096, 4096], product.mapUrl);
  }
  const [u0, v0, u1, v1] = manifest.chest.rect;
  assert.ok(0 < u0 && u0 < u1 && u1 < 1 && 0 < v0 && v0 < v1 && v1 < 1, 'chest rect inside the atlas');
  assert.equal(manifest.chest.urls.length, 5, 'five chest colours');
  for (const url of manifest.chest.urls) {
    const meta = await image(url);
    assert.deepEqual(
      [meta.width, meta.height],
      [Math.round((u1 - u0) * 4096), Math.round((v1 - v0) * 4096)],
      url
    );
  }
  console.log(
    'PASS: 2 tee atlases + 5 chest colours, fresh hashes, sizes match the chest rect, print clock loops, first on home.'
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
