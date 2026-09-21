"""Розгортки худі №3 для серії «Боби Оксана» з векторного PDF футболок.

python make-boby-oksana-unwraps.py "3d/серія боб ніжна оксана /дизайни.pdf" OUT_DIR

Потрібні pymupdf, pillow, numpy (окремий venv; до залежностей магазину не додані).
Принти в PDF векторні, тож контури перемальовуються просто на сторінку-розгортку
2048×2048 pt: звідти береться і PNG (рендер ×4 зі зведенням усередненням), і
векторний PDF тієї самої розгортки. Тло залите кольором тканини повністю — швам
не потрібен запас.

Розкладка виміряна на моделі лінійкою (docs/hoodie-lab.md) і на прикладі власника
«підібраний дизайн.png».
"""
import sys
from pathlib import Path

import numpy as np
import pymupdf
from PIL import Image

SIZE = 2048
SCALE = 0.779  # px розгортки на pt PDF — як у прикладі власника
SUPERSAMPLE = 4
BACK = {'axis': 813, 'top': 106}  # спина однакова у всіх; капюшон закриває до y≈80
# Перед: під горловиною (видно з y≈645) і над кишенею (її верх на y≈857)
FRONT = {'axis': 804, 'centre': 717, 'top': 662, 'bottom': 837}

BLACK, WHITE, GREEN = '#1c1d1d', '#ffffff', '#0b8932'
# сторінка PDF → (файл, колір тканини)
DESIGNS = [
    ('01-chervona', BLACK),
    ('02-fioletova', BLACK),
    ('03-zelena', BLACK),
    ('04-zhovta', BLACK),
    ('05-runichna', BLACK),
    ('06-bilonka', WHITE),
    ('07-zelena-runichna', GREEN),
]
# На сторінці 7 футболка векторна — її контури відсіюються за заливкою
TEE_FILLS = {GREEN, '#ffffff', '#000000'}
HALF = 960  # pt: ліворуч перед, праворуч спина


def rgb(hex_colour):
    return tuple(int(hex_colour[i : i + 2], 16) / 255 for i in (1, 3, 5))


def hex_of(fill):
    return None if fill is None else '#%02x%02x%02x' % tuple(round(v * 255) for v in fill)


def print_paths(page, vector_tee):
    """Контури принтів, поділені на перед і спину."""
    sides = {'front': [], 'back': []}
    for path in page.get_drawings():
        if vector_tee and hex_of(path.get('fill')) in TEE_FILLS:
            continue
        rect = path['rect']
        sides['front' if (rect.x0 + rect.x1) / 2 < HALF else 'back'].append(path)
    return sides


def bounds(paths):
    rect = pymupdf.Rect(paths[0]['rect'])
    for path in paths[1:]:
        rect |= path['rect']
    return rect


def placement(side, rect):
    """Матриця pt PDF → px розгортки для блоку принта."""
    if side == 'back':
        scale, top = SCALE, BACK['top']
        axis = BACK['axis']
    else:
        room = FRONT['bottom'] - FRONT['top']
        scale = min(SCALE, room / rect.height)
        height = rect.height * scale
        top = min(max(FRONT['centre'] - height / 2, FRONT['top']), FRONT['bottom'] - height)
        axis = FRONT['axis']
    left = axis - rect.width * scale / 2
    return pymupdf.Matrix(scale, 0, 0, scale, left - rect.x0 * scale, top - rect.y0 * scale), scale


def draw(shape, path, matrix):
    for item in path['items']:
        kind = item[0]
        if kind == 'l':
            shape.draw_line(item[1] * matrix, item[2] * matrix)
        elif kind == 'c':
            shape.draw_bezier(*(point * matrix for point in item[1:5]))
        elif kind == 're':
            shape.draw_quad(item[1].quad * matrix)
        elif kind == 'qu':
            shape.draw_quad(item[1] * matrix)
        else:
            raise ValueError(f'Unknown path item: {kind}')
    shape.finish(fill=path['fill'], color=None, even_odd=path.get('even_odd', True), closePath=True)


def build(page, cloth, vector_tee):
    """Сторінка-розгортка 2048×2048 pt і звіт про розміщення."""
    sheet = pymupdf.open()
    target = sheet.new_page(width=SIZE, height=SIZE)
    shape = target.new_shape()
    shape.draw_rect(target.rect)
    shape.finish(fill=rgb(cloth), color=None)
    report = {}
    for side, paths in print_paths(page, vector_tee).items():
        rect = bounds(paths)
        matrix, scale = placement(side, rect)
        for path in paths:
            draw(shape, path, matrix)
        placed = rect * matrix
        report[side] = {'scale': round(scale, 4), 'box': [round(v) for v in placed], 'paths': len(paths)}
    shape.commit()
    return sheet, report


def rasterise(sheet):
    zoom = pymupdf.Matrix(SUPERSAMPLE, SUPERSAMPLE)
    pix = sheet[0].get_pixmap(matrix=zoom, alpha=False)
    big = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
    return big.resize((SIZE, SIZE), Image.BOX)


def main():
    source, out = Path(sys.argv[1]), Path(sys.argv[2])
    out.mkdir(parents=True, exist_ok=True)
    doc = pymupdf.open(source)
    if doc.page_count != len(DESIGNS):
        raise SystemExit(f'Expected {len(DESIGNS)} pages, got {doc.page_count}')
    for number, (name, cloth) in enumerate(DESIGNS):
        page = doc[number]
        sheet, report = build(page, cloth, vector_tee=not page.get_images())
        sheet.save(out / f'{name}.pdf', garbage=3, deflate=True)
        texture = rasterise(sheet)
        texture.save(out / f'{name}.png', optimize=True)
        corner = np.asarray(texture)[4, 4]
        print(name, cloth, 'corner', '#%02x%02x%02x' % tuple(corner), report)


main()
