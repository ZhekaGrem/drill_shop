"""Export only named garment objects at a static pose, never overwrite the source .blend.
Blender --disable-autoexec -b source.blend -P export-hoodie.py -- out.glb frame object [object ...]
"""
import bpy,sys,math,json
from mathutils import Vector
args=sys.argv[sys.argv.index('--')+1:];out,frame,names=args[0],int(args[1]),args[2:]
scene=bpy.context.scene;scene.frame_set(frame)
deps=bpy.context.evaluated_depsgraph_get();baked=[]
for name in names:
 source=bpy.data.objects[name]
 mesh=bpy.data.meshes.new_from_object(source.evaluated_get(deps),preserve_all_data_layers=True,depsgraph=deps)
 ob=bpy.data.objects.new('Hero-'+name,mesh);scene.collection.objects.link(ob);ob.matrix_world=source.matrix_world.copy();baked.append(ob)
# Drop studio props, lights, cameras, hidden source variants and animation parents.
for ob in list(bpy.data.objects):
 if ob not in baked:bpy.data.objects.remove(ob,do_unlink=True)
bpy.context.view_layer.update()
for ob in baked:
 ob.select_set(True);bpy.context.view_layer.objects.active=ob
 bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
pts=[ob.matrix_world@Vector(c) for ob in baked for c in ob.bound_box]
lo=Vector(tuple(min(p[i] for p in pts) for i in range(3)));hi=Vector(tuple(max(p[i] for p in pts) for i in range(3)));center=(lo+hi)/2;s=2/(hi.z-lo.z)
for ob in baked:
 ob.location=-center*s;ob.scale=(s,s,s)
bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
for img in bpy.data.images:
 if img.size[0] and max(img.size)>2048:
  scale=2048/max(img.size);img.scale(round(img.size[0]*scale),round(img.size[1]*scale))
bpy.ops.export_scene.gltf(filepath=out,export_format='GLB',use_selection=True,export_animations=False,export_apply=True,export_image_format='AUTO',export_cameras=False,export_lights=False)
print('EXPORTED',out,'frame',frame,'bounds',list(lo),list(hi),flush=True)
