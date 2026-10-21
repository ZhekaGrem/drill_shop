/* eslint-disable no-console */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const config = require('./collection.json');
const root = process.env.FRONTEND_DIR || path.resolve(__dirname, '../..');
assert.equal(config.title, 'брілок');
assert.equal(config.products.length, 3);
assert.equal(config.initialQuantity, 100);
assert.deepEqual(config.sizes, [
  { size: 'L', price: 300 },
  { size: 'XL', price: 400 },
  { size: 'XXL', price: 500 },
]);
for (const p of config.products) {
  const buf = fs.readFileSync(path.join(root, 'public/3d/models', p.slug + '.glb'));
  assert.equal(buf.toString('utf8', 0, 4), 'glTF');
  assert.equal(buf.readUInt32LE(4), 2);
  assert.equal(buf.readUInt32LE(8), buf.length);
  assert(buf.length < 2 * 1024 * 1024);
  const j = JSON.parse(buf.toString('utf8', 20, 20 + buf.readUInt32LE(12)));
  let triangles = 0;
  for (const mesh of j.meshes)
    for (const primitive of mesh.primitives) {
      const pos = j.accessors[primitive.attributes.POSITION];
      assert(pos.count > 0);
      assert.equal(pos.type, 'VEC3');
      assert(primitive.attributes.NORMAL !== undefined);
      assert(j.materials[primitive.material]);
      triangles += (primitive.indices !== undefined ? j.accessors[primitive.indices].count : pos.count) / 3;
    }
  assert(triangles > 0 && triangles < 40000);
  assert(j.images?.length >= 2);
  assert(j.materials.some((m) => m.pbrMetallicRoughness?.metallicFactor > 0.5));
  assert(fs.statSync(path.join(root, 'public/3d/posters', p.slug + '.webp')).size > 1000);
  assert(fs.statSync(path.join(root, 'public/assets/brilok', p.slug + '.jpg')).size > 1000);
  console.log(
    `${p.slug}: ${triangles} triangles, ${(buf.length / 1024).toFixed(0)} KiB, embedded photo texture + normal, metal, poster OK`
  );
}
console.log('3 colors × L/XL/XXL = 9 variants, prices 300/400/500, quantity 100 each.');
