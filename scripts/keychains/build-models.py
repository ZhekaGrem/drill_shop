import bpy, math, random, json, sys
from mathutils import Vector, noise
from pathlib import Path
OUT=Path(sys.argv[sys.argv.index('--')+1]) if '--' in sys.argv else Path(__file__).resolve().parent; random.seed(37)

def mat(name,color,metal=0):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
 b=m.node_tree.nodes.get('Principled BSDF');b.inputs['Base Color'].default_value=(*color,1);b.inputs['Metallic'].default_value=metal;b.inputs['Roughness'].default_value=.28 if metal else .95
 return m

def tube(name,points,radius,material,sides=5,closed=False):
 vs=[];fs=[]
 for i,p in enumerate(points):
  tangent=(points[(i+1)%len(points)]-points[i-1 if i else (len(points)-1 if closed else 0)]).normalized()
  if tangent.length<.1:tangent=Vector((0,0,1))
  a=tangent.cross(Vector((0,1,0))).normalized()
  if a.length<.1:a=tangent.cross(Vector((1,0,0))).normalized()
  b=tangent.cross(a).normalized()
  for k in range(sides):vs.append(p+radius*(a*math.cos(k*2*math.pi/sides)+b*math.sin(k*2*math.pi/sides)))
 for i in range(len(points) if closed else len(points)-1):
  for k in range(sides):fs.append((i*sides+k,i*sides+(k+1)%sides,((i+1)%len(points))*sides+(k+1)%sides,((i+1)%len(points))*sides+k))
 mesh=bpy.data.meshes.new(name);mesh.from_pydata(vs,[],fs);mesh.materials.append(material)
 ob=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(ob)
 for p in mesh.polygons:p.use_smooth=True
 return ob

def surface(theta,phi):
 z=math.cos(theta);r=math.sin(theta)*(.72+.13*z)
 p=Vector((r*math.cos(phi),r*.83*math.sin(phi),1.02*z))
 n=noise.noise_vector(p*5.8)[0];p*=1+.075*n+.012*noise.noise_vector(p*28)[0]
 return p

palettes={
 'green':[(.17,.25,.08),(.30,.40,.16),(.39,.49,.23),(.51,.43,.09)],
 'purple':[(.105,.025,.20),(.23,.055,.37),(.34,.09,.49),(.40,.20,.055)],
 'turquoise-purple':[(.035,.30,.33),(.17,.49,.49),(.38,.025,.38),(.52,.06,.48)]}
report=[]
for slug,palette in palettes.items():
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
 random.seed(37 if slug!='turquoise-purple' else 54)
 wool=[mat(f'{slug}-yarn-{i}',c) for i,c in enumerate(palette)]
 metal=mat('polished-hardware',(.55,.60,.65),.9)
 # Closed softly lobed core, real volume on every side.
 bpy.ops.mesh.primitive_uv_sphere_add(segments=112,ring_count=80)
 body=bpy.context.object;body.name='soft-keychain-core'
 for v in body.data.vertices:
  p=v.co.copy();theta=math.acos(max(-1,min(1,p.z)));phi=math.atan2(p.y,p.x);v.co=surface(theta,phi)
 body.data.materials.append(wool[0])
 for p in body.data.polygons:p.use_smooth=True
 # Photo-sampled chenille texture on irregular soft clusters.
 for m in wool:
  nodes=m.node_tree.nodes;links=m.node_tree.links;b=nodes.get('Principled BSDF')
  tex=nodes.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(OUT/f'{slug}-fiber.jpg'),check_existing=True);links.new(tex.outputs['Color'],b.inputs['Base Color'])
  normal=nodes.new('ShaderNodeTexImage');normal.image=bpy.data.images.load(str(OUT/f'{slug}-normal.png'),check_existing=True);normal.image.colorspace_settings.name='Non-Color'
  nm=nodes.new('ShaderNodeNormalMap');nm.inputs['Strength'].default_value=.7;links.new(normal.outputs['Color'],nm.inputs['Color']);links.new(nm.outputs['Normal'],b.inputs['Normal'])
 # Repeat real fiber detail over the main UV surface without high-resolution maps.
 for uv in body.data.uv_layers.active.data:uv.uv*=4
 # Fine contrasting threads scattered through yarn, visible in reference images.
 for i in range(320):
  theta=math.acos(random.uniform(-.94,.94));phi=random.random()*math.tau;p=surface(theta,phi);n=p.normalized();a=n.cross(Vector((0,0,1))).normalized();b=n.cross(a)
  points=[p+a*(j-3)*.010+b*math.sin(j*1.4)*.009+n*.014 for j in range(7)]
  tube('fine-fiber',points,.0035,wool[3 if slug!='turquoise-purple' else 1],3)
 # Connector + swivel + flat split key ring, normal faces camera (-Y).
 for x,z,r in [(0,1.10,.09),(0,1.26,.075),(0,1.61,.27)]:
  points=[Vector((x+r*math.cos(t),0,z+r*math.sin(t))) for t in [j*math.tau/48 for j in range(48)]]
  tube('metal-ring',points,.018 if r<.1 else .024,metal,8,True)
 # Double ring edge, matching the real two-turn keyring.
 points=[Vector((.27*math.cos(t),.033,1.61+.27*math.sin(t))) for t in [j*math.tau/48 for j in range(48)]]
 tube('split-ring-edge',points,.015,metal,6,True)
 # Join all geometry by material into a single mesh with five primitives.
 bpy.ops.object.select_all(action='SELECT');bpy.context.view_layer.objects.active=body;bpy.ops.object.join()
 model=bpy.context.object;model.name='brilok-'+slug
 # Center the whole hanging silhouette before export.
 for v in model.data.vertices:v.co.z-=.41
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 for p in model.data.polygons:p.use_smooth=True
 bpy.ops.export_scene.gltf(filepath=str(OUT/f'brilok-{slug}.glb'),export_format='GLB',use_selection=True,export_yup=True,export_animations=False,export_materials='EXPORT')
 tri=sum(len(p.vertices)-2 for p in model.data.polygons)
 report.append({'slug':slug,'triangles':tri,'bytes':(OUT/f'brilok-{slug}.glb').stat().st_size})
 # Render the actual exported geometry for review.
 scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=32
 scene.render.resolution_x=700;scene.render.resolution_y=850;scene.render.resolution_percentage=100
 scene.world.color=(.2,.2,.2);scene.render.film_transparent=True
 def aim(ob,at):ob.rotation_euler=(Vector(at)-ob.location).to_track_quat('-Z','Y').to_euler()
 bpy.ops.object.camera_add(location=(2,-6,1.4));cam=bpy.context.object;aim(cam,(0,0,.1));cam.data.type='ORTHO';cam.data.ortho_scale=3.5;scene.camera=cam
 for loc,power,size in [((1,-4,5),450,4),((-3,-1,1),250,3),((1,3,3),450,3)]:
  bpy.ops.object.light_add(type='AREA',location=loc);l=bpy.context.object;l.data.energy=power;l.data.shape='DISK';l.data.size=size;aim(l,(0,0,0))
 scene.view_settings.view_transform='AgX';scene.render.image_settings.file_format='PNG';scene.render.filepath=str(OUT/f'brilok-{slug}.png');bpy.ops.render.render(write_still=True)
(OUT/'models-report.json').write_text(json.dumps(report,indent=2))
