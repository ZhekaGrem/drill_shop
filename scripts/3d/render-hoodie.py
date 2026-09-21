"""Render a true model fallback. Args: uncompressed.glb output.png [angle degrees]."""
import bpy,sys,math
from mathutils import Vector
args=sys.argv[sys.argv.index('--')+1:];src,out=args[:2];angle=float(args[2]) if len(args)>2 else 0
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=src)
scene=bpy.context.scene
pivot=bpy.data.objects.new('Turntable',None);scene.collection.objects.link(pivot)
for ob in list(scene.objects):
 if ob!=pivot and ob.parent is None:ob.parent=pivot
pivot.rotation_euler.z=math.radians(angle)
camdata=bpy.data.cameras.new('Camera');cam=bpy.data.objects.new('Camera',camdata);scene.collection.objects.link(cam);scene.camera=cam
cam.location=(0,-4.3,0);cam.rotation_euler=(Vector((0,0,0))-cam.location).to_track_quat('-Z','Y').to_euler();camdata.lens=52
for name,loc,power,size in [('Key',(3,-4,5),450,4),('Fill',(-4,-2,1),220,3),('Rim',(0,3,2),330,3)]:
 data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size
 ob=bpy.data.objects.new(name,data);scene.collection.objects.link(ob);ob.location=loc;ob.rotation_euler=(-ob.location).to_track_quat('-Z','Y').to_euler()
world=bpy.data.worlds.new('World');world.use_nodes=True;world.node_tree.nodes['Background'].inputs['Strength'].default_value=0.45;scene.world=world
scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=16;scene.cycles.use_denoising=True
scene.render.threads_mode='FIXED';scene.render.threads=6
scene.render.film_transparent=True;scene.render.resolution_x=1000;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA';scene.render.filepath=out
scene.view_settings.view_transform='AgX'
bpy.ops.render.render(write_still=True)
