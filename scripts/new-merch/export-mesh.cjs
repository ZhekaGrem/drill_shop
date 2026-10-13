/* eslint-disable no-console */
// Export actual runtime geometry for UV verification and offline Blender posters.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const { MeshoptDecoder } = require('meshoptimizer');
const FRONT = path.resolve(__dirname, '../..');
const OUT = path.join(FRONT, '3d/artists/prokliatyi/new-merch');
const SOURCE = fs.readdirSync(path.dirname(FRONT)).find((n) => n.normalize('NFC') === 'новий мерч');
const READERS = {
  5126: ['readFloatLE', 4, 1],
  5123: ['readUInt16LE', 2, 65535],
  5122: ['readInt16LE', 2, 32767],
  5125: ['readUInt32LE', 4, 4294967295],
  5120: ['readInt8', 1, 127],
  5121: ['readUInt8', 1, 255],
};

function accessor(doc, views, index) {
  const a = doc.accessors[index],
    v = doc.bufferViews[a.bufferView],
    bytes = views[a.bufferView];
  const size = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }[a.type];
  const [method, width, divisor] = READERS[a.componentType];
  return Array.from({ length: a.count }, (_, i) =>
    Array.from({ length: size }, (_, k) => {
      const value = bytes[method]((a.byteOffset ?? 0) + i * (v.byteStride ?? size * width) + k * width);
      return a.normalized ? Math.max(-1, value / divisor) : value;
    })
  );
}

async function exportMesh(kind, filename) {
  const bytes = fs.readFileSync(path.join(FRONT, filename));
  const doc = JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString());
  const bin = bytes.subarray(20 + bytes.readUInt32LE(12) + 8);
  const views = doc.bufferViews.map((v) => {
    const e = v.extensions?.EXT_meshopt_compression;
    if (!e) return bin.subarray(v.byteOffset ?? 0, (v.byteOffset ?? 0) + v.byteLength);
    const target = Buffer.alloc(e.count * e.byteStride);
    MeshoptDecoder.decodeGltfBuffer(
      target,
      e.count,
      e.byteStride,
      bin.subarray(e.byteOffset, e.byteOffset + e.byteLength),
      e.mode,
      e.filter
    );
    return target;
  });
  const prim = doc.meshes[0].primitives[0],
    node = doc.nodes.find((n) => n.mesh === 0);
  const position = accessor(doc, views, prim.attributes.POSITION).map((p) =>
    p.map((x, i) => x * (node.scale?.[i] ?? 1) + (node.translation?.[i] ?? 0))
  );
  const uv = accessor(doc, views, prim.attributes.TEXCOORD_0);
  const material = doc.materials[prim.material];
  const transform = material.pbrMetallicRoughness.baseColorTexture.extensions?.KHR_texture_transform;
  if (transform)
    for (const p of uv)
      for (let i = 0; i < 2; i++) p[i] = p[i] * (transform.scale?.[i] ?? 1) + (transform.offset?.[i] ?? 0);
  const normal = accessor(doc, views, prim.attributes.NORMAL);
  const indices = accessor(doc, views, prim.indices).flat();
  let normalMap = null;
  if (material.normalTexture) {
    const tex = doc.textures[material.normalTexture.index];
    const img = doc.images[tex.source ?? tex.extensions?.EXT_texture_webp?.source];
    const file = `${kind}-normal.png`;
    await sharp(views[img.bufferView]).png().toFile(path.join(OUT, file));
    normalMap = { file, transform: material.normalTexture.extensions?.KHR_texture_transform ?? null };
  }
  fs.writeFileSync(
    path.join(OUT, `${kind}-mesh.json`),
    JSON.stringify({ source: filename, position, uv, indices, normal, normalMap })
  );
  console.log(`${kind}: ${indices.length / 3} real triangles, UVs preserved`);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  await MeshoptDecoder.ready;
  await exportMesh('tshirt', 'public/3d/models/tshirt.glb');
  await exportMesh('hoodie', '3d/hoodie-comparison/hoodie-3-render.glb');
  const root = path.join(path.dirname(FRONT), SOURCE);
  const dir = path.join(OUT, 'source-svg');
  fs.mkdirSync(dir, { recursive: true });
  for (const name of ['футба 1 ', 'футба 2 ', 'футба 3 ']) {
    for (const file of fs.readdirSync(path.join(root, name)).filter((f) => f.endsWith('.svg'))) {
      await sharp(path.join(root, name, file))
        .png()
        .toFile(path.join(dir, `${name.trim()}-${file.trim()}.png`));
    }
  }
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
