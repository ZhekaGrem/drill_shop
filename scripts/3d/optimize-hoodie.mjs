// node scripts/3d/optimize-hoodie.mjs <tools-dir> <input.glb> <output.glb> <report.json> <render.glb>
// tools-dir contains @gltf-transform/{core,extensions,functions}, meshoptimizer and sharp.
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { statSync, writeFileSync } from 'node:fs';
const [toolsDir, input, output, report, render] = process.argv.slice(2);
if (!render) throw new Error('Expected tools-dir, input, output, report, render');
const requireTool = createRequire(resolve(toolsDir, 'package.json'));
const load = (name) => import(pathToFileURL(requireTool.resolve(name)).href);
const { NodeIO } = await load('@gltf-transform/core');
const { ALL_EXTENSIONS } = await load('@gltf-transform/extensions');
const { dedup, flatten, join, prune, weld, simplify, meshopt, textureCompress, getBounds } = await load('@gltf-transform/functions');
const { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } = await load('meshoptimizer');
const sharp = requireTool('sharp');
await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready, MeshoptSimplifier.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
const doc = await io.read(input);
function metrics() {
 const r=doc.getRoot();let triangles=0,vertices=0,drawCalls=0;
 for(const m of r.listMeshes())for(const p of m.listPrimitives()) {
  triangles+=(p.getIndices()?.getCount()??p.getAttribute('POSITION').getCount())/3;
  vertices+=p.getAttribute('POSITION').getCount();drawCalls++;
 }
 return {triangles,vertices,drawCalls,materials:r.listMaterials().length,textures:r.listTextures().map(t=>({name:t.getName(),size:t.getSize(),bytes:t.getImage()?.byteLength??0})),animations:r.listAnimations().length};
}
const before=metrics();
if(before.animations) throw new Error('Export a static evaluated pose first; do not silently discard animations.');
for(const scene of doc.getRoot().listScenes()) {
 const box=getBounds(scene), height=box.max[1]-box.min[1], s=2/height;
 if(!Number.isFinite(s)||s<=0) throw new Error('Invalid model bounds');
 const pivot=doc.createNode('Hero-centred').setScale([s,s,s]).setTranslation(box.min.map((v,i)=>-(v+box.max[i])*s/2));
 for(const child of [...scene.listChildren()])pivot.addChild(child);
 scene.addChild(pivot);
}
// Preserve UVs for later print work; material palettes would replace those UVs.
await doc.transform(dedup(),flatten(),join({cleanup:false}),weld(),simplify({simplifier:MeshoptSimplifier,ratio:Math.min(1,60000/before.triangles),error:0.001,cleanup:false}),prune({keepAttributes:true,keepSolidTextures:true}),textureCompress({encoder:sharp,targetFormat:'webp',slots:/^(baseColorTexture|emissiveTexture)$/,resize:[2048,2048],quality:88}),textureCompress({encoder:sharp,targetFormat:'webp',slots:/^(normalTexture|occlusionTexture|metallicRoughnessTexture)$/,resize:[1024,1024],quality:85}));
await io.write(render,doc);
await doc.transform(meshopt({encoder:MeshoptEncoder,level:'high',quantizeTexcoord:14}));
await io.write(output,doc);
const result={input,output,sourceGlbBytes:statSync(input).size,outputBytes:statSync(output).size,before,after:metrics(),pipeline:{targetTriangles:60000,simplificationError:0.001,colorTextureMax:2048,dataTextureMax:1024,textureFormat:'webp',compression:'meshopt',height:2,static:true}};
writeFileSync(report,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
