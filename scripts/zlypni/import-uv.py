"""Розгортки дизайнерів «Злипні» → вебтекстури сайту і каталог товарів.

  /opt/homebrew/bin/python3.14 scripts/zlypni/import-uv.py "<тека з розгортками>" [--only=futboliarchyky]

Вхід — один із двох виглядів:
  • як у «шаблони розгорток/ПРОЧИТАЙ.txt»:
      <тека>/футболярчики/001-Назва.png … 100-Назва.png   7936² на шаблоні футболки
      <тека>/бобаночки/001-Назва.png   … 100-Назва.png   8192² на шаблоні худі
    Номер — порядок на сайті, текст після номера — назва товару;
  • комплект із manifest.json (Злипні/uv-2026-11-16): записи { id: T001|H001, kind: tshirt|hoodie,
    name, variant, png }. Номер — цифри id, назва — name.
  Однакові назви в колекції отримують номер (варіанта, якщо він є): «Липкий знак №3».

Для кожного файлу:
  • перевіряє, що це квадрат потрібного розміру без прозорості (інакше зупиняє імпорт) і
    попереджає, коли багато малюнка поза деталями: так виглядає розгортка з чужої викрійки, але й
    свідома заливка всього аркуша — остаточно вирішують рендери (render-posters.py);
  • пише public/3d/textures/zlypni/<колекція>/<NNN>.webp — 4096², з хешем версії в URL;
  • оновлює scripts/zlypni/catalog.json: товари колекції (slug, номер, назва, texture3dUrl).
Нічого не пише в базу: це робить create-collection.cjs.
"""
import hashlib
import json
import re
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageStat

sys.path.insert(0, str(Path(__file__).parent))
from uv_islands import fill, islands, load_mesh  # noqa: E402

Image.MAX_IMAGE_PIXELS = None  # 8192² — свідомо, а не бомба
ROOT = Path(__file__).resolve().parents[2]
CATALOG = Path(__file__).parent / 'catalog.json'
MESH = ROOT / '3d/artists/prokliatyi/new-merch'
SIZE = {'tshirt': 7936, 'hoodie': 8192}
WEB = 4096
NAME = re.compile(r'^[TtHh]?(\d{1,3})[-_ .]+(.+)\.(png|jpe?g|webp)$')
# Частка «фарби» поза деталями, після якої варто глянути на рендер: чи не чужа викрійка
OUTSIDE_LIMIT = 0.2

_masks = {}


def detail_mask(garment):
    """Біле — усі деталі виробу, 2048²."""
    if garment not in _masks:
        mesh = load_mesh(MESH / f'{garment}-mesh.json')
        _masks[garment] = fill(mesh, [t for i in islands(mesh) for t in i['tris']], 2048)
    return _masks[garment]


def pixels(mask):
    return ImageStat.Stat(mask).sum[0] / 255


def check(image, garment):
    """Помилки (зупиняють імпорт) і попередження для однієї розгортки."""
    errors, warnings = [], []
    if image.width != image.height:
        return [f'не квадрат: {image.width}×{image.height}'], warnings
    if image.width != SIZE[garment]:
        (warnings if image.width >= WEB else errors).append(
            f'розмір {image.width}², а шаблон {SIZE[garment]}²')
    if image.mode in ('RGBA', 'LA', 'PA') and image.getchannel('A').getextrema()[0] < 255:
        errors.append('є прозорість — фон треба залити кольором тканини')
    small = image.convert('RGB').resize((2048, 2048), Image.Resampling.BOX)
    inside = detail_mask(garment)
    outside = ImageChops.invert(inside)
    background = tuple(round(v) for v in ImageStat.Stat(small, mask=outside).median)
    # «Фарба» — усе, що помітно відрізняється від тла поза деталями
    ink = ImageChops.difference(small, Image.new('RGB', small.size, background)).convert('L')
    ink = ink.point(lambda v: 255 if v > 24 else 0)
    ink_in = pixels(ImageChops.multiply(ink, inside))
    ink_out = pixels(ImageChops.multiply(ink, outside))
    if ink_out > OUTSIDE_LIMIT * max(1, ink_in + ink_out) and ink_out > 0.01 * 2048 * 2048:
        warnings.append(f'{ink_out / (ink_in + ink_out):.0%} малюнка поза деталями — перевірте рендер')
    if ink_in < 0.001 * pixels(inside):
        warnings.append('деталі майже порожні')
    return errors, warnings


def web_texture(image, out_dir, number):
    """4096² WebP; URL несе хеш вмісту, тож браузер не тримає стару версію."""
    out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / f'{number:03}.webp'
    image.convert('RGB').resize((WEB, WEB), Image.Resampling.LANCZOS).save(out, 'WEBP', quality=90, method=6)
    digest = hashlib.sha256(out.read_bytes()).hexdigest()[:12]
    return out, digest


def product_names(entries):
    """Однакові назви в колекції отримують номер: у кошику й замовленні їх треба розрізнити."""
    seen = {}
    for e in entries:
        seen[e['name']] = seen.get(e['name'], 0) + 1
    named = []
    for e in entries:
        variant = e.pop('variant', None) or e['number']
        named.append(dict(e, name=f"{e['name']} №{variant}" if seen[e['name']] > 1 else e['name']))
    return named


def sources(source, collection):
    """[(файл, номер, назва, варіант)] колекції — з manifest.json або з теки колекції."""
    manifest = source / 'manifest.json'
    if manifest.exists():
        rows = [r for r in json.loads(manifest.read_text()) if r['kind'] == collection['garment']]
        return [(source / r['png'], int(re.sub(r'\D', '', r['id'])), r['name'], r.get('variant')) for r in rows]
    folder = source / collection['folder']
    files = sorted(p for p in folder.iterdir() if NAME.match(p.name)) if folder.is_dir() else []
    return [(p, int(NAME.match(p.name)[1]), NAME.match(p.name)[2].replace('_', ' ').strip(), None) for p in files]


def import_collection(source, collection):
    found = sorted(sources(source, collection), key=lambda row: row[1])
    numbers = [row[1] for row in found]
    duplicates = sorted({n for n in numbers if numbers.count(n) > 1})
    if duplicates:
        raise SystemExit(f"{collection['title']}: повторені номери {duplicates}")
    key = collection['slug'].removeprefix('zlypni-')
    entries, failed = [], []
    for path, number, name, variant in found:
        image = Image.open(path)
        errors, warnings = check(image, collection['garment'])
        mark = 'ПОМИЛКА' if errors else ('увага' if warnings else 'ok')
        print(f"  {path.name}: {mark} {'; '.join(errors + warnings)}".rstrip(), flush=True)
        if errors:
            failed.append(path.name)
            continue
        out, digest = web_texture(image, ROOT / 'public/3d/textures/zlypni' / key, number)
        entries.append({
            'number': number,
            'slug': f"{collection['productPrefix']}-{number:03}",
            'name': name,
            'variant': variant,
            'texture3dUrl': f'/{out.relative_to(ROOT / "public")}?v={digest}',
            'source': str(path.relative_to(source)),
        })
    return product_names(entries), failed


def main():
    source = Path(sys.argv[1])
    only = next((a.split('=', 1)[1] for a in sys.argv[2:] if a.startswith('--only=')), None)
    catalog = json.loads(CATALOG.read_text())
    stop = []
    for collection in catalog['collections']:
        if only and collection['slug'] != f'zlypni-{only}':
            continue
        print(f"{collection['title']}:", flush=True)
        products, failed = import_collection(source, collection)
        stop += failed
        if not failed:
            collection['products'] = products
        print(f"  → {len(products)} товарів" + (f', {len(failed)} з помилками — каталог не змінено' if failed else ''))
    CATALOG.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n')
    if stop:
        raise SystemExit(f'Виправте {len(stop)} розгорток і запустіть знову')


if __name__ == '__main__':
    main()
