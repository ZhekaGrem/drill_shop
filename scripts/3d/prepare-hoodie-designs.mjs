// prepare: node scripts/3d/prepare-hoodie-designs.mjs TOOLS_DIR
// After rendering both intermediate GLBs: node scripts/3d/prepare-hoodie-designs.mjs TOOLS_DIR publish
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';

const [toolsDir, stage = 'prepare'] = process.argv.slice(2);
if (!toolsDir) throw new Error('Expected tools-dir');
const versioned = (url) => `${url}?v=${createHash('sha256').update(fs.readFileSync(`public${url}`)).digest('hex').slice(0, 12)}`;
fs.mkdirSync('public/3d/textures/lab', { recursive: true });
const manifest = [];
let io;
if (stage === 'prepare') {
  const requireTool = createRequire(resolve(toolsDir, 'package.json'));
  const load = (name) => import(pathToFileURL(requireTool.resolve(name)).href);
  const { NodeIO } = await load('@gltf-transform/core');
  const { ALL_EXTENSIONS } = await load('@gltf-transform/extensions');
  io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
}
for (const id of [1, 2]) {
  const mapUrl = `/3d/textures/lab/hoodie-3-design-${id}.webp`;
  const poster = `/assets/img/lab/hoodie-3-design-${id}.webp`;
  if (stage === 'prepare') {
    const source = `3d/дизайн ${id}.png`;
    const metadata = await sharp(source).metadata();
    if (metadata.width !== 2048 || metadata.height !== 2048) throw new Error(`Unexpected texture size: ${source}`);
    // Lossless packaging preserves the supplied artwork and UV placement.
    await sharp(source).webp({ lossless: true }).toFile(`public${mapUrl}`);
    const doc = await io.read('3d/hoodie-comparison/hoodie-3-render.glb');
    const material = doc.getRoot().listMaterials()[0];
    material.getBaseColorTexture().setImage(fs.readFileSync(`public${mapUrl}`)).setMimeType('image/webp');
    await io.write(`3d/hoodie-comparison/hoodie-3-design-${id}-render.glb`, doc);
  } else if (stage === 'publish') {
    await sharp(`3d/hoodie-comparison/hoodie-3-design-${id}.png`).webp({ quality: 90 }).toFile(`public${poster}`);
    manifest.push({ id, mapUrl: versioned(mapUrl), poster: versioned(poster), bytes: fs.statSync(`public${mapUrl}`).size });
  } else throw new Error(`Unknown stage: ${stage}`);
  console.log(stage, id, fs.statSync(`public${mapUrl}`).size, 'texture bytes');
}
if (stage === 'publish') fs.writeFileSync('src/app/v2/lab/hoodie-designs.json', JSON.stringify(manifest, null, 2) + '\n');
