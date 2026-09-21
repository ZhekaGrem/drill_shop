// Run after the optimization report and Blender poster render of hoodie №3 exist.
// node scripts/3d/publish-hoodie-lab.mjs
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
const versioned = (url) => `${url}?v=${createHash('sha256').update(fs.readFileSync(`public${url}`)).digest('hex').slice(0, 12)}`;
const output=[];
fs.mkdirSync('public/assets/img/lab',{recursive:true});
for(const id of [3]){
 const base=`3d/hoodie-comparison/hoodie-${id}`;
 const report=JSON.parse(fs.readFileSync(`${base}-report.json`));
 const poster=`/assets/img/lab/hoodie-${id}.webp`;
 await sharp(`${base}.png`).webp({quality:88}).toFile(`public${poster}`);
 output.push({id,url:versioned(`/3d/models/lab/hoodie-${id}.glb`),poster:versioned(poster),bytes:fs.statSync(report.output).size,triangles:report.after.triangles,vertices:report.after.vertices,materials:report.after.materials,primitives:report.after.drawCalls,textures:report.after.textures.length,originalTriangles:report.before.triangles});
}
fs.writeFileSync('src/app/v2/lab/hoodie-metrics.json',JSON.stringify(output,null,2)+'\n');
console.log(output);
