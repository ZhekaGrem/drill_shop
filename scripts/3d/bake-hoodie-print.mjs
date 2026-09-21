// node scripts/3d/bake-hoodie-print.mjs <tools-dir> <texture.png> <output.glb> <render.glb>
// Bakes a 2048² print into the base colour of hoodie №3 and packs it like optimize-hoodie.mjs.
// tools-dir contains @gltf-transform/{core,extensions,functions}, meshoptimizer and sharp.
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { statSync } from 'node:fs';
const SOURCE = '3d/hoodie-comparison/hoodie-3-render.glb';
const [toolsDir, texture, output, render] = process.argv.slice(2);
if (!render) throw new Error('Expected tools-dir, texture, output, render');
const requireTool = createRequire(resolve(toolsDir, 'package.json'));
const load = (name) => import(pathToFileURL(requireTool.resolve(name)).href);
const { NodeIO } = await load('@gltf-transform/core');
const { ALL_EXTENSIONS } = await load('@gltf-transform/extensions');
const { meshopt } = await load('@gltf-transform/functions');
const { MeshoptDecoder, MeshoptEncoder } = await load('meshoptimizer');
const sharp = requireTool('sharp');
await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready]);
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
const { width, height, hasAlpha } = await sharp(texture).metadata();
if (width !== 2048 || height !== 2048) throw new Error(`Unexpected texture size: ${width}×${height}`);
// Lossless packaging preserves the supplied artwork and UV placement; the garment is opaque.
const image = await sharp(texture).removeAlpha().webp({ lossless: true }).toBuffer();
const doc = await io.read(SOURCE);
const materials = doc.getRoot().listMaterials();
if (materials.length !== 1) throw new Error(`Expected one material, got ${materials.length}`);
materials[0].getBaseColorTexture().setImage(image).setMimeType('image/webp');
// The intermediate GLB without Meshopt is what Blender renders the poster from.
await io.write(render, doc);
await doc.transform(meshopt({ encoder: MeshoptEncoder, level: 'high', quantizeTexcoord: 14 }));
await io.write(output, doc);
console.log(
  JSON.stringify(
    {
      texture,
      hadAlpha: hasAlpha,
      textureBytes: image.byteLength,
      baseColorFactor: materials[0].getBaseColorFactor(),
      output,
      outputBytes: statSync(output).size,
    },
    null,
    2
  )
);
