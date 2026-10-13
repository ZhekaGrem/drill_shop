"""Blender --disable-autoexec -b -P scripts/new-merch/render-posters.py -- REPO [kind]"""
import bpy,sys,json,math
from pathlib import Path
from mathutils import Vector

args=sys.argv[sys.argv.index('--')+1:]
ROOT=Path(args[0]);OUT=ROOT/'3d/artists/prokliatyi/new-merch';RENDERS=OUT/'renders';RENDERS.mkdir(exist_ok=True)
kinds=args[1:] or ['tshirt','hoodie']


def build_scene(kind):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    data=json.loads((OUT/f'{kind}-mesh.json').read_text())
    mesh=bpy.data.meshes.new(kind)
    points=[(x,-z,y) for x,y,z in data['position']]
    minimum=Vector(tuple(min(p[i] for p in points) for i in range(3)))
    maximum=Vector(tuple(max(p[i] for p in points) for i in range(3)))
    center=(minimum+maximum)/2
    distance=max(maximum.x-minimum.x,maximum.z-minimum.z)*1.85
    indices=data['indices'];faces=[indices[i:i+3] for i in range(0,len(indices),3)]
    mesh.from_pydata(points,[],faces);mesh.update()
    uv=mesh.uv_layers.new(name='UVMap')
    for poly in mesh.polygons:
        poly.use_smooth=True
        for loop in poly.loop_indices:
            u,v=data['uv'][mesh.loops[loop].vertex_index];uv.data[loop].uv=(u,1-v)
    garment=bpy.data.objects.new(kind,mesh);bpy.context.collection.objects.link(garment)
    material=bpy.data.materials.new('Printed black cloth');material.use_nodes=True
    nodes=material.node_tree.nodes;links=material.node_tree.links
    shader=nodes.get('Principled BSDF');shader.inputs['Roughness'].default_value=.86
    color=nodes.new('ShaderNodeTexImage');links.new(color.outputs['Color'],shader.inputs['Base Color'])
    if data.get('normalMap'):
        normal=nodes.new('ShaderNodeTexImage');normal.image=bpy.data.images.load(str(OUT/data['normalMap']['file']))
        normal.image.colorspace_settings.name='Non-Color'
        coord=nodes.new('ShaderNodeTexCoord');mapping=nodes.new('ShaderNodeMapping')
        transform=data['normalMap']['transform']
        if transform:
            scale=transform.get('scale',[1,1]);offset=transform.get('offset',[0,0])
            mapping.inputs['Scale'].default_value=(scale[0],scale[1],1)
            mapping.inputs['Location'].default_value=(offset[0],1-scale[1]-offset[1],0)
        links.new(coord.outputs['UV'],mapping.inputs['Vector']);links.new(mapping.outputs['Vector'],normal.inputs['Vector'])
        bump=nodes.new('ShaderNodeNormalMap');links.new(normal.outputs['Color'],bump.inputs['Color'])
        links.new(bump.outputs['Normal'],shader.inputs['Normal'])
    mesh.materials.append(material)
    scene=bpy.context.scene
    camera=bpy.data.objects.new('Camera',bpy.data.cameras.new('Camera'));scene.collection.objects.link(camera)
    camera.location=(center.x,-distance,center.z);camera.rotation_euler=(center-camera.location).to_track_quat('-Z','Y').to_euler()
    camera.data.lens=52;scene.camera=camera
    for name,loc,power,size in [('Key',(3,-4,5),450,4),('Fill',(-4,-2,1),220,3),('Rim',(0,3,2),330,3)]:
        light=bpy.data.lights.new(name,'AREA');light.energy=power;light.shape='DISK';light.size=size
        ob=bpy.data.objects.new(name,light);scene.collection.objects.link(ob);ob.location=loc
        ob.rotation_euler=(-ob.location).to_track_quat('-Z','Y').to_euler()
    world=bpy.data.worlds.new('World');world.use_nodes=True
    world.node_tree.nodes['Background'].inputs['Strength'].default_value=.45;scene.world=world
    scene.render.engine='CYCLES';scene.cycles.samples=8;scene.cycles.use_denoising=True
    scene.render.threads_mode='FIXED';scene.render.threads=6;scene.render.film_transparent=True
    scene.render.resolution_x=1000;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
    scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA'
    scene.view_settings.view_transform='AgX'
    return garment,color,scene


for kind in kinds:
    garment,color,scene=build_scene(kind)
    for number in range(1,12 if kind=='hoodie' else 11):
        stem=f'{kind}-{number:02}'
        color.image=bpy.data.images.load(str(ROOT/f'public/3d/textures/prokliatyi/new-merch/{stem}.webp'))
        for side,angle in [('front',0),('back',math.pi)]:
            garment.rotation_euler.z=angle
            scene.render.filepath=str(RENDERS/f'{stem}-{side}.png')
            bpy.ops.render.render(write_still=True)
        print(f'VERIFIED RENDER {stem}: front and rear',flush=True)
