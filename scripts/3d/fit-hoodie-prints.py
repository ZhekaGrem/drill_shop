"""Підганяє принти готової розгортки худі №3 під видиму зону крою й віддає текстуру 2048².

Виклик: python fit-hoodie-prints.py SRC.png OUT.webp   (потрібні pillow + numpy)

Розгортка може бути будь-якого кратного 2048 розміру; тло — суцільний колір тканини
(береться з кута). Кожен принт (спина, перед) вирізається по фарбі, пропорційно
зменшується, якщо не влазить, і ставиться назад по осі деталі. Решта (рукави, капюшон)
не чіпається. Межі — у пікселях 2048-розгортки, заміряні лінійкою на рендері
(docs/hoodie-lab.md): унизу спини руки й вигин тіла ховають усе далі ~±125 px від осі,
перед закінчується над кишенею (її верх — y 857).
"""
import sys

import numpy as np
from PIL import Image

Image.MAX_IMAGE_PIXELS = None

# (x0, y0, x1, y1) деталі; вісь x; межі по y; максимальна ширина
ZONES = {
    'back': dict(box=(580, 34, 1040, 520), axis=813, top=106, bottom=502, max_w=250),
    'front': dict(box=(580, 540, 1040, 1000), axis=804, top=662, bottom=837, max_w=250),
}


def fit(src, out):
    im = Image.open(src).convert('RGB')
    k = im.width / 2048
    assert im.width == im.height and k == int(k), im.size
    bg = im.getpixel((0, 0))
    a = np.asarray(im).astype(int)
    canvas = im.copy()
    for name, z in ZONES.items():
        x0, y0, x1, y1 = (round(v * k) for v in z['box'])
        ink = np.abs(a[y0:y1, x0:x1] - bg).max(axis=2) > 12
        ys, xs = np.nonzero(ink)
        bx0, by0, bx1, by1 = x0 + xs.min(), y0 + ys.min(), x0 + xs.max() + 1, y0 + ys.max() + 1
        w, h = bx1 - bx0, by1 - by0
        top, bottom = z['top'] * k, z['bottom'] * k
        s = min(1, z['max_w'] * k / w, (bottom - top) / h)
        print(f'{name}: {w / k:.0f}×{h / k:.0f} px (2048) → масштаб {s:.3f}')
        part = im.crop((bx0, by0, bx1, by1))
        # Тло суцільне, тож прямокутник принта вставляється без маски й без шва
        nw, nh = max(1, round(w * s)), max(1, round(h * s))
        part = part.resize((nw, nh), Image.LANCZOS)
        canvas.paste(bg, (bx0, by0, bx1, by1))
        # Спина лишається під капюшоном на своєму місці; перед центрується на грудях
        ny = by0 if name == 'back' else round((top + bottom) / 2 - nh / 2)
        ny = int(min(max(ny, top), bottom - nh))
        canvas.paste(part, (round(z['axis'] * k - nw / 2), ny))
    canvas.resize((2048, 2048), Image.LANCZOS).save(out, lossless=True, method=6)


if __name__ == '__main__':
    fit(sys.argv[1], sys.argv[2])
