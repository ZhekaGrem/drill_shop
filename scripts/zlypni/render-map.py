"""Blender --disable-autoexec -b -P scripts/zlypni/render-map.py -- REPO KIND MAP.png OUT_DIR

Знімає кольорову карту деталей (make-templates.py) на справжній моделі з чотирьох боків:
OUT_DIR/<KIND>-front.png, -left.png, -back.png, -right.png. Сцена — з render-posters.py «є. ***»."""
import bpy, sys, math, importlib.util
from pathlib import Path

args = sys.argv[sys.argv.index('--') + 1:]
root, kind, colour_map, out = Path(args[0]), args[1], Path(args[2]), Path(args[3])
spec = importlib.util.spec_from_file_location('posters', root / 'scripts/new-merch/render-posters.py')
posters = importlib.util.module_from_spec(spec)
spec.loader.exec_module(posters)

garment, colour, scene = posters.build_scene(kind)
colour.image = bpy.data.images.load(str(colour_map))
colour.interpolation = 'Closest'  # межі деталей чіткі, без розмиття кольорів
scene.render.resolution_x = scene.render.resolution_y = 800
for side, angle in [('front', 0), ('left', math.pi / 2), ('back', math.pi), ('right', -math.pi / 2)]:
    garment.rotation_euler.z = angle
    scene.render.filepath = str(out / f'{kind}-{side}.png')
    bpy.ops.render.render(write_still=True)
print('RENDERED', kind, flush=True)
