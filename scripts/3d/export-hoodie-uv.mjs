// node scripts/3d/export-hoodie-uv.mjs <tools-dir> <model.glb> <output-dir>
// Produces a transparent UV-island outline aligned to the glTF base-color image.
import { createRequire } from 'node:module';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { mkdirSync, writeFileSync } from 'node:fs';
const [toolsDir, input, output] = process.argv.slice(2);
if (!output) throw new Error('Expected tools-dir, model.glb, output-dir');
const requireTool = createRequire(resolve(toolsDir, 'package.json'));
const load = (name) => import(pathToFileURL(requireTool.resolve(name)).href);
const { NodeIO } = await load('@gltf-transform/core');
const { ALL_EXTENSIONS } = await load('@gltf-transform/extensions');
const { MeshoptDecoder } = await load('meshoptimizer');
const sharp = requireTool('sharp');
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
const doc = await io.read(input);
const edges = new Map();
const point = (uv, index) => uv.getElement(index, []).map((n) => n.toFixed(6)).join(',');
for (const mesh of doc.getRoot().listMeshes()) {
  for (const primitive of mesh.listPrimitives()) {
    const uv = primitive.getAttribute('TEXCOORD_0');
    if (!uv) throw new Error('Missing UVs');
    const indices = primitive.getIndices();
    const count = indices?.getCount() ?? uv.getCount();
    for (let i = 0; i < count; i += 3) {
      const corners = [0, 1, 2].map((offset) => point(uv, indices ? indices.getScalar(i + offset) : i + offset));
      for (let j = 0; j < 3; j++) {
        const pair = [corners[j], corners[(j + 1) % 3]].sort();
        if (pair[0] === pair[1]) continue;
        const key = pair.join('|');
        edges.set(key, (edges.get(key) ?? 0) + 1);
      }
    }
  }
}
const paths = [];
const wirePaths = [];
for (const [key, count] of edges) {
  const points = key.split('|').map((p) => p.split(',').map((n) => (Number(n) * 2048).toFixed(2)).join(' '));
  const path = `M${points[0]}L${points[1]}`;
  wirePaths.push(path);
  if (count === 1) paths.push(path);
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="2048" viewBox="0 0 2048 2048"><path d="${paths.join('')}" fill="none" stroke="#00d4ff" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
mkdirSync(output, { recursive: true });
writeFileSync(join(output, 'uv-outline.svg'), svg);
await sharp(Buffer.from(svg)).png().toFile(join(output, 'uv-outline.png'));
const wireSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="2048" viewBox="0 0 2048 2048"><path d="${wirePaths.join('')}" fill="none" stroke="#00d4ff" stroke-width="0.5" stroke-opacity="0.65"/></svg>`;
writeFileSync(join(output, 'uv-wireframe.svg'), wireSvg);
await sharp(Buffer.from(wireSvg)).png().toFile(join(output, 'uv-wireframe.png'));
console.log(`Exported ${paths.length} UV boundary edges to ${output}`);
