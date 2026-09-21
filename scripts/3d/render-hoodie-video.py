"""Render a shareable 8-second MP4 turntable from a local, static hoodie GLB.
Blender --disable-autoexec -b -P scripts/3d/render-hoodie-video.py -- input.glb output.mp4
"""
import bpy
import math
import os
import sys
from mathutils import Vector

source, output = sys.argv[sys.argv.index('--') + 1:][:2]
output = os.path.abspath(output)
os.makedirs(os.path.dirname(output), exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=source)
scene = bpy.context.scene
pivot = bpy.data.objects.new('Hoodie turntable', None)
scene.collection.objects.link(pivot)
for ob in list(scene.objects):
    if ob != pivot and ob.parent is None:
        ob.parent = pivot
for frame, angle in [(1, 0), (13, 0), (181, 2 * math.pi), (192, 2 * math.pi)]:
    pivot.rotation_euler.z = angle
    pivot.keyframe_insert(data_path='rotation_euler', frame=frame)
# Blender 5 uses layered actions.
action = pivot.animation_data.action
for layer in action.layers:
    for strip in layer.strips:
        bag = strip.channelbag(pivot.animation_data.action_slot)
        if bag:
            for curve in bag.fcurves:
                for key in curve.keyframe_points:
                    key.interpolation = 'LINEAR'

camera_data = bpy.data.cameras.new('Camera')
camera = bpy.data.objects.new('Camera', camera_data)
scene.collection.objects.link(camera)
scene.camera = camera
camera.location = (0, -4.7, 0.1)
camera.rotation_euler = (Vector((0, 0, 0)) - camera.location).to_track_quat('-Z', 'Y').to_euler()
camera_data.lens = 52
for name, location, power, size in [
    ('Key', (3, -4, 5), 450, 4),
    ('Fill', (-4, -2, 1), 300, 3),
    ('Rim', (0, 3, 2), 450, 3),
]:
    data = bpy.data.lights.new(name, 'AREA')
    data.energy = power
    data.shape = 'DISK'
    data.size = size
    ob = bpy.data.objects.new(name, data)
    scene.collection.objects.link(ob)
    ob.location = location
    ob.rotation_euler = (-ob.location).to_track_quat('-Z', 'Y').to_euler()
world = bpy.data.worlds.new('Neutral studio')
world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.1, 0.115, 0.13, 1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.6
scene.world = world
scene.render.engine = 'BLENDER_EEVEE'
scene.render.resolution_x = 720
scene.render.resolution_y = 900
scene.render.resolution_percentage = 100
scene.render.fps = 24
scene.frame_start = 1
scene.frame_end = 192
scene.render.film_transparent = False
scene.view_settings.view_transform = 'AgX'
scene.render.image_settings.color_mode = 'RGB'
scene.render.image_settings.file_format = 'PNG'
scene.frame_set(1)
scene.render.filepath = os.path.splitext(output)[0] + '-preview.png'
bpy.ops.render.render(write_still=True)
scene.render.image_settings.media_type = 'VIDEO'
scene.render.image_settings.file_format = 'FFMPEG'
scene.render.ffmpeg.format = 'MPEG4'
scene.render.ffmpeg.codec = 'H264'
scene.render.ffmpeg.constant_rate_factor = 'HIGH'
scene.render.ffmpeg.ffmpeg_preset = 'GOOD'
scene.render.ffmpeg.audio_codec = 'NONE'
scene.render.filepath = output
bpy.ops.render.render(animation=True)
print('VIDEO_DONE', output, os.path.getsize(output), flush=True)
