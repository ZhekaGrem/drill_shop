"""Шаблони розгорток «Злипні» для дизайнерів: футболка (tshirt.glb) і худі (hoodie-3.glb).

  /opt/homebrew/bin/python3.14 scripts/zlypni/make-templates.py "<тека>"

Пише в теку для кожного виробу:
  <виріб>-шаблон.png  повний розмір, прозорий: контури деталей, підписи, сірим — те, чого не видно;
                      кладеться верхнім шаром і вимикається перед експортом;
  <виріб>-маска.png   повний розмір: біле — деталі виробу (для обтравки), чорне — поза виробом;
  <виріб>-карта.png   2048², кожна частина своїм кольором з підписом — для рендера «що де» (render-map.py).

Деталі визначено за справжньою геометрією моделей (export-mesh.cjs) і перевірено рендером
у Blender: кожну деталь пофарбовано своїм кольором, модель знято з чотирьох боків.
Координати рамок нижче — у просторі 2048², початок угорі ліворуч (як у glTF).
"""
import sys
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

sys.path.insert(0, str(Path(__file__).parent))
from uv_islands import load_mesh, islands, fill  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
MESH = ROOT / '3d/artists/prokliatyi/new-merch'
FONT = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'

# Повний розмір атласу: такий самий, як у готових розгорток «є. ***» (новий мерч/готові розгортки)
SIZE = {'tshirt': 7936, 'hoodie': 8192}
TITLE = {'tshirt': 'ФУТБОЛКА', 'hoodie': 'ХУДІ'}

# (назва, рамка 2048², видно на виробі, колір для карти)
PARTS = {
    'tshirt': [
        ('ПЕРЕД', (30, 1272, 634, 1955), True, (73, 196, 120)),
        ('СПИНА', (658, 1237, 1330, 1955), True, (232, 176, 64)),
        ('ВИВОРІТ СПИНИ\nвидно лише в горловині', (1367, 1236, 2039, 1955), False, (90, 90, 90)),
        ('ПРАВИЙ РУКАВ', (1478, 688, 2017, 897), True, (186, 104, 214)),
        ('ЛІВИЙ РУКАВ', (1478, 956, 2017, 1166), True, (226, 76, 80)),
        ('МАНЖЕТ ПРАВОГО', (1478, 906, 2017, 937), True, (120, 200, 60)),
        ('МАНЖЕТ ЛІВОГО', (1478, 1174, 2017, 1205), True, (190, 210, 70)),
        ('КОМІР', (302, 427, 948, 483), True, (170, 210, 110)),
        ('КОМІР ЗСЕРЕДИНИ', (302, 502, 948, 558), True, (150, 190, 100)),
        ('НИЗ ПЕРЕДУ', (42, 1971, 622, 2002), True, (160, 80, 220)),
        ('НИЗ СПИНИ', (671, 1971, 1317, 2002), True, (90, 190, 210)),
    ],
    'hoodie': [
        ('ПЕРЕД', (580, 556, 1026, 1027), True, (226, 84, 96)),
        ('СПИНА', (589, 34, 1038, 502), True, (80, 200, 130)),
        ('ПІДКЛАДКА СПИНИ\nне видно', (46, 35, 495, 503), False, (90, 90, 90)),
        ('ПІДКЛАДКА ПЕРЕДУ\nне видно', (61, 553, 507, 1024), False, (90, 90, 90)),
        ('ЛІВИЙ РУКАВ', (89, 1125, 515, 1516), True, (170, 80, 230)),
        ('ПРАВИЙ РУКАВ', (563, 1118, 989, 1510), True, (236, 112, 48)),
        ('ПІДКЛАДКА РУКАВА\nне видно', (70, 1565, 495, 1956), False, (90, 90, 90)),
        ('ПІДКЛАДКА РУКАВА\nне видно', (556, 1560, 981, 1951), False, (90, 90, 90)),
        ('КАПЮШОН\nліва половина', (1161, 55, 1361, 339), True, (130, 90, 230)),
        ('КАПЮШОН\nправа половина', (1425, 49, 1625, 333), True, (226, 200, 60)),
        ('КАПЮШОН ЗСЕРЕДИНИ\nвидно в отворі', (1170, 378, 1369, 661), True, (60, 160, 120)),
        ('КАПЮШОН ЗСЕРЕДИНИ\nвидно в отворі', (1432, 371, 1632, 655), True, (190, 60, 60)),
        ('КИШЕНЯ', (1594, 739, 1810, 907), True, (90, 220, 150)),
        ('НИЗ ПЕРЕДУ', (1136, 1109, 1456, 1162), True, (70, 80, 220)),
        ('НИЗ СПИНИ', (1537, 1119, 1822, 1167), True, (230, 120, 50)),
        ('МАНЖЕТ', (1435, 970, 1551, 1011), True, (220, 220, 60)),
        ('МАНЖЕТ', (1634, 972, 1762, 1017), True, (60, 220, 220)),
        # Задник кишені в передніх деталях: його закриває сама кишеня
        ('', (701, 852, 803, 1025), False, (90, 90, 90)),
        ('', (803, 852, 905, 1025), False, (90, 90, 90)),
        ('', (182, 848, 284, 1022), False, (90, 90, 90)),
        ('', (284, 848, 386, 1022), False, (90, 90, 90)),
    ],
}
# Усе інше — канти капюшона, шнурки, обшивка країв: видно, але дрібне
MINOR = ('', None, True, (150, 150, 150))


def part_of(kind, island):
    box = [round(v * 2048) for v in island['box']]
    for part in PARTS[kind]:
        if part[1] and all(abs(a - b) <= 4 for a, b in zip(box, part[1])):
            return part
    return MINOR


def groups(kind):
    """{part: [triangles]} — зовнішня й внутрішня поверхні однієї деталі лежать в одній рамці."""
    mesh = load_mesh(MESH / f'{kind}-mesh.json')
    out = {}
    for island in islands(mesh):
        out.setdefault(part_of(kind, island), []).extend(island['tris'])
    return mesh, out


def font(px):
    return ImageFont.truetype(FONT, px)


def label(draw, part, scale, colour, size_px):
    name, box = part[0], part[1]
    if not name or not box:
        return
    cx, cy = (box[0] + box[2]) / 2 * scale, (box[1] + box[3]) / 2 * scale
    # Шрифт уміщається в ширину деталі: вузькі смуги (манжети, низ) отримують дрібніший
    px = size_px
    while px > 12 and draw.multiline_textbbox((0, 0), name, font=font(px), align='center')[2] > (box[2] - box[0]) * scale * .9:
        px = int(px * .85)
    draw.multiline_text((cx, cy), name, fill=colour, font=font(px), anchor='mm', align='center')


def template(kind):
    size = SIZE[kind]
    scale = size / 2048
    mesh, parts = groups(kind)
    visible = Image.new('L', (size, size), 0)
    hidden = Image.new('L', (size, size), 0)
    for part, tris in parts.items():
        fill(mesh, tris, size, hidden if not part[2] else visible)
    # Контур = розширена маска мінус сама маска: лінія лягає назовні й не з'їдає деталь
    every = ImageChops.lighter(visible, hidden)
    edges = ImageChops.subtract(every.filter(ImageFilter.MaxFilter(9)), every)
    out = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    out.paste((128, 128, 128, 150), (0, 0), hidden)
    out.paste((0, 208, 255, 255), (0, 0), edges)
    draw = ImageDraw.Draw(out)
    for part in parts:
        label(draw, part, scale, (0, 208, 255, 255) if part[2] else (235, 235, 235, 255), round(30 * scale))
    draw.text((40 * scale, 6 * scale), f'{TITLE[kind]} · {size}×{size} px · шаблон «Злипні» — шар вимкнути перед експортом',
              fill=(0, 208, 255, 255), font=font(round(18 * scale)))
    return out, every


def colour_map(kind):
    mesh, parts = groups(kind)
    out = Image.new('RGB', (2048, 2048), (24, 24, 24))
    for part, tris in parts.items():
        fill(mesh, tris, 2048, out, part[3])
    draw = ImageDraw.Draw(out)
    for part in parts:
        label(draw, part, 1, (20, 20, 20), 34)
    return out


BLENDER = '/Applications/Blender.app/Contents/MacOS/Blender'
# Поворот +90° показує правий бік того, хто носить (перевірено за рукавами на рендері)
SIDES = [('front', 'спереду'), ('left', 'правий бік'), ('back', 'ззаду'), ('right', 'лівий бік')]


def render_sheet(kind, colour_map, sheet):
    """Карта деталей на 3D-моделі з чотирьох боків — один аркуш «що де на виробі»."""
    import subprocess
    import tempfile
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run([BLENDER, '--disable-autoexec', '-b', '-P', str(ROOT / 'scripts/zlypni/render-map.py'), '--',
                        str(ROOT), kind, str(colour_map), tmp], check=True, capture_output=True)
        out = Image.new('RGB', (1600, 1660), (255, 255, 255))
        draw = ImageDraw.Draw(out)
        for k, (side, title) in enumerate(SIDES):
            view = Image.open(Path(tmp) / f'{kind}-{side}.png').convert('RGBA')
            x, y = (k % 2) * 800, (k // 2) * 830
            out.paste(view, (x, y + 30), view)
            draw.text((x + 400, y + 18), title, fill=(40, 40, 40), font=font(26), anchor='mm')
        out.save(sheet, quality=88)


if __name__ == '__main__':
    out = Path(sys.argv[1])
    out.mkdir(parents=True, exist_ok=True)
    names = {'tshirt': 'футболка', 'hoodie': 'худі'}
    for kind in ('tshirt', 'hoodie'):
        tpl, mask = template(kind)
        tpl.save(out / f'{names[kind]}-шаблон.png', optimize=True)
        mask.save(out / f'{names[kind]}-маска.png', optimize=True)
        colour_map(kind).save(out / f'{names[kind]}-карта.png')
        render_sheet(kind, out / f'{names[kind]}-карта.png', out / f'{names[kind]}-що-де-на-3D.jpg')
        print(f'{kind}: {SIZE[kind]}² шаблон, маска, карта, аркуш 3D', flush=True)
