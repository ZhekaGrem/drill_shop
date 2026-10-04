/* eslint-disable no-console */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const sharp = require('sharp');
const config = require('../../src/shared/config/scarf-oksana.json');
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
  const { scarfPrintAt } = loadTs('src/widgets/HeroVisual/scarf-motion.ts');
  assert.deepEqual(scarfPrintAt(0, 8), { current: 0, next: 1, blend: 0 });
  assert.equal(scarfPrintAt(3.5, 8).blend, 0);
  assert.ok(Math.abs(scarfPrintAt(4.3, 8).blend - 0.5) < 0.0001);
  assert.deepEqual(scarfPrintAt(5, 8), { current: 1, next: 2, blend: 0 });
  assert.deepEqual(scarfPrintAt(40, 8), { current: 0, next: 1, blend: 0 });
  for (let i = 0; i < 8; i++) assert.equal(scarfPrintAt(i * 5, 8).current, i);
  const { orderForHome } = loadTs('src/shared/config/home-collections.ts');
  const collections = [{ key: 'nizhna-oksana' }, { key: 'boby-oksana' }, { key: config.collectionSlug }];
  assert.equal(orderForHome(collections)[0].key, config.collectionSlug);
  assert.equal(collections[0].key, 'nizhna-oksana');
  assert.equal(config.textureUrls.length, 8);
  for (const url of config.textureUrls) {
    const meta = await sharp(path.join(root, 'public', url)).metadata();
    assert.equal(meta.width, 1024);
    assert.equal(meta.height, 1024);
  }
  const poster = await sharp(path.join(root, 'public', config.posterUrl)).metadata();
  assert.ok(poster.hasAlpha);
  const glb = fs.readFileSync(path.join(root, 'public', config.modelUrl));
  assert.equal(glb.toString('ascii', 0, 4), 'glTF');
  const model = JSON.parse(glb.toString('utf8', 20, 20 + glb.readUInt32LE(12)));
  assert.ok(model.meshes.length > 0);
  assert.ok(model.materials.some((m) => m.alphaMode === 'BLEND'));
  console.log(
    'PASS: all 8 prints, smooth transitions and loop, first home position, textures, transparent poster and GLB.'
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
