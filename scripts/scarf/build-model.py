"""Build the scarf fallback GLB and a transparent product render from the owner's first print."""
import bpy, math, os, sys
from mathutils import Vector
root = os.path.abspath(sys.argv[sys.argv.index('--') + 1])
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
n = 64
verts, faces = [], []
for j in range(n + 1):
    for i in range(n + 1):
        x, z = (i / n - .5) * 2.45, (j / n - .5) * 2.35
        wave = .11 * math.sin(x * 2.8) + .09 * math.sin(z * 3.2) + .035 * math.sin((x + z) * 6)
        verts.append((x, -wave, z))
for j in range(n):
    for i in range(n):
        a = j * (n + 1) + i
        faces.append((a, a+1, a+n+2, a+n+1))
mesh = bpy.data.meshes.new('Scarf fabric'); mesh.from_pydata(verts, [], faces); mesh.update()
uv = mesh.uv_layers.new(name='UVMap')
for p in mesh.polygons:
    p.use_smooth = True
    for loop in p.loop_indices:
        index = mesh.loops[loop].vertex_index
        uv.data[loop].uv = (index % (n+1) / n, index // (n+1) / n)
obj = bpy.data.objects.new('Khustynka Nizhna Oksana', mesh); scene.collection.objects.link(obj)
mat = bpy.data.materials.new('Semi-transparent printed fabric'); mat.use_nodes = True
shader = mat.node_tree.nodes.get('Principled BSDF')
shader.inputs['Roughness'].default_value = .82
shader.inputs['Alpha'].default_value = .85
image = bpy.data.images.load(os.path.join(root,'public/3d/textures/scarf-oksana/print-01.webp'))
tex = mat.node_tree.nodes.new('ShaderNodeTexImage'); tex.image = image
mat.node_tree.links.new(tex.outputs['Color'], shader.inputs['Base Color'])
mat.diffuse_color = (1,1,1,.85)
if hasattr(mat, 'surface_render_method'): mat.surface_render_method = 'DITHERED'
obj.data.materials.append(mat)
bpy.context.view_layer.objects.active = obj; obj.select_set(True)
os.makedirs(os.path.join(root,'public/3d/models'), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=os.path.join(root,'public/3d/models/scarf-oksana.glb'),export_format='GLB',use_selection=True,export_image_format='JPEG')
# Slight angle reveals the cloth waves in the static fallback.
obj.rotation_euler = (.12, -.12, .28)
camdata = bpy.data.cameras.new('Camera'); cam = bpy.data.objects.new('Camera',camdata); scene.collection.objects.link(cam)
cam.location=(0,-5.6,0); cam.rotation_euler=(Vector((0,0,0))-cam.location).to_track_quat('-Z','Y').to_euler(); camdata.lens=55; scene.camera=cam
for name, loc, power, size in [('Key',(2,-4,5),320,4),('Fill',(-3,-3,1),180,3),('Back',(1,3,2),200,3)]:
    data=bpy.data.lights.new(name,'AREA'); data.energy=power; data.shape='DISK'; data.size=size
    light=bpy.data.objects.new(name,data); scene.collection.objects.link(light); light.location=loc; light.rotation_euler=(-light.location).to_track_quat('-Z','Y').to_euler()
world=bpy.data.worlds.new('World'); world.use_nodes=True; world.node_tree.nodes['Background'].inputs['Strength'].default_value=.65; scene.world=world
scene.render.engine='CYCLES'; scene.cycles.samples=24; scene.cycles.use_denoising=True
scene.render.threads_mode='FIXED'; scene.render.threads=6
scene.render.film_transparent=True; scene.render.resolution_x=1000; scene.render.resolution_y=1000; scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'; scene.render.image_settings.color_mode='RGBA'
scene.view_settings.view_transform='Standard'
scene.render.filepath='/private/tmp/drill-scarf-poster.png'
bpy.ops.render.render(write_still=True)
