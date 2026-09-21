"""Кадри turntable худі №3 → анімований WebP і постер у форматі живих карток каталогу.

python encode-hoodie-turntable.py FRAMES_ROOT OUT_DIR

FRAMES_ROOT/<slug>/frame_000.png … frame_047.png — 48 кадрів render-hoodie.py (1000², прозорий
фон) з кроком 7.5°. На виході OUT_DIR/<slug>.webp (480×600, 83 мс на кадр, q80, безкінечний
повтор) і OUT_DIR/<slug>-poster.webp (кадр 0, q85) — саме цю пару чекає
3d/pipeline/upload-turntables.mjs. Формат той самий, що в buba.webp.
"""
import os
import sys
from pathlib import Path

from PIL import Image

FRAMES = 48
CROP = (100, 0, 900, 1000)  # 4:5 по центру кадру 1000²
SIZE = (480, 600)


def load(frames_dir):
    paths = sorted(frames_dir.glob('frame_*.png'))
    if len(paths) != FRAMES:
        raise SystemExit(f'{frames_dir.name}: {len(paths)} кадрів замість {FRAMES}')
    frames = [Image.open(p).convert('RGBA') for p in paths]
    for path, frame in zip(paths, frames):
        box = frame.getbbox()
        # Худі не може вилазити за обрізку на жодному куті повороту
        if box is None or box[0] < CROP[0] or box[2] > CROP[2]:
            raise SystemExit(f'{path}: модель {box} виходить за обрізку {CROP}')
    return [f.crop(CROP).resize(SIZE, Image.LANCZOS) for f in frames]


def main():
    root, out = Path(sys.argv[1]), Path(sys.argv[2])
    out.mkdir(parents=True, exist_ok=True)
    for frames_dir in sorted(p for p in root.iterdir() if p.is_dir()):
        slug = frames_dir.name
        seq = load(frames_dir)
        anim, poster = out / f'{slug}.webp', out / f'{slug}-poster.webp'
        seq[0].save(anim, save_all=True, append_images=seq[1:], duration=83, loop=0, quality=80, method=6)
        seq[0].save(poster, quality=85, method=6)
        print(f'{slug:20} {os.path.getsize(anim) // 1024:5} КБ оберт, {os.path.getsize(poster) // 1024:3} КБ постер')


main()
