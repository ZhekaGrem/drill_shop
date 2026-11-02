"""Blender --disable-autoexec -b -P scripts/radio-tsybulia/render-posters.py -- REPO

Renders every chest colour from the front and each tee once from the back (first colour), on the
same scene as the other tees (scripts/new-merch/render-posters.py build_scene). Reads the full
atlases build-textures.py leaves in 3d/artists/radio-tsybulia/atlases.
"""
import bpy, sys, math, importlib.util
from pathlib import Path

ROOT = Path(sys.argv[sys.argv.index('--') + 1])
spec = importlib.util.spec_from_file_location('tee_scene', ROOT / 'scripts/new-merch/render-posters.py')
tee_scene = importlib.util.module_from_spec(spec)
spec.loader.exec_module(tee_scene)

LOCAL = ROOT / '3d/artists/radio-tsybulia'
RENDERS = LOCAL / 'renders'
RENDERS.mkdir(parents=True, exist_ok=True)
FIRST_COLOUR = 'rozheva'

garment, color, scene = tee_scene.build_scene('tshirt')
for atlas in sorted((LOCAL / 'atlases').glob('*.webp')):
    color.image = bpy.data.images.load(str(atlas))
    sides = [('front', 0), ('back', math.pi)] if atlas.stem.endswith(FIRST_COLOUR) else [('front', 0)]
    for side, angle in sides:
        garment.rotation_euler.z = angle
        scene.render.filepath = str(RENDERS / f'{atlas.stem}-{side}.png')
        bpy.ops.render.render(write_still=True)
    print(f'VERIFIED RENDER {atlas.stem}: {", ".join(s for s, _ in sides)}', flush=True)
