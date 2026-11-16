"""Blender --disable-autoexec -b -P scripts/zlypni/render-posters.py -- REPO [--only=slug,slug]

Кожен товар «Злипні» на моделі сайту спереду й ззаду, 1000² з прозорим тлом — та сама сцена,
що в «є. ***» (scripts/new-merch/render-posters.py build_scene). Текстуру бере з
public/3d/textures/zlypni (її пише import-uv.py), кадри кладе в 3d/artists/zlypni/renders.
Товар, чиї кадри новіші за текстуру, пропускає: повторний запуск дорендерює лише змінене.
"""
import bpy, sys, json, math, importlib.util
from pathlib import Path

args = sys.argv[sys.argv.index('--') + 1:]
ROOT = Path(args[0])
only = next((a.split('=', 1)[1].split(',') for a in args[1:] if a.startswith('--only=')), None)
spec = importlib.util.spec_from_file_location('scene', ROOT / 'scripts/new-merch/render-posters.py')
scene_lib = importlib.util.module_from_spec(spec)
spec.loader.exec_module(scene_lib)

RENDERS = ROOT / '3d/artists/zlypni/renders'
RENDERS.mkdir(parents=True, exist_ok=True)
catalog = json.loads((ROOT / 'scripts/zlypni/catalog.json').read_text())

for collection in catalog['collections']:
    todo = []
    for product in collection['products']:
        texture = ROOT / 'public' / product['texture3dUrl'].split('?')[0].lstrip('/')
        frames = [RENDERS / f"{product['slug']}-{side}.png" for side in ('front', 'back')]
        fresh = all(f.exists() and f.stat().st_mtime > texture.stat().st_mtime for f in frames)
        if (only is None or product['slug'] in only) and not (fresh and only is None):
            todo.append((product['slug'], texture))
    if not todo:
        continue
    garment, colour, scene = scene_lib.build_scene(collection['garment'])
    for slug, texture in todo:
        colour.image = bpy.data.images.load(str(texture))
        for side, angle in [('front', 0), ('back', math.pi)]:
            garment.rotation_euler.z = angle
            scene.render.filepath = str(RENDERS / f'{slug}-{side}.png')
            bpy.ops.render.render(write_still=True)
        bpy.data.images.remove(colour.image)  # сто текстур 4096² не тримаємо в пам'яті разом
        print(f'RENDERED {slug}', flush=True)
