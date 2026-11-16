"""Контактні аркуші «Злипні»: кожен товар колекції спереду й ззаду, з номером і назвою.

  /opt/homebrew/bin/python3.14 scripts/zlypni/contact-sheet.py

Пише 3d/artists/zlypni/<колекція>-превʼю.jpg — сто дизайнів на одному аркуші, щоб перед
завантаженням побачити, що кожна розгортка лягла на модель (render-posters.py)."""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
LOCAL = ROOT / '3d/artists/zlypni'
FONT = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 15)
TILE, COLUMNS, CAPTION = 170, 5, 26  # пара кадрів 2×170, п'ять пар у ряд


def sheet(collection):
    products = collection['products']
    rows = -(-len(products) // COLUMNS)
    out = Image.new('RGB', (COLUMNS * TILE * 2, rows * (TILE + CAPTION)), (255, 255, 255))
    draw = ImageDraw.Draw(out)
    for k, product in enumerate(products):
        x, y = (k % COLUMNS) * TILE * 2, (k // COLUMNS) * (TILE + CAPTION)
        for i, side in enumerate(('front', 'back')):
            frame = Image.open(LOCAL / 'renders' / f"{product['slug']}-{side}.png").convert('RGBA')
            frame.thumbnail((TILE, TILE))
            out.paste(frame, (x + i * TILE, y), frame)
        draw.text((x + TILE, y + TILE + 4), f"{product['number']:03} · {product['name']}"[:40],
                  fill=(30, 30, 30), font=FONT, anchor='mt')
    return out


if __name__ == '__main__':
    catalog = json.loads((ROOT / 'scripts/zlypni/catalog.json').read_text())
    for collection in catalog['collections']:
        if collection['products']:
            target = LOCAL / f"{collection['title'].lower()}-превʼю.jpg"
            sheet(collection).save(target, quality=86)
            print(f"{target.relative_to(ROOT)}: {len(collection['products'])} товарів")
